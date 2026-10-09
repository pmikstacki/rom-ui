# Alpha.5 review

Scope: English gallery, public usage examples, geographic basemap and the new Flex entry after 5c515b6.
The independent read-only review found no Critical issues and two Important issues.

NativeSelectOption and NativeSelectOptGroup were missing from the usage catalog.
Both now have import/state/markup examples, a live grouped-select demonstration and browser coverage.
The catalog contains 38 examples. The permanent verifier compiles and type-checks each against the installed archive.

The first unavailable geographic style prevented the schematic recovery path.
Both browser engines reproduced this failure. Map now permits an explicit style replacement before the first style loads.
The failure regression passed in Chromium and WebKit after this change.

A separate regression reproduced mismatched initial map/gallery themes when the operating system preferred dark mode.
The gallery now declares its light theme during initialization, as it already did during manual theme changes.
Final full-suite results provide the green evidence for this change.

The reviewer independently ran twelve Flex unit cases and checked the generated snippets with zero errors/warnings.
A pre-fix gallery run passed 68 browser cases. These results do not substitute for the final full verifier or public deployment.
The initial full verifier stopped when WebKit closed its context during an unchanged details test.
Three isolated repetitions of both affected details scenarios passed six cases. The complete verifier was rerun.

ROM-extras map-provider integration remains pending in its separate active task. Its concrete source/browser adapter is not yet available.
Human usability, external service availability guarantees and real application authorization are not established by synthetic gallery tests.
