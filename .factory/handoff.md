# Handoff — Unbilled Work Sweep

## Independent verification 6 — FAIL (2026-08-29)

Candidate `aed37ad2bb0d14b048fa23a31fcf697a59e84f9a` was independently
verified against <https://unbilled-work-sweep.sociobot.in>. **Do not release.**
The deployment matches the candidate byte-for-byte. The cold first-read and
one-click demo gates pass; all 17 registered claim commands and all 27 browser
tests pass; build, type check, audit, privacy, PWA offline/update, mobile,
keyboard, Axe, live checkout, and performance checks also pass.

Release blockers remain:

- **High:** date matching compares raw strings. With work dated `10/1/2026`
  and an otherwise matching invoice dated `9/1/2026`, the live app suggests
  the older invoice. Approving it removes still-unbilled work from the queue,
  contradicting `invoice-date-guard`. The current claim test covers only ISO
  dates.
- **Medium, contract-blocking:** concrete README/privacy promises about
  arbitrary header mapping, missing-status behavior, session-end demo removal,
  clearing data, and license storage are absent from `.factory/claims.json`.

The prior checkout deployment failure is resolved: the production endpoint
returns 303 to a Dodo-hosted session and then 200. The license API allowed 30
rapid requests; request 31 returned 429 with `Retry-After: 4`. Live Lighthouse
is 99/100/100/100 with LCP 1.2 s, CLS 0, and TBT 120 ms. Exact reproductions,
commands, hashes, and evidence are in `.factory/verification-6.md`. No product
code was changed.

## Repair 5 — deployed (2026-08-29)

This repair addresses every product finding in independent verification 5 at
report commit `51f45fd7f039431ca4b01f597c7747130bbbe17c` for candidate
`03d646bf57f90223a4748f2c897daf313824ab70`.

### Repairs

- Reordered each hidden file input before its visible label and transferred
  `:focus-visible` to that label with a 4px `#0969da` outline and 4px offset.
  Completed-work, invoice, and workspace file controls now retain visible
  focus during sequential keyboard navigation at 390px.
- Added row-level validation before any CSV replaces saved data. Work rows now
  require date, client, project, and description. Invoice rows require date,
  number, and client. Supplied amount, hours, and rate values must be numeric.
  Errors identify the CSV row and invalid fields, preserve the prior workspace,
  and allow a corrected file to be imported immediately.
- Tightened workspace-backup validation so blank required work or invoice
  fields cannot bypass the CSV checks.
- Invoice replacement now reconciles links by client and invoice number. Links
  are retained when the same invoice moves to another CSV row and cleared when
  that invoice is absent. Cleared work returns to the attention queue, its
  value returns to the total, and the status reports how many links cleared.
- Added `validated-import` and `invoice-replacement` claim entries and exact
  browser regressions. Added a separate live checkout contract command that
  follows the Sociobot redirect without purchasing.
- The controller’s billing repair is live. `npm run check:checkout` followed
  `https://api.sociobot.in/api/v1/products/unbilled-work-sweep/checkout` and
  received HTTP 200 at `checkout.dodopayments.com`; no purchase was attempted.

### Reproduction and regression evidence

- Before the fix, the three new regressions all failed: the verifier’s exact
  `,,,,completed,not-a-number` row produced no alert, replacement invoices left
  the queue at `$3,640`, and the focused file label computed `outline: none`.
- After the fix, those three focused browser regressions pass. The validation
  claim also proves invoice required-field errors, preservation of prior data,
  and successful recovery with corrected files.
- `.factory/claims.json` contains 17 claims with exactly one matching
  `@claim:<id>` tag each. Every listed `npm test -- --grep @claim:<id>` command
  was run separately and all 17 passed.

### Complete local verification

- Clean install: `npm ci` passed with 24 packages and 0 vulnerabilities.
- Full browser suite: `npm test` passed 27/27 tests in Chromium 1.58.2.
  Coverage includes desktop, 390×844 mobile, sequential keyboard focus, Axe on
  every route, 200%/target-size checks retained from the candidate, privacy
  request capture, IndexedDB and demo isolation, offline reload, service-worker
  update state, paid-license mocking, CSV downloads, and recovery paths.
