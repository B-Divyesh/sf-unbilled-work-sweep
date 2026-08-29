# Adversarial first-read review 3 — FAIL

Date: 2026-08-29  
Live URL checked: <https://unbilled-work-sweep.sociobot.in>  
Candidate reviewed: `0050b5a2835d73fbefb3b93790137fcd1c83d15f`

## Verdict

**FAIL.** Three findings remain: one blocking capability gap, one high-severity
claim-test gap, and one minor action-label problem. The cold landing page, demo,
privacy boundary, offline path, routes, links, accessibility checks, all 30
registered claim commands, the 43-test suite, and the production build pass.
A PASS requires zero findings and no untested claim.

## Findings

### F-3-1 — BLOCKING — work from a second task or time tool replaces the first source

Locations and exact text:

- `.factory/brief.json`: **“records tasks or time in more than one tool”**.
- Live landing first screen: **“For freelancers and tiny agencies with work
  spread across task, time, and invoice tools.”**
- Live populated workspace: the only work-source control becomes **“Replace
  completed work”** after one CSV is imported.
- README: **“Replacing completed-work CSV keeps review decisions only for
  unchanged rows. Changed work returns to the list for review.”**

The product has one completed-work CSV slot. In a fresh live browser, importing
`task-tool.csv` produced **Task tool row** and `$100.00`. Importing
`time-tool.csv` next removed that row, showed only **Time tool row**, and changed
the total to `$200.00`. There is no append, multi-file selection, merge, or
source switcher. The existing `work-replacement` claim deliberately confirms
replacement.

This blocks the researched job: a freelancer whose completed work is split
between a task tool and a time tool cannot see both sources in one weekly
review. The first-screen audience sentence implies that this is exactly the
situation the product handles.

Concrete fix: let **Add completed work CSVs** accept multiple files or offer an
explicit **Add another export** action. Merge rows into one review, retain a
source filename/tool label, detect exact duplicate rows, and ask before
replacing an existing source. Add a `multi-source-import` claim that imports
two completed-work fixtures from different tools and asserts that both rows and
their combined total remain. Keep a separate tested **Replace this source**
operation for intentional updates.

### F-3-2 — HIGH — the scope-boundaries claim test asserts copy, not the promised boundary

Location: `.factory/claims.json`, claim `scope-boundaries`; test
`tests/product.spec.ts:563`.

Exact claim: **“The sweep reviews exported records; it does not send invoices,
track time, calculate tax, or change source files.”**

The tagged test passes, but it only confirms that the two boundary sentences
are rendered and that no button has a name matching `send invoice`, `calculate
tax`, or `track time`. A background request, differently named action, or source
mutation would not fail the test. This conflicts with the claims contract that
a test must assert the observable outcome rather than the existence or absence
of a button. The claim therefore remains unverified despite the green command.

Concrete fix: in the single `@claim:scope-boundaries` test, upload a fixture
from a temporary file, record requests through import, match review, and both
exports, and confirm no invoice-send endpoint or off-origin request occurs.
Hash the source fixture before and after the flow, and inspect all interactive
roles for time-tracking, tax, or invoice-sending actions. Keep the existing
copy assertions as secondary checks.

### F-3-3 — MINOR — the demo’s paid-feature button does not name its result

Location: live `/demo`, below the review list; source `src/main.ts:117`.

Exact label: **“Review history · paid”**.

This is a noun plus a price-state marker, not a result-naming verb. Selecting it
leaves the demo and scrolls to the purchase explanation on the landing page;
the label does not tell a first-time visitor that result.

Concrete fix: rename it **“View review history options”**. Keep **“Buy review
history — $19”** only for the checkout link because that link actually starts
the purchase path.

## Cold first read

Fresh Chromium contexts were opened at 390 × 844 and 1440 × 900 with empty
storage. Before scrolling, all three required answers were available:

- What it does: finds finished work that has not been billed.
- For whom: freelancers and tiny agencies with work in task, time, and invoice
  tools.
