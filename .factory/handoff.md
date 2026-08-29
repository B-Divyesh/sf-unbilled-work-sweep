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
- Post-deploy cold-open and live checks are appended after the release push.

## Known gaps

None known locally. No credentials or third-party scripts are included.
