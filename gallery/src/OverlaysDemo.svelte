<script lang="ts">
  import { Button, Input } from "rom-ui/controls";
  import * as Dialog from "rom-ui/primitives/dialog";
  import * as Sheet from "rom-ui/primitives/sheet";
  import * as Popover from "rom-ui/primitives/popover";
  import * as Alert from "rom-ui/primitives/alert";
  let open = $state(false);
  let note = $state("");
  let notification = $state("");
  function accept() { open = false; notification = "Accepted locally. This preview does not save a ROM Resource."; }
</script>

<div class="demo-grid">
  <section class="demo-card">
    <div class="card-heading"><h2>Dialog</h2><code>rom-ui/primitives/dialog</code></div>
    <p class="muted">Edit a host-owned draft. Escape closes the dialog and restores focus.</p>
    <Dialog.Root bind:open>
      <Dialog.Trigger>Open dialog</Dialog.Trigger>
      <Dialog.Content class="motion-reduce:animate-none!">
        <Dialog.Header><Dialog.Title>Resource note</Dialog.Title><Dialog.Description>This is a local preview. Your draft stays when you close the dialog.</Dialog.Description></Dialog.Header>
        <label>Note<Input aria-label="Note" bind:value={note} /></label>
        <Dialog.Footer><Dialog.Close>Cancel</Dialog.Close><Button onclick={accept}>Accept locally</Button></Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  </section>
  <section class="demo-card">
    <div class="card-heading"><h2>Sheet</h2><code>rom-ui/primitives/sheet</code></div>
    <p class="muted">A shared modal panel for resource details.</p>
    <Sheet.Root>
      <Sheet.Trigger>Open sheet</Sheet.Trigger>
      <Sheet.Content class="motion-reduce:animate-none!">
        <Sheet.Header><Sheet.Title>Resource details</Sheet.Title><Sheet.Description>Content and actions belong to the application.</Sheet.Description></Sheet.Header>
        <p class="panel-copy">Use the same controls and ROM forms inside this panel. Escape returns focus to its opening button.</p>
        <Sheet.Footer><Sheet.Close>Close details</Sheet.Close></Sheet.Footer>
      </Sheet.Content>
    </Sheet.Root>
  </section>
  <section class="demo-card">
    <div class="card-heading"><h2>Popover</h2><code>rom-ui/primitives/popover</code></div>
    <p class="muted">Keep small options close to their opening control.</p>
    <Popover.Root>
      <Popover.Trigger>Open popover</Popover.Trigger>
      <Popover.Content class="motion-reduce:animate-none!">
        <Popover.Header><Popover.Title>View options</Popover.Title><Popover.Description>Host-supplied options for this example.</Popover.Description></Popover.Header>
        <Popover.Close>Close options</Popover.Close>
      </Popover.Content>
    </Popover.Root>
  </section>
  <section class="demo-card">
    <div class="card-heading"><h2>Inline notifications</h2><code>rom-ui/primitives/alert</code></div>
    <p class="muted">The application chooses the message, lifetime and dismissal. This example reports local interaction only.</p>
    <Button onclick={() => notification = "Local preview ready."}>Show notification</Button>
    {#if notification}
      <Alert.Root role="status" aria-live="polite" class="feedback">
        <Alert.Title>Local feedback</Alert.Title><Alert.Description>{notification}</Alert.Description>
        <Alert.Action><Button variant="ghost" aria-label="Dismiss notification" onclick={() => notification = ""}>Dismiss</Button></Alert.Action>
      </Alert.Root>
    {/if}
  </section>
</div>

<style>
  h2 { font-size: 1rem; margin: 0; }
  .demo-card :global(.feedback) { margin-top: 1rem; }
  .panel-copy { padding: 1rem; }
</style>
