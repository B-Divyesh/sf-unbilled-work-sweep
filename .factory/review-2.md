# Adversarial first-read review 2 — FAIL

Date: 2026-08-29  
Live URL checked: <https://unbilled-work-sweep.sociobot.in>  
Candidate reviewed: `d3c13bcf8c1f3ebd0dac4dfb6ca319bb3f1e2b0c`

## Verdict

**FAIL.** Five findings remain. Two are blocking: the phone demo does not show
an actionable sample review in its first screen, and the manifest still has the
wrong live MIME type recorded by the prior handoff. All 26 registered claim
commands pass, but four live/README promises remain outside the claim registry.
A PASS requires zero findings and no untested claim.

## Cold first read

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900 with empty
storage. Before scrolling, I could answer all three questions:

- What it does: it finds completed work that may not have been invoiced.
- For whom: freelancers and tiny agencies using separate task, time, and
  invoice tools.
- First click: **Try it with sample data**; the adjacent text promises **See a
  filled review in one click.**

The exact first-screen copy that supplied those answers was **Find finished
work you have not billed**, **For freelancers and tiny agencies with work
spread across task, time, and invoice tools**, and **Try it with sample data**.
The first-read comprehension gate passes. The 390 px page had no horizontal
overflow and showed the action before scrolling. Finding F-2-4 records the
desktop clipping of the third mandatory fact.

## Findings

### F-2-1 — BLOCKING — the phone demo opens above the actual sample review

Location: live landing action **Try it with sample data** and live `/demo` at
390 × 844; source `src/main.ts:43-44`, `src/main.ts:112-116`, and
`src/main.ts:127-129`.

Exact promise: **See a filled review in one click.**

After one click, the first phone viewport shows the demo banner, a second hero,
**6 rows imported**, and the top of **Invoices CSV**. It shows no client, work
description, possible invoice, list total, Link invoice action, or export
action. The `.queue` starts at y = 1,054 px, below the 844 px viewport. A first
visitor therefore sees another introduction/import screen rather than the
product being used with realistic sample data. This fails the mandatory demo
gate even though the populated review is present farther down the page.

Fix: make `/demo` start with the populated queue directly below the persistent
banner. In the first 390 × 844 viewport, show at least one real sample row, its
possible invoice, the `$5,840.00` total, and a review action. Move or collapse
the demo heading and imported-file cards. Add a registered demo claim whose
test clicks the landing action once and asserts those elements' bounding boxes
are inside the initial phone viewport.

### F-2-2 — BLOCKING — the prior manifest MIME finding remains live

Location: live `/manifest.webmanifest`; source
`public/staticwebapp.config.json:15-18`.

Exact response header: **Content-Type: application/octet-stream**.

The previous handoff explicitly recorded this as its remaining finding. The
review instructions require any earlier unfixed finding to return as blocking.
Chromium currently parses the file, but `application/octet-stream` does not
identify a web app manifest and can break installability in stricter clients.
The deployment config has cache routes for assets and the service worker, but
no manifest content-type override.

Fix: serve `/manifest.webmanifest` as `application/manifest+json` (or a
standards-compatible JSON MIME type), then add a live response-header test that
fails on `application/octet-stream`.

### F-2-3 — HIGH — four visitor-reliant promises are not registered claims

`.factory/claims.json` has 26 entries, but none registers the following exact
observable behavior:

