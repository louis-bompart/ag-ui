import {
  BaseEvent,
  TextMessageChunkEvent,
  TextMessageContentEvent,
  TextMessageEndEvent,
  TextMessageStartEvent,
  ToolCallArgsEvent,
  ToolCallChunkEvent,
  ToolCallEndEvent,
  ToolCallStartEvent,
  ReasoningMessageChunkEvent,
  ReasoningMessageContentEvent,
  ReasoningMessageEndEvent,
  ReasoningMessageStartEvent,
} from "@ag-ui/core";
import { EventType } from "@ag-ui/core";

interface TextMessageFields {
  messageId: string;
}

interface ToolCallFields {
  toolCallId: string;
  toolCallName: string;
  parentMessageId?: string;
}

interface ReasoningMessageFields {
  messageId: string;
}

export const transformChunks =
  (debug: boolean) =>
  async function* (events: AsyncIterable<BaseEvent>): AsyncIterable<BaseEvent> {
    let textMessageFields: TextMessageFields | undefined;
    let toolCallFields: ToolCallFields | undefined;
    let reasoningMessageFields: ReasoningMessageFields | undefined;
    let mode: "text" | "tool" | "reasoning" | undefined;

    const closeTextMessage = () => {
      if (!textMessageFields || mode !== "text") {
        throw new Error("No text message to close");
      }
      const event = {
        type: EventType.TEXT_MESSAGE_END,
        messageId: textMessageFields.messageId,
      } as TextMessageEndEvent;
      mode = undefined;
      textMessageFields = undefined;

      if (debug) {
        console.debug("[TRANSFORM]: TEXT_MESSAGE_END", JSON.stringify(event));
      }

      return event;
    };

    const closeToolCall = () => {
      if (!toolCallFields || mode !== "tool") {
        throw new Error("No tool call to close");
      }
      const event = {
        type: EventType.TOOL_CALL_END,
        toolCallId: toolCallFields.toolCallId,
      } as ToolCallEndEvent;
      mode = undefined;
      toolCallFields = undefined;

      if (debug) {
        console.debug("[TRANSFORM]: TOOL_CALL_END", JSON.stringify(event));
      }

      return event;
    };

    const closeReasoningMessage = () => {
      if (!reasoningMessageFields || mode !== "reasoning") {
        throw new Error("No reasoning message to close");
      }
      const event = {
        type: EventType.REASONING_MESSAGE_END,
        messageId: reasoningMessageFields.messageId,
      } as ReasoningMessageEndEvent;
      mode = undefined;
      reasoningMessageFields = undefined;

      if (debug) {
        console.debug("[TRANSFORM]: REASONING_MESSAGE_END", JSON.stringify(event));
      }

      return event;
    };

    const closePendingEvent = (): BaseEvent[] => {
      if (mode === "text") {
        return [closeTextMessage()];
      }
      if (mode === "tool") {
        return [closeToolCall()];
      }
      if (mode === "reasoning") {
        return [closeReasoningMessage()];
      }
      return [];
    };

    try {
      for await (const event of events) {
        switch (event.type) {
          case EventType.TEXT_MESSAGE_START:
          case EventType.TEXT_MESSAGE_CONTENT:
          case EventType.TEXT_MESSAGE_END:
          case EventType.TOOL_CALL_START:
          case EventType.TOOL_CALL_ARGS:
          case EventType.TOOL_CALL_END:
          case EventType.TOOL_CALL_RESULT:
          case EventType.STATE_SNAPSHOT:
          case EventType.STATE_DELTA:
          case EventType.MESSAGES_SNAPSHOT:
          case EventType.CUSTOM:
          case EventType.RUN_STARTED:
          case EventType.RUN_FINISHED:
          case EventType.RUN_ERROR:
          case EventType.STEP_STARTED:
          case EventType.STEP_FINISHED:
          case EventType.THINKING_START:
          case EventType.THINKING_END:
          case EventType.THINKING_TEXT_MESSAGE_START:
          case EventType.THINKING_TEXT_MESSAGE_CONTENT:
          case EventType.THINKING_TEXT_MESSAGE_END:
          case EventType.REASONING_START:
          case EventType.REASONING_MESSAGE_START:
          case EventType.REASONING_MESSAGE_CONTENT:
          case EventType.REASONING_MESSAGE_END:
          case EventType.REASONING_END:
            yield* [...closePendingEvent(), event];
            break;
          case EventType.RAW:
          case EventType.ACTIVITY_SNAPSHOT:
          case EventType.ACTIVITY_DELTA:
          case EventType.REASONING_ENCRYPTED_VALUE:
            yield event;
            break;
          case EventType.TEXT_MESSAGE_CHUNK: {
            const messageChunkEvent = event as TextMessageChunkEvent;
            if (
              // we are not in a text message
              mode !== "text" ||
              // or the message id is different
              (messageChunkEvent.messageId !== undefined &&
                messageChunkEvent.messageId !== textMessageFields?.messageId)
            ) {
              // close the current message if any
              yield* closePendingEvent();
            }

            // we are not in a text message, start a new one
            if (mode !== "text") {
              if (messageChunkEvent.messageId === undefined) {
                throw new Error("First TEXT_MESSAGE_CHUNK must have a messageId");
              }

              textMessageFields = {
                messageId: messageChunkEvent.messageId,
              };
              mode = "text";

              const textMessageStartEvent = {
                type: EventType.TEXT_MESSAGE_START,
                messageId: messageChunkEvent.messageId,
                role: messageChunkEvent.role || "assistant",
              } as TextMessageStartEvent;

              yield textMessageStartEvent;

              if (debug) {
                console.debug(
                  "[TRANSFORM]: TEXT_MESSAGE_START",
                  JSON.stringify(textMessageStartEvent),
                );
              }
            }

            if (messageChunkEvent.delta !== undefined) {
              const textMessageContentEvent = {
                type: EventType.TEXT_MESSAGE_CONTENT,
                messageId: textMessageFields!.messageId,
                delta: messageChunkEvent.delta,
              } as TextMessageContentEvent;

              yield textMessageContentEvent;

              if (debug) {
                console.debug(
                  "[TRANSFORM]: TEXT_MESSAGE_CONTENT",
                  JSON.stringify(textMessageContentEvent),
                );
              }
            }
            break;
          }
          case EventType.TOOL_CALL_CHUNK: {
            const toolCallChunkEvent = event as ToolCallChunkEvent;
            if (
              // we are not in a tool call
              mode !== "tool" ||
              // or the tool call id is different
              (toolCallChunkEvent.toolCallId !== undefined &&
                toolCallChunkEvent.toolCallId !== toolCallFields?.toolCallId)
            ) {
              // close the current message if any
              yield* closePendingEvent();
            }

            if (mode !== "tool") {
              if (toolCallChunkEvent.toolCallId === undefined) {
                throw new Error("First TOOL_CALL_CHUNK must have a toolCallId");
              }
              if (toolCallChunkEvent.toolCallName === undefined) {
                throw new Error("First TOOL_CALL_CHUNK must have a toolCallName");
              }
              toolCallFields = {
                toolCallId: toolCallChunkEvent.toolCallId,
                toolCallName: toolCallChunkEvent.toolCallName,
                parentMessageId: toolCallChunkEvent.parentMessageId,
              };
              mode = "tool";

              const toolCallStartEvent = {
                type: EventType.TOOL_CALL_START,
                toolCallId: toolCallChunkEvent.toolCallId,
                toolCallName: toolCallChunkEvent.toolCallName,
                parentMessageId: toolCallChunkEvent.parentMessageId,
              } as ToolCallStartEvent;

              yield toolCallStartEvent;

              if (debug) {
                console.debug("[TRANSFORM]: TOOL_CALL_START", JSON.stringify(toolCallStartEvent));
              }
            }

            if (toolCallChunkEvent.delta !== undefined) {
              const toolCallArgsEvent = {
                type: EventType.TOOL_CALL_ARGS,
                toolCallId: toolCallFields!.toolCallId,
                delta: toolCallChunkEvent.delta,
              } as ToolCallArgsEvent;

              yield toolCallArgsEvent;

              if (debug) {
                console.debug("[TRANSFORM]: TOOL_CALL_ARGS", JSON.stringify(toolCallArgsEvent));
              }
            }
            break;
          }
          case EventType.REASONING_MESSAGE_CHUNK: {
            const reasoningChunkEvent = event as ReasoningMessageChunkEvent;
            if (
              // we are not in a reasoning message
              mode !== "reasoning" ||
              // or the message id is different
              (reasoningChunkEvent.messageId &&
                reasoningChunkEvent.messageId !== reasoningMessageFields?.messageId)
            ) {
              // close the current message if any
              yield* closePendingEvent();
            }

            // we are not in a reasoning message, start a new one
            if (mode !== "reasoning") {
              if (reasoningChunkEvent.messageId === undefined) {
                throw new Error("First REASONING_MESSAGE_CHUNK must have a messageId");
              }

              reasoningMessageFields = {
                messageId: reasoningChunkEvent.messageId,
              };
              mode = "reasoning";

              const reasoningMessageStartEvent = {
                type: EventType.REASONING_MESSAGE_START,
                messageId: reasoningChunkEvent.messageId,
              } as ReasoningMessageStartEvent;
              yield reasoningMessageStartEvent;

              if (debug) {
                console.debug(
                  "[TRANSFORM]: REASONING_MESSAGE_START",
                  JSON.stringify(reasoningMessageStartEvent),
                );
              }
            }

            if (reasoningChunkEvent.delta !== undefined) {
              const reasoningMessageContentEvent = {
                type: EventType.REASONING_MESSAGE_CONTENT,
                messageId: reasoningMessageFields!.messageId,
                delta: reasoningChunkEvent.delta,
              } as ReasoningMessageContentEvent;

              yield reasoningMessageContentEvent;

              if (debug) {
                console.debug(
                  "[TRANSFORM]: REASONING_MESSAGE_CONTENT",
                  JSON.stringify(reasoningMessageContentEvent),
                );
              }
            }
            break;
          }
        }
      }
    } finally {
      // Ensure we close any pending events when the source completes
      closePendingEvent();
    }
  };
