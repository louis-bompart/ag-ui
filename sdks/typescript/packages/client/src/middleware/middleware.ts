import { AbstractAgent } from "@/agent";
import { RunAgentInput, BaseEvent, Message } from "@ag-ui/core";
import { transformChunks } from "@/chunks";
import { defaultApplyEvents } from "@/apply";
import { structuredClone_ } from "@/utils";

export type MiddlewareFunction = (
  input: RunAgentInput,
  next: AbstractAgent,
) => AsyncIterable<BaseEvent>;

export interface EventWithState {
  event: BaseEvent;
  messages: Message[];
  state: any;
}

export abstract class Middleware {
  abstract run(input: RunAgentInput, next: AbstractAgent): AsyncIterable<BaseEvent>;

  /**
   * Runs the next agent in the chain with automatic chunk transformation.
   */
  protected runNext(input: RunAgentInput, next: AbstractAgent): AsyncIterable<BaseEvent> {
    return transformChunks(false)(next.run(input));
  }

  /**
   * Runs the next agent and tracks state, providing current messages and state with each event.
   * The messages and state represent the state AFTER the event has been applied.
   */
  protected async *runNextWithState(
    input: RunAgentInput,
    next: AbstractAgent,
  ): AsyncIterable<EventWithState> {
    let currentMessages = structuredClone_(input.messages || []);
    let currentState = structuredClone_(input.state || {});

    // Collect events and feed them through defaultApplyEvents one by one
    for await (const event of this.runNext(input, next)) {
      // Create a single-event iterable to feed to defaultApplyEvents
      const singleEvent = (async function* () { yield event; })();
      const mutations = defaultApplyEvents(input, singleEvent, next, []);

      for await (const mutation of mutations) {
        if (mutation.messages !== undefined) {
          currentMessages = mutation.messages;
        }
        if (mutation.state !== undefined) {
          currentState = mutation.state;
        }
      }

      yield {
        event,
        messages: structuredClone_(currentMessages),
        state: structuredClone_(currentState),
      };
    }
  }
}

// Wrapper class to convert a function into a Middleware instance
export class FunctionMiddleware extends Middleware {
  constructor(private fn: MiddlewareFunction) {
    super();
  }

  run(input: RunAgentInput, next: AbstractAgent): AsyncIterable<BaseEvent> {
    return this.fn(input, next);
  }
}
