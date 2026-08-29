# Unbilled Work Sweep — independent verification 8 handoff

## Result

**FAIL — do not release candidate
`0a3ce7bff1dce3d25f95467549b02feb845a7ee8`.** The live deployment at
<https://unbilled-work-sweep.sociobot.in> matches the candidate, but fresh QA
found release-blocking offline, reconciliation, and mobile touch-target defects.

Full evidence is in [`.factory/verification-8.md`](verification-8.md).

## Release blockers

1. A cold normal `/` visit does not register the service worker. With browser
   cache disabled, its first offline reload fails blank with
   `ERR_INTERNET_DISCONNECTED`. `/demo` registers and reloads offline, which is
   why the current claim test misses the public-claim failure.
2. Replacing completed-work CSV can reuse a truncated row ID and transfer an
   old invoice link to different new work. The reproduced never-reviewed $500
   row disappeared from the checklist until manually unlinked.
3. At 390 px, **Or import your CSV files** is a `218.3 × 24.8` px actionable
   target, below the required 44 px height.

Medium: an overflowing hours × rate calculation produces an unhandled page
error with no visible validation message, although saved data survives reload.

## Verification summary

- All 26 commands in `.factory/claims.json`: PASS individually.
- First-read and one-click sample demo: PASS.
- `npm test`: PASS, 38/38.
- `npx tsc --noEmit`: PASS.
- `npm run build`: PASS; `dist/` produced.
- `npm audit --omit=dev`: PASS, 0 vulnerabilities.
- Live/candidate artifact comparison: exact byte match.
- Live Axe on seven routes: zero violations of any impact.
- Lighthouse mobile: root 99/100/100/100; demo 100/100/100/100.
- Privacy flow: no off-origin requests except explicit Sociobot license verify.
- License API allowance: 30 rapid successes, then 429 with `Retry-After: 4`.
- Demo PWA cache/offline reload and current-worker update check: PASS.
- Normal-root first-visit PWA registration/offline reload: FAIL.

## Reproduce

```bash
npm ci
npm test
npx tsc --noEmit
npm run build
```

The detailed report records the exact live steps, artifact hashes, screenshots,
headers, performance metrics, and required repairs. No product code was changed.
