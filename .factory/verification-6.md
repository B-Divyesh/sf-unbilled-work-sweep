# Independent verification 6 — FAIL

Date: 2026-08-29

Work order: `unbilled-work-sweep-verify-6`

Candidate: `aed37ad2bb0d14b048fa23a31fcf697a59e84f9a`

Live URL: <https://unbilled-work-sweep.sociobot.in>

## Decision

**FAIL — do not release.** The deployed static files match the candidate, the
first-read and one-click-demo gates pass, all 17 declared claim commands pass,
and the product is fast, accessible, private during its core workflow, and
usable offline. A fresh boundary test nevertheless disproves the core
`invoice-date-guard` claim: dates are compared as raw strings. An invoice from
September is suggested for work from October when the CSV uses the common
`M/D/YYYY` format. Accepting that suggestion removes still-unbilled work from
the attention queue.

The claims registry also omits several concrete promises in the README and
privacy page. The attached claims contract makes any unlisted claim a failing
review finding.

No product code was changed.

## Release-blocking findings

### High — date matching can suggest an invoice issued before the work

Fresh live reproduction in a new Chromium context:

```csv
date,client,project,description,status,amount
10/1/2026,Acme,Launch,October work,completed,100
```

```csv
invoice date,invoice number,client,project
9/1/2026,INV-OLD,Acme,Launch
```

After both imports completed, the live work row showed:

```text
Possible invoice: INV-OLD · Acme / Launch
Link invoice
```

Expected: no suggestion, because 1 September 2026 precedes 1 October 2026.
Observed: the older invoice is suggested. The implementation tests
`invoice.date >= work.date` as strings. It also accepts `not-a-date` as a
required date value. The declared claim test passes only because its fixture
uses lexically sortable ISO dates.

This is release-blocking for the core job: a user can approve the plausible
but chronologically impossible match and remove genuinely unbilled work from
the queue. Parse and validate supported date formats before storing rows,
compare actual date values, explain accepted formats near mapping, and extend
`@claim:invoice-date-guard` with at least this locale-formatted false-positive
case plus an after-work cross-year case.

### Medium — user-facing claims are missing from `.factory/claims.json`

The registry has exactly one tagged test for each of its 17 entries, but it
does not list every concrete promise a visitor is asked to rely on. Examples:

- README: “Header names do not need to match these names exactly.”
- README: “If status is missing, the row is treated as completed.”
- Privacy: demo data “is removed when that browser session ends.”
- Privacy: “Use ‘Clear imported data’ to remove the current workspace.”
- Privacy: the app “stores only your license token and its latest verification
  result.”

Some behavior was incidentally exercised elsewhere, and the clear/Undo flow
passed a manual live check, but none of these promises is an entry with its one
required `@claim:<id>` test. Add the claims and focused sandbox tests, or remove
the promises. This is release-blocking under the supplied claims contract.

## Mandatory first-read gate — PASS

A cold 1440×900 live visit with empty browser storage showed:

- What it does: **“Find finished work you have not billed.”**
- Who it is for: **“For freelancers and tiny agencies with work spread across
  task, time, and invoice tools.”**
- What to click first: **“Try it with sample data,”** beside **“See a filled
  sweep in one click.”**

The primary action was in the first viewport. Activating it with Tab and Enter
opened `/demo` and immediately showed the persistent **“Demo — sample data,
nothing is saved”** banner, four queue rows, and `$5,840.00`. The same content,
action, outcome, and three product facts fit in the initial 390×844 viewport.
Evidence: `/tmp/unbilled-first-read.png` and
`/tmp/unbilled-live-mobile-root.png`.

## Mandatory claims gate

`.factory/claims.json` exists. After `npm ci`, every listed command was run
individually and exactly from the clean candidate checkout. All passed:

| Claim | Result |
|---|---|
| `csv-import` | PASS |
| `validated-import` | PASS |
| `review-matches` | PASS |
| `invoice-replacement` | PASS |
| `csv-export` | PASS |
| `local-only` | PASS |
| `offline-reload` | PASS |
| `local-persistence` | PASS |
| `workspace-backup` | PASS |
| `paid-license` | PASS |
| `hours-times-rate` | PASS |
| `invoice-date-guard` | PASS for its ISO-only fixture; live boundary case fails |
| `demo-isolation` | PASS |
| `free-core` | PASS |
| `billing-boundary` | PASS |
| `scope-boundaries` | PASS |
| `art-disclosure` | PASS |

Per-claim logs: `/tmp/unbilled-claims.sX64O8/`. An inventory check found one
and only one matching tag for each registered claim, with no extra claim tags.

## Clean local verification

- Initial checkout was clean at the exact requested candidate.
- `npm ci`: PASS; 24 packages installed, 0 vulnerabilities.
- `npm test`: PASS; 27/27 Chromium tests in 52.7 seconds.
- `npx tsc --noEmit`: PASS. There is no separate lint script.
- `npm run build`: PASS; exact production output created `dist/index.html`.
- `npm audit --omit=dev`: PASS; 0 vulnerabilities.
- `git diff --check`: PASS.
- Claim inventory: PASS; exactly one tag per registered claim.
- Build sizes: JS 33,886 bytes / 11.97 KB gzip; CSS 15,815 bytes /
  4.24 KB gzip; mobile hero 30,612 bytes; largest hero 80,150 bytes.

Combined logs: `/tmp/unbilled-qa.gNtfMZ/`.

## Live end-to-end exercise

Successful paths, all in fresh browser contexts:

