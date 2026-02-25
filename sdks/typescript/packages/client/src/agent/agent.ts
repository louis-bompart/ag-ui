import { defaultApplyEvents } from "@/apply/default";
import { Message, State, RunAgentInput, BaseEvent } from "@ag-ui/core";

import { AgentConfig, RunAgentParameters } from "./types";
import { v4 as uuidv4 } from "uuid";
import { structuredClone_ } from "@/utils";
import { compareVersions } from "compare-versions";
import { verifyEvents } from "@/verify";
import { convertToLegacyEvents } from "@/legacy/convert";
import { LegacyRuntimeProtocolEvent } from "@/legacy/types";
import { transformChunks } from "@/chunks";
import { AgentStateMutation, AgentSubscriber, runSubscribersWithMutation } from "./subscriber";
import { AGUIConnectNotImplementedError } from "@ag-ui/core";
import {
  Middleware,
  MiddlewareFunction,
  FunctionMiddleware,
  BackwardCompatibility_0_0_39,
  BackwardCompatibility_0_0_45,
} from "@/middleware";
import packageJson from "../../package.json";

export interface RunAgentResult {
  result: any;
  newMessages: Message[];
}

export abstract class AbstractAgent {
  public agentId?: string;
  public description: string;
  public threadId: string;
  public messages: Message[];
  public state: State;
  public debug: boolean = false;
  public subscribers: AgentSubscriber[] = [];
  public isRunning: boolean = false;
  private middlewares: Middleware[] = [];
  // AbortController to immediately detach from the active run (stop processing its stream)
  private activeRunAbortController?: AbortController;
  private activeRunCompletionPromise?: Promise<void>;

  get maxVersion() {
    return packageJson.version;
  }

  constructor({
    agentId,
    description,
    threadId,
    initialMessages,
    initialState,
    debug,
  }: AgentConfig = {}) {
    this.agentId = agentId;
    this.description = description ?? "";
    this.threadId = threadId ?? uuidv4();
    this.messages = structuredClone_(initialMessages ?? []);
    this.state = structuredClone_(initialState ?? {});
    this.debug = debug ?? false;

    if (compareVersions(this.maxVersion, "0.0.39") <= 0) {
      this.middlewares.unshift(new BackwardCompatibility_0_0_39());
    }

    // Auto-insert BackwardCompatibility_0_0_45 for backward compatibility
    // with legacy THINKING events (deprecated, will be removed in 1.0.0)
    if (compareVersions(this.maxVersion, "0.0.45") <= 0) {
      this.middlewares.unshift(new BackwardCompatibility_0_0_45());
    }
  }

  public subscribe(subscriber: AgentSubscriber) {
    this.subscribers.push(subscriber);
    return {
      unsubscribe: () => {
        this.subscribers = this.subscribers.filter((s) => s !== subscriber);
      },
    };
  }

  abstract run(input: RunAgentInput): AsyncIterable<BaseEvent>;

  public use(...middlewares: (Middleware | MiddlewareFunction)[]): this {
    const normalizedMiddlewares = middlewares.map((middleware) =>
      typeof middleware === "function" ? new FunctionMiddleware(middleware) : middleware,
    );
    this.middlewares.push(...normalizedMiddlewares);
    return this;
  }

  public async runAgent(
    parameters?: RunAgentParameters,
    subscriber?: AgentSubscriber,
  ): Promise<RunAgentResult> {
    try {
      this.isRunning = true;
      this.agentId = this.agentId ?? uuidv4();
      const input = this.prepareRunAgentInput(parameters);
      let result: any = undefined;
      const currentMessageIds = new Set(this.messages.map((message) => message.id));

      const subscribers: AgentSubscriber[] = [
        {
          onRunFinishedEvent: (params) => {
            result = params.result;
          },
        },
        ...this.subscribers,
        subscriber ?? {},
      ];

      await this.onInitialize(input, subscribers);

      // Per-run detachment signal + completion promise
      this.activeRunAbortController = new AbortController();
      let resolveActiveRunCompletion: (() => void) | undefined;
      this.activeRunCompletionPromise = new Promise<void>((resolve) => {
        resolveActiveRunCompletion = resolve;
      });

      try {
        // Build the source iterable (with middleware chain)
        const source = (() => {
          if (this.middlewares.length === 0) {
            return this.run(input);
          }

          const chainedAgent = this.middlewares.reduceRight(
            (nextAgent: AbstractAgent, middleware) =>
              ({
                run: (i: RunAgentInput) => middleware.run(i, nextAgent),
              }) as AbstractAgent,
            this, // Original agent is the final 'next'
          );

          return chainedAgent.run(input);
        })();

        // Build pipeline: source -> transformChunks -> verifyEvents -> takeUntilAborted -> apply -> processApplyEvents
        const chunked = transformChunks(this.debug)(source);
        const verified = verifyEvents(this.debug)(chunked);
        const abortable = takeUntilAborted(verified, this.activeRunAbortController.signal);
        const applied = this.apply(input, abortable, subscribers);
        const processed = this.processApplyEvents(input, applied, subscribers);

        // Drain the pipeline
        for await (const _ of processed) {
          // consume all events
        }
      } catch (error: any) {
        this.isRunning = false;
        await this.onError(input, error, subscribers);
      } finally {
        this.isRunning = false;
        await this.onFinalize(input, subscribers);
        resolveActiveRunCompletion?.();
        resolveActiveRunCompletion = undefined;
        this.activeRunCompletionPromise = undefined;
        this.activeRunAbortController = undefined;
      }

      const newMessages = structuredClone_(this.messages).filter(
        (message: Message) => !currentMessageIds.has(message.id),
      );
      return { result, newMessages };
    } finally {
      this.isRunning = false;
    }
  }