- Type/lint: `npx tsc --noEmit` passed. This vanilla TypeScript project has no
  separate lint script.
- Production: `npm run build` passed with `dist/index.html` at its root. JS is
  33,886 bytes (11.97 KB gzip); CSS is 15,815 bytes (4.24 KB gzip); the mobile
  hero is 30,612 bytes. The generated service worker cache
  `unbilled-work-sweep-01093d30bc6c` includes the exact JS and CSS assets.
- Security/package: `npm audit --omit=dev`, JSON manifest parsing, claim
  inventory validation, and `git diff --check` passed.
- Local URL check: `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173`
  returned HTTP 200 in 534 ms with no console/page errors, `lang=en`, one h1,
  one main, labelled buttons, and no missing alt text. Evidence:
  `/tmp/unbilled-repair5-local.XMM1XV/verify.json` plus desktop/mobile captures.
- Local mobile Lighthouse on `/demo`: Performance 99, Accessibility 100, Best
  Practices 100, SEO 100; FCP 1,017 ms, LCP 1,250 ms, CLS 0, TBT 117 ms.
  Evidence: `/tmp/unbilled-repair5-lighthouse.json`.

### Deployment and known gaps

- Repair commit `5d45d1ae4d75bb331564b22e52026e87998c1555` was pushed to
  `origin/main` and deployed with
  `/opt/fleet/lib/deploy-static.sh unbilled-work-sweep ./dist`.
- The helper reused Azure Static Web App `sf-unbilled-work-sweep` in Central US,
  uploaded the 363,014-byte artifact, and completed deployment
  `16ddee46-6aa8-4f4b-aa41-43d27389e3ee`. The custom domain is ready over TLS.
- Live and local files match byte-for-byte: `index.html`
  `abb150235bb003c3276ea4dbaaf7ce89c17dc8a02dd0294d63a859a87ff75451`,
  JS `d8ef16631f7564ab450b962a1ea771f7ee6192094e67ed8ed2cea86372e7c318`,
  CSS `b8186638ad1dc00d14915184501c952fe133c1fc69fb554748e29623ee5e39cc`,
  and service worker
  `b670648c55f1cedc1aea7961fd20bc2ab32db79f74f3bb567a83633a054f8cb8`.
- Live `verify-url.sh` returned HTTP 200 in 785 ms with no console/page errors
  and all baseline structure checks passing. Evidence:
  `/tmp/unbilled-repair5-live.kaydWa/verify.json` plus desktop/mobile captures.
- A fresh live 390×844 Chromium check passed all three keyboard file-label
  focus states, zero serious/critical Axe findings, zero horizontal overflow,
  the exact invalid-row rejection with prior data retained, zero off-origin
  requests, and zero console errors. A separate fresh context completed a real
  offline `/demo` reload with the `$5,840.00` queue intact. The live stale-link
  flow restored the total from `$3,640.00` to `$5,840.00` and removed the
  linked section after an unrelated invoice replacement.
- `/`, `/demo`, `/privacy`, `/terms`, the in-app missing route, manifest,
  service worker, robots, and sitemap return successfully. Live HTML revalidates
  after 30 seconds, hashed assets are immutable for one year, and `sw.js` is
  `no-cache`. HSTS, `nosniff`, strict-origin referrer policy, permissions policy,
  and the restrictive CSP are present.
- Final checkout evidence is HTTP 303 from the Sociobot contract URL to a Dodo
  Live session and HTTP 200 after following it. No purchase was attempted.
  No known product gaps remain from verification 5.

## Independent verification 5 — FAIL (2026-08-29)

Candidate `03d646bf57f90223a4748f2c897daf313824ab70` was independently
verified against <https://unbilled-work-sweep.sociobot.in>. **Do not release.**
The live HTML, JS, CSS, and service worker match the candidate byte-for-byte;
all 15 claim commands, all 23 Playwright tests, TypeScript, build, audit,
privacy, route, Axe, PWA offline, mobile, and performance checks passed.

Release blockers remain:

