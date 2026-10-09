<script lang="ts">
  import Showcase from "./Showcase.svelte";
  import {
    SvelteFlow,
    Background,
    Controls,
    type Node,
    type Edge,
  } from "@xyflow/svelte";
  import { FlowChoiceNode, FlowFit, type FlowChoiceData } from "rom-ui/flow";
  import { Button } from "rom-ui/controls";
  let selected = $state("");
  let fit = $state(0);
  let active = $state(true);
  const nodeTypes = { choice: FlowChoiceNode };
  const nodes = $derived<Node<FlowChoiceData>[]>([
    {
      id: "start",
      type: "choice",
      position: { x: 180, y: 20 },
      data: {
        stage: "START",
        label: "Your application",
        selected: false,
        choose: () => {
          selected = "Your application";
        },
      },
    },
    {
      id: "design",
      type: "choice",
      position: { x: 30, y: 160 },
      data: {
        stage: "01",
        label: "Design",
        selected: selected === "Design",
        choose: () => {
          selected = "Design";
        },
      },
    },
    {
      id: "build",
      type: "choice",
      position: { x: 330, y: 160 },
      data: {
        stage: "02",
        label: "Build",
        selected: selected === "Build",
        choose: () => {
          selected = "Build";
        },
      },
    },
    {
      id: "ship",
      type: "choice",
      position: { x: 180, y: 310 },
      data: {
        stage: "03",
        label: "Share",
        selected: selected === "Share",
        muted: !selected,
        choose: () => {
          selected = "Share";
        },
      },
    },
  ]);
  const edges: Edge[] = [
    { id: "start-design", source: "start", target: "design" },
    { id: "start-build", source: "start", target: "build" },
    { id: "design-ship", source: "design", target: "ship" },
    { id: "build-ship", source: "build", target: "ship" },
  ];
</script>

<Showcase title="From idea to interaction" api="FlowChoiceNode · FlowFit" number="01" level={3} class="flow-example">
  <p class="muted">
    Select a node with a mouse or keyboard. Svelte Flow handles zooming and
    panning.
  </p>
  <div class="flow-toolbar">
    <span
      >Selection: <strong data-testid="flow-choice">{selected || "—"}</strong
      ></span
    ><Button
      variant="outline"
      size="sm"
      onclick={() => {
        fit++;
      }}>Fit view</Button
    ><label class="checkbox-row"
      ><input type="checkbox" bind:checked={active} /> Automatic fitting</label
    >
  </div>
  <div class="flow-canvas" data-testid="flow-canvas">
    <SvelteFlow
      {nodes}
      {edges}
      {nodeTypes}
      minZoom={0.1}
      maxZoom={1.5}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      preventScrolling={false}
      zoomOnScroll={false}
    >
      <FlowFit signature={fit} {active} /><Background
        gap={24}
        patternColor="var(--border)"
      /><Controls showLock={false} />
    </SvelteFlow>
  </div>
  <div class="code-line">
    import &#123; FlowChoiceNode, FlowFit &#125; from 'rom-ui/flow';
  </div>
</Showcase>
<div class="note-row">
  <span class="mini-tag">EXTRACTED FROM MADZIA</span>
  <p>
    Components display the graph. Node layout, paths, and selection rules remain
    in your application.
  </p>
</div>
