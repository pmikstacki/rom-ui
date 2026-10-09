import { captureEditorFocus, preserveEditor } from "rom-ui/ui/commands/preserve-editor";
import { tick } from "svelte";

type Case = "hidden-target" | "external-departure" | "body-departure" | "late-target" | "rapid-reversal" | "disabled" | "inert" | "detached" | "destroyed";
const execute = async (kind: Case) => {
  document.body.replaceChildren();
  const source = document.createElement("div"), destination = document.createElement("div"), editor = document.createElement("div"), control = document.createElement("textarea"), outside = document.createElement("button");
  document.body.append(source, destination, outside);source.append(editor);editor.append(control);outside.textContent = "Outside";
  control.value = "Raw unchanged draft";control.focus();control.setSelectionRange(2, 9, "backward");
  const action = preserveEditor(editor, source);
  captureEditorFocus(source, destination);
  if (kind === "external-departure") outside.focus();
  if (kind === "body-departure") control.blur();
  if (kind === "disabled") control.disabled = true;
  if (kind === "inert") editor.inert = true;
  if (kind === "detached") control.remove();
  source.hidden = true; destination.hidden = true;
  action.update(destination);
  if (kind === "rapid-reversal") {
    captureEditorFocus(destination, source);action.update(source);source.hidden = false;
  } else if (kind === "destroyed") {
    captureEditorFocus(destination, source);source.hidden = false;action.destroy();
  } else if (kind === "late-target") {
    await tick();destination.hidden = false;
  } else destination.hidden = false;
  await tick();await new Promise(requestAnimationFrame);
  const active = document.activeElement;
  const result = { focused: active === control, outside: active === outside, body: active === document.body, same_node: editor.firstElementChild === control, value: control.value, selection: [control.selectionStart, control.selectionEnd, control.selectionDirection], in_source: source.contains(editor), in_destination: destination.contains(editor), remounted_focus: false };
  if (kind === "late-target" || kind === "destroyed") {document.body.append(editor);await tick();result.remounted_focus = document.activeElement === control;}
  return result;
};
Object.assign(window, { runFocusBoundary: execute });
