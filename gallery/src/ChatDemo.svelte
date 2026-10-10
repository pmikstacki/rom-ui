<script lang="ts">
  import Showcase from "./Showcase.svelte";
  import { tick } from "svelte";
  import AgentActivityDemo from "./AgentActivityDemo.svelte";
  import { Button } from "rom-ui/controls";
  import {
    ConversationLayout,
    ChatComposer,
    ChatMessages,
    type ChatMessage,
    type ChatComposerActions,
  } from "rom-ui/chat";
  import { ResponsiveDetails } from "rom-ui/ui/components";
  import {
    preserveEditor,
    captureEditorFocus,
  } from "rom-ui/ui/commands/preserve-editor";
  let draft = $state("");
  let microphoneSelected = $state(false);
  let toolsOpen = $state(false);
  const toolsId = $props.id();
  let expanded = $state(false);
  let open = $state(false);
  let opener = $state<HTMLElement | null>(null);
  let bodyRef = $state<HTMLDivElement | null>(null);
  let inlineTarget = $state<HTMLDivElement | null>(null);
  let panelTarget = $state<HTMLDivElement | null>(null);
  $effect.pre(() => {
    captureEditorFocus(
      open ? inlineTarget : panelTarget,
      open ? panelTarget : inlineTarget,
    );
  });
  let history = $state(false);
  let fail = $state(false);
  let authority = $state(0);
  let messages = $state<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! This is the conversation component gallery.\n\nYou can write a message, expand the panel, and try it on a phone. Responses are simulated locally — no text is sent to an AI model.",
    },
  ]);
  let count = 0;
  async function send(text: string) {
    const owner = authority;
    const rejecting = fail;
    await new Promise((resolve) => setTimeout(resolve, 550));
    if (owner !== authority) return;
    if (rejecting) throw new Error("demo");
    messages = [
      ...messages,
      { id: `user-${++count}`, role: "user", content: text },
      {
        id: `assistant-${++count}`,
        role: "assistant",
        content:
          "This is a local demo response.\n\nIn your application, connect any model, response stream, or task queue here. The components handle presentation and interaction.",
        citations: [
          {
            label: "ROM UI repository ↗",
            href: "https://github.com/pmikstacki/rom-ui",
          },
        ],
      },
    ];
    await tick();
    bodyRef?.scrollTo({ top: bodyRef.scrollHeight, behavior: "instant" });
  }
  function newConversation() {
    authority++;
    messages = [];
    draft = "";
  }
</script>

<div class="chat-intro">
  <div>
    <span class="mini-tag">LOCAL DEMO</span>
    <p class="muted">Your model. Your data. A ready space for conversation.</p>
  </div>
  <Button
    bind:ref={opener}
    variant="outline"
    onclick={() => {
      open = true;
    }}>Open side panel ↗</Button
  >
