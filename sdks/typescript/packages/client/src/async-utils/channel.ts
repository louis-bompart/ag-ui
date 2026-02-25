/**
 * AsyncChannel<T> — A lightweight push-pull async queue that replaces
 * RxJS Subject / ReplaySubject for bridging push-based producers to
 * pull-based AsyncIterable consumers.
 *
 * Features:
 *   - `.push(value)` to enqueue a value
 *   - `.close()` to signal the end of the stream
 *   - `.error(err)` to signal an error
 *   - Implements `AsyncIterable<T>` so it can be consumed with `for await...of`
 *   - Optional `replay` buffer size to replay past values to new consumers
 */

interface Waiter<T> {
  resolve: (result: IteratorResult<T>) => void;
  reject: (err: unknown) => void;
}

export class AsyncChannel<T> implements AsyncIterable<T> {
  private buffer: T[] = [];
  private waiters: Waiter<T>[] = [];
  private closed = false;
  private errorValue: unknown = undefined;
  private hasError = false;
  private replayBuffer: T[] = [];
  private readonly replaySize: number;

  constructor(options?: { replay?: number }) {
    this.replaySize = options?.replay ?? 0;
  }

  /**
   * Push a value into the channel. If a consumer is waiting, it receives
   * the value immediately. Otherwise the value is buffered.
   */
  push(value: T): void {
    if (this.closed || this.hasError) return;

    // Maintain replay buffer
    if (this.replaySize > 0) {
      this.replayBuffer.push(value);
      if (this.replayBuffer.length > this.replaySize) {
        this.replayBuffer.shift();
      }
    }

    if (this.waiters.length > 0) {
      const waiter = this.waiters.shift()!;
      waiter.resolve({ value, done: false });
    } else {
      this.buffer.push(value);
    }
  }

  /**
   * Signal the end of the stream. Consumers waiting will receive `{ done: true }`.
   */
  close(): void {
    if (this.closed) return;
    this.closed = true;
    // Resolve all pending waiters with done
    for (const waiter of this.waiters) {
      waiter.resolve({ value: undefined as any, done: true });
    }
    this.waiters = [];
  }

  /**
   * Signal an error. Consumers waiting will have their promise rejected.
   */
  error(err: unknown): void {
    if (this.closed || this.hasError) return;
    this.hasError = true;
    this.errorValue = err;
    // Reject all pending waiters
    for (const waiter of this.waiters) {
      waiter.reject(err);
    }
    this.waiters = [];
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    // If replay is enabled, prepend replayed items before live items
    let replayIndex = 0;
    const replaySnapshot = this.replaySize > 0 ? [...this.replayBuffer] : [];

    return {
      next: (): Promise<IteratorResult<T>> => {
        // First drain replay buffer
        if (replayIndex < replaySnapshot.length) {
          return Promise.resolve({ value: replaySnapshot[replayIndex++], done: false });
        }

        // Then check for error
        if (this.hasError) {
          return Promise.reject(this.errorValue);
        }

        // Then drain live buffer
        if (this.buffer.length > 0) {
          return Promise.resolve({ value: this.buffer.shift()!, done: false });
        }

        // Already closed
        if (this.closed) {
          return Promise.resolve({ value: undefined as any, done: true });
        }

        // Wait for next push / close / error
        return new Promise<IteratorResult<T>>((resolve, reject) => {
          this.waiters.push({ resolve, reject });
        });
      },
      return: (): Promise<IteratorResult<T>> => {
        this.close();
        return Promise.resolve({ value: undefined as any, done: true });
      },
    };
  }
}
