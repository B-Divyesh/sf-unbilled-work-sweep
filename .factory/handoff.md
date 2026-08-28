# Handoff — Unbilled Work Sweep

## Independent verification 3 — FAIL (2026-08-28)

Candidate `003d25dd1620e54a1c2a7e18fb7c467c30c12ffa` was independently tested
against <https://unbilled-work-sweep.sociobot.in>. Do not release it yet.

- All 14 declared claim commands, the 19-test Playwright suite, typecheck, and
  production build passed. The rebuilt JS, CSS, and service worker match live
  byte-for-byte. Live offline reload, PWA update state, privacy/network,
  accessibility, mobile, response-policy, rate-limit, and performance checks
  passed.
- A malformed but valid-JSON workspace backup with `"decisions": null` is
  accepted and persisted. It throws `Cannot convert undefined or null to
  object`, then leaves the entire app blank after reload; the in-app clear
  action is unreachable. This is a release-blocking invalid-input/recovery
  defect.
- The footer claim “Original generated collage; no stock art.” is not in
  `.factory/claims.json`; the claims contract makes that an additional
  release-blocking finding until it is removed or tested.

Full evidence, commands, exact hashes, and repair requirements are in
`.factory/verification-3.md`.

## Repair 2 — ready for static deployment

This repair resolves the only release blocker in independent verification 2
for candidate `5822c1e5f61c7a33376016f1882a7e55ce6318df`:

- The PWA update notice now preserves the HTML `hidden` state with
  `.notice[hidden] { display: none; }`. A normal visit with no waiting service
  worker cannot show an inoperable “Use update” control.
- Added a browser regression using a fresh controlled origin. It waits for the
  service worker, proves `registration.waiting` is absent, and asserts that
  `#update-notice` is hidden. The existing update-targeting regression still
  proves that only a real waiting worker receives `SKIP_WAITING`.

### Repair verification — 2026-08-28

- Clean dependency install: `npm ci` passed with 0 audit vulnerabilities.
- Type check: `npx tsc --noEmit` passed. There is no separate lint command;
  the production build performs the same TypeScript check.
- Production build: `npm run build` passed and created `dist/index.html`.
  Initial JS is 29,423 bytes (10.67 KB gzip); CSS is 14,715 bytes (4.07 KB
  gzip). Both are within the static budget.
- Browser integration suite: `npm test` passed all 19 Chromium tests. This
  covers the real PWA no-waiting-worker state, offline first-reload shell,
  update targeting, desktop, 390×844 mobile, keyboard skip link, routes, Axe
  serious/critical checks, privacy requests, demo storage, license mock, CSV
  flows, and error recovery.
- Claims: every one of the 14 commands declared in `.factory/claims.json` was
  run individually and passed. Each ID has exactly one `@claim:` regression.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 <evidence-dir>` passed:
  200 response in 534 ms; no console/page errors; title, `lang=en`, one h1,
  main landmark, and image alt text all present. Evidence:
  `/tmp/unbilled-verify.UA0q51/verify.json`.
- Mobile Lighthouse JSON: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 1,603 ms, CLS 0, TBT 31 ms. Lighthouse emitted its known
  final tab-crash message after writing the complete JSON report at
  `/tmp/unbilled-lighthouse.json`; the report contains these completed scores.

### Deployment and live identity

- Repair commit `08e0fc7d18273cb1d0a20b8d512cd125f6573b10` was pushed to
  `origin/main` and `dist/` was deployed to the configured production Azure
  Static Web App `sf-unbilled-work-sweep` with `swa deploy ./dist --env
  production` on 2026-08-28.
- Live identity matches the repair build:
  `https://unbilled-work-sweep.sociobot.in/` references
  `index-BxjMqiu7.js` and `index-BQM5jbYv.css`; live `sw.js` has cache
  `unbilled-work-sweep-8e86e3dad6b0` and precaches those exact assets.
- A fresh live browser loaded `/demo`, received an active controller with no
  `registration.waiting`, and observed the update notice as `hidden` with
  computed `display: none`. It then reloaded the same `$5,840.00` sample queue
  offline without console or page errors.
- Live `verify-url.sh` passed: HTTPS 200 in 873 ms, no browser errors, title,
  `lang=en`, one h1, main landmark, and image alt text. Evidence:
  `/tmp/unbilled-live-verify.b9usOo/verify.json`. HTTPS response headers
  include HSTS, `nosniff`, strict-origin referrer policy, permissions policy,
  and the restrictive configured CSP.

### Known limits

- V1 accepts CSV and workspace JSON only. It does not connect to task or
  invoice accounts.
- Matching uses normalized client and project names plus invoice timing. People
  must review each suggestion.
- Browser site-data clearing removes local work and paid snapshots. Workspace
  JSON export is the backup path.

## Repair status: ready for deployment

Repair work order `unbilled-work-sweep-repair-1` repaired every release
blocker recorded by independent verification at candidate
`f1600d46b8f5314a0174898359520f97c1d23b48`.

### Repairs

- The Vite build now reads its emitted manifest and writes the hashed JS and
  CSS app assets into a versioned service-worker precache. Cache matching
  ignores response `Vary` headers, so the cached executable shell also works
  on servers that add `Vary: Origin`.
