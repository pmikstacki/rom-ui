<script lang="ts">
  import { onDestroy } from "svelte";
  import { AgentActivity, type AgentActivityStep } from "rom-ui/chat";
  import { Button } from "rom-ui/controls";
  let running = $state(false);
  let status = $state("Ready · local example");
  let steps = $state<AgentActivityStep[]>([
    {
      id: "inspect",
      label: "Inspect resource",
      status: "queued",
      detail: "Read the authorized resource projection.",
    },
    {
      id: "prepare",
      label: "Prepare response",
      status: "queued",
      detail:
        "The application supplies task progress and owns model execution.",
    },
  ]);
  let generation = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  function cancel() {
    generation++;
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    running = false;
    status = "Canceled · local example";
    steps = steps.map((step) => ({
      ...step,
      status: step.status === "done" ? "done" : "canceled",
    }));
  }
  function run() {
    const owner = ++generation;
    if (timer !== undefined) clearTimeout(timer);
    running = true;
    status = "Running · local example";
    steps = steps.map((step, index) => ({
      ...step,
      status: index === 0 ? "running" : "queued",
    }));
    timer = setTimeout(() => {
      if (owner !== generation) return;
      steps = steps.map((step, index) => ({
        ...step,
        status: index === 0 ? "done" : "running",
      }));
      timer = setTimeout(() => {
        if (owner !== generation) return;
        steps = steps.map((step) => ({ ...step, status: "done" }));
        running = false;
        status = "Completed · local example";
        timer = undefined;
      }, 900);
    }, 900);
  }
  onDestroy(() => {
    generation++;
    if (timer !== undefined) clearTimeout(timer);
  });
</script>

<div class="demo-card">
  <p class="muted">
    Interactive task presentation inspired by Astral. This example simulates
    updates locally; ROM-backed execution remains pending.
  </p>
  <AgentActivity label="Agent activity" statusText={status} {steps}>
    {#snippet actions()}
      <Button type="button" size="sm" disabled={running} onclick={run}
        >Run example task</Button
      >
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={!running}
        onclick={cancel}>Cancel example task</Button
      >
    {/snippet}
  </AgentActivity>
</div>
