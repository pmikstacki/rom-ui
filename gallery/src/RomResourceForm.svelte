<script lang="ts">
  import { untrack } from "svelte";
  import { ResourceForm, type ResourceFormSubmission } from "rom-studio/forms";
  import type { ApplicationController, ApplicationState } from "rom-studio/application";
  import type { ResourceDescriptor, ProjectedView } from "rom-studio/client";
  let { application, descriptor, record, editor, disabled, restoreEpoch }: {
    application: ApplicationController;
    descriptor: ResourceDescriptor;
    record: ProjectedView;
    editor: ApplicationState["editor"];
    disabled: boolean;
    restoreEpoch: number;
  } = $props();
  // Each keyed form owns its original principal and Resource target.
  const initialDescriptor = untrack(() => descriptor);
  const initialRecord = untrack(() => record);
  const writer = untrack(() => application.createDraftWriter(record.key.id));
  async function submit(input: ResourceFormSubmission) {
    await application.mutate(record.key.id, record.revision, input);
  }
</script>

<ResourceForm
  descriptor={initialDescriptor}
  value={initialRecord.value ?? {}}
  baseRevision={initialRecord.revision}
  draftSnapshot={editor?.snapshot ?? null}
  {restoreEpoch}
  direct
  mode="patch"
  {submit}
  submitDisabled={disabled}
  onDraftChange={(snapshot, input) => writer.stage(snapshot, input)}
/>
