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

Run `npm ci`, then `npm run check` and `npm run test:unit`.
Run `./scripts/check` for the packed consumer and browser checks.
Set `ROM_CHROMIUM_PATH` and `ROM_WEBKIT_EXECUTABLE` when using external browser executables.

After a reviewed source change, run `npm pack --ignore-scripts` and `node scripts/update-consumer.mjs`.
Update the consumer lock with `npm install --package-lock-only --ignore-scripts --prefix tests/consumer`.
The verifier rejects a packed candidate that differs from the pinned consumer manifest.
