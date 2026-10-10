<script lang="ts">
  import { Handle, Position, type Node, type NodeProps } from "@xyflow/svelte";
  import { Button } from "../components/ui/button/index.js";
  import type { FlowChoiceData } from "./types.ts";
  let { data }: NodeProps<Node<FlowChoiceData>> = $props();
</script>

<Handle type="target" position={data.side ? Position.Left : Position.Top} />
<Button
  class={`rom-flow-choice nodrag nopan ${data.muted ? "muted" : ""}`}
  variant={data.selected ? "default" : "outline"}
  disabled={data.disabled}
  onclick={data.choose}
  aria-pressed={data.selected ?? false}
>
  {#if data.stage}<span class="stage">{data.stage}</span>{/if}<span
    >{data.label}</span
  >
</Button>
<Handle type="source" position={Position.Bottom} />

<style>
  :global(.rom-flow-choice) {
    display: grid;
    min-width: 10rem;
    height: auto;
    min-height: 3.5rem;
    gap: 0.3rem;
    padding: 0.65rem 1rem;
    text-align: left;
  }
  :global(.rom-flow-choice.muted) {
    opacity: 0.55;
    filter: grayscale(1);
    border-style: dashed;
  }
  .stage {
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    opacity: 0.7;
  }
</style>
