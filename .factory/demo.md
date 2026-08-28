# Demo sandbox

- URL: `https://unbilled-work-sweep.sociobot.in/demo` (local: `http://localhost:5173/demo`). `?demo=1` also enters the sandbox.
- Sample: six work rows across four clients and two possible invoices. Four completed, not-yet-linked rows total $5,840. One completed row is already billed; one row is unfinished.
- Try: review Brightside or Morrow as linked, keep a suggestion unbilled, mark a checklist item, and export the CSV.
- Reset: use **Reset demo** in the persistent banner.
- Leave: use **Start for real**. This clears the demo namespace before opening the real workspace.
- Storage: demo actions use `sessionStorage` keys prefixed with `demo:`. The demo never reads or writes the real IndexedDB database or real snapshot storage.
- Offline: visit once, wait for the app shell to load, then use the demo without a network connection.