- First click: **Try it with sample data**; adjacent copy says **See a filled
  review in one click.**

The exact first-screen text was **“Find finished work you have not billed”**,
**“For freelancers and tiny agencies with work spread across task, time, and
invoice tools”**, and **“Try it with sample data.”** The action and all three
privacy/offline/price facts fit without scrolling at both sizes. The mobile
document width was 390 px with no horizontal overflow. No console or page error
was recorded. The comprehension gate passes; F-3-1 concerns whether the stated
multi-tool audience can complete the real job.

## Copy audit

Counts are whitespace-delimited after markup is removed; hyphenated terms and
prices count as one word, and punctuation-only separators do not count.
Repeated navigation/footer labels are listed once. Sample customer names and
values are data, not product copy. No sentence exceeds 22 words, no banned
marketing adjective appears, and headings are literal. F-3-1 and F-3-3 are the
only copy-related findings.

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
| For freelancers and tiny agencies with work spread across task, time, and invoice tools. | 14 | F-3-1 capability mismatch |
| Try it with sample data | 5 | Pass |
| See a filled review in one click. | 7 | Pass |
| Or import your CSV files | 5 | Pass |
| Files stay in this browser. | 5 | Pass |
| Works offline after your first visit. | 6 | Pass |
| Imports and checklist exports are free. | 6 | Pass |
| Review history costs $19 once. | 5 | Pass |
| Paper invoices form a moonlit landscape where coral envelopes flow toward a filing box. | 14 | Pass; image alt text |
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
| It does not track time, calculate tax, or change your source files. | 12 | F-3-2 test does not prove outcome |
| It only helps you review exported records. | 7 | F-3-2 test does not prove outcome |
| Saved review history | 3 | Pass |
| Save weekly review totals for a one-time $19 | 8 | Pass |
| Name each weekly review and compare earlier list totals on this device. | 12 | Pass |
| Imports and checklist exports stay free. | 6 | Pass |
| Buy review history — $19 | 4 | Pass |
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
| (external site) | 2 | Pass |
| Version 1.0.0 · build 2026.08 | 4 | Pass |

### Demo-specific copy and controls

| Copy | Words | Result |
|---|---:|---|
| Demo — sample data, nothing is saved | 6 | Pass |
| Link or keep a suggested match, then export the list. | 10 | Pass |
| Reset demo | 2 | Pass |
| Start for real | 3 | Pass |
| Ready-to-review sample | 2 | Pass |
| Review work before you invoice | 5 | Pass |
| Six work rows, two suggested matches, and four items to review. | 11 | Pass |
| 4 completed items to review | 5 | Pass |
| Already billed and unfinished rows are excluded. | 7 | Pass |
| Possible unbilled value | 3 | Pass |
| Link invoice | 2 | Pass |
| Keep unbilled | 2 | Pass |
| Export checklist CSV | 3 | Pass |
| Export workspace | 2 | Pass |
| Import workspace | 2 | Pass |
| Review history · paid | 3 | F-3-3; no result-naming verb |
| Clear imported data | 3 | Pass |
| What to try | 3 | Pass |
| Link the Morrow invoice. | 4 | Pass |
| Keep North Star in the list. | 6 | Pass |
| Check an item, then export 4 rows. | 7 | Pass |

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
| Imports, review, workspace backup, and checklist export are free. | 9 | Pass |
| A $19 one-time license adds review history with named weekly totals. | 11 | Pass |
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
| Suggestions ignore capitalization, punctuation, and spacing when comparing client and project names. | 12 | Pass |
| A different project is not suggested. | 6 | Pass |
| Invoice dates before work dates are not suggested. | 8 | Pass |
| Every match remains a review choice, and linked matches can be returned to the list. | 15 | Pass |
| Replacing the invoice CSV clears links to invoices that are no longer present, returning that work to the list. | 19 | Pass |
| Replacing completed-work CSV keeps review decisions only for unchanged rows. | 10 | Pass; documents F-3-1 behavior honestly |
| Changed work returns to the list for review. | 8 | Pass |
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
| CSV and demo actions make no off-origin requests. | 8 | Pass |
| Buying or verifying a license contacts api.sociobot.in. | 7 | Pass |
| Use Export workspace for a JSON backup. | 7 | Pass |
| Use Clear imported data to remove the active workspace. | 9 | Pass |
| The on-site privacy notice and terms are available as real routes. | 11 | Pass |
| Deploy | 1 | Pass |
| Deploy the contents of dist/ to a static host. | 9 | Pass |
| staticwebapp.config.json supplies SPA fallback, security headers, cache rules, and the 404 rewrite. | 12 | Pass |
| The service worker precaches the app shell. | 7 | Pass |
| Project notes | 2 | Pass |
| Visual thesis | 2 | Pass |
| Demo contract | 2 | Pass |
| Handoff | 1 | Pass |
| MIT License | 2 | Pass |

