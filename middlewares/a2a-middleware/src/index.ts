import {
  AbstractAgent,
  AgentConfig,
  BaseEvent,
  EventType,
  RunAgentInput,
  ToolCallResultEvent,
  ToolCallArgsEvent,
  Message,
  ToolCallStartEvent,
  transformChunks,
  RunFinishedEvent,
  TextMessageStartEvent,
  TextMessageEndEvent,
} from "@ag-ui/client";

import { A2AClient } from "@a2a-js/sdk/client";
import {
  AgentCard,
  SendMessageResponse,
  SendMessageSuccessResponse,
} from "@a2a-js/sdk";
import { createSystemPrompt, sendMessageToA2AAgentTool } from "./utils";
import { randomUUID } from "@ag-ui/client";

export interface A2AAgentConfig extends AgentConfig {
  agentUrls: string[];
  instructions?: string;
  orchestrationAgent: AbstractAgent;
}

export class A2AMiddlewareAgent extends AbstractAgent {
  agentClients: A2AClient[];
  agentCards: Promise<AgentCard[]>;
  instructions?: string;
  orchestrationAgent: AbstractAgent;

  constructor(config: A2AAgentConfig) {
    super(config);
    this.instructions = config.instructions;
    this.agentClients = config.agentUrls.map((url) => new A2AClient(url));
    this.agentCards = Promise.all(
      this.agentClients.map((client) => client.getAgentCard()),
    );
    this.orchestrationAgent = config.orchestrationAgent;
  }

  private *finishTextMessages(
    pendingTextMessages: Set<string>,
  ): Iterable<BaseEvent> {
    for (const messageId of pendingTextMessages) {
      yield {
        type: EventType.TEXT_MESSAGE_END,
        messageId,
      } as TextMessageEndEvent;
    }
    pendingTextMessages.clear();
  }