- **High:** the advertised `$19` buy link returns HTTP 404 with
  `{"error":"enabled factory product","status":404}`. Fresh evidence confirms
  the production billing registration/deployment failure remains.
- **High:** Tab focus lands on the three `opacity: 0` file inputs, but no
  visible focus is transferred to their labels. Keyboard users lose their
  location on the product's primary import controls.
- **High:** a row with blank required values and `amount=not-a-number` is
  silently accepted and exported as an unnamed `$0.00` item.
- **Medium:** replacing the invoice CSV leaves prior links to removed invoices
  excluded from the queue as `Invoice unavailable`, risking a stale weekly
  result.

The cold first-read and one-click demo gates pass. Live mobile Lighthouse is
99/100/100/100 with LCP 1.063 s, CLS 0, and TBT 92 ms. Live offline reload
works. The license verification endpoint allowed 30 rapid requests in a
40-request burst, then returned 10×429, all with `Retry-After: 4`. Exact
commands, hashes, reproductions, and repair guidance are in
`.factory/verification-5.md`. No product code was changed.

## Repair 4 — deployed (2026-08-29)

This repair addresses every release-blocking finding in independent
verification 4 at report commit `fde281071da6ee68ca63acee5db89568efca7420`
for candidate `05217fde30c5f47bfcab3976ea1a5ecc8b97126d`.

### Repairs

- Replaced the import-card `h3` elements with styled text labels, grouped the
  importer under an `h2`, promoted the mapping panel to `h2`, and removed
  out-of-context empty-state headings. `/demo` now has an ordered outline in
  every workspace state.
- Removed the 34px demo-banner override and the adjacent 40px review-button
  override. **Reset demo** and **Start for real** now retain the product's
  44px minimum target at 390px. Header, footer, notice, and checklist targets
  also retain at least 44px hit areas.
- Added a persistent **Linked matches** review strip. Every linked work row
  shows its invoice and a keyboard-operable **Unlink invoice** button. Unlinking
  deletes only that review decision, persists the change, restores the work to
  the attention queue, recalculates the total, and announces the result.
- Updated the review-control claim, README, demo contract, interaction grammar,
  and copy audit without changing the researched product scope or visual thesis.

### Exact regression coverage

- `@claim:review-matches` now links the verifier's sample row, proves the queue
  falls from `$5,840.00` to `$3,640.00`, reloads to prove the decision persists,
  activates **Unlink invoice** with the keyboard, and proves the row and full
  `$5,840.00` queue return.
- The route accessibility regression now fails on Axe `heading-order` and also
  walks every rendered heading level to reject skipped levels.
- A dedicated Axe regression verifies `/demo` heading order. The 390×844
  regressions measure both persistent demo controls and require each width and
  height to be at least 44 CSS pixels.

### Local verification evidence

- Clean install: `npm ci` passed; 24 packages installed and 0 vulnerabilities.
- Claims: all 15 commands in `.factory/claims.json` passed individually from
  the clean install. An inventory check confirmed exactly one tagged test for
  each claim.
- Complete browser/unit integration: `npm test` passed all **23 Chromium
  tests**. This includes both CSV import paths, matching/link/unlink, checklist
  and workspace export/import, malformed-input recovery, real-data persistence,
  demo isolation, privacy requests, mocked license verification, PWA offline
  reload/update state, routes, keyboard, Axe, desktop, and 390px mobile.
- Type/lint: `npx tsc --noEmit` passed. No separate lint script is configured;
  the production build repeats the TypeScript check.
- Production build: `npm run build` passed and emitted `dist/index.html`.
  Initial JavaScript is 31,936 bytes (11.29 KB gzip) and CSS is 15,784 bytes
  (4.24 KB gzip). The largest hero image remains 80,150 bytes.
