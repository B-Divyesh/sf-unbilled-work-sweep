# Independent verification 5 — FAIL

Date: 2026-08-29  
Verifier work order: `unbilled-work-sweep-verify-5`  
Candidate commit: `03d646bf57f90223a4748f2c897daf313824ab70`  
Live URL: <https://unbilled-work-sweep.sociobot.in>

## Decision

**FAIL — do not release.** The deployed static application matches the
candidate exactly, the free core workflow is usable, and every declared claim
test passes. However, the advertised purchase cannot start because the live
Sociobot checkout endpoint returns 404. Keyboard focus is invisible on all
three file inputs, and semantically invalid financial rows are silently
accepted as valid $0 work. These are release blockers under the billing,
accessibility, invalid-input, and end-to-end requirements.

## Release-blocking findings

### High — the advertised $19 purchase link returns HTTP 404

The landing page's **Buy saved review tools** link correctly points to the
contract URL, but a fresh request to that live URL does not start hosted
checkout:

```text
GET https://api.sociobot.in/api/v1/products/unbilled-work-sweep/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

The product advertises a $19 one-time purchase, so this leaves the paid product
unbuyable. The local `@claim:paid-license` test mocks only the verification
response, while `@claim:billing-boundary` asserts the link string; neither test
visits the production checkout. This is consistent with a missing or disabled
factory billing registration rather than a static deployment mismatch. Enable
the production product in the Sociobot billing engine and add a non-purchasing
live contract check that asserts checkout returns its expected redirect.

### High — keyboard focus disappears on every file chooser

On live `/demo` at 390×844, sequential Tab navigation reaches `#file-work` at
step 7, `#file-invoices` at step 8, and `#import-workspace` at step 12. Each
focused input has `opacity: 0`. Its computed focus outline is therefore also
invisible, while the corresponding visible label has `outline: none` and does
not match `:focus-visible`. The selector intended to transfer focus styling,
`.visually-hidden-file:focus + *`, cannot match because each visible label
precedes its input in the DOM.

The controls remain operable, but a sighted keyboard user cannot tell which
import action has focus. This violates the non-negotiable visible-focus rule.
Apply a visible focus state to the associated label (for example with a valid
sibling arrangement or `:has()`), and add a keyboard regression for all three
file choosers.

### High — invalid required values and amounts are accepted without warning

A fresh real workspace accepted this CSV and reported `1 work rows imported.`:

```csv
date,client,project,description,status,amount
,,,,completed,not-a-number
```

No alert appeared. The app produced an enabled export for one completed item
with no client, project, description, or date and a displayed value of `$0.00`.
The README calls date, client, project, and description required. Silently
coercing an invalid amount to zero can understate the value this product exists
to recover. Validate required cells and numeric inputs before replacing saved
data, report affected row numbers in plain words, and prove recovery with a
browser test.

## Additional finding

### Medium — replacing invoice data retains links to missing invoices

In a fresh demo, linking the first suggestion reduced the queue from `$5,840`
to `$3,640`. Replacing the invoice CSV with one unrelated invoice left the
total at `$3,640` and only three queue rows. The fourth work row remained under
**Linked matches** as `Invoice unavailable`, even though the current invoice
dataset no longer contains that invoice. This can conceal work after a weekly
replacement import. Either invalidate orphaned links, require confirmation to
retain them, or surface them in the attention count until reviewed.

## Mandatory claims gate

`.factory/claims.json` exists with 15 entries. After `npm ci`, every exact
listed command was run individually through the production demo entry point;
all passed. An inventory check found exactly one matching `@claim:<id>` tag for
each entry.

| Claim | Result |
|---|---|
| `csv-import` | PASS |
| `review-matches` | PASS |
| `csv-export` | PASS |
| `local-only` | PASS |
| `offline-reload` | PASS |
| `local-persistence` | PASS |
| `workspace-backup` | PASS |
| `paid-license` | PASS locally; live checkout fails as described above |
| `hours-times-rate` | PASS |
| `invoice-date-guard` | PASS |
| `demo-isolation` | PASS |
| `free-core` | PASS |
| `billing-boundary` | PASS locally; live checkout fails as described above |
| `scope-boundaries` | PASS |
| `art-disclosure` | PASS |

## Cold first-read gate — PASS

A new browser context opened the live root with no prior state. The first
screen says **“Find finished work you have not billed”**, identifies
**“freelancers and tiny agencies with work spread across task, time, and
invoice tools”**, and presents **“Try it with sample data”** beside **“See a
filled sweep in one click.”** This answers what it does, who it is for, and
what to click first. One click opened `/demo`, displayed the persistent
**“Demo — sample data, nothing is saved”** banner, four queue rows, and a
`$5,840.00` total. At 390×844, the headline, audience sentence, action,
outcome, and all three plain facts are within the initial viewport.

