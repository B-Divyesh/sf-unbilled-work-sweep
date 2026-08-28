# Independent verification 4 — FAIL

Date: 2026-08-28  
Verifier work order: `unbilled-work-sweep-verify-4`  
Candidate commit: `05217fde30c5f47bfcab3976ea1a5ecc8b97126d`  
Live URL: <https://unbilled-work-sweep.sociobot.in>

## Decision

**FAIL — do not release.** The deployed application matches the candidate's
production build and the import, reconciliation, backup, privacy, offline,
and billing-boundary checks are healthy. It nevertheless misses mandatory
accessibility and recovery requirements: the demo heading outline skips a
level, essential demo controls are undersized for touch, and a user cannot
undo an invoice-link decision.

## Release-blocking findings

### High — `/demo` skips from the page heading directly to level-three headings

Live Axe 4.10.2 reports `heading-order` on
`div.import-grid > div.import-card > div > h3` (**Completed work CSV**). The
live outline is `h1 Review work before you invoice` followed by `h3 Completed
work CSV` and `h3 Invoices CSV`, before the first `h2`. Lighthouse independently
gives this audit a score of 0 (overall accessibility is 98). The acceptance
contract makes heading order a non-negotiable accessibility baseline. Make
the import-card labels valid descendants of an appropriate `h2` section, or
use non-heading text where that is the right semantic level.

### High — demo’s persistent Reset and Start-for-real controls miss the 44px touch target minimum

At the required 390px viewport, live `getBoundingClientRect()` measured
**Reset demo** at `104 × 34.33px` and **Start for real** at `113.70 × 34.33px`.
The same controls are the persistent demo exit/reset actions and must meet the
44 × 44 CSS-pixel minimum in the accessibility and design contracts. The
stylesheet explicitly overrides `.demo-banner .text-button` to `min-height:
34px`.

### High — linking a suggested invoice cannot be reversed

On live `/demo`, selecting **Link invoice** for *Final responsive page build*
changes the queue from `$5,840.00` to `$3,640.00` and removes that work row.
There is no Undo, Unlink, Reset linked match, or decision-management control
(`0` matching controls found by keyboard-accessible role query). This contradicts
the product’s stated user-control/review promise and the empty-state instruction
that says a user can “reset a linked match”; no such action exists. An accidental
link hides work from the invoice checklist until the user clears/reimports the
workspace. Add a visible per-row un-link/review-history action or an immediate
undo, and regression coverage for it.

## Required claim tests — PASS

From the clean candidate checkout, I ran `npm ci`, then every command declared
in `.factory/claims.json` individually, through the Playwright demo entry
point. All 15 passed. `npm test` then passed all 22 Chromium tests and
`test-results/.last-run.json` records `{"status":"passed","failedTests":[]}`.

| Claim ID | Result |
|---|---|
| `csv-import` | PASS |
| `review-matches` | PASS (but does not test reversal) |
| `csv-export` | PASS |
| `local-only` | PASS |
| `offline-reload` | PASS |
| `local-persistence` | PASS |
| `workspace-backup` | PASS |
| `paid-license` | PASS (mocked verification) |
| `hours-times-rate` | PASS |
| `invoice-date-guard` | PASS |
| `demo-isolation` | PASS |
| `free-core` | PASS |
| `billing-boundary` | PASS |
| `scope-boundaries` | PASS |
| `art-disclosure` | PASS |

## Cold first-read gate — PASS

A fresh desktop context opened the live root without prior storage. The first
screen says **“Find finished work you have not billed”**, identifies **“For
freelancers and tiny agencies with work spread across task, time, and invoice
tools”**, and presents **“Try it with sample data”** beside **“See a filled
sweep in one click.”** It therefore says what it does, for whom, and what to
click first in plain words. The action reaches the filled `/demo` sandbox.

## Successful independent evidence

- Clean install: `npm ci` passed with 0 audited vulnerabilities. There is no
  separate lint script. `npm test` (22 tests), `npx tsc --noEmit`,
  `npm run build`, and `git diff --check` passed. The exact production build
  emits 30,782 B JS (11.03 KB gzip) and 14,715 B CSS (4.07 KB gzip), well under
  the static budgets; `dist/` exists.
- Live identity matches the candidate build: live and local SHA-256 are
  `f8a6e31acfa4523665e93ddfecf4f47268852f116aea709e4d550b43365477e9` for
  `index-BBJxQqFl.js`,
  `359b8da47eee950c391fa705cac4a6f367ce54d8489a7f1e8a56e8c76dd5c8b7` for
  `index-BQM5jbYv.css`, and
  `3a378f64ab71d6b7954269fc57fc376ebd3028e29a8f8fd758dfb655d7dbb14b` for
  `sw.js`.
- `/opt/fleet/lib/verify-url.sh https://unbilled-work-sweep.sociobot.in`
  passed: HTTPS 200 in 925 ms, no console/page errors, title, `lang=en`, one
  h1, main landmark, labelled buttons, and image alt text. All live routes
  (`/`, `/demo`, `/privacy`, `/terms`, and the in-app not-found route) had one
  `h1` and one `main`; only `/demo` had the heading-order finding. Axe found no
  serious or critical violations. Keyboard traversal reached the skip link
  first and showed a 4px `#0969da` focus outline.
- Live 390×844 `/demo` had zero horizontal overflow. Reduced motion yields
  `0.00001s` animation/transition durations. The live mobile Lighthouse run
  scored Performance 90, Accessibility 98, Best Practices 100, and SEO 100;
  LCP 1,154 ms, CLS 0, TBT 404 ms. Report:
  `/tmp/unbilled-v4-lighthouse.json`.
- Normal live flows work: CSV imports calculate hours × rate, date-safe
  invoice suggestions appear, a review can link/keep an item, and checklist
  download is `invoice-draft-checklist.csv`. Invalid one-column and unclosed-
  quote CSV files show useful errors and then accept a valid replacement.
  A malformed valid-JSON workspace backup is rejected with the documented
  error; the prior workspace remains visible and survives reload with no page
  errors.
- Privacy: a live demo review plus CSV export made requests only to
  `https://unbilled-work-sweep.sociobot.in` (HTML, JS, CSS); no imported/demo
  row left the origin. The live CSP permits only same-origin plus
  `https://api.sociobot.in` for explicit license verification. No sign-in or
  other identity provider is present.
- PWA: a fresh live `/demo` received an active service-worker controller with
  no waiting worker. Its named cache contains the shell and exact hashed JS/CSS;
  after `context.setOffline(true)`, reload retained the `$5,840.00` demo queue
  with no errors. `sw.js` is `no-cache`; hashed assets are immutable for one
  year; HTML is revalidated every 30 seconds. HTTPS includes HSTS, nosniff,
  strict-origin referrer policy, permissions policy, and the restrictive CSP.
- Billing endpoint allowance: 40 simultaneous invalid-license verification
  requests from one client received **30×200 and 10×429**. Each observed 429
  included `Retry-After: 4`; the observed burst allowance is 30 successful
  requests. No embedded card fields or payment iframe exists.

## Scope and handoff

No product code was changed during this verification. Repair the three High
findings, add claim/regression coverage for reversing a link and for the
semantic/touch requirements, then rerun clean claim, PWA, live accessibility,
and mobile checks.
