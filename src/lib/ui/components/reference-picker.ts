import {
  REFERENCE_BYTES,
  REFERENCE_LIMIT,
  REFERENCE_SEARCH_BYTES,
  type ReferenceLookupResult,
} from "./reference-lookup.ts";

export interface ReferencePickerMessages {
  valueLabel: string;
  chooseLabel: string;
  searchLabel: string;
  idPlaceholder: string;
  searchPlaceholder: string;
  loading: string;
  empty: string;
  candidateHint: string;
  more: string;
  manualHint: string;
  unavailable: string;
  failed: string;
  searchTooLong: string;
  attemptsExceeded: string;
  invalidId: string;
}
export function referenceSearchAllowed(search: string): boolean {
  return new TextEncoder().encode(search).byteLength <= REFERENCE_SEARCH_BYTES;
}
/** Detach bounded host results before admitting them into picker state. */
export function admitReferenceResult(input: unknown): ReferenceLookupResult {
  if (input === null || typeof input !== "object")
    throw TypeError("Invalid reference result");
  const source = input as Record<string, unknown>;
  let result: ReferenceLookupResult;
  if (source.status === "ready") {
    if (
      !Array.isArray(source.candidates) ||
      source.candidates.length > REFERENCE_LIMIT ||
      typeof source.limited !== "boolean"
    )
      throw TypeError("Invalid reference candidates");
    const ids = new Set<string>();
    const candidates = source.candidates.map((candidate) => {
      if (
        candidate === null ||
        typeof candidate !== "object" ||
        typeof candidate.id !== "string" ||
        !candidate.id.length ||
        typeof candidate.title !== "string" ||
        ids.has(candidate.id)
      )
        throw TypeError("Invalid reference candidate");
      ids.add(candidate.id);
      return { id: candidate.id, title: candidate.title };
    });
    result = { status: "ready", candidates, limited: source.limited };
  } else {
    if (
      !["unavailable", "denied", "error", "cancelled"].includes(
        String(source.status),
      ) ||
      typeof source.message !== "string"
    )
      throw TypeError("Invalid reference status");
    result = {
      status: source.status as "error" | "denied" | "cancelled" | "unavailable",
      message: source.message,
    };
  }
  if (new TextEncoder().encode(JSON.stringify(result)).byteLength > REFERENCE_BYTES)
    throw RangeError("Reference result byte limit exceeded");
  return result;
}
