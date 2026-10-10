export type FlexResult = "finished" | "disposed";
export interface FlexTransition {
  updateCallbackDone: Promise<void>;
  finished: Promise<void>;
  ready?: Promise<void>;
  skipTransition(): void;
}
export interface FlexRuntime {
  animate(): Promise<void>;
  cancel?(): void;
  settle?(): Promise<void>;
  reducedMotion?(): boolean;
  startViewTransition?(update: () => Promise<void>): FlexTransition;
}

/** Serializes caller-owned updates. Destruction prevents all unstarted updates. */
export function createFlexController(runtime: FlexRuntime) {
  let disposed = false;
  let tail: Promise<unknown> = Promise.resolve();
  let active: FlexTransition | undefined;
  let stop!: () => void;
  const stopped = new Promise<"disposed">((resolve) => {
    stop = () => resolve("disposed");
  });

  async function execute(update: () => void): Promise<FlexResult> {
    if (disposed) return "disposed";
    let commitPromise: Promise<void> | undefined;
    const commit = () => {
      commitPromise ??= (async () => {
        if (disposed) return;
        update();
        await runtime.settle?.();
      })();
      return commitPromise;
    };
    if (!runtime.reducedMotion?.() && runtime.startViewTransition) {
      try {
        active = runtime.startViewTransition(commit);
      } catch {
        await commit();
      }
      if (active) {
        void active.ready?.catch(() => {});
        // Observe both rejections immediately, including failures before update completion.
        const finished = active.finished.then(
          () => true,
          () => false,
        );
        try {
          await active.updateCallbackDone;
          if (await finished) return disposed ? "disposed" : "finished";
        } finally {
          active = undefined;
        }
      }
    } else {
      await commit();
    }
    if (disposed) return "disposed";
    if (!runtime.reducedMotion?.()) await runtime.animate();
    return disposed ? "disposed" : "finished";
  }

  return {
    run(update: () => void): Promise<FlexResult> {
      const job = tail.then(() => Promise.race([execute(update), stopped]));
      tail = job.catch(() => {});
      return job;
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      active?.skipTransition();
      runtime.cancel?.();
      stop();
    },
  };
}
