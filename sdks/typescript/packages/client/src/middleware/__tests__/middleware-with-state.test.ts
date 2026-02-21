import { AbstractAgent } from "@/agent";
import { Middleware } from "@/middleware";
import {
  BaseEvent,
  EventType,
  RunAgentInput,
  RunFinishedEvent,
  TextMessageChunkEvent,
} from "@ag-ui/core";
import { collectAsync } from "@/async-utils";

describe("Middleware runNextWithState", () => {
  class StatefulAgent extends AbstractAgent {
    async *run(input: RunAgentInput): AsyncIterable<BaseEvent> {
      yield {
        type: EventType.RUN_STARTED,
        threadId: input.threadId,
        runId: input.runId,
      };

      yield {
        type: EventType.TEXT_MESSAGE_CHUNK,
        messageId: "message-1",
        role: "assistant",
        delta: "Hello",
      } as TextMessageChunkEvent;

      yield {
        type: EventType.RUN_FINISHED,
        threadId: input.threadId,
        runId: input.runId,
        result: { success: true },
      } as RunFinishedEvent;
    }
  }

  class StateTrackingMiddleware extends Middleware {
    async *run(input: RunAgentInput, next: AbstractAgent): AsyncIterable<BaseEvent> {
      for await (const { event } of this.runNextWithState(input, next)) {
        yield event;
      }
    }
  }

  const input: RunAgentInput = {
    threadId: "test-thread",
    runId: "test-run",
    tools: [],
    context: [],
    forwardedProps: {},
    state: {},
    messages: [],
  };

  it("should capture state changes after each event", async () => {
    const agent = new StatefulAgent();
    const middleware = new StateTrackingMiddleware();

    const events = await collectAsync(middleware.run(input, agent));

    expect(events.length).toBe(5);
    expect(events[0].type).toBe(EventType.RUN_STARTED);
    expect(events[1].type).toBe(EventType.TEXT_MESSAGE_START);
    expect(events[2].type).toBe(EventType.TEXT_MESSAGE_CONTENT);
    expect(events[3].type).toBe(EventType.TEXT_MESSAGE_END);
    expect(events[4].type).toBe(EventType.RUN_FINISHED);
  });
});