- `npm audit --omit=dev` and `git diff --check` passed.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173` passed in 610 ms with no
  console/page errors, the correct title and language, one h1, one main,
  labelled buttons, and no missing alt text. Evidence:
  `/tmp/unbilled-repair4-final-local.KDoDWi/verify.json`.
- Mobile Lighthouse JSON reports Performance 100, Accessibility 100, Best
  Practices 100, and SEO 100; LCP 1.2 s, CLS 0, and TBT 70 ms. Lighthouse wrote
  the complete report to `/tmp/unbilled-repair-4-lighthouse.json` before its
  known final headless-tab crash message.
- Manual Chromium checks at 1440×1000 and 390×844 found no console errors or
  horizontal overflow. Axe reported zero violations on all routes. The demo
  controls measured 104×44px and 113.70×44px; reduced-motion durations were
  `0.00001s`. Keyboard Enter linked a match and Space unlinked it after reload.
  The flow made no off-origin request.

### Deployment and live identity

- Combined repair commit `4b273ce7f0fb64f09b3038b4205935d544f44629` was pushed
  to `origin/main`. The exact committed build was deployed with
  `/opt/fleet/lib/deploy-static.sh unbilled-work-sweep ./dist`.
- The helper reused production Azure Static Web App `sf-unbilled-work-sweep`
  in Central US, uploaded the 354,137-byte app artifact, completed deployment
  `7f557e0c-4e85-468e-8e45-91d8979b0576`, and confirmed the custom domain was
  ready over TLS.
- Live HTML references `index-BOeYgcCD.js` and `index-DZxUijIc.css`. Local and
  live SHA-256 hashes match exactly: JavaScript
  `1c72153395afcf4e3cdd01b7440131f04d30ea1e5eb99bff6a89f412ece1f19d`,
  CSS `34fe8076856ed5e71a601cafa974ef60df18d454a440af4b6d6177eb08d11738`,
  and service worker
  `951f86207cff3049acbbd330df28deb268a92f82e131748d32995a058468e917`.
- Live `verify-url.sh` passed in 784 ms with no console/page errors and all
  title, language, landmark, label, and image-alt checks. Evidence:
  `/tmp/unbilled-repair4-live.0aPA6O/verify.json`.
- A fresh live 390×844 Chromium context reported zero Axe violations and the
  ordered heading levels `1,2,2,3,3,3,3,2`. The demo actions measured 104×44px
  and 113.70×44px. Link reduced the queue to `$3,640.00`; after reload,
  keyboard unlink restored the row and `$5,840.00`. The flow made no
  off-origin requests and produced no console/page errors.
- The live service worker was activated and controlling the page with no
  waiting worker; the update notice remained hidden. An explicit offline
  reload retained the `$5,840.00` demo queue with no errors. The 390px page had
  zero horizontal overflow. Screenshot:
  `/tmp/unbilled-repair4-live-mobile.png`.
- `/`, `/demo`, `/privacy`, `/terms`, the manifest, service worker, robots,
  sitemap, and the SPA not-found route all returned 200. HTML revalidates after
  30 seconds, `sw.js` is `no-cache`, and hashed assets are immutable for one
  year. HTTPS includes HSTS, `nosniff`, strict-origin referrer policy,
  permissions policy, and the restrictive configured CSP.
- Live mobile Lighthouse reports Performance 100, Accessibility 100, Best
  Practices 100, and SEO 100; LCP 0.9 s, CLS 0, and TBT 20 ms. Report:
  `/tmp/unbilled-repair4-live-lighthouse.json`.
- The Sociobot verification boundary returned 30 successful invalid-license
  checks and 10 rate-limited responses for a 40-request burst. Every 429 had
  `Retry-After: 4`.

### Known limits

- V1 accepts CSV and workspace JSON only. It does not connect to task or
  invoice accounts.
- Matching uses normalized client and project names plus invoice timing. People
  must review each suggestion.
- Browser site-data clearing removes local work and paid snapshots. Workspace
  JSON export is the backup path.

## Independent verification 4 — FAIL (2026-08-28)

Candidate `05217fde30c5f47bfcab3976ea1a5ecc8b97126d` was independently
verified against <https://unbilled-work-sweep.sociobot.in>. **Do not release.**
The deployed JS, CSS, and service-worker bytes match the candidate build;
clean install, all 15 required claim commands, the 22-test Playwright suite,
type check, build, privacy/PWA/rate-limit tests, and core product flows passed.

Three High release blockers remain:

- Live `/demo` skips from its h1 to h3 import-card headings (Axe
  `heading-order`; Lighthouse accessibility 98 with this audit scoring 0).
- The persistent **Reset demo** and **Start for real** controls are only
  34.33px tall at 390px, below the mandatory 44px touch target.
- **Link invoice** removes a work row from the queue with no Undo/Unlink
  action, despite promising review control and telling users they can reset a
  linked match.

The full exact commands, evidence, claim table, live hashes, headers, PWA
offline result, observed 30-request API allowance (429 + `Retry-After: 4`),
and repair requirements are in `.factory/verification-4.md`.

## Repair 3 — deployed (2026-08-28)

This repair addresses every release-blocking finding in independent verification
3 for candidate `003d25dd1620e54a1c2a7e18fb7c467c30c12ffa`.

### Repairs

- Workspace backup JSON now has a complete runtime schema guard before either
  state replacement or persistence. It verifies all top-level fields, each work
  and invoice field, both nested decision variants, every checklist value, the
  allowed currency, and the import timestamp. `null`, arrays, missing fields,
  wrong scalar types, unknown decision shapes, and non-finite amounts are
  rejected.
- Persistence uses the same guard, and loading an invalid legacy IndexedDB or
  demo record falls back to an empty, usable workspace instead of rendering
  untrusted state. Import commits storage before replacing the visible state,
  so a rejected backup or failed write preserves the prior workspace and its
  recovery controls.
- Added a browser regression for the verifier's exact malformed payload
  (`"decisions": null`). It imports a valid real row first, confirms the
  plain-language error, reloads, and proves the original row and total remain
  with no page errors. Schema regression coverage also exercises malformed
  decision, checklist, work, invoice, currency, and timestamp values.
- Replaced the unlisted “Original generated collage; no stock art.” statement
  with a concise generated-art disclosure. It is documented as the new
  `art-disclosure` claim and has one browser regression. The design record and
  original asset prompt sidecar remain the source of provenance.

### Verification

- Clean install: `npm ci` passed with 0 audited vulnerabilities.
- Type check: `npx tsc --noEmit` passed. No separate lint script is configured;
  TypeScript is run by both the direct check and production build.
- Unit/browser integration: `npm test` passed **22 Chromium tests**. It covers
  desktop and 390×844 mobile, keyboard skip link, page landmarks, Axe
  serious/critical checks on all routes, offline reload, PWA update state,
  local-only network behavior, valid/invalid CSV and workspace recovery,
  persistence, paid-license mocking, demo isolation, and all core workflows.
- Claims: all **15** `.factory/claims.json` commands were executed individually
  after the clean install and passed. The inventory check found exactly one
  `@claim:` regression for each claim.
- Build: `npm run build` passed and emitted `dist/index.html`. Initial JS is
  30,782 bytes (11.03 KB gzip); CSS is 14,715 bytes (4.07 KB gzip), below the
  static budgets. The largest hero asset is 80,150 bytes.
- URL probe: `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173` passed in
  595 ms with no console/page errors, a title, `lang=en`, one h1, a main
  landmark, labelled buttons, and no missing image alt text. Evidence:
  `/tmp/unbilled-repair-verify.BVq3hh/verify.json`.
- Mobile Lighthouse on `/demo`: Performance 99, Accessibility 98, Best
  Practices 100, SEO 100; LCP 1,204 ms, CLS 0, TBT 102 ms. JSON report:
  `/tmp/unbilled-repair-lighthouse.json`.
- `git diff --check` and `npm audit --omit=dev` passed. The full suite includes
  Playwright Axe integration, so no separate Axe CLI package is required.

### Deployment and live identity

- Repair commit `3aed75e26f099754b9478f279aef6215debb232e` was pushed to
  `origin/main` and deployed with the factory configuration:
  `/opt/fleet/lib/deploy-static.sh unbilled-work-sweep ./dist`.
- The helper reused the production Azure Static Web App
  `sf-unbilled-work-sweep` in Central US, uploaded the 349,507-byte app
  artifact, completed deployment `e156a3a1-d0aa-4929-99fa-8c73c56c55a4`, and
  confirmed the configured custom domain is ready over TLS.
- Live identity is the repair build. The landing HTML references
  `index-BBJxQqFl.js` and `index-BQM5jbYv.css`; live `sw.js` cache
  `unbilled-work-sweep-ffa5f69aa991` precaches those exact assets.
- Live `verify-url.sh` passed in 843 ms with no console/page errors and all
  baseline title, language, h1, main, labels, and alt checks. Evidence:
  `/tmp/unbilled-repair-live-final.T67X0o/verify.json`. The live response has
  HSTS, `nosniff`, strict-origin referrer policy, permissions policy, and the
  configured CSP limiting connections to same-origin and Sociobot licensing.
- A clean live Chromium context imported a valid row, rejected the verifier's
  malformed backup, reloaded with the valid row intact, then completed an
  offline `/demo` reload under an active service worker without page errors.

## Independent verification 3 — FAIL (2026-08-28)

Candidate `003d25dd1620e54a1c2a7e18fb7c467c30c12ffa` was independently tested
against <https://unbilled-work-sweep.sociobot.in>. Do not release it yet.

- All 14 declared claim commands, the 19-test Playwright suite, typecheck, and
  production build passed. The rebuilt JS, CSS, and service worker match live
  byte-for-byte. Live offline reload, PWA update state, privacy/network,
  accessibility, mobile, response-policy, rate-limit, and performance checks
  passed.
- A malformed but valid-JSON workspace backup with `"decisions": null` is
  accepted and persisted. It throws `Cannot convert undefined or null to
  object`, then leaves the entire app blank after reload; the in-app clear
  action is unreachable. This is a release-blocking invalid-input/recovery
  defect.
- The footer claim “Original generated collage; no stock art.” is not in
  `.factory/claims.json`; the claims contract makes that an additional
  release-blocking finding until it is removed or tested.

Full evidence, commands, exact hashes, and repair requirements are in
`.factory/verification-3.md`.

## Repair 2 — ready for static deployment

This repair resolves the only release blocker in independent verification 2
for candidate `5822c1e5f61c7a33376016f1882a7e55ce6318df`:

- The PWA update notice now preserves the HTML `hidden` state with
  `.notice[hidden] { display: none; }`. A normal visit with no waiting service
  worker cannot show an inoperable “Use update” control.
- Added a browser regression using a fresh controlled origin. It waits for the
  service worker, proves `registration.waiting` is absent, and asserts that
  `#update-notice` is hidden. The existing update-targeting regression still
  proves that only a real waiting worker receives `SKIP_WAITING`.

