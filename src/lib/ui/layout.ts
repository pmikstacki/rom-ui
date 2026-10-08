export interface LayoutItem {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly visible: boolean;
}
export interface LayoutCatalogEntry {
  readonly id: string;
  readonly minWidth: number;
  readonly maxWidth: number;
  readonly minHeight: number;
  readonly maxHeight: number;
}
export interface LayoutOptions {
  readonly catalog: readonly LayoutCatalogEntry[];
  readonly columns: number;
  readonly maxRows: number;
  readonly maxItems: number;
}
export type LayoutResult =
  | { readonly valid: true; readonly layout: readonly Readonly<LayoutItem>[] }
  | {
      readonly valid: false;
      readonly code:
        "LayoutShape" | "LayoutLimit" | "LayoutId" | "LayoutBounds";
    };
const fields = ["id", "x", "y", "width", "height", "visible"];
const positive = (value: unknown): value is number =>
  Number.isSafeInteger(value) && (value as number) > 0;
const nonnegative = (value: unknown): value is number =>
  Number.isSafeInteger(value) && (value as number) >= 0;

/** Validate stored presentation, never choose a fallback, grant access, or persist it. */
export function validateLayout(
  input: unknown,
  options: LayoutOptions,
): LayoutResult {
  const { columns, maxRows, maxItems } = options;
  if (
    ![columns, maxRows, maxItems].every(positive) ||
    !Array.isArray(options.catalog)
  ) {
    throw new TypeError("Invalid layout configuration");
  }
  const catalog = new Map<string, LayoutCatalogEntry>();
  for (const supplied of options.catalog) {
    const { id, minWidth, maxWidth, minHeight, maxHeight } = supplied;
    const entry = { id, minWidth, maxWidth, minHeight, maxHeight };
    if (
      typeof entry.id !== "string" ||
      !entry.id ||
      catalog.has(entry.id) ||
      ![entry.minWidth, entry.maxWidth, entry.minHeight, entry.maxHeight].every(
        positive,
      ) ||
      entry.minWidth > entry.maxWidth ||
      entry.minHeight > entry.maxHeight
    ) {
      throw new TypeError("Invalid layout catalog");
    }
    catalog.set(entry.id, { ...entry });
  }
  const ids = new Set<string>();
  const layout: Readonly<LayoutItem>[] = [];
  try {
    if (!Array.isArray(input)) return { valid: false, code: "LayoutShape" };
    const length = input.length;
    if (!Number.isSafeInteger(length) || length < 0 || length > maxItems)
      return { valid: false, code: "LayoutLimit" };
    for (let index = 0; index < length; index++) {
      const raw = input[index];
      if (
        raw === null ||
        typeof raw !== "object" ||
        Array.isArray(raw) ||
        Reflect.ownKeys(raw).length !== fields.length ||
        !fields.every((key) => Object.hasOwn(raw, key))
      )
        return { valid: false, code: "LayoutShape" };
      const { id, x, y, width, height, visible } = raw;
      if (typeof id !== "string" || !catalog.has(id) || ids.has(id))
        return { valid: false, code: "LayoutId" };
      const limits = catalog.get(id)!;
      if (
        !nonnegative(x) ||
        !nonnegative(y) ||
        !positive(width) ||
        !positive(height) ||
        typeof visible !== "boolean" ||
        width < limits.minWidth ||
        width > limits.maxWidth ||
        height < limits.minHeight ||
        height > limits.maxHeight ||
        width > columns ||
        height > maxRows ||
        x > columns - width ||
        y > maxRows - height
      ) {
        return { valid: false, code: "LayoutBounds" };
      }
      ids.add(id);
      layout.push(Object.freeze({ id, x, y, width, height, visible }));
    }
  } catch {
    return { valid: false, code: "LayoutShape" };
  }
  return Object.freeze({ valid: true, layout: Object.freeze(layout) });
}
