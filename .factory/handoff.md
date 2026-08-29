# Unbilled Work Sweep — polish round 1 handoff

## Delivered

- Repaired every finding in adversarial review 1; the finding-by-finding map is
  in `.factory/polish-1.md`.
- Preserved the midnight paperwork-garden visual system while making the static
  fallback a complete, accessible product route.
- Kept `/demo` and `?demo=1` as isolated sample paths with the persistent
  banner, reset, and start-for-real controls. Demo state remains in the
  `demo:` session-storage namespace.
- Added four behavior claims and tests: queue filtering, review history,
  normalized project-aware matching, and same-origin runtime asset caching.
  The registry now has 26 claims, each with exactly one `@claim:` test.
- Updated landing/README wording, metadata updates for every SPA route,
  copy audit, product description, and mobile evidence.

## Run and verify

```bash
npm ci
npm test
npm run build
```

The product is a static Vite PWA. Deploy `dist/`; it contains `index.html` at
its root and the Static Web Apps configuration, manifest, service worker, and
fallback pages.

## Evidence

- Clean install: `npm ci` completed with 0 vulnerabilities.
- Claim registry check: `26 claims each have one test tag`.
- Full browser/unit/integration/accessibility/privacy/offline suite:
  `npm test -- --workers=4` — 38 passed (the Playwright result file reports
  `status: passed`). This includes axe serious/critical scans across all SPA
  routes and the static fallback, keyboard, mobile, demo isolation, privacy,
  offline reload, runtime cache, and claim tests.
- Production build: `npm run build` passed. Generated initial JavaScript is
  34.88 kB / 12.19 kB gzip; CSS is 15.80 kB / 4.24 kB gzip.
- Screenshots reviewed locally:
  `.factory/evidence/polish-1-demo-390.png` and
  `.factory/evidence/polish-1-static-404.png`.
- Clean-clone claim verification: all 26 commands in `.factory/claims.json`
  passed individually from `/tmp/unbilled-work-sweep-clean.Q5aYZQ`, followed
  by `npm test` (38 passed) and `npm run build`.
- Static deployment: `/opt/fleet/lib/deploy-static.sh unbilled-work-sweep
  dist` completed Azure deployment `77bf94ce-eab1-45d4-91a8-fdaf69218a8a`.
- Cold live Chromium check at 390×844 passed for `/`, `?demo=1`, the SPA
  missing route, and `/404.html`: demo banner/reset/start-for-real and $5,840
  sample state visible; mobile overflow `0`; correct SPA title/OG title;
  static legal footer; 0 console/page errors; 0 external requests. Live
  screenshots: `.factory/evidence/polish-1-live-demo-390.png` and
  `.factory/evidence/polish-1-live-static-404.png`.
- Cache-busted live fallback `<https://unbilled-work-sweep.sociobot.in/404.html?cold=live-polish-1>`
  returned the new full shell (ETag `"90847195"`, last-modified
  `2026-08-29 10:32:56 UTC`), without the old metaphor.

## Known gaps

None known. No credentials or third-party scripts are included.
