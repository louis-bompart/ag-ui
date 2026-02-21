import { AbstractAgent } from "@/agent";
import { defaultApplyEvents } from "../default";
import { EventType, Message, StateDeltaEvent } from "@ag-ui/core";
import { ofAsync, collectAsync } from "@/async-utils";
import { AgentStateMutation } from "@/agent/subscriber";
import { describe, it, expect, vi } from "vitest";

const createAgent = (messages: Message[] = []) =>
  ({
    messages: messages.map((message) => ({ ...message })),
    state: {},
  }) as unknown as AbstractAgent;

describe("defaultApplyEvents - State Patching", () => {
  it("should apply state delta patch correctly", async () => {
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

    const stateDelta: StateDeltaEvent = {
      type: EventType.STATE_DELTA,
      delta: [
        { op: "replace", path: "/count", value: 1 },
        { op: "replace", path: "/text", value: "world" },
      ],
    };

    const events = ofAsync(stateDelta);

    const agent = createAgent(initialState.messages as Message[]);
    const result$ = defaultApplyEvents(initialState, events, agent, []);

    const stateUpdates = await collectAsync(result$);

    expect(stateUpdates.length).toBe(1);
    expect(stateUpdates[0].state).toEqual({
      count: 1,
      text: "world",
    });
  });

  it("should handle nested state updates", async () => {
    const initialState = {
      messages: [],
      state: {
        user: {
          name: "John",
          settings: {
            theme: "light",
          },
        },
      },
      threadId: "test-thread",
      runId: "test-run",
      tools: [],
      context: [],
    };

    const stateDelta: StateDeltaEvent = {
      type: EventType.STATE_DELTA,
      delta: [{ op: "replace", path: "/user/settings/theme", value: "dark" }],
    };

    const events = ofAsync(stateDelta);
    const agent = createAgent((initialState as any).messages as Message[]);
    const result$ = defaultApplyEvents(initialState as any, events, agent, []);

    const stateUpdates = await collectAsync(result$);

    expect(stateUpdates.length).toBe(1);
    expect(stateUpdates[0].state).toEqual({
      user: {
        name: "John",
        settings: {
          theme: "dark",
        },
      },
    });
  });

  it("should handle array updates", async () => {
    const initialState = {
      messages: [],
      state: {
        items: ["a", "b", "c"],
      },
      threadId: "test-thread",
      runId: "test-run",
      tools: [],
      context: [],
    };

    const stateDelta: StateDeltaEvent = {
      type: EventType.STATE_DELTA,
      delta: [
        { op: "add", path: "/items/-", value: "d" },
        { op: "replace", path: "/items/0", value: "x" },
      ],
    };

    const events = ofAsync(stateDelta);
    const agent = createAgent((initialState as any).messages as Message[]);
    const result$ = defaultApplyEvents(initialState as any, events, agent, []);

    const stateUpdates = await collectAsync(result$);

    expect(stateUpdates.length).toBe(1);
    expect(stateUpdates[0].state).toEqual({
      items: ["x", "b", "c", "d"],
    });
  });

  it("should handle multiple patches in sequence", async () => {
    const initialState = {
      messages: [],
      state: {
        counter: 0,
      },
      threadId: "test-thread",
      runId: "test-run",
      tools: [],
      context: [],
    };

    const stateDeltas: StateDeltaEvent[] = [
      {
        type: EventType.STATE_DELTA,
        delta: [{ op: "replace", path: "/counter", value: 1 }],
      },
      {
        type: EventType.STATE_DELTA,
        delta: [{ op: "replace", path: "/counter", value: 2 }],
      },
    ];

    const events = ofAsync(...stateDeltas);
    const agent = createAgent((initialState as any).messages as Message[]);
    const result$ = defaultApplyEvents(initialState as any, events, agent, []);

    const stateUpdates = await collectAsync(result$);

    expect(stateUpdates.length).toBe(2);
    expect(stateUpdates[1].state).toEqual({
      counter: 2,
    });
  });

  it("should handle invalid patch operations gracefully", async () => {
    // Suppress console.warn for this test
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

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

    // Invalid patch: trying to replace a non-existent path
    const stateDelta: StateDeltaEvent = {
      type: EventType.STATE_DELTA,
      delta: [{ op: "replace", path: "/nonexistent", value: 1 }],
    };

    const events = ofAsync(stateDelta);
    const agent = createAgent((initialState as any).messages as Message[]);
    const result$ = defaultApplyEvents(initialState as any, events, agent, []);

    const stateUpdates = await collectAsync(result$);

    // When patch fails, no updates should be emitted
    expect(stateUpdates.length).toBe(0);

    consoleWarnSpy.mockRestore();
  });
});
