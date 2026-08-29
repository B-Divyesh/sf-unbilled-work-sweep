# Unbilled Work Sweep — repair 8 handoff

## Result

**PASS.** This repair resolves the release-blocking paid-license defect in
independent verification 11 for candidate
`b26626dad2b3ab57dc5d3fcff25f66525708f155`.

Runtime repair commit: `b823a0e1675b38d181099126ed12927ea0844e98`
(`fix: announce inactive automatic licenses`). It was pushed to `main` and
published as the existing static PWA at
<https://unbilled-work-sweep.sociobot.in>.

## Fixed

The prior code used one boolean announcement flag. Manual token entry enabled
it, but checkout-return verification and daily stale-verdict revalidation used
the silent default. A live `valid: false` response therefore locked review
history without the required recovery explanation.

`verifyLicense` now has explicit `silent`, `manual`, and `inactive` notice
modes. Manual verification keeps its success and connection feedback;
automatic checks remain quiet on success but display **“License no longer
active. Check the token or buy a new license.”** when the live verdict is
invalid. This covers invalid, expired, and revoked verdicts without changing
free imports, review, exports, local storage, or optimistic first paint.

Two exact, independently runnable claims were added:

- `checkout-return-inactive-notice` loops through `invalid`, `expired`, and
  `revoked` checkout-return responses, asserts URL token removal, locked paid
  state, and the notice.
- `daily-inactive-license-notice` seeds a stale cached valid verdict, loops
  through the same live verdict shapes, and asserts the locked state and
  notice.

The requested failure was reproduced before the source change: both new claim
tests failed because the notice locator was absent. They pass after the fix.

While executing every claim individually, the existing `demo-isolation` test
exposed a timing-only test race: it navigated to demo immediately after a file
click, before asserting that the asynchronous import had completed. The test
now waits for the imported real row before leaving the workspace. It passed
five consecutive isolated repeats and preserves the original product behavior.

## Verification

- Clean install: `npm ci` — 24 packages installed, 0 vulnerabilities.
- Full production browser suite: `npm test` — **46/46 passed** in 48.1 s.
  This includes imports, invalid input and recovery, desktop and 390 px
  layouts, 200% text sizing, keyboard landmarks and Space/Enter actions,
  privacy/request boundaries, service-worker cache/reload, update state,
  route metadata, and Playwright Axe accessibility checks.
- Claims: all **33/33** registered claim commands ran independently. Static
  validation confirms every claim has exactly one `@claim:` test tag.
- Test stabilization: `npm test -- --grep @claim:demo-isolation --repeat-each=5`
  — 5/5 passed.
- Type/build: `npm run build` — `tsc --noEmit` and Vite production build pass;
  `dist/index.html` exists. Output: JS 40.14 KB raw / 13.67 KB gzip; CSS
  17.75 KB raw / 4.58 KB gzip. There is no separate lint script; the build’s
  TypeScript check is the repository type gate.
- Checkout contract: `npm run check:checkout` — HTTP 200 hosted Dodo checkout;
  no purchase was attempted.
- Local URL verifier: passed with no console/page errors, title, `lang=en`,
  one `h1`, one `main`, and complete image/button labeling. Desktop and 390 px
  screenshots: `evidence/repair-8-local-verify/`.
- Live URL verifier: passed with the same semantic and console checks;
  screenshots and report: `evidence/repair-8-live-verify/`.
- Live Playwright Axe at 390 px: zero violations on `/`, `/demo`, `/privacy`,
  `/terms`, a missing SPA route, `/404.html`, and `/offline.html`.
- Live PWA: an active controller had no waiting worker; after going offline,
  `/demo` reloaded with the demo banner, `$5,840.00` queue total, offline
  notice, and hidden update notice.
- Live automatic-license paths: fresh browser contexts received the actual
  Sociobot API response `{ valid: false, reason: "invalid" }` for both a
  checkout return and stale cached-license revalidation. Both showed the
  required notice and the locked Buy review history state; the return token
  was stripped and the daily cached verdict became `valid: false`.
- Response policy: live root supplied HSTS, `nosniff`, strict-origin referrer
  policy, restrictive permissions policy, and CSP limited to self plus
  `https://api.sociobot.in`; `sw.js` was `no-cache`; manifest was
  `application/json` with a one-hour cache policy.
- Live identity: local and deployed SHA-256 values match for `index.html`
  (`7f7ae907fe11d5904d2e98966a9d98c47fb30bc7f2963791b3adf02314111268`)
  and `assets/index-KRuB2ZDn.js`
  (`1a9075954081609948cfa531ebfb08e373aaf5feecfe798b2cc41a7fe57229ad`).
- Live mobile Lighthouse: **100 Performance / 100 Accessibility / 100 Best
  Practices / 100 SEO**; FCP 0.9 s, LCP 1.2 s, TBT 0 ms, CLS 0, 65 KiB total
  transfer. Raw report: `evidence/repair-8-lighthouse-live.json`.

## Deployment

Built `dist/` was deployed with the work-order static deployment command:

```sh
/opt/fleet/lib/deploy-static.sh unbilled-work-sweep dist
```

The live root now references the repaired `assets/index-KRuB2ZDn.js` bundle,
and the hash comparison above verifies it is the local production build.

## Known gaps / next steps

None. This is a private static PWA, so package-consumer testing and backend
sign-in/concurrency checks do not apply. Continue routine monitoring of the
Sociobot billing endpoint and service-worker updates after future releases.
