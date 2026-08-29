# Independent verification 10 — PASS

Date: 2026-08-29
Work order: `unbilled-work-sweep-verify-10`
Requested candidate: `4778b24a313c2b16ec41dcfcd1d3e586f2cf1cb4` (not present in this clone)
Verified candidate: `4778b2f2d92570d2e91a8bff3ff4acb8c8fd4280`
Live URL: <https://unbilled-work-sweep.sociobot.in>

## Decision

**PASS.** The deployed PWA is the production build of the verified candidate,
the complete local and live review workflow works, and no release-blocking
defect was found. No product code was changed during this verification.

The work-order base and local `HEAD` are `4778b2f2…`; the longer SHA supplied
in the request does not resolve in the clean clone or its `origin/main`.

## First-read and demo gate — PASS

A cold, fresh Chromium context opened live `/` with HTTP 200. The first screen
plainly says what it does, who it serves, and what to do first:

- **What:** “Find finished work you have not billed.”
- **For whom:** “For freelancers and tiny agencies with work spread across
  task, time, and invoice tools.”
- **First action:** **Try it with sample data**, with “See a filled review in
  one click.” alongside it.

One click opened `/demo`; at 390 × 844 it showed the demo banner, four
actionable rows, two matching suggestions, `$5,840.00`, and a visible
61.6 px-high **Link invoice** control. Evidence:
`.factory/evidence/verification-10-live-cold-desktop.png` and
`.factory/evidence/verification-10-live-demo-390.png`.

## Required claims — PASS

`.factory/claims.json` exists and declares 30 claims. After `npm ci` in the
clean checkout, every exact `test` command from that manifest was invoked
separately, in manifest order, against the product demo entry point. All
completed successfully. A second complete suite run independently confirmed
every registered assertion: **43/43 Playwright tests passed in 1.3 minutes**.

The passing claim IDs are: `csv-import`, `demo-sample-ready`, `header-mapping`,
`queue-filter`, `missing-status`, `validated-import`, `review-matches`,
`work-replacement`, `invoice-replacement`, `csv-export`, `local-only`,
`network-boundary`, `offline-reload`, `manifest-mime`, `runtime-asset-cache`,
`local-persistence`, `workspace-backup`, `paid-license`, `snapshot-history`,
`hours-times-rate`, `invoice-date-guard`, `match-normalization`,
`demo-isolation`, `demo-session-removal`, `clear-workspace`, `license-storage`,
`free-core`, `billing-boundary`, `scope-boundaries`, and `art-disclosure`.

Landing, demo, privacy, terms, and README promises were cross-checked against
the registry. No unlisted visitor-facing capability claim was found.

## Clean-build and product workflow — PASS

- `npm ci`: passed; 24 packages installed and audit reported zero
  vulnerabilities.
- `npm test`: **43 passed**.
- `npm run build`: passed (`tsc --noEmit` plus Vite) and produced `dist/`.
  There is no separate lint script in `package.json`.
- Production payload: JS 35.77 KB raw / 12.48 KB gzip; CSS 17.05 KB raw /
  4.45 KB gzip; largest shipped image 80.15 KB. All stated static budgets
  pass.
- Fresh live Lighthouse mobile: Performance 99, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.9 s, LCP 1.1 s, CLS 0, TBT 100 ms, 50 KiB
  transfer. Evidence: `.factory/evidence/verification-10-lighthouse-live.json`.

Independent local import exercised normal, boundary, invalid, and recovery
paths: five source rows yielded three eligible rows and `$1,250.01` (including
hours × rate and a $0.01 amount), while incomplete and already-billed rows were
excluded. An impossible `2026-02-30` date gave a row-numbered recovery message
and retained saved `$125.00` data; a corrected CSV then replaced it with the
visible `$250.00` row.

