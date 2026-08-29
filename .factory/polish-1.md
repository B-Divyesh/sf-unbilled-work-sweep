# Polish round 1

Candidate repaired from `3b9bb552828f022dfadbf9b4712dd898c9e4855a` using
adversarial review `2fb99ade18f57f75b02e905a49f3603449b3cba2`.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Rebuilt `public/404.html` as a complete product route with skip link, header/nav, footer/legal links, favicon, canonical, description, Open Graph, Twitter metadata, and the existing paper/ink/coral visual language. | `the static 404 fallback has the product skeleton, literal copy, and route metadata`; `.factory/evidence/polish-1-static-404.png`; post-deploy URL recorded in handoff. |
| F-1-2 | Replaced both fallback and SPA 404 copy with `404 error`, `Page not found`, and `Return home`. | Static-fallback test above and `routes, keyboard landmarks, and serious accessibility issues pass`; screenshot above; post-deploy URL recorded in handoff. |
| F-1-3 | Rewrote the hero eyebrow/caption, workspace and section labels, paid label, README opening and list wording; removed remaining `attention queue` UI language and the offline metaphor. Updated the copy audit and terminology table. | `.factory/copy-audit.md`; mobile demo screenshot `.factory/evidence/polish-1-demo-390.png`; landing/copy assertions in the full Playwright suite. |
| F-1-4 queue filtering | Registered `queue-filter`; added an isolated import test for completed, already-billed, and unfinished rows. Also recognize the documented `Already billed` header automatically. | `@claim:queue-filter excludes billed and unfinished work from the list`. |
| F-1-4 saved review history | Registered `snapshot-history`; mocked a valid license, saved two named states, and asserted both count/value records. | `@claim:snapshot-history saves two named review totals on this device`. |
| F-1-4 matching behavior | Registered `match-normalization`; made same-client, different-project rows ineligible when both projects are supplied. | `@claim:match-normalization suggests matching client and project wording, not a different project`. |
| F-1-4 service-worker wording | Removed the unproven README runtime-cache statement, then registered and tested the actual same-origin runtime-cache behavior. | `@claim:runtime-asset-cache stores a fetched same-origin asset for offline reuse`. |
| F-1-4 privacy payment-record statement | Removed the untestable payment-record statement; privacy now only says what the app stores, covered by the existing claim. | `@claim:license-storage stores only the license token and latest verification result`. |
| F-1-5 | Extended the single `header-mapping` claim test to manually map unrelated invoice headers and assert the resulting invoice suggestion. | `@claim:header-mapping imports manually mapped columns with unrelated header names`. |

Local evidence before deployment: `npm ci`, every registered claim command from a clean clone, `npm test` (38 passed), `npm run build`, the static/SPA route and axe checks, and mobile screenshots named above. Live cold-open evidence is appended to `.factory/handoff.md` after deployment.
