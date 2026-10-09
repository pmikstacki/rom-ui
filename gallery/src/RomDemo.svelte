<script lang="ts">
  import { onMount, setContext } from "svelte";
  import { REFERENCE_LOOKUP } from "rom-ui/ui/commands/reference-lookup";
  import type { ReferenceLookup } from "rom-studio/ui/components";
  import { Button } from "rom-ui/controls";
  import { ActionForm } from "rom-studio/forms";
  import { createStudioBootstrap, parseStudioBootstrap } from "rom-studio";
  import type { ApplicationState } from "rom-studio/application";
  import type { SessionLifecycleState } from "rom-studio/auth";
  import type { WireValue, ResourceDescriptor, Operation } from "rom-studio/client";
  import Showcase from "./Showcase.svelte";
  import RomResourceForm from "./RomResourceForm.svelte";
  import RomTaskActivity from "./RomTaskActivity.svelte";
  import RomWorkflow from "./RomWorkflow.svelte";
  import { createRomConnection } from "./rom-connection";
  const componentId = $props.id();
  const resourceKindId = `${componentId}-resource-kind`;
  let connection = $state<ReturnType<typeof createRomConnection> | null>(null);
  let appState = $state.raw<ApplicationState | null>(null);
  let session = $state.raw<SessionLifecycleState | null>(null);
  let error = $state("");
  let restoreEpoch = $state(0);
  let mutationsInFlight = $state(0);
  let providers = $state<{ id: string; label: string }[]>([]);
  const blocked = $derived(appState?.recovery?.state.hasUnresolvedIntent ?? false);
  const submitting = $derived(appState?.recovery?.state.phase === "submitting");
  const draftBlocked = $derived(appState?.editor?.status === "writing" || appState?.editor?.status === "error");
  const descriptor = $derived(appState?.descriptors.find(item => item.kind === appState?.kind));
  const referenceDefinition = $derived(JSON.stringify(appState?.phase === "ready" ? appState.descriptors : []));
  const referenceScope = $derived(session?.status === "authenticated" && appState?.session?.status === "active" ? session.identity?.generation : null);
  // Snapshot copies retain the same token until authority or the disclosed definition changes.
  const referenceDescriptors = $derived.by(() => referenceScope ? JSON.parse(referenceDefinition) as ResourceDescriptor[] : []);
  setContext<ReferenceLookup>(REFERENCE_LOOKUP, {
    descriptor: kind => referenceDescriptors.find(item => item.kind === kind),
    lookup: (kind, search, signal) => connection
      ? connection.application.lookupResources(kind, search, signal)
      : Promise.resolve({ status: "unavailable", message: "Connect to ROM first." }),
  });
  onMount(() => {
    let stopped = false;
    let current: ReturnType<typeof createRomConnection> | undefined;
    const subscriptions: (() => void)[] = [];
    void (async () => {
      const elements = document.querySelectorAll("#rom-studio-auth-profile");
      const element = elements[0];
      if (elements.length !== 1 || element?.tagName !== "SCRIPT" || element.getAttribute("type") !== "application/json") {
        error = "This host has no live ROM configuration. The public gallery currently uses local previews.";
        return;
      }
      const bootstrap = await createStudioBootstrap(parseStudioBootstrap(element.textContent ?? ""));
      if (stopped) { bootstrap.close(); return; }
      current = createRomConnection(import.meta.env.BASE_URL, bootstrap);
      connection = current;
      subscriptions.push(current.application.subscribe(value => appState = value));
      subscriptions.push(current.session.subscribe(value => session = value));
      await current.connect();
      if (!stopped && current.session.state.status !== "authenticated") {
        const choices = await current.providers();
        if (!stopped) providers = choices.providers;
      }
    })().catch(problem => { if (!stopped) error = problem instanceof Error ? problem.message : "ROM connection failed."; });
    return () => { stopped = true; subscriptions.forEach(unsubscribe => unsubscribe()); current?.dispose(); };
  });
  async function loadProviders() {
    if (!connection) return;
    const choices = await connection.providers();
    providers = choices.providers;
  }
  async function refreshConnection() {
    if (!connection) return;
    await connection.connect();
    if (connection.session.state.status !== "authenticated") await loadProviders();
  }
  async function perform(action: () => Promise<unknown>) {
    error = "";
    try { await action(); } catch (problem) { error = problem instanceof Error ? problem.message : "ROM operation failed."; }
  }
  async function updateResource(action: () => Promise<unknown>) {
    mutationsInFlight++;
    try { await action(); }
    finally { mutationsInFlight--; }
  }
  async function mutate(id: string, revision: bigint | null, operation: Operation) {
    const application = connection?.application;
    if (!application) throw Error("Connect to ROM first.");
    await updateResource(() => application.mutate(id, revision, operation));
  }
  async function invoke(name: string, input: WireValue) {
    if (!connection || !appState?.selected) throw Error("Choose an authorized Resource first.");
    await mutate(appState.selected.key.id, appState.selected.revision, { type: "action", input: { name, input } });
  }
