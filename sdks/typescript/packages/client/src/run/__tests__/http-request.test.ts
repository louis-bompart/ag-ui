import { runHttpRequest, HttpEventType } from "../http-request";
import { collectAsync } from "@/async-utils";
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";

describe("runHttpRequest", () => {
  let originalFetch: any;
  let fetchMock: Mock;

  beforeEach(() => {
    // Save original fetch
    originalFetch = global.fetch;

    // Create a mock fetch function with proper response structure
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });

  it("should call fetch with the provided configuration", async () => {
    // Set up test configuration
    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-token",
      },
      body: JSON.stringify({ key: "value" }),
    };

    // Mock a proper response
    const mockHeaders = new Headers();
    mockHeaders.append("Content-Type", "application/json");

    const mockResponse = {
      ok: true,
      status: 200,
      headers: mockHeaders,
      body: {
        getReader: vi.fn().mockReturnValue({
          read: vi.fn().mockResolvedValue({ done: true }),
          cancel: vi.fn().mockResolvedValue(undefined),
        }),
      },
    };

    fetchMock.mockResolvedValue(mockResponse);

    // Execute the async generator and consume it
    const iterable = runHttpRequest("https://example.com/api", config);
    await collectAsync(iterable);

    // Verify fetch was called with the expected parameters
    expect(fetchMock).toHaveBeenCalledWith("https://example.com/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-token",
      },
      body: JSON.stringify({ key: "value" }),
    });
  });

  it("should pass an abort signal when provided", async () => {
    // Create an abort controller
    const abortController = new AbortController();

    // Set up test configuration with abort signal
    const config = {
      method: "GET",
      abortSignal: abortController.signal,
    };

    // Mock a proper response
    const mockHeaders = new Headers();
    mockHeaders.append("Content-Type", "application/json");

    const mockResponse = {
      ok: true,
      status: 200,
      headers: mockHeaders,
      body: {
        getReader: vi.fn().mockReturnValue({
          read: vi.fn().mockResolvedValue({ done: true }),
          cancel: vi.fn().mockResolvedValue(undefined),
        }),
      },
    };

    fetchMock.mockResolvedValue(mockResponse);

    // Execute the async generator and consume it
    const iterable = runHttpRequest("https://example.com/api", config);
    await collectAsync(iterable);

    // Verify fetch was called with the expected configuration
    expect(fetchMock).toHaveBeenCalledWith("https://example.com/api", {
      method: "GET",
      abortSignal: abortController.signal,
    });
  });

  it("should emit headers and data events from the response", async () => {
    // Create mock chunks to be returned by the reader
    const chunk1 = new Uint8Array([1, 2, 3]);
    const chunk2 = new Uint8Array([4, 5, 6]);

    // Mock reader that returns multiple chunks before completing
    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({ done: false, value: chunk1 })
        .mockResolvedValueOnce({ done: false, value: chunk2 })
        .mockResolvedValueOnce({ done: true }),
      cancel: vi.fn().mockResolvedValue(undefined),
    };

    // Mock response with our custom reader and headers
    const mockHeaders = new Headers();
    mockHeaders.append("Content-Type", "application/json");

    const mockResponse = {
      ok: true,
      status: 200,
      headers: mockHeaders,
      body: {
        getReader: vi.fn().mockReturnValue(mockReader),
      },
    };

    // Override the fetch mock for this specific test
    fetchMock.mockResolvedValue(mockResponse);

    // Set up test configuration
    const config = {
      method: "GET",
    };

    // Execute the async generator and collect events
    const iterable = runHttpRequest("https://example.com/api", config);
    const emittedEvents = await collectAsync(iterable);

    // Verify we received the expected events
    expect(emittedEvents.length).toBe(3);

    // First event should be headers
    expect(emittedEvents[0].type).toBe(HttpEventType.HEADERS);
    expect(emittedEvents[0].status).toBe(200);
    expect(emittedEvents[0].headers).toBe(mockHeaders);

    // Second and third events should be data
    expect(emittedEvents[1].type).toBe(HttpEventType.DATA);
    expect(emittedEvents[1].data).toBe(chunk1);

    expect(emittedEvents[2].type).toBe(HttpEventType.DATA);
    expect(emittedEvents[2].data).toBe(chunk2);

    // Verify reader.read was called the expected number of times
    expect(mockReader.read).toHaveBeenCalledTimes(3);
  });

  it("should throw HTTP error on occurs", async () => {
    // Mock a 404 error response with JSON body
    const mockHeaders = new Headers();
    mockHeaders.append("content-type", "application/json");

    const mockText = '{"message":"User not found"}';

    const mockResponse = {
      ok: false,
      status: 404,
      headers: mockHeaders,
      // our error-path reads .text() (not streaming)
      text: vi.fn().mockResolvedValue(mockText),
    } as unknown as Response;

    // Override fetch for this test
    fetchMock.mockResolvedValue(mockResponse);

    const iterable = runHttpRequest("https://example.com/api", { method: "GET" });

    // Consuming should throw
    let caughtError: any = null;
    try {
      await collectAsync(iterable);
    } catch (err: any) {
      caughtError = err;
    }

    expect(caughtError).toBeInstanceOf(Error);
    expect(caughtError.status).toBe(404);
    expect(caughtError.payload).toEqual({ message: "User not found" });
    expect(caughtError.message).toContain("HTTP 404");
    expect(caughtError.message).toContain("User not found");

    // Ensure we read the error body exactly once
    expect((mockResponse as any).text).toHaveBeenCalledTimes(1);
  });
});