| Location and exact quote | Why it is unlisted | Concrete fix |
|---|---|---|
| Landing: **See a filled review in one click.** Demo: **This sample has 6 work rows and 2 possible invoice matches.** | No claim asserts one-click entry, sample composition, or first-viewport readiness. The untagged demo layout checks do not cover this promise, and F-2-1 shows the viewport part fails. | Add one `demo-sample-ready` claim/test after fixing F-2-1. Assert one click, six work rows, two suggestions, four visible review rows, `$5,840.00`, banner, and an actionable sample row in the initial phone viewport. |
| Demo banner: **Try every review and export step.** | No single registered claim defines or exercises “every” step. Existing tests cover selected link/unlink and export paths, not this unrestricted statement. | Rewrite to the concrete instruction `Link or keep a suggested match, then export the list.` and map it to scoped tests, or add a claim that enumerates and tests every promised action. |
| README line 42: **Replacing completed-work CSV keeps review decisions only for unchanged rows. Changed work returns to the list for review.** | `review-matches` proves that one changed row is cleared, but its registered claim does not promise replacement behavior and the test does not assert that an unchanged row retains its decision. | Add `work-replacement` with changed and unchanged fixtures, or remove/narrow both sentences. |
| README line 76: **A request goes to api.sociobot.in only when a user adds or verifies a paid license.** | `local-only` covers CSV/demo actions, while paid tests cover checkout and mocked verification. No entry tests this complete network boundary, and clicking Buy also navigates to the API for checkout. | Rewrite to `CSV and demo actions make no off-origin requests. Buying or verifying a license contacts api.sociobot.in.` Add one request-log claim that covers imports, demo actions, checkout navigation, and verification. |

Fix the registry and tests or remove the promises. Passing adjacent tests is not
a substitute for listing the claim a visitor reads.

### F-2-4 — MEDIUM — the desktop first screen clips the price fact

Location: live `/` at 1440 × 900; source `src/main.ts:61` and hero sizing in
`src/styles.css`.

Exact text: **Free sweep; $19 one-time saved review tools.** Its box begins at
y = 892 px and ends at y = 916 px, so the 900 px viewport cuts it off. The
mandatory first-screen shape requires all three privacy/offline/price facts;
the price is the one fact a visitor should not have to discover by scrolling.

Fix: reduce the desktop headline size or hero vertical spacing so all three
facts fit at 1440 × 900. Add a viewport assertion for the bottom edge of every
hero fact at both required sizes.

### F-2-5 — MEDIUM — the paid feature has five names, and README uses matching jargon

Locations: live paid section and hero; `src/main.ts:61`, `src/main.ts:73-74`;
README lines 20 and 40.

Exact terms for one feature are **saved review tools**, **Paid saved reviews**,
**repeat reviews**, **weekly snapshots**, and **named reviews**. **Free sweep**
also asks the reader to interpret the product name as a feature. The README
sentence **Suggestions compare normalized client and project names** uses
“normalized” without saying which differences are ignored. These are short,
but they are not plain or consistent on first read. The button **Buy saved
review tools** names a vague bundle rather than the result.

Fix: use one term, such as **review history**, throughout. Proposed copy:

- Hero fact: `Imports and checklist exports are free. Review history costs $19 once.`
- Section label: `Saved review history`
- Heading: `Save weekly review totals for a one-time $19`
- Body: `Name each weekly review and compare earlier list totals on this device.`
- Button: `Buy review history — $19`
- README: `Suggestions ignore capitalization, punctuation, and spacing when comparing client and project names.`

## Demo, sandbox, privacy, and offline evidence

The populated demo itself works once scrolled into view. It contains six work
rows, two suggestions, four unbilled rows, and `$5,840.00`. Linking the first
suggestion changed the total to `$3,640.00`; **Reset demo** restored
`$5,840.00` and removed the decision.

In a fresh context, I first imported a distinct real row worth `$125`, entered
the demo, reviewed sample work, and selected **Start for real**. The real row
remained in IndexedDB, all `demo:` session keys were removed, and no sample row
appeared in the real workspace. Demo work used only
`sessionStorage['demo:unbilled-work-sweep']`; license/local storage stayed
empty. A live request log covering landing, demo entry, review, reset, and exit
contained only same-origin requests.

After the service worker controlled a fresh live `/demo` page, disabling the
HTTP cache and network and reloading still showed the banner and `$5,840.00`.
The offline request log contained only same-origin app-shell requests and no
failed request.

## Registered claim results

A clean local clone at candidate commit `d3c13bc` received `npm ci`. Every
command from `.factory/claims.json` was then run separately, not as one filtered
suite.

