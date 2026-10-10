<script lang="ts">
  import type { Snippet } from "svelte";
  import type { AgentActivityStep } from "./contracts.ts";
  let {
    label,
    statusText,
    steps,
    elapsedSeconds,
    actions,
    stepActions,
    statusLabels = {
      queued: "Queued",
      running: "Running",
      done: "Done",
      error: "Error",
      canceled: "Canceled",
    },
  }: {
    label: string;
    statusText: string;
    steps: readonly AgentActivityStep[];
    elapsedSeconds?: number;
    actions?: Snippet;
    stepActions?: Snippet<[AgentActivityStep]>;
    statusLabels?: Record<AgentActivityStep["status"], string>;
  } = $props();
</script>

<section class="agent-activity" aria-label={label}>
  <header>
    <h3>{label}</h3>
    <p role="status">
      {statusText}{#if elapsedSeconds !== undefined && Number.isFinite(elapsedSeconds)}
        · {Math.max(0, Math.floor(elapsedSeconds))}s{/if}
    </p>
  </header>
  <ol>
    {#each steps as step (step.id)}
      <li data-state={step.status}>
        <span class="step-indicator" aria-hidden="true"
          >{step.status === "done"
            ? "✓"
            : step.status === "error"
              ? "!"
              : "·"}</span
        >
        <div class="step-content">
          {#if step.detail}
            <details>
              <summary
                >{step.label}
                <span class="step-status">{statusLabels[step.status]}</span
                ></summary
              >
              <p>{step.detail}</p>
            </details>
          {:else}
            <span
              >{step.label}
              <span class="step-status">{statusLabels[step.status]}</span></span
            >
          {/if}
          {#if stepActions}{@render stepActions(step)}{/if}
        </div>
      </li>
    {/each}
  </ol>
  {#if actions}<div class="activity-actions">{@render actions()}</div>{/if}
</section>

<style>
  .agent-activity {
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--foreground);
    padding: 1rem;
    border-radius: 0.75rem;
    min-width: 0;
  }
  header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.5rem;
  }
  h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
  }
  header p,
  .step-status {
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }
  ol {
    list-style: none;
    padding: 0;
    margin: 0.75rem 0;
    display: grid;
    gap: 0.6rem;
  }
  li {
    display: flex;
    gap: 0.6rem;
    align-items: baseline;
  }
  .step-indicator {
    width: 1rem;
    flex-shrink: 0;
    color: var(--muted-foreground);
  }
  li[data-state="running"] .step-indicator {
    color: var(--primary);
  }
  li[data-state="error"] .step-indicator {
    color: var(--destructive);
  }
  .step-content {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  summary {
    cursor: pointer;
  }
  .step-status {
    margin-inline-start: 0.5rem;
  }
  details p {
    margin: 0.5rem 0;
    font-size: 0.85rem;
    color: var(--muted-foreground);
    white-space: pre-wrap;
  }
  .activity-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
</style>
