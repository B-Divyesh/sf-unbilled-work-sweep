# Adversarial first-read review 4 — PASS

Date: 2026-08-29  
Live URL: <https://unbilled-work-sweep.sociobot.in>

## Verdict

**PASS.** No blocking, high, medium, or minor finding remains. The product
answers the first-read questions, provides an isolated one-click sample,
proves each listed claim, and has no unlisted visitor-reliant claim in the
landing page or README. This is a PASS only because this review found zero
findings.

## Cold first read

Fresh Chromium contexts with empty storage were opened at 390 × 844 and
1440 × 900 before scrolling. The 390 px screen had no horizontal overflow.

- What it does: finds finished work that has not been billed.
- For whom: freelancers and tiny agencies whose work is spread across task,
  time, and invoice tools.
- First action: **Try it with sample data**. The adjacent copy says it opens a
  filled review in one click.

The exact first-screen text that establishes this is **“Find finished work you
have not billed”**, **“For freelancers and tiny agencies with work spread
across task, time, and invoice tools.”**, and **“Try it with sample data”**.
All three price/privacy/offline facts fit in the 1440 × 900 first screen; the
price fact ended at y=771.4 px.

## Findings

None.

## Demo, sandbox, and privacy check

One click from the live landing route opened `/?demo=1`. Its first 390 × 844
viewport already contained the persistent **“Demo — sample data, nothing is
saved”** banner, **Reset demo**, **Start for real**, the `$5,840.00` total, a
real work row, a possible invoice, and **Link invoice**. The first row began
at y=472.9 and the Link action was fully within the viewport.

The sample has six source work rows, four unbilled rows, two suggested
matches, and the stated total. Linking a match, resetting, and starting for
real behaved as follows:

| Check | Observed result |
|---|---|
| Demo storage | Only `sessionStorage['demo:unbilled-work-sweep']` held sample data. |
| Real storage during demo | Empty in the fresh context; the demo did not use IndexedDB or real local storage. |
| Reset demo | Restored four queue rows, two Link actions, and `$5,840.00`. |
| Start for real | Removed the `demo:` key and opened the empty real workspace. |
| Requests through entry, link, reset, and exit | Same origin only; no console or page error. |

This confirms the required sandbox separation for the real browser flow. The
clean-clone `@claim:demo-isolation`, `@claim:demo-session-removal`,
`@claim:local-only`, and `@claim:network-boundary` tests also passed.

## Claims and clean-clone checks

A fresh clone at `3027ef4` was installed with `npm ci`. Every one of the 33
commands named in `.factory/claims.json` was invoked separately, from that
clone, and passed. The registry has 33 unique IDs and every ID has its tagged
Playwright test. The complete suite also passed: **46/46 tests**. The
production build passed and produced `dist/index.html`.

The claim IDs verified were:

`csv-import`, `multi-source-import`, `demo-sample-ready`, `header-mapping`,
`queue-filter`, `missing-status`, `validated-import`, `review-matches`,
`work-replacement`, `invoice-replacement`, `csv-export`, `local-only`,
`network-boundary`, `offline-reload`, `manifest-mime`, `runtime-asset-cache`,
`local-persistence`, `workspace-backup`, `paid-license`,
`checkout-return-inactive-notice`, `daily-inactive-license-notice`,
`snapshot-history`, `hours-times-rate`, `invoice-date-guard`,
`match-normalization`, `demo-isolation`, `demo-session-removal`,
`clear-workspace`, `license-storage`, `free-core`, `billing-boundary`,
`scope-boundaries`, and `art-disclosure`.

The live request log for cold landing and the full sample flow contained only
the app origin. The only advertised off-origin boundary, checkout, returned
the expected `303` to the hosted Dodo checkout. No payment was attempted.

## Copy audit

Counts are whitespace-delimited words; hyphenated terms and prices count as
one. Repeated navigation/footer strings are listed once. All counts are at or
below 22. No banned marketing adjective, unexplained jargon, mood/metaphor
heading, inconsistent product term, or non-result-naming button was found.

### Landing page

