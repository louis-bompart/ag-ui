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

describe("verifyEvents text messages", () => {
  // Test: Cannot send TEXT_MESSAGE_CONTENT before TEXT_MESSAGE_START
  it("should not allow TEXT_MESSAGE_CONTENT before TEXT_MESSAGE_START", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "1",
      delta: "content 1",
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
        `Cannot send 'TEXT_MESSAGE_CONTENT' event: No active text message found with ID '1'`,
      );
    }

    expect(events.length).toBe(1);
    expect(events[0].type).toBe(EventType.RUN_STARTED);
  });

  // Test: Cannot send TEXT_MESSAGE_END before TEXT_MESSAGE_START
  it("should not allow TEXT_MESSAGE_END before TEXT_MESSAGE_START", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "1",
    } as TextMessageEndEvent);
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
        `Cannot send 'TEXT_MESSAGE_END' event: No active text message found with ID '1'`,
      );
    }

    expect(events.length).toBe(1);
    expect(events[0].type).toBe(EventType.RUN_STARTED);
  });

  // Test: Should allow TEXT_MESSAGE_CONTENT inside a text message
  it("should allow TEXT_MESSAGE_CONTENT inside a text message", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "1",
      delta: "content 1",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "1",
      delta: "content 2",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "1",
    } as TextMessageEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(6);
    expect(result[1].type).toBe(EventType.TEXT_MESSAGE_START);
    expect(result[2].type).toBe(EventType.TEXT_MESSAGE_CONTENT);
    expect(result[3].type).toBe(EventType.TEXT_MESSAGE_CONTENT);
    expect(result[4].type).toBe(EventType.TEXT_MESSAGE_END);
  });

  // Test: Should allow RAW inside a text message
  it("should allow RAW inside a text message", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "1",
      delta: "test content",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.RAW,
      event: {
        type: "raw_data",
        content: "test",
      },
    } as RawEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "1",
    } as TextMessageEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(6);
    expect(result[3].type).toBe(EventType.RAW);
  });

  // Test: Should allow CUSTOM inside a text message
  it("should allow CUSTOM inside a text message", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "1",
      delta: "test content",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.CUSTOM,
      name: "test_event",
      value: "test_value",
    } as CustomEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "1",
    } as TextMessageEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(6);
    expect(result[3].type).toBe(EventType.CUSTOM);
  });

  // Test: Should allow STATE_SNAPSHOT inside a text message
  it("should allow STATE_SNAPSHOT inside a text message", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "1",
      delta: "test content",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.STATE_SNAPSHOT,
      snapshot: {
        state: "test_state",
        data: { foo: "bar" },
      },
    } as StateSnapshotEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "1",
    } as TextMessageEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(6);
    expect(result[3].type).toBe(EventType.STATE_SNAPSHOT);
  });

  // Test: Should allow STATE_DELTA inside a text message
  it("should allow STATE_DELTA inside a text message", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "1",
      delta: "test content",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.STATE_DELTA,
      delta: [{ op: "add", path: "/result", value: "success" }],
    } as StateDeltaEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "1",
    } as TextMessageEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(6);
    expect(result[3].type).toBe(EventType.STATE_DELTA);
  });

  // Test: Should allow MESSAGES_SNAPSHOT inside a text message
  it("should allow MESSAGES_SNAPSHOT inside a text message", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "1",
      delta: "test content",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.MESSAGES_SNAPSHOT,
      messages: [{ role: "user", content: "test", id: "test-id" }],
    } as MessagesSnapshotEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "1",
    } as TextMessageEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(6);
    expect(result[3].type).toBe(EventType.MESSAGES_SNAPSHOT);
  });

  // Test: Should allow lifecycle events (STEP_STARTED/STEP_FINISHED) during text messages
  it("should allow lifecycle events during text messages", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.STEP_STARTED,
      stepName: "test-step",
    } as StepStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "1",
      delta: "test content",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.STEP_FINISHED,
      stepName: "test-step",
    } as StepFinishedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "1",
    } as TextMessageEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(7);
    expect(result[2].type).toBe(EventType.STEP_STARTED);
    expect(result[4].type).toBe(EventType.STEP_FINISHED);
  });

  // Test: Should allow tool calls to start during text messages
  it("should allow tool calls to start during text messages", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "1",
      delta: "Starting search...",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "tool1",
      toolCallName: "search",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "tool1",
      delta: '{"query":"test"}',
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "tool1",
    } as ToolCallEndEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "1",
      delta: "Search completed.",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "1",
    } as TextMessageEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(9);
    expect(result[3].type).toBe(EventType.TOOL_CALL_START);
    expect(result[4].type).toBe(EventType.TOOL_CALL_ARGS);
    expect(result[5].type).toBe(EventType.TOOL_CALL_END);
  });

  // Test: Sequential text messages
  it("should allow multiple sequential text messages", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "1",
      delta: "content 1",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "1",
    } as TextMessageEndEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "2",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "2",
      delta: "content 2",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "2",
    } as TextMessageEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(8);
    expect(result[1].type).toBe(EventType.TEXT_MESSAGE_START);
    expect(result[2].type).toBe(EventType.TEXT_MESSAGE_CONTENT);
    expect(result[3].type).toBe(EventType.TEXT_MESSAGE_END);
    expect(result[4].type).toBe(EventType.TEXT_MESSAGE_START);
    expect(result[5].type).toBe(EventType.TEXT_MESSAGE_CONTENT);
    expect(result[6].type).toBe(EventType.TEXT_MESSAGE_END);
  });

  // Test: Text message at run boundaries
  it("should allow text messages immediately after RUN_STARTED and before RUN_FINISHED", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "1",
      delta: "content 1",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "1",
    } as TextMessageEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(5);
    expect(result[0].type).toBe(EventType.RUN_STARTED);
    expect(result[1].type).toBe(EventType.TEXT_MESSAGE_START);
    expect(result[3].type).toBe(EventType.TEXT_MESSAGE_END);
    expect(result[4].type).toBe(EventType.RUN_FINISHED);
  });

  // Test: Starting text message before RUN_STARTED
  it("should not allow starting a text message before RUN_STARTED", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "1",
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
      expect((err as Error).message).toContain("First event must be 'RUN_STARTED'");
    }

    expect(events.length).toBe(0);
  });
});
