<script lang="ts">
  import { ROMUIFlex } from "rom-ui/flex";
  import { Button } from "rom-ui/controls";
  let flex: ROMUIFlex;
  let view = $state("Overview");
  let native = $state(true);
  let reject = $state(false);
  let error = $state("");
  let heading: HTMLHeadingElement;
  async function switchView(next: string) {
    error = "";
    try {
      await flex.run(
        () => {
          if (reject) throw new Error("The application rejected this change.");
          view = next;
        },
        { focus: () => heading },
      );
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : "The view could not change.";
    }
  }
</script>

<section class="demo-card">
  <div class="card-heading">
    <h3>Caller-owned view transitions</h3>
    <code>ROMUIFlex · Animotion · View Transitions</code>
  </div>
  <p>
    The application chooses the view. Motion adds a transition after the
    application accepts the change.
  </p>
  <div class="demo-options">
    <Button onclick={() => switchView("Overview")}>Show overview</Button>
    <Button onclick={() => switchView("Details")}>Show details</Button>
    <Button onclick={() => switchView("Activity")}>Show activity</Button>
  </div>
  <ROMUIFlex bind:this={flex} {native} label="Example resource view">
    <div class="flex-content">
      <h4 bind:this={heading} tabindex="-1" data-testid="flex-current">
        {view}
      </h4>
      {#if view === "Overview"}<p>
          A resource summary supplied by the host application.
        </p>
      {:else if view === "Details"}<p>
          Detailed data stays under the application’s control.
        </p>
      {:else}<p>
          Activity content comes from the application’s own data source.
        </p>{/if}
      <label
        >Resource note <input
          aria-label="Resource note"
          placeholder="Try keyboard focus"
        /></label
      >
    </div>
  </ROMUIFlex>
  {#if error}<p role="alert">{error}</p>{/if}
  <div class="demo-options">
    <label
      ><input type="checkbox" bind:checked={native} /> Enable document snapshots</label
    >
    <label
      ><input type="checkbox" bind:checked={reject} /> Reject the next view change</label
    >
  </div>
  <p class="muted">
    Native snapshots cover this document. Disable them for a local Animotion
    fade. Reduced motion applies changes immediately.
  </p>
  <div class="code-line">
    import &#123; ROMUIFlex &#125; from 'rom-ui/flex';
  </div>
</section>

<style>
  .flex-content {
    padding: 1.25rem;
    margin-block: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    min-height: 12rem;
  }
  input {
    max-width: 100%;
  }
  h4 {
    font-size: 1.25rem;
  }
</style>
