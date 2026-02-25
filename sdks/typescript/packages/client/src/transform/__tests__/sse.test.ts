import { AsyncChannel, collectAsync } from "@/async-utils";
import { transformHttpEventStream } from "../http";
import { EventType } from "@ag-ui/core";
import { HttpEvent, HttpEventType } from "../../run/http-request";
import { describe, it, expect } from "vitest";

describe("transformHttpEventStream", () => {
  it("should emit events as soon as complete SSE events are encountered", async () => {
    // Create a channel to simulate the HTTP chunk stream
    const channel = new AsyncChannel<HttpEvent>();

    // Create the transform stream
    const eventIter = transformHttpEventStream(channel);

    // Send headers event first
    const headers = new Headers();
    headers.append("Content-Type", "text/event-stream");

    channel.push({
      type: HttpEventType.HEADERS,
      status: 200,
      headers: headers,
    });

    // Send first chunk with a complete SSE event
    const firstChunkData = new TextEncoder().encode(
      'data: {"type": "TEXT_MESSAGE_START", "messageId": "1", "role": "assistant"}\n\n',
    );

    channel.push({
      type: HttpEventType.DATA,
      data: firstChunkData,
    });

    // Send second chunk with another complete SSE event
    const secondChunkData = new TextEncoder().encode(
      'data: {"type": "TEXT_MESSAGE_CONTENT", "messageId": "1", "delta": "Hello"}\n\n',
    );

    channel.push({
      type: HttpEventType.DATA,
      data: secondChunkData,
    });

    // Complete the stream
    channel.close();

    // Collect all events
    const events = await collectAsync(eventIter);

    expect(events.length).toBe(2);
    expect(events[0]).toEqual({
      type: EventType.TEXT_MESSAGE_START,
      role: "assistant",
      messageId: "1",
    });
    expect(events[1]).toEqual({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "1",
      delta: "Hello",
    });
  });

  it("should handle multiple complete SSE events in a single chunk", async () => {
    const channel = new AsyncChannel<HttpEvent>();
    const eventIter = transformHttpEventStream(channel);

    // Send headers event first
    const headers = new Headers();
    headers.append("Content-Type", "text/event-stream");

    channel.push({
      type: HttpEventType.HEADERS,
      status: 200,
      headers: headers,
    });

    // Send a single chunk with multiple complete SSE events
    const multilineJson = new TextEncoder().encode(
      'data: {"type": "TEXT_MESSAGE_START", "messageId": "1", "role": "assistant"}\n\n' +
        'data: {"type": "TEXT_MESSAGE_CONTENT", "messageId": "1", "delta": "Hello"}\n\n',
    );

    channel.push({
      type: HttpEventType.DATA,
      data: multilineJson,
    });

    // Complete the stream
    channel.close();

    const events = await collectAsync(eventIter);

    // Verify we received both events in the correct order
    expect(events.length).toBe(2);
    expect(events[0]).toEqual({
      type: EventType.TEXT_MESSAGE_START,
      role: "assistant",
      messageId: "1",
    });
    expect(events[1]).toEqual({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "1",
      delta: "Hello",
    });
  });

  it("should handle split SSE event across multiple chunks", async () => {
    const channel = new AsyncChannel<HttpEvent>();
    const eventIter = transformHttpEventStream(channel);

    // Send headers event first
    const headers = new Headers();
    headers.append("Content-Type", "text/event-stream");

    channel.push({
      type: HttpEventType.HEADERS,
      status: 200,
      headers: headers,
    });

    // Send first part of an SSE event
    channel.push({
      type: HttpEventType.DATA,
      data: new TextEncoder().encode('data: {"type": "TEXT_MESSAGE'),
    });

    // Send middle part
    channel.push({
      type: HttpEventType.DATA,
      data: new TextEncoder().encode('_START", "messageId": '),
    });

    // Send final part with double newline to complete the SSE event
    channel.push({
      type: HttpEventType.DATA,
      data: new TextEncoder().encode('"1", "role": "assistant"}\n\n'),
    });

    // Complete the stream after sending all chunks
    channel.close();

    const events = await collectAsync(eventIter);

    // Verify we correctly assembled and parsed the JSON
    expect(events.length).toBe(1);
    expect(events[0]).toEqual({
      type: EventType.TEXT_MESSAGE_START,
      role: "assistant",
      messageId: "1",
    });
  });

  it("should emit error when invalid JSON is received in SSE format", async () => {
    const channel = new AsyncChannel<HttpEvent>();
    const eventIter = transformHttpEventStream(channel);

    // Send headers event first
    const headers = new Headers();
    headers.append("Content-Type", "text/event-stream");

    channel.push({
      type: HttpEventType.HEADERS,
      status: 200,
      headers: headers,
    });

    // Send invalid JSON (missing closing bracket) in SSE format
    channel.push({
      type: HttpEventType.DATA,
      data: new TextEncoder().encode('data: {"type": "TEXT_MESSAGE_START", "messageId": "1"\n\n'),
    });

    channel.close();

    // Collecting should throw due to invalid JSON
    await expect(collectAsync(eventIter)).rejects.toThrow();
  });

  it("should handle Server-Sent Events (SSE) format with multiple data lines", async () => {
    const channel = new AsyncChannel<HttpEvent>();
    const eventIter = transformHttpEventStream(channel);

    // Send headers event first
    const headers = new Headers();
    headers.append("Content-Type", "text/event-stream");

    channel.push({
      type: HttpEventType.HEADERS,
      status: 200,
      headers: headers,
    });

    // Send an SSE formatted event with multi-line data
    const sseData = new TextEncoder().encode(
      "event: message\n" +
        "id: 123\n" +
        "data: {\n" +
        'data: "type": "TEXT_MESSAGE_CONTENT",\n' +
        'data: "messageId": "1",\n' +
        'data: "delta": "Hello World"\n' +
        "data: }\n\n",
    );

    channel.push({
      type: HttpEventType.DATA,
      data: sseData,
    });

    channel.close();

    const events = await collectAsync(eventIter);

    // Verify we received the correct event with the multi-line data properly joined
    expect(events.length).toBe(1);
    expect(events[0]).toEqual({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "1",
      delta: "Hello World",
    });
  });

  it("should handle JSON split between HTTP chunks in a single SSE event", async () => {
    const channel = new AsyncChannel<HttpEvent>();
    const eventIter = transformHttpEventStream(channel);

    // Send headers event first
    const headers = new Headers();
    headers.append("Content-Type", "text/event-stream");

    channel.push({
      type: HttpEventType.HEADERS,
      status: 200,
      headers: headers,
    });

    // Send the start of the SSE event with first part of the JSON
    channel.push({
      type: HttpEventType.DATA,
      data: new TextEncoder().encode('data: {"type": "TEXT_MESSAGE_CONTENT", "messageId": "1"'),
    });

    // Send the middle part of the JSON
    channel.push({
      type: HttpEventType.DATA,
      data: new TextEncoder().encode(', "delta": "Hello '),
    });

    // Send the end of the JSON with the closing SSE event markers
    channel.push({
      type: HttpEventType.DATA,
      data: new TextEncoder().encode('World"}\n\n'),
    });

    channel.close();

    const events = await collectAsync(eventIter);

    // Verify we correctly assembled and parsed the JSON
    expect(events.length).toBe(1);
    expect(events[0]).toEqual({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "1",
      delta: "Hello World",
    });
  });

  it("should handle SSE with 'data:' prefix split from JSON content", async () => {
    const channel = new AsyncChannel<HttpEvent>();
    const eventIter = transformHttpEventStream(channel);

    // Send headers event first
    const headers = new Headers();
    headers.append("Content-Type", "text/event-stream");

    channel.push({
      type: HttpEventType.HEADERS,
      status: 200,
      headers: headers,
    });

    // Send the first chunk with just the SSE prefix
    channel.push({
      type: HttpEventType.DATA,
      data: new TextEncoder().encode("data: "),
    });

    // Send the start of the JSON
    channel.push({
      type: HttpEventType.DATA,
      data: new TextEncoder().encode('{"type": "TEXT_MESSAGE_CONTENT"'),
    });

    // Send the middle part of the JSON
    channel.push({
      type: HttpEventType.DATA,
      data: new TextEncoder().encode(', "messageId": "1", "delta":'),
    });

    // Send the end of the JSON with the closing SSE event markers
    channel.push({
      type: HttpEventType.DATA,
      data: new TextEncoder().encode(' "Split JSON Test"}\n\n'),
    });

    channel.close();

    const events = await collectAsync(eventIter);

    // Verify we correctly assembled and parsed the JSON
    expect(events.length).toBe(1);
    expect(events[0]).toEqual({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "1",
      delta: "Split JSON Test",
    });
  });
});
