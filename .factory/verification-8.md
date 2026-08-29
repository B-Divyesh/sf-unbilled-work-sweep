# Independent verification 8 — FAIL

Date: 2026-08-29  
Work order: `unbilled-work-sweep-verify-8`  
Candidate commit: `0a3ce7bff1dce3d25f95467549b02feb845a7ee8`  
Live URL: <https://unbilled-work-sweep.sociobot.in>

## Decision

**FAIL — do not release this candidate.** The candidate and deployment match,
all 26 declared claim commands pass, and the normal reconciliation flow is
strong. Fresh adversarial checks nevertheless found three release-blocking
defects. Most importantly, the advertised offline behavior fails after a
normal first visit to `/`, and replacing work can silently carry an old invoice
decision onto a different new row and remove unreviewed value from the
checklist.

No product code was changed.

## Release-blocking findings

### High — the normal first visit does not register the service worker

The landing page and README claim **“Works offline after your first visit.”**
The registered claim test passes because it starts at `/demo`. The real landing
path does not behave the same way.

Fresh evidence:

- Eight of eight newly launched Chromium profiles opened live `/`, waited for
  network idle plus 750 ms, and had no service-worker registration, controller,
  or `unbilled:service-worker-ready` flag.
- In a separate fresh profile, after a cold live `/` visit and another 1.5 s
  wait, `navigator.serviceWorker.getRegistration()` was still absent. With the
  HTTP cache disabled and the context offline, reload failed with
  `net::ERR_INTERNET_DISCONNECTED`; the resulting document had no h1 or body
  content.
- The exact candidate build reproduced locally: cold `/` had no registration,
  while cold `/demo` immediately had an active registration and controller.

The cause is the timing in `registerServiceWorker()`: registration is placed in
a new `window.load` listener, but that function is called only after the
top-level real-workspace IndexedDB load. On `/`, the browser can fire `load`
before the listener is attached. The app never retries registration.

This directly contradicts a public claim and fails the required PWA first-use
offline path. Register immediately when `document.readyState === "complete"`,
or attach the listener before asynchronous initialization. Extend
`@claim:offline-reload` to start on `/` in a fresh context, then disable the HTTP
cache and network before the first reload.

### High — replacing work can silently apply an old invoice link to new work

The live app carried a prior reviewed link onto a different replacement row:

1. Imported one $100 completed row for `Extremely Long Client Organization
   Name` / `Quarterly Platform Migration`, plus invoice `INV-OLD`.
2. Explicitly linked that original row; the queue settled at `$0.00`.
3. Replaced the work CSV with a different, never-reviewed $500 row on the same
   date/client/project and row position: `New implementation task never
   reviewed`.
4. The app reported `1 work rows imported.`, showed `0 completed items to
   review` and `$0.00`, and displayed the new description under **Linked
   matches** with `INV-OLD`.
5. Only manually choosing **Unlink invoice** restored the new row and `$500.00`.

`idFor()` builds a row ID from sanitized values, truncates it to 50 characters,
and appends the row index. Long client/project text exhausts those 50 characters
before the description, so the two distinct rows receive the same ID. Work
replacement keeps `state.decisions`, and the collision silently attaches the
old decision to the new work.

This violates the central promise that invoice suggestions remain under the
user's control and can omit newly imported value from the exported checklist.
Use a collision-resistant identity over every identifying field and reconcile
or clear decisions when replacing work. Add a claim regression that replaces
linked work with a different same-date/client/project row and asserts that the
new row remains in the list until reviewed.

### High — the mobile import shortcut is below the 44 px touch minimum

At the required 390 px viewport, the visible **“Or import your CSV files”**
landing action measured `218.3 × 24.8` CSS px. It is an actionable, non-inline
anchor, but `.secondary-link` has no 44 px minimum. All demo controls passed the
same measurement. This violates the attached accessibility and design baseline
for 44 × 44 px touch targets.

## Other finding

### Medium — overflowing hours × rate produces an unhandled page error

A completed-work row with amount blank and two individually finite 200-digit
decimal values for hours and rate passes numeric parsing. Their product becomes
`Infinity`. The import shows no validation alert, leaves the mapping screen in
place, and emits the uncaught page error **“Refusing to save an invalid
workspace.”** The previously saved `$125.00` workspace survives reload and a
corrected import succeeds, so data was not lost, but the invalid-input path has
no user-facing recovery message. Validate the computed product with
`Number.isFinite` before mutating state and add the row-numbered regression.

