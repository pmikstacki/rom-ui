# ROM UI delivery goal

Extend rom-ui with reusable ROM-connected controls, Flow, AI chat, maps and view transitions.
Use pnpm. Publish and verify the English gallery at https://romui.cybernomad.it.
Provide a copyable example for every visual control.

Components must be plug and play with ROM through a supported installed integration.
A static demonstration with local records does not satisfy the ROM integration requirement.
Preserve exact Resource IDs, authorized observation, action receipts, failure recovery and application-owned policy.
The gallery must exercise actual ROM-backed Resources and actions, with observable success and failure cases.
Record whether the gallery runtime is served by ROM or by a separate static host.

The chat composer must expose a slot for application-supplied icon buttons and dropdowns.
Microphone and attachment controls are examples of extensions, not framework-owned hardware or storage policy.
Extract an interactive agent activity panel informed by Astral's working/progress display.
The panel must support actions and live updates through the ROM integration.
Keep model execution, credentials, authorization and persistence in the host.

Remaining acceptance includes installed host migrations, ROM-backed gallery interactions and the ROM-extras map-provider integration.
Do not mark the goal complete from presentation-only browser tests.