## Demo and sandbox evidence

The one-click demo gate passes. From a fresh landing page, one click opened
`/demo` with the persistent **“Demo — sample data, nothing is saved”** banner.
At 390 × 844, the `$5,840.00` total ended at y = 459 px, the first realistic
work row ended at y = 755 px, its suggestion ended at y = 700 px, and **Link
invoice** ended at y = 693 px. The first screen therefore shows the product in
use, not setup.

The sample had six work rows, two suggestions, four review rows, and a $5,840
total. Linking the first invoice changed the total to $3,640; **Reset demo**
restored $5,840 and two Link actions. A real `$125` row was imported before the
demo. **Start for real** removed all `demo:` session keys, restored the real row,
and exposed no sample row. A second browser context had no reviewed decision.

The full live import/demo/review/reset/exit request log contained no off-origin
request. With the live page controlled by its service worker, disabling the
network and reloading `/demo` retained the banner and `$5,840.00`, displayed
the offline notice, and produced no failed or off-origin request.

## Claims results

A clean clone at `/tmp/unbilled-work-sweep-review3.pMqLen` received `npm ci`.
Every command in `.factory/claims.json` was run separately and exactly as
listed. All commands executed successfully; F-3-2 concerns assertion quality,
not command exit status.

| Claim id | Result |
|---|---|
| csv-import | PASS |
| demo-sample-ready | PASS |
| header-mapping | PASS |
| queue-filter | PASS |
| missing-status | PASS |
| validated-import | PASS |
| review-matches | PASS |
| work-replacement | PASS |
| invoice-replacement | PASS |
| csv-export | PASS |
| local-only | PASS |
| network-boundary | PASS |
| offline-reload | PASS |
| manifest-mime | PASS |
| runtime-asset-cache | PASS |
| local-persistence | PASS |
| workspace-backup | PASS |
| paid-license | PASS |
| snapshot-history | PASS |
| hours-times-rate | PASS |
| invoice-date-guard | PASS |
| match-normalization | PASS |
| demo-isolation | PASS |
| demo-session-removal | PASS |
| clear-workspace | PASS |
| license-storage | PASS |
| free-core | PASS |
| billing-boundary | PASS |
| scope-boundaries | PASS command; inadequate assertion (F-3-2) |
| art-disclosure | PASS |

All claim-like landing, demo, privacy, terms, and README statements map to a
registered claim; no additional unlisted sentence was found. F-3-2 prevents the
scope claim from counting as tested to the required standard.

## Earlier finding recheck

Every finding in `.factory/review-1.md` and `.factory/review-2.md`, both polish
reports, and the prior handoff was rechecked in live behavior and source.

