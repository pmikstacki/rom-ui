/** Host classification, never a receipt or permission grant. */
export type CompositionCommandResult = "accepted" | "rejected" | "unknown";
export type CompositionCommandStatus =
  "idle" | "pending" | "rejected" | "unknown";
/** One host command barrier. Reset is an explicit host/scope transition, never retry. */
export function createCompositionCommand(
  publish: (status: CompositionCommandStatus) => void,
) {
  let status: CompositionCommandStatus = "idle",
    epoch = 0,
    disposed = false;
  const set = (next: CompositionCommandStatus) => {
    status = next;
    publish(next);
  };
  return {
    reset() {
      if (!disposed) {
        epoch++;
        set("idle");
      }
    },
    dispose() {
      disposed = true;
      epoch++;
    },
    async run(
      callback: () =>
        CompositionCommandResult | Promise<CompositionCommandResult>,
      current: () => boolean,
    ) {
      if (
        disposed ||
        status === "pending" ||
        status === "unknown" ||
        !current()
      )
        return;
      const ticket = ++epoch;
      const owns = () => {
        if (disposed || epoch !== ticket) return false;
        const matched = current();
        return matched && !disposed && epoch === ticket;
      };
      set("pending");
      if (!owns()) return;
      try {
        const result = await callback();
        if (owns())
          set(
            result === "accepted"
              ? "idle"
              : result === "rejected"
                ? "rejected"
                : "unknown",
          );
      } catch {
        if (owns()) set("unknown");
      }
    },
  };
}
