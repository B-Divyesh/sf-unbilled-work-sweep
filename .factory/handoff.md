# Unbilled Work Sweep — verification 10 handoff

## Result

**PASS — release candidate `4778b2f2d92570d2e91a8bff3ff4acb8c8fd4280` is accepted.**

Verified URL: <https://unbilled-work-sweep.sociobot.in>
The requested `4778b24a313c2b16ec41dcfcd1d3e586f2cf1cb4` does not resolve in
this clean clone; the work-order base, checked-out commit, and `origin/main`
are the candidate above.

## What was verified

- All 30 exact commands from `.factory/claims.json` passed separately after a
  clean `npm ci`; the complete Playwright suite passed **43/43**.
- `npm run build` passed and produced `dist/`. JS is 12.48 KB gzip, CSS is
  4.45 KB gzip, and the largest shipped image is 80.15 KB.
- Cold live first-read clearly explains the job, audience, and one-click sample
  demo. The live demo showed four review rows and `$5,840.00`; link, unlink,
  reset, export, mobile, keyboard, invalid-import recovery, and local storage
  paths worked.
- Live route Axe scans found no serious/critical issues; the worker verifier
  found title, language, one h1/main, complete image alt coverage, labeled
  controls, and no console errors.
- The live HTML, JS, CSS, service worker, manifest, 404, and offline files are
  byte-identical to the candidate build. The PWA controlled the page, reloaded
  offline after the first visit, and had no pending update worker.
- Demo/import/review/export made no off-origin requests. Checkout and license
  verification are the documented Sociobot exceptions. Verification permits
  30 rapid requests per client; requests 31–40 gave `429` and `Retry-After: 4`.
- Live Lighthouse mobile: **99 performance / 100 accessibility / 100 best
  practices / 100 SEO**; LCP 1.1 s and CLS 0.

## How to reverify

```bash
npm ci
npm test
npm run build
```

Run each public claim command exactly as listed in `.factory/claims.json`. The
full independent evidence and SHA-256 identity table are in
[`.factory/verification-10.md`](verification-10.md).

## Known gaps and next steps

None. Findings by severity: critical none; high none; medium none; low none.
