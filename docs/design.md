# ROM UI extraction design

Date: 2026-10-08.

## Goal

Extract reusable controls from ROM Studio into `pmikstacki/rom-ui`.
Applications must use the package without a ROM checkout or private aliases.

## Boundaries

Keep visual primitives, their utilities, shared styles and generic UI behavior in ROM UI.
Keep wire codecs, Resource descriptors, authorization, observation and durable recovery in ROM.
ReferencePicker needs an explicit adapter before extraction because it imports ROM codecs and descriptors.
Export snapshot identity also references recovery types and needs boundary review.

## Compatibility

Preserve component props, bindings, element references, keyboard behavior and style contracts.
Keep `rom-studio/controls`, `rom-studio/ui` and `rom-studio/ui/components` stable during integration.
Replace implementations with exports from verified ROM UI increments.
Do not remove historical sources or evidence.

## Acceptance

Install a packed package in a separate consumer with its own lockfile.
Reject private aliases, checkout symlinks and ROM runtime dependencies.
Verify types, build, keyboard behavior, bindings, references, mobile geometry and stylesheet generation.
Test Chromium and WebKit separately. Record source identity and commands.
Run affected ROM tests and the full local verifier before integrating the structural refactor.
