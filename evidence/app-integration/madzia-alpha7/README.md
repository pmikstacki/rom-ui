# Madzia installed shared controls

Madzia now consumes the released `rom-ui@0.1.0-alpha.7` archive through a frozen pnpm lockfile.
GraphFit and ChoiceNode delegate to installed FlowFit and FlowChoiceNode.
Controls and sidebar facades preserve existing application imports.
Host CSS retains the application appearance. Flow fitting now uses the shared smooth transition.
The frontend container stage uses frozen pnpm installation.

The migration removed 85 unused generic source files and the npm lockfile.
The original frontend remains in `/var/tmp/rom-ui-madzia-alpha7-before.tar.gz`.
The original Dockerfile remains in `/var/tmp/rom-ui-madzia-alpha7/Dockerfile-before`.
Owned-file hashes were checked before integration. They showed no concurrent changes.

Fifteen production-mode application suites passed in Chromium against isolated local backend fixtures.
WebKit passed desktop and mobile journey, persistent-graph and sidebar-appearance suites.
The separate test-mode build passed its environment suite.
The pnpm frontend container build passed. Source review found no material defects.

The root application passed frozen installation, Svelte diagnostics and production build.
Its generated outputs match the tested candidate byte for byte.
Direct controls and Studio facades resolve one installed ROM UI implementation.
All 249 installed source files match the selected ROM UI owner.

The initial harness lacked a fixture credential file and used a production build for a test-mode assertion.
The final runs use authored credentials and separate build modes. These were harness failures, not product fixes.
Some existing application tests regenerated their standard local screenshots before output paths were redirected to the candidate directory.

This evidence covers the local application migration. It does not establish a new public application deployment.
It does not complete Astral migration, ROM-backed gallery sessions or the ROM-extras map-provider integration.
