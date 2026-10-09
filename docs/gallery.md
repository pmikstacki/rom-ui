# Public component gallery

The gallery target is https://romui.cybernomad.it.
The gallery contains synthetic controls, Studio primitives, composition, chat, Flow, map and Flex examples.
Chat responses are simulated locally. The gallery does not send prompts to an AI service.

The gallery installs a content-addressed archive from the repository root.
It does not alias package source or use a workspace link.

```sh
corepack pnpm pack --pack-destination .
node scripts/update-consumer.mjs
node scripts/gallery-package.mjs
corepack pnpm --dir tests/consumer install --lockfile-only --ignore-scripts
corepack pnpm --dir gallery install --lockfile-only --ignore-scripts
./scripts/check
corepack pnpm --dir gallery run dev
```

Set `ROM_CHROMIUM_PATH` and `ROM_WEBKIT_EXECUTABLE` when using external browser executables.
The full verifier builds both installed consumers and runs both browser engines.
It also compiles and type-checks all copyable usage examples against the installed archive.
The gallery uses hash navigation; direct links include `/#studio-primitives`, `/#chat`, `/#flow`, `/#maps` and `/#flex`.

## Source boundaries

ConversationLayout is extracted from ROM under its existing MIT license.
Flow choice and fitting behavior comes from the Madzia application.
New chat form and message components implement reusable presentation contracts.
Astral Plane supplies interaction requirements: bounded chat, expandable history, IME and a visible composer.
Its astrology, queue, storage, authority and AGPL application source remain in the host.
The package does not copy those application sources into its MIT distribution.

## Shared Studio primitives

The alpha.7 candidate extracts 14 additional primitive families from the recorded ROM authoring checkout.
The provenance record freezes their source hashes. Tooltip adds its missing default accessibility role.
Sidebar retains the existing mobile focus callback and compatibility defaults.
Its Provider enables Ctrl/Cmd+B and the `sidebar_state` presentation cookie by default.
Set `keyboardShortcut={false}` and `persistState={false}` for embedded instances that must not share those policies.
The gallery disables both.

ROM Studio now reexports these families from the installed alpha.7 archive.
The integration preserves existing public paths and removes 105 local implementation files.
Root checks passed: 418 unit tests, zero Svelte diagnostics and both browser identity cases.
The isolated integration candidate also passed the full ROM local verifier and 54 independent installed-consumer browser cases.
These results do not establish actual ROM-backed gallery interactions.

## Deployment

Use a dedicated static container on the existing Coolify network.
Set its Caddy host label to `romui.cybernomad.it`.
Preserve other containers and shared proxy configuration.
Record the built source identity, archive checksum and public verification with each deployment.

The alpha.7 public deployment passed all 84 gallery cases in Chromium and WebKit.
The earlier Chromium runs failed while loading entry assets with `ERR_NETWORK_CHANGED`.
Retained traces establish the loading failure; they do not establish its infrastructure cause.
See the committed [public result](../evidence/gallery/alpha7-public/result.json) and [integration checks](../evidence/rom-integration/alpha7/root-checks.json).

## Map source

The gallery host explicitly selects OpenFreeMap Positron and Dark street styles.
MapLibre displays the required OpenMapTiles and OpenStreetMap attribution.
The library still defaults to a tile-less style.
Choose Schematic to view local overlays without a geographic provider.
The gallery retains this recovery option if the first provider request fails.
See [OpenFreeMap integration](https://openfreemap.org/quick_start/) and [terms](https://openfreemap.org/tos/).
ROM-extras provider/browser descriptor integration remains pending until its adapter is available.