  protected connect(input: RunAgentInput): AsyncIterable<BaseEvent> {
    throw new AGUIConnectNotImplementedError();
  }

  public async connectAgent(
    parameters?: RunAgentParameters,
    subscriber?: AgentSubscriber,
  ): Promise<RunAgentResult> {
    try {
      this.isRunning = true;
      this.agentId = this.agentId ?? uuidv4();
      const input = this.prepareRunAgentInput(parameters);
      let result: any = undefined;
      const currentMessageIds = new Set(this.messages.map((message) => message.id));

      const subscribers: AgentSubscriber[] = [
        {
          onRunFinishedEvent: (params) => {
            result = params.result;
          },
        },
        ...this.subscribers,
        subscriber ?? {},
      ];

      await this.onInitialize(input, subscribers);

      // Per-run detachment signal + completion promise
      this.activeRunAbortController = new AbortController();
      let resolveActiveRunCompletion: (() => void) | undefined;
      this.activeRunCompletionPromise = new Promise<void>((resolve) => {
        resolveActiveRunCompletion = resolve;
      });

      try {
        const source = this.connect(input);

        // Build pipeline: source -> transformChunks -> verifyEvents -> takeUntilAborted -> apply -> processApplyEvents
        const chunked = transformChunks(this.debug)(source);
        const verified = verifyEvents(this.debug)(chunked);
        const abortable = takeUntilAborted(verified, this.activeRunAbortController.signal);
        const applied = this.apply(input, abortable, subscribers);
        const processed = this.processApplyEvents(input, applied, subscribers);

        // Drain the pipeline
        for await (const _ of processed) {
          // consume all events
        }
      } catch (error: any) {
        this.isRunning = false;
        if (!(error instanceof AGUIConnectNotImplementedError)) {
          await this.onError(input, error, subscribers);
        }
      } finally {
        this.isRunning = false;
        await this.onFinalize(input, subscribers);
        resolveActiveRunCompletion?.();
        resolveActiveRunCompletion = undefined;
        this.activeRunCompletionPromise = undefined;
        this.activeRunAbortController = undefined;
      }

      const newMessages = structuredClone_(this.messages).filter(
        (message: Message) => !currentMessageIds.has(message.id),
      );
      return { result, newMessages };
    } finally {
      this.isRunning = false;
    }
  }

  public abortRun() {}

  public async detachActiveRun(): Promise<void> {
    if (!this.activeRunAbortController) {
      return;
    }
    const completion = this.activeRunCompletionPromise ?? Promise.resolve();
    this.activeRunAbortController.abort();
    await completion;
  }

  protected apply(
    input: RunAgentInput,
    events: AsyncIterable<BaseEvent>,
    subscribers: AgentSubscriber[],
  ): AsyncIterable<AgentStateMutation> {
    return defaultApplyEvents(input, events, this, subscribers);
  }

  protected async *processApplyEvents(
    input: RunAgentInput,
    events: AsyncIterable<AgentStateMutation>,
    subscribers: AgentSubscriber[],
  ): AsyncIterable<AgentStateMutation> {
    for await (const event of events) {
      if (event.messages) {
        this.messages = event.messages;
        subscribers.forEach((subscriber) => {
          subscriber.onMessagesChanged?.({
            messages: this.messages,
            state: this.state,
            agent: this,
            input,
          });
        });
      }
      if (event.state) {
        this.state = event.state;
        subscribers.forEach((subscriber) => {
          subscriber.onStateChanged?.({
            state: this.state,
            messages: this.messages,
            agent: this,
            input,
          });
        });
      }
      yield event;
    }
  }

