import { AsyncChannel, collectAsync } from "@/async-utils";
import { verifyEvents } from "../verify";
import {
  BaseEvent,
  EventType,
  AGUIError,
  TextMessageStartEvent,
  TextMessageContentEvent,
  TextMessageEndEvent,
  RunStartedEvent,
  RunFinishedEvent,
  RunErrorEvent,
  ToolCallStartEvent,
  ToolCallArgsEvent,
  ToolCallEndEvent,
  StepStartedEvent,
  StepFinishedEvent,
} from "@ag-ui/core";

const runFinished = (threadId: string, runId: string): RunFinishedEvent => ({
  type: EventType.RUN_FINISHED,
  threadId,
  runId,
});

describe("verifyEvents multiple runs", () => {
  // Test: Basic multiple sequential runs
  it("should allow multiple sequential runs", async () => {
    const channel = new AsyncChannel<BaseEvent>();

    // First run
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-1",
      runId: "test-run-1",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg-1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "msg-1",
      delta: "Hello from run 1",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "msg-1",
    } as TextMessageEndEvent);
    channel.push(runFinished("test-thread-1", "test-run-1"));

    // Second run
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-1",
      runId: "test-run-2",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg-2",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "msg-2",
      delta: "Hello from run 2",
    } as TextMessageContentEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "msg-2",
    } as TextMessageEndEvent);
    channel.push(runFinished("test-thread-1", "test-run-2"));
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(10);
    expect(result[0].type).toBe(EventType.RUN_STARTED);
    expect((result[0] as RunStartedEvent).runId).toBe("test-run-1");
    expect(result[4].type).toBe(EventType.RUN_FINISHED);
    expect(result[5].type).toBe(EventType.RUN_STARTED);
    expect((result[5] as RunStartedEvent).runId).toBe("test-run-2");
    expect(result[9].type).toBe(EventType.RUN_FINISHED);
  });

  // Test: Multiple runs with different message IDs
  it("should allow reusing message IDs across different runs", async () => {
    const channel = new AsyncChannel<BaseEvent>();

    // First run with message ID "msg-1"
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-1",
      runId: "test-run-1",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg-1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "msg-1",
    } as TextMessageEndEvent);
    channel.push(runFinished("test-thread-1", "test-run-1"));

    // Second run reusing message ID "msg-1" (should be allowed)
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-1",
      runId: "test-run-2",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg-1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "msg-1",
    } as TextMessageEndEvent);
    channel.push(runFinished("test-thread-1", "test-run-2"));
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(8);
  });

  // Test: Multiple runs with tool calls
  it("should allow multiple runs with tool calls", async () => {
    const channel = new AsyncChannel<BaseEvent>();

    // First run with tool call
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-1",
      runId: "test-run-1",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "tool-1",
      toolCallName: "calculator",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "tool-1",
      delta: '{"a": 1, "b": 2}',
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "tool-1",
    } as ToolCallEndEvent);
    channel.push(runFinished("test-thread-1", "test-run-1"));

    // Second run with tool call (reusing toolCallId should be allowed)
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-1",
      runId: "test-run-2",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "tool-1",
      toolCallName: "weather",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "tool-1",
      delta: '{"city": "NYC"}',
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "tool-1",
    } as ToolCallEndEvent);
    channel.push(runFinished("test-thread-1", "test-run-2"));
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(10);
  });

  // Test: Multiple runs with steps
  it("should allow multiple runs with steps", async () => {
    const channel = new AsyncChannel<BaseEvent>();

    // First run with steps
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-1",
      runId: "test-run-1",
    } as RunStartedEvent);
    channel.push({
      type: EventType.STEP_STARTED,
      stepName: "planning",
    } as StepStartedEvent);
    channel.push({
      type: EventType.STEP_FINISHED,
      stepName: "planning",
    } as StepFinishedEvent);
    channel.push(runFinished("test-thread-1", "test-run-1"));

    // Second run reusing step name (should be allowed)
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-1",
      runId: "test-run-2",
    } as RunStartedEvent);
    channel.push({
      type: EventType.STEP_STARTED,
      stepName: "planning",
    } as StepStartedEvent);
    channel.push({
      type: EventType.STEP_FINISHED,
      stepName: "planning",
    } as StepFinishedEvent);
    channel.push(runFinished("test-thread-1", "test-run-2"));
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(8);
  });

  // Test: Cannot start new run while current run is active
  it("should not allow new RUN_STARTED while run is active", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-1",
      runId: "test-run-1",
    } as RunStartedEvent);
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-1",
      runId: "test-run-2",
    } as RunStartedEvent);
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
        "Cannot send 'RUN_STARTED' while a run is still active",
      );
    }

    expect(events.length).toBe(1);
    expect(events[0].type).toBe(EventType.RUN_STARTED);
  });

  // Test: Three sequential runs
  it("should allow three sequential runs", async () => {
    const channel = new AsyncChannel<BaseEvent>();

    for (let i = 1; i <= 3; i++) {
      channel.push({
        type: EventType.RUN_STARTED,
        threadId: "test-thread-1",
        runId: `test-run-${i}`,
      } as RunStartedEvent);
      channel.push({
        type: EventType.TEXT_MESSAGE_START,
        messageId: `msg-${i}`,
      } as TextMessageStartEvent);
      channel.push({
        type: EventType.TEXT_MESSAGE_CONTENT,
        messageId: `msg-${i}`,
        delta: `Message from run ${i}`,
      } as TextMessageContentEvent);
      channel.push({
        type: EventType.TEXT_MESSAGE_END,
        messageId: `msg-${i}`,
      } as TextMessageEndEvent);
      channel.push(runFinished("test-thread-1", `test-run-${i}`));
    }
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(15);
    expect((result[0] as RunStartedEvent).runId).toBe("test-run-1");
    expect((result[5] as RunStartedEvent).runId).toBe("test-run-2");
    expect((result[10] as RunStartedEvent).runId).toBe("test-run-3");
  });

  // Test: RUN_ERROR still blocks subsequent events in the same run
  it("should still block events after RUN_ERROR within the same run", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-1",
      runId: "test-run-1",
    } as RunStartedEvent);
    channel.push({
      type: EventType.RUN_ERROR,
      message: "Test error",
    } as RunErrorEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg-1",
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
        "The run has already errored with 'RUN_ERROR'",
      );
    }

    expect(events.length).toBe(2);
    expect(events[0].type).toBe(EventType.RUN_STARTED);
    expect(events[1].type).toBe(EventType.RUN_ERROR);
  });

  // Test: Complex scenario with mixed events across runs
  it("should handle complex scenario with multiple runs and various event types", async () => {
    const channel = new AsyncChannel<BaseEvent>();

    // First run: message + tool call
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-1",
      runId: "test-run-1",
    } as RunStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg-1",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "msg-1",
    } as TextMessageEndEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "tool-1",
      toolCallName: "search",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "tool-1",
    } as ToolCallEndEvent);
    channel.push(runFinished("test-thread-1", "test-run-2"));

    // Second run: step + message
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-1",
      runId: "test-run-2",
    } as RunStartedEvent);
    channel.push({
      type: EventType.STEP_STARTED,
      stepName: "analysis",
    } as StepStartedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg-2",
    } as TextMessageStartEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_END,
      messageId: "msg-2",
    } as TextMessageEndEvent);
    channel.push({
      type: EventType.STEP_FINISHED,
      stepName: "analysis",
    } as StepFinishedEvent);
    channel.push(runFinished("test-thread-1", "test-run-2"));
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(12);
    expect(result[0].type).toBe(EventType.RUN_STARTED);
    expect(result[5].type).toBe(EventType.RUN_FINISHED);
    expect(result[6].type).toBe(EventType.RUN_STARTED);
    expect(result[11].type).toBe(EventType.RUN_FINISHED);
  });
});
