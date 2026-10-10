/** Host-owned Svelte composition; headless helpers remain in rom-ui/ui. */
export { default as ResponsiveDetails } from "./lib/ui/components/ResponsiveDetails.svelte";
export { default as HistoryList } from "./lib/ui/components/HistoryList.svelte";
export type { HistoryEntry } from "./lib/ui/history.ts";
export type { MessageResolver, UiMessageKey } from "./lib/ui/messages.ts";
export { default as SelectionCard } from "./lib/ui/components/SelectionCard.svelte";
export { default as LayoutControls } from "./lib/ui/components/LayoutControls.svelte";
export type { LayoutCommand, LayoutControlsLabels } from "./lib/ui/components/layout-controls.ts";
export type { CompositionCommandResult } from "./lib/ui/components/selection-card.ts";

export { default as ReferencePicker } from "./lib/ui/components/ReferencePicker.svelte";
export type { ReferenceLookup, ReferenceLookupResult, ReferenceCandidate, ReferenceScope } from "./lib/ui/components/reference-lookup.ts";
export type { ReferencePickerMessages } from "./lib/ui/components/reference-picker.ts";
export { default as ConversationLayout } from './lib/ui/components/ConversationLayout.svelte';
