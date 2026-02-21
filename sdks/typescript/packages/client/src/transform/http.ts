import { BaseEvent, EventSchemas } from "@ag-ui/core";
import { HttpEvent, HttpEventType } from "../run/http-request";
import { parseSSEStream } from "./sse";
// import { parseProtoStream } from "./proto";
// import {AGUI_MEDIA_TYPE} from "@ag-ui/proto";
import { EventType } from "@ag-ui/core";

/**
 * Transforms HTTP events into BaseEvents using the appropriate format parser based on content type.
 */
export async function* transformHttpEventStream(
  source: AsyncIterable<HttpEvent>,
): AsyncIterable<BaseEvent> {
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

        // Choose parser based on content type
        // if (contentType === AGUI_MEDIA_TYPE) {
        //   yield* parseProtoStream(replayAndContinue);
        // } else {
        {
          // Use SSE JSON parser for all other cases
          for await (const json of parseSSEStream(replayAndContinue)) {
            try {
              const parsedEvent = EventSchemas.parse(json);
              yield parsedEvent as BaseEvent;
            } catch (err) {
              throw err;
            }
          }
        }
        // After the parser finishes, we're done
        return;
      }
    }
  }

  // If we never got headers, that's an error
  if (!parserInitialized) {
    throw new Error("No headers event received before stream ended");
  }
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