| Claim id | Result |
|---|---|
| `csv-import` | PASS |
| `header-mapping` | PASS |
| `queue-filter` | PASS |
| `missing-status` | PASS |
| `validated-import` | PASS |
| `review-matches` | PASS |
| `invoice-replacement` | PASS |
| `csv-export` | PASS |
| `local-only` | PASS |
| `offline-reload` | PASS |
| `runtime-asset-cache` | PASS |
| `local-persistence` | PASS |
| `workspace-backup` | PASS |
| `paid-license` | PASS |
| `snapshot-history` | PASS |
| `hours-times-rate` | PASS |
| `invoice-date-guard` | PASS |
| `match-normalization` | PASS |
| `demo-isolation` | PASS |
| `demo-session-removal` | PASS |
| `clear-workspace` | PASS |
| `license-storage` | PASS |
| `free-core` | PASS |
| `billing-boundary` | PASS |
| `scope-boundaries` | PASS |
| `art-disclosure` | PASS |

The clean clone also passed `npm test` (38/38) and `npm run build`, which
produced `dist/index.html`. The built JavaScript was 12,334 bytes gzip and CSS
was 4,257 bytes gzip. F-2-3 remains because the claim registry is incomplete,
not because a listed claim test failed.

## Earlier finding recheck

Each finding in `.factory/review-1.md`, the claimed repair in
`.factory/polish-1.md`, and the remaining note in the prior handoff was checked
against both live behavior and current source/tests.

| Earlier finding | Live and code evidence | Result |
|---|---|---|
| F-1-1: incomplete static 404 | Live `/404.html` has the product header, nav, skip link, one h1, metadata, legal footer links, and zero Axe/console errors; `public/404.html` matches. | Fixed |
| F-1-2: metaphor 404 copy | Live SPA and static 404 say **404 error**, **Page not found**, and **Return home**; the old “invoice stack” and “misfiled page” text is absent from source. | Fixed |
| F-1-3: jargon and mood headings | Every quoted term was replaced live and in `src/main.ts`/README. New paid-feature terminology problems are separately recorded as F-2-5. | Fixed |
| F-1-4: five missing claim entries | `queue-filter`, `snapshot-history`, `match-normalization`, and `runtime-asset-cache` now exist and pass; the payment-record sentence was removed. New unlisted promises are separately recorded as F-2-3. | Fixed |
| F-1-5: invoice mapping not tested | The one `header-mapping` test now maps unrelated work and invoice headers and asserts the resulting suggestion. | Fixed |
| Prior handoff: manifest served as `application/octet-stream` | The same live response header remains. | **Unfixed: F-2-2** |

## Structure, accessibility, and links

Live `/`, `/demo`, `/privacy`, `/terms`, the SPA missing route, and
`/404.html` each had `lang=en`, one h1, one main, a route-specific title and
description, canonical URL, OG/Twitter image metadata, favicon, header, and
footer with Privacy and Terms. SPA click, back, and forward navigation moved
focus to the new h1. Direct deep links loaded the correct route. The missing
route and static fallback were designed in the same paper/ink/coral identity.

All discovered same-origin links returned 200. The checkout returned the
expected 303 to its hosted checkout; both factory links returned 200; mail
links were explicit. `robots.txt` and `sitemap.xml` returned 200. Security
headers were present without console violations. Playwright Axe found zero
violations on all six checked routes, and the worker URL verifier reported one
h1, `lang=en`, a main landmark, no missing alt text, no unlabeled buttons, and
no console errors. The identity is specific to this product rather than a
generic SaaS template. The only structure findings are F-2-2 and F-2-4.

## Copy audit

