# Gallery review and corrections

Reviewer: fresh read-only agent, range a596253..eca50af.
No Critical findings. Two Important findings were reproduced in a browser.

- A pending inline composer could be bypassed by opening the second panel composer.
  The gallery now transports one mounted editor with the public preserve-editor helper.
  Its pending and error state belong to that instance.
- An empty Flow graph could leave an upstream fit request queued for later replacement nodes.
  FlowFit now waits for initialized nodes and viewport before handing off a fit.
  It checks ownership and readiness again inside the final frame.

Both regressions failed before correction.
The empty-graph deactivate/unmount tests pass in both engines: 4 tests.
The complete affected gallery suite passes in both engines: 30 tests.
Logs: flow-review-green.log and gallery-review-green.log.

The review also found a skip link that changed the demo route and offscreen mobile navigation in the tab sequence.
These affect keyboard navigation, so both were corrected with failing regressions followed by passing tests.

The reviewer did not judge public deployment, host migrations or authentic OS IME sequences.
Those remain separate verification requirements. Synthetic events cover the declared form guards only.
A new user requirement adds mapcn-svelte maps before final integration and deployment.