## Successful verification evidence

### Clean checkout and build

- Started at clean candidate `03d646bf57f90223a4748f2c897daf313824ab70`.
- `npm ci`: PASS; 24 packages, 0 vulnerabilities.
- `npm test`: PASS; all 23 Chromium tests.
- `npx tsc --noEmit`: PASS. No separate lint script is configured.
- `npm run build`: PASS; `dist/index.html` exists.
- `npm audit --omit=dev`: PASS; 0 vulnerabilities.
- `git diff --check`: PASS.
- Production output: JS 31,936 bytes (11.29 KB gzip), CSS 15,784 bytes
  (4.24 KB gzip), mobile hero 30,612 bytes, largest hero 80,150 bytes.

### Candidate/deployment identity and response policy

Local and live SHA-256 hashes match byte-for-byte:

| Asset | SHA-256 |
|---|---|
| `index.html` | `d0be487e5b42a11dfd1344d575b53b4290a45b6f2b27e2d8670b8cb1f84326a0` |
| `assets/index-BOeYgcCD.js` | `1c72153395afcf4e3cdd01b7440131f04d30ea1e5eb99bff6a89f412ece1f19d` |
| `assets/index-DZxUijIc.css` | `34fe8076856ed5e71a601cafa974ef60df18d454a440af4b6d6177eb08d11738` |
| `sw.js` | `951f86207cff3049acbbd330df28deb268a92f82e131748d32995a058468e917` |

Both local and live `verify-url.sh` runs passed. The live run returned 200 in
739 ms with no console/page errors, `lang=en`, one h1, one main, labelled
buttons, and no missing image alt text. `/`, `/demo`, `/privacy`, `/terms`, the
in-app missing route, manifest, service worker, robots, and sitemap responded.
The Param Factory link returned 200. The only dead product link found was the
Sociobot checkout above.

Live HTML revalidates after 30 seconds, `sw.js` is `no-cache`, and hashed
assets are immutable for one year. Responses include HSTS, `nosniff`, strict
origin referrer policy, permissions policy, and the restrictive CSP. Chrome's
manifest parser found no manifest errors despite the host serving the
webmanifest as `application/octet-stream`.

### Functional, privacy, accessibility, and PWA evidence

- Demo link/unlink worked by keyboard and persisted across reload: `$5,840` →
  `$3,640` → `$5,840`. The CSV download had the expected seven-column header,
  four data rows, and preserved the checked state.
- A quoted `$1,234.50` row with a comma in its description imported correctly;
  an already-billed row and an in-progress row were excluded. An unclosed
  quoted CSV and a file over 10 MB produced actionable errors without replacing
  the prior `$1,234.50` workspace.
- The complete live demo/review/export/route flow made only same-origin
  requests. There were no console or page errors. The CSP allows the explicit
  Sociobot license origin only. The product has no sign-in requirement, so the
  Entra tenant check is not applicable.
- Axe 4.10.2 reported zero violations on `/`, `/demo`, `/privacy`, `/terms`,
  and the in-app 404. Every route had one h1, one main, and an ordered heading
  outline. The skip link and ordinary controls showed a 4px `#0969da` focus
  outline; the hidden file-input exception is the blocker above.
- At 390×844 the demo had zero horizontal overflow. Reset, start, review, and
  export controls met 44px minimum targets. At 200% text sizing there was no
  horizontal overflow or clipped primary action. Reduced motion set animation
  and transition durations to `0.00001s`.
- A fresh live service worker became active and controlled the page, with no
  waiting worker and the update notice hidden. Its versioned cache contained
  the app shell. A real offline reload retained the four-row `$5,840` demo and
  showed the offline status with no errors. The source-level update regression
  also passed in the full suite.
- Live mobile Lighthouse: Performance 99, Accessibility 100, Best Practices
  100, SEO 100; FCP 992 ms, LCP 1,063 ms, CLS 0, TBT 92 ms. Full JSON was
  written to `/tmp/unbilled-work-sweep-verification-5-lighthouse.json`.

### Server endpoint allowance

The only runtime server endpoint is Sociobot license verification. A fresh
40-request same-client burst returned 30×200 and 10×429. Every 429 included
`Retry-After: 4`. The observed rapid-request allowance is therefore 30
successful requests before throttling.

## Scope

No product code was modified. Resolve the production checkout registration,
make file-input focus visible, reject invalid required/numeric row values, and
decide how orphaned invoice links should behave before another release review.
