# Adversarial first-read review 1 — FAIL

Date: 2026-08-29  
Live URL checked: <https://unbilled-work-sweep.sociobot.in>

## Verdict

**FAIL.** The main landing and one-click demo work, and all registered claim
tests pass. There are still five findings, including a production fallback 404
that does not use the required product skeleton, unfixed metaphor copy recorded
by the prior review, and visitor-reliant statements that have no registered
claim test. A PASS requires zero findings.

## Cold first read

Fresh Chromium contexts at 390 × 844 and 1440 × 900 were used, with no existing
storage. Before scrolling, the answer was clear:

- What it does: **“Find finished work you have not billed.”**
- For whom: **“For freelancers and tiny agencies with work spread across task,
  time, and invoice tools.”**
- First click: **“Try it with sample data”**; adjacent text says **“See a
  filled sweep in one click.”**

This gate passes. The mobile viewport has no horizontal overflow and the action
is visible before scrolling. No console or page error was logged on the landing,
demo, privacy, terms, or SPA missing route.

## Findings

### F-1-1 — BLOCKING — the production fallback 404 is not a complete product route

Location: direct live `/404.html`; source `public/404.html`.

The deployed fallback only contains a `main` with a paragraph, heading, and a
home link. It has no product header, skip link, Demo/Privacy navigation, footer
with Privacy and Terms, favicon, canonical URL, meta description, Open Graph,
or Twitter metadata. It therefore fails the required consistent header/footer
and route metadata when the static host uses it for an actual 404. It is also a
separate visual treatment from the live product shell.

Confirm: `GET /404.html` returned 200 and its source was the bare fallback;
direct `/missing` is an SPA 200 and does not test the host fallback.

Fix: make `public/404.html` a complete, self-contained product page: use the
same wordmark/header, skip link, footer and legal links; add favicon,
description, canonical, OG/Twitter tags, and a literal page-not-found heading.
Add a browser test that opens the static fallback response (not only the SPA
missing path) and asserts the skeleton and metadata.

### F-1-2 — BLOCKING — prior metaphor-copy finding remains unfixed

Location: live `/missing` and direct `/404.html`; source `src/main.ts:140` and
`public/404.html`.

Exact quote: **“This page missed the invoice stack”** (and the label
**“404 · Misfiled page”**).

`verification-7.md` recorded this as unresolved copy polish. It is still live
in both 404 implementations. The review instructions require every earlier
unfixed finding to return as blocking. The words describe a fictional filing
scene rather than the page state, so a person who reaches a broken address
gets decoration before the error.

Fix: replace the label with `404 error` and the heading with `Page not found`.
Keep `The address may be wrong, or the page may have moved.` and `Return home`
as the recovery action. Cover both the SPA route and static fallback in a
copy/route test.

### F-1-3 — HIGH — landing and README copy still uses unexplained jargon and mood headings

Locations and exact text:

- Hero eyebrow: **“A weekly billing attention queue”**. “Attention queue” is
  internal-sounding jargon before the product has explained it. Rewrite:
  `Completed work to review before invoicing`.
- Hero caption: **“Bring the missed pieces of your paper trail into view.”**
  This is a metaphor that does not say what the illustration or product does.
  Rewrite: `Review completed work that may still need an invoice.` (or remove
  the caption because the h1 already says this).
- Workspace heading: **“Start this week’s sweep”**. “Sweep” does not name the
  section in isolation. Rewrite: `Import work and invoice CSV files`.
- How-it-works eyebrow: **“Three deliberate steps”**. “Deliberate” adds no
  usable information. Rewrite: `Three steps` or remove it because the h2
  already names the section.
- Boundary eyebrow: **“A boundary on purpose”**. It is a mood heading rather
  than the section name. Rewrite: `What this tool does not do`.
- Paid-section eyebrow: **“Keep the habit”**. It says neither what is sold nor
  who it helps. Rewrite: `Paid saved reviews`.
- README opening: **“Unbilled Work Sweep is a local-first weekly review for
  freelancers and tiny agencies.”** “Local-first” is product-builder jargon.
  Rewrite: `Unbilled Work Sweep keeps a weekly invoice review in your browser
  for freelancers and tiny agencies.`
- README feature list: **“Exports the current attention queue as a CSV
  checklist.”** “Attention queue” remains unexplained jargon when heard without
  the landing context. Rewrite: `Exports the current unbilled-work list as a
  CSV checklist.`

These conflict with the attached plain-words contract, even though they are
short and the first-read gate itself passes. Update `.factory/copy-audit.md`
so these items are flagged rather than reported as pass.

### F-1-4 — HIGH — claim inventory omits live and README behavior claims