| Copy | Words | Result |
|---|---:|---|
| Skip to main content | 4 | Pass |
| Unbilled Work Sweep | 3 | Pass |
| Demo | 1 | Pass |
| How it works | 3 | Pass |
| Privacy | 1 | Pass |
| Completed work to review before invoicing | 6 | Pass |
| Find finished work you have not billed | 7 | Pass |
| For freelancers and tiny agencies with work spread across task, time, and invoice tools. | 14 | Pass |
| Try it with sample data | 5 | Pass — result-naming action |
| See a filled review in one click. | 7 | Pass — `demo-sample-ready` |
| Or import your CSV files | 5 | Pass — result-naming action |
| Files stay in this browser. | 5 | Pass — `local-only` |
| Works offline after your first visit. | 6 | Pass — `offline-reload` |
| Imports and checklist exports are free. | 6 | Pass — `free-core` |
| Review history costs $19 once. | 5 | Pass — `billing-boundary` |
| Paper invoices form a moonlit landscape where coral envelopes flow toward a filing box. | 14 | Pass — useful image alt |
| Review completed work that may still need an invoice. | 9 | Pass |
| Your local workspace | 3 | Pass |
| Import work and invoice CSV files | 6 | Pass |
| Add one completed-work export from each tool. | 7 | Pass — `multi-source-import` |
| You choose whether a suggested invoice match counts as billed. | 10 | Pass — `review-matches` |
| Import CSV files | 3 | Pass |
| Completed work CSVs | 3 | Pass |
| Add one export from each task or time tool. | 9 | Pass — `multi-source-import` |
| Choose completed work CSV | 4 | Pass — result-naming action |
| Invoices CSV | 2 | Pass |
| Issued or draft invoices with client and project names. | 9 | Pass — `csv-import` |
| Choose invoices CSV | 3 | Pass — result-naming action |
| Your unbilled-work list will appear here | 6 | Pass |
| Import completed work first. | 4 | Pass |
| Add invoices to review possible matches. | 6 | Pass |
| Work columns: date, client, project, description, status, amount. | 8 | Pass |
| Hours and rate can replace amount. | 6 | Pass — `hours-times-rate` |
| Import a workspace backup | 4 | Pass — result-naming action |
| Three steps | 2 | Pass |
| How the review works | 4 | Pass |
| Import exports | 2 | Pass |
| Map the columns from your task, time, and invoice CSV files. | 11 | Pass |
| Review matches | 2 | Pass |
| Link an invoice or keep the completed work in your unbilled-work list. | 12 | Pass — `review-matches` |
| Export your checklist | 3 | Pass |
| Download the reviewed list as a CSV for your invoicing session. | 11 | Pass — `csv-export` |
| What this tool does not do | 6 | Pass |
| It does not send invoices | 5 | Pass — `scope-boundaries` |
| It does not track time, calculate tax, or change your source files. | 12 | Pass — `scope-boundaries` |
| It only helps you review exported records. | 7 | Pass — `scope-boundaries` |
| Saved review history | 3 | Pass |
| Save weekly review totals for a one-time $19 | 8 | Pass — `snapshot-history` |
| Name each weekly review and compare earlier list totals on this device. | 11 | Pass — `snapshot-history` |
| Buy review history — $19 | 4 | Pass — result-naming action |
| Checkout opens through Sociobot. | 4 | Pass — `billing-boundary` |
| One payment; no subscription. | 4 | Pass — `billing-boundary` |
| Have a license? Paste it here | 6 | Pass |
| Verify license | 2 | Pass — result-naming action |
| Buying means you accept the terms and privacy notice. | 9 | Pass |
| Find completed work that still needs an invoice. | 8 | Pass |
| Artwork disclosure: generated for this product. | 6 | Pass — `art-disclosure` |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |
| Version 1.0.0 · build 2026.08 | 4 | Pass |

### README

