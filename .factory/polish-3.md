# Polish round 3

Date: 2026-08-29

Release commit: `051b87d9cfa4529a2efb5f3d6580cb386f024cd8`

Live URL: <https://unbilled-work-sweep.sociobot.in>

Every finding in reviews 1–3 was rechecked. The final remote commit passed all
31 registered claim commands separately, the complete 44-test suite, the build,
and the cold production checks below.

## Review 3 findings

| Finding | Change made | Evidence |
|---|---|---|
| F-3-1 | Completed-work imports are now named sources. **Add another export** merges task/time exports; each row shows its filename; exact duplicates are skipped. **Replace this source** changes only the selected source after confirmation. Stable source-aware row IDs keep unchanged decisions through reordered replacements. Old single-source IndexedDB and backup data migrates without being dropped. | `@claim:multi-source-import combines labelled exports, skips duplicates, and replaces one source after confirmation`; `@claim:work-replacement keeps unchanged reviews and clears changed work reviews`; live browser report `.factory/evidence/polish-3-live-browser.json`; live screenshot `.factory/evidence/polish-3-live-multi-source-390.png`; <https://unbilled-work-sweep.sociobot.in/?cold=polish-3-final>. |
| F-3-2 | The scope test now creates temporary work/invoice files, hashes the work source before and after the complete flow, records every request through import, match review, checklist export, and workspace export, rejects send/tax/time endpoints or off-origin traffic, and inspects every interactive action name. | `@claim:scope-boundaries keeps the sweep as a review and export tool`; 31/31 clean-clone claim run; live report records unchanged source hash and zero off-origin requests. |
| F-3-3 | Renamed **Review history · paid** to **View review history options**. It still moves to the paid explanation; only the checkout link says **Buy review history — $19**. | `@claim:free-core keeps imports, review, and checklist export available without a license`; live query-demo screenshot `.factory/evidence/polish-3-live-demo-query-390.png`. |

## Review 2 findings rechecked

| Finding | Change retained or extended | Evidence |
|---|---|---|
| F-2-1 | The query demo opens directly on the populated list. The total, first row, suggestion, and action remain within 390 × 844. | `@claim:demo-sample-ready`; `.factory/evidence/polish-3-live-demo-query-390.png`; live `/?demo=1`. |
| F-2-2 | The manifest rewrite still serves standards-compatible JSON. | `@claim:manifest-mime`; final live `HEAD /manifest.webmanifest` returned `200 application/json`. |
| F-2-3 | `demo-sample-ready`, `work-replacement`, and `network-boundary` remain registered and behavioral. The query demo test now also changes and resets the sample without touching real storage. | Those three claim commands passed separately in the final clean clone; live browser and offline reports show zero off-origin requests. |
| F-2-4 | All three first-screen facts still fit at 390 × 844 and 1440 × 900. | `all three first-screen facts fit at phone and desktop review sizes`; URL verifier screenshots in `.factory/evidence/polish-3-live-verify/`. |
| F-2-5 | Visitor copy consistently uses **review history** and describes ignored matching differences directly. | `.factory/copy-audit.md`; `@claim:snapshot-history`; `@claim:match-normalization`; live landing check. |

## Review 1 findings rechecked

| Finding | Change retained | Evidence |
|---|---|---|
| F-1-1 | The static 404 remains a complete product page with skip link, header/nav, metadata, canonical, product art, footer, and legal links. | `the static 404 fallback has the product skeleton, literal copy, and route metadata`; live <https://unbilled-work-sweep.sociobot.in/404.html?cold=polish-3-final>; live Axe: zero violations. |
| F-1-2 | SPA and static fallbacks still say **404 error**, **Page not found**, and **Return home**. | Route/static-404 tests; live `/missing-polish-3` and `/404.html`. |
| F-1-3 | Literal first-screen, workspace, boundary, paid, and README wording remains. Round 3 also corrected singular import feedback. | `.factory/copy-audit.md`; `1 work row imported` appears in the final live browser report. |
| F-1-4 | All previously missing behavior claims remain registered and tested: queue filtering, snapshot history, matching differences, and runtime asset caching; the untestable payment-record sentence remains absent. | `@claim:queue-filter`, `@claim:snapshot-history`, `@claim:match-normalization`, `@claim:runtime-asset-cache`, and `@claim:license-storage`; all passed separately. |
| F-1-5 | One header-mapping test still maps unrelated completed-work and invoice headers and confirms the suggestion. | `@claim:header-mapping imports manually mapped columns with unrelated header names`. |

## Earlier cumulative regressions rechecked

| Earlier finding | Final evidence |
|---|---|
| App shell was not precached and offline reload failed | `@claim:offline-reload`, `@claim:runtime-asset-cache`, and `.factory/evidence/polish-3-live-offline.json` passed with no failed request. |
| False or inoperable update notice | `the update action targets only the waiting worker` and `the update notice stays hidden when the controlled page has no waiting worker` passed. |
| Malformed JSON could replace or brick the workspace | Malformed-backup and nested validation tests passed; legacy single-source data migration is also covered. |
| Generated-art disclosure lacked a claim | `@claim:art-disclosure` passed and the footer disclosure remains live. |
| Demo heading order, small banner targets, and missing unlink | Demo accessibility and route tests passed; `@claim:review-matches` links, reloads, keyboard-unlinks, and restores the total. |
| Checkout returned 404 | `@claim:paid-license`, `@claim:billing-boundary`, and the live checkout boundary remain valid. |
| Hidden file focus, invalid CSV acceptance, and stale links | File-label focus, `@claim:validated-import`, `@claim:work-replacement`, and `@claim:invoice-replacement` passed. |
| Invoice-before-work matching and claim-registry gaps | `@claim:invoice-date-guard` passed; `.factory/claims.json` has 31 unique IDs with one matching tagged test each. |
| 404 metaphor and incomplete recovery copy | Both 404 paths use literal error and recovery wording; route and static fallback tests passed. |

## Final evidence

- Fresh remote clone: `/tmp/unbilled-work-sweep-final.mWVLfA`, SHA
  `051b87d9cfa4529a2efb5f3d6580cb386f024cd8`.
- Registered claims: **31/31 commands passed separately**.
- Full suite: **44/44 passed**.
- Build: passed; `dist/index.html` exists; JS **13.64 KB gzip**, CSS
  **4.58 KB gzip**.
- Local Lighthouse: performance/accessibility/best-practices/SEO
  **100/100/100/100**, LCP **1.5 s**, CLS **0**, TBT **0 ms**.
- Live Lighthouse: **100/100/100/100**, LCP **1.2 s**, CLS **0**, TBT
  **0 ms** (`.factory/evidence/polish-3-lighthouse-live.json`).
- Live Axe: zero violations on `/`, `/?demo=1`, `/privacy`, `/terms`, the SPA
  404, and `/404.html` (`.factory/evidence/polish-3-live-axe.json`).
- Live URL verifier: no console errors; title, `lang=en`, one h1/main, alt text,
  and button labels present (`.factory/evidence/polish-3-live-verify/`).
- Live HTML, JS, CSS, service worker, static 404, and manifest SHA-256 values
  matched the deployed build.
- Deployment `93c14fc5-4780-4b7f-a170-1122e12e6230` completed successfully.

No review finding or observed defect remains unresolved.
