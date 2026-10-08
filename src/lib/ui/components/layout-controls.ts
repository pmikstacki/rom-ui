import {
  validateLayout,
  type LayoutItem,
  type LayoutOptions,
  type LayoutResult,
} from "../layout.ts";
export const layoutActions = [
  "left",
  "right",
  "up",
  "down",
  "wider",
  "narrower",
  "taller",
  "shorter",
  "show",
  "hide",
] as const;
export type LayoutAction = (typeof layoutActions)[number];
export interface LayoutCommand {
  readonly id: string;
  readonly action: LayoutAction;
}
export type LayoutControlsLabels = Readonly<
  Record<LayoutAction | "invalid" | "failed" | "unknown", string>
>;
/** Capture host configuration once; validateLayout remains the bounds authority. */
export function captureLayoutOptions(options: LayoutOptions): LayoutOptions {
  const { columns, maxRows, maxItems, catalog } = options;
  if (!Array.isArray(catalog)) throw TypeError("Invalid layout catalog");
  const entries = [];
  const length = catalog.length;
  if (!Number.isSafeInteger(length) || length < 0)
    throw TypeError("Invalid layout catalog");
  for (let index = 0; index < length; index++) {
    const { id, minWidth, maxWidth, minHeight, maxHeight } = catalog[index];
    entries.push(
      Object.freeze({ id, minWidth, maxWidth, minHeight, maxHeight }),
    );
  }
  const captured = Object.freeze({
    columns,
    maxRows,
    maxItems,
    catalog: Object.freeze(entries),
  });
  validateLayout([], captured);
  return captured;
}
/** Unit-cell commands propose detached presentation; they never persist or choose a fallback. */
export function proposeLayoutChange(
  input: unknown,
  options: LayoutOptions,
  command: { readonly id: string; readonly action: string },
): LayoutResult {
  const captured = captureLayoutOptions(options);
  const admitted = validateLayout(input, captured);
  if (!admitted.valid) return admitted;
  const { id, action } = command;
  if (
    !layoutActions.some((value) => value === action) ||
    !admitted.layout.some((item) => item.id === id)
  )
    return { valid: false, code: "LayoutId" };
  const proposal = admitted.layout.map((item) => {
    if (item.id !== id) return item;
    const next: LayoutItem = {
      ...item,
      x: item.x + (action === "right" ? 1 : action === "left" ? -1 : 0),
      y: item.y + (action === "down" ? 1 : action === "up" ? -1 : 0),
      width:
        item.width + (action === "wider" ? 1 : action === "narrower" ? -1 : 0),
      height:
        item.height + (action === "taller" ? 1 : action === "shorter" ? -1 : 0),
      visible:
        action === "show" ? true : action === "hide" ? false : item.visible,
    };
    return next;
  });
  return validateLayout(proposal, captured);
}
