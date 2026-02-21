import type {
  AgentConfig,
  BaseEvent,
  RunAgentInput,
  RunFinishedEvent,
  RunStartedEvent,
  StateSnapshotEvent,
  TextMessageChunkEvent,
  ToolCallArgsEvent,
  ToolCallEndEvent,
  ToolCallResultEvent,
  ToolCallStartEvent,
} from "@ag-ui/client";
import { AbstractAgent, EventType } from "@ag-ui/client";
import type { StorageThreadType } from "@mastra/core/memory";
import type { Agent as LocalMastraAgent } from "@mastra/core/agent";
import { RequestContext } from "@mastra/core/request-context";
import { randomUUID } from "@ag-ui/client";
import type { MastraClient } from "@mastra/client-js";
import {
  convertAGUIMessagesToMastra,
  GetLocalAgentsOptions,
  getLocalAgents,
  getRemoteAgents,
  GetRemoteAgentsOptions,
  GetLocalAgentOptions,
  getLocalAgent,
  GetNetworkOptions,
  getNetwork,
} from "./utils";

type RemoteMastraAgent = ReturnType<MastraClient["getAgent"]>;

export interface MastraAgentConfig extends AgentConfig {
  agent: LocalMastraAgent | RemoteMastraAgent;
  resourceId: string;
  requestContext?: RequestContext;
}

interface MastraAgentStreamOptions {
  onTextPart?: (text: string) => void;
  onFinishMessagePart?: () => void;
  onToolCallPart?: (streamPart: {
    toolCallId: string;
    toolName: string;
    args: any;
  }) => void;
  onToolResultPart?: (streamPart: { toolCallId: string; result: any }) => void;
  onError?: (error: Error) => void;
  onRunFinished?: () => Promise<void>;
}

export class MastraAgent extends AbstractAgent {
  agent: LocalMastraAgent | RemoteMastraAgent;
  resourceId: string;
  requestContext?: RequestContext;

  constructor(private config: MastraAgentConfig) {
    const { agent, resourceId, requestContext, ...rest } = config;
    super(rest);
    this.agent = agent;
    this.resourceId = resourceId;
    this.requestContext = requestContext ?? new RequestContext();
  }

  public clone() {
    return new MastraAgent(this.config);
  }

