<script lang="ts">
  import Showcase from "./Showcase.svelte";
  import { ResourceForm, ActionForm, type ResourceFormSubmission } from "rom-studio/forms";
  import { stringifyWire, type ResourceDescriptor, type WireObject, type WireValue, type ActionInput } from "rom-studio/client";
  const action: ActionInput = { name: "annotate", version: 1, input: { type: "object", value: [{ name: "message", shape: { type: "string" } }] } };
  const descriptor: ResourceDescriptor = {
    kind: "gallery-fields", version: 1, actions: [action.name], action_inputs: [action],
    fields: [
      ...["date", "time", "datetime", "color", "email", "url", "multiline", "json-document", "decimal"].map(name => ({ name, shape: { type: "string" as const }, codec: { name: `rom.${name}`, version: 1 } })),
      { name: "measurement", shape: { type: "map", value: { type: "string" } }, codec: { name: "rom.unit-value", version: 1 } },
      { name: "category", shape: { type: "enum", value: ["inspection", "maintenance"] }, enum_labels: { inspection: "Inspection", maintenance: "Maintenance" } },
      { name: "tags", shape: { type: "list", value: { type: "string" } } },
      { name: "categories", shape: { type: "list", value: { type: "enum", value: ["inspection", "maintenance"] } } },
      { name: "metadata", shape: { type: "map", value: { type: "string" } } },
      { name: "related", shape: { type: "reference", value: { kind: "task" } } },
      { name: "count", shape: { type: "u64" } },
      { name: "enabled", shape: { type: "bool" } },
      { name: "note", shape: { type: "optional", value: { type: "nullable", value: { type: "string" } } } },
    ],
  };
  const value: WireObject = {
    date: "2026-10-09", time: "09:30:00", datetime: "2026-10-09T09:30:00+02:00",
    color: "#6366f1", email: "gallery@example.com", url: "https://example.com",
    multiline: "Inspect the resource.\nRecord the result.",
    "json-document": '{"sequence":9007199254740993,"approved":false}',
    decimal: "9007199254740993.000000000000000001", count: 9007199254740993n,
    measurement: { value: "12.5", unit: "kg" }, category: "inspection", tags: ["Workshop", "Inspection"],
    categories: ["inspection"], metadata: { location: "Workshop" }, related: "task-a",
    enabled: false, note: "Keep this note",
  };
  let readonly = $state(false);
  let rejecting = $state(false);
  let submitted = $state("none");
  let actionInput = $state("none");
  async function invoke(input: WireValue) {
    if (rejecting) throw Error("Application rejected this action.");
    actionInput = stringifyWire(input);
  }
  async function submit(input: ResourceFormSubmission) {
    if (rejecting) throw Error("Application rejected this patch.");
    submitted = stringifyWire(input);
  }
</script>

<Showcase title="Studio semantic fields" api="rom-studio/forms" level={2}>
  <p class="muted">These are the same descriptor-driven editors used by ROM Studio. Dates, exact decimals, structured JSON and field states retain their ROM contracts.</p>
  <p class="muted">Local submission preview. This example does not persist a Resource; live ROM actions and receipt recovery are still pending.</p>
  <div class="demo-options">
    <label><input type="checkbox" bind:checked={readonly} /> Read-only form</label>
    <label><input type="checkbox" bind:checked={rejecting} /> Reject application submission</label>
  </div>
  <ResourceForm {descriptor} {value} {readonly} mode="patch" direct {submit} />
  <h3>Local submission preview</h3>
  <pre aria-label="Submitted form">{submitted}</pre>
</Showcase>

<Showcase title="Typed action input" api="ActionForm" level={2} class="action-preview">
  <p class="muted">The same descriptor drives the action form. This callback previews its input locally; it does not invoke a ROM action.</p>
  <ActionForm {descriptor} {action} {readonly} oninvoke={invoke} />
  <h3>Local action input preview</h3>
  <pre aria-label="Action input preview">{actionInput}</pre>
</Showcase>

<style>
  :global(.action-preview) { margin-top: 1.25rem; }
  pre { overflow: auto; max-height: 16rem; white-space: pre-wrap; overflow-wrap: anywhere; font-size: .8rem; }
</style>
