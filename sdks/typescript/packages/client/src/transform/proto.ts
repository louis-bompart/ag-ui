import { HttpEvent, HttpEventType } from "../run/http-request";
import { BaseEvent } from "@ag-ui/core";
import {decode} from "@ag-ui/proto";
import { EventStreamParser } from "./base-type";

/**
 * Parses a stream of HTTP events into a stream of BaseEvent objects using Protocol Buffer format.
 * Each message is prefixed with a 4-byte length header (uint32 in big-endian format)
 * followed by the protocol buffer encoded message.
 */
export async function* parseProtoStream(
  source: AsyncIterable<HttpEvent>,
): AsyncIterable<BaseEvent> {
  let buffer = new Uint8Array(0);

  for await (const event of source) {
    if (event.type === HttpEventType.HEADERS) {
      continue;
    }

    if (event.type === HttpEventType.DATA && event.data) {
      // Append the new data to our buffer
      const newBuffer = new Uint8Array(buffer.length + event.data.length);
      newBuffer.set(buffer, 0);
      newBuffer.set(event.data, buffer.length);
      buffer = newBuffer;

      // Process as many complete messages as possible
      yield* processBuffer();
    }
  }

  // Try to process any remaining data in the buffer
  if (buffer.length > 0) {
    try {
      yield* processBuffer();
    } catch (error: unknown) {
      console.warn("Incomplete or invalid protocol buffer data at stream end");
    }
  }

  /**
   * Process as many complete messages as possible from the buffer
   */
  function* processBuffer(): Iterable<BaseEvent> {
    // Keep processing while we have enough data for at least a header (4 bytes)
    while (buffer.length >= 4) {
      // Read message length from the first 4 bytes (big-endian uint32)
      const view = new DataView(buffer.buffer, buffer.byteOffset, 4);
      const messageLength = view.getUint32(0, false); // false = big-endian

      // Check if we have the complete message (header + message body)
      const totalLength = 4 + messageLength;
      if (buffer.length < totalLength) {
        // Not enough data yet, wait for more
        break;
      }

      // Extract the message (skipping the 4-byte header)
      const message = buffer.slice(4, totalLength);

      // Decode the protocol buffer message using the imported decode function
      const decodedEvent = decode(message);

      // Remove the processed message from the buffer
      buffer = buffer.slice(totalLength);

      yield decodedEvent;
    }
  }
}

/**
 * The default parser for AGUI protocol buffer streams. It uses the parseProtoStream function to convert HTTP events into BaseEvents.
 * To use as part of the argument for transformHttpEventStreamFactory, simply pass in the parser function along with a condition that checks for the AGUI media type in the headers.
 * 
 * Example usage:
 * 
 * const transformStream = transformHttpEventStreamFactory([
 *  {
 *   condition: (event) => event.headers.get("content-type") === AGUI_MEDIA_TYPE, parser: defaultAGUIProtoStreamParser
 *  },
 * ]);
 */
export const defaultAGUIProtoStreamParser: EventStreamParser = (source, eventSubject) => parseProtoStream(source);
