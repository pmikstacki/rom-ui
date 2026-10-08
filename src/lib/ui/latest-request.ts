/** State for disposable view computations, never durable mutations. */
export interface LatestRequestState<T> {
  readonly phase: "idle" | "pending" | "ready" | "error";
  readonly identity: string | null;
  readonly value: T | null;
  readonly code: string | null;
}

export interface LatestRequest<T> {
  run(
    identity: string,
    task: (signal: AbortSignal) => Promise<T>,
  ): Promise<void>;
  clear(): void;
  dispose(): void;
}

export interface LatestRequestOptions<T> {
  /** Validate and copy the host's accepted value shape. Use ROM codecs for exact wire values. */
  clone(value: T): T;
  /** Return a public code, never private exception text. */
  classifyError(error: unknown): string;
  onState(state: LatestRequestState<T>): void;
}

interface Attempt {
  readonly controller: AbortController;
  resolve(): void;
  reject(error: unknown): void;
}

/**
 * Suppresses obsolete results and settles superseded callers immediately.
 * Cancellation is cooperative: tasks must enforce their own execution bounds.
 * Host callback exceptions reject run(); they are programming errors, not server codes.
 */
export function createLatestRequest<T>(
  options: LatestRequestOptions<T>,
): LatestRequest<T> {
  let active: Attempt | null = null;
  let epoch = 0;
  let disposed = false;

  function retire(next: Attempt | null): number {
    const previous = active;
    const ticket = ++epoch;
    active = next;
    previous?.resolve();
    // Ownership changes first: abort listeners may synchronously reenter this controller.
    previous?.controller.abort();
    return ticket;
  }

  return {
    run(identity, task) {
      if (disposed) return Promise.resolve();
      if (typeof identity !== "string" || identity.length === 0) {
        return Promise.reject(new TypeError("A request identity is required"));
      }
      let resolve!: () => void;
      let reject!: (error: unknown) => void;
      const done = new Promise<void>((yes, no) => {
        resolve = yes;
        reject = no;
      });
      const attempt: Attempt = {
        controller: new AbortController(),
        resolve,
        reject,
      };
      const ticket = retire(attempt);
      const owns = () => !disposed && epoch === ticket && active === attempt;
      const settle = () => {
        if (owns()) active = null;
        resolve();
      };
      const callbackFailure = (error: unknown) => {
        if (owns()) {
          active = null;
          ++epoch;
        }
        reject(error);
        attempt.controller.abort();
      };
      const failure = (error: unknown) => {
        if (!owns()) return;
        try {
          const code = options.classifyError(error);
          if (!owns()) return;
          options.onState({ phase: "error", identity, value: null, code });
          settle();
        } catch (callbackError) {
          callbackFailure(callbackError);
        }
      };
      if (!owns()) return done;
      try {
        options.onState({
          phase: "pending",
          identity,
          value: null,
          code: null,
        });
      } catch (error) {
        callbackFailure(error);
        return done;
      }
      if (!owns()) return done;
      try {
        // Attach rejection handling even when task() synchronously changes ownership.
        const pending = task(attempt.controller.signal);
        void Promise.resolve(pending).then((value) => {
          if (!owns()) return;
          try {
            const copy = options.clone(value);
            if (!owns()) return;
            options.onState({
              phase: "ready",
              identity,
              value: copy,
              code: null,
            });
            settle();
          } catch (error) {
            callbackFailure(error);
          }
        }, failure);
      } catch (error) {
        failure(error);
      }
      return done;
    },
    clear() {
      if (disposed) return;
      const ticket = retire(null);
      if (disposed || epoch !== ticket) return;
      options.onState({
        phase: "idle",
        identity: null,
        value: null,
        code: null,
      });
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      retire(null);
    },
  };
}
