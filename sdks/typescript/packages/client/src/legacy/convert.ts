import {
  BaseEvent,
  EventType,
  TextMessageStartEvent,
  TextMessageContentEvent,
  TextMessageEndEvent,
  ToolCallStartEvent,
  ToolCallArgsEvent,
  ToolCallEndEvent,
  ToolCallResultEvent,
  CustomEvent,
  StateSnapshotEvent,
  StepStartedEvent,
  Message,
  StateDeltaEvent,
  MessagesSnapshotEvent,
  ToolCall,
  RunErrorEvent,
} from "@ag-ui/core";
import {
  LegacyTextMessageStart,
  LegacyTextMessageContent,
  LegacyTextMessageEnd,
  LegacyActionExecutionStart,
  LegacyActionExecutionArgs,
  LegacyActionExecutionEnd,
  LegacyRuntimeEventTypes,
  LegacyRuntimeProtocolEvent,
  LegacyMetaEvent,
  LegacyAgentStateMessage,
  LegacyMessage,
  LegacyTextMessage,
  LegacyActionExecutionMessage,
  LegacyResultMessage,
  LegacyActionExecutionResult,
  LegacyRunError
} from "./types";
import untruncateJson from "untruncate-json";
import * as fastJsonPatch from "fast-json-patch";

const flattenMessageContentToText = (content: Message["content"]) => {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return undefined;
  }

  const textParts = content
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .filter((text) => text.length > 0);

  if (textParts.length === 0) {
    return undefined;
  }

  return textParts.join("\n");
};

interface PredictStateValue {
  state_key: string;
  tool: string;
  tool_argument: string;
}

