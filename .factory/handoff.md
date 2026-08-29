# Unbilled Work Sweep — adversarial review 2 handoff

## Result

**FAIL** at candidate `d3c13bcf8c1f3ebd0dac4dfb6ca319bb3f1e2b0c`.
No product code was changed. The complete review is in
[`.factory/review-2.md`](review-2.md).

## What was done

- Cold-opened the live landing page in fresh 390 × 844 and 1440 × 900 Chromium
  contexts before scrolling.
- Exercised the one-click demo, link/reset/start-real flow, real/demo storage
  isolation, live offline reload, and outbound request logging.
- Read the brief, design record, claims registry, README, review 1, polish 1,
  and the prior handoff; rechecked every earlier finding in live behavior and
  source.
- Ran all 26 claim commands separately after `npm ci` in a clean local clone.
- Ran the full 38-test suite and production build in that clean clone.
- Checked route titles, metadata, canonicals, h1/main structure, 404s,
  back/forward focus, links, security headers, Axe results, and visual identity.
- Completed sentence-by-sentence landing and README word counts and a missed
  leverage review.

## Verification summary

- Registered claims: 26/26 PASS individually.
- `npm test`: PASS, 38/38.
- `npm run build`: PASS; `dist/index.html` produced.
- Live Axe across `/`, `/demo`, `/privacy`, `/terms`, SPA 404, and static 404:
  zero violations.
- Worker URL verifier: PASS; no console errors, missing alt text, or unlabeled
  buttons.
- Link crawl: no dead links; checkout returned the expected 303.
- Live offline demo: PASS with `$5,840.00`; no failed or off-origin requests.
- Demo isolation and Reset: PASS after route-render waits.

## Findings left

- F-2-1 BLOCKING: the populated review begins below the initial 390 × 844 demo
  viewport.
- F-2-2 BLOCKING: the manifest still returns
  `Content-Type: application/octet-stream`, the unresolved prior-handoff issue.
- F-2-3 HIGH: four live/README promises lack claim-registry coverage.
- F-2-4 MEDIUM: the third desktop first-screen fact is clipped at 900 px height.
- F-2-5 MEDIUM: paid review history uses five inconsistent or vague terms, and
  README uses unexplained “normalized” matching jargon.

## Next step

Repair the five findings exactly as specified in `.factory/review-2.md`, add
the missing viewport/MIME/claim tests, deploy, and rerun this complete review
from fresh contexts. A PASS requires zero remaining findings.
