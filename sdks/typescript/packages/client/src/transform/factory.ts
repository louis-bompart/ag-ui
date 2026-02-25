import { BaseEvent } from "@ag-ui/core";
import { Subject, ReplaySubject, Observable } from "rxjs";
import { HttpEvent, HttpEventType } from "../run/http-request";
import { TransformHttpEventStreamHandlers } from "./base-type";

/**
 * Factory function to create a transformHttpEventStream operator with customizable handlers for different content types.
 * It listens for the initial HttpHeadersEvent to determine the content type and then applies the appropriate parser to transform the stream of HttpEvents into BaseEvents.
 * Handlers are provided as an array of objects, each containing a condition function to match the headers and a parser function to process the events if the condition is met.
 * If no handlers match the content type, an error is emitted on the eventSubject.
 * The factory allows for flexible handling of various streaming formats (e.g., SSE, protocol buffers) based on the content type specified in the HTTP response headers.
 * 
 * Example usage:
 * 
 * const transformStream = transformHttpEventStreamFactory([
 *  {
 *   condition: (event) => event.headers.get("content-type") === "text/event-stream", parser: defaultSSEStreamParser
 *  },
 *  {
 *   condition: (event) => event.headers.get("content-type") === AGUI_MEDIA_TYPE, parser: defaultAGUIProtoStreamParser
 *  }
 * ]);
 */
export const transformHttpEventStreamFactory = (handlers: TransformHttpEventStreamHandlers[]) =>
  async function* (source: AsyncIterable<HttpEvent>): AsyncIterable<BaseEvent> {
    // Buffer events until we know the content-type, then pipe through the right parser
    const buffered: HttpEvent[] = [];
    let parserInitialized = false;
    let contentType: string | null = null;

    for await (const event of source) {
      if (!parserInitialized) {
        buffered.push(event);

        if (event.type === HttpEventType.HEADERS) {
          parserInitialized = true;
          contentType = event.headers.get("content-type");

          // Create an async iterable that replays buffered events then continues from source
          const replayAndContinue = replayThenForward(buffered, source);
          for (const handler of handlers) {
            if (handler.condition({ headers: event.headers })) {
              yield* handler.parser(replayAndContinue, new Subject<BaseEvent>());
              return; // After the parser finishes, we're done
            }
          }
        }
      }

      // If we never got headers, that's an error
      if (!parserInitialized) {
        throw new Error("No headers event received before stream ended");
      }
    };
  }

    /**
     * Creates an async iterable that first yields all buffered events,
     * then yields remaining events from the source. Since the source
     * iterator has already been partially consumed by the outer loop,
     * we continue from where we left off.
     */
    async function* replayThenForward(
      buffered: HttpEvent[],
      source: AsyncIterable<HttpEvent>,
    ): AsyncIterable<HttpEvent> {
      // Replay buffered events
      for (const event of buffered) {
        yield event;
      }
      // Forward remaining events from source
      yield* source;
    }