## Mandatory first-read gate — PASS

A cold 1440 × 900 live visit in a fresh context returned 200 with no console or
page errors. The first viewport answered all three required questions:

- What: **“Find finished work you have not billed.”**
- Who: **“For freelancers and tiny agencies with work spread across task,
  time, and invoice tools.”**
- First action: **“Try it with sample data,”** beside **“See a filled review in
  one click.”**

One click opened `/demo`, immediately showing the persistent **“Demo — sample
data, nothing is saved”** banner, four queue rows, and `$5,840.00`. The same
primary action is visible in the first 390 × 844 viewport. Cold screenshot:
`/tmp/unbilled-first-read.png`.

## Mandatory claims gate — test commands PASS, live offline claim FAIL

`.factory/claims.json` exists with 26 entries. After `npm ci`, every listed
command was run separately and exactly from the clean candidate checkout. All
exited 0. Logs are under `/tmp/unbilled-claims-Hy0Nx6/`.

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
| `offline-reload` | PASS in its `/demo` sandbox; **fails live from `/`** |
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

The registry has exactly one `@claim:<id>` tag per entry and no undeclared
claim tags. Landing, README, demo, privacy, and terms wording were cross-checked
against the registry; no additional unlisted marketing claim was found.

## Clean local gates

- Initial checkout: clean, exactly
  `0a3ce7bff1dce3d25f95467549b02feb845a7ee8`.
- `npm ci`: PASS; 24 packages, 0 vulnerabilities.
- `npm test`: PASS; 38/38 Chromium 1.58.2 tests in 1.1 minutes.
- `npx tsc --noEmit`: PASS. There is no separate lint script.
- `npm run build`: PASS; the exact production build created `dist/index.html`.
- `npm audit --omit=dev`: PASS; 0 vulnerabilities.
- `git diff --check`: PASS before report edits.
- Brief, claims, manifest, and deployment configuration JSON all parse.
- Build output: JS 34,884 B / 12.19 KB gzip; CSS 15,795 B / 4.24 KB
  gzip; no fonts; mobile hero 30,612 B; largest hero 80,150 B. Budgets pass.

## Successful end-to-end evidence

Fresh live contexts independently confirmed:

- Demo link → review → reload → keyboard unlink: `$5,840.00` → `$3,640.00`
  → persisted `$3,640.00` → `$5,840.00`.
- Checklist download was `invoice-draft-checklist.csv` with the declared
  seven-column header and four data rows.
- **Start for real** removed every `demo:` session key and opened the empty real
  workspace.
- A representative import handled quoted commas, `$1,000.00`, 2 hours × $125,
  and `$0.01`; it excluded an in-progress row and an already-billed row, leaving
  three rows totalling `$1,250.01`.
- A blank client plus nonnumeric amount produced a row-numbered error and kept
  `$1,250.01`. An unclosed quote produced a specific error and also retained the
  workspace.
- Valid export/restore, date guards, match normalization, stale-invoice link
  cleanup, missing-status handling, and clear persistence passed in the full
  suite.

## Accessibility, keyboard, mobile, and visual QA

- Fresh live Axe 4.10.2 scans found **zero violations of any impact** on `/`,
  `/demo`, `/privacy`, `/terms`, the SPA missing route, `/offline.html`, and
  `/404.html`.
- Each route had `lang=en`, one h1, one main landmark, route metadata, and no
  console/page errors. `verify-url.sh` passed in 791 ms; evidence:
  `/tmp/unbilled-qa8-verify-url-Zglb6p/`.
- After network idle, the first Tab visibly focused the skip link with a 4 px
  blue ring. Enter moved to `#main`; the next Tab focused the sample-data action.
  Keyboard route activation focused the `/demo` h1. Space activated **Unlink
  invoice** in the functional flow.
- Root and demo had 0 px horizontal overflow at 390 × 844. All measured demo
  controls were at least 44 × 44 px; the landing shortcut defect is documented
  above. At 200% root text size, overflow remained 0 and the primary action was
  visible.
