# Polish round 2

Candidate `54bb07c` was repaired against adversarial review commit `6373369`.
Final product commit: `3d19272e670bee5def8acf57f717006f7617512a`.
Final deployment: `b5ec8028-f6e6-4df6-a906-ab40e43cf535`.

## Review 2 findings

| Finding | Change made | Evidence |
|---|---|---|
| F-2-1 | The demo now puts the populated unbilled-work list before import controls. Its phone treatment keeps the sample heading, `$5,840.00` total, first work row, suggested invoice, and both review actions inside 390 × 844. Reset restores the original state. | `@claim:demo-sample-ready opens a complete actionable sample in one click`; `.factory/evidence/polish-2-live-demo-390.png`; cold live checks at <https://unbilled-work-sweep.sociobot.in/demo?cold=polish-2-shot> and <https://unbilled-work-sweep.sociobot.in/?demo=1&cold=polish-2>. |
| F-2-2 | `/manifest.webmanifest` now rewrites to an identical `manifest.json` asset. This avoids Azure's `.webmanifest` octet-stream override and produces a standards-compatible JSON response. | `@claim:manifest-mime serves the web app manifest with a manifest JSON content type`; live `HEAD /manifest.webmanifest?cold=polish-2-json` returned `200` and `Content-Type: application/json`; the live body matched `public/manifest.json`. |
| F-2-3 · sample promise | Registered the complete one-click sample composition, viewport, isolation, reset, and action behavior. | `@claim:demo-sample-ready`; live screenshot `.factory/evidence/polish-2-live-demo-390.png`. |
| F-2-3 · demo banner | Replaced the unrestricted “Try every…” sentence with `Link or keep a suggested match, then export the list.` | `@claim:review-matches`, `@claim:csv-export`, and `@claim:demo-sample-ready`; live demo URL above. |
| F-2-3 · work replacement | Registered replacement behavior and added a two-row fixture proving unchanged review decisions remain while changed work returns to review. | `@claim:work-replacement keeps unchanged reviews and clears changed work reviews`. |
| F-2-3 · network boundary | Rewrote README and privacy copy to name the exact boundary. Added a request-log test covering import, demo review, verification, and checkout. | `@claim:network-boundary contacts Sociobot only for explicit license actions`; final cold live flow logged zero off-origin requests before license actions. |
| F-2-4 | Reduced desktop hero height and headline scale while preserving the offset editorial layout. All three facts now fit at both required viewport sizes. | `all three first-screen facts fit at phone and desktop review sizes`; `.factory/evidence/polish-2-live-landing-1440.png`. |
| F-2-5 | Standardized all visitor-facing paid-feature wording on `review history`. Replaced “normalized” with the exact ignored differences: capitalization, punctuation, and spacing. | `@claim:snapshot-history`, `@claim:paid-license`, `@claim:billing-boundary`, `@claim:match-normalization`; `.factory/copy-audit.md`; live landing URL. |

## Review 1 findings rechecked

| Finding | Current change/evidence |
|---|---|
| F-1-1 | The complete static 404 remains intact. `the static 404 fallback has the product skeleton, literal copy, and route metadata` passes; live <https://unbilled-work-sweep.sociobot.in/404.html?cold=polish-2>. |
| F-1-2 | SPA and static fallbacks still use `404 error`, `Page not found`, and `Return home`. Covered by the route and static-404 tests and the live URLs above. |
| F-1-3 | The round-1 plain wording remains, and round 2 removed the remaining paid-feature and matching jargon. `.factory/copy-audit.md` has no banned term or sentence over 22 words. |
| F-1-4 | The prior missing claims remain registered. Round 2 expands the registry to 30 unique entries with 30 unique test tags and no unregistered tags. All 30 commands passed independently in the final clean clone. |
| F-1-5 | The completed-work and invoice unrelated-header fixtures remain in the one `@claim:header-mapping` test, which passed independently. |

## Earlier cumulative regression findings named by review 1

| Earlier finding | Evidence on the final commit |
|---|---|
| Offline shell and runtime caching | `@claim:offline-reload` and `@claim:runtime-asset-cache`; final live demo also reloaded offline with `$5,840.00`. |
| False update notice | `the update action targets only the waiting worker` and `the update notice stays hidden when the controlled page has no waiting worker`. |
| Malformed backup recovery | `a malformed workspace backup is rejected without replacing or bricking the saved workspace` and nested-record validation. |
| Artwork provenance | `@claim:art-disclosure`; provenance remains in `.factory/design.md`. |
| Demo heading order, touch targets, and unlink | `demo heading order and persistent controls meet the accessibility contract` and `@claim:review-matches`. |
| Checkout availability | `@claim:paid-license`, `@claim:billing-boundary`; live checkout returned `303` to hosted checkout. |
| File focus, invalid CSV, and stale links | `keyboard focus is visibly transferred to all three file chooser labels at 390px`, `@claim:validated-import`, and `@claim:invoice-replacement`. |
| Calendar dates and invoice ordering | `@claim:invoice-date-guard`. |
| Route titles, focus, legal links, and 404 | `routes, keyboard landmarks, and serious accessibility issues pass`; final live cold route/Axe sweep covered `/privacy`, `/terms`, a missing SPA route, and `/404.html`. |

## Final evidence

- Final clean clone: `/tmp/unbilled-work-sweep-polish2-final.4aPrBB`, commit `3d19272e670bee5def8acf57f717006f7617512a`.
- Registered claims: 30/30 commands passed independently.
- Full suite: 43/43 passed.
- Production build: JS 35.77 KB / 12.48 KB gzip; CSS 17.05 KB / 4.45 KB gzip.
- Live worker verifier: no console errors; one h1; `lang=en`; main landmark; no missing alt text or unlabeled buttons. Evidence: `.factory/evidence/polish-2-live-verify/`.
- Live Axe: zero serious or critical violations across demo, privacy, terms, SPA 404, and static 404.
- Live Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.1 s, CLS 0, total blocking time 0 ms. Evidence: `.factory/evidence/polish-2-lighthouse-live.json`.
- No finding remains open.
