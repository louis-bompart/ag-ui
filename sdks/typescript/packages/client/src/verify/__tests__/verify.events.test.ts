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

const defaultRunContext = { threadId: "test-thread-id", runId: "test-run-id" };
const finishedEvent: RunFinishedEvent = { type: EventType.RUN_FINISHED, ...defaultRunContext };

describe("verifyEvents general validation", () => {
  // Test: Event IDs must match their parent events (e.g. TEXT_MESSAGE_CONTENT must have same ID as TEXT_MESSAGE_START)
  it("should ensure message content has the same ID as message start", async () => {
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
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "different-id",
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
        `Cannot send 'TEXT_MESSAGE_CONTENT' event: No active text message found with ID 'different-id'. Start a text message with 'TEXT_MESSAGE_START' first.`,
      );
    }

    expect(events.length).toBe(2);
    expect(events[1].type).toBe(EventType.TEXT_MESSAGE_START);
  });

  // Test: Cannot end a message that wasn't started
  it("should not allow ending a message that wasn't started", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "msg1",
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
        `Cannot send 'TEXT_MESSAGE_END' event: No active text message found with ID 'msg1'. A 'TEXT_MESSAGE_START' event must be sent first.`,
      );
    }

    expect(events.length).toBe(1);
    expect(events[0].type).toBe(EventType.RUN_STARTED);
  });

  // Test: TOOL_CALL_ARGS must have matching ID with TOOL_CALL_START
  it("should ensure tool call args has the same ID as tool call start", async () => {
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
      toolCallId: "different-id",
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
        `Cannot send 'TOOL_CALL_ARGS' event: No active tool call found with ID 'different-id'. Start a tool call with 'TOOL_CALL_START' first.`,
      );
    }

    expect(events.length).toBe(2);
    expect(events[1].type).toBe(EventType.TOOL_CALL_START);
  });

  // Test: Cannot end a tool call that wasn't started
  it("should not allow ending a tool call that wasn't started", async () => {
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
        `Cannot send 'TOOL_CALL_END' event: No active tool call found with ID 't1'. A 'TOOL_CALL_START' event must be sent first.`,
      );
    }

    expect(events.length).toBe(1);
    expect(events[0].type).toBe(EventType.RUN_STARTED);
  });

  // Test: Properly handle CUSTOM and RAW in any context
  it("should allow CUSTOM and RAW in any context", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.CUSTOM,
      name: "Exit",
      value: undefined,
    } as CustomEvent);
    channel.push({
      type: EventType.RAW,
      event: {
        type: "test_rawEvent",
        content: "test",
      },
    } as RawEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "1",
    } as TextMessageEndEvent);
    channel.push(finishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(6);
    expect(result[1].type).toBe(EventType.CUSTOM);
    expect(result[2].type).toBe(EventType.RAW);
  });

  // Test: Properly handle STATE_SNAPSHOT, STATE_DELTA, and MESSAGES_SNAPSHOT
  it("should allow state-related events in appropriate contexts", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.STATE_SNAPSHOT,
      snapshot: {
        state: "initial",
        data: { foo: "bar" },
      },
    } as StateSnapshotEvent);
    channel.push({
      type: EventType.STEP_STARTED,
      stepName: "step1",
    } as StepStartedEvent);
    channel.push({
      type: EventType.MESSAGES_SNAPSHOT,
      messages: [{ role: "user", content: "test" }],
    } as MessagesSnapshotEvent);
    channel.push({
      type: EventType.STEP_FINISHED,
      stepName: "step1",
    } as StepFinishedEvent);
    channel.push({
      type: EventType.STATE_DELTA,
      delta: [{ op: "add", path: "/result", value: "success" }],
    } as StateDeltaEvent);
    channel.push(finishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(7);
    expect(result[1].type).toBe(EventType.STATE_SNAPSHOT);
    expect(result[3].type).toBe(EventType.MESSAGES_SNAPSHOT);
    expect(result[5].type).toBe(EventType.STATE_DELTA);
  });

  // Test: Complex valid sequence with multiple message types
  it("should allow complex valid sequences with multiple message types", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.STEP_STARTED,
      stepName: "step1",
    } as StepStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "msg1",
      delta: "msg1 content",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "msg1",
    } as TextMessageEndEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "t1",
      toolCallName: "test-tool",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "t1",
      delta: "t1 args",
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "t1",
    } as ToolCallEndEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg2",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "msg2",
      delta: "msg2 content",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "msg2",
    } as TextMessageEndEvent);
    channel.push({
      type: EventType.STEP_FINISHED,
      stepName: "step1",
    } as StepFinishedEvent);
    channel.push(finishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(13);
    expect(result[0].type).toBe(EventType.RUN_STARTED);
    expect(result[12].type).toBe(EventType.RUN_FINISHED);
  });
});

