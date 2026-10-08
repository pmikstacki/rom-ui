# ROM UI

Reusable Svelte 5 controls and UI compositions extracted from ROM Studio.

- `rom-ui/controls`: Input, Button, Textarea, NativeSelect, Checkbox, Slider and Label.
- `rom-ui/styles`: shared Tailwind theme and control styles.
- `rom-ui/ui`: request ownership, selection, source links, export snapshots, follow-latest and layout validation.
- `rom-ui/ui/components`: ResponsiveDetails, HistoryList, SelectionCard, LayoutControls and ReferencePicker.

Client, discovery, authentication and durable mutation recovery remain in ROM.
ReferencePicker requires a host normalizer. It does not import ROM codecs or descriptors.
See [composition contracts](docs/compositions.md).

This is an extraction candidate, not a published npm release.
ROM Studio compatibility integration remains open.

Use the pinned pnpm 10.30.0 through Corepack.
Run `corepack pnpm install --frozen-lockfile`, then `corepack pnpm run build`, `corepack pnpm run check` and `corepack pnpm run test:unit`.
Run `./scripts/check` for the packed consumer and browser checks.
Set `ROM_CHROMIUM_PATH` and `ROM_WEBKIT_EXECUTABLE` when using external browser executables.

After a reviewed source change, run `corepack pnpm pack` and `node scripts/update-consumer.mjs`.
Update the consumer lock with `corepack pnpm --dir tests/consumer install --lockfile-only --ignore-scripts`.
The verifier rejects a packed candidate that differs from the pinned consumer manifest.