The following visitor-reliant statements have no matching entry in
`.factory/claims.json`. Existing tests may touch adjacent controls, but their
registered claim text does not promise these outcomes and does not assert the
full stated behavior.

| Location and exact quote | Why it is unlisted | Concrete fix |
|---|---|---|
| Live `/demo`: **“Already billed and unfinished rows are excluded.”** | No `queue-filter` claim exists. `csv-import` is registered only as import behavior. | Add `queue-filter` with a clean-demo test that imports one billed and one unfinished row and asserts neither is in the queue or total; or remove this sentence. |
| Landing paid section and README line 20: **“Keep named weekly snapshots and compare past queue totals on this device.”** / **“A $19 one-time license adds named weekly snapshots with past queue totals.”** | `paid-license` proves one saved snapshot after a mocked license, not two saved reviews and a visible comparison of their totals. | Add `snapshot-history` using a fixture license, save two different queue states, and assert both dated count/value records; or narrow the copy to the behavior actually tested. |
| README line 40: **“The matcher normalizes client wording and compares client and project names.”** | There is no matching-algorithm claim. `review-matches` only proves a supplied sample can be linked and unlinked. | Add `match-normalization` fixtures for client punctuation/wording and project agreement, including a near miss that is not suggested; or describe only that the user reviews suggestions. |
| README line 81: **“The service worker precaches the app shell and stores same-origin assets after use.”** | `offline-reload` proves shell assets are cached. It does not assert the separate runtime-cache promise that a newly fetched same-origin asset is stored after use. | Add a `runtime-asset-cache` request/cache test, or delete the runtime-cache clause from the README. |
| Privacy page: **“Sociobot and its payment partner handle checkout and payment records.”** | This payment-record responsibility statement has no claim entry or observable test. | Add a documented, observable checkout-boundary test if this is a product promise, otherwise make the legal page state only the in-app storage fact that `license-storage` proves. |

### F-1-5 — MINOR — the header-mapping claim does not test invoice mapping

Location: `.factory/claims.json` `header-mapping`; test
`tests/product.spec.ts:25`.

The claim says **“CSV headers do not need to match the app's field names
because the user can map them before import.”** The only test manually maps an
unrelated-header *completed-work* file. Invoice CSV is also a supported import
type, but its date, number, and client mappings are never exercised under that
claim. A user cannot tell whether the broad plural claim applies to invoices.

Fix: extend the one `@claim:header-mapping` test with an unrelated-header
invoice fixture, map all required invoice fields, and assert the imported
invoice produces the expected suggestion. Alternatively narrow the claim to
completed-work CSV only.

## Demo, sandbox, privacy, and claims evidence

The demo gate passes. One click on **Try it with sample data** opened `/demo`
with the persistent **“Demo — sample data, nothing is saved”** banner, Reset
demo and Start for real controls, four realistic queue rows, two possible
invoice matches, and **$5,840.00** already visible. It is not an empty or
setup screen.

In a fresh mobile context, demo state was stored under
`sessionStorage['demo:unbilled-work-sweep']`; real `localStorage` remained
empty. Reviewing a sample item changed only that demo record. Reset removed the
review decision. Start for real removed the `demo:` record and returned to the
empty real workspace. No request left the product origin during landing, demo,
review, reset, or export. This confirms the demo's data isolation; the separate
`unbilled:service-worker-ready` session flag contains no work or review data.

After clean `npm ci`, all 22 commands listed in `.factory/claims.json` passed
individually. `npm test` passed 33/33 and `npm run build` produced
`dist/index.html`. The checkout link returned 303 to a Dodo checkout URL
without purchase. The full local suite covers the earlier cache/update,
malformed-backup, heading order, touch-target, unlink, validation, stale-link,
date, and claim-coverage regressions.

## Earlier-review finding recheck

Every prior failure was rechecked in live behavior and source/tests:

| Earlier finding | Current evidence | Result |
|---|---|---|
| App shell was not precached/offline reload failed | `public/sw.js` receives built JS/CSS; `@claim:offline-reload` passed. | Fixed |
| False/inoperable PWA update notice | `registerServiceWorker()` requires a real waiting worker; focused regression passed. | Fixed |
| Malformed JSON bricked workspace | `isSweepState` guard and backup regressions passed. | Fixed |
| Art provenance claim lacked registry coverage | `art-disclosure` registry entry and test passed. | Fixed |
| Demo heading skips, small banner controls, no unlink | Live demo hierarchy and controls pass tests; Link then keyboard Unlink restores queue. | Fixed |
| Checkout 404 | Live checkout returned 303 to Dodo. | Fixed |
| Hidden file input focus, invalid CSV acceptance, stale links | Current tests cover visible focus, rejected rows, and link clearing. | Fixed |
| Invoice-before-work matching and missing registry entries | Calendar-date regression and the 22 current declared claims pass. | Fixed, except the newly identified unlisted statements in F-1-4 |
| 404/hero paper-trail metaphor noted in verification 7 | 404 metaphor remains live. | **Unfixed: F-1-2** |

