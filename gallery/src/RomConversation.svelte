<script lang="ts">
  import { ChatComposer, ChatMessages, type ChatMessage, type ChatComposerActions } from "rom-ui/chat";
  import { Button } from "rom-ui/controls";
  import type { ProjectedView, ResourceDescriptor } from "rom-studio/client";
  let { record, descriptor, disabled, authorityToken, send }: {
    record: ProjectedView;
    descriptor: ResourceDescriptor;
    disabled: boolean;
    authorityToken: string | null;
    send: (text: string) => Promise<void>;
  } = $props();
  let draft = $state("");
  let detailsOpen = $state(false);
  const scope = $derived(`${authorityToken}:${record.key.kind}:${record.key.id}`);
  $effect(() => { scope; draft = ""; detailsOpen = false; });
  const messages = $derived.by(() => {
    const value = record.value;
    if (!value || typeof value !== "object" || Array.isArray(value)
      || !Array.isArray(value.messages) || value.messages.length > 128) return null;
    const result: ChatMessage[] = [];
    for (const [index, message] of value.messages.entries()) {
      if (!message || typeof message !== "object" || Array.isArray(message)
        || message.id !== `message-${index}` || !["user", "assistant"].includes(String(message.role))
        || typeof message.content !== "string" || !message.content.trim()
        || message.content.length > 4000 || Object.keys(message).length !== 3) return null;
      result.push({ id: message.id, role: message.role as "user" | "assistant", content: message.content });
    }
    return result;
  });
  const canSend = $derived(descriptor.actions.includes("send")
    && descriptor.action_inputs.some(action => action.name === "send"
      && action.input?.type === "scalar" && action.input.value.shape.type === "string"));
</script>

<section aria-label="ROM conversation">
  <p>Conversation history is stored in ROM. This demo does not invoke an AI model.</p>
  {#if messages}
    <div data-testid="rom-conversation-messages" style="max-height: 320px; overflow-y: auto">
      <ChatMessages {messages} userLabel="You" assistantLabel="Assistant" pendingLabel="Sending…"
        errorLabel="Message failed." emptyLabel="Start a conversation." />
    </div>
    {#snippet actions(state: ChatComposerActions)}
      <Button variant="ghost" size="icon" aria-label="Conversation details" aria-expanded={detailsOpen}
        disabled={state.disabled} onclick={() => detailsOpen = !detailsOpen}>ⓘ</Button>
    {/snippet}
    {#if detailsOpen}<p>Resource: {record.key.id} · Revision: {String(record.revision)} · Messages: {messages.length}/128</p>{/if}
    {#if !canSend}<p>Sending is unavailable for this view.</p>{/if}
    <ChatComposer bind:value={draft} authorityToken={scope} onSubmit={send} {actions}
      disabled={disabled || !canSend || messages.length >= 128} label="ROM message" placeholder="Write a message…"
      sendLabel="Send to ROM" hint="Enter to send · Shift+Enter for a new line"
      errorLabel="Message was not confirmed. Your text is preserved; restore and retry any saved mutation before sending again." />
  {:else}
    <p>The current session has no supported conversation history.</p>
  {/if}
</section>
