# ROM UI extraction implementation plan

**Goal:** Extract reusable UI while preserving ROM Studio public paths.
**Architecture:** Move verified increments into an independent source package. Keep ROM-specific semantics in adapters.
**Tech Stack:** Existing Svelte 5, Bits UI, Tailwind 4, Vite and Playwright versions.
**Spec:** [Extraction design](design.md).

## Task 1: Public primitive package

Files: `src/controls.ts`, `src/lib/components/ui`, `src/styles.css`, `tests/consumer`, `scripts/check`.

- [x] Reproduce missing package exports with an independent consumer build.
- [x] Copy the public primitive dependency closure with source hashes and licenses.
- [x] Install the packed package in the consumer using a frozen independent lock.
- [x] Verify type checking, build and existing behavioral browser cases in both engines.
- [x] Commit and push the verified extraction candidate.

## Task 2: Generic UI compositions

Files: `src/ui.ts`, `src/ui-components.ts`, focused modules and consumer cases.

- [x] Inventory dependencies for every helper and composition.
- [x] Extract generic helpers and compositions with their existing behavioral regressions.
- [ ] Define a ROM-owned adapter for descriptor and codec dependent reference editing.
- [x] Verify disposal, focus, async cancellation and exact ID preservation.

## Task 3: ROM integration

Files in ROM: Studio manifests, lockfile, compatibility facades, styles and release packaging scripts.

- [ ] Coordinate source ownership with the active ROM release work.
- [ ] Replace duplicate primitive implementations with stable public re-exports.
- [ ] Run affected checks, installed consumers and the complete local verifier.
- [ ] Record package identity, migration guidance and remaining release limits.

## Package manager and installed Node support

User instruction: use pnpm. Both projects pin pnpm 10.30.0 and maintain independent frozen pnpm locks.
Preserve the previous npm locks as historical evidence.
Compile the headless entry to JavaScript and declarations before packing.
Test the installed headless entry in plain Node, without type stripping or a checkout link.
