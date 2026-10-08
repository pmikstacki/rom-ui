export interface SelectionOptions {
  readonly ids: readonly string[];
  readonly initial: readonly string[];
  readonly multiple: boolean;
}

export interface Selection {
  readonly selected: readonly string[];
  toggle(id: string): void;
  replaceAvailable(ids: readonly string[]): void;
  clear(): void;
}

function uniqueIds(ids: readonly string[]): Set<string> {
  const result = new Set<string>();
  for (const id of ids) {
    if (typeof id !== "string" || id.length === 0) {
      throw new TypeError("A selection ID must be a nonempty string");
    }
    if (result.has(id)) throw new TypeError("Duplicate selection ID");
    result.add(id);
  }
  return result;
}

/** Selection contains exact host IDs, never inferred Resource names or permissions. */
export function createSelection(options: SelectionOptions): Selection {
  let available = uniqueIds(options.ids);
  let selected = uniqueIds(options.initial);
  const multiple = options.multiple;
  if (!multiple && selected.size > 1)
    throw new TypeError("Single selection requires at most one ID");
  for (const id of selected) {
    if (!available.has(id)) throw new TypeError("Unavailable selection ID");
  }
  return {
    get selected() {
      return Object.freeze([...selected]);
    },
    toggle(id) {
      if (!available.has(id)) throw new TypeError("Unavailable selection ID");
      if (selected.has(id)) selected.delete(id);
      else if (multiple) selected.add(id);
      else selected = new Set([id]);
    },
    replaceAvailable(ids) {
      const next = uniqueIds(ids);
      available = next;
      selected = new Set([...selected].filter((id) => next.has(id)));
    },
    clear() {
      selected.clear();
    },
  };
}
