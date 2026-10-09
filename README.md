# ROM UI

Reusable Svelte 5 controls and UI compositions extracted from ROM Studio.

- `rom-ui/controls`: Input, Button, Textarea, NativeSelect, Checkbox, Slider and Label.
- `rom-ui/chat`: ConversationLayout, ChatComposer and ChatMessages.
- `rom-ui/flow`: FlowChoiceNode and FlowFit, with an optional Svelte Flow peer.
- `rom-ui/maps`: MapLibre maps, markers, routes, GeoJSON and host-owned Resource selection.
- `rom-ui/flex`: ROMUIFlex and FlexView with View Transitions and Animotion fallback.
- `rom-ui/styles`: shared Tailwind theme and control styles.
- `rom-ui/ui`: request ownership, selection, source links, export snapshots, follow-latest and layout validation.
- `rom-ui/ui/components`: ResponsiveDetails, HistoryList, SelectionCard, LayoutControls, ReferencePicker and ConversationLayout.

Client, discovery, authentication and durable mutation recovery remain in ROM.
ReferencePicker requires a host normalizer. It does not import ROM codecs or descriptors.
See [composition contracts](docs/compositions.md).

The extraction package is available as [v0.1.0-alpha.5](https://github.com/pmikstacki/rom-ui/releases/tag/v0.1.0-alpha.5).
Existing ROM Studio integrations retain their public facade paths.
The distribution uses a GitHub release archive and a frozen pnpm lock.
See [ROM integration evidence](docs/rom-integration.md).

Install the alpha archive in a separate application:

```sh
corepack pnpm@10.30.0 add https://github.com/pmikstacki/rom-ui/releases/download/v0.1.0-alpha.5/rom-ui-0.1.0-alpha.5.tgz
```

Use the pinned pnpm 10.30.0 through Corepack.
Run `corepack pnpm install --frozen-lockfile`, then `corepack pnpm run build`, `corepack pnpm run check` and `corepack pnpm run test:unit`.
Run `./scripts/check` for the packed consumer and browser checks.
Set `ROM_CHROMIUM_PATH` and `ROM_WEBKIT_EXECUTABLE` when using external browser executables.

After a reviewed source change, run `corepack pnpm pack` and `node scripts/update-consumer.mjs`.
Update the consumer lock with `corepack pnpm --dir tests/consumer install --lockfile-only --ignore-scripts`.
The verifier rejects a packed candidate that differs from the pinned consumer manifest.

See [chat and Flow contracts](docs/chat-flow.md) and [gallery development](docs/gallery.md).
The gallery target is [romui.cybernomad.it](https://romui.cybernomad.it).

Explore the English [component gallery](https://romui.cybernomad.it), with copyable usage examples for the public controls and compositions.
