# ROM-backed gallery implementation

The user requires reusable controls connected to ROM and a ROM-hosted public gallery. Static previews do not satisfy this requirement.

The gallery keeps its shared catalog, showcase components, snippets, transitions, and English text. ROM owns authentication, authorization, codecs, persistence, observation, and recovery.

## Current evidence and boundaries

The gallery installs `rom-ui` alpha.7 and an independently packaged `rom-studio` forms entry. Form callbacks currently record local values.

ROM exports `createClient` through `rom-studio/client`. It exports authentication lifecycle and recovery through separate supported entries. The application controller remains internal.

ROM's `rom-studio-host` supplies finite asset admission and session-bound API hosting. `rom-demo studio-profile` illustrates trusted HTTPS configuration. Its demo policies and fixture identities must not become the public gallery's policy.

The isolated Astral consumer passed 164 browser cases and 80 units. Its fresh archive builds the same 22 frontend files. Keep that migration isolated. Do not merge it into the application as part of gallery cleanup.

## 1. Supported installed binding

Files: the isolated ROM producer's Studio public application entry, its package exports, independent consumer fixtures, and gallery binding modules.

Expose the existing application controller and its supported session types through a narrow public entry. Preserve current entries. Reuse controller behavior rather than copying mutation lanes, editor persistence, reference lookup, or session rules.

The gallery binding owns lifecycle setup and cleanup. Components receive projected state and action callbacks. Replacing a session invalidates reads, observations, pending authority, and stale presentation updates.

Tests must cover installed imports, exact bigint values, authorized reference results, session replacement, rejected mutations, and unchanged retry after an unknown outcome.

## 2. Real form and action examples

Files: `gallery/src/FormsDemo.svelte`, a dedicated ROM-bound forms showcase, and browser specifications.

Keep the compact local preview available. Add a clearly identified live example using host-discovered descriptors and projected Resources.

Exercise create, patch, typed action, read-only, undisclosed, optional, nullable, list, map, enum, exact integer, and semantic codecs. Show confirmed rejection and stale revision outcomes.

Use the existing installed forms and controller contracts. Validate accepted values through ROM. Do not treat a descriptor as authority.

## 3. Dedicated gallery host

Files: an independently built gallery host, Resource definitions, policies, configuration admission, and host tests.

Use `rom-studio-host` for finite gallery assets, same-origin sessions, and API transport. Use persistent SQLite through the ROM storage contract.

Register synthetic gallery Resources for fields, flows, map locations, and agent tasks. Keep external model execution and private credentials outside public demonstrations.

Define an explicit public read policy and an isolated session-scoped mutation policy. Restrict discovery and references to the same scope. Supply bounded task cancel/retry actions and authorized observations.

Test persistence after restart, permission separation between visitors, rejected writes, stale revisions, duplicate retries, and lost acknowledgements. Fixture control endpoints and fixture administrator identities are excluded from the public host.

## 4. Gallery projections and map providers

Files: dedicated live chat/activity, Flow, and map examples; ROM-extras configuration adapter.

Use projected Resource IDs without conversion. Observe authorized agent task states and invoke cancel/retry through installed binding callbacks.

Read map provider descriptors through ROM-extras. Preserve attribution and an explicit schematic fallback. Do not provision the canceled Nominatim service.

## 5. Qualification and deployment

Run affected producer checks and the full ROM verifier before adopting a new producer archive. Test the exact installed archive independently.

Run gallery checks, compiled snippets, the owner verifier, and both browser engines. Validate real mutations and recovery against the gallery host.

Deploy the admitted host image at `https://romui.cybernomad.it`. Preserve the current static release for rollback. Verify HTTPS, finite assets, session scope, live mutations, rejected actions, observations, and persistence.

Record runtime image, source commits, lockfiles, installed archive identities, and test scope. Mark static presentation and live ROM evidence separately.
