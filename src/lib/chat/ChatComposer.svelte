<script lang="ts">
  import { onDestroy, type Snippet } from "svelte";
  import { Button } from "../components/ui/button/index.js";
  import { Textarea } from "../components/ui/textarea/index.js";
  import { canSubmitMessage, isMessageSubmitKey } from "./contracts.ts";

  const generatedId = $props.id();
  let {
    id = generatedId,
    value = $bindable(""),
    rows = 2,
    sendContent,
    label,
    placeholder,
    sendLabel,
    hint,
    errorLabel,
    authorityToken,
    onSubmit,
    maxLength = 4000,
    disabled = false,
  }: {
    id?: string;
    rows?: number;
    sendContent?: Snippet;
    value?: string;
    label: string;
    placeholder?: string;
    sendLabel: string;
    hint?: string;
    errorLabel: string;
    authorityToken: unknown;
    onSubmit: (message: string) => void | Promise<void>;
    maxLength?: number;
    disabled?: boolean;
  } = $props();
  let pending = $state(false);
  let failed = $state(false);
  let composing = $state(false);
  let epoch = 0;
  const canSubmit = $derived(
    canSubmitMessage({ value, maxLength, disabled, pending, composing }),
  );
  $effect(() => {
    authorityToken;
    epoch++;
    pending = false;
    failed = false;
    composing = false;
  });
  onDestroy(() => {
    epoch++;
  });
  async function submit() {
    if (!canSubmit) return;
    const ticket = ++epoch;
    const owner = authorityToken;
    const draft = value;
    pending = true;
    failed = false;
    try {
      await onSubmit(draft.trim());
      if (
        ticket === epoch &&
        Object.is(owner, authorityToken) &&
        value === draft
      )
        value = "";
    } catch {
      if (ticket === epoch && Object.is(owner, authorityToken)) failed = true;
    } finally {
      if (ticket === epoch && Object.is(owner, authorityToken)) pending = false;
    }
  }
</script>

<form
  class="composer"
  aria-busy={pending}
  onsubmit={(event) => {
    event.preventDefault();
    void submit();
  }}
>
  <label for={id} class="sr-only">{label}</label>
  <Textarea
    {id}
    bind:value
    {placeholder}
    {disabled}
    {rows}
    maxlength={maxLength}
    aria-describedby={`${id}-hint${failed ? ` ${id}-error` : ""}`}
    aria-invalid={value.length > maxLength}
    oncompositionstart={() => {
      composing = true;
    }}
    oncompositionend={() => {
      composing = false;
    }}
    onkeydown={(event) => {
      if (isMessageSubmitKey(event, composing)) {
        event.preventDefault();
        void submit();
      }
    }}
  />
  <div class="composer-actions">
    <span id={`${id}-hint`} class="text-xs text-muted-foreground"
      >{hint ?? ""} <span>{value.length}/{maxLength}</span></span
    >
    <Button type="submit" size="sm" disabled={!canSubmit} aria-label={sendLabel}
      >{#if sendContent}{@render sendContent()}{:else}{sendLabel}{/if}</Button
    >
  </div>
  {#if failed}<p
      id={`${id}-error`}
      role="status"
      class="text-sm text-destructive"
    >
      {errorLabel}
    </p>{/if}
</form>

<style>
  .composer {
    display: grid;
    gap: 0.65rem;
    min-width: 0;
  }
  .composer :global(textarea) {
    min-height: 3.5rem;
    max-height: min(8rem, 22dvh);
    resize: vertical;
  }
  .composer-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }
  .composer-actions span span {
    white-space: nowrap;
  }
</style>
