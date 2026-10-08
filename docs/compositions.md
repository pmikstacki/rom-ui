# Composition contracts

The host owns data, authorization, persistence and mutation recovery.
ROM UI owns display behavior and fences stale callbacks through host-provided identity tokens.
A token does not grant authorization. Recheck current authority before disclosing data or committing work.

## Public entries

Import components from `rom-ui/ui/components` and headless helpers from `rom-ui/ui`.
The headless entry imports no Svelte components, ROM client, codec, authentication or recovery module.
The component entries ship TypeScript and Svelte source for application bundlers.
The headless entry ships JavaScript and type declarations for direct Node use.

ResponsiveDetails retains one mounted editor across desktop and mobile transitions.
HistoryList uses exact IDs and host-confirmed selection.
SelectionCard and LayoutControls report confirmed host results; they do not implement durable writes.
An unknown result holds the command until the host explicitly advances its recovery token.

## ReferencePicker boundary

Supply `normalizeId(text, kind, path)` to validate an exact ID.
The callback must return a string or throw an error safe for display.
ROM UI does not trim, parse or reinterpret the ID.
Use a stable normalizer identity. Replacing it clears old lookup scope and selected labels.

An optional lookup supplies `descriptor(kind)` and `lookup(kind, search, signal)`.
The descriptor is an opaque object used only as scope identity.
A changed object, authority token or lookup owner invalidates retained labels and pending results.
The host must honor cancellation and authorize every lookup independently.
Results admit at most twenty candidates and 65536 UTF-8 bytes.
Search input admits at most 1024 UTF-8 bytes and eight attempts per open lookup lifetime.

The ROM adapter must keep the existing ReferencePicker props.
It supplies normalization through ROM's canonical reference codec and preserves the existing lookup contract.
Generic UI must not import that adapter.

## Export snapshot boundary

ExportPrincipal has the same structural identity fields as ROM's existing DurablePrincipal.
The snapshot captures identity and delegates bounded, exact cloning to the host.
It does not encode a ROM wire value, render a file or establish a disclosure grant.
ROM retains codec-specific precision tests for its clone adapter.

## Verification limits

The installed consumer exercises the public source package with an independent dependency lock.
Its callbacks simulate host ownership changes and rejected or unknown commands.
These tests do not establish actual backend authorization or durable Settings persistence.
ROM compatibility is verified through stable Studio facades and a separate installed consumer.
The complete ROM verifier is a separate integration gate.
See [ROM integration evidence](rom-integration.md).
