import { AbstractAgent } from "@/agent";
import {
  Middleware,
  FunctionMiddleware,
  MiddlewareFunction,
  FilterToolCallsMiddleware,
} from "@/middleware";
import {
  BaseEvent,
  EventType,
  RunAgentInput,
  TextMessageChunkEvent,
  RunFinishedEvent,
  RunStartedEvent,
} from "@ag-ui/core";

/**
 * Example agent that emits a simple conversation flow.
 */
class ExampleAgent extends AbstractAgent {
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
      delta: "Hello! Let me calculate that for you.",
    } as TextMessageChunkEvent;

    yield {
      type: EventType.RUN_FINISHED,
      threadId: input.threadId,
      runId: input.runId,
      result: { answer: 42 },
    } as RunFinishedEvent;
  }
}

/**
 * Example middleware that logs events as they pass through.
 */
class LoggingMiddleware extends Middleware {
  async *run(input: RunAgentInput, next: AbstractAgent): AsyncIterable<BaseEvent> {
    console.log("Middleware input:", input);

    yield* next.run(input);
  }
}

/**
 * Example function-based middleware that modifies the result.
 */
const resultEnhancer: MiddlewareFunction = async function* (input, next) {
  for await (const event of next.run(input)) {
    if (event.type === EventType.RUN_FINISHED) {
      yield {
        ...event,
        result: {
          ...(event as RunFinishedEvent).result,
          enhanced: true,
        },
      };
    } else {
      yield event;
    }
  }
};

const input: RunAgentInput = {
  threadId: "example-thread",
  runId: "example-run",
  tools: [],
  context: [],
  forwardedProps: {},
  state: {},
  messages: [],
};

/**
 * Example usage demonstrating middleware chaining.
 */
async function runExample() {
  const agent = new ExampleAgent();

  // Function-based middleware
  agent.use(new FunctionMiddleware(resultEnhancer));

  // Class-based middleware
  agent.use(new LoggingMiddleware());

  // Built-in middleware to filter tool calls
  agent.use(new FilterToolCallsMiddleware({ disallowedToolCalls: ["calculator"] }));

  const events: BaseEvent[] = [];
  await new Promise<void>((resolve, reject) => {
    agent.runAgent({}, {
      onRunFinalized: ({ messages }) => {
        console.log("Final messages:", messages);
      },
      onRunFinishedEvent: ({ result }) => {
        console.log("Run finished result:", result);
      },
    }).then(({ newMessages, result }) => {
      console.log("New messages:", newMessages);
      console.log("Final result:", result);
      resolve();
    }).catch(reject);
  });

  return events;
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
runExample();
