<script lang="ts">
  import Showcase from "./Showcase.svelte";
  import { Button, Input, Label } from "rom-ui/controls";
  import {
    ResponsiveDetails,
    HistoryList,
    SelectionCard,
    LayoutControls,
    ReferencePicker,
  } from "rom-ui/ui/components";
  let open = $state(false);
  let opener = $state<HTMLElement | null>(null);
  let draft = $state("Demo project");
  let selected = $state("project");
  let choice = $state(false);
  let reference = $state("project/demo");
  let layout = $state<readonly import("rom-ui/ui").LayoutItem[]>([
    { id: "card", x: 0, y: 0, width: 2, height: 2, visible: true },
  ]);
  const layoutOptions = {
    columns: 6,
    maxRows: 4,
    maxItems: 1,
    catalog: [
      { id: "card", minWidth: 1, maxWidth: 4, minHeight: 1, maxHeight: 3 },
    ],
  };
  const layoutLabels = {
    left: "Left",
    right: "Right",
    up: "Up",
    down: "Down",
    wider: "Wider",
    narrower: "Narrower",
    taller: "Taller",
    shorter: "Shorter",
    show: "Show",
    hide: "Hide",
    invalid: "Invalid layout",
    failed: "Change rejected",
    unknown: "Unknown outcome",
  };
  const lookup = {
    descriptor: () => ({
      kind: "projects",
      version: 1,
      fields: [],
      actions: [],
      action_inputs: [],
    }),
    lookup: async (_kind: string, search: string) => ({
      status: "ready" as const,
      candidates: [
        { id: "project/demo", title: "Demo project" },
        { id: "project/gallery", title: "Component gallery" },
      ].filter((item) =>
        item.title
          .toLocaleLowerCase("en")
          .includes(search.toLocaleLowerCase("en")),
      ),
      limited: false,
    }),
  };
  const entries = [
    {
      id: "project",
      title: "Interface project",
      instant: 1791504000000,
      count: 6,
    },
    {
      id: "flow",
      title: "Flow overview",
      instant: 1791417600000,
      count: 3,
    },
    {
      id: "chat",
      title: "First conversation",
      instant: 1791331200000,
      count: 2,
    },
  ];
</script>

<div class="demo-grid compositions">
  <Showcase title="History" api="HistoryList" number="01" level={3}>
    <p class="muted">
      Select a conversation or version. The host controls data and storage.
    </p>
    <HistoryList
      {entries}
      selectedId={selected}
      onSelect={(id) => {
        selected = id;
      }}
      authorityToken="gallery"
      locale="en-US"
      label="Example history"
      empty="No history"
      messages={(key, values) =>
        key === "history.count"
          ? `${values?.formattedCount} messages`
          : "Could not select."}
    />
  </Showcase>
  <Showcase title="Selection card" api="SelectionCard" number="02" level={3}>
    <p class="muted">An explicit choice that handles the operation outcome.</p>
    <SelectionCard
      id="example"
      title="Simple view"
      selected={choice}
      authorityToken="gallery"
      failedLabel="Operation rejected"
      unknownLabel="Unknown outcome"
      onToggle={() => {
        choice = !choice;
        return "accepted";
      }}
      ><span class="muted">Select the card to change local state.</span
      ></SelectionCard
    >
  </Showcase>
  <Showcase title="Card layout" api="LayoutControls" number="04" level={3}>
    <LayoutControls
      {layout}
      options={layoutOptions}
      label="Example card layout"
      itemLabel={() => "Card"}
      labels={layoutLabels}
      authorityToken="gallery"
      onChange={(_command, proposal) => {
        layout = proposal;
        return "accepted";
      }}
    />
    <p class="muted">
      Position: {layout[0].x}, {layout[0].y} · Size: {layout[0].width} × {layout[0]
        .height} · {layout[0].visible ? "Visible" : "Hidden"}
    </p>
  </Showcase>
  <Showcase title="Resource reference" api="ReferencePicker" number="05" level={3}>
    <ReferencePicker
      kind="projects"
      value={reference}
      label="Related project"
      {lookup}
      normalizeId={(value) => value}
      authorityToken="gallery"
      onchange={(value) => {
        reference = String(value);
      }}
      messages={{
        chooseLabel: "Choose project",
        searchLabel: "Search projects",
        valueLabel: "Project ID",
        idPlaceholder: "Exact ID",
        searchPlaceholder: "Search examples…",
        loading: "Loading…",
        candidateHint: "Example resources",
        empty: "No results",
        manualHint: "You can enter an exact ID.",
        more: "More results are available.",
        unavailable: "Selection unavailable.",
        failed: "Could not fetch.",
        searchTooLong: "Shorten the query.",
        attemptsExceeded: "Try again later.",
        invalidId: "Invalid ID.",
      }}
    />
    <p class="muted">Selected ID: {reference}</p>
  </Showcase>
  <Showcase title="Responsive details" api="ResponsiveDetails" number="03" level={3} class="wide">
    <p class="muted">
      A panel on wide screens, a drawer on phones. The same editor and the same
      draft.
    </p>
    <Button
      bind:ref={opener}
      onclick={() => {
        open = true;
      }}>Open details <span aria-hidden="true">↗</span></Button
    >
    <div class="details-example">
      <ResponsiveDetails
        bind:open
        {opener}
        id="gallery-details"
        title="Project details"
        description="An example editor that preserves its draft when the width changes."
        closeLabel="Close details"
        breakpoint="(max-width: 799px)"
      >
        <div class="field">
          <Label for="detail-name">Project title</Label><Input
            id="detail-name"
            bind:value={draft}
          />
          <p class="muted">
            Change the title and window width. The value stays in the editor.
          </p>
        </div>
      </ResponsiveDetails>
    </div>
  </Showcase>
</div>