Counts use whitespace-delimited words and ignore punctuation-only separators.
Repeated identical nav/footer labels are listed once. Dynamic customer data is
sample content rather than product copy. No sentence exceeds 22 words and no
banned marketing word appears. Findings below concern truth, terminology, or
meaning rather than length.

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
| Try it with sample data | 5 | Pass |
| See a filled review in one click. | 7 | F-2-1, F-2-3 |
| Or import your CSV files | 5 | Pass |
| Files stay in this browser. | 5 | Pass |
| Works offline after your first visit. | 6 | Pass |
| Free sweep; $19 one-time saved review tools. | 7 | F-2-4, F-2-5 |
| Paper invoices form a moonlit landscape where coral envelopes flow toward a filing box. | 14 | Pass (image alt) |
| Review completed work that may still need an invoice. | 9 | Pass |
| Your local workspace | 3 | Pass |
| Import work and invoice CSV files | 6 | Pass |
| Add completed-work and invoice CSV files. | 6 | Pass |
| You choose whether a suggested match counts as billed. | 9 | Pass |
| Import CSV files | 3 | Pass |
| Completed work CSV | 3 | Pass |
| Tasks or time entries with client and project names. | 9 | Pass |
| Choose completed work CSV | 4 | Pass |
| Invoices CSV | 2 | Pass |
| Issued or draft invoices with client and project names. | 9 | Pass |
| Choose invoices CSV | 3 | Pass |
| Your unbilled-work list will appear here | 6 | Pass |
| Import completed work first. | 4 | Pass |
| Add invoices to review possible matches. | 6 | Pass |
| Work columns: date, client, project, description, status, amount. | 8 | Pass |
| Hours and rate can replace amount. | 6 | Pass |
| Import a workspace backup | 4 | Pass |
| Three steps | 2 | Pass |
| How the review works | 4 | Pass |
| Import exports | 2 | Pass |
| Map the columns from your task, time, and invoice CSV files. | 11 | Pass |
| Review matches | 2 | Pass |
| Link an invoice or keep the completed work in your unbilled-work list. | 12 | Pass |
| Export your checklist | 3 | Pass |
| Download the reviewed list as a CSV for your invoicing session. | 11 | Pass |
| What this tool does not do | 6 | Pass |
| It does not send invoices | 5 | Pass |
| It does not track time, calculate tax, or change your source files. | 12 | Pass |
| It only helps you review exported records. | 7 | Pass |
| Paid saved reviews | 3 | F-2-5 |
| Save repeat reviews for $19 once | 6 | F-2-5 |
| Keep named weekly snapshots and compare past list totals on this device. | 12 | F-2-5 |
| Core imports and checklist exports stay free. | 7 | Pass |
| Buy saved review tools | 4 | F-2-5 vague result |
| Checkout opens through Sociobot. | 4 | Pass |
| One payment; no subscription. | 4 | Pass |
| Have a license? | 3 | Pass |
| Paste it here | 3 | Pass |
| Verify license | 2 | Pass |
| Buying means you accept the terms and privacy notice. | 9 | Pass |
| Find completed work that still needs an invoice. | 8 | Pass |
| Artwork disclosure: generated for this product. | 6 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |
| Version 1.0.0 · build 2026.08 | 4 | Pass |

### README

