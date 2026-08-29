# Independent verification 7 — PASS

Date: 2026-08-29

Work order: `unbilled-work-sweep-verify-7`

Candidate: `3b9bb552828f022dfadbf9b4712dd898c9e4855a`

Live URL: <https://unbilled-work-sweep.sociobot.in>

## Decision

**PASS — release candidate accepted.** A clean install and independent live
exercise found no release-blocking defect. The live deployment matches the
candidate byte-for-byte. The prior date-matching and missing-claim failures are
fixed, and the previously reported checkout deployment failure remains fixed.

No product code was changed.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low, non-blocking copy polish: the 404 heading, “This page missed the invoice
  stack,” and the hero caption use the product's paper-trail metaphor. Their
  adjacent copy states the error and next action plainly, so they did not make
  the first-read or recovery path ambiguous, but a future copy pass could make
  these two lines fully literal.

## Mandatory first-read gate — PASS

A cold 1440×900 live visit with a fresh browser context showed, in the first
viewport:

- What it does: **“Find finished work you have not billed.”**
- Who it is for: **“For freelancers and tiny agencies with work spread across
  task, time, and invoice tools.”**
- What to click first: **“Try it with sample data,”** beside **“See a filled
  sweep in one click.”**

The same content and primary action fit in the first 390×844 viewport. Keyboard
activation opened `/demo` in one click, focused its h1, and immediately showed
the persistent **“Demo — sample data, nothing is saved”** banner, four queue
rows, and `$5,840.00`. Evidence:
`/tmp/unbilled-first-read-desktop.png`,
`/tmp/unbilled-qa7-mobile-root.png`, and
`/tmp/unbilled-qa7-desktop-demo.png`.

## Mandatory claims gate — PASS

`.factory/claims.json` exists and contains 22 claims. After `npm ci`, every
listed command was run separately and exactly against the repository's demo
entry point. All passed:

| Claim | Result |
|---|---|
| `csv-import` | PASS |
| `header-mapping` | PASS |
| `missing-status` | PASS |
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
| `invoice-date-guard` | PASS |
| `demo-isolation` | PASS |
| `demo-session-removal` | PASS |
| `clear-workspace` | PASS |
| `license-storage` | PASS |
| `free-core` | PASS |
| `billing-boundary` | PASS |
| `scope-boundaries` | PASS |
| `art-disclosure` | PASS |

An inventory audit found exactly one `@claim:<id>` tag for each registry entry
and no undeclared tags. Landing, README, privacy, terms, and demo promises were
cross-checked against the registry and their focused or full-flow coverage.

## Clean local verification

- Initial checkout: clean, on the exact candidate commit.
- `npm ci`: PASS; 24 packages installed, 0 vulnerabilities.
- `npm test`: PASS; 33/33 Chromium 1.58.2 tests in 1.1 minutes.
- `npx tsc --noEmit`: PASS. There is no separate lint script.
- `npm run build`: PASS; exact production output created `dist/index.html`.
- `npm audit --omit=dev`: PASS; 0 vulnerabilities.
- `git diff --check`: PASS.
- JSON parsing for the brief, claims, web manifest, and deployment config:
  PASS.
- Build sizes: JavaScript 34,588 bytes / 12.23 KB gzip; CSS 15,795 bytes /
  4.24 KB gzip; no font payload; mobile hero 30,612 bytes; largest hero 80,150
  bytes. All static-product budgets pass.

## Fresh live end-to-end exercise

All scenarios used new Chromium contexts against the live URL:

- The sample exported `invoice-draft-checklist.csv` with the declared
  seven-column header and four data rows.
- Linking the first suggested invoice changed the total from `$5,840.00` to
  `$3,640.00`. The decision survived reload. Keyboard Space on **Unlink
  invoice** restored `$5,840.00`.
- **Start for real** removed all `demo:` session keys and opened an empty real
  workspace.
- A representative work CSV handled quoted commas, `$1,000.00`, and a missing
  amount computed from 2 hours × $125. It excluded one in-progress and one
  already-billed row, leaving two rows totalling `$1,250.00`.
- A row with blank required cells and `amount=not-a-number` produced a
  row-numbered alert and retained the `$1,250.00` workspace.
- An unclosed quoted field produced a specific recovery message and retained
  the workspace. A corrected file imported immediately afterward and displayed
  the `$0.01` boundary value.
