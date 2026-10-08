export interface HistoryEntry {
  readonly id: string;
  readonly title: string;
  /** Display instant in integer Unix milliseconds; never a mutation value coercion. */
  readonly instant: number;
  readonly count?: number;
}
const bytes = (text: string) => new TextEncoder().encode(text).byteLength;
/** Capture bounded host disclosures. This helper neither queries nor grants access. */
export function captureHistory(
  entries: readonly HistoryEntry[],
  maxEntries: number,
): readonly Readonly<HistoryEntry>[] {
  if (
    !Number.isSafeInteger(maxEntries) ||
    maxEntries < 1 ||
    !Array.isArray(entries)
  )
    throw new TypeError("Invalid history limit");
  const length = entries.length;
  if (!Number.isSafeInteger(length) || length < 0 || length > maxEntries)
    throw new TypeError("Invalid history limit");
  const ids = new Set<string>();
  const captured: Readonly<HistoryEntry>[] = [];
  for (let index = 0; index < length; index++) {
    const { id, title, instant, count } = entries[index];
    if (
      typeof id !== "string" ||
      !id ||
      bytes(id) > 1024 ||
      ids.has(id) ||
      typeof title !== "string" ||
      !title ||
      bytes(title) > 4096 ||
      !Number.isSafeInteger(instant) ||
      Math.abs(instant) > 8640000000000000 ||
      (count !== undefined && (!Number.isSafeInteger(count) || count < 0))
    )
      throw new TypeError("Invalid history entry");
    ids.add(id);
    captured.push(
      Object.freeze({
        id,
        title,
        instant,
        ...(count === undefined ? {} : { count }),
      }),
    );
  }
  return Object.freeze(captured);
}
export function formatHistoryInstant(
  instant: number,
  locale: string,
  timeZone: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(instant);
}
