<script lang="ts">
  import { ResourceForm, type ResourceFormSubmission } from "rom-studio/forms";
  import { stringifyWire, type ResourceDescriptor, type WireObject } from "rom-studio/client";
  const descriptor: ResourceDescriptor = {
    kind: "gallery-fields", version: 1, actions: [], action_inputs: [],
    fields: [
      ...["date", "time", "datetime", "color", "email", "url", "multiline", "json-document", "decimal"].map(name => ({ name, shape: { type: "string" as const }, codec: { name: `rom.${name}`, version: 1 } })),
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
    enabled: false, note: "Keep this note",
  };
  let readonly = $state(false);
  let rejecting = $state(false);
  let submitted = $state("none");
  async function submit(input: ResourceFormSubmission) {
    if (rejecting) throw Error("Application rejected this patch.");
    submitted = stringifyWire(input);
  }
</script>

<section class="demo-card">
  <div class="card-heading"><h2>Studio semantic fields</h2><code>rom-studio/forms</code></div>
  <p class="muted">These are the same descriptor-driven editors used by ROM Studio. Dates, exact decimals, structured JSON and field states retain their ROM contracts.</p>
  <p class="muted">Local submission preview. This example does not persist a Resource; live ROM actions and receipt recovery are still pending.</p>
  <div class="demo-options">
    <label><input type="checkbox" bind:checked={readonly} /> Read-only form</label>
    <label><input type="checkbox" bind:checked={rejecting} /> Reject application submission</label>
  </div>
  <ResourceForm {descriptor} {value} {readonly} mode="patch" direct {submit} />
  <h3>Local submission preview</h3>
  <pre aria-label="Submitted form">{submitted}</pre>
</section>

<style>
  pre { overflow: auto; max-height: 16rem; white-space: pre-wrap; overflow-wrap: anywhere; font-size: .8rem; }
</style>
