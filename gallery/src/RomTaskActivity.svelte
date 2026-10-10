<script lang="ts">
  import { AgentActivity, type AgentActivityStep } from "rom-ui/chat";
  import { Button } from "rom-ui/controls";
  import type { ProjectedView } from "rom-studio/client";
  let { record, disabled, invoke }: {
    record: ProjectedView;
    disabled: boolean;
    invoke: (name: string) => Promise<void>;
  } = $props();
  const status = $derived(record.value?.status);
  const supported = $derived(status === "running" || status === "canceled" || status === "done");
  const steps = $derived<AgentActivityStep[]>(supported ? [{
    id: record.key.id,
    label: typeof record.value?.name === "string" ? record.value.name : record.key.id,
    status: status as "running" | "canceled" | "done",
    detail: typeof record.value?.detail === "string" ? record.value.detail : undefined,
  }] : []);
</script>

<AgentActivity label="ROM agent activity" statusText={supported ? String(status) : "Task status unavailable"} {steps}>
  {#snippet actions()}
    <Button disabled={disabled || status !== "running"} onclick={() => invoke("cancel")}>Cancel ROM task</Button>
    <Button disabled={disabled || status !== "canceled"} onclick={() => invoke("retry")}>Retry ROM task</Button>
  {/snippet}
</AgentActivity>
