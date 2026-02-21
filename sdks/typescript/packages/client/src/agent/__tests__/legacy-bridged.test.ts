import { AbstractAgent } from "../agent";
import {
  BaseEvent,
  EventType,
  RunAgentInput,
  TextMessageStartEvent,
  TextMessageContentEvent,
  TextMessageEndEvent,
  RunStartedEvent,
  RunFinishedEvent,
  ToolCallStartEvent,
  ToolCallArgsEvent,
  ToolCallEndEvent,
  StateSnapshotEvent,
  StepStartedEvent,
  StepFinishedEvent,
} from "@ag-ui/core";
import { LegacyRuntimeProtocolEvent } from "@/legacy/types";
import { collectAsync } from "@/async-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock uuid module
vi.mock("uuid", () => ({
  v4: vi.fn().mockReturnValue("mock-uuid"),
}));

// Test agent that emits basic text message events
class TestAgent extends AbstractAgent {
  async *run(input: RunAgentInput): AsyncIterable<BaseEvent> {
    yield {
      type: EventType.RUN_STARTED,
      threadId: input.threadId,
      runId: input.runId,
    } as RunStartedEvent;

    yield {
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg-1",
      role: "assistant",
    } as TextMessageStartEvent;

    yield {
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "msg-1",
      delta: "Hello, ",
    } as TextMessageContentEvent;

    yield {
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "msg-1",
      delta: "world!",
    } as TextMessageContentEvent;

    yield {
      type: EventType.TEXT_MESSAGE_END,
      messageId: "msg-1",
    } as TextMessageEndEvent;

    yield {
      type: EventType.RUN_FINISHED,
      threadId: input.threadId,
      runId: input.runId,
    } as RunFinishedEvent;
  }
}

// Test agent that emits chunked content
class ChunkTestAgent extends AbstractAgent {
  async *run(input: RunAgentInput): AsyncIterable<BaseEvent> {
    yield {
      type: EventType.RUN_STARTED,
      threadId: input.threadId,
      runId: input.runId,
    } as RunStartedEvent;

    yield {
      type: EventType.STEP_STARTED,
      stepName: "step-1",
    } as StepStartedEvent;

    yield {
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg-1",
      role: "assistant",
    } as TextMessageStartEvent;

    yield {
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "msg-1",
      delta: "chunk1 ",
    } as TextMessageContentEvent;

    yield {
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "msg-1",
      delta: "chunk2",
    } as TextMessageContentEvent;

    yield {
      type: EventType.TEXT_MESSAGE_END,
      messageId: "msg-1",
    } as TextMessageEndEvent;

    yield {
      type: EventType.STEP_FINISHED,
      stepName: "step-1",
    } as StepFinishedEvent;

    yield {
      type: EventType.RUN_FINISHED,
      threadId: input.threadId,
      runId: input.runId,
    } as RunFinishedEvent;
  }
}

// Test agent that emits tool call events
class ToolCallTestAgent extends AbstractAgent {
  async *run(input: RunAgentInput): AsyncIterable<BaseEvent> {
    yield {
      type: EventType.RUN_STARTED,
      threadId: input.threadId,
      runId: input.runId,
    } as RunStartedEvent;

    yield {
      type: EventType.TOOL_CALL_START,
      toolCallId: "tc-1",
      toolCallName: "search",
    } as ToolCallStartEvent;

    yield {
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "tc-1",
      delta: '{"query": "test"}',
    } as ToolCallArgsEvent;

    yield {
      type: EventType.TOOL_CALL_END,
      toolCallId: "tc-1",
    } as ToolCallEndEvent;

    yield {
      type: EventType.RUN_FINISHED,
      threadId: input.threadId,
      runId: input.runId,
    } as RunFinishedEvent;
  }
}

describe("legacy_to_be_removed_runAgentBridged", () => {
  it("should convert basic text message events to legacy protocol", async () => {
    const agent = new TestAgent({
      threadId: "test-thread",
    });

    const legacyEvents = await collectAsync(
      agent.legacy_to_be_removed_runAgentBridged(),
    ) as LegacyRuntimeProtocolEvent[];

    expect(legacyEvents.length).toBeGreaterThan(0);

    // Should have text start events
    const textStartEvents = legacyEvents.filter(
      (e) => e.type === "TextMessageStart",
    );
    expect(textStartEvents.length).toBeGreaterThan(0);

    // Should have text delta events
    const textDeltaEvents = legacyEvents.filter(
      (e) => e.type === "TextMessageContent",
    );
    expect(textDeltaEvents.length).toBeGreaterThan(0);
  });

  it("should convert chunked text events to legacy protocol", async () => {
    const agent = new ChunkTestAgent({
      threadId: "test-thread",
    });

    const legacyEvents = await collectAsync(
      agent.legacy_to_be_removed_runAgentBridged(),
    ) as LegacyRuntimeProtocolEvent[];

    expect(legacyEvents.length).toBeGreaterThan(0);

    // Should have text message events from chunks
    const textStartEvents = legacyEvents.filter(
      (e) => e.type === "TextMessageStart",
    );
    expect(textStartEvents.length).toBeGreaterThan(0);
  });

  it("should convert tool call events to legacy protocol", async () => {
    const agent = new ToolCallTestAgent({
      threadId: "test-thread",
    });

    const legacyEvents = await collectAsync(
      agent.legacy_to_be_removed_runAgentBridged(),
    ) as LegacyRuntimeProtocolEvent[];

    expect(legacyEvents.length).toBeGreaterThan(0);

    // Should have ActionExecutionStart events for tool calls
    const actionEvents = legacyEvents.filter(
      (e) => e.type === "ActionExecutionStart",
    );
    expect(actionEvents.length).toBeGreaterThan(0);
  });

  it("should handle state snapshot events in legacy bridge", async () => {
    class StateSnapshotAgent extends AbstractAgent {
      async *run(input: RunAgentInput): AsyncIterable<BaseEvent> {
        yield {
          type: EventType.RUN_STARTED,
          threadId: input.threadId,
          runId: input.runId,
        } as RunStartedEvent;

        yield {
          type: EventType.STATE_SNAPSHOT,
          snapshot: { counter: 42, name: "test" },
        } as StateSnapshotEvent;

        yield {
          type: EventType.RUN_FINISHED,
          threadId: input.threadId,
          runId: input.runId,
        } as RunFinishedEvent;
      }
    }

    const agent = new StateSnapshotAgent({
      threadId: "test-thread",
    });

    const legacyEvents = await collectAsync(
      agent.legacy_to_be_removed_runAgentBridged(),
    ) as LegacyRuntimeProtocolEvent[];

    expect(legacyEvents.length).toBeGreaterThan(0);

    // Should have AgentStateMessage events for state snapshots
    const stateEvents = legacyEvents.filter(
      (e) => e.type === "AgentStateMessage",
    );
    expect(stateEvents.length).toBeGreaterThan(0);
  });

  it("should pass debug option through legacy bridge", async () => {
    const agent = new TestAgent({
      threadId: "test-thread",
    });
    agent.debug = true;

    const consoleSpy = vi.spyOn(console, "debug").mockImplementation();

    const legacyEvents = await collectAsync(
      agent.legacy_to_be_removed_runAgentBridged(),
    ) as LegacyRuntimeProtocolEvent[];

    expect(legacyEvents.length).toBeGreaterThan(0);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
