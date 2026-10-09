import { overlayExamples } from "./overlay-examples.ts";
import { studioPrimitiveExamples } from "./studio-primitive-examples.ts";
export type ExampleCategory =
  | "controls"
  | "compositions"
  | "chat"
  | "flow"
  | "maps"
  | "flex"
  | "studio-primitives"
  | "forms"
  | "overlays";
export interface ComponentExample {
  name: string;
  note: string;
  code: string;
}
const example = (
  name: string,
  path: string,
  script: string,
  markup: string,
  note: string,
): ComponentExample => ({
  name,
  note,
  code: `<script lang="ts">\n  import { ${name} } from "${path}";\n${script}\n</script>\n\n${markup}`,
});
const control = (name: string, script: string, markup: string, note: string) =>
  example(name, "rom-ui/controls", script, markup, note);
const controls = [
  control(
    "Button",
    "  let saved = $state(false);",
    '<Button onclick={() => saved = true}>Save</Button>\n<p role="status">{saved ? "Saved locally" : "Ready"}</p>',
    "This callback updates local state. Connect your persistence operation in the host.",
  ),
  control(
    "Input",
    '  let name = $state("");',
    '<label for="name">Project name</label>\n<Input id="name" bind:value={name} />',
    "Bind the value to your host state.",
  ),
  control(
    "Textarea",
    '  let notes = $state("");',
    '<label for="notes">Notes</label>\n<Textarea id="notes" bind:value={notes} rows={4} />',
    "Use a visible label for the editor.",
  ),
  control(
    "NativeSelect",
    '  let view = $state("list");',
    '<label for="view">View</label>\n<NativeSelect id="view" bind:value={view}>\n  <option value="list">List</option>\n  <option value="grid">Grid</option>\n</NativeSelect>',
    "Native option elements work inside the select.",
  ),
  control(
    "Checkbox",
    "  let enabled = $state(false);",
    '<Checkbox id="enabled" bind:checked={enabled} />\n<label for="enabled">Enable notifications</label>',
    "The host owns the checked state.",
  ),
  control(
    "Slider",
    "  let progress = $state([25]);",
    '<label for="progress">Progress</label>\n<Slider id="progress" type="multiple" bind:value={progress} min={0} max={100} step={1} aria-label="Progress" />',
    "Multiple mode uses an array, including for one thumb.",
  ),
  control(
    "Label",
    "",
    '<Label for="email">Email</Label>\n<input id="email" type="email" />',
    "Match the label target to the input ID.",
  ),
];
controls.splice(
  4,
  0,
  control(
    "NativeSelectOption",
    '  import {NativeSelect} from "rom-ui/controls";\n  let view = $state("list");',
    '<label for="option-view">View</label>\n<NativeSelect id="option-view" bind:value={view}>\n  <NativeSelectOption value="list">List</NativeSelectOption>\n  <NativeSelectOption value="grid">Grid</NativeSelectOption>\n</NativeSelect>',
    "Render options inside NativeSelect. The host owns the selected value.",
  ),
  control(
    "NativeSelectOptGroup",
    '  import {NativeSelect, NativeSelectOption} from "rom-ui/controls";\n  let view = $state("list");',
    '<label for="group-view">View</label>\n<NativeSelect id="group-view" bind:value={view}>\n  <NativeSelectOptGroup label="Layouts">\n    <NativeSelectOption value="list">List</NativeSelectOption>\n    <NativeSelectOption value="grid">Grid</NativeSelectOption>\n  </NativeSelectOptGroup>\n</NativeSelect>',
    "Group related native options under an accessible label.",
  ),
);
controls.push(...studioPrimitiveExamples.slice(0, 2));
const composition = (
  name: string,
  script: string,
  markup: string,
  note: string,
) => example(name, "rom-ui/ui/components", script, markup, note);
const conversation = composition(
  "ConversationLayout",
  "",
  '{#snippet heading()}<h2>Assistant</h2>{/snippet}\n{#snippet messages()}<p>Hello.</p>{/snippet}\n{#snippet composer()}<label>Message <input /></label>{/snippet}\n<div style="height: 28rem">\n  <ConversationLayout label="Conversation" bodyLabel="Messages" header={heading} body={messages} footer={composer} />\n</div>',
  "Supply a bounded height. The host supplies message behavior and scrolling policy.",
);
const compositions = [
  composition(
    "ResponsiveDetails",
    "  let open = $state(false);\n  let opener = $state<HTMLButtonElement | null>(null);",
    '<button bind:this={opener} onclick={() => open = true}>Open details</button>\n<ResponsiveDetails bind:open {opener} id="details" title="Project details" description="Edit this project." closeLabel="Close details">\n  <label>Project name <input /></label>\n</ResponsiveDetails>',
    "The opener receives focus after close. The same editor survives responsive transitions.",
  ),
  composition(
    "HistoryList",
    '  let selectedId = $state<string | null>(null);\n  const entries = [{ id: "first", title: "First conversation", instant: 1791504000000, count: 2 }];',
    '<HistoryList {entries} {selectedId} onSelect={(id) => { selectedId = id; }} authorityToken="session-1" locale="en-US" label="Conversation history" empty="No history" messages={(key, values) => key === "history.count" ? `${values?.formattedCount} messages` : "Selection failed"} />',
    "This example selects locally. Replace onSelect with your host operation; reject its promise on failure.",
  ),
  composition(
    "SelectionCard",
    "  let selected = $state(false);",
    '<SelectionCard id="compact" title="Compact view" {selected} authorityToken="session-1" failedLabel="Selection rejected" unknownLabel="Confirm selection outcome" onToggle={() => { selected = !selected; return "accepted"; }}>\n  <p>A compact project view.</p>\n</SelectionCard>',
    "The local callback accepts the change. Host callbacks can return accepted, rejected or unknown.",
  ),
  composition(
    "LayoutControls",
    '  import type { LayoutItem } from "rom-ui/ui";\n  let layout = $state<readonly LayoutItem[]>([{ id: "card", x: 0, y: 0, width: 2, height: 2, visible: true }]);\n  const options = { columns: 6, maxRows: 4, maxItems: 1, catalog: [{ id: "card", minWidth: 1, maxWidth: 4, minHeight: 1, maxHeight: 3 }] };\n  const labels = { left: "Left", right: "Right", up: "Up", down: "Down", wider: "Wider", narrower: "Narrower", taller: "Taller", shorter: "Shorter", show: "Show", hide: "Hide", invalid: "Invalid layout", failed: "Change rejected", unknown: "Confirm outcome" };',
    '<LayoutControls {layout} {options} {labels} label="Card layout" itemLabel={() => "Card"} authorityToken="session-1" onChange={(_command, proposal) => { layout = proposal; return "accepted"; }} />',
    "The host receives a validated proposal. This example applies it locally without persistence.",
  ),
  composition(
    "ReferencePicker",
    '  let value = $state("project/demo");\n  function normalizeId(text: string) {\n    if (!/^project\\/[a-z0-9-]+$/.test(text)) throw new Error("Use project/name");\n    return text;\n  }',
    '<ReferencePicker kind="projects" {value} label="Project" {normalizeId} authorityToken="session-1" onchange={(next) => { value = String(next); }} />',
    "This example accepts exact IDs. Add an authorized ReferenceLookup for candidate search; validation does not establish authorization.",
  ),
  conversation,
];
const chat = [
  example(
    "AgentActivity",
    "rom-ui/chat",
    '  let canceled = $state(false);\n  const steps = $derived([{ id: "inspect", label: "Inspect resource", status: canceled ? "canceled" as const : "running" as const, detail: "Read an authorized projection." }]);',
    '<AgentActivity label="Agent activity" statusText={canceled ? "Canceled" : "Running"} {steps}>\n  {#snippet actions()}\n    <button type="button" onclick={() => canceled = true}>Cancel task</button>\n  {/snippet}\n</AgentActivity>',
    "The host supplies progress, cancellation and exact task identities. Connect these to authorized ROM observation and actions.",
  ),
  {
    ...conversation,
    code: conversation.code.replace("rom-ui/ui/components", "rom-ui/chat"),
  },
  example(
    "ChatComposer",
    "rom-ui/chat",
    '  let draft = $state("");\n  let microphoneSelected = $state(false);\n  let submitted = $state("");\n  async function send(message: string) { submitted = message; }',
    '{#snippet actions(state: { disabled: boolean; pending: boolean })}\n  <button type="button" disabled={state.disabled} aria-label="Microphone extension" aria-pressed={microphoneSelected} onclick={() => microphoneSelected = !microphoneSelected}>\n    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="9" y="2" width="6" height="13" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3" /></svg>\n  </button>\n{/snippet}\n<ChatComposer {actions} bind:value={draft} authorityToken="session-1" onSubmit={send} label="Message" sendLabel="Send" errorLabel="Send failed. Try again." hint="Enter sends; Shift+Enter adds a line" />\n<p role="status">{submitted}</p>',
    "send records text locally. Replace it with your host request; throw on failure and change authorityToken when the conversation changes.",
  ),
  example(
    "ChatMessages",
    "rom-ui/chat",
    '  import type { ChatMessage } from "rom-ui/chat";\n  const messages: ChatMessage[] = [{ id: "welcome", role: "assistant", content: "Hello. How can I help?" }];',
    '<ChatMessages {messages} userLabel="You" assistantLabel="Assistant" pendingLabel="Preparing response" errorLabel="Response failed" emptyLabel="Start a conversation" />',
    "The host supplies messages. Content is displayed as text.",
  ),
];
const flowCode = (name: string) =>
  example(
    name,
    "rom-ui/flow",
    '  import { SvelteFlow, type Node } from "@xyflow/svelte";\n  import "@xyflow/svelte/dist/style.css";\n  import { ' +
      (name === "FlowFit" ? "FlowChoiceNode" : "FlowFit") +
      ', type FlowChoiceData } from "rom-ui/flow";\n  let selected = $state(false);\n  let revision = $state(0);\n  const nodes = $derived<Node<FlowChoiceData>[]>([{ id: "choice", type: "choice", position: { x: 0, y: 0 }, data: { stage: "01", label: "Choose", selected, choose: () => { selected = !selected; } } }]);\n  const nodeTypes = { choice: FlowChoiceNode };',
    '<button onclick={() => revision++}>Fit view</button>\n<div style="height: 24rem">\n  <SvelteFlow {nodes} edges={[]} {nodeTypes}>\n    <FlowFit signature={revision} focusIds={["choice"]} duration={320} />\n  </SvelteFlow>\n</div>',
    "Install the optional @xyflow/svelte peer. Both components need SvelteFlow context and a bounded host.",
  );