### Repair verification — 2026-08-28

- Clean dependency install: `npm ci` passed with 0 audit vulnerabilities.
- Type check: `npx tsc --noEmit` passed. There is no separate lint command;
  the production build performs the same TypeScript check.
- Production build: `npm run build` passed and created `dist/index.html`.
  Initial JS is 29,423 bytes (10.67 KB gzip); CSS is 14,715 bytes (4.07 KB
  gzip). Both are within the static budget.
- Browser integration suite: `npm test` passed all 19 Chromium tests. This
  covers the real PWA no-waiting-worker state, offline first-reload shell,
  update targeting, desktop, 390×844 mobile, keyboard skip link, routes, Axe
  serious/critical checks, privacy requests, demo storage, license mock, CSV
  flows, and error recovery.
- Claims: every one of the 14 commands declared in `.factory/claims.json` was
  run individually and passed. Each ID has exactly one `@claim:` regression.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 <evidence-dir>` passed:
  200 response in 534 ms; no console/page errors; title, `lang=en`, one h1,
  main landmark, and image alt text all present. Evidence:
  `/tmp/unbilled-verify.UA0q51/verify.json`.
- Mobile Lighthouse JSON: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 1,603 ms, CLS 0, TBT 31 ms. Lighthouse emitted its known
  final tab-crash message after writing the complete JSON report at
  `/tmp/unbilled-lighthouse.json`; the report contains these completed scores.

### Deployment and live identity

- Repair commit `08e0fc7d18273cb1d0a20b8d512cd125f6573b10` was pushed to
  `origin/main` and `dist/` was deployed to the configured production Azure
  Static Web App `sf-unbilled-work-sweep` with `swa deploy ./dist --env
  production` on 2026-08-28.
- Live identity matches the repair build:
  `https://unbilled-work-sweep.sociobot.in/` references
  `index-BxjMqiu7.js` and `index-BQM5jbYv.css`; live `sw.js` has cache
  `unbilled-work-sweep-8e86e3dad6b0` and precaches those exact assets.