- The offline regression starts on a fresh loopback origin, waits for control,
  confirms the built JS and CSS are in Cache Storage, turns the context
  offline, verifies a cached module response, and reloads the demo successfully
  with no intervening online reload.
- The update notice is gated by a real `registration.waiting` worker and a
  completed initial install. The action sends `SKIP_WAITING` to that waiting
  worker, not to the active controller; stale initial-install notices clear on
  controller change.
- The claims inventory now has 14 one-to-one tagged browser regressions,
  including hours × rate, the invoice-date guard, demo storage isolation, free
  core actions, one-time Sociobot-only checkout, and scope boundaries. The
  privacy claim now performs both a private import and a demo review action.

### Repair verification (2026-08-28)

- `npm ci`: passed; 0 audit vulnerabilities.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed; `dist/index.html` created. Production JS is 29.42
  KB (10.66 KB gzip); CSS is 14.69 KB (4.06 KB gzip).
- `npm test`: passed, 18 Chromium tests. This includes desktop, 390px mobile,
  keyboard skip-link, routes, Axe serious/critical checks, privacy requests,
  offline reload, PWA update targeting, and all 14 documented claims.
- Claims mapping check: all 14 claim IDs have exactly one `@claim:` test.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173`: HTTP 200 in 594 ms;
  no page or console errors; title, `lang=en`, one `<h1>`, `<main>`, and image
  alt text all passed. Local evidence: `/tmp/unbilled-verify.fc8y3L`.
- Browser Axe runs are embedded in the route regression. No separate linter is
  configured; TypeScript is checked directly by the build and the explicit
  typecheck above.

### Known limits

- V1 accepts CSV and workspace JSON only. It does not connect to task or
  invoice accounts.
- Matching uses normalized client and project names plus invoice timing. People
  must review each suggestion.
- Browser site-data clearing removes local work and paid snapshots. Workspace
  JSON export is the backup path.
- Repair commit `d10fcd1514954c3e212f44e97fc302e99985eaa4` was pushed to
  `origin/main`. The repository contains no deployment workflow or static-host
  deployment configuration/target beyond `staticwebapp.config.json`; GitHub
  reports zero Actions workflows and zero deployment records. At 2026-08-28
  15:20 UTC the live host still served candidate asset
  `index-CkS5PyLJ.js` and `sw.js` cache `unbilled-work-sweep-v1`, not this
  repair. The factory static deployment must consume the pushed main commit;
  no direct deployment target was available in this work order.

Build date: 2026-08-28

Work order: `unbilled-work-sweep-build-1`

Version: 1.0.0

## What was built

- A Vite and TypeScript offline PWA for weekly unbilled-work review.
- Completed-work and invoice CSV import with explicit column mapping.
- Flexible amount handling through either amount or hours multiplied by rate.
- A client and project matcher that filters out early invoice dates.
- Review controls that never link a suggestion without a user action.
- An attention queue with possible value, checklist state, and CSV export.
- Local IndexedDB persistence plus complete JSON workspace export and restore.
- A separate one-click demo at `/demo` and `?demo=1` using only `demo:` session-storage keys.
- An installable manifest, responsive icons, an app-shell service worker, offline fallback, and update notice.
- A $19 one-time license flow through the production Sociobot checkout and verification endpoints. Free imports and exports remain available.
- Paid named snapshots with prior queue totals. Demo snapshots stay in the demo namespace.
- Real `/privacy`, `/terms`, and designed 404 routes, plus metadata, sitemap, robots rules, and security headers.
- An original surreal editorial hero with responsive WebP output and recorded provenance.

## How to run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

The deploy root is `dist/`. `dist/index.html` is present after the build.

## Verification

- `npm test`: 11 Playwright tests passed on Chromium 1.58.2.
- All eight entries in `.factory/claims.json` have one tagged browser test.
- Offline claim: first-load registration followed by an offline `/demo` reload passed.
- Privacy claim: importing and changing a private work row produced no off-origin requests.
- Accessibility: axe found no serious or critical issues on `/`, `/demo`, `/privacy`, `/terms`, or the in-app 404.
- Keyboard smoke test: the skip link receives first focus and reaches the main landmark.
- Mobile: the complete demo stays within a 390×844 viewport with no horizontal overflow.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, no console or page errors, one h1, one main, `lang=en`, and no missing alt text. Measured load was 612 ms locally.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse lab metrics: LCP 1.6 s, CLS 0, total blocking time 40 ms. Lighthouse did not emit a lab INP value because no interaction occurred.
- Production assets: JavaScript 10.49 KB gzip; CSS 4.06 KB gzip; largest hero WebP 79 KB. All are below the product budgets.
- `npm audit`: no known vulnerabilities.
- `git diff --check`: clean.

## Known limits

- V1 accepts CSV and workspace JSON only. It does not connect to task or invoice accounts.
- Matching uses normalized client and project names plus invoice timing. People must review each suggestion.
- The tool reports exported amounts as provided. It does not calculate tax or taxable income.
- Browser site-data clearing removes local work and paid snapshots. Workspace JSON export is the backup path.
- The factory must register the product slug with Sociobot billing before live purchases succeed.

## Suggested next steps

- Test anonymized exports from the first pilot tools and add safe header aliases where needed.
- Measure whether weekly reviewers catch at least 95% of known unbilled value.
- Register the production Sociobot product and verify a real checkout return before release.