## Structure and leverage checks

The live application routes (`/`, `/demo`, `/privacy`, `/terms`, and the SPA
missing route) had one h1, `lang=en`, route-specific document titles,
descriptions and canonicals, no console errors, consistent live header/footer,
and working Privacy/Terms links. Every discovered product link returned 200,
except checkout which returned the expected 303; the external factory link
returned 200. The landing visual is distinct from a generic SaaS template: it
uses the documented paper/ink/coral editorial system and original product art.

There is no obvious missing AI, sync, or import/export feature beyond the brief:
the specified local CSV import, review, and checklist/backup export loop is
present. An AI feature would not improve this narrowly local reconciliation
task enough to justify adding data sharing or key setup.

## Complete copy inventory

Counts use whitespace-delimited words after Markdown/HTML markup is removed;
hyphenated terms and prices count as one word. `F-1-3` marks the landing items
flagged above. This includes sentence-like UI copy, headings, and action labels
so the button and heading checks are auditable.

### Landing page

| Copy | Words | Result |
|---|---:|---|
| Skip to main content | 4 | Pass |
| Unbilled Work Sweep | 3 | Pass |
| Demo | 1 | Pass |
| How it works | 4 | Pass |
| Privacy | 1 | Pass |
| A weekly billing attention queue | 5 | F-1-3 jargon |
| Find finished work you have not billed | 7 | Pass |
| For freelancers and tiny agencies with work spread across task, time, and invoice tools. | 14 | Pass |
| Try it with sample data | 6 | Pass |
| See a filled sweep in one click. | 7 | Pass |
| Or import your CSV files | 5 | Pass |
| Files stay in this browser. | 5 | Pass |
| Works offline after your first visit. | 6 | Pass |
| Free sweep; $19 one-time saved review tools. | 7 | Pass |
| Bring the missed pieces of your paper trail into view. | 10 | F-1-3 metaphor |
| Your local workspace | 3 | Pass |
| Start this week’s sweep | 4 | F-1-3 vague heading |
| Add completed-work and invoice CSV files. | 6 | Pass |
| You choose whether a suggested match counts as billed. | 9 | Pass |
| Import CSV files | 3 | Pass |
| Completed work CSV | 3 | Pass |
| Tasks or time entries with client and project names. | 9 | Pass |
| Choose completed work CSV | 4 | Pass |
| Invoices CSV | 2 | Pass |
| Issued or draft invoices with client and project names. | 9 | Pass |
| Choose invoices CSV | 3 | Pass |
| Your attention queue will appear here | 6 | Pass |
| Import completed work first. | 4 | Pass |
| Add invoices to review possible matches. | 6 | Pass |
| Work columns: date, client, project, description, status, amount. | 8 | Pass |
| Hours and rate can replace amount. | 6 | Pass |
| Import a workspace backup | 4 | Pass |
| Three deliberate steps | 3 | F-1-3 mood heading |
| How the sweep works | 4 | Pass |
| Import exports | 2 | Pass |
| Map the columns from your task, time, and invoice CSV files. | 11 | Pass |
| Review matches | 2 | Pass |
| Link an invoice or keep the completed work in your attention queue. | 12 | Pass |
| Export your checklist | 3 | Pass |
| Download the reviewed queue as a CSV for your invoicing session. | 11 | Pass |
| A boundary on purpose | 4 | F-1-3 mood heading |
| It does not send invoices | 5 | Pass |
| It does not track time, calculate tax, or change your source files. | 12 | Pass |
| It only helps you review exported records. | 7 | Pass |
| Keep the habit | 3 | F-1-3 mood heading |
| Save repeat reviews for $19 once | 6 | Pass |
| Keep named weekly snapshots and compare past queue totals on this device. | 12 | F-1-4 unlisted claim |
| Core imports and checklist exports stay free. | 7 | Pass |
| Buy saved review tools | 4 | Pass |
| Sociobot is the merchant of record. | 6 | Pass |
| One payment; no subscription. | 4 | Pass |
| Have a license? Paste it here | 6 | Pass |
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
| Unbilled Work Sweep is a local-first weekly review for freelancers and tiny agencies. | 13 | Flag: `local-first` jargon; rewrite `keeps a weekly review in your browser` |
| It compares completed-work and invoice CSV exports, shows possible matches for review, and exports an invoice-draft checklist. | 17 | Pass |
| It is not a time tracker, invoicing system, or tax tool. | 11 | Pass |
| Live site | 2 | Pass |
| One-click demo | 2 | Pass |
| What it does | 4 | Pass |
| Imports completed-work and invoice CSV exports. | 5 | Pass |
| Suggests invoice matches using client and project names. | 8 | Pass |
| A suggestion changes nothing until you review it, and every link can be reversed. | 14 | Pass |
| Lists completed rows that are not marked billed or linked to an invoice. | 12 | Pass |
| Exports the current attention queue as a CSV checklist. | 9 | Flag: `attention queue` jargon; use `unbilled-work list` |
| Keeps real workspace data in IndexedDB on the device. | 9 | Pass |
| Works offline after the first successful visit. | 7 | Pass |
| The free sweep includes imports, review, workspace backup, and checklist export. | 11 | Pass |
| A $19 one-time license adds named weekly snapshots with past queue totals. | 12 | F-1-4 unlisted claim |
| Checkout and license verification use the Sociobot billing API; there is no embedded payment provider. | 14 | Pass |
| CSV fields | 2 | Pass |
| The importer asks you to map columns before it stores rows. | 11 | Pass |
| Header names do not need to match these names exactly. | 10 | F-1-5 incomplete test scope |
| Rows with blank required cells or non-numeric amounts are rejected with their CSV row numbers. | 15 | Pass |
| Saved data remains unchanged so you can fix the file and try again. | 13 | Pass |
| Dates may use YYYY-MM-DD or M/D/YYYY. | 7 | Pass |
| Impossible dates and other formats are rejected before storage. | 9 | Pass |
| Completed-work CSV | 2 | Pass |
| Required: date, client, project, description | 5 | Pass |
| Optional: status, amount, hours, rate, already billed | 7 | Pass |
| If amount is missing, the importer multiplies hours by rate. | 10 | Pass |
| If status is missing, the row is treated as completed. | 10 | Pass |
| Invoice CSV | 2 | Pass |
| Required: invoice date, invoice number, client | 6 | Pass |
| Optional: project, status | 3 | Pass |
| The matcher normalizes client wording and compares client and project names. | 11 | F-1-4 unlisted claim |
| Invoice dates before work dates are not suggested. | 9 | Pass |
| Every match remains a review choice, and linked matches can be returned to the queue. | 14 | Pass |
| Replacing the invoice CSV clears links to invoices that are no longer present, returning that work to the attention queue. | 19 | Pass |
| Run locally | 2 | Pass |
| Requires Node.js 20 or later. | 5 | Pass |
| Open http://localhost:5173. | 2 | Pass |
| Use http://localhost:5173/demo for the isolated sample. | 5 | Pass |
| Test and build | 3 | Pass |
| Playwright 1.58.2 is pinned because the factory image includes those browsers. | 11 | Pass |
| The exact production build command is npm run build. | 9 | Pass |
| Static output lands in dist/, with dist/index.html at its root. | 9 | Pass |
| Run one public claim test with: | 6 | Pass |
| All claim definitions are in .factory/claims.json. | 6 | Pass |
| Demo details are in .factory/demo.md. | 6 | Pass |
| Privacy and data ownership | 4 | Pass |
| Real imports use IndexedDB. | 4 | Pass |
| Demo actions use the separate demo:unbilled-work-sweep session-storage key. | 7 | Pass |
| CSV rows do not leave the browser. | 7 | Pass |
| A request goes to api.sociobot.in only when a user adds or verifies a paid license. | 15 | Pass |
| Use Export workspace for a JSON backup. | 7 | Pass |
| Use Clear imported data to remove the active workspace. | 9 | Pass |
| The on-site privacy notice and terms are available as real routes. | 11 | Pass |
| Deploy | 1 | Pass |
| Deploy the contents of dist/ to a static host. | 9 | Pass |
| staticwebapp.config.json supplies SPA fallback, security headers, cache rules, and the 404 rewrite. | 10 | Pass |
| The service worker precaches the app shell and stores same-origin assets after use. | 13 | F-1-4 unlisted runtime-cache claim |
| Project notes | 2 | Pass |
| Visual thesis | 2 | Pass |
| Demo contract | 2 | Pass |
| Handoff | 1 | Pass |
| MIT License | 2 | Pass |

No audited sentence exceeds 22 words. The flagged copy issues are terminology,
metaphor, or heading-information failures rather than length failures.

## What would make this perfect

Use one literal, fully metadata-complete 404 page across host and SPA paths;
remove the remaining decorative headings and paper-trail metaphors; and either
test or remove every listed behavioral promise. Then rerun each claim command
from a clean install, including a two-snapshot paid fixture, invoice-header
mapping, queue filtering, matching normalization, and runtime cache behavior.
