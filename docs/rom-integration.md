# ROM Studio integration

Date: 2026-10-08.

ROM Studio now consumes the published ROM UI alpha archive.
Its public controls, headless UI and composition entries delegate to the shared package.
The migration is applied in /root/ROM.

## Package and boundaries

The published package is [v0.1.0-alpha.1](https://github.com/pmikstacki/rom-ui/releases/tag/v0.1.0-alpha.1), built from commit 7802d58.
Its archive SHA256 is 0140385db7770b5ff9ed35d392883ed6c9eb5a1e95e38fb729e56ee6a2f09221.
The ROM producer and independent consumer locks pin that archive and its integrity.

| Stable Studio entry | Implementation |
| --- | --- |
| rom-studio/controls | rom-ui/controls |
| rom-studio/ui | Compiled rom-ui/ui helpers |
| rom-studio/ui/components | Shared compositions and a ROM-owned ReferencePicker adapter |
| Primitive module facades | rom-ui/primitives family exports |
| Studio theme | rom-ui/styles with application-specific styles retained in ROM |

ROM retains wire codecs, Resource descriptors, client validation, discovery, authorization and durable recovery.
The reference adapter supplies canonical normalization and retains the existing descriptor-bearing lookup type.
ConversationLayout was added concurrently in ROM and remains available through the public composition entry.
Runtime notice resolution supports pnpm dependency placement, nested style imports and shared installation paths.

Both packages and consumer fixtures pin pnpm 10.30.0.
ROM retains its legacy npm locks for its existing release profile.
The pnpm consumer mode uses a frozen independent lock and verifies physical source identity and realized package versions.
Its placement can differ from the legacy npm dependency tree.

## Source ownership

The isolated worktree started from ROM commit 1a2b793 and the active checkout's dirty source.
Only 110 owned paths were copied or deleted during integration.
See [the applied manifest](../evidence/rom-integration-applied.json), [owned hashes](../evidence/rom-integration-owned.json) and [migration patch](../evidence/rom-integration.patch).
Exact original backups remain in /var/tmp/rom-ui-rom-before.
The original Studio dependency installation remains in /var/tmp/rom-ui-root-original-node_modules.
Concurrent journal, Cargo and ConversationLayout changes were preserved.
The migration has not been committed into ROM's active dirty branch.

## Verification

| Check | Executed result | Evidence |
| --- | --- | --- |
| ROM UI package verifier | 60 source units, 2 installed plain-Node tests and 72 browser tests passed | [Log](../evidence/pnpm-integration-final-green.log) |
| ROM Studio units in original checkout | 418 passed | [Log](../evidence/rom-root-unit.log) |
| Studio type check after refreshed source | 0 errors and 0 warnings | [Log](../evidence/rom-post-integration-check.log) |
| Studio build in original checkout | Passed with runtime notice generation | [Log](../evidence/rom-root-build.log) |
| Complete refreshed Studio browser suite | 323 passed, 1 skipped; Chromium and WebKit | [Log](../evidence/rom-post-integration-browsers.log) |
| Independently installed Studio consumer from original checkout | Frozen pnpm install, source identity, type check, build and 22 browser cases passed | [Result](../evidence/rom-root-public-pnpm-result.json) |
| Full ROM verifier before integration | Passed on a frozen snapshot | [Log](../evidence/rom-full-verifier-final.log) |
| Full ROM verifier after concurrent updates | Passed on a frozen snapshot with RUST_TEST_THREADS=2 | [Log](../evidence/rom-post-integration-full-verifier.log) |
| Read-only code review | No actionable findings; 19 runtime notice and pnpm tests independently passed | [Review](../evidence/rom-extraction-review.md) |

The full verifier ran ./scripts/check with Rust 1.99.0, locked Cargo dependencies and offline Cargo resolution.
The build target was /var/tmp/rom-ui-integration-cargo-target; development and test debug information was disabled.
The pre-integration snapshot identity was e361157095687b8bbfbd73a4534b197ce0d2f88d3d461b0b633138134a1ec45b.
The refreshed post-integration identity was 17646596c28657613fb85738cfcebe9e1d43d951a2cfac9b6a5af82fd99195a8.
The before and after manifests match for each successful full run.
All 110 owned paths in the original checkout match the verified worktree.

Documentation updates changed the development consumer archive metadata.
Its frozen lock now pins archive SHA256 0b12d296183dcaaa8cb7761ddbd3bbf8ba043e2fc96f54c8b6f56ebcf3ba2e82.
The published alpha archive and ROM's dependency remain pinned to the original SHA256 above.
The original development consumer manifest and pnpm lock are retained as evidence.

## Recorded limits

The skipped case uses Chromium CDP for physical touch input.
WebKit physical touch remains an explicit acceptance gap.
The browser fixtures automate behavior; human usability remains a separate release activity.
The existing ROM release admission profile remains unchanged.

A supplemental run in the active root checkout failed at a test CPU descendant start assertion.
Its browser run also overlapped a ConversationLayout source and build update.
The frozen post-integration run passed with two Rust test-harness threads.
Internal concurrency cases still executed.
The failed logs and source manifests remain in evidence.

One earlier WebKit details run timed out during scroll stabilization.
Five traced repetitions and the subsequent complete frozen suites passed.
The timeout log and trace evidence are retained.