  async *run(input: RunAgentInput): AsyncIterable<BaseEvent> {
    const agentCards = await this.agentCards;
    const newSystemPrompt = createSystemPrompt(
      agentCards,
      this.instructions,
    );

    const messages = input.messages;
    if (messages.length && messages[0].role === "system") {
      // remove the first message if it is a system message
      messages.shift();
    }

    messages.unshift({
      role: "system",
      content: newSystemPrompt,
      id: randomUUID(),
    });

    input.tools = [...(input.tools || []), sendMessageToA2AAgentTool];

    // Run loop: orchestrate agent runs, resolve A2A calls, repeat if needed
    let shouldContinue = true;
    while (shouldContinue) {
      shouldContinue = false;

      const pendingA2ACalls = new Set<string>();
      const pendingTextMessages = new Set<string>();
      const toolCallArgsMap = new Map<string, string>();

      const source = this.orchestrationAgent.run(input);
      const chunked = transformChunks(this.debug)(source);

      for await (const event of chunked) {
        // Track text message state
        if (event.type === EventType.TEXT_MESSAGE_START) {
          pendingTextMessages.add(
            (event as TextMessageStartEvent).messageId,
          );
        } else if (event.type === EventType.TEXT_MESSAGE_END) {
          pendingTextMessages.delete(
            (event as TextMessageEndEvent).messageId,
          );
        }

        // Handle tool call start events for send_message_to_a2a_agent
        if (
          event.type === EventType.TOOL_CALL_START &&
          "toolCallName" in event &&
          "toolCallId" in event &&
          (event as ToolCallStartEvent).toolCallName.startsWith(
            "send_message_to_a2a_agent",
          )
        ) {
          const toolCallId = (event as ToolCallStartEvent).toolCallId;
          pendingA2ACalls.add(toolCallId);
          toolCallArgsMap.set(toolCallId, "");
          yield event;
          continue;
        }

        // Accumulate tool call args for pending A2A calls
        if (
          event.type === EventType.TOOL_CALL_ARGS &&
          "toolCallId" in event
        ) {
          const tcEvent = event as ToolCallArgsEvent;
          if (pendingA2ACalls.has(tcEvent.toolCallId)) {
            const current = toolCallArgsMap.get(tcEvent.toolCallId) || "";
            toolCallArgsMap.set(
              tcEvent.toolCallId,
              current + (tcEvent.delta || ""),
            );
          }
          yield event;
          continue;
        }

        // Handle tool call result events for send_message_to_a2a_agent
        if (
          event.type === EventType.TOOL_CALL_RESULT &&
          "toolCallId" in event &&
          pendingA2ACalls.has((event as ToolCallResultEvent).toolCallId)
        ) {
          pendingA2ACalls.delete(
            (event as ToolCallResultEvent).toolCallId,
          );
          yield event;
          continue;
        }

        // Handle run completion events
        if (event.type === EventType.RUN_FINISHED) {
          yield* this.finishTextMessages(pendingTextMessages);

          if (pendingA2ACalls.size > 0) {
            // Array to collect all new tool result messages
            const newToolMessages: Message[] = [];

            const callProms = [...pendingA2ACalls].map((toolCallId) => {
              const toolArgs = toolCallArgsMap.get(toolCallId);
              if (!toolArgs) {
                throw new Error(
                  `Tool arguments not found for tool call id ${toolCallId}`,
                );
              }
              const parsed = JSON.parse(toolArgs);
              const agentName = parsed.agentName;
              const task = parsed.task;

              if (this.debug) {
                console.debug("sending message to a2a agent", {
                  agentName,
                  message: task,
                });
              }
              return this.sendMessageToA2AAgent(agentName, task)
                .then((a2aResponse) => {
                  const newMessage: Message = {
                    id: randomUUID(),
                    role: "tool",
                    toolCallId: toolCallId,
                    content: a2aResponse,
                  };
                  if (this.debug) {
                    console.debug("newMessage From a2a agent", newMessage);
                  }
                  this.addMessage(newMessage);
                  this.orchestrationAgent.addMessage(newMessage);

                  // Collect the message so we can add it to input.messages
                  newToolMessages.push(newMessage);

                  return { toolCallId, newMessage, a2aResponse };
                })
                .finally(() => {
                  pendingA2ACalls.delete(toolCallId);
                });
            });

            const results = await Promise.all(callProms);

            // Yield tool call results
            for (const { toolCallId, newMessage, a2aResponse } of results) {
              yield {
                type: EventType.TOOL_CALL_RESULT,
                toolCallId,
                messageId: newMessage.id,
                content: a2aResponse,
              } as ToolCallResultEvent;

              pendingA2ACalls.delete(toolCallId);
            }

            yield* this.finishTextMessages(pendingTextMessages);
            yield {
              type: EventType.RUN_FINISHED,
              threadId: input.threadId,
              runId: input.runId,
            } as RunFinishedEvent;

            // Add all tool result messages to input.messages BEFORE triggering new run
            // This ensures the orchestrator sees the tool results in its context
            for (const msg of newToolMessages) {
              input.messages.push(msg);
            }

            // Continue for next orchestration agent run
            shouldContinue = true;
          } else {
            yield event;
          }
          continue;
        }

        // Handle run error events - emit immediately and exit
        if (event.type === EventType.RUN_ERROR) {
          yield event;
          return;
        }

        // Proxy all other events
        yield event;
      }
    }
  }

  private async sendMessageToA2AAgent(
    agentName: string,
    args: string,
  ): Promise<string> {
    const agentCards = await this.agentCards;

    const agents = agentCards.map((card, index) => {
      return { client: this.agentClients[index], card };
    });

    const agent = agents.find((agent) => agent.card.name === agentName);

    if (!agent) {
      throw new Error(`Agent "${agentName}" not found`);
    }

    const { client } = agent;

    const sendResponse: SendMessageResponse = await client.sendMessage({
      message: {
        kind: "message",
        messageId: Date.now().toString(),
        role: "agent",
        parts: [{ text: args, kind: "text" }],
      },
    });

    if ("error" in sendResponse) {
      throw new Error(
        `Error sending message to agent "${agentName}": ${sendResponse.error.message}`,
      );
    }

    const result = (sendResponse as SendMessageSuccessResponse).result;
    let responseContent = "";

    if (
      result.kind === "message" &&
      result.parts.length > 0 &&
      result.parts[0].kind === "text"
    ) {
      responseContent = result.parts[0].text;
    } else {
      responseContent = JSON.stringify(result);
    }

    return responseContent;
  }
}
