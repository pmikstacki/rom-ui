# ROM integration coverage audit

Inspected on 2026-10-09 against `/root/ROM/studio` and the ROM UI gallery source.
The public gallery currently uses a dedicated static nginx container behind Caddy on the Coolify network.
It is not served by a ROM runtime. Its records, chat responses and activity progress are local examples.

| Required feature | Current gallery | Required completion evidence |
| --- | --- | --- |
| General inputs, buttons, checkbox, slider, native select | Installed rom-ui demos | ROM-bound read/write states and host integration checks |
| Optional, nullable, read-only and undisclosed field states | Installed Studio optional/nullable and read-only previews; undisclosed demo missing | Actual descriptor-driven form, absence/null/removal and permission cases |
| Exact integer and decimal editing | Installed Studio exact u64 and decimal editors | Accepted and rejected ROM codec values, without numeric rounding |
| Date, datetime, time, color, email, URL | Installed Studio semantic editors | Installed Studio semantic renderers and real Resource actions |
| Multiline and JSON document editing | Installed Studio multiline and structured JSON editors | Expansion, retained invalid drafts and validated wire values |
| Unit value editing | Installed Studio value/unit editor | Value/unit contract and real mutation outcomes |
| Enum/list/structured value editing | Installed Studio enum, lists and map editors | Studio ValueEditor/ListEditor/EnumListChoices with actual descriptors |
| Resource reference editing | Generic picker and Studio exact-ID editor; no authorized gallery lookup | Authorized lookup and exact ID actions through the ROM binding |
| Form submission and recovery | Installed ResourceForm and ActionForm with local accepted/rejected callbacks | Confirmed receipts, rejection, stale revisions and unknown outcome recovery |
| Chat composer extensions | New actions slot | Installed slot tests and ROM host-owned tool actions |
| Agent activity | New interactive local example | Authorized live task observation and cancel/retry actions with outcomes |
| Flow and maps | Installed generic compositions | ROM-backed Resource projections and approved map-provider descriptors |

Semantic validation and authorization remain in ROM Studio and the host.
Do not move codec-dependent renderers into the generic rom-ui package to fill the gallery.
Install their supported public entry points through a ROM gallery integration package.
Preserve current Studio public paths and keep generic primitives reusable outside ROM.

A ROM-backed gallery requires an isolated host with explicit demo policies and a persistent Resource store.
Record the runtime image, installed package identities, lockfiles and public HTTPS checks.
A component-browser test or a static health endpoint does not prove that integration.

## Shared implementation verification

Studio uses the released alpha.7 archive for 14 additional primitive families.
Its generic control facades and ConversationLayout use the same installed owner implementations.
The new `rom-studio/forms` entry point exposes existing Studio forms and renderer contracts.
Semantic editors and recovery remain in Studio.
The installed forms consumer passed exact-integer and rejected-submission cases in both browsers.
The gallery now uses installed ResourceForm and ActionForm exports for 18 semantic and structured fields.
These previews retain exact values and rejected drafts. Actual ROM-backed submissions and recovery remain pending.
