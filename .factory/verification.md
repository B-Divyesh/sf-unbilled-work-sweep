# Independent verification — FAIL

Date: 2026-08-28  
Verifier work order: `unbilled-work-sweep-verify-1`  
Candidate commit: `f1600d46b8f5314a0174898359520f97c1d23b48`  
Live URL: <https://unbilled-work-sweep.sociobot.in>

## Decision

**FAIL — do not release this candidate.** The implementation and deployed
assets are otherwise strong, but the PWA cache/update implementation does not
meet the required offline/update contract, and the required claims inventory is
incomplete.

## First read, cold live page

Pass. A fresh desktop browser load said **“Find finished work you have not
billed”**, named **“freelancers and tiny agencies with work spread across task,
time, and invoice tools”**, and presented one visible **“Try it with sample
data”** action with **“See a filled sweep in one click.”** The action opened the
filled `/demo` workspace. The live first load produced no console or page
errors. Screenshot: `/tmp/unbilled-live-cold-desktop.png`.

## Required claims suite

`.factory/claims.json` exists and contains eight entries. After `npm ci`, every
listed command passed against the product demo entry point:

| Claim | Command | Result |
|---|---|---|
| `csv-import` | `npm test -- --grep @claim:csv-import` | PASS |
| `review-matches` | `npm test -- --grep @claim:review-matches` | PASS |
| `csv-export` | `npm test -- --grep @claim:csv-export` | PASS |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS |
| `local-persistence` | `npm test -- --grep @claim:local-persistence` | PASS |
| `workspace-backup` | `npm test -- --grep @claim:workspace-backup` | PASS |
| `paid-license` | `npm test -- --grep @claim:paid-license` | PASS |

`npm test` then passed all 11 Playwright tests (including axe, routes,
keyboard, invalid CSV, and 390px coverage). Note that the existing offline
claim test makes an additional online reload before switching offline; that
does not exercise the failed first-visit case below.

## Release-blocking defects

### High — the PWA does not precache its executable app shell

`public/sw.js` caches HTML routes and images but omits the production hashed
`/assets/index-CkS5PyLJ.js` and `/assets/index-Eiz4hPlC.css` assets. A fresh
local production build was opened at `/demo`, `navigator.serviceWorker.ready`
was awaited, browser HTTP cache was cleared/disabled, network was switched
offline, and the page was reloaded. The result had neither the demo heading nor
queue and reported `Failed to load resource: net::ERR_FAILED` for the uncached
app asset. The cache inventory confirmed only the twelve `SHELL` URLs, none of
the JS/CSS assets.

This violates the PWA requirement to precache the app shell and makes the
public “Works offline after your first visit” promise dependent on browser HTTP
cache behaviour rather than the service worker. Add the built JS/CSS assets to
a versioned precache and test the first offline reload without an intervening
online reload/cache fallback.

### High — required claim inventory is incomplete

The claims contract requires every visitor-reliant statement on the landing
page and README to have a testable entry in `.factory/claims.json`. The eight
entries omit, among others: “It does not send invoices”, “It does not track
time, calculate tax, or change your source files”, “Core imports and checklist
exports stay free”, “One payment; no subscription”, the specific automatic
hours × rate behaviour, the invoice-before-work-date guard, the stated
separate demo storage, and the “no embedded payment provider” promise.

Either add observable sandbox tests for each such statement or remove/rewrite
the statements. In particular, the existing `local-only` test imports a real
row and toggles a checkbox; despite its title it does not exercise a demo
review action as its claim description says.

### Medium — false PWA update notice on first install

In a fresh live browser context, `/demo` showed “An updated version is ready”
while service-worker registration reported `active: "activated"`, a controller
of `"activated"`, and no `waiting` worker. The initial installation races with
`clientsClaim`, so the `updatefound` handler treats it as an update. The
“Use update” action also posts `SKIP_WAITING` to
`navigator.serviceWorker.controller` (the active worker), rather than the
waiting worker. Show this notice only when `registration.waiting` exists and
send the message to that waiting worker.

## Successful verification evidence

- Clean checkout was exactly `f1600d46b8f5314a0174898359520f97c1d23b48`.
- `npm ci` completed with 0 audit vulnerabilities; `npm run build` passed.
  Build output: JS 28.82 KB / 10.49 KB gzip and CSS 14.69 KB / 4.06 KB gzip.
- The live deployment matches the candidate byte-for-byte for
  `index-CkS5PyLJ.js`, `index-Eiz4hPlC.css`, and `sw.js` (`cmp` exit 0).
- `verify-url.sh` on the live URL: HTTP 200, 651 ms load, no console/page
  errors, `lang=en`, one `<h1>`, a `<main>`, and no images missing `alt`.
- Axe found no serious or critical violations on `/`, `/demo`, `/privacy`,
  `/terms`, and the in-app 404. Keyboard smoke test passed: the skip link is
  first focus and enters the main landmark. Focus styling is visible.
- Desktop flow: demo loads, keeps a suggested match unlinked, checks an item,
  and downloads `invoice-draft-checklist.csv`. Real IndexedDB data persisted
  through a demo visit and `Start for real`; demo storage was cleared.
- Boundary/recovery: unclosed quoted CSV produced “The CSV has an unclosed
  quoted field. Fix that row and import it again.” An invoice dated before its
  work item produced zero suggestions and left the $100.00 queue intact.
- Mobile: 390×844 demo had 0px horizontal overflow and its export control was
  visible. `prefers-reduced-motion: reduce` reduced hero animation and button
  transitions to `0.00001s`.
- Local mobile Lighthouse: Performance 96, Accessibility 100, Best Practices
  100, SEO 100; LCP 1653 ms, CLS 0, TBT 237 ms. The tool emitted a final
  browser-tab crash after writing the complete JSON report, but the report had
  no run warnings and contains these scores.
- Live response policies: HTTPS, HSTS, `nosniff`, strict-origin referrer
  policy, restrictive CSP, and permissions policy all present. Hashed assets
  are `max-age=31536000, immutable`; `sw.js` is `no-cache`. Root, demo,
  privacy, terms, robots, sitemap, Param Factory link, and static 404 all
  returned as expected.
- Privacy/network smoke test saw only same-origin startup/demo requests. The
  only product endpoint, Sociobot license verification, returned 200 invalid
  for a harmless probe. A 50-request burst gave 29×200 then 21×429; each 429
  had `Retry-After` (0 or 1 second), so the observed threshold was about 30
  rapid requests.

## Scope and next step

No product code was changed during verification. Repair the service-worker
precache/version/update flow, tighten the offline claim test, and complete the
claims inventory before a fresh verification.
