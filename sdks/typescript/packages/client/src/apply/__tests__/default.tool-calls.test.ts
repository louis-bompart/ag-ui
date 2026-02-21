import { AsyncChannel, collectAsync } from "@/async-utils";
import {
  AssistantMessage,
  BaseEvent,
  EventType,
  Message,
  RunAgentInput,
  RunStartedEvent,
  ToolCallArgsEvent,
  ToolCallEndEvent,
  ToolCallStartEvent,
} from "@ag-ui/core";
import { defaultApplyEvents } from "../default";
import { AbstractAgent } from "@/agent";

const createAgent = (messages: Message[] = []) =>
  ({
    messages: messages.map((message) => ({ ...message })),
    state: {},
  } as unknown as AbstractAgent);

describe("defaultApplyEvents with tool calls", () => {
  it("should handle a single tool call correctly", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    const initialState = {
      messages: [],
      state: {
        count: 0,
        text: "hello",
      },
      threadId: "test-thread",
      runId: "test-run",
      tools: [],
      context: [],
    };

    const agent = createAgent(initialState.messages);
    const result$ = defaultApplyEvents(initialState, channel, agent, []);

    const stateUpdatesPromise = collectAsync(result$);

    // Send events
    channel.push({ type: EventType.RUN_STARTED } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "tool1",
      toolCallName: "search",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "tool1",
      delta: '{"query": "',
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "tool1",
      delta: "test search",
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "tool1",
      delta: '"}',
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "tool1",
    } as ToolCallEndEvent);

    channel.close();

    const stateUpdates = await stateUpdatesPromise;

    // We should have exactly 4 state updates:
    // 1. After TOOL_CALL_START
    // 2-4. After each TOOL_CALL_ARGS
    // And NO update after TOOL_CALL_END
    expect(stateUpdates.length).toBe(4);

    // First update: tool call created
    expect(stateUpdates[0].messages?.length).toBe(1);
    expect((stateUpdates[0].messages?.[0] as AssistantMessage).toolCalls?.length).toBe(1);
    expect((stateUpdates[0].messages?.[0] as AssistantMessage).toolCalls?.[0]?.id).toBe("tool1");
    expect((stateUpdates[0].messages?.[0] as AssistantMessage).toolCalls?.[0]?.function?.name).toBe(
      "search",
    );
    expect(
      (stateUpdates[0].messages?.[0] as AssistantMessage).toolCalls?.[0]?.function?.arguments,
    ).toBe("");

    // Second update: first args chunk added
    expect(
      (stateUpdates[1].messages?.[0] as AssistantMessage).toolCalls?.[0]?.function?.arguments,
    ).toBe('{"query": "');

    // Third update: second args chunk appended
    expect(
      (stateUpdates[2].messages?.[0] as AssistantMessage).toolCalls?.[0]?.function?.arguments,
    ).toBe('{"query": "test search');

    // Fourth update: third args chunk appended
    expect(
      (stateUpdates[3].messages?.[0] as AssistantMessage).toolCalls?.[0]?.function?.arguments,
    ).toBe('{"query": "test search"}');
  });

  it("should handle multiple tool calls correctly", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    const initialState: RunAgentInput = {
      messages: [],
      state: {},
      threadId: "test-thread",
      runId: "test-run",
      tools: [],
      context: [],
    };

    const agent = createAgent(initialState.messages);
    const result$ = defaultApplyEvents(initialState, channel, agent, []);

    const stateUpdatesPromise = collectAsync(result$);

    // Send events for two different tool calls
    channel.push({ type: EventType.RUN_STARTED } as RunStartedEvent);

    // First tool call
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

    // Second tool call
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "tool2",
      toolCallName: "calculate",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "tool2",
      delta: '{"expression":"1+1"}',
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "tool2",
    } as ToolCallEndEvent);

    channel.close();

    const stateUpdates = await stateUpdatesPromise;

    // We should have exactly 4 state updates:
    // 1. After first TOOL_CALL_START
    // 2. After first TOOL_CALL_ARGS
    // 3. After second TOOL_CALL_START
    // 4. After second TOOL_CALL_ARGS
    expect(stateUpdates.length).toBe(4);

    // Check last state update for the correct tool calls
    const finalState = stateUpdates[stateUpdates.length - 1];
    expect(finalState.messages?.length).toBe(2);

    // First message should have first tool call
    expect((finalState.messages?.[0] as AssistantMessage).toolCalls?.length).toBe(1);
    expect((finalState.messages?.[0] as AssistantMessage).toolCalls?.[0]?.id).toBe("tool1");
    expect((finalState.messages?.[0] as AssistantMessage).toolCalls?.[0]?.function?.name).toBe(
      "search",
    );
    expect((finalState.messages?.[0] as AssistantMessage).toolCalls?.[0]?.function?.arguments).toBe(
      '{"query":"test"}',
    );

    // Second message should have second tool call
    expect((finalState.messages?.[1] as AssistantMessage).toolCalls?.length).toBe(1);
    expect((finalState.messages?.[1] as AssistantMessage).toolCalls?.[0]?.id).toBe("tool2");
    expect((finalState.messages?.[1] as AssistantMessage).toolCalls?.[0]?.function?.name).toBe(
      "calculate",
    );
    expect((finalState.messages?.[1] as AssistantMessage).toolCalls?.[0]?.function?.arguments).toBe(
      '{"expression":"1+1"}',
    );
  });

  it("should handle tool calls with parent message ID correctly", async () => {
    const channel = new AsyncChannel<BaseEvent>();

    // Create initial state with an existing message
    const parentMessageId = "existing_message";
    const initialState: RunAgentInput = {
      messages: [
        {
          id: parentMessageId,
          role: "assistant",
          content: "I'll help you with that.",
          toolCalls: [],
        },
      ],
      state: {},
      threadId: "test-thread",
      runId: "test-run",
      tools: [],
      context: [],
    };

    const agent = createAgent(initialState.messages as Message[]);
    const result$ = defaultApplyEvents(initialState, channel, agent, []);

    const stateUpdatesPromise = collectAsync(result$);

    // Send events
    channel.push({ type: EventType.RUN_STARTED } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "tool1",
      toolCallName: "search",
      parentMessageId: parentMessageId,
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

    channel.close();

    const stateUpdates = await stateUpdatesPromise;

    // We should have exactly 2 state updates
    expect(stateUpdates.length).toBe(2);

    // Check that the tool call was added to the existing message
    const finalState = stateUpdates[stateUpdates.length - 1];
    expect(finalState.messages?.length).toBe(1);
    expect(finalState.messages?.[0]?.id).toBe(parentMessageId);
    expect(finalState.messages?.[0]?.content).toBe("I'll help you with that.");
    expect((finalState.messages?.[0] as AssistantMessage).toolCalls?.length).toBe(1);
    expect((finalState.messages?.[0] as AssistantMessage).toolCalls?.[0]?.id).toBe("tool1");
    expect((finalState.messages?.[0] as AssistantMessage).toolCalls?.[0]?.function?.name).toBe(
      "search",
    );
    expect((finalState.messages?.[0] as AssistantMessage).toolCalls?.[0]?.function?.arguments).toBe(
      '{"query":"test"}',
    );
  });

  it("should handle errors and partial updates correctly", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    const initialState: RunAgentInput = {
      messages: [],
      state: {},
      threadId: "test-thread",
      runId: "test-run",
      tools: [],
      context: [],
    };

    const agent = createAgent(initialState.messages);
    const result$ = defaultApplyEvents(initialState, channel, agent, []);

    const stateUpdatesPromise = collectAsync(result$);

    // Send events with errors in the tool args JSON
    channel.push({ type: EventType.RUN_STARTED } as RunStartedEvent);
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "tool1",
      toolCallName: "search",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "tool1",
      delta: '{"query',
    } as ToolCallArgsEvent); // Incomplete JSON
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "tool1",
      delta: ':"test"}',
    } as ToolCallArgsEvent); // Completes the JSON
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "tool1",
    } as ToolCallEndEvent);

    channel.close();

    const stateUpdates = await stateUpdatesPromise;

    // We should still have updates despite the JSON syntax error
    expect(stateUpdates.length).toBe(3);

    // Check the final JSON (should be valid now)
    const finalState = stateUpdates[stateUpdates.length - 1];
    expect((finalState.messages?.[0] as AssistantMessage).toolCalls?.[0]?.function?.arguments).toBe(
      '{"query:"test"}',
    );
  });

  it("should handle advanced scenarios with multiple tools and text messages", async () => {
    const channel = new AsyncChannel<BaseEvent>();
    const initialState: RunAgentInput = {
      messages: [],
      state: {},
      threadId: "test-thread",
      runId: "test-run",
      tools: [],
      context: [],
    };

    const agent = createAgent(initialState.messages);
    const result$ = defaultApplyEvents(initialState, channel, agent, []);

    const stateUpdatesPromise = collectAsync(result$);

    // Send events with a mix of tool calls and text messages
    channel.push({ type: EventType.RUN_STARTED } as RunStartedEvent);

    // First tool call
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

    // Second tool call
    channel.push({
      type: EventType.TOOL_CALL_START,
      toolCallId: "tool2",
      toolCallName: "calculate",
    } as ToolCallStartEvent);
    channel.push({
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: "tool2",
      delta: '{"expression":"1+1"}',
    } as ToolCallArgsEvent);
    channel.push({
      type: EventType.TOOL_CALL_END,
      toolCallId: "tool2",
    } as ToolCallEndEvent);

    channel.close();

    const stateUpdates = await stateUpdatesPromise;

    // Check for expected state updates
    expect(stateUpdates.length).toBe(4);

    // Check the final state for both tool calls
    const finalState = stateUpdates[stateUpdates.length - 1];
    expect(finalState.messages?.length).toBe(2);

    // Verify first tool call
    expect((finalState.messages?.[0] as AssistantMessage).toolCalls?.length).toBe(1);
    expect((finalState.messages?.[0] as AssistantMessage).toolCalls?.[0]?.id).toBe("tool1");
    expect((finalState.messages?.[0] as AssistantMessage).toolCalls?.[0]?.function?.name).toBe(
      "search",
    );

    // Verify second tool call
    expect((finalState.messages?.[1] as AssistantMessage).toolCalls?.length).toBe(1);
    expect((finalState.messages?.[1] as AssistantMessage).toolCalls?.[0]?.id).toBe("tool2");
    expect((finalState.messages?.[1] as AssistantMessage).toolCalls?.[0]?.function?.name).toBe(
      "calculate",
    );
  });
});
