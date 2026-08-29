# Unbilled Work Sweep — polish round 2 handoff

## Result

**PASS.** Every finding in reviews 1 and 2, including the previously unresolved
manifest MIME issue, is fixed and rechecked on the final live deployment.

- Final commit before evidence docs: `3d19272e670bee5def8acf57f717006f7617512a`
- Live URL: <https://unbilled-work-sweep.sociobot.in>
- Deployment: `b5ec8028-f6e6-4df6-a906-ab40e43cf535`
- Finding map: [`.factory/polish-2.md`](polish-2.md)

## What changed

- Moved the real sample review above demo import controls and fitted the total,
  first work row, suggested invoice, and review action into 390 × 844.
- Kept demo work in the separate `demo:` session namespace; Reset restores the
  shipped sample and Start for real discards demo state without touching real
  IndexedDB data.
- Added registered claims for demo readiness/reset, completed-work replacement,
  the outbound-request boundary, and manifest MIME behavior.
- Rewrote `/manifest.webmanifest` to an identical JSON asset so the live host
  returns `application/json` instead of `application/octet-stream`.
- Fitted all three facts inside the 1440 × 900 first screen.
- Standardized paid wording on `review history` and explained matching behavior
  without “normalized” jargon.
- Preserved and rechecked route titles, metadata, focus transfer, history
  navigation, SPA/static 404 pages, legal links, keyboard access, mobile
  overflow, offline behavior, privacy boundaries, and the visual thesis.
- Updated `.factory/catalog-description.txt`, `.factory/claims.json`,
  `.factory/copy-audit.md`, `.factory/demo.md`, and README.

## How to verify

```bash
npm ci
npm test
npm run build
```

Run any public claim exactly as declared in `.factory/claims.json`, for example:

```bash
npm test -- --grep @claim:demo-sample-ready
npm test -- --grep @claim:manifest-mime
```

## Exact verification evidence

- Final clean clone `/tmp/unbilled-work-sweep-polish2-final.4aPrBB` at
  `3d19272e670bee5def8acf57f717006f7617512a`:
  - 30/30 registered claim commands passed independently.
  - `npm test`: 43/43 passed.
  - `npm run build`: passed and produced `dist/index.html`.
- Built budgets: JS 35.77 KB raw / 12.48 KB gzip; CSS 17.05 KB raw /
  4.45 KB gzip; largest shipped image 80.15 KB.
- Local Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.5 s, CLS 0, TBT 0 ms.
- Final live Lighthouse: 100/100/100/100; LCP 1.1 s, CLS 0, TBT 0 ms.
- Final live worker verifier: title present, `lang=en`, one h1, one main, no
  missing alt text, no unlabeled buttons, and no console errors.
- Final cold live browser sweep at 390 × 844 and 1440 × 900:
  - all three landing facts fit;
  - one click opened four review rows, two suggestions, `$5,840.00`, and a
    visible review action;
  - Reset restored `$5,840.00` after a link changed it to `$3,640.00`;
  - direct `?demo=1` used demo storage and Start for real removed it;
  - offline reload retained the demo and total;
  - zero off-origin requests during import/demo actions;
  - zero serious/critical Axe findings on demo and every required route.
- Live response checks:
  - `/manifest.webmanifest`: 200, `Content-Type: application/json`.
  - `/`, `/demo`, `/?demo=1`, `/privacy`, `/terms`, SPA missing route,
    `/404.html`, `/robots.txt`, and `/sitemap.xml`: 200.
  - Sociobot checkout: 303 to hosted checkout.
- Screenshots and reports:
  - `.factory/evidence/polish-2-live-demo-390.png`
  - `.factory/evidence/polish-2-live-landing-1440.png`
  - `.factory/evidence/polish-2-live-verify/`
  - `.factory/evidence/polish-2-lighthouse-live.json`

## Known gaps and next steps

None. No review finding or test failure remains.