const mapExample = (
  name: string,
  imports: string,
  script: string,
  body: string,
  note: string,
) =>
  example(
    name,
    "rom-ui/maps",
    "  import { " + imports + ' } from "rom-ui/maps";\n' + script,
    '<div style="height: 24rem">\n  <Map label="Example map" center={[19.925, 50.065]} zoom={12}>\n' +
      body +
      "\n  </Map>\n</div>",
    note,
  );
const markerBody = (body: string) =>
  "    <MapMarker longitude={19.925} latitude={50.065}>\n" +
  body +
  "\n    </MapMarker>";
const mapNote =
  "Install the optional maplibre-gl peer. This tileless example uses the built-in background; provide styles for geographic context.";
const maps: ComponentExample[] = [
  example(
    "Map",
    "rom-ui/maps",
    "",
    '<div style="height: 24rem">\n  <Map label="Example map" center={[19.925, 50.065]} zoom={12} />\n</div>',
    mapNote,
  ),
  mapExample(
    "MapMarker",
    "Map, MarkerContent",
    "",
    markerBody(
      "      <MarkerContent><button>Project location</button></MarkerContent>",
    ),
    mapNote,
  ),
  ...["MarkerContent", "MarkerPopup", "MarkerTooltip", "MarkerLabel"].map(
    (name) =>
      mapExample(
        name,
        "Map, MapMarker" + (name === "MarkerContent" ? "" : ", MarkerContent"),
        "",
        markerBody(
          name === "MarkerContent"
            ? "      <MarkerContent><button>Project location</button></MarkerContent>"
            : name === "MarkerLabel"
              ? "      <MarkerContent><button>●<MarkerLabel>Project</MarkerLabel></button></MarkerContent>"
              : "      <MarkerContent><button>Project location</button></MarkerContent>\n      <" +
                name +
                (name === "MarkerPopup"
                  ? ' closeButton closeLabel="Close project information"'
                  : "") +
                ">Project information</" +
                name +
                ">",
        ),
        "Place this component inside MapMarker. " + mapNote,
      ),
  ),
  mapExample(
    "MapControls",
    "Map",
    "",
    "    <MapControls showZoom showCompass />",
    mapNote,
  ),
  mapExample(
    "MapPopup",
    "Map",
    "  let open = $state(true);",
    '    {#if open}<MapPopup longitude={19.925} latitude={50.065} closeButton closeLabel="Close information" onclose={() => open = false}>Project information</MapPopup>{/if}',
    mapNote,
  ),
  ...["MapRoute", "RouteProgress", "RouteMarker"].map((name) =>
    mapExample(
      name,
      "Map" +
        (name === "MapRoute" ? "" : ", MapRoute") +
        (name === "RouteMarker" ? ", MarkerContent" : ""),
      "  const coordinates: [number, number][] = [[19.91, 50.06], [19.94, 50.08]];",
      "    <MapRoute " +
        (name === "MapRoute" ? "" : "") +
        'id="trip" {coordinates} progress={0.5}>\n' +
        (name === "RouteProgress"
          ? '      <RouteProgress color="#526e46" width={5} />'
          : name === "RouteMarker"
            ? '      <RouteMarker at="progress"><MarkerContent><button>Current position</button></MarkerContent></RouteMarker>'
            : "") +
        "\n    </MapRoute>",
      "Route children need MapRoute context. " + mapNote,
    ),
  ),
  mapExample(
    "MapClusterLayer",
    "Map",
    '  import type { ComponentProps } from "svelte";\n  const data: ComponentProps<typeof MapClusterLayer>["data"] = { type: "FeatureCollection", features: [\n    { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [19.925, 50.065] } },\n    { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [19.926, 50.066] } }\n  ] };',
    "    <MapClusterLayer {data} clusterRadius={50} />",
    mapNote,
  ),
  mapExample(
    "MapArc",
    "Map",
    '  import type { MapArcDatum } from "rom-ui/maps";\n  const data: MapArcDatum[] = [{ id: "link", from: [19.91, 50.06], to: [19.94, 50.08] }];',
    "    <MapArc {data} curvature={0.3} />",
    mapNote,
  ),
  mapExample(
    "MapGeoJSON",
    "Map",
    '  import type { ComponentProps } from "svelte";\n  const data: ComponentProps<typeof MapGeoJSON>["data"] = { type: "Polygon", coordinates: [[[19.91, 50.06], [19.94, 50.06], [19.94, 50.08], [19.91, 50.06]]] };',
    '    <MapGeoJSON id="area" {data} fillPaint={{ "fill-color": "#9fb889", "fill-opacity": 0.3 }} />',
    mapNote,
  ),
  example(
    "ResourceMap",
    "rom-ui/maps",
    '  let selectedId = $state<string | null>(null);\n  const points = [{ id: "project/demo", title: "Project", longitude: 19.925, latitude: 50.065 }];',
    '<div style="height: 24rem">\n  <ResourceMap {points} {selectedId} authorityToken="session-1" label="Projects" failedLabel="Selection rejected" unknownLabel="Confirm selection outcome" mapOptions={{ center: [19.925, 50.065], zoom: 12 }} onSelect={(id) => { selectedId = id; return "accepted"; }} />\n</div>',
    "Supply only authorized points. This callback selects locally; replace it with a host operation. " +
      mapNote,
  ),
  example(
    "useMap",
    "rom-ui/maps",
    "  const context = useMap();",
    "<button disabled={!context.isLoaded} onclick={() => context.map?.flyTo({ center: [19.925, 50.065], zoom: 12 })}>Go to project</button>",
    "Save as MapAction.svelte. Import and render <MapAction /> inside <Map> in a parent component. Call useMap during child initialization.",
  ),
];
const flex = ["ROMUIFlex", "FlexView"].map((name) =>
  example(
    name,
    "rom-ui/flex",
    "  let flex: " +
      name +
      ';\n  let view = $state("Overview");\n  let heading: HTMLHeadingElement;\n  let error = $state("");\n  async function showDetails() {\n    try {\n      await flex.run(() => { view = "Details"; }, { focus: () => heading });\n    } catch { error = "The view could not change."; }\n  }',
    "<button onclick={showDetails}>Show details</button>\n<" +
      name +
      ' bind:this={flex} native={true} label="Resource view">\n  <h2 bind:this={heading} tabindex="-1">{view}</h2>\n  <p>Host-owned resource content.</p>\n</' +
      name +
      '>\n{#if error}<p role="alert">{error}</p>{/if}',
    "FlexView is an alias of ROMUIFlex. Native snapshots are opt-in and cover the document. Local fallback and reduced motion work automatically. Load data before the synchronous update callback.",
  ),
);
export const componentExamples: Record<ExampleCategory, ComponentExample[]> = {
  controls,
  overlays: overlayExamples,
  forms: [{ name: "ResourceForm", note: "Studio descriptor-driven editors. This example previews a local callback; connect the submission to the ROM application session for durable actions and recovery.", code: "<script lang=\"ts\">\n  import { ResourceForm, type ResourceFormSubmission } from \"rom-studio/forms\";\n  import { stringifyWire, type ResourceDescriptor, type WireObject } from \"rom-studio/client\";\n  const descriptor: ResourceDescriptor = {\n    kind: \"public-forms\", version: 1, actions: [], action_inputs: [],\n    fields: [\n      { name: \"appointment\", shape: { type: \"string\" }, codec: { name: \"rom.date\", version: 1 } },\n      { name: \"amount\", shape: { type: \"string\" }, codec: { name: \"rom.decimal\", version: 1 } },\n      { name: \"count\", shape: { type: \"u64\" } },\n      { name: \"enabled\", shape: { type: \"bool\" } },\n      { name: \"note\", shape: { type: \"optional\", value: { type: \"nullable\", value: { type: \"string\" } } } },\n    ],\n  };\n  const value: WireObject = {\n    appointment: \"2024-02-29\", amount: \"9007199254740993.000000000000000001\",\n    count: 9007199254740993n, enabled: false, note: \"Keep this note\",\n  };\n  let submitted = $state(\"none\");\n  let rejecting = $state(false);\n  async function submit(input: ResourceFormSubmission) {\n    if (rejecting) throw Error(\"Application rejected this patch.\");\n    submitted = stringifyWire(input);\n  }\n</script>\n\n<main>\n  <h1>Installed ROM form</h1>\n  <label><input type=\"checkbox\" bind:checked={rejecting} /> Reject application submission</label>\n  <ResourceForm {descriptor} {value} mode=\"patch\" direct {submit} />\n  <output aria-label=\"Submitted form\">{submitted}</output>\n</main>\n" }, { name: "ActionForm", note: "Typed action inputs from Studio descriptors. This local callback previews values; connect the ROM application session for invocation, authorization and durable recovery.", code: "<script lang=\"ts\">\n  import { ActionForm } from \"rom-studio/forms\";\n  import { stringifyWire, type ActionInput, type ResourceDescriptor, type WireValue } from \"rom-studio/client\";\n  const action: ActionInput = { name: \"annotate\", version: 1, input: { type: \"object\", value: [{ name: \"message\", shape: { type: \"string\" } }] } };\n  const descriptor: ResourceDescriptor = { kind: \"task\", version: 1, fields: [], actions: [action.name], action_inputs: [action] };\n  let preview = $state(\"none\");\n  async function invoke(input: WireValue) { preview = stringifyWire(input); }\n</script>\n\n<ActionForm {descriptor} {action} oninvoke={invoke} />\n<output aria-label=\"Action input preview\">{preview}</output>" }],
  "studio-primitives": studioPrimitiveExamples,
  compositions,
  chat,
  flow: [flowCode("FlowChoiceNode"), flowCode("FlowFit")],
  maps,
  flex,
};
