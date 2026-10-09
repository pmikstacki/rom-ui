function usableFocus(element: Element | null): element is HTMLElement {
  return element instanceof HTMLElement && element.isConnected &&
    !element.matches(":disabled") && element.getAttribute("aria-disabled") !== "true" &&
    !element.closest("[inert]");
}

/** Prevent modal default focus only when this host already owns usable editor focus. */
export function hasFocusedEditor(host: HTMLElement | null): boolean {
  const active = host?.ownerDocument.activeElement ?? null;
  return !!host && usableFocus(active) && host.contains(active);
}

/** Relocate one mounted editor without replacing its draft or valid focused control. */
export function preserveEditor(node: HTMLDivElement, target: HTMLDivElement | null) {
  const origin = node.parentNode;
  function move(next: HTMLDivElement | null) {
    if (!next || node.parentNode === next) return;
    const document = node.ownerDocument;
    const active = document.activeElement;
    const owned = usableFocus(active) && node.contains(active) ? active : null;
    const text = owned instanceof HTMLInputElement || owned instanceof HTMLTextAreaElement ? owned : null;
    const selection = text && text.selectionStart !== null && text.selectionEnd !== null
      ? { start: text.selectionStart, end: text.selectionEnd, direction: text.selectionDirection ?? "none" }
      : null;
    next.appendChild(node);
    // A synchronous blur handler may deliberately move focus elsewhere. Respect it.
    if (!owned || !usableFocus(owned) || !node.contains(owned) ||
        (document.activeElement !== document.body && document.activeElement !== owned)) return;
    owned.focus({ preventScroll: true });
    if (text && selection && document.activeElement === owned)
      text.setSelectionRange(selection.start, selection.end, selection.direction);
  }
  move(target);
  return {
    update: move,
    destroy() {
      if (origin && node.parentNode !== origin) origin.appendChild(node);
    },
  };
}
