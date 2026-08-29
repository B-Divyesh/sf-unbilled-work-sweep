# Independent verification 9 — PASS

Date: 2026-08-29  
Work order: `unbilled-work-sweep-verify-9`  
Candidate commit: `54bb07ca9fda5a5516e398333befabaa0a938cb6`  
Live URL: <https://unbilled-work-sweep.sociobot.in>

## Decision

**PASS — candidate 54bb07c is ready for release.** The live PWA matches the
candidate production build byte-for-byte. The smallest useful workflow works
on desktop and 390 px mobile, every declared claim passes after the documented
clean install, the normal landing path reloads offline, and the previous
offline, row-identity, overflow, and touch-target blockers are repaired.

No product code was changed during this verification.

## Findings by severity

- **Critical / high / medium:** none.
- **Low:** the host serves `manifest.webmanifest` as
  `application/octet-stream` rather than `application/manifest+json`.
  Chromium's `Page.getAppManifest` returned the complete manifest with zero
  errors, and installation data, icons, scope, start URL, and display mode all
  parsed correctly. This is an interoperability hardening note, not an
  observed release blocker.

## Mandatory first-read gate — PASS

A fresh 1440 × 900 Chromium context opened live `/` cold with HTTP 200 and no
console or page errors. The first screen says:

- What it does: **“Find finished work you have not billed.”**
- Who it is for: **“For freelancers and tiny agencies with work spread across
  task, time, and invoice tools.”**
- What to click first: **“Try it with sample data,”** beside **“See a filled
  review in one click.”**

One click opened `/demo` and immediately showed the persistent **“Demo —
sample data, nothing is saved”** banner, four review rows, and `$5,840.00`.
The action is also visible at 390 × 844. Evidence:
`/tmp/unbilled-verify9-live-K8HyWT/` and
`/tmp/unbilled-qa9-mobile-root.png`.

## Mandatory claims gate — PASS

`.factory/claims.json` exists and contains 26 entries. The registry has exactly
one `@claim:<id>` tag per entry and no undeclared claim tags.

As the first repository action, every declared command was invoked before
dependency installation. Those launch attempts stopped at dependency
resolution (`@playwright/test` was absent from the intentionally clean clone),
so no claim test body ran. After the required `npm ci`, every manifest command
was rerun separately and exactly; all 26 executed their browser assertion and
exited 0. This is the standard documented Node test setup, not a failed product
claim.

| Claim | Result |
|---|---|
| `csv-import` | PASS |
| `header-mapping` | PASS |
| `queue-filter` | PASS |
| `missing-status` | PASS |
| `validated-import` | PASS |
| `review-matches` | PASS |
| `invoice-replacement` | PASS |
| `csv-export` | PASS |
| `local-only` | PASS |
| `offline-reload` | PASS |
| `runtime-asset-cache` | PASS |
| `local-persistence` | PASS |
| `workspace-backup` | PASS |
| `paid-license` | PASS |
| `snapshot-history` | PASS |
| `hours-times-rate` | PASS |
| `invoice-date-guard` | PASS |
| `match-normalization` | PASS |
| `demo-isolation` | PASS |
| `demo-session-removal` | PASS |
| `clear-workspace` | PASS |
| `license-storage` | PASS |
| `free-core` | PASS |
| `billing-boundary` | PASS |
| `scope-boundaries` | PASS |
| `art-disclosure` | PASS |

Landing, demo, privacy, terms, README, and control copy were cross-checked
against the registry. No unlisted capability claim was found.

## Clean checkout and build gates

- Initial checkout: exact candidate
  `54bb07ca9fda5a5516e398333befabaa0a938cb6`.
- `npm ci`: PASS; 24 packages installed, 0 vulnerabilities.
- `npm test`: PASS; 38/38 Playwright Chromium 1.58.2 tests in 1.6 minutes.
- `npx tsc --noEmit`: PASS. The repository has no separate lint command.
- `npm run build`: PASS; exact production build produced `dist/index.html`.
- `npm audit --omit=dev`: PASS; 0 vulnerabilities.
- `npm run check:checkout`: PASS; reached Dodo checkout with no purchase.
- `git diff --check`: PASS before report edits.
- Brief, claims, manifest, deployment config, package manifest, and lockfile
  parse as JSON.
- `/opt/fleet/lib/verify-url.sh`: PASS locally and live; title, `lang=en`, one
  h1, main landmark, alt text, labels, and browser error checks passed.

## Independent end-to-end evidence

Fresh live contexts confirmed:

- One-click demo: four rows and `$5,840.00`.
- Link first match: three rows, `$3,640.00`, one linked row.
- Unlink: four rows and `$5,840.00` returned.
- Keep unbilled, mark ready, and export: download
  `invoice-draft-checklist.csv`, seven-column header, four data rows.
- Reset: restored four rows and `$5,840.00`.
- Start for real: removed every `demo:` session key and opened the empty real
  IndexedDB workspace.
- Representative import: quoted comma, `$1,000.00`, 2 hours × $125, and
  `$0.01` produced three eligible rows totalling `$1,250.01`; one in-progress
  and one already-billed row were excluded.
- Invoice import produced three reviewable suggestions without applying any.
- Impossible date `2026-02-30` produced a row-numbered message and preserved
  the `$1,250.01` workspace.
- An unclosed quote and a file one byte over 10 MB each produced a specific
  recovery message, retained a saved `$125.00` row, and allowed a corrected
  `$250.00` import afterward. No page errors occurred.
- Previous collision reproduction: replacing a linked long-name `$100` row
  with a different `$500` row cleared the prior review, showed the new row in
  the queue, reported `$500.00`, and left zero linked matches.
