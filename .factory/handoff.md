# Unbilled Work Sweep — adversarial review 3 handoff

## Result

**FAIL.** Review commit candidate: `0050b5a2835d73fbefb3b93790137fcd1c83d15f`.
Verified URL: <https://unbilled-work-sweep.sociobot.in>.

The complete report is [`.factory/review-3.md`](review-3.md). Product code was
not modified.

## What was done

- Repeated the cold first read at 390 × 844 and 1440 × 900.
- Audited all landing and README sentences, headings, and actions.
- Exercised the live one-click demo, reset, session isolation, preservation of
  real data, request boundary, and offline reload.
- Ran all 30 claim commands separately from a clean clone, then ran the full
  43-test suite and production build.
- Rechecked every finding from reviews 1 and 2, both polish reports, and the
  prior handoff against live behavior and source.
- Crawled routes and links; checked metadata, focus/history, the static and SPA
  404s, security headers, visual identity, and live Axe results.
- Ran `/opt/fleet/lib/verify-url.sh` against production.

## Verification results

- Registered claim commands: **30/30 passed**.
- `npm test`: **43/43 passed**.
- `npm run build`: passed; `dist/` produced; JS 12.48 KB gzip, CSS 4.45 KB gzip.
- Live Axe: zero violations on `/`, `/demo`, `/privacy`, `/terms`, an unknown
  SPA route, and `/404.html`.
- Worker URL verifier: no console errors; title, language, one h1/main, alt text,
  and button labels present.
- Live demo/offline request logs: no off-origin or failed requests during the
  tested local flows.
- Candidate/live SHA-256 values matched for HTML, JS, CSS, service worker, and
  static 404.

## Known gaps and next steps

1. **BLOCKING F-3-1:** support merging completed-work exports from multiple
   task/time tools. The current second import replaces the first source.
2. **HIGH F-3-2:** strengthen `@claim:scope-boundaries`; it currently checks
   copy and button names rather than the promised behavior.
3. **MINOR F-3-3:** rename **Review history · paid** to a result-naming action.

Re-run all 30 claim commands and the complete live checklist after these three
findings are resolved.
