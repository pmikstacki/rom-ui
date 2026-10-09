<script lang="ts">
  import type { ChatMessage } from "./contracts.ts";
  import { citationHref } from "./contracts.ts";
  let {
    messages,
    userLabel,
    assistantLabel,
    pendingLabel,
    errorLabel,
    emptyLabel,
  }: {
    messages: readonly ChatMessage[];
    userLabel: string;
    assistantLabel: string;
    pendingLabel: string;
    errorLabel: string;
    emptyLabel: string;
  } = $props();
</script>

{#if messages.length === 0}<p class="text-sm text-muted-foreground">
    {emptyLabel}
  </p>{/if}
<ol class="messages">
  {#each messages as message (message.id)}
    <li class:user={message.role === "user"} class="message">
      <span class="message-author"
        >{message.role === "user" ? userLabel : assistantLabel}</span
      >
      <p class="message-text">{message.content}</p>
      {#if message.status}<p
          role="status"
          class="text-sm text-muted-foreground"
        >
          {message.status === "pending" ? pendingLabel : errorLabel}
        </p>{/if}
      {#if message.citations?.length}
        <ul class="citations">
          {#each message.citations as citation}
            {@const href = citationHref(citation.href)}
            <li>
              {#if href}<a {href} target="_blank" rel="noopener noreferrer"
                  >{citation.label}</a
                >{:else}<span>{citation.label}</span>{/if}
            </li>
          {/each}
        </ul>
      {/if}
    </li>
  {/each}
</ol>

<style>
  .messages {
    display: grid;
    gap: 1rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .message {
    padding: 0.8rem 1rem;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    min-width: 0;
  }
  .message.user {
    margin-left: min(10%, 2.5rem);
    background: var(--muted);
  }
  .message-author {
    display: block;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--muted-foreground);
    margin-bottom: 0.5rem;
  }
  .message-text {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    line-height: 1.65;
    margin: 0;
    font-size: 0.9rem;
  }
  .citations {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0;
    margin: 0.6rem 0 0;
    list-style: none;
    font-size: 0.75rem;
  }
  .citations a {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>
