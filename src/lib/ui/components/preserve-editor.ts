import { tick } from "svelte";

function usableFocus(element: Element | null): element is HTMLElement {
  return element instanceof HTMLElement && element.isConnected &&
    !element.matches(":disabled") && element.getAttribute("aria-disabled") !== "true" &&
    !element.closest("[inert]");
}
type Snapshot = {
  control: HTMLElement;
  selection: { start: number; end: number; direction: "forward" | "backward" | "none" } | null;
};
type Intent = { snapshot: Snapshot; canceled: boolean; moving: boolean; release: () => void };
const intents = new WeakMap<HTMLElement, Intent>();
const controlIntents = new WeakMap<HTMLElement, Intent>();
const pendingIntents = new Set<Intent>();

function snapshotFocus(root: HTMLElement): Snapshot | null {
  const control = root.ownerDocument.activeElement;
  if (!usableFocus(control) || !root.contains(control)) return null;
  const text = control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement ? control : null;
  return { control, selection: text && text.selectionStart !== null && text.selectionEnd !== null
    ? { start: text.selectionStart, end: text.selectionEnd, direction: text.selectionDirection ?? "none" }
    : null };
}
function restore(host: HTMLElement, intent: Intent): void {
  const { control, selection } = intent.snapshot, document = host.ownerDocument;
  if (intent.canceled || !host.isConnected || host.closest("[hidden]") ||
      !usableFocus(control) || !host.contains(control)) return;
  if (document.activeElement === control) return;
  if (document.activeElement !== document.body) return;
  control.focus({ preventScroll: true });
  if (selection && document.activeElement === control &&
      (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement))
    control.setSelectionRange(selection.start, selection.end, selection.direction);
}
function queueIntent(host: HTMLElement, snapshot: Snapshot): Intent {
  intents.get(host)?.release();
  const control = snapshot.control;
  controlIntents.get(control)?.release();
  const intent: Intent = { snapshot, canceled: false, moving: false, release() {
    control.removeEventListener("focusout", depart);
    if (intents.get(host) === intent) intents.delete(host);
    if (controlIntents.get(control) === intent) controlIntents.delete(control);
    pendingIntents.delete(intent);
  } };
  function depart(event: FocusEvent) {
    if (intent.moving) return;
    // Reparenting or hiding the old host can blur implicitly. An explicit blur from
    // a visible editor, or a transfer to another control, relinquishes ownership.
    if (event.relatedTarget || !control.closest("[hidden]")) intent.canceled = true;
  }
  control.addEventListener("focusout", depart);
  intents.set(host, intent);
  controlIntents.set(control, intent);
  pendingIntents.add(intent);
  void tick().then(() => {
    if (intents.get(host) === intent) restore(host, intent);
    intent.release();
  });
  return intent;
}

/** Capture one imminent open-editor relocation before its old host becomes hidden. */
export function captureEditorFocus(source: HTMLElement | null, destination: HTMLElement | null): void {
  if (!source || !destination || source === destination) return;
  const previous = intents.get(source);
  const snapshot = snapshotFocus(source) ?? (previous && !previous.canceled &&
    source.contains(previous.snapshot.control) ? previous.snapshot : null);
  if (snapshot) queueIntent(destination, snapshot);
}

/** Keep default modal focus when there is no valid transferred editor ownership. */
export function hasFocusedEditor(host: HTMLElement | null): boolean {
  if (!host) return false;
  if (snapshotFocus(host)) return true;
  const intent = intents.get(host);
  return !!intent && !intent.canceled && usableFocus(intent.snapshot.control) &&
    host.contains(intent.snapshot.control) && host.ownerDocument.activeElement === host.ownerDocument.body;
}

/** Move one mounted editor. Focus intents expire after this DOM flush, not a timer. */
export function preserveEditor(node: HTMLDivElement, target: HTMLDivElement | null) {
  const origin = node.parentNode;
  function move(next: HTMLDivElement | null) {
    if (!next || node.parentNode === next) return;
    const snapshot = snapshotFocus(node);
    const intent = intents.get(next) ?? (snapshot ? queueIntent(next, snapshot) : null);
    if (intent) intent.moving = true;
    try { next.appendChild(node); } finally { if (intent) intent.moving = false; }
    if (intent) restore(next, intent);
  }
  move(target);
  return {
    update: move,
    destroy() {
      for (const pending of pendingIntents) {
        if (node.contains(pending.snapshot.control)) {
          pending.canceled = true;
          pending.release();
        }
      }
      const intent = node.parentElement ? intents.get(node.parentElement) : null;
      if (intent) intent.moving = true;
      try { if (origin && node.parentNode !== origin) origin.appendChild(node); }
      finally { if (intent) intent.moving = false; }
    },
  };
}