- The prior regression was reproduced with work dated `10/1/2026` and invoice
  `INV-OLD` dated `9/1/2026`: the older invoice was not suggested. An invoice
  dated `1/1/2026` was suggested for work dated `12/31/2025`. An impossible
  `2/30/2026` invoice date was rejected without replacing the `$300.00` state.
- Every discovered HTTP link returned 2xx or the expected checkout 303.
  `mailto:` links were exempt. The checkout redirect reached a Dodo-hosted
  session; no purchase was attempted.

## Accessibility, keyboard, mobile, and browser health

- Fresh Axe scans found zero serious/critical violations and zero violations
  of any impact on `/`, `/demo`, `/privacy`, `/terms`, the in-app missing route,
  `/offline.html`, and `/404.html`.
- Each route had `lang=en`, one h1, one main landmark, ordered headings,
  route-specific title/description/canonical metadata, and no console or page
  errors.
- `/opt/fleet/lib/verify-url.sh` returned HTTP 200 in 853 ms with no errors,
  one h1, one main, labelled buttons, and complete alt text. Evidence:
  `/tmp/unbilled-qa7-verify-url.7VzQRw/`.
- The first Tab target was the skip link with a computed 4 px blue focus ring.
  Activating it set `#main`; the next Tab reached **Try it with sample data**.
  Client-side route navigation focused the destination h1.
- At 390×844, root and demo had zero horizontal overflow. All 25 effective
  interactive hit areas measured at least 44×44 CSS px. The primary demo action
  remained above the fold. Evidence: `/tmp/unbilled-qa7-mobile-demo.png`.
- Under `prefers-reduced-motion: reduce`, maximum animation and transition
  duration was 0.01 ms and document scrolling was `auto`.

## Privacy, headers, caching, billing, and limits

- Cold load, the complete demo review/export flow, real imports, invalid-input
  recovery, and date checks made no off-origin requests.
- Explicit license verification made exactly one expected request to
  `api.sociobot.in`. An invalid response stored only
  `sb_license:unbilled-work-sweep` and
  `sb_license_verdict:unbilled-work-sweep`; no imported row left the origin.
- The live root sends HSTS, `nosniff`, strict-origin referrer policy,
  permissions policy, and the restrictive documented CSP. HTML revalidates
  after 30 seconds, hashed assets cache immutably for one year, and `sw.js` is
  `no-cache`.
- The manifest is served as `application/octet-stream`, but Chromium parsed it
  with zero manifest errors and reported zero installability errors.
- A fresh rapid invalid-license sequence observed a **30-request allowance**.
  Request 31 and the next two returned **429** with **`Retry-After: 4`** and the
  correct live-origin CORS header.
- There is no sign-in surface, product-owned backend, package, or CLI;
  Entra identity, backend concurrency/health, and consumer-package checks are
  not applicable.

## PWA and performance

- The live service worker controlled `/demo`; active cache
  `unbilled-work-sweep-b7bba19b90e4` held the current shell.
- `registration.update()` completed with the existing worker active, no
  waiting worker, and no false update notice. The repository regression also
  verifies that the update action messages only an actual waiting worker.
- After switching the context offline, `/demo` reloaded with its h1, all four
  queue rows, `$5,840.00`, the offline notice, and no console/page errors.
- Fresh mobile Lighthouse on `/demo`: Performance 95, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.992 s, LCP 1.096 s, CLS 0, TBT 254 ms, Speed
  Index 0.992 s, transferred bytes 33,919. Evidence:
  `/tmp/unbilled-qa7-lighthouse.json`.

## Candidate/deployment identity

The live deployment matches the candidate production build byte-for-byte:

| Artifact | SHA-256 |
|---|---|
| `index.html` | `c0f12973e6b97ff064c9227f16d43be40df0484bb64a9c909073e9df6fb3b241` |
| `assets/index-CYzmzLcx.js` | `eb41174577773edf3cf9d1022375922de94213e210440b3dd964b746731aafe7` |
| `assets/index-D8E-6dgc.css` | `6fd7e427250eeda4ed29d039498fa07e065dd654486c3024415326da55d79620` |
| `sw.js` | `04a65d86da86c589231f9165f61a737cf72c74fe432c7af7b1904eb5d699439b` |
| `manifest.webmanifest` | `9df996f16ae40f2778418d3c3dd3cb0bb0c82a0079993ca3224bf59e337f4e1d` |

Downloaded identity evidence: `/tmp/unbilled-qa7-identity.zX9z2j/`.
