/**
 * Async iterable combinators that replace the RxJS operators used in
 * the ag-ui client package. Every function is an async generator that
 * takes an AsyncIterable source and yields transformed values.
 */

/* ------------------------------------------------------------------ */
/*  map                                                               */
/* ------------------------------------------------------------------ */
export async function* mapAsync<T, U>(
  source: AsyncIterable<T>,
  fn: (item: T) => U | Promise<U>,
): AsyncIterable<U> {
  for await (const item of source) {
    yield await fn(item);
  }
}

/* ------------------------------------------------------------------ */
/*  filter                                                            */
/* ------------------------------------------------------------------ */
export async function* filterAsync<T>(
  source: AsyncIterable<T>,
  predicate: (item: T) => boolean | Promise<boolean>,
): AsyncIterable<T> {
  for await (const item of source) {
    if (await predicate(item)) {
      yield item;
    }
  }
}

/* ------------------------------------------------------------------ */
/*  flatMap  (replaces mergeMap with concurrency 1 / array flattening)*/
/* ------------------------------------------------------------------ */
export async function* flatMapAsync<T, U>(
  source: AsyncIterable<T>,
  fn: (item: T) => Iterable<U> | AsyncIterable<U> | Promise<Iterable<U>>,
): AsyncIterable<U> {
  for await (const item of source) {
    const result = await fn(item);
    if (Symbol.asyncIterator in Object(result)) {
      yield* result as AsyncIterable<U>;
    } else {
      yield* result as Iterable<U>;
    }
  }
}

/* ------------------------------------------------------------------ */
/*  concatMap — sequential async mapping, flatten returned iterable   */
/* ------------------------------------------------------------------ */
export async function* concatMapAsync<T, U>(
  source: AsyncIterable<T>,
  fn: (item: T) => AsyncIterable<U> | Iterable<U> | Promise<AsyncIterable<U> | Iterable<U>>,
): AsyncIterable<U> {
  for await (const item of source) {
    const result = await fn(item);
    if (Symbol.asyncIterator in Object(result)) {
      yield* result as AsyncIterable<U>;
    } else {
      yield* result as Iterable<U>;
    }
  }
}

/* ------------------------------------------------------------------ */
/*  tap — side-effect for each item (replaces rxjs tap)               */
/* ------------------------------------------------------------------ */
export async function* tapAsync<T>(
  source: AsyncIterable<T>,
  fn: (item: T) => void | Promise<void>,
): AsyncIterable<T> {
  for await (const item of source) {
    await fn(item);
    yield item;
  }
}

/* ------------------------------------------------------------------ */
/*  takeUntilAborted — stops iteration when signal aborts             */
/* ------------------------------------------------------------------ */
export async function* takeUntilAborted<T>(
  source: AsyncIterable<T>,
  signal: AbortSignal,
): AsyncIterable<T> {
  if (signal.aborted) return;

  // We need to race the source iterator against the abort signal
  const iterator = source[Symbol.asyncIterator]();

  try {
    while (true) {
      if (signal.aborted) break;

      // Race between iterator.next() and abort
      const result = await raceAbort(iterator.next(), signal);
      if (result === ABORTED || result.done) break;
      yield result.value;
    }
  } finally {
    await iterator.return?.();
  }
}

const ABORTED = Symbol("aborted");

function raceAbort<T>(
  promise: Promise<IteratorResult<T>>,
  signal: AbortSignal,
): Promise<IteratorResult<T> | typeof ABORTED> {
  if (signal.aborted) return Promise.resolve(ABORTED);
  return new Promise<IteratorResult<T> | typeof ABORTED>((resolve, reject) => {
    const onAbort = () => resolve(ABORTED);
    signal.addEventListener("abort", onAbort, { once: true });
    promise.then(
      (result) => {
        signal.removeEventListener("abort", onAbort);
        resolve(result);
      },
      (err) => {
        signal.removeEventListener("abort", onAbort);
        reject(err);
      },
    );
  });
}

/* ------------------------------------------------------------------ */
/*  finalizeAsync — runs cleanup fn when source completes or errors   */
/* ------------------------------------------------------------------ */
export async function* finalizeAsync<T>(
  source: AsyncIterable<T>,
  fn: () => void | Promise<void>,
): AsyncIterable<T> {
  try {
    yield* source;
  } finally {
    await fn();
  }
}

/* ------------------------------------------------------------------ */
/*  catchErrorAsync — catches errors and yields from a fallback       */
/* ------------------------------------------------------------------ */
export async function* catchErrorAsync<T>(
  source: AsyncIterable<T>,
  handler: (error: unknown) => AsyncIterable<T> | Iterable<T>,
): AsyncIterable<T> {
  const iterator = source[Symbol.asyncIterator]();
  try {
    while (true) {
      let result: IteratorResult<T>;
      try {
        result = await iterator.next();
      } catch (error) {
        const fallback = handler(error);
        if (Symbol.asyncIterator in Object(fallback)) {
          yield* fallback as AsyncIterable<T>;
        } else {
          yield* fallback as Iterable<T>;
        }
        return;
      }
      if (result.done) break;
      yield result.value;
    }
  } finally {
    await iterator.return?.();
  }
}

/* ------------------------------------------------------------------ */
/*  defaultIfEmpty — yields a fallback if source is empty             */
/* ------------------------------------------------------------------ */
export async function* defaultIfEmpty<T>(
  source: AsyncIterable<T>,
  fallback: T,
): AsyncIterable<T> {
  let hasItems = false;
  for await (const item of source) {
    hasItems = true;
    yield item;
  }
  if (!hasItems) {
    yield fallback;
  }
}

/* ------------------------------------------------------------------ */
/*  Helper: drain — consume an async iterable fully, return void      */
/* ------------------------------------------------------------------ */
export async function drainAsync<T>(source: AsyncIterable<T>): Promise<void> {
  for await (const _ of source) {
    // consume
  }
}

/* ------------------------------------------------------------------ */
/*  Helper: collectAsync — collect all items into an array            */
/* ------------------------------------------------------------------ */
export async function collectAsync<T>(source: AsyncIterable<T>): Promise<T[]> {
  const items: T[] = [];
  for await (const item of source) {
    items.push(item);
  }
  return items;
}

/* ------------------------------------------------------------------ */
/*  Helper: single value async iterable (replaces rxjs `of`)          */
/* ------------------------------------------------------------------ */
export async function* ofAsync<T>(...values: T[]): AsyncIterable<T> {
  yield* values;
}

/* ------------------------------------------------------------------ */
/*  Helper: empty async iterable (replaces rxjs `EMPTY`)              */
/* ------------------------------------------------------------------ */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export async function* emptyAsync<T = never>(): AsyncIterable<T> {}

/* ------------------------------------------------------------------ */
/*  Helper: from promise (replaces rxjs `from(promise)`)              */
/* ------------------------------------------------------------------ */
export async function* fromPromise<T>(promise: Promise<T>): AsyncIterable<T> {
  yield await promise;
}
