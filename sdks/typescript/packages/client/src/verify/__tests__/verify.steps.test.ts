import { AsyncChannel, collectAsync } from "@/async-utils";
import { verifyEvents } from "../verify";
import {
  BaseEvent,
  EventType,
  AGUIError,
  RunStartedEvent,
  RunFinishedEvent,
  RunErrorEvent,
  StepStartedEvent,
  StepFinishedEvent,
} from "@ag-ui/core";

describe("verifyEvents steps", () => {
  // Test: STEP_FINISHED must have matching name with STEP_STARTED
  it("should ensure step end has the same name as step start", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.STEP_STARTED,
      stepName: "test-step",
    } as StepStartedEvent);
    channel.push({
      type: EventType.STEP_FINISHED,
      stepName: "different-name",
    } as StepFinishedEvent);
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
        `Cannot send 'STEP_FINISHED' for step "different-name" that was not started`,
      );
    }

    expect(events.length).toBe(2);
    expect(events[1].type).toBe(EventType.STEP_STARTED);
  });

  // Test: Cannot end a step that wasn't started
  it("should not allow ending a step that wasn't started", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.STEP_FINISHED,
      stepName: "test-step",
    } as StepFinishedEvent);
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
        `Cannot send 'STEP_FINISHED' for step "test-step" that was not started`,
      );
    }

    expect(events.length).toBe(1);
    expect(events[0].type).toBe(EventType.RUN_STARTED);
  });

  // Test: Cannot start a step with a name that's already active
  it("should not allow starting a step with a name that's already active", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    channel.push({
      type: EventType.RUN_STARTED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunStartedEvent);
    channel.push({
      type: EventType.STEP_STARTED,
      stepName: "test-step",
    } as StepStartedEvent);
    channel.push({
      type: EventType.STEP_STARTED,
      stepName: "test-step",
    } as StepStartedEvent);
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
        `Step "test-step" is already active for 'STEP_STARTED'`,
      );
    }

    expect(events.length).toBe(2);
    expect(events[1].type).toBe(EventType.STEP_STARTED);
  });

  // Test: All steps must be ended before RUN_FINISHED
  it("should require all steps to be ended before run ends", async () => {
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
      type: EventType.STEP_FINISHED,
      stepName: "step1",
    } as StepFinishedEvent);
    channel.push({
      type: EventType.STEP_STARTED,
      stepName: "step2",
    } as StepStartedEvent);
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
        `Cannot send 'RUN_FINISHED' while steps are still active`,
      );
    }

    expect(events.length).toBe(4);
    expect(events[3].type).toBe(EventType.STEP_STARTED);
  });

  // Test: Valid sequence with properly nested steps
  it("should allow properly nested steps", async () => {
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
      type: EventType.STEP_FINISHED,
      stepName: "step1",
    } as StepFinishedEvent);
    channel.push({
      type: EventType.RUN_FINISHED,
      threadId: "test-thread-id",
      runId: "test-run-id",
    } as RunFinishedEvent);
    channel.close();

    const events = await collectAsync(verifyEvents(false)(channel));

    expect(events.length).toBe(4);
    expect(events[0].type).toBe(EventType.RUN_STARTED);
    expect(events[1].type).toBe(EventType.STEP_STARTED);
    expect(events[2].type).toBe(EventType.STEP_FINISHED);
    expect(events[3].type).toBe(EventType.RUN_FINISHED);
  });
});