</script>

<Showcase title="Live ROM Resources" api="rom-studio/application" level={2}>
  <p class="muted">Host-discovered fields, exact revisions and authorized actions use the installed ROM controller. Pending mutations retain their original command for recovery.</p>
  {#if error}<p role="status">{error}</p>{/if}
  {#if mutationsInFlight > 0}<p role="status" data-testid="rom-update-pending">Updating Resource…</p>{/if}
  {#if connection}
    <p role="status">Session: {session?.status ?? "checking"}</p>
    {#if session?.status !== "authenticated"}{#each providers as provider}<a href={connection.loginUrl(provider.id)}>Sign in with {provider.label}</a>{/each}{/if}
    <Button onclick={() => perform(refreshConnection)}>Refresh ROM connection</Button>
    {#if session?.status === "authenticated"}<Button onclick={() => perform(async () => { await connection!.logout(); await loadProviders(); })}>Sign out</Button>{/if}
    {#if appState?.error}<p role="alert">{appState.error}</p>{/if}
    {#if appState?.session?.mutationAllowed && descriptor}
      <div>
        <label for={resourceKindId}>Resource kind</label>
        <select id={resourceKindId} value={appState.kind} onchange={event => { const kind = event.currentTarget.value; void perform(() => connection!.application.selectKind(kind)); }}>
          {#each appState.descriptors as item}<option value={item.kind}>{item.presentation?.label ?? item.kind}</option>{/each}
        </select>
      </div>
      {#if appState.kind === "gallery-tasks" || appState.kind === "gallery-workflows"}
        <p class="muted">Changes from other tabs can appear live. If another tab changes this Resource, restore saved work before sending another action.</p>
        <Button onclick={() => appState?.live ? connection!.application.stopLive() : void perform(() => connection!.application.observe())}>
          {appState.live ? "Stop live" : "Start live"} {appState.kind === "gallery-workflows" ? "workflow" : "task"} updates
        </Button>
      {/if}
      <div aria-label="Authorized Resources">
        {#each appState.rows as row}<Button onclick={() => perform(() => connection!.application.selectRow(row.key.id))}>{row.key.id}</Button>{/each}
      </div>
      {#if appState.selected?.value}
        {#if appState.selected.key.kind === "gallery-workflows"}
          <RomWorkflow record={appState.selected} {descriptor} disabled={blocked || submitting || draftBlocked || mutationsInFlight > 0} select={stage => perform(() => invoke("select", stage))} />
        {/if}
        {#if appState.selected.key.kind === "gallery-tasks"}
          <RomTaskActivity record={appState.selected} disabled={blocked || submitting || draftBlocked || mutationsInFlight > 0} invoke={name => perform(() => invoke(name, null))} />
        {/if}
        <Button onclick={() => perform(async () => { await connection!.application.restoreSelectedIntent(); restoreEpoch++; })}>Restore saved draft and mutation</Button>
        <p>Resource: {appState.selected.key.id} · Revision: {String(appState.selected.revision)}</p>
        {#key `${appState.selected.key.kind}:${appState.selected.key.id}:${appState.selected.revision}`}
          <RomResourceForm updating={mutationsInFlight > 0} {mutate} application={connection.application} {descriptor} record={appState.selected} editor={appState.editor} disabled={blocked || submitting || draftBlocked || mutationsInFlight > 0} {restoreEpoch} />
          {#each descriptor.action_inputs as action}<ActionForm {descriptor} {action} readonly={blocked || submitting || draftBlocked || mutationsInFlight > 0} oninvoke={input => invoke(action.name, input)} />{/each}
        {/key}
      {/if}
      {#if appState.recovery?.state.phase === "unknown" || appState.recovery?.state.phase === "prepared"}
        <p role="status">{appState.recovery.state.phase === "prepared" ? "A saved command is ready to send. It has not been attempted." : "The outcome is unknown. Retry the original saved mutation."}</p>
        <Button onclick={() => perform(() => updateResource(() => connection!.application.retry()))}>Retry saved mutation</Button>
      {/if}
    {/if}
  {/if}
</Showcase>
