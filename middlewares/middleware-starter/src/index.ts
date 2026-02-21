import { AbstractAgent, BaseEvent, EventType, RunAgentInput } from "@ag-ui/client";

export class MiddlewareStarterAgent extends AbstractAgent {
  async *run(input: RunAgentInput): AsyncIterable<BaseEvent> {
    const messageId = Date.now().toString();

    yield {
      type: EventType.RUN_STARTED,
      threadId: input.threadId,
      runId: input.runId,
    } as any;

    yield {
      type: EventType.TEXT_MESSAGE_START,
      messageId,
    } as any;

    yield {
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId,
      delta: "Hello world!",
    } as any;

    yield {
      type: EventType.TEXT_MESSAGE_END,
      messageId,
    } as any;

    yield {
      type: EventType.RUN_FINISHED,
      threadId: input.threadId,
      runId: input.runId,
    } as any;
  }
}