  async *run(input: RunAgentInput): AsyncIterable<BaseEvent> {
    let messageId = randomUUID();

    // Event channel for bridging callback-based streaming to async iterable
    const pending: BaseEvent[] = [];
    let waitResolve: (() => void) | null = null;
    let streamDone = false;
    let streamError: Error | null = null;

    const push = (event: BaseEvent) => {
      if (streamDone) return;
      pending.push(event);
      if (waitResolve) { waitResolve(); waitResolve = null; }
    };
    const complete = () => {
      if (streamDone) return;
      streamDone = true;
      if (waitResolve) { waitResolve(); waitResolve = null; }
    };
    const fail = (err: Error) => {
      if (streamDone) return;
      streamError = err;
      streamDone = true;
      if (waitResolve) { waitResolve(); waitResolve = null; }
    };

    const runPromise = (async () => {
      try {
        const runStartedEvent: RunStartedEvent = {
          type: EventType.RUN_STARTED,
          threadId: input.threadId,
          runId: input.runId,
        };

        push(runStartedEvent);

        // Handle local agent memory management (from Mastra implementation)
        if (this.isLocalMastraAgent(this.agent)) {
          const memory = await this.agent.getMemory({
            requestContext: this.requestContext,
          });

          if (
            memory &&
            input.state &&
            Object.keys(input.state || {}).length > 0
          ) {
            let thread: StorageThreadType | null = await memory.getThreadById({
              threadId: input.threadId,
            });

            if (!thread) {
              thread = {
                id: input.threadId,
                title: "",
                metadata: {},
                resourceId: this.resourceId ?? input.threadId,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
            }

            const existingMemory = JSON.parse(
              (thread.metadata?.workingMemory as string) ?? "{}",
            );
            const { messages, ...rest } = input.state;
            const workingMemory = JSON.stringify({
              ...existingMemory,
              ...rest,
            });

            // Update thread metadata with new working memory
            await memory.saveThread({
              thread: {
                ...thread,
                metadata: {
                  ...thread.metadata,
                  workingMemory,
                },
              },
            });
          }
        }

        await this.streamMastraAgent(input, {
          onTextPart: (text) => {
            const event: TextMessageChunkEvent = {
              type: EventType.TEXT_MESSAGE_CHUNK,
              role: "assistant",
              messageId,
              delta: text,
            };
            push(event);
          },
          onToolCallPart: (streamPart) => {
            const startEvent: ToolCallStartEvent = {
              type: EventType.TOOL_CALL_START,
              parentMessageId: messageId,
              toolCallId: streamPart.toolCallId,
              toolCallName: streamPart.toolName,
            };
            push(startEvent);

            const argsEvent: ToolCallArgsEvent = {
              type: EventType.TOOL_CALL_ARGS,
              toolCallId: streamPart.toolCallId,
              delta: JSON.stringify(streamPart.args),
            };
            push(argsEvent);

            const endEvent: ToolCallEndEvent = {
              type: EventType.TOOL_CALL_END,
              toolCallId: streamPart.toolCallId,
            };
            push(endEvent);
          },
          onToolResultPart(streamPart) {
            const toolCallResultEvent: ToolCallResultEvent = {
              type: EventType.TOOL_CALL_RESULT,
              toolCallId: streamPart.toolCallId,
              content: JSON.stringify(streamPart.result),
              messageId: randomUUID(),
              role: "tool",
            };

            push(toolCallResultEvent);
          },
          onFinishMessagePart: async () => {
            messageId = randomUUID();
          },
          onError: (error) => {
            console.error("error", error);
            fail(error);
          },
          onRunFinished: async () => {
            if (this.isLocalMastraAgent(this.agent)) {
              try {
                const memory = await this.agent.getMemory({
                  requestContext: this.requestContext,
                });
                if (memory) {
                  const workingMemory = await memory.getWorkingMemory({
                    resourceId: this.resourceId,
                    threadId: input.threadId,
                    memoryConfig: {
                      workingMemory: {
                        enabled: true,
                      },
                    },
                  });

                  if (typeof workingMemory === "string") {
                    const snapshot = JSON.parse(workingMemory);

                    if (snapshot && !("$schema" in snapshot)) {
                      const stateSnapshotEvent: StateSnapshotEvent = {
                        type: EventType.STATE_SNAPSHOT,
                        snapshot,
                      };

                      push(stateSnapshotEvent);
                    }
                  }
                }
              } catch (error) {
                console.error("Error sending state snapshot", error);
              }
            }

            // Emit run finished event
            push({
              type: EventType.RUN_FINISHED,
              threadId: input.threadId,
              runId: input.runId,
            } as RunFinishedEvent);

            // Signal completion
            complete();
          },
        });
      } catch (error) {
        console.error("Stream error:", error);
        fail(error as Error);
      } finally {
        complete();
      }
    })();

    // Drain events as they arrive from the background stream
    try {
      while (true) {
        while (pending.length > 0) {
          yield pending.shift()!;
        }
        if (streamDone) {
          if (streamError) throw streamError;
          return;
        }
        await new Promise<void>((r) => { waitResolve = r; });
      }
    } finally {
      await runPromise.catch(() => {});
    }
  }

  isLocalMastraAgent(
    agent: LocalMastraAgent | RemoteMastraAgent,
  ): agent is LocalMastraAgent {
    return "getMemory" in agent;
  }

  /**
   * Streams in process or remote mastra agent.
   * @param input - The input for the mastra agent.
   * @param options - The options for the mastra agent.
   * @returns The stream of the mastra agent.
   */
  private async streamMastraAgent(
    { threadId, runId, messages, tools, context: inputContext }: RunAgentInput,
    {
      onTextPart,
      onFinishMessagePart,
      onToolCallPart,
      onToolResultPart,
      onError,
      onRunFinished,
    }: MastraAgentStreamOptions,
  ): Promise<void> {
    const clientTools = tools.reduce(
      (acc, tool) => {
        acc[tool.name as string] = {
          id: tool.name,
          description: tool.description,
          inputSchema: tool.parameters,
        };
        return acc;
      },
      {} as Record<string, any>,
    );
    const resourceId = this.resourceId ?? threadId;

    const convertedMessages = convertAGUIMessagesToMastra(messages);
    this.requestContext?.set("ag-ui", { context: inputContext });
    const requestContext = this.requestContext;

    if (this.isLocalMastraAgent(this.agent)) {
      // Local agent - use the agent's stream method directly
      try {
        const response = await this.agent.stream(convertedMessages, {
          memory: {
            thread: threadId,
            resource: resourceId,
          },
          runId,
          clientTools,
          requestContext,
        });

        // For local agents, the response should already be a stream
        // Process it using the agent's built-in streaming mechanism
        if (response && typeof response === "object") {
          for await (const chunk of response.fullStream) {
            switch (chunk.type) {
              case "text-delta": {
                onTextPart?.(chunk.payload.text);
                break;
              }
              case "tool-call": {
                onToolCallPart?.({
                  toolCallId: chunk.payload.toolCallId,
                  toolName: chunk.payload.toolName,
                  args: chunk.payload.args,
                });
                break;
              }
              case "tool-result": {
                onToolResultPart?.({
                  toolCallId: chunk.payload.toolCallId,
                  result: chunk.payload.result,
                });
                break;
              }

              case "error": {
                onError?.(new Error(chunk.payload.error as string));
                break;
              }

              case "finish": {
                onFinishMessagePart?.();
                break;
              }
            }
          }

          await onRunFinished?.();
        } else {
          throw new Error("Invalid response from local agent");
        }
      } catch (error) {
        onError?.(error as Error);
      }
    } else {
      // Remote agent - use the remote agent's stream method
      try {
        const response = await this.agent.stream(convertedMessages, {
          memory: {
            thread: threadId,
            resource: resourceId,
          },
          runId,
          clientTools,
          requestContext,
        });

        // Remote agents should have a processDataStream method
        if (response && typeof response.processDataStream === "function") {
          await response.processDataStream({
            onChunk: async (chunk) => {
              switch (chunk.type) {
                case "text-delta": {
                  onTextPart?.(chunk.payload.text);
                  break;
                }
                case "tool-call": {
                  onToolCallPart?.({
                    toolCallId: chunk.payload.toolCallId,
                    toolName: chunk.payload.toolName,
                    args: chunk.payload.args,
                  });
                  break;
                }
                case "tool-result": {
                  onToolResultPart?.({
                    toolCallId: chunk.payload.toolCallId,
                    result: chunk.payload.result,
                  });
                  break;
                }

                case "finish": {
                  onFinishMessagePart?.();
                  break;
                }
              }
            },
          });
          await onRunFinished?.();
        } else {
          throw new Error("Invalid response from remote agent");
        }
      } catch (error) {
        onError?.(error as Error);
      }
    }
  }

  static async getRemoteAgents(
    options: GetRemoteAgentsOptions,
  ): Promise<Record<string, AbstractAgent>> {
    return getRemoteAgents(options);
  }

  static getLocalAgents(
    options: GetLocalAgentsOptions,
  ): Record<string, AbstractAgent> {
    return getLocalAgents(options);
  }

  static getLocalAgent(options: GetLocalAgentOptions) {
    return getLocalAgent(options);
  }

  static getNetwork(options: GetNetworkOptions) {
    return getNetwork(options);
  }
}