- With `prefers-reduced-motion: reduce`, maximum animation/transition duration
  was 0.01 ms and scroll behavior was `auto`.
- The product-specific paper/ink/coral visual thesis and original artwork are
  present and coherent on desktop and mobile. Screenshots:
  `/tmp/unbilled-qa8-mobile-root.png`,
  `/tmp/unbilled-qa8-mobile-demo.png`, and
  `/tmp/unbilled-qa8-live-desktop.png`.

## Privacy, security headers, caching, billing, and limits

- The cold page, complete demo review/export flow, real representative import,
  and invalid-input recovery produced no off-origin requests.
- Explicit invalid-license verification made exactly one expected request to
  `api.sociobot.in` and stored only `sb_license:unbilled-work-sweep` plus
  `sb_license_verdict:unbilled-work-sweep`.
- A fresh 35-request invalid-license burst returned 30 × 200 and 5 × 429. Every
  429 had `Retry-After: 4` and the live-origin CORS header. Observed allowance:
  **30 rapid requests per client/window**.
- The checkout endpoint returned 303 to a Dodo-hosted checkout session. No
  purchase was attempted and no payment form is embedded.
- Root responses include HSTS, `nosniff`, strict-origin referrer policy,
  permissions policy, and a restrictive CSP. HTML revalidates after 30 seconds,
  hashed JS/CSS/images cache immutably for one year, and `sw.js` is `no-cache`.
- `manifest.webmanifest` is served as `application/octet-stream`, but Chromium
  parsed it without manifest or installability errors. This MIME type remains a
  low-risk interoperability issue rather than an observed blocker.
- Every discovered HTTP link returned 2xx, except the expected checkout 303;
  the static missing-asset path correctly returned 404.
- There is no sign-in flow, product-owned backend, package, or CLI. Entra,
  backend concurrency/health/persistence, and consumer-package checks are not
  applicable.

## PWA and performance

- Starting at `/demo`, the live service worker controlled the page and cache
  `unbilled-work-sweep-7f6fa39140d2` contained all routes plus the current
  hashed JS/CSS. With the browser HTTP cache disabled, offline `/demo` reload
  retained four rows and `$5,840.00` without page errors.
- A live `registration.update()` check left the current worker active, no worker
  waiting, and the update notice hidden. The repository update-action and
  no-false-notice regressions passed. The normal-root registration failure
  prevents this path from being reached there.
- Fresh mobile Lighthouse on `/`: Performance 99, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.973 s, LCP 1.203 s, CLS 0, TBT 113 ms,
  transferred 64,531 B. Evidence: `/tmp/unbilled-qa8-lighthouse-root.json`.
- Fresh mobile Lighthouse on `/demo`: 100 in all four categories; FCP 0.988 s,
  LCP 1.076 s, CLS 0, TBT 63.5 ms, transferred 33,887 B. Evidence:
  `/tmp/unbilled-qa8-lighthouse.json`.

## Candidate/deployment identity

The fresh candidate build matches live byte-for-byte:

| Artifact | SHA-256 |
|---|---|
| `index.html` | `a5fedea215090b57f2ed2c5903925041b9ab3bd14f2f86700a8b83033d8a77b9` |
| `assets/index-ClpMTQIK.js` | `9a46790012b74991644ffcd23ce23bac0f6624a7eb0c7b1fdd5416e05f3fab49` |
| `assets/index-D8E-6dgc.css` | `6fd7e427250eeda4ed29d039498fa07e065dd654486c3024415326da55d79620` |
| `sw.js` | `7ff76b0334a6d65771045e5aa77b9525c247ad5ba14f1d0ec3c70ee51b29d6e6` |
| `manifest.webmanifest` | `9df996f16ae40f2778418d3c3dd3cb0bb0c82a0079993ca3224bf59e337f4e1d` |

Downloaded identity evidence: `/tmp/unbilled-qa8-identity-kieDoy/`.

## Required next steps

1. Make service-worker registration reliable from the normal `/` first visit
   and expand the offline claim test accordingly.
2. Replace the truncated row identity and explicitly reconcile decisions on
   completed-work replacement.
3. Give the mobile import shortcut a 44 px effective target.
4. Reject non-finite computed amounts with a row-numbered message.
5. Repeat independent verification against a newly deployed candidate.