| Earlier finding | Current evidence | Result |
|---|---|---|
| F-1-1: incomplete static 404 | Live `/404.html` has the product header/nav, skip link, one h1/main, metadata, canonical, legal footer links, and product styling. | Fixed |
| F-1-2: metaphor 404 copy | Live SPA and static fallbacks say **404 error**, **Page not found**, and **Return home**. Old metaphor text is absent from source. | Fixed |
| F-1-3: jargon and mood headings | All quoted terms are absent from visitor-facing source and live copy; the current audit has no jargon/metaphor flag. | Fixed |
| F-1-4: five missing claims | `queue-filter`, `snapshot-history`, `match-normalization`, and `runtime-asset-cache` are registered and pass; the payment-record sentence remains removed. | Fixed |
| F-1-5: invoice header mapping untested | `header-mapping` maps unrelated completed-work and invoice headers and passed separately. | Fixed |
| F-2-1: demo review below phone viewport | Live bounds put the total, first row, suggestion, and Link action inside 844 px. | Fixed |
| F-2-2: manifest MIME | Live `/manifest.webmanifest` returned `200 application/json`; registered claim passed. | Fixed |
| F-2-3: four unlisted promises | `demo-sample-ready`, `work-replacement`, and `network-boundary` exist and pass; the unrestricted demo sentence remains narrowed. | Fixed |
| F-2-4: desktop price fact clipped | All three facts ended above y = 771 px in the 1440 × 900 cold viewport. | Fixed |
| F-2-5: inconsistent paid terms and matching jargon | Visitor copy consistently uses **review history**; exact ignored differences replace “normalized.” | Fixed |
| Prior handoff: manifest response remained wrong | Live MIME and clean test now pass. | Fixed |

No earlier finding is half-fixed or regressed. The current findings are new.

## Structure, accessibility, links, and visual identity

Live `/`, `/demo`, `/privacy`, `/terms`, an unknown SPA route, and `/404.html`
each had `lang=en`, exactly one h1 and main, a route-specific title,
description, canonical, matching OG/Twitter title, 1200 × 630 product image,
favicon, header, and footer with Privacy and Terms. SPA clicks, back, and
forward focused the new h1 after route rendering. Deep links and reloads opened
the correct route. The unknown route and static fallback use literal recovery
copy and the product treatment.

Every discovered same-origin route/asset returned 200. The Sociobot checkout
returned the expected 303 to hosted checkout; both factory links returned 200;
the two mail links are explicit. `robots.txt`, `sitemap.xml`, manifest, favicon,
Apple icon, and OG image returned 200. The response carried CSP,
`X-Content-Type-Options`, Referrer-Policy, Permissions-Policy, and HSTS without
console violations.

Live Axe scans found zero violations on all six routes. The worker URL verifier
reported a title, `lang=en`, one h1, a main landmark, complete image alt text,
no unlabeled buttons, and no console errors. Keyboard route focus, 390 px
layout, 200% text sizing, 44 px demo controls, and reduced-motion coverage pass
the suite.

The visual identity is distinct: offset editorial paper panels, ink/cream/coral
colors, serif totals, hard shadows, and original moonlit paperwork art match
`.factory/design.md`. It is not the centered gradient/three-card SaaS pattern.
The asset provenance and generated-art disclosure are present.

The production build is byte-identical to the live HTML, JS, CSS, service
worker, and static 404. Built JS is 12.48 KB gzip and CSS is 4.45 KB gzip.
`npm test` passed 43/43; `npm run build` produced `dist/`.

## Missed leverage

F-3-1 is the missed leverage: multiple completed-work sources are directly
implied by the researched audience, but the current replacement model cannot
combine them. An explicit multi-source import with deduplication is more useful
than adding AI.

No AI feature is otherwise justified. Matching is deterministic and must stay
reviewable; sending invoice-related rows to a model would add privacy and key
setup without improving the core job. Checklist CSV export and full JSON backup
cover the remaining obvious export needs. Sync would conflict with the stated
local storage boundary unless introduced as a separate user-controlled feature.
No provider key, decorative AI feature, Azure endpoint, or runtime AI request is
present.

## What would make this perfect

Combine completed-work exports from multiple task/time tools without removing
earlier sources; strengthen `scope-boundaries` so it tests behavior rather than
copy; and rename the demo’s paid button to state that it opens review-history
options. Register and run the multi-source claim, then repeat the clean-clone
claim suite and the live phone/demo/storage/offline/route checks. No other work
was identified.
