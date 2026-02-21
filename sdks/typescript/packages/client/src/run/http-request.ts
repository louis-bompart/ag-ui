export enum HttpEventType {
  HEADERS = "headers",
  DATA = "data",
}

export interface HttpDataEvent {
  type: HttpEventType.DATA;
  data?: Uint8Array;
}

export interface HttpHeadersEvent {
  type: HttpEventType.HEADERS;
  status: number;
  headers: Headers;
}

export type HttpEvent = HttpDataEvent | HttpHeadersEvent;

export async function* runHttpRequest(
  url: string,
  requestInit: RequestInit,
): AsyncIterable<HttpEvent> {
  const response = await fetch(url, requestInit);

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();
    let payload: unknown = text;
    if (contentType.includes("application/json")) {
      try {
        payload = JSON.parse(text);
      } catch {
        /* keep raw text */
      }
    }
    const err: any = new Error(
      `HTTP ${response.status}: ${typeof payload === "string" ? payload : JSON.stringify(payload)}`,
    );
    err.status = response.status;
    err.payload = payload;
    throw err;
  }

  // Emit headers event first
  yield {
    type: HttpEventType.HEADERS,
    status: response.status,
    headers: response.headers,
  } as HttpHeadersEvent;

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Failed to getReader() from response");
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield {
        type: HttpEventType.DATA,
        data: value,
      } as HttpDataEvent;
    }
  } finally {
    await reader.cancel().catch((error) => {
      if ((error as DOMException)?.name === "AbortError") {
        return;
      }
      throw error;
    });
  }
}
