# Unbilled Work Sweep

Find completed work that still needs an invoice.

Unbilled Work Sweep is a local-first weekly review for freelancers and tiny agencies. It compares completed-work and invoice CSV exports, shows possible matches for review, and exports an invoice-draft checklist. It is not a time tracker, invoicing system, or tax tool.

Live site: <https://unbilled-work-sweep.sociobot.in>

One-click demo: <https://unbilled-work-sweep.sociobot.in/demo>

## What it does

- Imports completed-work and invoice CSV exports.
- Suggests invoice matches using client and project names. A suggestion changes nothing until you review it.
- Lists completed rows that are not marked billed or linked to an invoice.
- Exports the current attention queue as a CSV checklist.
- Keeps real workspace data in IndexedDB on the device.
- Works offline after the first successful visit.

The free sweep includes imports, review, workspace backup, and checklist export. A $19 one-time license adds named weekly snapshots with past queue totals. Checkout and license verification use the Sociobot billing API; there is no embedded payment provider.

## CSV fields

The importer asks you to map columns before it stores rows. Header names do not need to match these names exactly.

Completed-work CSV:

- Required: date, client, project, description
- Optional: status, amount, hours, rate, already billed
- If amount is missing, the importer multiplies hours by rate.
- If status is missing, the row is treated as completed.

Invoice CSV:

- Required: invoice date, invoice number, client
- Optional: project, status

The matcher normalizes client wording and compares client and project names. Invoice dates before work dates are not suggested. Every match remains a review choice.

## Run locally

Requires Node.js 20 or later.

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. Use <http://localhost:5173/demo> for the isolated sample.

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

Real imports use IndexedDB. Demo actions use the separate `demo:unbilled-work-sweep` session-storage key. CSV rows do not leave the browser. A request goes to `api.sociobot.in` only when a user adds or verifies a paid license.

Use **Export workspace** for a JSON backup. Use **Clear imported data** to remove the active workspace. The on-site [privacy notice](https://unbilled-work-sweep.sociobot.in/privacy) and [terms](https://unbilled-work-sweep.sociobot.in/terms) are available as real routes.

## Deploy

Deploy the contents of `dist/` to a static host. `staticwebapp.config.json` supplies SPA fallback, security headers, cache rules, and the 404 rewrite. The service worker precaches the app shell and stores same-origin assets after use.

## Project notes

- [Visual thesis](.factory/design.md)
- [Demo contract](.factory/demo.md)
- [Handoff](.factory/handoff.md)
- [MIT License](LICENSE)