| Copy | Words | Result |
|---|---:|---|
| Unbilled Work Sweep | 3 | Pass |
| Find completed work that still needs an invoice. | 8 | Pass |
| Unbilled Work Sweep keeps a weekly invoice review in your browser for freelancers and tiny agencies. | 16 | Pass |
| It compares completed-work and invoice CSV exports, shows possible matches for review, and exports an invoice-draft checklist. | 17 | Pass — `csv-import`, `review-matches`, `csv-export` |
| It is not a time tracker, invoicing system, or tax tool. | 11 | Pass — `scope-boundaries` |
| Live site | 2 | Pass |
| One-click demo | 2 | Pass |
| What it does | 3 | Pass |
| Combines completed-work CSV exports from multiple task or time tools and labels each source. | 14 | Pass — `multi-source-import` |
| Imports invoice CSV exports for comparison. | 6 | Pass — `csv-import` |
| Suggests invoice matches using client and project names. | 8 | Pass — `match-normalization` |
| A suggestion changes nothing until you review it, and every link can be reversed. | 14 | Pass — `review-matches` |
| Lists completed rows that are not marked billed or linked to an invoice. | 13 | Pass — `queue-filter` |
| Exports the current unbilled-work list as a CSV checklist. | 9 | Pass — `csv-export` |
| Keeps real workspace data in IndexedDB on the device. | 9 | Pass — `local-persistence` |
| Works offline after the first successful visit. | 7 | Pass — `offline-reload` |
| Imports, review, workspace backup, and checklist export are free. | 9 | Pass — `free-core` |
| A $19 one-time license adds review history with named weekly totals. | 11 | Pass — `snapshot-history` |
| Checkout and license verification use the Sociobot billing API; there is no embedded payment provider. | 15 | Pass — `billing-boundary`, `paid-license` |
| CSV fields | 2 | Pass |
| The importer asks you to map columns before it stores rows. | 11 | Pass — `header-mapping` |
| Header names do not need to match these names exactly. | 10 | Pass — `header-mapping` |
| Rows with blank required cells, non-numeric amounts, or overflowing hours × rate calculations are rejected with their CSV row numbers. | 19 | Pass — `validated-import` |
| Saved data remains unchanged so you can fix the file and try again. | 13 | Pass — `validated-import` |
| Dates may use YYYY-MM-DD or M/D/YYYY. | 6 | Pass — `invoice-date-guard` |
| Impossible dates and other formats are rejected before storage. | 9 | Pass — `invoice-date-guard` |
| Completed-work CSV | 2 | Pass |
| Required: date, client, project, description | 5 | Pass |
| Optional: status, amount, hours, rate, already billed | 7 | Pass |
| If amount is missing, the importer multiplies hours by rate. | 10 | Pass — `hours-times-rate` |
| If status is missing, the row is treated as completed. | 10 | Pass — `missing-status` |
| Use Add another export for each task or time tool. | 10 | Pass — `multi-source-import` |
| Exact duplicate rows are skipped. | 5 | Pass — `multi-source-import` |
| Each row keeps its source filename. | 6 | Pass — `multi-source-import` |
| Use Replace this source to update one export after confirming; other sources stay in the review. | 15 | Pass — `multi-source-import` |
| Invoice CSV | 2 | Pass |
| Required: invoice date, invoice number, client | 6 | Pass |
| Optional: project, status | 3 | Pass |
| Suggestions ignore capitalization, punctuation, and spacing when comparing client and project names. | 12 | Pass — `match-normalization` |
| A different project is not suggested. | 6 | Pass — `match-normalization` |
| Invoice dates before work dates are not suggested. | 8 | Pass — `invoice-date-guard` |
| Every match remains a review choice, and linked matches can be returned to the list. | 15 | Pass — `review-matches` |
| Replacing the invoice CSV clears links to invoices that are no longer present, returning that work to the list. | 19 | Pass — `invoice-replacement` |
| Replacing one completed-work source keeps review decisions only for unchanged rows. | 11 | Pass — `work-replacement` |
| Changed work returns to the list for review. | 8 | Pass — `work-replacement` |
| Run locally | 2 | Pass |
| Requires Node.js 20 or later. | 5 | Pass |
| npm install | 2 | Pass |
| npm run dev | 3 | Pass |
| Open http://localhost:5173. | 2 | Pass |
| Use http://localhost:5173/?demo=1 for the isolated sample. | 5 | Pass |
| Test and build | 3 | Pass |
| Playwright 1.58.2 is pinned because the factory image includes those browsers. | 11 | Pass |
| npm test | 2 | Pass |
| npm run build | 3 | Pass |
| The exact production build command is npm run build. | 9 | Pass |
| Static output lands in dist/, with dist/index.html at its root. | 10 | Pass |
| Run one public claim test with: | 6 | Pass |
| npm test -- --grep @claim:offline-reload | 4 | Pass |
| All claim definitions are in .factory/claims.json. | 6 | Pass |
| Demo details are in .factory/demo.md. | 5 | Pass |
| Privacy and data ownership | 4 | Pass |
| Real imports use IndexedDB. | 4 | Pass — `local-persistence` |
| Demo actions use the separate demo:unbilled-work-sweep session-storage key. | 8 | Pass — `demo-isolation` |
| CSV and demo actions make no off-origin requests. | 8 | Pass — `network-boundary` |
| Buying or verifying a license contacts api.sociobot.in. | 7 | Pass — `network-boundary` |
| Use Export workspace for a JSON backup. | 7 | Pass — `workspace-backup` |
| Use Clear imported data to remove the active workspace. | 9 | Pass — `clear-workspace` |
| The on-site privacy notice and terms are available as real routes. | 11 | Pass — route check |
| Deploy | 1 | Pass |
| Deploy the contents of dist/ to a static host. | 9 | Pass |
| staticwebapp.config.json supplies SPA fallback, security headers, cache rules, and the 404 rewrite. | 10 | Pass — deployment configuration inspected |
| The service worker precaches the app shell. | 7 | Pass — `offline-reload` |
| Project notes | 2 | Pass |
| Visual thesis | 2 | Pass |
| Demo contract | 2 | Pass |
| Handoff | 1 | Pass |
| MIT License | 2 | Pass |