Fresh live demo QA linked a suggestion (`$5,840.00` → `$3,640.00`), unlinked it
(`$5,840.00` returned), downloaded `invoice-draft-checklist.csv` with header
`Ready,Date,Client,Project,Description,Amount,Currency` and four rows, and
Reset restored the shipped total.

## Accessibility, mobile, privacy, PWA — PASS

- `/`, `/demo`, `/privacy`, `/terms`, SPA missing route, `/404.html`, and
  `/offline.html` each loaded with `lang=en`, exactly one `<h1>`, one `<main>`,
  and zero Axe serious/critical findings (in fact, zero violations).
- The supplied `/opt/fleet/lib/verify-url.sh` passed locally and live: title,
  language, main landmark, image alt coverage, labeled controls, and no browser
  console errors. Its live and local reports are in
  `.factory/evidence/verification-10-*-verify/`.
- Keyboard-only checks: Tab visibly focused the skip link with a 4 px blue
  outline; Enter moved to `#main`; Space on **Link invoice** performed the
  action. At 390 px the demo had 0 px horizontal overflow. Reduced motion
  reduced animation/transition duration to `0.00001s` and set scrolling to
  `auto`.
- Request logging through the live landing and complete demo/import/review/
  export flow found **no off-origin requests**. No analytics or third-party
  runtime/font requests occurred. Explicit checkout and verification are the
  only documented Sociobot exceptions.
- Service worker was active and controlling the live page. With the browser
  offline after the first visit, `/` reloaded with its workspace and the
  “You are offline. Saved work and the demo still work.” notice. A fresh
  `registration.update()` left no waiting or installing worker and the update
  notice hidden. Chromium parsed the manifest with zero errors, standalone
  display, valid scope/start URL, and 192/512 maskable icons.

## Deployment identity, headers, billing boundary — PASS

Fresh SHA-256 comparisons show exact local/live bytes for `index.html`, the
hashed JS and CSS, `sw.js`, `manifest.webmanifest`, `manifest.json`, `404.html`,
and `offline.html`. The host does not expose `staticwebapp.config.json` as a
public asset (it serves SPA HTML at that path), but observed headers implement
its security and caching policy.

| Artifact | SHA-256 |
|---|---|
| `index.html` | `d01eadec275e0e219cabba36d4119e727ea610eae6bd5b666417e2bf8ac7c57d` |
| `assets/index-BTLbeXFg.js` | `648edf85fdb5dedcc55e5382fff7513ebd4c2da825c9c82d6e013b992b4e49cf` |
| `assets/index-D8wW1bi2.css` | `15c2cde038dcf85b0dd43fe5ec5c663c8b2c1d0f386869cd52478ac451d14e7f` |
| `sw.js` | `e812c491bcb5be80efa4e5e2773a224b6eceed8ec9e0577a637ab589e0de0cd5` |
| `manifest.webmanifest` | `9df996f16ae40f2778418d3c3dd3cb0bb0c82a0079993ca3224bf59e337f4e1d` |

Root, application routes, the service worker, assets, and manifest include
HSTS, `nosniff`, strict-origin referrer policy, restrictive Permissions Policy,
and the configured CSP with `frame-ancestors 'none'`. HTML revalidates at 30 s;
hashed JS/CSS cache for one year immutable; `sw.js` is `no-cache`; and the
manifest is `application/json` with a one-hour cache.

`npm run check:checkout` reached the Dodo-hosted checkout with no purchase.
The product verification endpoint allowed **30** rapid invalid requests from a
single client; requests **31–40** returned **429** with `Retry-After: 4` and
the expected live-origin CORS value. No sign-in flow applies.

## Findings by severity

- **Critical:** none.
- **High:** none.
- **Medium:** none.
- **Low:** none.

## Release recommendation

Accept `4778b2f2d92570d2e91a8bff3ff4acb8c8fd4280` for release. The supplied
non-resolving candidate SHA should be corrected in the work-order record, but
the checked-out and deployed candidate itself passes.
