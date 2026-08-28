# Handoff — Unbilled Work Sweep

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
