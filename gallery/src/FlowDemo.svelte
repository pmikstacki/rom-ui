<script lang="ts">
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
        label: "Twoja aplikacja",
        selected: false,
        choose: () => {
          selected = "Twoja aplikacja";
        },
      },
    },
    {
      id: "design",
      type: "choice",
      position: { x: 30, y: 160 },
      data: {
        stage: "01",
        label: "Projektuj",
        selected: selected === "Projektuj",
        choose: () => {
          selected = "Projektuj";
        },
      },
    },
    {
      id: "build",
      type: "choice",
      position: { x: 330, y: 160 },
      data: {
        stage: "02",
        label: "Buduj",
        selected: selected === "Buduj",
        choose: () => {
          selected = "Buduj";
        },
      },
    },
    {
      id: "ship",
      type: "choice",
      position: { x: 180, y: 310 },
      data: {
        stage: "03",
        label: "Udostępnij",
        selected: selected === "Udostępnij",
        muted: !selected,
        choose: () => {
          selected = "Udostępnij";
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

<section class="demo-card flow-example">
  <div class="card-heading">
    <span class="specimen-number">01</span>
    <h3>Od pomysłu do interakcji</h3>
    <code>FlowChoiceNode · FlowFit</code>
  </div>
  <p class="muted">
    Wybierz węzeł myszą lub klawiaturą. Przybliżenie i przesuwanie obsługuje
    Svelte Flow.
  </p>
  <div class="flow-toolbar">
    <span
      >Wybór: <strong data-testid="flow-choice">{selected || "—"}</strong></span
    ><Button
      variant="outline"
      size="sm"
      onclick={() => {
        fit++;
      }}>Dopasuj widok</Button
    ><label class="checkbox-row"
      ><input type="checkbox" bind:checked={active} /> Automatyczne dopasowanie</label
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
</section>
<div class="note-row">
  <span class="mini-tag">WYDZIELONE Z MADZIA</span>
  <p>
    Komponenty prezentują graf. Układ węzłów, ścieżki i reguły wyboru pozostają
    w aplikacji.
  </p>
</div>
