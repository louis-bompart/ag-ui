import { AsyncChannel, collectAsync } from "@/async-utils";
import { verifyEvents } from "../verify";
import {
  BaseEvent,
  EventType,
  AGUIError,
  RunStartedEvent,
  RunFinishedEvent,
  TextMessageStartEvent,
  TextMessageContentEvent,
  TextMessageEndEvent,
  ToolCallStartEvent,
  ToolCallArgsEvent,
  ToolCallEndEvent,
  StepStartedEvent,
  StepFinishedEvent,
} from "@ag-ui/core";

describe("verifyEvents concurrent operations", () => {
  // Test: Concurrent text messages with different IDs should be allowed
  it("should allow concurrent text messages with different IDs", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg2",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "msg1",
      delta: "Content for message 1",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "msg2",
      delta: "Content for message 2",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "msg2",
    } as TextMessageEndEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "msg1",
    } as TextMessageEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(8);
    expect(result[0].type).toBe(EventType.RUN_STARTED);
    expect(result[1].type).toBe(EventType.TEXT_MESSAGE_START);
    expect(result[2].type).toBe(EventType.TEXT_MESSAGE_START);
    expect(result[7].type).toBe(EventType.RUN_FINISHED);
  });

  // Test: Concurrent tool calls with different IDs should be allowed
  it("should allow concurrent tool calls with different IDs", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "tool1",
      toolCallName: "search",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "tool2",
      toolCallName: "calculate",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "tool1",
      delta: '{"query":"test"}',
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "tool2",
      delta: '{"expression":"1+1"}',
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "tool2",
    } as ToolCallEndEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "tool1",
    } as ToolCallEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(8);
    expect(result[0].type).toBe(EventType.RUN_STARTED);
    expect(result[1].type).toBe(EventType.TOOL_CALL_START);
    expect(result[2].type).toBe(EventType.TOOL_CALL_START);
    expect(result[7].type).toBe(EventType.RUN_FINISHED);
  });

  // Test: Overlapping text messages and tool calls should be allowed
  it("should allow overlapping text messages and tool calls", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "tool1",
      toolCallName: "search",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "msg1",
      delta: "Thinking...",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "tool1",
      delta: '{"query":"test"}',
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg2",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "msg1",
    } as TextMessageEndEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "msg2",
      delta: "Based on the search...",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "tool1",
    } as ToolCallEndEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "msg2",
    } as TextMessageEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(11);
    expect(result[0].type).toBe(EventType.RUN_STARTED);
    expect(result[10].type).toBe(EventType.RUN_FINISHED);
  });

  // Test: Steps and other lifecycle events should be allowed during concurrent messages/tool calls
  it("should allow lifecycle events during concurrent messages and tool calls", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.STEP_STARTED,
      stepName: "search_step",
    } as StepStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "tool1",
      toolCallName: "search",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.STEP_STARTED,
      stepName: "analysis_step",
    } as StepStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "msg1",
      delta: "Searching...",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "tool1",
      delta: '{"query":"test"}',
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "msg1",
    } as TextMessageEndEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "tool1",
    } as ToolCallEndEvent);
    channel.push({
      type: EventType.STEP_FINISHED,
      stepName: "analysis_step",
    } as StepFinishedEvent);
    channel.push({
      type: EventType.STEP_FINISHED,
      stepName: "search_step",
    } as StepFinishedEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(12);
    expect(result[0].type).toBe(EventType.RUN_STARTED);
    expect(result[11].type).toBe(EventType.RUN_FINISHED);
  });

  // Test: Should reject duplicate message ID starts
  it("should reject starting a text message with an ID already in progress", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg1",
    } as TextMessageStartEvent);
    channel.close();

    const events: BaseEvent[] = [];
    try {
      for await (const event of verifyEvents(false)(channel)) {
        events.push(event);
      }
      expect.unreachable("Expected error was not thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AGUIError);
      expect((err as Error).message).toContain(
        `Cannot send 'TEXT_MESSAGE_START' event: A text message with ID 'msg1' is already in progress`,
      );
    }

    expect(events.length).toBe(2);
  });

  // Test: Should reject duplicate tool call ID starts
  it("should reject starting a tool call with an ID already in progress", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "tool1",
      toolCallName: "search",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "tool1",
      toolCallName: "calculate",
    } as ToolCallStartEvent);
    channel.close();

    const events: BaseEvent[] = [];
    try {
      for await (const event of verifyEvents(false)(channel)) {
        events.push(event);
      }
      expect.unreachable("Expected error was not thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AGUIError);
      expect((err as Error).message).toContain(
        `Cannot send 'TOOL_CALL_START' event: A tool call with ID 'tool1' is already in progress`,
      );
    }

    expect(events.length).toBe(2);
  });

  // Test: Should reject content for non-existent message ID
  it("should reject content for non-existent message ID", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "nonexistent",
      delta: "test content",
    } as TextMessageContentEvent);
    channel.close();

    const events: BaseEvent[] = [];
    try {
      for await (const event of verifyEvents(false)(channel)) {
        events.push(event);
      }
      expect.unreachable("Expected error was not thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AGUIError);
      expect((err as Error).message).toContain(
        `Cannot send 'TEXT_MESSAGE_CONTENT' event: No active text message found with ID 'nonexistent'`,
      );
    }

    expect(events.length).toBe(1);
  });

  // Test: Should reject args for non-existent tool call ID
  it("should reject args for non-existent tool call ID", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "nonexistent",
      delta: '{"test":"value"}',
    } as ToolCallArgsEvent);
    channel.close();

    const events: BaseEvent[] = [];
    try {
      for await (const event of verifyEvents(false)(channel)) {
        events.push(event);
      }
      expect.unreachable("Expected error was not thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AGUIError);
      expect((err as Error).message).toContain(
        `Cannot send 'TOOL_CALL_ARGS' event: No active tool call found with ID 'nonexistent'`,
      );
    }

    expect(events.length).toBe(1);
  });

  // Test: Should reject RUN_FINISHED while messages are still active
  it("should reject RUN_FINISHED while text messages are still active", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg2",
    } as TextMessageStartEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const events: BaseEvent[] = [];
    try {
      for await (const event of verifyEvents(false)(channel)) {
        events.push(event);
      }
      expect.unreachable("Expected error was not thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AGUIError);
      expect((err as Error).message).toContain(
        `Cannot send 'RUN_FINISHED' while text messages are still active: msg1, msg2`,
      );
    }

    expect(events.length).toBe(3);
  });

  // Test: Should reject RUN_FINISHED while tool calls are still active
  it("should reject RUN_FINISHED while tool calls are still active", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "tool1",
      toolCallName: "search",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "tool2",
      toolCallName: "calculate",
    } as ToolCallStartEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const events: BaseEvent[] = [];
    try {
      for await (const event of verifyEvents(false)(channel)) {
        events.push(event);
      }
      expect.unreachable("Expected error was not thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AGUIError);
      expect((err as Error).message).toContain(
        `Cannot send 'RUN_FINISHED' while tool calls are still active: tool1, tool2`,
      );
    }

    expect(events.length).toBe(3);
  });

  // Test: Complex concurrent scenario with high frequency events
  it("should handle complex concurrent scenario with many overlapping events", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);

    const messageIds = ["msg1", "msg2", "msg3", "msg4", "msg5"];
    const toolCallIds = ["tool1", "tool2", "tool3", "tool4", "tool5"];

    for (const msgId of messageIds) {
      channel.push({
        type: EventType.TEXT_MESSAGE_START,
        messageId: msgId,
      } as TextMessageStartEvent);
    }

    for (const toolId of toolCallIds) {
      channel.push({
        type: EventType.TOOL_CALL_START,
        toolCallId: toolId,
        toolCallName: "test_tool",
      } as ToolCallStartEvent);
    }

    for (let i = 0; i < 3; i++) {
      for (const msgId of messageIds) {
        channel.push({
          type: EventType.TEXT_MESSAGE_CONTENT,
          messageId: msgId,
          delta: `Content ${i} for ${msgId}`,
        } as TextMessageContentEvent);
      }

      for (const toolId of toolCallIds) {
        channel.push({
          type: EventType.TOOL_CALL_ARGS,
          toolCallId: toolId,
          delta: `{"step":${i}}`,
        } as ToolCallArgsEvent);
      }
    }

    for (const msgId of [...messageIds].reverse()) {
      channel.push({
        type: EventType.TEXT_MESSAGE_END,
        messageId: msgId,
      } as TextMessageEndEvent);
    }

    for (const toolId of [...toolCallIds].reverse()) {
      channel.push({
        type: EventType.TOOL_CALL_END,
        toolCallId: toolId,
      } as ToolCallEndEvent);
    }

    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    // 1 RUN_STARTED + 5 MSG_START + 5 TOOL_START + 15 MSG_CONTENT + 15 TOOL_ARGS + 5 MSG_END + 5 TOOL_END + 1 RUN_FINISHED = 52
    expect(result.length).toBe(52);
    expect(result[0].type).toBe(EventType.RUN_STARTED);
    expect(result[51].type).toBe(EventType.RUN_FINISHED);
  });
});
