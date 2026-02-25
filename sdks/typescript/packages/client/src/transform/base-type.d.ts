import { BaseEvent } from "@ag-ui/core";

export type EventStreamParser = (source$: AsyncIterable<HttpEvent>, eventSubject: Subject<BaseEvent>) => AsyncIterable<BaseEvent>;

export interface TransformHttpEventStreamHandlers {
  condition: (event: HttpHeadersEvent) => boolean;
  parser: EventStreamParser
}