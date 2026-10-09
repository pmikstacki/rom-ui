# Chat and Flow compositions

Use `rom-ui/chat` for conversation presentation.
The host supplies messages, labels, authority and the submit callback.
`ConversationLayout` owns bounded geometry. `ChatComposer` owns form interaction. `ChatMessages` renders plain text and web citations.

```svelte
<script lang="ts">
  import { ChatComposer } from 'rom-ui/chat';
  let draft = $state('');
  const session = {};
  async function submit(message: string) {
    await enqueueInYourApplication(message);
  }
</script>

<ChatComposer bind:value={draft} authorityToken={session} onSubmit={submit}
  label="Message" sendLabel="Send" errorLabel="Could not send. Try again."
  hint="Enter sends; Shift+Enter adds a line" />
```

Resolve `onSubmit` only when the host has accepted the message.
Reject its promise to retain the draft and show `errorLabel`.
The composer does not retry. A rejected request is not proof that a durable operation did not commit.
The host must resolve uncertain delivery before permitting a retry.
Replace `authorityToken` when the conversation or authority changes.
A stale completion cannot clear a new draft or set its error state.
The host must also fence its own asynchronous updates.
The composer permits draft edits during pending work. It clears only the submitted, unchanged draft after acceptance.
Use `id`, `rows` and the optional `sendContent` snippet to preserve host markup contracts.
`maxLength` defaults to 4000 UTF-16 code units, matching the native textarea limit.

Give `ConversationLayout` a host with a bounded height.
Supply `header`, optional `history`, `body` and `footer` snippets.
Use `bind:bodyRef` with the headless follow-latest helpers when your host receives streamed messages.
The layout preserves the current ROM mobile expansion-control focus behavior.
Use `ResponsiveDetails` to move one editor between desktop and mobile hosts.

## Optional Flow peer

Install `@xyflow/svelte@1.7.0` when using `rom-ui/flow`.
Import `@xyflow/svelte/dist/style.css` in your application.
The existing controls and headless entries do not import Flow.

```svelte
<script lang="ts">
  import { SvelteFlow } from '@xyflow/svelte';
  import { FlowChoiceNode, FlowFit } from 'rom-ui/flow';
  const nodeTypes = { choice: FlowChoiceNode };
  let selected = $state(false);
  const nodes = $derived([{
    id: 'start', type: 'choice', position: { x: 0, y: 0 },
    data: { label: 'Start', stage: '01', selected, choose: () => selected = !selected }
  }]);
</script>

<div style="height: 400px">
  <SvelteFlow {nodes} {nodeTypes} nodesDraggable={false} nodesConnectable={false}>
    <FlowFit signature="initial" />
  </SvelteFlow>
</div>
```

`FlowChoiceNode` presents `label`, optional `stage`, selection, muted and disabled states.
The `choose` callback belongs to the host. Native buttons support keyboard selection.
Set `side` for a left target handle; the default target is above the node.
`FlowFit` receives `signature`, optional `focusIds` and `active`.
Change `signature` after host layout or container changes. Empty `focusIds` fits all nodes.
Fitting animates for 320 milliseconds by default. Set `duration` to customize the transition, or `0` for immediate fitting.
Reduced-motion preferences use immediate fitting.
Inactive or disposed fitting cancels scheduled frames and stops its running animation at the current viewport.
The host still owns graph layout, path history, data validation and selection rules.

## Composer extension controls

Supply the optional `actions` Svelte snippet to add icon buttons, dropdowns or other application controls below the message field.
Its `ChatComposerActions` argument supplies `disabled` and `pending`.
The `disabled` value includes a pending message submission. Apply it to extension controls that must pause during submission.
Use `type="button"` for extension buttons inside the composer form.
Provide accessible labels for icon buttons. Set `actionsLabel` to localize the extension group's label.
The host implements attachments, voice capture, tool selection and their authorization.
The slot does not enable microphone access or attach a Resource automatically.
`sendContent` remains available to customize the submit button.

## Agent activity

Import `AgentActivity` and `AgentActivityStep` from `rom-ui/chat`.
Supply `label`, `statusText` and steps with unique exact IDs, labels, statuses and optional plain-text details.
Supported statuses are `queued`, `running`, `done`, `error` and `canceled`.
Users can open step details with a mouse or keyboard.
Supply `actions` for task controls and `stepActions` for controls associated with an individual step.
The host supplies live progress, elapsed time, cancellation, retry and authorized Resource actions.
The component does not run a model, infer completion or grant permission from a progress status.
Set `statusLabels` to localize status names. `elapsedSeconds` is optional.
The host must bound its displayed progress history.
