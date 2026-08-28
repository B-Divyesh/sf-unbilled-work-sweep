# Independent verification 3 — FAIL

Date: 2026-08-28  
Verifier work order: `unbilled-work-sweep-verify-3`  
Candidate commit: `003d25dd1620e54a1c2a7e18fb7c467c30c12ffa`  
Live URL: <https://unbilled-work-sweep.sociobot.in>

## Decision

**FAIL — do not release.** The deployed PWA, primary reconciliation flow, and
the declared test suite are substantially healthy. However, a malformed
workspace-backup file is accepted and permanently crashes the saved workspace
on reload. This fails the required invalid-input/recovery path for a product
that advertises workspace backup/restore. There is also an unlisted visitor
claim, which the claims contract explicitly makes a release-blocking finding.

## Cold first-read check — PASS

A fresh, unauthenticated desktop visit to the live root returned 200 with no
console or page errors. The first viewport said **“Find finished work you have
not billed”**, identified **“freelancers and tiny agencies with work spread
across task, time, and invoice tools”**, and put **“Try it with sample data”**
next to **“See a filled sweep in one click.”** It therefore answers what it
does, for whom, and what to click first in plain words. `/demo` is a one-click,
filled sample workspace with the persistent “Demo — sample data, nothing is
saved” banner, Reset demo, and Start for real controls.

## Release-blocking findings

### High — malformed workspace JSON is accepted, persisted, and bricks the workspace

On a new live browser context, I uploaded this syntactically valid but malformed
file through **Import a workspace backup**:

```json
{"work":[],"invoices":[],"decisions":null,"checked":{},"currency":"USD"}
```

The importer accepts it because its shallow validation treats `null` as an
object. Rendering then throws `Cannot convert undefined or null to object`.
After a reload, IndexedDB contains the accepted malformed state and the entire
app body is blank with the same uncaught page error. The in-app **Clear imported
data** action is no longer reachable; recovery requires manually clearing site
data. A user must instead receive a useful invalid-backup error and retain the
last valid workspace. Add coverage for malformed nested fields and no-persist
on rejection.

### High — an on-page provenance claim is absent from `.factory/claims.json`

The footer says **“Original generated collage; no stock art.”** This is a
visitor-facing claim but none of the 14 claim entries tests it. The claims
contract requires every claim-like sentence to have a demo-sandbox test, or to
be removed; it explicitly says an unlisted claim fails the review. Remove the
claim from visitor copy or add an appropriate verifiable provenance assertion.

## Required claims — PASS

From the clean candidate checkout, after `npm ci`, I ran every command listed
in `.factory/claims.json` individually against the Playwright demo entry point.
All 14 passed (the `set -e` sequence completed). The complete `npm test` run
also passed all 19 Chromium tests; `test-results/.last-run.json` records
`{"status":"passed","failedTests":[]}`. The one-to-one inventory check found
14 claim entries and exactly 14 tagged occurrences.

| Claim ID | Result |
|---|---|
| `csv-import` | PASS |
| `review-matches` | PASS |
| `csv-export` | PASS |
| `local-only` | PASS |
| `offline-reload` | PASS |
| `local-persistence` | PASS |
| `workspace-backup` | PASS (valid backup only) |
| `paid-license` | PASS |
| `hours-times-rate` | PASS |
| `invoice-date-guard` | PASS |
| `demo-isolation` | PASS |
| `free-core` | PASS |
| `billing-boundary` | PASS |
| `scope-boundaries` | PASS |

## Successful verification evidence

- Exact clean checkout was `003d25dd1620e54a1c2a7e18fb7c467c30c12ffa`.
  `npm ci` succeeded with 0 audited vulnerabilities. `npx tsc --noEmit` and
  `npm run build` passed. There is no separate lint script.
- Production output is `29,423` B JS (`10,620` B gzip) and `14,715` B CSS
  (`4,083` B gzip), both inside the static budgets. Hero assets are 80,150 B
  (1200px) and 30,612 B (720px).
- The fresh build matches production byte-for-byte: JS SHA-256
  `cfb1c2c60f5a6eaeb2700639f0a7505298abede5f8f1d718994b7ff55af10d5c`, CSS
  `359b8da47eee950c391fa705cac4a6f367ce54d8489a7f1e8a56e8c76dd5c8b7`, and
  `sw.js` `26cd16c8fc12014655ead7745cc9ba2dd1ed086481898da6587d8336fafb2c28`.
  Live serves the same hashed JS/CSS referenced by the candidate build.
- `verify-url.sh` passed locally (683 ms) and live (642 ms): 200, no browser
  errors, title, `lang=en`, exactly one h1, main landmark, labelled buttons,
  and no missing image alt text. Evidence directories:
  `/tmp/unbilled-v3.jLhdZ1` and `/tmp/unbilled-live-v3.lsPOYY`.
- The full Playwright suite includes Axe checks on `/`, `/demo`, `/privacy`,
  `/terms`, and the in-app 404; no serious or critical violations occurred.
  Keyboard testing confirmed the visible skip link is first focus and the
  primary demo/review/export controls are keyboard-operable. At 390×844,
  `/demo` had 0px horizontal overflow. Under reduced motion, observed animation
  and transition durations were `0.00001s`.
- Fresh local mobile Lighthouse output was Performance 95, Accessibility 100,
  Best Practices 100, SEO 100; LCP 1,636 ms, CLS 0, and TBT 252 ms. The full
  report was written to `/tmp/unbilled-v3-lighthouse.json`; Lighthouse emitted
  its known final tab-crash message only after writing the report.
- Fresh live PWA verification found an active service-worker controller, no
  waiting worker/update notice, and cached hashed JS and CSS. Offline reload of
  `/demo` rendered the `$5,840.00` queue without console/page errors.
- Privacy/network smoke testing the live demo, including a review and checklist
  action, saw only `https://unbilled-work-sweep.sociobot.in` requests. The
  license is the only configured external product endpoint. HTTPS responses
  include HSTS, `nosniff`, strict-origin referrer policy, permissions policy,
  CSP with only the Sociobot license origin in `connect-src`, immutable hashed
  asset caching, and `sw.js: no-cache`.
- Rate-limit test: 50 simultaneous harmless requests to
  `GET https://api.sociobot.in/api/v1/products/unbilled-work-sweep/verify?license=qa-verification-3-invalid`
  produced 30×200 and 20×429. Every 429 included `Retry-After: 4`; the first
  completion-order 429 was request 12, with enforcement reached at roughly 30
  successful requests in the burst. No sign-in or alternate identity provider
  is used.

## Scope checked

The normal path imports completed-work and invoice CSVs, calculates missing
amounts from hours × rate, excludes unfinished/already-billed work, offers a
reviewable date-safe invoice suggestion, links or keeps it only on user action,
and downloads a checklist. Valid JSON backup export/restore, demo isolation,
local persistence, paid-license mocking, invalid CSV errors, desktop/mobile,
offline reload, and service-worker update state all passed. No product code was
changed during verification.

## Required repair and re-verification

1. Strictly validate every workspace field and nested decision/check value
   before replacing or persisting state; reject malformed files with the
   existing plain-language recovery UI and preserve the previous workspace.
2. Add a regression covering the malformed backup above plus reload recovery.
3. Remove or properly test the unlisted footer provenance claim, then rerun all
   declared claim commands and a clean production verification.
