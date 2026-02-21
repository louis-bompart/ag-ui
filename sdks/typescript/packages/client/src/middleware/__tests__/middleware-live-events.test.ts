import { AbstractAgent } from "@/agent";
import { Middleware } from "@/middleware";
import {
  BaseEvent,
  EventType,
  RunAgentInput,
  TextMessageChunkEvent,
  RunFinishedEvent,
  RunStartedEvent,
} from "@ag-ui/core";
import { collectAsync } from "@/async-utils";

describe("Middleware live events", () => {
  class LiveEventAgent extends AbstractAgent {
    async *run(input: RunAgentInput): AsyncIterable<BaseEvent> {
      yield {
        type: EventType.RUN_STARTED,
        threadId: input.threadId,
        runId: input.runId,
      } as RunStartedEvent;

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

  class CustomMiddleware extends Middleware {
    async *run(input: RunAgentInput, next: AbstractAgent): AsyncIterable<BaseEvent> {
      for await (const event of next.run(input)) {
        if (event.type === EventType.RUN_STARTED) {
          const started = event as RunStartedEvent;
          yield {
            ...started,
            metadata: {
              ...(started.metadata ?? {}),
              custom: true,
            },
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

  it("should allow middleware to emit events before the agent", async () => {
    const agent = new LiveEventAgent();
    const middleware = new CustomMiddleware();

    const events = await collectAsync(middleware.run(input, agent));

    expect(events.length).toBe(3);
    expect(events[0].type).toBe(EventType.RUN_STARTED);
    expect((events[0] as RunStartedEvent).metadata).toEqual({ custom: true });
    expect(events[1].type).toBe(EventType.TEXT_MESSAGE_CHUNK);
    expect(events[2].type).toBe(EventType.RUN_FINISHED);
  });
});