| Copy | Words | Result |
|---|---:|---|
| Unbilled Work Sweep | 3 | Pass |
| Find completed work that still needs an invoice. | 8 | Pass |
| Unbilled Work Sweep keeps a weekly invoice review in your browser for freelancers and tiny agencies. | 16 | Pass |
| It compares completed-work and invoice CSV exports, shows possible matches for review, and exports an invoice-draft checklist. | 17 | Pass |
| It is not a time tracker, invoicing system, or tax tool. | 11 | Pass |
| Live site | 2 | Pass |
| One-click demo | 2 | Pass |
| What it does | 3 | Pass |
| Imports completed-work and invoice CSV exports. | 6 | Pass |
| Suggests invoice matches using client and project names. | 8 | Pass |
| A suggestion changes nothing until you review it, and every link can be reversed. | 14 | Pass |
| Lists completed rows that are not marked billed or linked to an invoice. | 13 | Pass |
| Exports the current unbilled-work list as a CSV checklist. | 9 | Pass |
| Keeps real workspace data in IndexedDB on the device. | 9 | Pass |
| Works offline after the first successful visit. | 7 | Pass |
| The free sweep includes imports, review, workspace backup, and checklist export. | 11 | F-2-5 |
| A $19 one-time license saves named reviews and shows their past list totals. | 13 | F-2-5 inconsistent term |
| Checkout and license verification use the Sociobot billing API; there is no embedded payment provider. | 15 | Pass |
| CSV fields | 2 | Pass |
| The importer asks you to map columns before it stores rows. | 11 | Pass |
| Header names do not need to match these names exactly. | 10 | Pass |
| Rows with blank required cells, non-numeric amounts, or overflowing hours × rate calculations are rejected with their CSV row numbers. | 19 | Pass |
| Saved data remains unchanged so you can fix the file and try again. | 13 | Pass |
| Dates may use YYYY-MM-DD or M/D/YYYY. | 6 | Pass |
| Impossible dates and other formats are rejected before storage. | 9 | Pass |
| Completed-work CSV | 2 | Pass |
| Required: date, client, project, description | 5 | Pass |
| Optional: status, amount, hours, rate, already billed | 7 | Pass |
| If amount is missing, the importer multiplies hours by rate. | 10 | Pass |
| If status is missing, the row is treated as completed. | 10 | Pass |
| Invoice CSV | 2 | Pass |
| Required: invoice date, invoice number, client | 6 | Pass |
| Optional: project, status | 3 | Pass |
| Suggestions compare normalized client and project names. | 7 | F-2-5 jargon |
| A different project is not suggested. | 6 | Pass |
| Invoice dates before work dates are not suggested. | 8 | Pass |
| Every match remains a review choice, and linked matches can be returned to the list. | 15 | Pass |
| Replacing the invoice CSV clears links to invoices that are no longer present, returning that work to the list. | 19 | Pass |
| Replacing completed-work CSV keeps review decisions only for unchanged rows. | 10 | F-2-3 unlisted claim |
| Changed work returns to the list for review. | 8 | F-2-3 unlisted claim |
| Run locally | 2 | Pass |
| Requires Node.js 20 or later. | 5 | Pass |
| Open http://localhost:5173. | 2 | Pass |
| Use http://localhost:5173/demo for the isolated sample. | 6 | Pass |
| Test and build | 3 | Pass |
| Playwright 1.58.2 is pinned because the factory image includes those browsers. | 11 | Pass |
| The exact production build command is npm run build. | 9 | Pass |
| Static output lands in dist/, with dist/index.html at its root. | 10 | Pass |
| Run one public claim test with: | 6 | Pass |
| All claim definitions are in .factory/claims.json. | 6 | Pass |
| Demo details are in .factory/demo.md. | 5 | Pass |
| Privacy and data ownership | 4 | Pass |
| Real imports use IndexedDB. | 4 | Pass |
| Demo actions use the separate demo:unbilled-work-sweep session-storage key. | 8 | Pass |
| CSV rows do not leave the browser. | 7 | Pass |
| A request goes to api.sociobot.in only when a user adds or verifies a paid license. | 15 | F-2-3 unlisted/incomplete claim |
| Use Export workspace for a JSON backup. | 7 | Pass |
| Use Clear imported data to remove the active workspace. | 9 | Pass |
| The on-site privacy notice and terms are available as real routes. | 11 | Pass |
| Deploy | 1 | Pass |
| Deploy the contents of dist/ to a static host. | 9 | Pass |
| staticwebapp.config.json supplies SPA fallback, security headers, cache rules, and the 404 rewrite. | 12 | Pass |
| The service worker precaches the app shell. | 7 | Pass (`offline-reload` evidence) |
| Project notes | 2 | Pass |
| Visual thesis | 2 | Pass |
| Demo contract | 2 | Pass |
| Handoff | 1 | Pass |
| MIT License | 2 | Pass |

## Missed leverage

No additional AI feature is justified. The brief calls for deterministic,
reviewable local matching, and sending invoice-related rows to a model would
add privacy and key-management cost without completing the core job better.
Generic CSV import with column mapping, checklist export, and full JSON backup
already cover the obvious import/export leverage. Sync would conflict with the
local-first scope unless a separate user-controlled requirement is added.

## What would make this perfect

Put a real sample row, total, suggestion, and review action in the first phone
viewport; serve the manifest with the correct MIME type; register or remove
every unlisted promise; fit all three facts in the desktop first screen; and
use one plain term for the paid review-history feature. Then rerun every claim
command from a clean clone and repeat the live phone, request-log, offline,
route, link, and MIME checks. There is nothing else to add after those five
findings are eliminated.
