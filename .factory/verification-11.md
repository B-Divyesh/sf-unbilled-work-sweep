# Independent verification 11 — FAIL

Date: 2026-08-29

Work order: `unbilled-work-sweep-verify-11`

Candidate: `b26626dad2b3ab57dc5d3fcff25f66525708f155`

Live URL: <https://unbilled-work-sweep.sociobot.in>

Artifact: offline-first PWA

## Decision

**FAIL.** The free reconciliation workflow, all 31 registered claims, the
production build, deployment identity, accessibility checks, privacy boundary,
offline reload, and API rate limit pass. One paid-license contract defect is
release-blocking: automatic verification of an invalid, expired, or revoked
license silently removes paid access without showing the required “license no
longer active” notice.

No product code was changed during verification.

## First-read and one-click demo gate — PASS

A cold browser opened the live root with HTTP 200 and no stored state.

- What it does: **“Find finished work you have not billed.”**
- For whom: **“For freelancers and tiny agencies with work spread across
  task, time, and invoice tools.”**
- First action: **Try it with sample data**, beside “See a filled review in one
  click.”

One click opened `/?demo=1`. At 390 × 844, the first view contained the
persistent “Demo — sample data, nothing is saved” banner, the `$5,840.00`
total, a real work row, its proposed invoice, and **Link invoice** / **Keep
unbilled** actions. The sample contained six source rows, two suggestions, and
four queue rows as stated.

Evidence: `evidence/verification-11/live-cold-desktop.png`,
`evidence/verification-11/live-demo-desktop.png`, and
`evidence/verification-11/live-demo-mobile-390.png`.

## Required claims — PASS (31/31)

`.factory/claims.json` exists and contains 31 entries. After `npm ci`, every
exact `test` command was run separately, in manifest order, against the shipped
demo entry point. Every command passed:

`csv-import`, `multi-source-import`, `demo-sample-ready`, `header-mapping`,
`queue-filter`, `missing-status`, `validated-import`, `review-matches`,
`work-replacement`, `invoice-replacement`, `csv-export`, `local-only`,
`network-boundary`, `offline-reload`, `manifest-mime`, `runtime-asset-cache`,
`local-persistence`, `workspace-backup`, `paid-license`, `snapshot-history`,
`hours-times-rate`, `invoice-date-guard`, `match-normalization`,
`demo-isolation`, `demo-session-removal`, `clear-workspace`, `license-storage`,
`free-core`, `billing-boundary`, `scope-boundaries`, and `art-disclosure`.

The live landing, demo, privacy, terms, README, and demo contract were checked
against the registry. No additional unregistered visitor-facing capability
claim was found. The failing automatic-license notice is a requirement of the
paid-unlock acceptance contract; the narrower registered license tests cover
manual token entry and correctly pass.

## Clean install, tests, type check, and build — PASS

- Checkout was clean at the requested SHA before QA; only verifier evidence and
  reports are added by this work order.
- `npm ci`: passed; 24 packages installed, 0 vulnerabilities.
- `npm test`: **44/44 passed** in 1.4 minutes.
- `npm run build`: passed. This runs `tsc --noEmit` and `vite build` and produced
  `dist/index.html`.
- There is no lint script in `package.json`.
- `npm run check:checkout`: passed; the Sociobot checkout reached
  `checkout.dodopayments.com` with HTTP 200 and no purchase was attempted.

Production payloads are within the static/PWA limits:

| Asset | Raw | Gzip |
|---|---:|---:|
| JavaScript | 40.07 KB | 13.64 KB |
| CSS | 17.75 KB | 4.58 KB |
| Mobile hero WebP | 30.61 KB | n/a |

Fresh mobile Lighthouse: **97 Performance / 100 Accessibility / 100 Best
Practices / 100 SEO**; FCP 0.9 s, LCP 1.3 s, TBT 180 ms, CLS 0, 51 KiB total
transfer. Evidence: `evidence/verification-11/lighthouse-live.json`.

## End-to-end and error recovery — PASS

An independent production-preview flow imported a leap-day row with a quoted
comma and `$0.01`, a `2.5 × $100` hourly row, an already-billed row, and an
unfinished row. The queue correctly contained only two eligible items totaling
`$250.01`. An invoice dated before the work produced no suggestion.

Importing an impossible `2026-02-30` date produced the row-numbered recovery
message and preserved both saved rows and `$250.01`. A corrected `8/29/2026`
row then imported successfully and raised the total to `$260.01`, without
console or page errors. Evidence:
`evidence/verification-11/local-boundary-recovery.png`.

The live demo independently linked an invoice (`$5,840` to `$3,640`), operated
the same action with keyboard Space, and downloaded
`invoice-draft-checklist.csv`.

## Accessibility, responsive behavior, and navigation — PASS

- Independent Axe scans found **zero violations** (and therefore zero serious
  or critical findings) on `/`, `/?demo=1`, `/privacy`, `/terms`, a missing SPA
  route, `/404.html`, and `/offline.html`.
