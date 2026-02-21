import { HttpEvent, HttpEventType } from "../run/http-request";

/**
 * Parses a stream of HTTP events into a stream of JSON objects using Server-Sent Events (SSE) format.
 * Strictly follows the SSE standard where:
 * - Events are separated by double newlines ('\n\n')
 * - Only 'data:' prefixed lines are processed
 * - Multi-line data events are supported and joined
 * - Non-data fields (event, id, retry) are ignored
 */
export async function* parseSSEStream(source: AsyncIterable<HttpEvent>): AsyncIterable<any> {
  // Create TextDecoder with stream option set to true to handle split UTF-8 characters
  const decoder = new TextDecoder("utf-8", { fatal: false });
  let buffer = "";

  for await (const event of source) {
    if (event.type === HttpEventType.HEADERS) {
      continue;
    }

    if (event.type === HttpEventType.DATA && event.data) {
      // Decode chunk carefully to handle UTF-8
      const text = decoder.decode(event.data, { stream: true });
      buffer += text;

      // Process complete events (separated by double newlines)
      const events = buffer.split(/\n\n/);
      // Keep the last potentially incomplete event in buffer
      buffer = events.pop() || "";

      for (const sseEvent of events) {
        const result = processSSEEvent(sseEvent);
        if (result !== undefined) {
          yield result;
        }
      }
    }
  }

  // Use the final call to decoder.decode() to flush any remaining bytes
  if (buffer) {
    buffer += decoder.decode();
    // Process any remaining SSE event data
    const result = processSSEEvent(buffer);
    if (result !== undefined) {
      yield result;
    }
  }
}

/**
 * Helper function to process an SSE event.
 * Extracts and joins data lines, then parses the result as JSON.
 *
 * Follows the SSE spec by processing lines starting with 'data:',
 * ignoring a single space if it is present after the colon.
 *
 * @param eventText The raw event text to process
 */
function processSSEEvent(eventText: string): any | undefined {
  const lines = eventText.split("\n");
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("data:")) {
      // Remove 'data:' prefix, and optionally a single space afterwards
      dataLines.push(line.slice(5).replace(/^ /, ""));
    }
  }

  // Only process if we have data lines
  if (dataLines.length > 0) {
    // Join multi-line data and parse JSON
    const jsonStr = dataLines.join("\n");
    return JSON.parse(jsonStr);
  }

  return undefined;
}