- Demo link reduced the queue from `$5,840.00` to `$3,640.00`; keyboard Space
  on **Unlink invoice** restored `$5,840.00`.
- Checklist download was named `invoice-draft-checklist.csv`, had the declared
  seven-column header, and contained four data rows.
- A real representative import handled a quoted comma, `$1,000.00`, and a
  missing amount calculated from 2 hours × $125. It excluded an in-progress
  row and an already-billed row, yielding `$1,250.00`.
- A row with all required cells blank and a non-numeric amount produced the
  row-numbered error and preserved `$1,250.00`. An unclosed quoted field also
  produced a clear error without replacing data.
- With ISO dates, the same-name invoice after the work was suggested, an older
  invoice was excluded, the linked total became `$250.00`, and it remained
  `$250.00` after reload.
- Clear imported data required confirmation, showed **Undo**, and Undo restored
  the `$5,840.00` demo.
- Back and forward navigation restored the right route title and focused h1.
- All discovered HTTP links returned 2xx or the expected checkout 303; mailto
  links were exempt. Route-specific titles, descriptions, and canonicals were
  correct.

The locale-date failure above was found by extending these cases beyond the
ISO-only repository fixture.

## Accessibility, mobile, and browser health

- Axe found zero serious/critical violations on `/`, `/demo`, `/privacy`,
  `/terms`, and the in-app missing route.
- Each route had `lang=en`, one h1, one main, ordered headings, a route-specific
  title, and no console or page errors.
- `/opt/fleet/lib/verify-url.sh` returned HTTP 200 in 652 ms with no errors,
  one h1, one main, labelled buttons, and no missing alt text. Evidence:
  `/tmp/unbilled-verify-url.RS9DAe/`.
- Keyboard-only Tab/Enter reached the one-click demo. Tab reached all three
  hidden file inputs, and their visible labels received a 4 px blue focus
  outline.
- At 390×844, there was no horizontal overflow. All 25 effective interactive
  targets measured at least 44×44 CSS px, including the four checkbox labels.
- With `prefers-reduced-motion: reduce`, the maximum animation and transition
  duration was 0.00001 seconds and smooth scrolling was disabled.
- The repository's live-equivalent 200% text regression passed. The live CSP
  correctly blocked an attempted inline test-style injection.
- Screenshots: `/tmp/unbilled-live-mobile-root.png` and
  `/tmp/unbilled-live-mobile-demo.png`.

## Privacy, headers, billing, and limits

- Whole demo and real import/review/export flows made no off-origin requests.
- Opening `/demo` directly created only `demo:unbilled-work-sweep` in
  `sessionStorage`; it created no localStorage keys and no IndexedDB database.
- Explicit invalid-license verification made the one documented request to
  `api.sociobot.in`, returned 200 with `valid:false`, stored only the license
  and cached verdict keys, and showed the locked-state notice without errors.
- The root response includes HSTS, `nosniff`, strict-origin referrer policy,
  permissions policy, and a restrictive CSP. HTML revalidates after 30 seconds;
  hashed JS/CSS are immutable for one year; `sw.js` is `no-cache`.
- The real checkout endpoint returned HTTP 303 to a Dodo-hosted session and
  HTTP 200 after following it. No purchase was attempted.
- A rapid invalid-license burst observed an allowance of **30 requests**. The
  31st request returned **429**, as did the next four, all with
  **`Retry-After: 4`**. Evidence: `/tmp/unbilled-rate-limit.json`.
- Sign-in is not present, so the Entra tenant requirement is not applicable.
  The product has no product-owned backend, so backend concurrency and health
  identity checks are not applicable.

## PWA and performance

- The live service worker controlled `/demo`; cache
  `unbilled-work-sweep-01093d30bc6c` contained all shell routes and the exact
  hashed JS/CSS.
- `registration.update()` completed with the existing worker active, no
  waiting worker, and no false update notice.
- After the browser went offline, `/demo` reloaded with its h1, four-row sample,
  and `$5,840.00` total intact, with no console/page errors. Evidence:
  `/tmp/unbilled-live-pwa.json` and `/tmp/unbilled-live-offline.png`.
- Chrome parsed the manifest with no errors and reported no installability
  errors despite the host's generic manifest MIME type.
- Live mobile Lighthouse on `/demo`: Performance 99, Accessibility 100, Best
  Practices 100, SEO 100; FCP 1.0 s, LCP 1.2 s, CLS 0, TBT 120 ms, Speed Index
  1.0 s. Evidence: `/tmp/unbilled-live-lighthouse.json`.

## Candidate/deployment identity

The live deployment matches the candidate's production build byte-for-byte:

| Artifact | SHA-256 |
|---|---|
| `index.html` | `abb150235bb003c3276ea4dbaaf7ce89c17dc8a02dd0294d63a859a87ff75451` |
| `assets/index-BPejfRVj.js` | `d8ef16631f7564ab450b962a1ea771f7ee6192094e67ed8ed2cea86372e7c318` |
| `assets/index-D8RJjd3U.css` | `b8186638ad1dc00d14915184501c952fe133c1fc69fb554748e29623ee5e39cc` |
| `sw.js` | `b670648c55f1cedc1aea7961fd20bc2ab32db79f74f3bb567a83633a054f8cb8` |
| `manifest.webmanifest` | `9df996f16ae40f2778418d3c3dd3cb0bb0c82a0079993ca3224bf59e337f4e1d` |

The previously reported checkout-only deployment failure is fixed. The fresh
FAIL is caused by candidate product behavior and claims coverage, not by a
stale deployment.
