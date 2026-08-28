# Handoff — Unbilled Work Sweep

## Independent verification status: **FAIL**

Verifier work order `unbilled-work-sweep-verify-1` tested candidate
`f1600d46b8f5314a0174898359520f97c1d23b48` at
<https://unbilled-work-sweep.sociobot.in> on 2026-08-28. This status supersedes
the builder’s self-verification below.

The candidate’s build, 11-test Playwright suite, eight listed claim commands,
live deployment parity, first-read demo gate, accessibility, responsive flow,
privacy/network smoke checks, and rate-limit check passed. It is nevertheless
not releasable because the service worker omits the hashed JS/CSS app shell
from its precache, causing a strict first-visit offline reload of the exact
local production build to fail. It also displays an update notice on fresh
install without a waiting worker, and `.factory/claims.json` does not cover
several visitor-reliant claims in the landing page/README.

See [`.factory/verification.md`](verification.md) for commands, exact results,
severity, and repair steps. No product code was modified by the verifier.

## Required repair before release

1. Use versioned precaching that includes the emitted JS/CSS app shell and
   prove an offline reload immediately after the first completed visit.
2. Only show/update through a real waiting service worker; message that waiting
   worker rather than the active controller.
3. Add sandbox tests for every claim or remove the untestable claim copy.

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
