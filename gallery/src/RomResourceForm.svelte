<script lang="ts">
  import { untrack } from "svelte";
  import { ResourceForm, type ResourceFormSubmission } from "rom-studio/forms";
  import type { ApplicationController, ApplicationState } from "rom-studio/application";
  import type { ResourceDescriptor, ProjectedView } from "rom-studio/client";
  let { application, mutate, descriptor, record, editor, disabled, updating, restoreEpoch }: {
    application: ApplicationController;
    mutate: ApplicationController["mutate"];
    descriptor: ResourceDescriptor;
    record: ProjectedView;
    editor: ApplicationState["editor"];
    disabled: boolean;
    updating: boolean;
    restoreEpoch: number;
  } = $props();
  // Each keyed form owns its original principal and Resource target.
  const initialDescriptor = untrack(() => descriptor);
  const initialRecord = untrack(() => record);
  const writer = untrack(() => application.createDraftWriter(record.key.id));
  let confirmed = $state(0);
  async function submit(input: ResourceFormSubmission) {
    await mutate(record.key.id, record.revision, input);
    if (application.state.editor?.status === "idle") confirmed++;
  }
</script>

{#key confirmed}
<ResourceForm
  descriptor={initialDescriptor}
  value={initialRecord.value ?? {}}
  baseRevision={initialRecord.revision}
  draftSnapshot={editor?.snapshot ?? null}
  {restoreEpoch}
  direct
  mode="patch"
  {submit}
  readonly={updating}
  submitDisabled={disabled}
  onDraftChange={(snapshot, input) => writer.stage(snapshot, input)}
/>
{/key}
