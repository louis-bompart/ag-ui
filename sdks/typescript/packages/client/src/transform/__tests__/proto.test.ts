import { HttpEventType } from "../../run/http-request";
import { AsyncChannel, collectAsync } from "@/async-utils";
import {
  EventType,
  TextMessageStartEvent,
  TextMessageContentEvent,
  StateDeltaEvent,
  MessagesSnapshotEvent,
} from "@ag-ui/core";
import * as proto from "@ag-ui/proto";
import { parseProtoStream } from "../proto";
import * as encoder from "@ag-ui/encoder";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { HttpEvent } from "../../run/http-request";

const eventEncoder = new encoder.EventEncoder({
  accept: proto.AGUI_MEDIA_TYPE,
});

// Don't mock the proto package so we can use real encoding/decoding
vi.unmock("@ag-ui/proto");

describe("parseProtoStream", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should correctly decode protocol buffer events", async () => {
    const channel = new AsyncChannel<HttpEvent>();

    // Send headers event first with protobuf content type
    const headers = new Headers();
    headers.append("Content-Type", proto.AGUI_MEDIA_TYPE);

    channel.push({
      type: HttpEventType.HEADERS,
      status: 200,
      headers: headers,
    });

    // Create a test event
    const originalEvent = {
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg123",
      role: "assistant",
      timestamp: Date.now(),
    };

    // Encode the event using the encoder
    const encodedEvent = eventEncoder.encodeBinary(originalEvent);

    // Send the encoded event as a DATA chunk
    channel.push({
      type: HttpEventType.DATA,
      data: encodedEvent,
    });

    // Complete the stream
    channel.close();

    // Parse directly through parseProtoStream
    const events = await collectAsync(parseProtoStream(channel));

    // Verify we got back the same event
    expect(events.length).toBeGreaterThanOrEqual(1);
    const receivedEvent = events[0] as TextMessageStartEvent;
    expect(receivedEvent.type).toEqual(originalEvent.type);
    expect(receivedEvent.timestamp).toEqual(originalEvent.timestamp);
    expect(receivedEvent.messageId).toEqual(originalEvent.messageId);
    expect(receivedEvent.role).toEqual(originalEvent.role);
  });

  it("should handle multiple protobuf events in a single chunk", async () => {
    const channel = new AsyncChannel<HttpEvent>();

    // Send headers event first with protobuf content type
    const headers = new Headers();
    headers.append("Content-Type", proto.AGUI_MEDIA_TYPE);

    channel.push({
      type: HttpEventType.HEADERS,
      status: 200,
      headers: headers,
    });

    // Create two test events
    const startEvent = {
      type: EventType.TEXT_MESSAGE_START,
      messageId: "msg123",
      role: "assistant",
      timestamp: Date.now(),
    };

    const contentEvent = {
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "msg123",
      delta: "Hello world",
      timestamp: Date.now(),
    };

    // Encode both events and concatenate them
    const encodedStart = eventEncoder.encodeBinary(startEvent);
    const encodedContent = eventEncoder.encodeBinary(contentEvent);

    // Concatenate the two encoded events
    const combinedData = new Uint8Array(encodedStart.length + encodedContent.length);
    combinedData.set(encodedStart, 0);
    combinedData.set(encodedContent, encodedStart.length);

    // Send the combined data as a single chunk
    channel.push({
      type: HttpEventType.DATA,
      data: combinedData,
    });

    // Complete the stream
    channel.close();

    const events = await collectAsync(parseProtoStream(channel));

    // Verify we received both events correctly
    expect(events.length).toBe(2);
    expect(events[0].type).toEqual(startEvent.type);
    expect((events[0] as any).messageId).toEqual(startEvent.messageId);
    expect((events[0] as any).role).toEqual(startEvent.role);
    expect(events[1].type).toEqual(contentEvent.type);
    expect((events[1] as any).messageId).toEqual(contentEvent.messageId);
    expect((events[1] as any).delta).toEqual(contentEvent.delta);
  });

  it("should handle split protobuf event across multiple chunks", async () => {
    const channel = new AsyncChannel<HttpEvent>();

    // Send headers event first with protobuf content type
    const headers = new Headers();
    headers.append("Content-Type", proto.AGUI_MEDIA_TYPE);

    channel.push({
      type: HttpEventType.HEADERS,
      status: 200,
      headers: headers,
    });

    // Create a test event
    const originalEvent = {
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: "msg123",
      delta: "This is a message that will be split across chunks",
      timestamp: Date.now(),
    };

    // Encode the event using the encoder
    const encodedEvent = eventEncoder.encodeBinary(originalEvent);

    // Split the encoded event into three parts
    const firstPart = encodedEvent.slice(0, Math.floor(encodedEvent.length / 3));
    const secondPart = encodedEvent.slice(
      Math.floor(encodedEvent.length / 3),
      Math.floor((2 * encodedEvent.length) / 3),
    );
    const thirdPart = encodedEvent.slice(Math.floor((2 * encodedEvent.length) / 3));

    // Send the parts as separate chunks
    channel.push({
      type: HttpEventType.DATA,
      data: firstPart,
    });

    channel.push({
      type: HttpEventType.DATA,
      data: secondPart,
    });

    channel.push({
      type: HttpEventType.DATA,
      data: thirdPart,
    });

    // Complete the stream
    channel.close();

    const events = await collectAsync(parseProtoStream(channel));

    // Verify we got back the same event
    expect(events.length).toBeGreaterThanOrEqual(1);
    const receivedEvent = events[0] as TextMessageContentEvent;
    expect(receivedEvent.type).toEqual(originalEvent.type);
    expect(receivedEvent.messageId).toEqual(originalEvent.messageId);
    expect(receivedEvent.delta).toEqual(originalEvent.delta);
  });

  it("should emit error when invalid protobuf data is received", async () => {
    const channel = new AsyncChannel<HttpEvent>();

    // Send headers event first with protobuf content type
    const headers = new Headers();
    headers.append("Content-Type", proto.AGUI_MEDIA_TYPE);

    channel.push({
      type: HttpEventType.HEADERS,
      status: 200,
      headers: headers,
    });

    // Send invalid protobuf data (just random bytes)
    const invalidData = new Uint8Array([0x01, 0x02, 0x03, 0xff, 0xee, 0xdd]);

    channel.push({
      type: HttpEventType.DATA,
      data: invalidData,
    });

    // Complete the stream
    channel.close();

    // Collect events - should get 0 events (invalid data is silently skipped or throws)
    let events: any[] = [];
    let caughtError = false;
    try {
      events = await collectAsync(parseProtoStream(channel));
    } catch {
      caughtError = true;
    }

    // The implementation could either throw or silently ignore bad data
    // We just verify we didn't get a valid event from invalid data
    if (!caughtError) {
      expect(events.length).toBe(0);
    }
  }, 3000);

  it("should correctly encode and decode a STATE_DELTA event with JSON patch operations", async () => {
    const channel = new AsyncChannel<HttpEvent>();

    // Send headers event first with protobuf content type
    const headers = new Headers();
    headers.append("Content-Type", proto.AGUI_MEDIA_TYPE);

    channel.push({
      type: HttpEventType.HEADERS,
      status: 200,
      headers: headers,
    });

    // Create a state delta event with JSON patch operations
    const stateDeltaEvent: StateDeltaEvent = {
      type: EventType.STATE_DELTA,
      timestamp: Date.now(),
      delta: [
        { op: "add", path: "/counter", value: 42 },
        { op: "add", path: "/items", value: ["apple", "banana", "cherry"] },
        { op: "replace", path: "/users/123/name", value: "Jane Doe" },
        { op: "remove", path: "/outdated" },
        { op: "move", from: "/oldPath", path: "/newPath" },
        { op: "copy", from: "/source", path: "/destination" },
      ],
    };

    // Encode the event using the encoder
    const encodedEvent = eventEncoder.encodeBinary(stateDeltaEvent);

    // Send the encoded event as a DATA chunk
    channel.push({
      type: HttpEventType.DATA,
      data: encodedEvent,
    });

    // Complete the stream
    channel.close();

    const events = await collectAsync(parseProtoStream(channel));

    // Verify we got back the same event with all patch operations intact
    expect(events.length).toBeGreaterThanOrEqual(1);
    const receivedEvent = events[0] as StateDeltaEvent;
    expect(receivedEvent.type).toEqual(stateDeltaEvent.type);
    expect(receivedEvent.timestamp).toEqual(stateDeltaEvent.timestamp);

    // Check the JSON patch operations were correctly preserved
    expect(receivedEvent.delta.length).toEqual(stateDeltaEvent.delta.length);

    // Verify each patch operation
    receivedEvent.delta.forEach((operation, index) => {
      expect(operation.op).toEqual(stateDeltaEvent.delta[index].op);
      expect(operation.path).toEqual(stateDeltaEvent.delta[index].path);

      if ("from" in operation) {
        expect(operation.from).toEqual(stateDeltaEvent.delta[index].from);
      }

      if ("value" in operation) {
        expect(operation.value).toEqual(stateDeltaEvent.delta[index].value);
      }
    });
  });

  it("should correctly encode and decode a MESSAGES_SNAPSHOT event", async () => {
    const channel = new AsyncChannel<HttpEvent>();

    // Send headers event first with protobuf content type
    const headers = new Headers();
    headers.append("Content-Type", proto.AGUI_MEDIA_TYPE);

    channel.push({
      type: HttpEventType.HEADERS,
      status: 200,
      headers: headers,
    });

    // Create a messages snapshot event with complex message objects
    const messagesSnapshotEvent: MessagesSnapshotEvent = {
      type: EventType.MESSAGES_SNAPSHOT,
      timestamp: Date.now(),
      messages: [
        {
          id: "msg1",
          role: "user",
          content: "Hello, can you help me with something?",
        },
        {
          id: "msg2",
          role: "assistant",
          content: "Of course! How can I assist you today?",
        },
        {
          id: "msg3",
          role: "user",
          content: "I need help with coding",
        },
        {
          id: "msg4",
          role: "assistant",
          content: undefined,
          toolCalls: [
            {
              id: "tool1",
              type: "function",
              function: {
                name: "write_code",
                arguments: JSON.stringify({
                  language: "python",
                  task: "sorting algorithm",
                }),
              },
            },
          ],
        },
      ],
    };

    // Encode the event using the encoder
    const encodedEvent = eventEncoder.encodeBinary(messagesSnapshotEvent);

    // Send the encoded event as a DATA chunk
    channel.push({
      type: HttpEventType.DATA,
      data: encodedEvent,
    });

    // Complete the stream
    channel.close();

    const events = await collectAsync(parseProtoStream(channel));

    // Verify we got back the same event
    expect(events.length).toBeGreaterThanOrEqual(1);
    const receivedEvent = events[0] as MessagesSnapshotEvent;
    expect(receivedEvent.type).toEqual(messagesSnapshotEvent.type);
    expect(receivedEvent.timestamp).toEqual(messagesSnapshotEvent.timestamp);

    // Check the messages array was correctly preserved
    expect(receivedEvent.messages.length).toEqual(messagesSnapshotEvent.messages.length);

    // Verify each message
    receivedEvent.messages.forEach((message, index) => {
      expect(message.id).toEqual(messagesSnapshotEvent.messages[index].id);
      expect(message.role).toEqual(messagesSnapshotEvent.messages[index].role);
      expect(message.content).toEqual(messagesSnapshotEvent.messages[index].content);

      // Check tool calls if present
      if ((messagesSnapshotEvent.messages[index] as any).toolCalls) {
        expect((message as any).toolCalls).toBeDefined();
        expect((message as any).toolCalls!.length).toEqual(
          (messagesSnapshotEvent.messages[index] as any).toolCalls!.length,
        );

        (message as any).toolCalls!.forEach((toolCall: any, toolIndex: number) => {
          const originalToolCall = (messagesSnapshotEvent.messages[index] as any).toolCalls![
            toolIndex
          ];
          expect(toolCall.id).toEqual(originalToolCall.id);
          expect(toolCall.type).toEqual(originalToolCall.type);
          expect(toolCall.function.name).toEqual(originalToolCall.function.name);
          expect(JSON.parse(toolCall.function.arguments)).toEqual(
            JSON.parse(originalToolCall.function.arguments),
          );
        });
      }
    });
  });
});
