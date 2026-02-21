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

describe("verifyEvents lifecycle", () => {
  // Test: RUN_STARTED must be the first event
  it("should require RUN_STARTED as the first event", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "1",
    } as TextMessageStartEvent);
    channel.close();

    try {
      await collectAsync(verifyEvents(false)(channel));
      expect.unreachable("Expected error was not thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AGUIError);
      expect((err as Error).message).toContain("First event must be 'RUN_STARTED'");
    }
  });

  // Test: Multiple RUN_STARTED events are not allowed
  it("should not allow multiple RUN_STARTED events", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
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

  // Test: No events should be allowed after RUN_FINISHED (except RUN_ERROR)
  it("should not allow events after RUN_FINISHED (except RUN_ERROR)", async () => {
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
      type: EventType.TEXT_MESSAGE_END,
      messageId: "1",
    } as TextMessageEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.push({
      type: EventType.TEXT_MESSAGE_START,
      messageId: "2",
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
        "Cannot send event type 'TEXT_MESSAGE_START': The run has already finished with 'RUN_FINISHED'",
      );
    }

    expect(events.length).toBe(4);
    expect(events[0].type).toBe(EventType.RUN_STARTED);
    expect(events[3].type).toBe(EventType.RUN_FINISHED);
  });

  // Test: RUN_ERROR is allowed after RUN_FINISHED
  it("should allow RUN_ERROR after RUN_FINISHED", async () => {
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
      type: EventType.TEXT_MESSAGE_END,
      messageId: "1",
    } as TextMessageEndEvent);
    channel.push({ type: EventType.RUN_FINISHED } as RunFinishedEvent);
    channel.push({
      type: EventType.RUN_ERROR,
      message: "Test error",
    } as RunErrorEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(5);
    expect(result[4].type).toBe(EventType.RUN_ERROR);
  });

  // Test: RUN_ERROR can happen at any time (even as the first event)
  it("should allow RUN_ERROR at any time (even as first event)", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_ERROR,
      message: "Test error",
    } as RunErrorEvent);
    channel.close();

    const result = await collectAsync(verifyEvents(false)(channel));

    expect(result.length).toBe(1);
    expect(result[0].type).toBe(EventType.RUN_ERROR);
  });

  // Test: No events should be allowed after RUN_ERROR
  it("should not allow any events after RUN_ERROR", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.RUN_ERROR,
      message: "Test error",
    } as RunErrorEvent);
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
      expect((err as Error).message).toContain(
        "Cannot send event type 'TEXT_MESSAGE_START': The run has already errored with 'RUN_ERROR'. No further events can be sent.",
      );
    }

    expect(events.length).toBe(2);
    expect(events[0].type).toBe(EventType.RUN_STARTED);
    expect(events[1].type).toBe(EventType.RUN_ERROR);
  });

  // Test: Valid sequence of events is allowed
  it("should allow a valid sequence of events", async () => {
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
      type: EventType.TEXT_MESSAGE_END,
      messageId: "1",
    } as TextMessageEndEvent);
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

    expect(result.length).toBe(8);
    expect(result[0].type).toBe(EventType.RUN_STARTED);
    expect(result[7].type).toBe(EventType.RUN_FINISHED);
  });
});