export const convertToLegacyEvents =
  (threadId: string, runId: string, agentName: string) =>
  async function* (events: AsyncIterable<BaseEvent>): AsyncIterable<LegacyRuntimeProtocolEvent> {
    let currentState: any = {};
    let running = true;
    let active = true;
    let nodeName = "";
    let syncedMessages: Message[] | null = null;
    let predictState: PredictStateValue[] | null = null;
    let currentToolCalls: ToolCall[] = [];
    let toolCallNames: Record<string, string> = {};

    const updateCurrentState = (newState: any) => {
      // the legacy protocol will only support object state
      if (typeof newState === "object" && newState !== null) {
        if ("messages" in newState) {
          delete newState.messages;
        }
        currentState = newState;
      }
    };

    for await (const event of events) {
        switch (event.type) {
          case EventType.TEXT_MESSAGE_START: {
            const startEvent = event as TextMessageStartEvent;
            yield {
                type: LegacyRuntimeEventTypes.def.entries.TextMessageStart,
                messageId: startEvent.messageId,
                role: startEvent.role,
              } as LegacyTextMessageStart;
            break;
          }
          case EventType.TEXT_MESSAGE_CONTENT: {
            const contentEvent = event as TextMessageContentEvent;
            yield {
                type: LegacyRuntimeEventTypes.def.entries.TextMessageContent,
                messageId: contentEvent.messageId,
                content: contentEvent.delta,
              } as LegacyTextMessageContent;
            break;
          }
          case EventType.TEXT_MESSAGE_END: {
            const endEvent = event as TextMessageEndEvent;
            yield {
                type: LegacyRuntimeEventTypes.def.entries.TextMessageEnd,
                messageId: endEvent.messageId,
              } as LegacyTextMessageEnd;
            break;
          }
          case EventType.TOOL_CALL_START: {
            const startEvent = event as ToolCallStartEvent;

            currentToolCalls.push({
              id: startEvent.toolCallId,
              type: "function",
              function: {
                name: startEvent.toolCallName,
                arguments: "",
              },
            });

            active = true;
            toolCallNames[startEvent.toolCallId] = startEvent.toolCallName;

            yield {
                type: LegacyRuntimeEventTypes.def.entries.ActionExecutionStart,
                actionExecutionId: startEvent.toolCallId,
                actionName: startEvent.toolCallName,
                parentMessageId: startEvent.parentMessageId,
              } as LegacyActionExecutionStart;
            break;
          }
          case EventType.TOOL_CALL_ARGS: {
            const argsEvent = event as ToolCallArgsEvent;

            // Find the tool call by ID instead of using the last one
            const currentToolCall = currentToolCalls.find((tc) => tc.id === argsEvent.toolCallId);
            if (!currentToolCall) {
              console.warn(`TOOL_CALL_ARGS: No tool call found with ID '${argsEvent.toolCallId}'`);
              break;
            }

            currentToolCall.function.arguments += argsEvent.delta;
            let didUpdateState = false;

            if (predictState) {
              let currentPredictState = predictState.find(
                (s) => s.tool == currentToolCall.function.name,
              );

              if (currentPredictState) {
                try {
                  const currentArgs = JSON.parse(
                    untruncateJson(currentToolCall.function.arguments),
                  );
                  if (
                    currentPredictState.tool_argument &&
                    currentPredictState.tool_argument in currentArgs
                  ) {
                    updateCurrentState({
                      ...currentState,
                      [currentPredictState.state_key]:
                        currentArgs[currentPredictState.tool_argument],
                    });
                    didUpdateState = true;
                  } else if (!currentPredictState.tool_argument) {
                    updateCurrentState({
                      ...currentState,
                      [currentPredictState.state_key]: currentArgs,
                    });
                    didUpdateState = true;
                  }
                } catch (e) {}
              }
            }

            yield {
                type: LegacyRuntimeEventTypes.def.entries.ActionExecutionArgs,
                actionExecutionId: argsEvent.toolCallId,
                args: argsEvent.delta,
              } as LegacyActionExecutionArgs;
            if (didUpdateState) {
              yield {
                    type: LegacyRuntimeEventTypes.def.entries.AgentStateMessage,
                    threadId,
                    agentName,
                    nodeName,
                    runId,
                    running,
                    role: "assistant",
                    state: JSON.stringify(currentState),
                    active,
                  } as LegacyAgentStateMessage;
            }
            break;
          }
          case EventType.TOOL_CALL_END: {
            const endEvent = event as ToolCallEndEvent;
            yield {
                type: LegacyRuntimeEventTypes.def.entries.ActionExecutionEnd,
                actionExecutionId: endEvent.toolCallId,
              } as LegacyActionExecutionEnd;
            break;
          }
          case EventType.TOOL_CALL_RESULT: {
            const resultEvent = event as ToolCallResultEvent;
            yield {
                type: LegacyRuntimeEventTypes.def.entries.ActionExecutionResult,
                actionExecutionId: resultEvent.toolCallId,
                result: resultEvent.content,
                actionName: toolCallNames[resultEvent.toolCallId] || "unknown",
              } as LegacyActionExecutionResult;
            break;
          }
          case EventType.RAW: {
            // The legacy protocol doesn't support raw events
            break;
          }
          case EventType.CUSTOM: {
            const customEvent = event as CustomEvent;
            switch (customEvent.name) {
              case "Exit":
                running = false;
                break;
              case "PredictState":
                predictState = customEvent.value as PredictStateValue[];
                break;
            }

            yield {
                type: LegacyRuntimeEventTypes.def.entries.MetaEvent,
                name: customEvent.name,
                value: customEvent.value,
              } as LegacyMetaEvent;
            break;
          }
          case EventType.STATE_SNAPSHOT: {
            const stateEvent = event as StateSnapshotEvent;
            updateCurrentState(stateEvent.snapshot);

            yield {
                type: LegacyRuntimeEventTypes.def.entries.AgentStateMessage,
                threadId,
                agentName,
                nodeName,
                runId,
                running,
                role: "assistant",
                state: JSON.stringify(currentState),
                active,
              } as LegacyAgentStateMessage;
            break;
          }
          case EventType.STATE_DELTA: {
            const deltaEvent = event as StateDeltaEvent;
            const result = fastJsonPatch.applyPatch(currentState, deltaEvent.delta, true, false);
            if (!result) {
              break;
            }
            updateCurrentState(result.newDocument);

            yield {
                type: LegacyRuntimeEventTypes.def.entries.AgentStateMessage,
                threadId,
                agentName,
                nodeName,
                runId,
                running,
                role: "assistant",
                state: JSON.stringify(currentState),
                active,
              } as LegacyAgentStateMessage;
            break;
          }
          case EventType.MESSAGES_SNAPSHOT: {
            const messagesSnapshot = event as MessagesSnapshotEvent;
            syncedMessages = messagesSnapshot.messages;
            yield {
                type: LegacyRuntimeEventTypes.def.entries.AgentStateMessage,
                threadId,
                agentName,
                nodeName,
                runId,
                running,
                role: "assistant",
                state: JSON.stringify({
                  ...currentState,
                  ...(syncedMessages ? { messages: syncedMessages } : {}),
                }),
                active: true,
              } as LegacyAgentStateMessage;
            break;
          }
          case EventType.RUN_STARTED: {
            // There is nothing to do in the legacy protocol
            break;
          }
          case EventType.RUN_FINISHED: {
            if (syncedMessages) {
              currentState.messages = syncedMessages;
            }

            // Only do an update if state is not empty
            if (Object.keys(currentState).length === 0) {
              break;
            }

            yield {
                type: LegacyRuntimeEventTypes.def.entries.AgentStateMessage,
                threadId,
                agentName,
                nodeName,
                runId,
                running,
                role: "assistant",
                state: JSON.stringify({
                  ...currentState,
                  ...(syncedMessages
                    ? {
                        messages: convertMessagesToLegacyFormat(syncedMessages),
                      }
                    : {}),
                }),
                active: false,
              } as LegacyAgentStateMessage;
            break;
          }
          case EventType.RUN_ERROR: {
            const errorEvent = event as RunErrorEvent;
            yield {
                type: LegacyRuntimeEventTypes.def.entries.RunError,
                message: errorEvent.message,
                code: errorEvent.code,
              } as LegacyRunError;
            break;
          }
          case EventType.STEP_STARTED: {
            const stepStarted = event as StepStartedEvent;
            nodeName = stepStarted.stepName;

            currentToolCalls = [];
            predictState = null;

            yield {
                type: LegacyRuntimeEventTypes.def.entries.AgentStateMessage,
                threadId,
                agentName,
                nodeName,
                runId,
                running,
                role: "assistant",
                state: JSON.stringify(currentState),
                active: true,
              } as LegacyAgentStateMessage;
            break;
          }
          case EventType.STEP_FINISHED: {
            currentToolCalls = [];
            predictState = null;

            yield {
                type: LegacyRuntimeEventTypes.def.entries.AgentStateMessage,
                threadId,
                agentName,
                nodeName,
                runId,
                running,
                role: "assistant",
                state: JSON.stringify(currentState),
                active: false,
              } as LegacyAgentStateMessage;
            break;
          }
          default: {
            break;
          }
        }
    }
  };