## Earlier finding recheck

Every earlier review, polish record, and the previous handoff was read. The
findings were rechecked on both the deployed page and current code/tests, not
accepted merely because a prior report marked them fixed.

| Earlier finding(s) | Current confirmation | Result |
|---|---|---|
| F-1-1 and F-1-2: incomplete/metaphorical static 404 | Live `/404.html` has skip link, header, footer/legal links, route metadata, literal `404 error` / `Page not found` / `Return home`, and zero Axe violations. | Fixed |
| F-1-3 and F-2-5: jargon, mood headings, paid-term inconsistency | Current landing/README inventory above uses literal headings and one paid term, `review history`; old phrases are absent. | Fixed |
| F-1-4, F-1-5, F-2-3: missing or weak claim coverage | 33 registered, separately passing behavioral claim tests cover the previously omitted queue, matching, replacement, demo, network, and invoice-mapping behavior. | Fixed |
| F-2-1 and F-2-4: demo below phone fold / price clipped | The live 390 px bounds and 1440 px fact bounds recorded above are inside the required viewports. | Fixed |
| F-2-2: manifest MIME | Live `/manifest.webmanifest` returns `200 application/json`; its claim test passes. | Fixed |
| F-3-1: second completed-work source replaced the first | `Add another export`, source labels, deduplication, source-specific replacement, and the `multi-source-import` claim are present. | Fixed |
| F-3-2: scope claim asserted copy instead of behavior | The `scope-boundaries` test now hashes source input, observes requests, and rejects send/tax/time behavior. | Fixed |
| F-3-3: vague demo paid button | The current button is `View review history options`; checkout is separately `Buy review history — $19`. | Fixed |
| Earlier verification regressions: offline shell, false update notice, malformed backup, small touch controls, missing unlink, checkout 404, file-focus loss, invalid CSV, stale links, date guard, license notices | The 46-test suite contains regressions for each; live normal/demo routes showed no console error. | Fixed |

## Structure, navigation, and identity

Live `/`, `/demo`, `/privacy`, `/terms`, an SPA missing route, and `/404.html`
were checked. Each has `lang=en`, one h1, one main landmark, an appropriate
route title, description, canonical, OG/Twitter metadata, favicon, skip link,
and consistent legal navigation. Axe found zero violations on all six.

All discovered links returned `200`, except the intentional checkout `303` and
explicit `mailto:` links. Back navigation restored the landing route and,
after its asynchronous route update, moved focus to its h1. SPA navigation to
Demo immediately focused the demo h1. The live responses include CSP,
`frame-ancestors 'none'` as a response header, HSTS, `nosniff`, referrer
policy, and permissions policy. `robots.txt`, `sitemap.xml`, and the manifest
all returned `200`; the manifest had `application/json` content type.

The live art and interface match the recorded midnight-paperwork-garden
direction: offset editorial composition, cream/ink/coral palette, paper-panel
shapes, serif display text, and original moonlit invoice artwork. It is not a
generic centered-gradient SaaS page.

## Missed leverage

No finding. The brief implies a local CSV import/review/checklist loop; the
product includes multiple-source import, source replacement, CSV checklist
export, and full workspace backup. Deterministic, reviewable matching is more
appropriate than an AI feature that would send invoice-related data elsewhere.
No runtime provider key, decorative AI feature, or embedded provider key was
found.

## What would make this perfect

Nothing identified in this round. Preserve the one-click demo isolation,
claim-to-test inventory, and literal first-screen copy when making future
changes.
