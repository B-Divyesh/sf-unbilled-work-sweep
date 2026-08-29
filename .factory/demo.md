# Demo sandbox

- Primary URL: `https://unbilled-work-sweep.sociobot.in/?demo=1` (local: `http://localhost:5173/?demo=1`). `/demo` opens the same sandbox.
- Sample: six work rows from `task-board-export.csv` and `time-tracker-export.csv`, across four clients and two possible invoices. Four completed, not-yet-linked rows total $5,840. One completed row is already billed; one row is unfinished.
- First screen: at 390 × 844, the total, a real sample row, its suggested invoice, and its review actions are visible without scrolling.
- Try: link Brightside or Morrow, unlink it from **Linked matches**, replace invoices to clear missing links, mark a checklist item, and export the CSV.
- Reset: use **Reset demo** in the persistent banner.
- Leave: use **Start for real**. This clears the demo namespace before opening the real workspace.
- Storage: demo actions use `sessionStorage` keys prefixed with `demo:`. The demo never reads or writes the real IndexedDB database or real review-history storage.
- Offline: visit once, wait for the app shell to load, then use the demo without a network connection.
