<script lang="ts">
  import { SvelteFlow, type Node } from "@xyflow/svelte";
  import { FlowFit } from "rom-ui/flow";
  let nodes = $state<Node[]>([]);
  let active = $state(true);
  let mounted = $state(true);
  let signature = $state(0);
</script>

<button
  onclick={() => {
    active = false;
  }}>Deactivate fitting</button
>
<button
  onclick={() => {
    mounted = false;
  }}>Unmount fitting</button
>
<button
  onclick={() => {
    nodes = [
      {
        id: "replacement",
        position: { x: 900, y: 900 },
        data: { label: "Replacement node" },
      },
    ];
    signature++;
  }}>Load replacement graph</button
>
<div style="width:600px;height:400px">
  <SvelteFlow {nodes} minZoom={0.1} maxZoom={2}>
    {#if mounted}<FlowFit {signature} {active} />{/if}
  </SvelteFlow>
</div>
