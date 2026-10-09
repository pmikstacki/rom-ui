# View transitions

Import `ROMUIFlex` or its alias `FlexView` from `rom-ui/flex`.
The application owns navigation, data loading, validation, and state.
The component adds motion to a synchronous state change.

```svelte
<script lang="ts">
  import { ROMUIFlex } from "rom-ui/flex";
  let flex: ROMUIFlex;
  let view = $state("overview");
  let heading: HTMLHeadingElement;
  async function showDetails() {
    // Load and validate application data before calling run.
    await flex.run(
      () => {
        view = "details";
      },
      { focus: () => heading },
    );
  }
</script>

<button onclick={showDetails}>Details</button>
<ROMUIFlex bind:this={flex} label="Resource view">
  <h2 bind:this={heading} tabindex="-1">{view}</h2>
</ROMUIFlex>
```

`run` resolves to `finished` or `disposed`.
An exception from the update callback rejects the promise.
Handle rejection in the application.
The component does not roll back changes that the callback made before throwing.
Do not pass an asynchronous update callback.
Complete data loading before calling `run`.

By default, Animotion animates the component’s opacity.
The pinned dependency is [`@animotion/motion` 2.0.3](https://github.com/animotionjs/motion).
Its `tween`, `to`, `current`, and `reset` APIs provide the fallback fade.
`duration` sets the fallback duration in milliseconds. Its default is `180`.

Set `native={true}` to use `document.startViewTransition` when available.
Native snapshots cover the document, including content outside this component.
Use this option only when the application accepts document-wide snapshots.
ROMUIFlex instances serialize native work through one queue for each document.
Other libraries that call the browser API do not share this queue.
The component does not set global transition styles or snapshot names.

If the native animation fails, the component uses the Animotion fallback.
It does not repeat the state change.
If the browser lacks native support, navigation remains functional.
With reduced motion, the component applies the state change without animation.

Rapid requests run in submission order.
Each request waits for the preceding transition.
On destruction, the component skips its native animation and resets its tween.
Queued requests resolve to `disposed` without calling their update callbacks.
No new state callback runs after destruction.

The optional `focus` function selects an element after the transition.
The component does not move focus if the user focused another element during the transition.
The component permits focus restoration when the previous element was removed.
Without this option, the application keeps responsibility for focus.

`createFlexController` exposes the same queue contract for custom compositions.
Supply animation, cancellation, rendering settlement, and capability functions through `FlexRuntime`.
The caller must coordinate document-wide snapshots when using this lower-level controller directly.
