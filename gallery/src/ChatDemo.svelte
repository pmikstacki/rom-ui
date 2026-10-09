<script lang="ts">
  import { tick } from "svelte";
  import { Button } from "rom-ui/controls";
  import {
    ConversationLayout,
    ChatComposer,
    ChatMessages,
    type ChatMessage,
  } from "rom-ui/chat";
  import { ResponsiveDetails } from "rom-ui/ui/components";
  import {
    preserveEditor,
    captureEditorFocus,
  } from "rom-ui/ui/commands/preserve-editor";
  let draft = $state("");
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
        "Cześć! To galeria komponentów rozmowy.\n\nMożesz wpisać wiadomość, rozwinąć panel i sprawdzić zachowanie na telefonie. Odpowiedzi są symulowane lokalnie — żaden tekst nie trafia do modelu AI.",
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
          "To lokalna odpowiedź demonstracyjna.\n\nW swojej aplikacji podłączysz tu dowolny model, strumień odpowiedzi lub kolejkę zadań. Komponenty odpowiadają za prezentację i interakcję.",
        citations: [
          {
            label: "Repozytorium ROM UI ↗",
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
    <span class="mini-tag">DEMO LOKALNE</span>
    <p class="muted">Twój model. Twoje dane. Gotowa przestrzeń do rozmowy.</p>
  </div>
  <Button
    bind:ref={opener}
    variant="outline"
    onclick={() => {
      open = true;
    }}>Otwórz panel boczny ↗</Button
  >
</div>
{#snippet heading()}
  <div class="assistant-heading">
    <span class="assistant-mark" aria-hidden="true">✳</span>
    <div>
      <h3>Asystent</h3>
      <span class="muted">Przykład interfejsu czatu AI</span>
    </div>
  </div>
{/snippet}
{#snippet messageBody()}
  <ChatMessages
    {messages}
    userLabel="Ty"
    assistantLabel="ROM Assistant"
    pendingLabel="Przygotowuję odpowiedź…"
    errorLabel="Błąd odpowiedzi"
    emptyLabel="Rozpocznij nową rozmowę."
  />
{/snippet}
{#snippet composer()}
  <ChatComposer
    bind:value={draft}
    authorityToken={authority}
    onSubmit={send}
    label="Wiadomość"
    placeholder="Napisz wiadomość…"
    sendLabel="Wyślij"
    hint="Enter wysyła · Shift+Enter nowa linia"
    errorLabel="Nie udało się wysłać. Spróbuj ponownie."
  />
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
      >Historia rozmów <span aria-hidden="true">{history ? "−" : "+"}</span
      ></Button
    ><Button variant="ghost" size="sm" onclick={newConversation}
      >Nowa rozmowa</Button
    >
  </div>
  {#if history}<p class="muted session-note">
      Bieżąca sesja · {messages.filter((message) => message.role === "user")
        .length} wiadomości. Historia w tym przykładzie nie jest zapisywana.
    </p>{/if}
{/snippet}
<div class="chat-stage" class:expanded hidden={open}>
  <div class="inline-conversation" bind:this={inlineTarget}></div>
</div>
<div class="demo-options">
  <label class="checkbox-row"
    ><input type="checkbox" bind:checked={fail} /> Symuluj błąd wysyłania</label
  >
  <p>Sprawdź zachowanie szkicu po odrzuceniu wiadomości.</p>
</div>
<ResponsiveDetails
  bind:open
  {opener}
  id="gallery-chat-panel"
  title="Asystent w panelu"
  description="Responsywny panel rozmowy z zachowaniem szkicu."
  closeLabel="Zamknij panel rozmowy"
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
    label="Przykład rozmowy"
    bodyLabel="Wiadomości rozmowy"
    header={heading}
    body={messageBody}
    footer={composer}
    history={sessions}
    bind:expanded
    bind:bodyRef
    expansion={{ expandLabel: "Rozwiń", collapseLabel: "Zwiń" }}
  />
</div>
<div class="note-row">
  <span class="mini-tag">ROM + ASTRAL PLANE</span>
  <p>
    Układ z ROM oraz interakcje inspirowane asystentem Astral Plane. Bez
    zależności od konkretnego backendu.
  </p>
</div>
