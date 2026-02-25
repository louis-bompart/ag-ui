import { transformHttpEventStream } from "../http";
import { HttpEvent, HttpEventType } from "../../run/http-request";
import { BaseEvent, EventType } from "@ag-ui/core";
import { AsyncChannel, collectAsync } from "@/async-utils";
import { describe, it, expect, vi, beforeEach, test } from "vitest";

describe("transformHttpEventStream", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should error if DATA received before HEADERS", async () => {
    // Given
    const channel = new AsyncChannel<HttpEvent>();

    // Send a DATA event before HEADERS
    channel.push({
      type: HttpEventType.DATA,
      data: new Uint8Array([1, 2, 3, 4]),
    });

    channel.close();

    // Then
    await expect(collectAsync(transformHttpEventStream(channel))).rejects.toThrow(
      "No headers event received before",
    );
  });

  test("should parse SSE events by default", async () => {
    const channel = new AsyncChannel<HttpEvent>();

    // Send headers with SSE content type
    channel.push({
      type: HttpEventType.HEADERS,
      status: 200,
      headers: new Headers([["content-type", "text/event-stream"]]),
    });

    // Send a valid SSE event
    channel.push({
      type: HttpEventType.DATA,
      data: new TextEncoder().encode(
        'data: {"type": "TEXT_MESSAGE_START", "messageId": "1", "role": "assistant"}\n\n',
      ),
    });

    channel.close();

    const events = await collectAsync(transformHttpEventStream(channel));

    expect(events.length).toBe(1);
    expect(events[0].type).toBe(EventType.TEXT_MESSAGE_START);
    expect((events[0] as any).messageId).toBe("1");
  });
});