  protected prepareRunAgentInput(parameters?: RunAgentParameters): RunAgentInput {
    const clonedMessages = structuredClone_(this.messages) as Message[];
    const messagesWithoutActivity = clonedMessages.filter((message) => message.role !== "activity");

    return {
      threadId: this.threadId,
      runId: parameters?.runId || uuidv4(),
      tools: structuredClone_(parameters?.tools ?? []),
      context: structuredClone_(parameters?.context ?? []),
      forwardedProps: structuredClone_(parameters?.forwardedProps ?? {}),
      state: structuredClone_(this.state),
      messages: messagesWithoutActivity,
    };
  }

  protected async onInitialize(input: RunAgentInput, subscribers: AgentSubscriber[]) {
    const onRunInitializedMutation = await runSubscribersWithMutation(
      subscribers,
      this.messages,
      this.state,
      (subscriber, messages, state) =>
        subscriber.onRunInitialized?.({ messages, state, agent: this, input }),
    );
    if (
      onRunInitializedMutation.messages !== undefined ||
      onRunInitializedMutation.state !== undefined
    ) {
      if (onRunInitializedMutation.messages) {
        this.messages = onRunInitializedMutation.messages;
        input.messages = onRunInitializedMutation.messages;
        subscribers.forEach((subscriber) => {
          subscriber.onMessagesChanged?.({
            messages: this.messages,
            state: this.state,
            agent: this,
            input,
          });
        });
      }
      if (onRunInitializedMutation.state) {
        this.state = onRunInitializedMutation.state;
        input.state = onRunInitializedMutation.state;
        subscribers.forEach((subscriber) => {
          subscriber.onStateChanged?.({
            state: this.state,
            messages: this.messages,
            agent: this,
            input,
          });
        });
      }
    }
  }

  protected async onError(input: RunAgentInput, error: Error, subscribers: AgentSubscriber[]) {
    const onRunFailedMutation = await runSubscribersWithMutation(
      subscribers,
      this.messages,
      this.state,
      (subscriber, messages, state) =>
        subscriber.onRunFailed?.({ error, messages, state, agent: this, input }),
    );

    const mutation = onRunFailedMutation as AgentStateMutation;
    if (mutation.messages !== undefined || mutation.state !== undefined) {
      if (mutation.messages !== undefined) {
        this.messages = mutation.messages;
        subscribers.forEach((subscriber) => {
          subscriber.onMessagesChanged?.({
            messages: this.messages,
            state: this.state,
            agent: this,
            input,
          });
        });
      }
      if (mutation.state !== undefined) {
        this.state = mutation.state;
        subscribers.forEach((subscriber) => {
          subscriber.onStateChanged?.({
            state: this.state,
            messages: this.messages,
            agent: this,
            input,
          });
        });
      }
    }

    if (mutation.stopPropagation !== true) {
      console.error("Agent execution failed:", error);
      throw error;
    }
  }

  protected async onFinalize(input: RunAgentInput, subscribers: AgentSubscriber[]) {
    const onRunFinalizedMutation = await runSubscribersWithMutation(
      subscribers,
      this.messages,
      this.state,
      (subscriber, messages, state) =>
        subscriber.onRunFinalized?.({ messages, state, agent: this, input }),
    );

    if (
      onRunFinalizedMutation.messages !== undefined ||
      onRunFinalizedMutation.state !== undefined
    ) {
      if (onRunFinalizedMutation.messages !== undefined) {
        this.messages = onRunFinalizedMutation.messages;
        subscribers.forEach((subscriber) => {
          subscriber.onMessagesChanged?.({
            messages: this.messages,
            state: this.state,
            agent: this,
            input,
          });
        });
      }
      if (onRunFinalizedMutation.state !== undefined) {
        this.state = onRunFinalizedMutation.state;
        subscribers.forEach((subscriber) => {
          subscriber.onStateChanged?.({
            state: this.state,
            messages: this.messages,
            agent: this,
            input,
          });
        });
      }
    }
  }