</div>
{#snippet heading()}
  <div class="assistant-heading">
    <span class="assistant-mark" aria-hidden="true">✳</span>
    <div>
      <h3>Assistant</h3>
      <span class="muted">Example AI chat interface</span>
    </div>
  </div>
{/snippet}
{#snippet messageBody()}
  <ChatMessages
    {messages}
    userLabel="You"
    assistantLabel="ROM Assistant"
    pendingLabel="Preparing a response…"
    errorLabel="Response error"
    emptyLabel="Start a new conversation."
  />
{/snippet}
{#snippet composer()}
  <ChatComposer
    bind:value={draft}
    authorityToken={authority}
    onSubmit={send}
    label="Message"
    placeholder="Write a message…"
    sendLabel="Send"
    hint="Enter sends · Shift+Enter adds a new line"
    errorLabel="Could not send. Try again."
    actions={messageActions}
  />
{/snippet}
{#snippet messageActions(state: ChatComposerActions)}
  <Button
    type="button"
    variant="ghost"
    size="icon"
    disabled={state.disabled}
    aria-label="Microphone extension"
    aria-pressed={microphoneSelected}
    onclick={() => {
      microphoneSelected = !microphoneSelected;
    }}
  >
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
    >
      <rect x="9" y="2" width="6" height="13" rx="3" />
      <path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8" />
    </svg>
  </Button>
  <div class="extension-menu" role="group" aria-label="Composer extension menu">
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={state.disabled}
      id={`${toolsId}-trigger`}
      onkeydown={(event) => {
        if (event.key === "Escape") toolsOpen = false;
      }}
      aria-label="More message actions"
      aria-expanded={toolsOpen && !state.disabled}
      aria-controls={toolsId}
      onclick={() => {
        toolsOpen = !toolsOpen;
      }}
    >
      <svg
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"><path d="M12 5v14M5 12h14" /></svg
      >
    </Button>
    {#if toolsOpen && !state.disabled}
      <div id={toolsId} class="extension-dropdown">
        <Button
          type="button"
          variant="ghost"
          disabled={state.disabled}
          onkeydown={(event) => {
            if (event.key === "Escape") {
              toolsOpen = false;
              document.getElementById(`${toolsId}-trigger`)?.focus();
            }
          }}
          onclick={() => {
            draft += `${draft ? " " : ""}resource/a`;
            toolsOpen = false;
          }}
        >
          Insert resource reference
        </Button>
      </div>
    {/if}
  </div>
  {#if microphoneSelected}<span class="extension-status" role="status"
      >Microphone extension selected · demo only</span
    >{/if}
{/snippet}
{#snippet sessions()}
  <div class="session-heading">
    <Button
      variant="ghost"
      size="sm"
      aria-expanded={history}
      onclick={() => {
        history = !history;
      }}
      >Conversation history <span aria-hidden="true">{history ? "−" : "+"}</span
      ></Button
    ><Button variant="ghost" size="sm" onclick={newConversation}
      >New conversation</Button
    >
  </div>
  {#if history}<p class="muted session-note">
      Current session · {messages.filter((message) => message.role === "user")
        .length} messages. History is not saved in this example.
    </p>{/if}
{/snippet}
<div class="chat-stage" class:expanded hidden={open}>
  <div class="inline-conversation" bind:this={inlineTarget}></div>
</div>
<div class="demo-options">
  <label class="checkbox-row"
    ><input type="checkbox" bind:checked={fail} /> Simulate send failure</label
  >
  <p>Check how the draft behaves when a message is rejected.</p>
</div>
<ResponsiveDetails
  bind:open
  {opener}
  id="gallery-chat-panel"
  title="Assistant panel"
  description="A responsive conversation panel that preserves the draft."
  closeLabel="Close conversation panel"
  breakpoint="(max-width: 799px)"
  showDesktopHeader={true}
>
  <div class="panel-conversation" bind:this={panelTarget}></div>
</ResponsiveDetails>
<div
  class="editor-transport"
  use:preserveEditor={open ? panelTarget : inlineTarget}
>
  <ConversationLayout
    label="Example conversation"
    bodyLabel="Conversation messages"
    header={heading}
    body={messageBody}
    footer={composer}
    history={sessions}
    bind:expanded
    bind:bodyRef
    expansion={{ expandLabel: "Expand", collapseLabel: "Collapse" }}
  />
</div>
<div class="note-row">
  <span class="mini-tag">ROM + ASTRAL PLANE</span>
  <p>
    Layout from ROM, with interactions inspired by the Astral Plane assistant.
    Independent of any specific backend.
  </p>
</div>

<Showcase title="Agent activity" api="rom-ui/chat" level={2}>
  <AgentActivityDemo />
</Showcase>

<style>
  .extension-menu {
    position: relative;
  }
  .extension-dropdown {
    position: absolute;
    bottom: calc(100% + 0.4rem);
    left: 0;
    z-index: 20;
    width: max-content;
    max-width: min(18rem, 75vw);
    padding: 0.35rem;
    border: 1px solid var(--border);
    border-radius: 0.65rem;
    background: var(--background);
    box-shadow: 0 8px 24px #0002;
  }
  .extension-status {
    font-size: 0.7rem;
    color: var(--muted-foreground);
  }
</style>