- Workspace backup, malformed-backup protection, invoice replacement, date
  ordering, normalized matching, persistence, demo isolation, clearing, and
  paid snapshot behavior also pass in the complete suite.

The brief does not benefit from an AI runtime feature: deterministic,
reviewable CSV reconciliation is the safer core job. There is no missed AI
leverage finding.

## Accessibility, keyboard, mobile, and visual QA

- Fresh live Axe 4.10.2 scans found zero violations of any impact on `/`,
  `/demo`, `/privacy`, `/terms`, an SPA missing route, `/offline.html`, and
  `/404.html`.
- Every route has `lang=en`, one h1, one main, ordered headings, route-specific
  metadata, and no console/page error.
- Keyboard: first Tab visibly focused the skip link with a 4 px blue ring;
  Enter moved to `#main`; activating the demo link moved focus to the demo h1;
  Space on **Link invoice** changed the queue to three rows and `$3,640.00`.
- At 390 × 844, root and demo have 0 px horizontal overflow. The repaired
  import shortcut measures at least 44 px high, and all demo controls have
  effective targets of at least 44 × 44 px.
- At 200% root text size, both routes retained 0 px horizontal overflow.
- With `prefers-reduced-motion: reduce`, animation and transition durations
  collapse to 0.01 ms and scroll behavior is `auto`.
- Visual inspection on desktop and mobile found a clear hierarchy, readable
  controls, product-specific paper/ink/coral art, and no overlap or clipping.
  Screenshots: `/tmp/unbilled-verify9-live-K8HyWT/`,
  `/tmp/unbilled-qa9-mobile-root.png`, and
  `/tmp/unbilled-qa9-mobile-demo.png`.

## Privacy, billing boundary, headers, and request limits

- Cold load, the full demo review/export flow, representative real imports,
  invalid-input recovery, and replacement regression made no off-origin
  request.
- An explicit invalid-license callback made exactly one expected request to
  `api.sociobot.in`, removed the token from the address bar, and stored only
  `sb_license:unbilled-work-sweep` plus
  `sb_license_verdict:unbilled-work-sweep` in app local storage.
- Fresh rate-limit check: requests 1–30 to the product verification endpoint
  returned 200; requests 31–40 returned 429. Every observed 429 included
  `Retry-After: 4` and the live-origin CORS header. Observed allowance:
  **30 rapid requests per client/window**.
- Checkout returned 303 to a Dodo-hosted session. No payment was attempted and
  no payment form is embedded.
- Root and route responses include HSTS, `nosniff`, strict-origin referrer
  policy, permissions policy, and a restrictive CSP with
  `frame-ancestors 'none'` in the response header.
- HTML revalidates after 30 seconds. Hashed JS, CSS, and images use one-year
  immutable caching. `sw.js` uses `no-cache`. A missing asset returns 404.
- Every discovered HTTP link returned 2xx, except the expected checkout 303;
  `mailto:` links were excluded from HTTP status checks.
- There is no analytics, third-party font, third-party runtime script, sign-in,
  product-owned backend, package, or CLI. Entra, backend concurrency/health,
  and consumer-package checks do not apply.

## PWA and performance

- A fresh normal `/` visit registered and activated `sw.js`, controlled the
  page, set the readiness marker, and created cache
  `unbilled-work-sweep-dcb49cd2a9bb`.
- With the browser HTTP cache disabled and the context offline, `/` reloaded
  with its workspace and offline notice. Offline `/demo` retained four rows
  and `$5,840.00`. There were no failed requests or browser errors.
- `registration.update()` left the current worker active, no worker waiting or
  installing, and the update notice hidden.
- Chromium parsed the manifest with zero errors: standalone display, scoped
  versioned start URL, theme/background colors, 192 px icon, and 512 px
  any/maskable icon.
- Production JS: 35,532 B / 12.41 KB gzip. CSS: 15,829 B / 4.24 KB gzip.
  No font payload. Mobile hero: 30,612 B. Largest hero: 80,150 B. All static
  budgets pass.
- Fresh Lighthouse 13 mobile `/`: Performance 90, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.945 s, LCP 1.242 s, CLS 0, 64,772 B transfer.
- Fresh Lighthouse 13 mobile `/demo`: 93/100/100/100; FCP 0.998 s, LCP
  1.125 s, CLS 0, 34,080 B transfer.
- Three real review interactions recorded Event Timing durations of 48, 56,
  and 24 ms; observed maximum was 56 ms, under the 200 ms interaction budget.
  Lighthouse evidence: `/tmp/unbilled-qa9-lighthouse-root.json` and
  `/tmp/unbilled-qa9-lighthouse-demo.json`.

## Candidate/deployment identity

The fresh candidate build matches live bytes exactly:

| Artifact | SHA-256 |
|---|---|
| `index.html` | `1217997145620e3c9df99726cb943941876474bd05329cafe82ac9f221403c48` |
| `assets/index-DozZtpMO.js` | `9ec2bf3b9b2cd7aa019bac908ba6b6e1b1ebc97df03a712d1d63260beb773e0d` |
| `assets/index-B1xiupvf.css` | `896c6899c76ec3725c942b2085751fff93bcf22cab3bc9f10ebdace18b0f3b5e` |
| `sw.js` | `ed59f515246eb425d855cc425ddabe27f47948753e4d60a9ef0806a70813c6c1` |
| `manifest.webmanifest` | `9df996f16ae40f2778418d3c3dd3cb0bb0c82a0079993ca3224bf59e337f4e1d` |

## Release recommendation

Release candidate `54bb07ca9fda5a5516e398333befabaa0a938cb6`. The low-severity
manifest MIME note can be corrected in a later host/configuration hardening
change and does not block this release.
