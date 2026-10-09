/** The host owns message identity, storage and delivery. Content is plain text. */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "pending" | "error";
  citations?: readonly { label: string; href: string }[];
}

export function canSubmitMessage(input: {
  value: string;
  maxLength: number;
  disabled?: boolean;
  pending?: boolean;
  composing?: boolean;
}): boolean {
  return (
    !input.disabled &&
    !input.pending &&
    !input.composing &&
    input.value.trim().length > 0 &&
    input.value.length <= input.maxLength
  );
}

export function isMessageSubmitKey(
  event: Pick<
    KeyboardEvent,
    "key" | "shiftKey" | "ctrlKey" | "altKey" | "metaKey" | "isComposing"
  > & { keyCode?: number },
  composing: boolean,
): boolean {
  return (
    event.key === "Enter" &&
    event.keyCode !== 229 &&
    !event.shiftKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey &&
    !event.isComposing &&
    !composing
  );
}

export function citationHref(href: string): string | null {
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}
