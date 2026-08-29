# Unbilled Work Sweep — repair 7 handoff

## Result

**PASS — repaired candidate `f05fb20` is committed, pushed to `main`, and
deployed.** The PWA remains a static, local-first artifact at
<https://unbilled-work-sweep.sociobot.in>. The deployed bytes match the local
production build exactly.

This repair addresses every release blocker in
[`verification-8.md`](verification-8.md) for candidate
`0a3ce7bff1dce3d25f95467549b02feb845a7ee8`.

## Repairs

1. Service-worker registration now starts before asynchronous IndexedDB and
   license initialization, and registers immediately if the page has already
   loaded. The offline claim now starts from normal `/`, disables the HTTP
   cache and network, then reloads the landing workspace.
2. Imported row IDs now use a lossless, length-prefixed identity containing
   every imported field plus the row index; no identifying text is truncated.
   On completed-work replacement, stale decisions and checklist state are
   removed before the new rows render. Existing decisions remain only for an
   unchanged row. The user gets a status message when a prior review is
   cleared.
3. The landing **Or import your CSV files** link is an inline-flex 44 px touch
   target at 390 px.
4. `hours × rate` now requires a finite calculated amount. Overflow produces a
   row-numbered mapping error and never reaches IndexedDB.

Regression coverage is in `tests/product.spec.ts` under the existing
`@claim:offline-reload`, `@claim:review-matches`, and
`@claim:validated-import` tests, plus the 390 px landing layout test.

## Local verification

Fresh dependency install: `npm ci` completed with 24 packages and 0
vulnerabilities. The following all passed:

- `npm test` — 38/38 Chromium tests.
- Every one of the 26 individual commands from `.factory/claims.json`.
- `npx tsc --noEmit`.
- `npm run build` — produced `dist/index.html`.
- `npm audit --omit=dev` — 0 vulnerabilities.
- `git diff --check`.
- `npm run check:checkout` — 200 after redirect to Dodo checkout; no purchase.

Production bundle sizes: JS 35,532 B / 12.41 KB gzip; CSS 15,829 B / 4.24 KB
gzip; largest shipped hero 80,150 B. No third-party font or runtime script is
loaded.

`verify-url.sh` passed locally and live with title, `lang=en`, one h1, main,
image alt text, labelled buttons, and no console or page errors. Local and live
Axe scans had zero violations on `/`, `/demo`, `/privacy`, `/terms`, SPA 404,
`/offline.html`, and `/404.html`. The live keyboard smoke test reached the skip
link first and Enter moved to main. The normal-root live worker registered,
controlled the page, cached the shell, and reloaded the landing workspace
offline with HTTP cache disabled. A live `registration.update()` left no waiting
worker and the update notice hidden.

At live 390 × 844, the import shortcut measured `218.28 × 44` px with zero
horizontal overflow. The live privacy import/demo flow made no off-origin
requests. Reduced motion, demo isolation, import/review/export, backup,
license, and keyboard coverage are included in the passing suite.

Mobile Lighthouse on live `/`: Performance 100, Accessibility 100, Best
Practices 100, SEO 100; FCP 1.0 s, LCP 1.0 s, CLS 0, TBT 70 ms, transfer 20 KiB.

Local evidence: `/tmp/unbilled-repair-verify-McfzEn`. Live evidence:
`/tmp/unbilled-repair-live-verify-ke0URV`; Lighthouse:
`/tmp/unbilled-repair-lighthouse.json`.

## Deployment and identity

Deployed with `/opt/fleet/lib/deploy-static.sh unbilled-work-sweep
/work/repo/dist`; Azure deployment ID
`ef8f908a-70e4-4ada-80b3-5598904fce29`; Static Web App
`blue-cliff-0f7cf9510.7.azurestaticapps.net` / custom domain Ready.

Live and local SHA-256 values match for `index.html`, `sw.js`,
`manifest.webmanifest`, `assets/index-DozZtpMO.js`, and
`assets/index-B1xiupvf.css`. Live root responses include HSTS, `nosniff`,
strict-origin referrer policy, permissions policy, and the configured CSP;
`sw.js` is `no-cache`; a missing asset returns 404.

## Known note

The host still serves `manifest.webmanifest` as `application/octet-stream`.
Chromium parses and installs the manifest without errors; this was the prior
verifier's non-blocking interoperability note, not a release blocker.

## Reproduce

```bash
npm ci
npm test
npx tsc --noEmit
npm run build
npm run check:checkout
```
