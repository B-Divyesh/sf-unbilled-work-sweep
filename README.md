# Unbilled Work Sweep

Find completed work that still needs an invoice.

Unbilled Work Sweep keeps a weekly invoice review in your browser for freelancers and tiny agencies. It compares completed-work and invoice CSV exports, shows possible matches for review, and exports an invoice-draft checklist. It is not a time tracker, invoicing system, or tax tool.

Live site: <https://unbilled-work-sweep.sociobot.in>

One-click demo: <https://unbilled-work-sweep.sociobot.in/?demo=1>

## What it does

- Combines completed-work CSV exports from multiple task or time tools and labels each source.
- Imports invoice CSV exports for comparison.
- Suggests invoice matches using client and project names. A suggestion changes nothing until you review it, and every link can be reversed.
- Lists completed rows that are not marked billed or linked to an invoice.
- Exports the current unbilled-work list as a CSV checklist.
- Keeps real workspace data in IndexedDB on the device.
- Works offline after the first successful visit.

Imports, review, workspace backup, and checklist export are free. A $19 one-time license adds review history with named weekly totals. Checkout and license verification use the Sociobot billing API; there is no embedded payment provider.

## CSV fields

The importer asks you to map columns before it stores rows. Header names do not need to match these names exactly.
Rows with blank required cells, non-numeric amounts, or overflowing hours × rate calculations are rejected with their CSV row numbers. Saved data remains unchanged so you can fix the file and try again.
Dates may use `YYYY-MM-DD` or `M/D/YYYY`. Impossible dates and other formats are rejected before storage.

Completed-work CSV:

- Required: date, client, project, description
- Optional: status, amount, hours, rate, already billed
- If amount is missing, the importer multiplies hours by rate.
- If status is missing, the row is treated as completed.

Use **Add another export** for each task or time tool. Exact duplicate rows are skipped. Each row keeps its source filename.
Use **Replace this source** to update one export after confirming; other sources stay in the review.

Invoice CSV:

- Required: invoice date, invoice number, client
- Optional: project, status

Suggestions ignore capitalization, punctuation, and spacing when comparing client and project names. A different project is not suggested. Invoice dates before work dates are not suggested. Every match remains a review choice, and linked matches can be returned to the list.
Replacing the invoice CSV clears links to invoices that are no longer present, returning that work to the list.
Replacing one completed-work source keeps review decisions only for unchanged rows. Changed work returns to the list for review.

## Run locally

Requires Node.js 20 or later.

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. Use <http://localhost:5173/?demo=1> for the isolated sample.

## Test and build

Playwright 1.58.2 is pinned because the factory image includes those browsers.

```bash
npm test
npm run build
```

The exact production build command is `npm run build`. Static output lands in `dist/`, with `dist/index.html` at its root.

Run one public claim test with:

```bash
npm test -- --grep @claim:offline-reload
```

All claim definitions are in [`.factory/claims.json`](.factory/claims.json). Demo details are in [`.factory/demo.md`](.factory/demo.md).

## Privacy and data ownership

Real imports use IndexedDB. Demo actions use the separate `demo:unbilled-work-sweep` session-storage key. CSV and demo actions make no off-origin requests. Buying or verifying a license contacts `api.sociobot.in`.

Use **Export workspace** for a JSON backup. Use **Clear imported data** to remove the active workspace. The on-site [privacy notice](https://unbilled-work-sweep.sociobot.in/privacy) and [terms](https://unbilled-work-sweep.sociobot.in/terms) are available as real routes.

## Deploy

Deploy the contents of `dist/` to a static host. `staticwebapp.config.json` supplies SPA fallback, security headers, cache rules, and the 404 rewrite. The service worker precaches the app shell.

## Project notes

- [Visual thesis](.factory/design.md)
- [Demo contract](.factory/demo.md)
- [Handoff](.factory/handoff.md)
- [MIT License](LICENSE)