  public clone() {
    const cloned = Object.create(Object.getPrototypeOf(this));

    cloned.agentId = this.agentId;
    cloned.description = this.description;
    cloned.threadId = this.threadId;
    cloned.messages = structuredClone_(this.messages);
    cloned.state = structuredClone_(this.state);
    cloned.debug = this.debug;
    cloned.isRunning = this.isRunning;
    cloned.subscribers = [...this.subscribers];
    cloned.middlewares = [...this.middlewares];

    return cloned;
  }

  public addMessage(message: Message) {
    // Add message to the messages array
    this.messages.push(message);

    // Notify subscribers sequentially in the background
    (async () => {
      // Fire onNewMessage sequentially
      for (const subscriber of this.subscribers) {
        await subscriber.onNewMessage?.({
          message,
          messages: this.messages,
          state: this.state,
          agent: this,
        });
      }

      // Fire onNewToolCall if the message is from assistant and contains tool calls
      if (message.role === "assistant" && message.toolCalls) {
        for (const toolCall of message.toolCalls) {
          for (const subscriber of this.subscribers) {
            await subscriber.onNewToolCall?.({
              toolCall,
              messages: this.messages,
              state: this.state,
              agent: this,
            });
          }
        }
      }

      // Fire onMessagesChanged sequentially
      for (const subscriber of this.subscribers) {
        await subscriber.onMessagesChanged?.({
          messages: this.messages,
          state: this.state,
          agent: this,
        });
      }
    })();
  }

  public addMessages(messages: Message[]) {
    // Add all messages to the messages array
    this.messages.push(...messages);

    // Notify subscribers sequentially in the background
    (async () => {
      // Fire onNewMessage and onNewToolCall for each message sequentially
      for (const message of messages) {
        // Fire onNewMessage sequentially
        for (const subscriber of this.subscribers) {
          await subscriber.onNewMessage?.({
            message,
            messages: this.messages,
            state: this.state,
            agent: this,
          });
        }

        // Fire onNewToolCall if the message is from assistant and contains tool calls
        if (message.role === "assistant" && message.toolCalls) {
          for (const toolCall of message.toolCalls) {
            for (const subscriber of this.subscribers) {
              await subscriber.onNewToolCall?.({
                toolCall,
                messages: this.messages,
                state: this.state,
                agent: this,
              });
            }
          }
        }
      }

      // Fire onMessagesChanged once at the end sequentially
      for (const subscriber of this.subscribers) {
        await subscriber.onMessagesChanged?.({
          messages: this.messages,
          state: this.state,
          agent: this,
        });
      }
    })();
  }

  public setMessages(messages: Message[]) {
    // Replace the entire messages array
    this.messages = structuredClone_(messages);

    // Notify subscribers sequentially in the background
    (async () => {
      // Fire onMessagesChanged sequentially
      for (const subscriber of this.subscribers) {
        await subscriber.onMessagesChanged?.({
          messages: this.messages,
          state: this.state,
          agent: this,
        });
      }
    })();
  }

  public setState(state: State) {
    // Replace the entire state
    this.state = structuredClone_(state);

    // Notify subscribers sequentially in the background
    (async () => {
      // Fire onStateChanged sequentially
      for (const subscriber of this.subscribers) {
        await subscriber.onStateChanged?.({
          messages: this.messages,
          state: this.state,
          agent: this,
        });
      }
    })();
  }

  public async *legacy_to_be_removed_runAgentBridged(
    config?: RunAgentParameters,
  ): AsyncIterable<LegacyRuntimeProtocolEvent> {
    this.agentId = this.agentId ?? uuidv4();
    const input = this.prepareRunAgentInput(config);

    // Build middleware chain for legacy bridge
    const source = (() => {
      if (this.middlewares.length === 0) {
        return this.run(input);
      }

      const chainedAgent = this.middlewares.reduceRight(
        (nextAgent: AbstractAgent, middleware) =>
          ({
            run: (i: RunAgentInput) => middleware.run(i, nextAgent),
          }) as AbstractAgent,
        this,
      );

      return chainedAgent.run(input);
    })();

    const chunked = transformChunks(this.debug)(source);
    const verified = verifyEvents(this.debug)(chunked);
    const legacyEvents = convertToLegacyEvents(this.threadId, input.runId, this.agentId)(verified);

    for await (const event of legacyEvents) {
      if (this.debug) {
        console.debug("[LEGACY]:", JSON.stringify(event));
      }
      yield event;
    }
  }
}

/** Helper: iterate an async iterable until the abort signal fires */
async function* takeUntilAborted<T>(
  source: AsyncIterable<T>,
  signal: AbortSignal,
): AsyncIterable<T> {
  for await (const item of source) {
    if (signal.aborted) break;
    yield item;
  }
}
