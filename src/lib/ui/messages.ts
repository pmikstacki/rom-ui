/** Host catalog keys, never untrusted backend text or inferred domain names. */
export type UiMessageKey = "history.count" | "history.selectionFailed";
export type MessageResolver = (
  key: UiMessageKey,
  values?: Readonly<Record<string, string | number>>,
) => string;
