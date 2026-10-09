<script lang="ts">
  import { SvelteFlow, Background, Controls, type Node, type Edge } from "@xyflow/svelte";
  import { FlowChoiceNode, FlowFit, type FlowChoiceData } from "rom-ui/flow";
  import type { ProjectedView, ResourceDescriptor } from "rom-studio/client";
  let { record, descriptor, disabled, select }: {
    record: ProjectedView;
    descriptor: ResourceDescriptor;
    disabled: boolean;
    select: (stage: string) => Promise<void>;
  } = $props();
  const choices = $derived.by(() => {
    const field = descriptor.fields.find(field => field.name === "selected");
    if (field?.shape.type !== "enum") return [];
    const values = field.shape.value;
    if (!values.length || values.length > 16 || new Set(values).size !== values.length
      || values.some(value => !value || value.length > 256)) return [];
    return values;
  });
  const selected = $derived.by(() => {
    const value = record.value;
    return value && typeof value === "object" && !Array.isArray(value)
      && Object.hasOwn(value, "selected") && typeof value.selected === "string"
      && choices.includes(value.selected) ? value.selected : null;
  });
  const canSelect = $derived(descriptor.actions.includes("select")
    && descriptor.action_inputs.some(action => action.name === "select"
      && action.input?.type === "scalar" && action.input.value.shape.type === "string"));
  const nodeTypes = { choice: FlowChoiceNode };
  const nodes = $derived<Node<FlowChoiceData>[]>(choices.map((id, index) => ({
    id,
    type: "choice",
    position: { x: 100, y: index * 140 },
    data: {
      label: id.charAt(0).toUpperCase() + id.slice(1),
      stage: String(index + 1).padStart(2, "0"),
      selected: selected === id,
      disabled: disabled || selected === null || !canSelect,
      choose: () => { void select(id); },
    },
  })));
  const edges = $derived<Edge[]>(choices.slice(1).map((id, index) => ({
    id: `step-${index}`,
    source: choices[index],
    target: id,
  })));
</script>

<section aria-label="ROM workflow">
  <p>Selected stage: <output data-testid="rom-workflow-selection">{selected ?? "Unavailable"}</output></p>
  {#if selected !== null}
    {#if !canSelect}<p>Selection is read-only for this view.</p>{/if}
    <div class="flow-canvas" data-testid="rom-workflow-canvas">
      <SvelteFlow {nodes} {edges} {nodeTypes} minZoom={0.1} maxZoom={1.5}
        nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}
        preventScrolling={false} zoomOnScroll={false}>
        <FlowFit signature={`${record.key.id}:${choices.join("\u0000")}`} />
        <Background gap={24} patternColor="var(--border)" />
        <Controls showLock={false} />
      </SvelteFlow>
    </div>
  {:else}
    <p>The current session has no supported workflow selection.</p>
  {/if}
</section>
