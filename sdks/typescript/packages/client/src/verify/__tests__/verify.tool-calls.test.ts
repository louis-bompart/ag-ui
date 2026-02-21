import { AsyncChannel, collectAsync } from "@/async-utils";
import { verifyEvents } from "../verify";
import {
  BaseEvent,
  EventType,
  AGUIError,
  RunStartedEvent,
  RunFinishedEvent,
  RunErrorEvent,
  TextMessageStartEvent,
  TextMessageContentEvent,
  TextMessageEndEvent,
  ToolCallStartEvent,
  ToolCallArgsEvent,
  ToolCallEndEvent,
  StepStartedEvent,
  StepFinishedEvent,
  RawEvent,
  CustomEvent,
  StateSnapshotEvent,
  StateDeltaEvent,
  MessagesSnapshotEvent,
} from "@ag-ui/core";

describe("verifyEvents tool calls", () => {
  // Test: Cannot send TOOL_CALL_ARGS before TOOL_CALL_START
  it("should not allow TOOL_CALL_ARGS before TOOL_CALL_START", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "t1",
      delta: "test args",
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
        `Cannot send 'TOOL_CALL_ARGS' event: No active tool call found with ID 't1'`,
      );
    }

    expect(events.length).toBe(1);
    expect(events[0].type).toBe(EventType.RUN_STARTED);
  });

  // Test: Cannot send TOOL_CALL_END before TOOL_CALL_START
  it("should not allow TOOL_CALL_END before TOOL_CALL_START", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "t1",
    } as ToolCallEndEvent);
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
        `Cannot send 'TOOL_CALL_END' event: No active tool call found with ID 't1'`,
      );
    }

    expect(events.length).toBe(1);
    expect(events[0].type).toBe(EventType.RUN_STARTED);
  });

  // Test: Should allow TOOL_CALL_ARGS and TOOL_CALL_END inside a tool call
  it("should allow TOOL_CALL_ARGS and TOOL_CALL_END inside a tool call", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "t1",
      toolCallName: "test-tool",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "t1",
      delta: "test args 1",
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "t1",
      delta: "test args 2",
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "t1",
    } as ToolCallEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(6);
    expect(result[1].type).toBe(EventType.TOOL_CALL_START);
    expect(result[2].type).toBe(EventType.TOOL_CALL_ARGS);
    expect(result[3].type).toBe(EventType.TOOL_CALL_ARGS);
    expect(result[4].type).toBe(EventType.TOOL_CALL_END);
  });

  // Test: Should allow RAW inside a tool call
  it("should allow RAW inside a tool call", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "t1",
      toolCallName: "test-tool",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "t1",
      delta: "test args",
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.RAW,
      event: {
        type: "raw_data",
        content: "test",
      },
    } as RawEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "t1",
    } as ToolCallEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(6);
    expect(result[3].type).toBe(EventType.RAW);
  });

  // Test: Should allow CUSTOM inside a tool call
  it("should allow CUSTOM inside a tool call", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "t1",
      toolCallName: "test-tool",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "t1",
      delta: "test args",
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.CUSTOM,
      name: "test_event",
      value: "test_value",
    } as CustomEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "t1",
    } as ToolCallEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(6);
    expect(result[3].type).toBe(EventType.CUSTOM);
  });

  // Test: Should allow STATE_SNAPSHOT inside a tool call
  it("should allow STATE_SNAPSHOT inside a tool call", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "t1",
      toolCallName: "test-tool",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "t1",
      delta: "test args",
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.STATE_SNAPSHOT,
      snapshot: {
        state: "test_state",
        data: { foo: "bar" },
      },
    } as StateSnapshotEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "t1",
    } as ToolCallEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(6);
    expect(result[3].type).toBe(EventType.STATE_SNAPSHOT);
  });

  // Test: Should allow STATE_DELTA inside a tool call
  it("should allow STATE_DELTA inside a tool call", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "t1",
      toolCallName: "test-tool",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "t1",
      delta: "test args",
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.STATE_DELTA,
      delta: [{ op: "add", path: "/result", value: "success" }],
    } as StateDeltaEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "t1",
    } as ToolCallEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(6);
    expect(result[3].type).toBe(EventType.STATE_DELTA);
  });

  // Test: Should allow MESSAGES_SNAPSHOT inside a tool call
  it("should allow MESSAGES_SNAPSHOT inside a tool call", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "t1",
      toolCallName: "test-tool",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "t1",
      delta: "test args",
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.MESSAGES_SNAPSHOT,
      messages: [{ role: "user", content: "test", id: "test-id" }],
    } as MessagesSnapshotEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "t1",
    } as ToolCallEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(6);
    expect(result[3].type).toBe(EventType.MESSAGES_SNAPSHOT);
  });

  // Test: Should allow lifecycle events (STEP_STARTED/STEP_FINISHED) during tool calls
  it("should allow lifecycle events during tool calls", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "t1",
      toolCallName: "test-tool",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.STEP_STARTED,
      stepName: "test-step",
    } as StepStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "t1",
      delta: "test args",
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.STEP_FINISHED,
      stepName: "test-step",
    } as StepFinishedEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "t1",
    } as ToolCallEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(7);
    expect(result[2].type).toBe(EventType.STEP_STARTED);
    expect(result[4].type).toBe(EventType.STEP_FINISHED);
  });

  // Test: Should allow text messages to start during tool calls
  it("should allow text messages to start during tool calls", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "t1",
      toolCallName: "test-tool",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "t1",
      delta: "Preparing...",
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "msg1",
      delta: "Tool is processing...",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "msg1",
    } as TextMessageEndEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "t1",
      delta: "Completed.",
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "t1",
    } as ToolCallEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(9);
    expect(result[3].type).toBe(EventType.TEXT_MESSAGE_START);
    expect(result[4].type).toBe(EventType.TEXT_MESSAGE_CONTENT);
    expect(result[5].type).toBe(EventType.TEXT_MESSAGE_END);
  });

  // Test: Sequential tool calls
  it("should allow multiple sequential tool calls", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "t1",
      toolCallName: "search",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "t1",
      delta: '{"query":"test"}',
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "t1",
    } as ToolCallEndEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "t2",
      toolCallName: "calculate",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "t2",
      delta: '{"expression":"1+1"}',
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "t2",
    } as ToolCallEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(8);
    expect(result[1].type).toBe(EventType.TOOL_CALL_START);
    expect(result[2].type).toBe(EventType.TOOL_CALL_ARGS);
    expect(result[3].type).toBe(EventType.TOOL_CALL_END);
    expect(result[4].type).toBe(EventType.TOOL_CALL_START);
    expect(result[5].type).toBe(EventType.TOOL_CALL_ARGS);
    expect(result[6].type).toBe(EventType.TOOL_CALL_END);
  });

  // Test: Tool call at run boundaries
  it("should allow tool calls immediately after RUN_STARTED and before RUN_FINISHED", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "t1",
      toolCallName: "test-tool",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "t1",
      delta: "test args",
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "t1",
    } as ToolCallEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(5);
    expect(result[0].type).toBe(EventType.RUN_STARTED);
    expect(result[1].type).toBe(EventType.TOOL_CALL_START);
    expect(result[3].type).toBe(EventType.TOOL_CALL_END);
    expect(result[4].type).toBe(EventType.RUN_FINISHED);
  });

  // Test: Starting tool call before RUN_STARTED
  it("should not allow starting a tool call before RUN_STARTED", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "t1",
      toolCallName: "test-tool",
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
      expect((err as Error).message).toContain("First event must be 'RUN_STARTED'");
    }

    expect(events.length).toBe(0);
  });
});