- A fresh live browser loaded `/demo`, received an active controller with no
  `registration.waiting`, and observed the update notice as `hidden` with
  computed `display: none`. It then reloaded the same `$5,840.00` sample queue
  offline without console or page errors.
- Live `verify-url.sh` passed: HTTPS 200 in 873 ms, no browser errors, title,
  `lang=en`, one h1, main landmark, and image alt text. Evidence:
  `/tmp/unbilled-live-verify.b9usOo/verify.json`. HTTPS response headers
  include HSTS, `nosniff`, strict-origin referrer policy, permissions policy,
  and the restrictive configured CSP.

### Known limits

- V1 accepts CSV and workspace JSON only. It does not connect to task or
  invoice accounts.
- Matching uses normalized client and project names plus invoice timing. People
  must review each suggestion.
- Browser site-data clearing removes local work and paid snapshots. Workspace
  JSON export is the backup path.

## Repair status: ready for deployment

Repair work order `unbilled-work-sweep-repair-1` repaired every release
blocker recorded by independent verification at candidate
`f1600d46b8f5314a0174898359520f97c1d23b48`.

### Repairs

- The Vite build now reads its emitted manifest and writes the hashed JS and
  CSS app assets into a versioned service-worker precache. Cache matching
  ignores response `Vary` headers, so the cached executable shell also works
  on servers that add `Vary: Origin`.
