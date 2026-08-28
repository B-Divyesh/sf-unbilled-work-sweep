# Independent verification 2 — FAIL

Date: 2026-08-28  
Verifier work order: `unbilled-work-sweep-verify-2`  
Candidate commit: `5822c1e5f61c7a33376016f1882a7e55ce6318df`  
Live URL: <https://unbilled-work-sweep.sociobot.in>

## Release decision

**FAIL — do not release this candidate.** The former offline-shell and claims-inventory failures are repaired and deployed, but a fresh live browser falsely displays an actionable PWA update notice when no update exists. The control cannot work in that state.

## First read, cold live page

**Pass.** The first screen says it will **“Find finished work you have not billed”**, identifies **“freelancers and tiny agencies with work spread across task, time, and invoice tools”**, and offers **“Try it with sample data”** with **“See a filled sweep in one click.”** Clicking it opens `/demo`, showing the $5,840 sample queue and the persistent “Demo — sample data, nothing is saved” banner. Cold-load console/page errors: none.

## Required claims suite

`.factory/claims.json` exists with 14 entries. From this clean checkout, after `npm ci`, I ran every declared command exactly as written. All exited 0 against the demo entry point:

| Claim IDs | Result |
|---|---|
| `csv-import`, `review-matches`, `csv-export`, `local-only`, `offline-reload`, `local-persistence`, `workspace-backup` | PASS |
| `paid-license`, `hours-times-rate`, `invoice-date-guard`, `demo-isolation`, `free-core`, `billing-boundary`, `scope-boundaries` | PASS |

Every ID has exactly one matching `@claim:<id>` test. `npm test` also passed all 18 Chromium tests. `npm run build` passed and produced `dist/`.

## Release-blocking defect

### High — false, inoperable “updated version” control on normal visits

Fresh production browser evidence after a normal `/demo` visit, offline cached reload, then an online navigation:

- `registration.active.state` is `activated`; `registration.waiting` and `registration.installing` are absent.
- The notice is visibly rendered (`display: flex`, 1152×65 desktop pixels) and says “An updated version is ready.”
- Its element still has `hidden=""`; the visible state occurs because `src/styles.css:89` sets `.notice { display: flex; }`, overriding the user-agent `[hidden] { display: none; }` rule.
- The update handler has no waiting worker in this condition, so **Use update** performs no update.

This is a false state and an inoperable primary control in the required PWA update path. Restore hidden semantics (for example `.notice[hidden] { display: none; }`) and add a browser regression that asserts the notice is not visible when `registration.waiting` is absent. This report does not change product code.

## Successful evidence

- Clean checkout HEAD was exactly `5822c1e5f61c7a33376016f1882a7e55ce6318df`; working tree was clean before documentation handoff.
- Build output: `index-DR-Wy3uh.js` 29,423 bytes / 10,621 gzip bytes; CSS 14,686 bytes / 4,081 gzip bytes. Both meet the static/PWA budget.
- Live `index-DR-Wy3uh.js`, CSS, and `sw.js` compare byte-for-byte with the fresh candidate build (`cmp` exit 0). The deployed worker precaches the hashed JS and CSS in cache `unbilled-work-sweep-a29ebaa63a62`.
- Independent live PWA check: in a fresh context `/demo` loaded `$5,840.00`; after service-worker control, offline reload retained heading “Review work before you invoice”, the same total, and the queue. Cache Storage contained the shell, JS, and CSS assets.
- Live axe scans at `/`, `/demo`, `/privacy`, `/terms`, and `/missing-page` had zero serious or critical violations. The skip link was the first keyboard focus and entered the main landmark. At 390×844, demo overflow was 0px and Export checklist CSV was visible. Reduced-motion context reported 0.00001s transitions/animation.
- `/opt/fleet/lib/verify-url.sh` result: HTTP 200 in 628 ms; title present, `lang=en`, one h1, main landmark, no missing image alt, no unlabeled buttons, no console/page errors. Evidence: `/tmp/tmp.Uyyxzphgyb/verify.json`.
- Lighthouse mobile JSON was written despite the launcher reporting a final tab crash: Performance 97, Accessibility 100, Best Practices 100, SEO 100; LCP 1,150 ms, CLS 0, TBT 206 ms; no run warnings.
- Live response checks: root, demo, privacy, terms, 404, robots, sitemap, manifest, worker and built assets returned 200. HTTPS/HSTS, CSP, `nosniff`, strict-origin referrer policy, and permissions policy are present. Hashed assets are immutable and `sw.js` is `no-cache`.
- Privacy/network smoke test observed only same-origin startup/demo requests. The only optional API endpoint is Sociobot license verification. A 50-request harmless invalid-license burst returned 30×200 then 20×429, each 429 with `Retry-After: 4`; observed threshold: 30 rapid requests.
- No sign-in/authentication flow is present. The paid control is the required Sociobot checkout URL; there is no embedded card form.

## Functional coverage

The passing browser suite and claim tests cover completed-work/invoice CSV import, amount or hours × rate calculation, invoice-date guard, user-reviewed matches, CSV and workspace JSON exports/restores, real IndexedDB persistence, demo isolation/reset/leave behavior, free-core availability, paid-license mock verification, invalid CSV error state, routes, desktop/mobile layout, keyboard, and service-worker update targeting. The product remains appropriately scoped: it reviews exports only and does not invoice, time-track, calculate tax, alter source records, or use live account integrations.

## Required next step

Repair the hidden-state CSS and test the real no-waiting-worker state; then repeat independent verification. No product-code changes were made during this verification.