export function convertMessagesToLegacyFormat(messages: Message[]): LegacyMessage[] {
  const result: LegacyMessage[] = [];

  for (const message of messages) {
    if (message.role === "assistant" || message.role === "user" || message.role === "system") {
      const textContent = flattenMessageContentToText(message.content);
      if (textContent) {
        const textMessage: LegacyTextMessage = {
          id: message.id,
          role: message.role,
          content: textContent,
        };
        result.push(textMessage);
      }
      if (message.role === "assistant" && message.toolCalls && message.toolCalls.length > 0) {
        for (const toolCall of message.toolCalls) {
          const actionExecutionMessage: LegacyActionExecutionMessage = {
            id: toolCall.id,
            name: toolCall.function.name,
            arguments: JSON.parse(toolCall.function.arguments),
            parentMessageId: message.id,
          };
          result.push(actionExecutionMessage);
        }
      }
    } else if (message.role === "tool") {
      let actionName = "unknown";
      for (const m of messages) {
        if (m.role === "assistant" && m.toolCalls?.length) {
          for (const toolCall of m.toolCalls) {
            if (toolCall.id === message.toolCallId) {
              actionName = toolCall.function.name;
              break;
            }
          }
        }
      }
      const toolMessage: LegacyResultMessage = {
        id: message.id,
        result: message.content,
        actionExecutionId: message.toolCallId,
        actionName,
      };
      result.push(toolMessage);
    }
  }

  return result;
}
