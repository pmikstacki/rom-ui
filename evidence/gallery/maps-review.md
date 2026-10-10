# Maps review

Review date: 2026-10-09. Scope: new maps source against e94556b and its installed gallery.
The independent read-only reviewer found no Critical issues and two Important issues.

A controlled viewport change during native movement was lost.
The map now observes moveend and reconciles the latest host viewport.
An arc mounted without interaction had no hit layer after interaction was enabled.
The hit layer now follows the runtime interaction prop separately from the rendered source.

Both failures reproduced in Chromium and WebKit against the installed archive.
The regression suite then passed four cases after the fixes.
A separate URL regression reproduced a stale GeoJSON dataset in both engines.
The source now updates string URLs through setData. The combined suite passed six cases.
The unused blank prop and its obsolete Carto documentation were removed before the first maps release.

The gallery map suite passed eight Chromium/WebKit cases, including actual rendered cluster features.
The suspected missing-glyph error did not reproduce with MapLibre 6.7.0. No glyph workaround was introduced.
A missing favicon was added to the gallery.

Review limitations: source review and log inspection are separate from the parent's browser execution.
The synthetic fixtures do not establish external provider policy, production authorization, durable writes or authentic OS IME behavior.
Deployment and host migration require separate evidence.
