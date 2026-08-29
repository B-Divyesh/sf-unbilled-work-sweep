# Unbilled Work Sweep — independent verification 9 handoff

## Result

**PASS — release candidate
`54bb07ca9fda5a5516e398333befabaa0a938cb6`.** The live deployment at
<https://unbilled-work-sweep.sociobot.in> matches the candidate production
build byte-for-byte. No product code was changed.

Full evidence is in [`.factory/verification-9.md`](verification-9.md).

## Verification summary

- Mandatory first-read and one-click sample demo: PASS.
- All 26 exact claim commands after clean dependency install: PASS.
- `npm test`: PASS, 38/38 Chromium tests.
- `npx tsc --noEmit`: PASS; no separate lint script exists.
- `npm run build`: PASS; `dist/index.html` produced.
- `npm audit --omit=dev`: PASS; 0 vulnerabilities.
- `npm run check:checkout`: PASS; no purchase attempted.
- Live/candidate identity: exact byte match for HTML, JS, CSS, worker, and
  manifest.
- Desktop and 390 px mobile end-to-end review/import/export/recovery: PASS.
- Live Axe across seven routes: zero violations of any impact.
- Keyboard, visible focus, 200% text, reduced motion, and 44 px demo targets:
  PASS.
- Privacy capture: no off-origin request during CSV/demo flows; the explicit
  license check contacts only `api.sociobot.in`.
- Verification endpoint allowance: 30 rapid 200 responses, then 429 with
  `Retry-After: 4`.
- Normal-root service-worker registration, offline reload, demo offline state,
  cache, and update check: PASS.
- Lighthouse mobile: root 90/100/100/100; demo 93/100/100/100. LCP ≤ 1.242 s,
  CLS 0, observed interaction duration ≤ 56 ms.
- Bundles: 12.41 KB gzip JS, 4.24 KB gzip CSS, no fonts, 30.6 KB mobile hero.

## Functional evidence

The live demo started with four rows and `$5,840.00`. Linking reduced it to
three rows and `$3,640.00`; unlinking restored the full list. The checklist
download contained its declared seven-column header and four data rows.

A representative real import handled a quoted comma, `$1,000.00`, 2 hours ×
$125, and `$0.01`, excluded in-progress/already-billed work, and totalled
`$1,250.01`. Impossible dates, unclosed quotes, and a file over 10 MB showed
specific errors, preserved prior data, and allowed recovery.

The previous long-name identity collision no longer transfers an invoice
decision: replacing the linked `$100` row with different `$500` work cleared
the review, displayed the new row, and left zero linked matches.

## Findings

- Critical/high/medium: none.
- Low: `manifest.webmanifest` is served as `application/octet-stream`.
  Chromium parsed it with zero errors and all install fields present, so this
  is a non-blocking host interoperability note.

There is no sign-in, product-owned backend, library, or CLI. Those class checks
do not apply. Deterministic, reviewable matching fits this brief; an AI runtime
feature would not improve the core job.

## Reproduce

```bash
npm ci
npm test
npx tsc --noEmit
npm run build
npm run check:checkout
```

Live verification evidence includes `/tmp/unbilled-verify9-live-K8HyWT/`,
`/tmp/unbilled-qa9-lighthouse-root.json`, and
`/tmp/unbilled-qa9-lighthouse-demo.json`.
