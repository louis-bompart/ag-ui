import { AbstractAgent } from "@/agent";
import { FunctionMiddleware, MiddlewareFunction } from "@/middleware";
import { BaseEvent, EventType, RunAgentInput } from "@ag-ui/core";
import { collectAsync } from "@/async-utils";

describe("FunctionMiddleware", () => {
  class TestAgent extends AbstractAgent {
    async *run(input: RunAgentInput): AsyncIterable<BaseEvent> {
      yield {
        type: EventType.RUN_STARTED,
        threadId: input.threadId,
        runId: input.runId,
      };

      yield {
        type: EventType.RUN_FINISHED,
        threadId: input.threadId,
        runId: input.runId,
      };
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

  it("should allow function-based middleware to intercept events", async () => {
    const agent = new TestAgent();

    const middlewareFn: MiddlewareFunction = async function* (middlewareInput, next) {
      for await (const event of next.run(middlewareInput)) {
        if (event.type === EventType.RUN_STARTED) {
          yield {
            ...event,
            metadata: { ...(event as any).metadata, fromMiddleware: true },
          };
          continue;
        }

        if (event.type === EventType.RUN_FINISHED) {
          yield {
            ...event,
            result: { success: true },
          };
          continue;
        }

        yield event;
      }
    };

    const middleware = new FunctionMiddleware(middlewareFn);

    const events = await collectAsync(middleware.run(input, agent));

    expect(events.length).toBe(2);
    expect(events[0].type).toBe(EventType.RUN_STARTED);
    expect((events[0] as any).metadata).toEqual({ fromMiddleware: true });
    expect(events[1].type).toBe(EventType.RUN_FINISHED);
    expect((events[1] as any).result).toEqual({ success: true });
  });
});
