import { AbstractAgent } from "@/agent";
import { Middleware } from "@/middleware";
import { BaseEvent, EventType, RunAgentInput } from "@ag-ui/core";
import { collectAsync } from "@/async-utils";

describe("Middleware", () => {
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
        result: { success: true },
      };
    }
  }

  class TestMiddleware extends Middleware {
    async *run(input: RunAgentInput, next: AbstractAgent): AsyncIterable<BaseEvent> {
      for await (const event of next.run(input)) {
        if (event.type === EventType.RUN_STARTED) {
          yield {
            ...event,
            metadata: { ...(event as any).metadata, middleware: true },
          };
          continue;
        }

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

  it("should allow middleware to modify the event stream", async () => {
    const agent = new TestAgent();
    const middleware = new TestMiddleware();

    const events = await collectAsync(middleware.run(input, agent));

    expect(events.length).toBe(2);
    expect(events[0].type).toBe(EventType.RUN_STARTED);
    expect((events[0] as any).metadata).toEqual({ middleware: true });
    expect(events[1].type).toBe(EventType.RUN_FINISHED);
    expect((events[1] as any).result).toEqual({ success: true });
  });
});
