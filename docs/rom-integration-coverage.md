# ROM integration coverage audit

Current deployed source: `363f679`. The gallery runs on ROM Studio hosting with persistent SQLite and dedicated Authentik OIDC.
Public origin: https://romui.cybernomad.it.

| Requirement | Current evidence | Remaining limit |
| --- | --- | --- |
| Shared controls, English gallery and per-export snippets | Installed-package verifier, 140 consumer browser cases, 61 compiled snippets, 110 gallery browser cases | A synthetic preview does not establish an application-specific integration |
| Semantic and structured forms, exact values and references | Installed Studio forms; actual host save, reload and visitor isolation in Chromium and WebKit | Production authenticated acceptance requires an approved account mapping |
| Resource session, actions and recovery | Public createAppSession facade; real commit followed by dropped acknowledgements and identical retries | Candidate Studio archive is not an admitted ROM release |
| Chat composer extensions and persisted messages | Installed shared chat controls, actions slot, ROM conversation Resource and append-only host policy | No AI model is invoked by the gallery |
| Agent activity | Generic interactive panel, real ROM task actions and observation | Task execution is synthetic; Astral is a source reference, not a service integration |
| Flow and smooth fitting | Shared Flow with ROM workflow selection, persistence and live observation | Application domain policy remains in each host |
| Maps | Qualified ROM-extras configured style, ROM map Resource, persisted selection and explicit origin policy | Controlled tile fixtures do not prove live-provider availability |
| Flex, dialogs and notifications | Installed generic controls, transitions, focus and reduced-motion browser coverage | Host callbacks own application effects |
| Public ROM hosting | 49 image files verified; valid public HTTPS; four public browser smoke cases | No production accounts have been granted access |

The complete owner verifier exited successfully. Ten actual-host browser cases passed across Chromium and WebKit.
See [conversation qualification](../evidence/gallery/rom-host/conversation.json) and [public deployment acceptance](../evidence/gallery/rom-host/conversation-public-deployment.json).
The installed Studio archive SHA-256 is `39e9795d4770aec341a50c4eea7d9115e248798f66fc2916c110bc54fecb3305`.

The following baseline records the earlier static deployment and earlier qualification runs. It does not describe the current deployment.

# Historical integration baseline

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
| Resource reference editing | Installed Studio picker with authorized lookup in the local ROM-connected showcase | Public host scope separation and exact ID actions |
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
These previews retain exact values and rejected drafts.

## Local live connection evidence

The ROM connection showcase uses the installed `rom-studio/application`, client, authentication, forms, and recovery contracts.
Its Studio archive SHA-256 is `cb48a30b4c6fdfd3487ec1c525a8ca6fdf459578d7a06765065c24bfa32ce1af`.

The local ROM host serves the gallery assets and injects the trusted browser profile.
It uses persistent SQLite and synthetic OIDC accounts. These demo policies are not the public deployment policy.

Both Chromium and WebKit passed authentication, descriptor discovery, authorized reference selection, patch submission, and reload checks.
The selected reference label survives unrelated draft persistence. Sign-out removes the private form and reference label.
The tests also check exact decimal text and the absence of browser runtime errors.
Evidence: `/var/tmp/rom-gallery-reference-session.log` and `/var/tmp/rom-gallery-reference-session-results`.

Separate routed browser fixtures cover prepared and unknown mutation recovery with unchanged exact command bytes.
They do not establish real backend interruption recovery.

The full owner verifier passed before the reference identity correction: 78 unit tests, 2 headless tests, 140 consumer browser cases,
61 compiled snippets, and 108 gallery browser cases. Two local-host cases were skipped in the static gallery run.
Evidence: `/var/tmp/rom-ui-live-binding-full-verifier.log`.
The final correction passed the same full verifier, with the same test counts.
All 603 recorded source inputs remained unchanged during verification.
Evidence: `/var/tmp/rom-ui-reference-final-full-verifier.log` and `/var/tmp/rom-ui-reference-final-verifier-result.json`.

Public ROM hosting, visitor isolation, live activity and Flow/map projections remain incomplete.