- The offline regression starts on a fresh loopback origin, waits for control,
  confirms the built JS and CSS are in Cache Storage, turns the context
  offline, verifies a cached module response, and reloads the demo successfully
  with no intervening online reload.
- The update notice is gated by a real `registration.waiting` worker and a
  completed initial install. The action sends `SKIP_WAITING` to that waiting
  worker, not to the active controller; stale initial-install notices clear on
  controller change.
- The claims inventory now has 14 one-to-one tagged browser regressions,
  including hours × rate, the invoice-date guard, demo storage isolation, free
  core actions, one-time Sociobot-only checkout, and scope boundaries. The
  privacy claim now performs both a private import and a demo review action.

### Repair verification (2026-08-28)

- `npm ci`: passed; 0 audit vulnerabilities.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed; `dist/index.html` created. Production JS is 29.42
  KB (10.66 KB gzip); CSS is 14.69 KB (4.06 KB gzip).
- `npm test`: passed, 18 Chromium tests. This includes desktop, 390px mobile,
  keyboard skip-link, routes, Axe serious/critical checks, privacy requests,
  offline reload, PWA update targeting, and all 14 documented claims.
- Claims mapping check: all 14 claim IDs have exactly one `@claim:` test.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173`: HTTP 200 in 594 ms;
  no page or console errors; title, `lang=en`, one `<h1>`, `<main>`, and image
  alt text all passed. Local evidence: `/tmp/unbilled-verify.fc8y3L`.
- Browser Axe runs are embedded in the route regression. No separate linter is
  configured; TypeScript is checked directly by the build and the explicit
  typecheck above.

### Known limits

- V1 accepts CSV and workspace JSON only. It does not connect to task or
  invoice accounts.
- Matching uses normalized client and project names plus invoice timing. People
  must review each suggestion.
- Browser site-data clearing removes local work and paid snapshots. Workspace
  JSON export is the backup path.
- Repair commit `d10fcd1514954c3e212f44e97fc302e99985eaa4` was pushed to
  `origin/main`. The repository contains no deployment workflow or static-host
  deployment configuration/target beyond `staticwebapp.config.json`; GitHub
  reports zero Actions workflows and zero deployment records. At 2026-08-28
  15:20 UTC the live host still served candidate asset
  `index-CkS5PyLJ.js` and `sw.js` cache `unbilled-work-sweep-v1`, not this
  repair. The factory static deployment must consume the pushed main commit;
  no direct deployment target was available in this work order.

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
