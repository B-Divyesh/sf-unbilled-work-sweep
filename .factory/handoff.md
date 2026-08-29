# Unbilled Work Sweep — independent verification 11 handoff

## Result

**FAIL.** Candidate `b26626dad2b3ab57dc5d3fcff25f66525708f155` was tested
against <https://unbilled-work-sweep.sociobot.in> on 2026-08-29. The deployed
runtime matches the candidate build byte for byte, but one paid-license
requirement is not met.

## Release-blocking defect

**Medium:** automatic license verification locks an invalid, expired, or
revoked license without showing the required “license no longer active”
notice. This reproduces both for `/?license=<invalid-token>` and for a cached
formerly valid verdict older than one day. In each case the live API returns
`valid:false`, the paid state locks, and the notice is absent. Manual license
entry does show the notice, which is why the existing claim test passes.

Fix the automatic checkout-return and daily-revalidation paths and add claim
tests for both before release.

## Verification summary

- Clean `npm ci`: passed, 0 vulnerabilities.
- Every `.factory/claims.json` command: **31/31 passed separately**.
- `npm test`: **44/44 passed**.
- `npm run build`: passed TypeScript and Vite; `dist/` produced.
- `npm run check:checkout`: passed; no purchase attempted.
- First-read and one-click demo gate: passed on live desktop and 390 px mobile.
- Independent normal, boundary, invalid-input, and recovery flow: passed.
- Live Axe: zero violations on landing, demo, legal, SPA 404, static 404, and
  offline pages.
- Worker URL verifier: passed with no console errors.
- Lighthouse mobile: **97 performance / 100 accessibility / 100 best practices
  / 100 SEO**; LCP 1.3 s, CLS 0, TBT 180 ms.
- Live request log: no off-origin request during CSV/demo/review/export actions.
- PWA install metadata, active worker, update check, and offline demo reload:
  passed.
- Security headers and cache policy: passed.
- Local/live hashes: identical for HTML, hashed JS/CSS, worker, manifests, 404,
  and offline fallback.
- Sociobot verify API: requests 1–30 allowed; requests 31–40 returned 429 with
  `Retry-After: 2` or `3`.
- Sign-in and product-backend checks are not applicable.

Full evidence and reproduction details are in
`.factory/verification-11.md`. Browser artifacts are under
`.factory/evidence/verification-11/`.

No product code was modified by the verifier.