- The supplied `verify-url.sh` passed live: title, `lang=en`, one `h1`, `main`,
  image alt text, button names, and console checks. Evidence:
  `evidence/verification-11/verify-live/`.
- Keyboard-only: the first stable Tab reached **Skip to main content** with a
  4 px blue outline; Enter set `#main`; the next Tab entered main content.
  **Link invoice** was reached by Tab and activated by Space.
- At 390 px there was no horizontal overflow. Checkbox labels provide 44 × 44
  px hit areas; other visible controls meet the target size. The complete suite
  also passed the 200% text-size check.
- With reduced motion, scrolling became `auto` and the largest animation and
  transition duration was 0.01 ms.
- Every HTTP link discovered across landing, demo, privacy, terms, and 404
  routes returned 200. Mail links were excluded; checkout was covered by the
  dedicated checkout check.

## Privacy, security, PWA, and deployment — PASS

The cold landing and a live demo flow through match review and checklist export
made only same-origin requests. There were no analytics, third-party fonts,
unexpected requests, console errors, or page errors. License verification was
the sole observed off-origin request and went to the documented
`api.sociobot.in` endpoint.

Live security headers include HSTS, `nosniff`, strict-origin referrer policy,
the restrictive camera/microphone/geolocation Permissions Policy, and a CSP
whose `connect-src` permits only self and `https://api.sociobot.in` and whose
`frame-ancestors` is `none`. HTML revalidates after 30 seconds; hashed assets
cache for one year immutable; `sw.js` is `no-cache`; the manifest is JSON and
caches for one hour.

Chromium parsed the manifest with zero errors. The active service worker
controlled the page and used cache `unbilled-work-sweep-4298d5bb7443`. A live
update check left no waiting or installing worker and kept the update notice
hidden. After switching the browser offline, `/?demo=1` reloaded with the demo
banner, `$5,840.00` sample, and offline notice; there were no failed requests or
errors.

Local/live SHA-256 values were identical:

| Artifact | SHA-256 |
|---|---|
| `index.html` | `269b7417cf35db39ead5e54e889a0f90c775314ae278df5bcb30ac0552696ab0` |
| `assets/index-BJk-RwTi.js` | `df1834ce5c70163685398469b8c87c7734f96ebd6d048cce63581d628c7f43a4` |
| `assets/index-BbIBj4Uq.css` | `8ebd189d50e01c4c3eaf996b0197468462b2dc39f06d35ad5aad34db81fdca44` |
| `sw.js` | `1e583e3e75ed4175b590d715aa9bd2c03725d4d2091fca15bb4d38ff69174687` |
| `manifest.webmanifest` | `9df996f16ae40f2778418d3c3dd3cb0bb0c82a0079993ca3224bf59e337f4e1d` |
| `404.html` | `565b73453ac4c9d546b3881b30d64d7ac2e48e6831c81248eba460e494e0ca18` |
| `offline.html` | `96fbf0526567bf8d1fafdbe04c53b37e44be52ea15ea23dcf940f2f20e3a1437` |

The only commits after runtime source commit `051b87d9…` add factory reports and
evidence. Therefore these byte matches establish that the live runtime is the
runtime represented by candidate `b26626d…`.

The Sociobot verification endpoint allowed **30** rapid invalid-license
requests from one client. Requests **31–40** returned **429**, with
`Retry-After: 2` or `3` and the correct live-origin CORS header. The observed
allowance is 30 requests per burst window. No sign-in or product backend exists,
so sign-in authority, backend concurrency, and server persistence checks do not
apply.

## Findings by severity

### Medium — release-blocking: automatic invalid-license checks give no notice

The paid-unlock contract requires a quiet “license no longer active” notice
when verification returns `valid: false`.

Two fresh live reproductions failed that requirement:

1. Open `/?license=verify11-return-invalid`. The app strips the token from the
   URL, calls the real Sociobot verification endpoint, stores
   `{"valid":false,...}`, and shows the locked **Buy review history — $19**
   state. The required notice count is zero.
2. Seed a cached `valid:true` verdict older than one day, then load `/`. The
   background check receives `valid:false`, removes the active paid state, and
   again shows no notice.

Cause: `initLicense()` calls `verifyLicense(token)` with its default
`announce = false`. Manual paste uses `verifyLicense(token, true)`, so the
registered test covers only the path that does announce.

Impact: a buyer returning with an invalid token, or a user whose license is
expired/revoked at daily revalidation, loses review history access with no
explanation or recovery cue. Free imports and exports remain available and no
data is lost.

- **Critical:** none.
- **High:** none.
- **Medium:** one, above.
- **Low:** none.

## Release recommendation

Do not release candidate `b26626dad2b3ab57dc5d3fcff25f66525708f155` as
accepted. Show the inactive-license notice for checkout-return and stale cached
verification failures, add claim coverage for both automatic paths, then rerun
verification. The remainder of the candidate is release-ready.
