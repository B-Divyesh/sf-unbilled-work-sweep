# Independent verification 12 — PASS

Date: 2026-08-29  
Work order: `unbilled-work-sweep-verify-12`  
Candidate and checked-out commit: `c5fbc929a8ce01ed1a9a3adb301238b15ae4dd63`  
Live URL: <https://unbilled-work-sweep.sociobot.in>  
Artifact: local-first offline PWA

## Decision

**PASS.** The live deployment byte-matches the candidate production build and
the real CSV-reconciliation job works through import, review, recovery,
export, demo, offline reload, and the licensed-history boundary. No release
blocking defects were found. No product code was modified during this review.

## Required first checks

`.factory/claims.json` exists with 33 entries. After `npm ci` in this clean
checkout, I ran every listed command separately, in registry order, against
the Playwright demo/product entry point. All passed:

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

Cold live-page first read: **“Find finished work you have not billed”** tells
me it finds completed work awaiting invoices; **“For freelancers and tiny
agencies with work spread across task, time, and invoice tools”** identifies
the user; and the visible primary **“Try it with sample data”** link says
**“See a filled review in one click.”** The gate passes.

One click opened `/?demo=1`. At 390 x 844 it showed the persistent
“Demo — sample data, nothing is saved” banner, four actionable review rows,
two suggestions, and the `$5,840.00` total without horizontal overflow.

## Clean build and automated checks

- `npm ci` passed: 24 packages installed; npm reported 0 vulnerabilities.
- `npm test` passed: **46/46** Playwright tests in 1.5 minutes.
- `npm run build` passed. It runs `tsc --noEmit` then Vite and produced
  `dist/`.
- No separate lint script is defined; the TypeScript check is part of the
  production build.
- `npm run check:checkout` passed: a no-purchase request reached the hosted
  Dodo checkout with HTTP 200.

Production payloads are well inside the PWA budgets: JavaScript is 40.14 KB
raw / 13.67 KB gzip; CSS is 17.75 KB raw / 4.58 KB gzip; the mobile hero is
30.61 KB. Initial JavaScript is below both the 150 KB and 200 KB limits.

## Independent end-to-end evidence

On the live deployment, I imported a representative work CSV containing a
quoted description, a `$0.01` amount, a `2.5 x $100` hourly row, an already
billed row, and an unfinished row. Only the two eligible rows entered the
queue, totaling `$250.01`. An invoice before the work was not suggested; the
later invoice was suggested for both eligible rows. An impossible
`2026-02-30` row gave the row-numbered calendar-date recovery message and
left the `$250.01` state untouched. A corrected `3/1/2026` import recovered
cleanly and raised the total to `$260.01`. There were no browser console or
page errors and no off-origin requests during this flow.

The complete suite separately covers CSV mapping, source replacement,
duplicate handling, reviewed-match unlinking by keyboard, backup restore,
real-data persistence, paid review-history state, invalid/expired/revoked
license notices, export download, and clear-data behavior.

## Accessibility and responsive review

- Fresh live Axe scans at 390 px had **zero violations** (and zero serious or
  critical findings) on `/`, `/?demo=1`, `/privacy`, `/terms`, `/404.html`,
  and `/offline.html`.
- No `verify-url.sh` is present in this checkout, so I performed its stated
  title/`lang`/`main`/alt/console checks directly in Chromium instead.
- Every scanned route had its own expected title, one `h1`, and one `main`.
  No console or page errors occurred.
- Keyboard-only testing first focused **Skip to main content**. It had a
  visible `rgb(9, 105, 218) solid 4px` outline. The automated suite also
  exercised keyboard file controls, match actions, landmarks, 200% text, and
  the 390 px layout.
- At 390 px `scrollWidth` was exactly 390. Under reduced motion, scrolling
  was `auto` and the maximum observed transition/animation duration was
  0.00001 seconds.

## Privacy, security, PWA, and deployment identity

Cold landing, live demo, and the real-import/recovery flow made only
same-origin requests. There are no third-party fonts, analytics, or scripts.
The product's explicit checkout/verification boundary is
`https://api.sociobot.in`, as covered by the claim tests and checkout check.

The live root returned HSTS, `X-Content-Type-Options: nosniff`, strict-origin
referrer policy, restrictive camera/microphone/geolocation Permissions
Policy, and CSP limited to self plus `https://api.sociobot.in` for
connections. The root has a 30-second revalidation policy; hashed assets are
`max-age=31536000, immutable`; `sw.js` is `no-cache`; and the manifest is
served as `application/json` with one-hour caching.

Chromium showed an active, controlling service worker at `/`, with no waiting
or installing update. Calling `registration.update()` kept that expected
state and no update notice appeared. After the initial online visit, disabling
the network and reloading `/?demo=1` retained the demo banner and `$5,840.00`
total with no failed request.

The deployed and locally built artifacts have identical SHA-256 values:

| Artifact | SHA-256 |
|---|---|
| `index.html` | `7f7ae907fe11d5904d2e98966a9d98c47fb30bc7f2963791b3adf02314111268` |
| `assets/index-KRuB2ZDn.js` | `1a9075954081609948cfa531ebfb08e373aaf5feecfe798b2cc41a7fe57229ad` |
| `assets/index-BbIBj4Uq.css` | `8ebd189d50e01c4c3eaf996b0197468462b2dc39f06d35ad5aad34db81fdca44` |
| `sw.js` | `023251a7cfca86d869255e3ee89e2dbdf9d149335de195b41eba890e07162021` |
| `manifest.webmanifest` | `9df996f16ae40f2778418d3c3dd3cb0bb0c82a0079993ca3224bf59e337f4e1d` |
| `404.html` | `565b73453ac4c9d546b3881b30d64d7ac2e48e6831c81248eba460e494e0ca18` |
| `offline.html` | `96fbf0526567bf8d1fafdbe04c53b37e44be52ea15ea23dcf940f2f20e3a1437` |

This establishes that the live runtime is the production build of the
candidate, including its repaired license-notice behavior.

## Endpoint allowance

The only server-side product boundary is Sociobot checkout/license
verification. From one client, 30 rapid invalid-license verification requests
returned HTTP 200; requests 31 through 40 returned **429** with
`Retry-After: 4` and the live-origin CORS header. Observed allowance: **30
requests per burst window**. No application sign-in or product backend exists,
so Entra authority, backend concurrency, health, and server persistence checks
do not apply.

## Findings by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Release recommendation

Accept candidate `c5fbc929a8ce01ed1a9a3adb301238b15ae4dd63`.
