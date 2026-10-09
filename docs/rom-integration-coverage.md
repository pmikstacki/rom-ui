# ROM integration coverage audit

Inspected on 2026-10-09 against `/root/ROM/studio` and the ROM UI gallery source.
The public gallery currently uses a dedicated static nginx container behind Caddy on the Coolify network.
It is not served by a ROM runtime. Its records, chat responses and activity progress are local examples.

| Required feature | Current gallery | Required completion evidence |
| --- | --- | --- |
| General inputs, buttons, checkbox, slider, native select | Installed rom-ui demos | ROM-bound read/write states and host integration checks |
| Optional, nullable, read-only and undisclosed field states | Missing ROM form demo | Actual descriptor-driven form, absence/null/removal and permission cases |
| Exact integer and decimal editing | Generic input only | Accepted and rejected ROM codec values, without numeric rounding |
| Date, datetime, time, color, email, URL | Missing semantic editor demo | Installed Studio semantic renderers and real Resource actions |
| Multiline and JSON document editing | Textarea only | Expansion, retained invalid drafts and validated wire values |
| Unit value editing | Missing | Value/unit contract and real mutation outcomes |
| Enum/list/structured value editing | Native select only | Studio ValueEditor/ListEditor/EnumListChoices with actual descriptors |
| Resource reference editing | Generic reference picker | Authorized lookup and exact ID actions through the ROM binding |
| Form submission and recovery | Local examples | Confirmed receipts, rejection, stale revisions and unknown outcome recovery |
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