describe("verifyEvents events", () => {
  // Test: TEXT_MESSAGE_CONTENT requires TEXT_MESSAGE_START with matching ID
  it("should require TEXT_MESSAGE_START before TEXT_MESSAGE_CONTENT with the same ID", async () => {
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
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "different-id",
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
        `Cannot send 'TEXT_MESSAGE_CONTENT' event: No active text message found with ID 'different-id'. Start a text message with 'TEXT_MESSAGE_START' first.`,
      );
    }

    expect(events.length).toBe(2);
    expect(events[1].type).toBe(EventType.TEXT_MESSAGE_START);
  });

  // Test: TEXT_MESSAGE_END requires TEXT_MESSAGE_START with matching ID
  it("should require TEXT_MESSAGE_START before TEXT_MESSAGE_END with the same ID", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "msg1",
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
        `Cannot send 'TEXT_MESSAGE_END' event: No active text message found with ID 'msg1'. A 'TEXT_MESSAGE_START' event must be sent first.`,
      );
    }

    expect(events.length).toBe(1);
    expect(events[0].type).toBe(EventType.RUN_STARTED);
  });

  // Test: TOOL_CALL_ARGS requires TOOL_CALL_START with matching ID
  it("should require TOOL_CALL_START before TOOL_CALL_ARGS with the same ID", async () => {
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
      toolCallId: "different-id",
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
        `Cannot send 'TOOL_CALL_ARGS' event: No active tool call found with ID 'different-id'. Start a tool call with 'TOOL_CALL_START' first.`,
      );
    }

    expect(events.length).toBe(2);
    expect(events[1].type).toBe(EventType.TOOL_CALL_START);
  });

  // Test: TOOL_CALL_END requires TOOL_CALL_START with matching ID
  it("should require TOOL_CALL_START before TOOL_CALL_END with the same ID", async () => {
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
        `Cannot send 'TOOL_CALL_END' event: No active tool call found with ID 't1'. A 'TOOL_CALL_START' event must be sent first.`,
      );
    }

    expect(events.length).toBe(1);
    expect(events[0].type).toBe(EventType.RUN_STARTED);
  });

  // Test: Special events (RAW, CUSTOM, etc.) are allowed outside of tool calls
  it("should allow special events outside of tool calls", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.CUSTOM,
      name: "Exit",
      value: undefined,
    } as CustomEvent);
    channel.push({
      type: EventType.RAW,
      event: {
        type: "raw_data",
        content: "test",
      },
    } as RawEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "1",
    } as TextMessageEndEvent);
    channel.push(finishedEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(6);
    expect(result[1].type).toBe(EventType.CUSTOM);
    expect(result[2].type).toBe(EventType.RAW);
  });

  // Test: STATE_SNAPSHOT is allowed
  it("should allow STATE_SNAPSHOT events", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.STATE_SNAPSHOT,
      snapshot: {
        state: "test_state",
        data: { foo: "bar" },
      },
    } as StateSnapshotEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(2);
    expect(result[1].type).toBe(EventType.STATE_SNAPSHOT);
  });
});
