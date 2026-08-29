import './styles.css';
import { mapInvoices, mappingFields, mapWork, parseCsv, suggestedMapping, toCsv } from './csv';
import { emptyState, queueFor, sampleState, suggestions } from './data';
import { loadState, resetDemo, saveState } from './storage';
import type { ImportKind, Mapping, ParsedCsv, SweepState, WorkItem } from './types';
import { isSweepState } from './validation';

const PRODUCT = 'unbilled-work-sweep';
const LICENSE_KEY = `sb_license:${PRODUCT}`;
const VERDICT_KEY = `sb_license_verdict:${PRODUCT}`;
const CHECKOUT = `https://api.sociobot.in/api/v1/products/${PRODUCT}/checkout`;
const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('The app root is missing.');
const app: HTMLDivElement = root;

let state: SweepState = emptyState();
let isDemo = false;
let pending: { kind: ImportKind; csv: ParsedCsv; mapping: Mapping } | null = null;
let message = '';
let error = '';
let undoState: SweepState | null = null;
let licensed = false;
let waitingServiceWorker: ServiceWorker | null = null;

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);
const formatMoney = (value: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: state.currency || 'USD', maximumFractionDigits: 2 }).format(value);
const currentPath = () => location.pathname.replace(/\/$/, '') || '/';

function header(): string {
  return `<a class="skip-link" href="#main">Skip to main content</a>
    <header class="site-header">
      <a class="wordmark" href="/" data-route aria-label="Unbilled Work Sweep home"><span aria-hidden="true">✦</span> Unbilled Work Sweep</a>
      <nav aria-label="Main navigation">
        <a href="/demo" data-route>Demo</a><a href="/#how">How it works</a><a href="/privacy" data-route>Privacy</a>
      </nav>
    </header>`;
}

function footer(): string {
  return `<footer class="site-footer"><div><p class="footer-mark">Find completed work that still needs an invoice.</p><p>Artwork disclosure: generated for this product.</p></div><nav aria-label="Footer navigation"><a href="/privacy" data-route>Privacy</a><a href="/terms" data-route>Terms</a><a href="https://hello-factory.sociobot.in" rel="noreferrer">Built by Param Factory <span class="sr-only">(external site)</span></a></nav><p>Version 1.0.0 · build 2026.08</p></footer>`;
}

function demoBanner(): string {
  return `<aside class="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><span>Link or keep a suggested match, then export the list.</span><div><button class="text-button" data-action="reset-demo">Reset demo</button><button class="text-button" data-action="start-real">Start for real</button></div></aside>`;
}

function notice(): string {
  const offline = navigator.onLine ? '' : `<div class="notice offline" role="status">You are offline. Saved work and the demo still work.</div>`;
  const update = `<div id="update-notice" class="notice update" hidden><span>An updated version is ready.</span><button data-action="apply-update">Use update</button></div>`;
  const status = message ? `<div class="notice success" role="status">${escapeHtml(message)}${undoState ? ' <button data-action="undo-clear">Undo</button>' : ''}</div>` : '';
  const problem = error ? `<div class="notice error" role="alert">${escapeHtml(error)}</div>` : '';
  return offline + update + status + problem;
}

function homePage(): string {
  return `${header()}<main id="main">
    <section class="hero">
      <div class="hero-copy"><p class="eyebrow">Completed work to review before invoicing</p><h1 tabindex="-1">Find finished work you have not billed</h1><p class="lede">For freelancers and tiny agencies with work spread across task, time, and invoice tools.</p>
        <div class="hero-actions"><a class="button primary" href="/demo" data-route>Try it with sample data</a><span>See a filled review in one click.</span></div>
        <a class="secondary-link" href="#sweep">Or import your CSV files</a>
        <ul class="plain-facts" aria-label="Product facts"><li>Files stay in this browser.</li><li>Works offline after your first visit.</li><li>Imports and checklist exports are free. Review history costs $19 once.</li></ul>
      </div>
      <figure class="hero-art"><picture><source media="(max-width: 700px)" srcset="/assets/paperwork-garden-720.webp"><img src="/assets/paperwork-garden-1200.webp" width="1200" height="800" alt="Paper invoices form a moonlit landscape where coral envelopes flow toward a filing box." fetchpriority="high" decoding="async"></picture><figcaption>Review completed work that may still need an invoice.</figcaption></figure>
    </section>
    <section id="sweep" class="app-section" aria-labelledby="sweep-title"><div class="section-intro"><p class="eyebrow">Your local workspace</p><h2 id="sweep-title">Import work and invoice CSV files</h2><p>Add completed-work and invoice CSV files. You choose whether a suggested match counts as billed.</p></div>${notice()}${workspace()}</section>
    <section id="how" class="how-section" aria-labelledby="how-title"><p class="eyebrow">Three steps</p><h2 id="how-title">How the review works</h2><ol><li><span>1</span><div><h3>Import exports</h3><p>Map the columns from your task, time, and invoice CSV files.</p></div></li><li><span>2</span><div><h3>Review matches</h3><p>Link an invoice or keep the completed work in your unbilled-work list.</p></div></li><li><span>3</span><div><h3>Export your checklist</h3><p>Download the reviewed list as a CSV for your invoicing session.</p></div></li></ol></section>
    <section class="limits-section" aria-labelledby="limits-title"><div><p class="eyebrow">What this tool does not do</p><h2 id="limits-title">It does not send invoices</h2></div><p>It does not track time, calculate tax, or change your source files. It only helps you review exported records.</p></section>
    ${paidSection()}
  </main>${footer()}`;
}

function paidSection(): string {
  const label = licensed ? 'Review history active' : 'Buy review history — $19';
  return `<section id="paid" class="paid-section" aria-labelledby="paid-title"><div><p class="eyebrow">Saved review history</p><h2 id="paid-title">Save weekly review totals for a one-time $19</h2><p>Name each weekly review and compare earlier list totals on this device. Imports and checklist exports stay free.</p></div><div class="license-box"><a class="button primary" href="${CHECKOUT}" rel="noreferrer">${label}</a><p>Checkout opens through Sociobot. One payment; no subscription.</p><form id="license-form"><label for="license">Have a license? Paste it here</label><div class="inline-form"><input id="license" name="license" autocomplete="off" spellcheck="false"><button type="submit">Verify license</button></div></form><p class="fine-print">Buying means you accept the <a href="/terms" data-route>terms</a> and <a href="/privacy" data-route>privacy notice</a>.</p></div></section>`;
}

function importCard(kind: ImportKind): string {
  const name = kind === 'work' ? 'Completed work' : 'Invoices';
  const count = kind === 'work' ? state.work.length : state.invoices.length;
  return `<div class="import-card ${count ? 'has-data' : ''}" data-drop-kind="${kind}"><div><span class="file-number">${kind === 'work' ? '01' : '02'}</span><p class="import-title">${name} CSV</p><p>${count ? `${count} rows imported` : kind === 'work' ? 'Tasks or time entries with client and project names.' : 'Issued or draft invoices with client and project names.'}</p></div><input class="visually-hidden-file" id="file-${kind}" data-file-kind="${kind}" type="file" accept=".csv,text/csv"><label class="button secondary" for="file-${kind}">${count ? `Replace ${name.toLowerCase()}` : `Choose ${name.toLowerCase()} CSV`}</label></div>`;
}

function mappingPanel(): string {
  if (!pending) return '';
  return `<section class="mapping-panel" aria-labelledby="mapping-title"><div><p class="eyebrow">Column check</p><h2 id="mapping-title">Map ${pending.kind === 'work' ? 'completed work' : 'invoice'} columns</h2><p>${escapeHtml(pending.csv.filename)} · ${pending.csv.rows.length} rows. Required fields are marked. Dates must use YYYY-MM-DD or M/D/YYYY.</p></div><form id="mapping-form"><div class="mapping-grid">${mappingFields(pending.kind).map((field) => `<label>${field.label}${field.required ? ' *' : ''}<select name="${field.key}" ${field.required ? 'required' : ''}><option value="">Not included</option>${pending?.csv.headers.map((header) => `<option value="${escapeHtml(header)}" ${pending?.mapping[field.key] === header ? 'selected' : ''}>${escapeHtml(header)}</option>`).join('')}</select></label>`).join('')}</div><div class="form-actions"><button type="button" class="button ghost" data-action="cancel-mapping">Cancel</button><button class="button primary" type="submit">Import ${pending.kind === 'work' ? 'work' : 'invoices'}</button></div></form></section>`;
}

function workRow(work: WorkItem): string {
  const top = suggestions(work, state.invoices)[0];
  const decision = state.decisions[work.id];
  const suggestion = top && !decision ? `<div class="match-box"><p><strong>Possible invoice:</strong> ${escapeHtml(top.invoice.number)} · ${escapeHtml(top.invoice.client)} / ${escapeHtml(top.invoice.project || 'No project')}</p><div><button data-link-work="${escapeHtml(work.id)}" data-invoice="${escapeHtml(top.invoice.id)}">Link invoice</button><button class="text-button" data-keep-work="${escapeHtml(work.id)}">Keep unbilled</button></div></div>` : decision?.kind === 'keep' ? `<p class="reviewed">Reviewed · kept in queue</p>` : `<p class="no-match">No invoice match found</p>`;
  return `<li class="work-slip"><label class="check-control"><input type="checkbox" data-check-work="${escapeHtml(work.id)}" ${state.checked[work.id] ? 'checked' : ''}><span class="sr-only">Mark ${escapeHtml(work.description)} ready to invoice</span></label><div class="work-main"><div class="work-meta"><span>${escapeHtml(work.date || 'No date')}</span><span>${escapeHtml(work.client)}</span><span>${escapeHtml(work.project)}</span></div><h3>${escapeHtml(work.description)}</h3>${suggestion}</div><strong class="amount">${formatMoney(work.amount)}</strong></li>`;
}

function linkedMatches(): string {
  const matches = Object.entries(state.decisions).flatMap(([workId, decision]) => {
    if (decision.kind !== 'linked') return [];
    const work = state.work.find((item) => item.id === workId);
    if (!work) return [];
    const invoice = state.invoices.find((item) => item.id === decision.invoiceId);
    return [{ work, invoiceNumber: invoice?.number ?? 'Invoice unavailable' }];
  });
  if (!matches.length) return '';
  return `<section class="linked-matches" aria-labelledby="linked-matches-title"><div><h3 id="linked-matches-title">Linked matches</h3><p>Unlink a match to return its work to the list.</p></div><ul>${matches.map(({ work, invoiceNumber }) => `<li><div><strong>${escapeHtml(work.description)}</strong><span>${escapeHtml(invoiceNumber)} · ${escapeHtml(work.client)} / ${escapeHtml(work.project || 'No project')}</span></div><button class="text-button" data-unlink-work="${escapeHtml(work.id)}">Unlink invoice</button></li>`).join('')}</ul></section>`;
}

function workspace(): string {
  const queue = queueFor(state);
  const total = queue.reduce((sum, work) => sum + work.amount, 0);
  const linked = Object.values(state.decisions).filter((item) => item.kind === 'linked').length;
  const hasData = state.work.length || state.invoices.length;
  const importSection = `<section class="import-section" aria-labelledby="import-title"><h2 id="import-title" class="sr-only">Import CSV files</h2><div class="import-grid">${importCard('work')}${importCard('invoices')}</div>${mappingPanel()}</section>`;
  const toolbar = `<div class="toolbar"><label>Currency<select id="currency" aria-label="Display currency"><option ${state.currency === 'USD' ? 'selected' : ''}>USD</option><option ${state.currency === 'GBP' ? 'selected' : ''}>GBP</option><option ${state.currency === 'EUR' ? 'selected' : ''}>EUR</option><option ${state.currency === 'CAD' ? 'selected' : ''}>CAD</option><option ${state.currency === 'AUD' ? 'selected' : ''}>AUD</option></select></label><div><button data-action="export-checklist" ${queue.length ? '' : 'disabled'}>Export checklist CSV</button><button class="ghost" data-action="export-workspace">Export workspace</button><input class="visually-hidden-file" id="import-workspace" type="file" accept="application/json"><label class="ghost buttonish" for="import-workspace">Import workspace</label></div></div>`;
  const workList = queue.length ? `<ol class="work-list" data-testid="work-list">${queue.map(workRow).join('')}</ol>` : `<div class="empty-state"><span aria-hidden="true">✓</span><p class="empty-title">No completed work needs review</p><p>Import more work, or unlink a match to bring it back.</p></div>`;
  const queueSection = hasData ? `<section class="queue" aria-labelledby="queue-title"><div class="queue-head"><div><p class="eyebrow">Unbilled-work list</p><h2 id="queue-title">${queue.length} completed ${queue.length === 1 ? 'item' : 'items'} to review</h2><p>${linked} ${linked === 1 ? 'match' : 'matches'} linked. Already billed and unfinished rows are excluded.</p></div><div class="total"><span>Possible unbilled value</span><strong data-testid="queue-total">${formatMoney(total)}</strong></div></div>
      ${isDemo ? `${workList}${toolbar}` : `${toolbar}${workList}`}
      ${linkedMatches()}<div class="queue-actions"><button class="button secondary" data-action="save-snapshot">${licensed ? 'Save review total' : 'Review history · paid'}</button><button class="text-button danger-link" data-action="clear-data">Clear imported data</button></div>${snapshotList()}</section>` : `<div class="empty-state import-empty"><span aria-hidden="true">↳</span><p class="empty-title">Your unbilled-work list will appear here</p><p>Import completed work first. Add invoices to review possible matches.</p><p class="sample-format"><strong>Work columns:</strong> date, client, project, description, status, amount. Hours and rate can replace amount.</p><input class="visually-hidden-file" id="import-workspace" type="file" accept="application/json"><label class="ghost buttonish" for="import-workspace">Import a workspace backup</label></div>`;
  return `<div class="workspace${isDemo ? ' demo-workspace' : ''}" data-testid="workspace">${isDemo && hasData ? `${queueSection}${importSection}` : `${importSection}${queueSection}`}</div>`;
}

function snapshotList(): string {
  const snapshotStore = isDemo ? sessionStorage : localStorage;
  const snapshotKey = isDemo ? 'demo:unbilled:snapshots' : 'unbilled:snapshots';
  const snapshots = JSON.parse(snapshotStore.getItem(snapshotKey) ?? '[]') as { name: string; date: string; count: number; value: number }[];
  if (!snapshots.length || !licensed) return '';
  return `<section class="snapshots" aria-labelledby="snapshot-title"><h3 id="snapshot-title">Saved review history</h3><ul>${snapshots.map((item) => `<li><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.date)} · ${item.count} items · ${formatMoney(item.value)}</span></li>`).join('')}</ul></section>`;
}

function demoPage(): string {
  const queue = queueFor(state);
  return `${header()}${demoBanner()}<main id="main" class="demo-main"><section class="demo-heading"><p class="eyebrow">Ready-to-review sample</p><h1 tabindex="-1">Review work before you invoice</h1><p>Six work rows, two suggested matches, and four items to review.</p></section>${notice()}${workspace()}<section class="demo-help"><h2>What to try</h2><p>Link the Morrow invoice. Keep North Star in the list. Check an item, then export ${queue.length} rows.</p></section></main>${footer()}`;
}

function legalPage(kind: 'privacy' | 'terms'): string {
  const privacy = kind === 'privacy';
  const title = privacy ? 'Your files stay on this device' : 'Terms for using this tool';
  const body = privacy ? `<p>Unbilled Work Sweep stores real imports in your browser’s IndexedDB. Demo data uses separate session storage and is removed when that browser session ends.</p><h2>What leaves your device</h2><p>CSV and demo actions make no off-origin requests. Buying or verifying a license contacts api.sociobot.in.</p><h2>What you can remove</h2><p>Use “Clear imported data” to remove the current workspace. You can also clear this site’s browser storage.</p><h2>Paid license storage</h2><p>This app stores only your license token and its latest verification result.</p><h2>Contact</h2><p>Email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a> with privacy questions.</p>` : `<p>Unbilled Work Sweep is a review aid. It does not provide tax, legal, or accounting advice.</p><h2>Your responsibility</h2><p>Check every suggested invoice match before using the exported checklist. Keep your original source exports.</p><h2>Paid license</h2><p>The $19 purchase is a one-time license for review history. Checkout opens through Sociobot.</p><h2>Availability</h2><p>The software is provided “as is” without a promise that every export format will map automatically.</p><h2>Contact</h2><p>Email <a href="mailto:support@sociobot.in">support@sociobot.in</a> for license help.</p>`;
  return `${header()}<main id="main" class="legal"><p class="eyebrow">${privacy ? 'Privacy' : 'Terms'} · updated 28 August 2026</p><h1 tabindex="-1">${title}</h1>${body}</main>${footer()}`;
}

function notFoundPage(): string {
  return `${header()}<main id="main" class="not-found"><div><p class="eyebrow">404 error</p><h1 tabindex="-1">Page not found</h1><p>The address may be wrong, or the page may have moved.</p><a class="button primary" href="/" data-route>Return home</a></div><img src="/assets/paperwork-garden-720.webp" width="720" height="480" alt="Paper invoices drift through a moonlit landscape."></main>${footer()}`;
}

function setMeta(path: string): void {
  const details: Record<string, [string, string]> = {
    '/': ['Unbilled Work Sweep — Find work to invoice', 'Compare task, time, and invoice CSV files. Review completed work that may still need an invoice, all in your browser.'],
    '/demo': ['Demo — Unbilled Work Sweep', 'Try a complete billing review with sample work and invoices.'],
    '/privacy': ['Privacy — Unbilled Work Sweep', 'How Unbilled Work Sweep keeps CSV imports and review data on your device.'],
    '/terms': ['Terms — Unbilled Work Sweep', 'Terms for using Unbilled Work Sweep and its one-time paid license.']
  };
  const [title, description] = details[path] ?? ['Page not found — Unbilled Work Sweep', 'Return to Unbilled Work Sweep.'];
  document.title = title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', description);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `https://unbilled-work-sweep.sociobot.in${path === '/' ? '/' : path}`);
}

async function render(focus = false): Promise<void> {
  const path = currentPath();
  isDemo = path === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
  setMeta(isDemo ? '/demo' : path);
  app.innerHTML = isDemo ? demoPage() : path === '/' ? homePage() : path === '/privacy' ? legalPage('privacy') : path === '/terms' ? legalPage('terms') : notFoundPage();
  bindEvents();
  if (focus) requestAnimationFrame(() => {
    const heading = document.querySelector<HTMLElement>('h1');
    const announcement = document.createElement('p');
    announcement.className = 'sr-only'; announcement.setAttribute('aria-live', 'polite');
    announcement.textContent = heading?.textContent ?? 'Page loaded';
    document.querySelector('main')?.prepend(announcement);
    heading?.focus();
  });
}

async function navigate(path: string): Promise<void> {
  history.pushState({}, '', path);
  pending = null; message = ''; error = '';
  isDemo = currentPath() === '/demo';
  state = await loadState(isDemo);
  if (isDemo && state.work.length === 0) { state = sampleState(); await saveState(state, true); }
  await render(true);
  const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView({ behavior });
  else scrollTo({ top: 0, behavior });
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function receiveCsv(file: File, kind: ImportKind): Promise<void> {
  try {
    if (file.size > 10 * 1024 * 1024) throw new Error('The CSV is larger than 10 MB. Split it into smaller exports and try again.');
    const csv = parseCsv(await file.text(), file.name);
    pending = { kind, csv, mapping: suggestedMapping(kind, csv.headers) };
    error = ''; message = '';
  } catch (caught) { error = caught instanceof Error ? caught.message : 'The CSV could not be read. Check the file and try again.'; }
  await render();
  document.querySelector<HTMLElement>('#mapping-title, [role="alert"]')?.focus();
}

async function persistAndRender(status: string): Promise<void> {
  state.importedAt = new Date().toISOString();
  await saveState(state, isDemo);
  message = status; error = '';
  await render();
}

/**
 * A completed-work replacement is a new source of truth. Keep decisions only
 * for rows whose complete identity is still present; discard stale review and
 * checklist state before it can be attached to changed work.
 */
function reconcileWorkReplacement(work: WorkItem[]): number {
  const workIds = new Set(work.map((item) => item.id));
  let clearedReviews = 0;
  state.decisions = Object.fromEntries(Object.entries(state.decisions).filter(([workId, decision]) => {
    if (workIds.has(workId)) return true;
    if (decision.kind === 'linked' || decision.kind === 'keep') clearedReviews += 1;
    return false;
  }));
  state.checked = Object.fromEntries(Object.entries(state.checked).filter(([workId]) => workIds.has(workId)));
  return clearedReviews;
}

function bindEvents(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-route]').forEach((link) => link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || link.target) return;
    event.preventDefault(); void navigate(new URL(link.href).pathname);
  }));
  document.querySelectorAll<HTMLInputElement>('[data-file-kind]').forEach((input) => input.addEventListener('change', () => {
    const file = input.files?.[0]; if (file) void receiveCsv(file, input.dataset.fileKind as ImportKind);
  }));
  document.querySelectorAll<HTMLElement>('[data-drop-kind]').forEach((zone) => {
    zone.addEventListener('dragover', (event) => { event.preventDefault(); zone.classList.add('dragging'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
    zone.addEventListener('drop', (event) => { event.preventDefault(); zone.classList.remove('dragging'); const file = event.dataTransfer?.files[0]; if (file) void receiveCsv(file, zone.dataset.dropKind as ImportKind); });
  });
  document.querySelector<HTMLFormElement>('#mapping-form')?.addEventListener('submit', (event) => {
    event.preventDefault(); if (!pending) return;
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const mapping = Object.fromEntries([...data.entries()].map(([key, value]) => [key, String(value)]));
    const fields = mappingFields(pending.kind);
    if (fields.some((field) => field.required && !mapping[field.key])) { error = 'Choose a CSV column for every required field, then import again.'; void render(); return; }
    try {
      let clearedLinks = 0;
      let clearedReviews = 0;
      if (pending.kind === 'work') {
        const work = mapWork(pending.csv, mapping);
        clearedReviews = reconcileWorkReplacement(work);
        state.work = work;
      } else {
        const invoices = mapInvoices(pending.csv, mapping);
        const invoiceByIdentity = new Map(invoices.map((invoice) => [
          `${invoice.client.trim().toLowerCase()}\u0000${invoice.number.trim().toLowerCase()}`,
          invoice
        ]));
        for (const [workId, decision] of Object.entries(state.decisions)) {
          if (decision.kind !== 'linked') continue;
          const previous = state.invoices.find((invoice) => invoice.id === decision.invoiceId);
          const replacement = previous && invoiceByIdentity.get(`${previous.client.trim().toLowerCase()}\u0000${previous.number.trim().toLowerCase()}`);
          if (replacement) state.decisions[workId] = { kind: 'linked', invoiceId: replacement.id };
          else { delete state.decisions[workId]; clearedLinks += 1; }
        }
        state.invoices = invoices;
      }
      const count = pending.csv.rows.length;
      const noun = pending.kind === 'work' ? 'work' : 'invoice';
      const cleared = clearedLinks ? ` ${clearedLinks} stale invoice ${clearedLinks === 1 ? 'link' : 'links'} cleared.` : '';
      const discarded = clearedReviews ? ` ${clearedReviews} prior ${clearedReviews === 1 ? 'review decision was' : 'review decisions were'} cleared because that work changed.` : '';
      pending = null;
      void persistAndRender(`${count} ${noun} rows imported.${cleared}${discarded}`);
    } catch (caught) {
      error = caught instanceof Error ? caught.message : 'The CSV rows could not be imported. Fix the file and try again.';
      message = '';
      void render().then(() => document.querySelector<HTMLElement>('[role="alert"]')?.focus());
    }
  });
  document.querySelector<HTMLFormElement>('#license-form')?.addEventListener('submit', (event) => { event.preventDefault(); const token = new FormData(event.currentTarget as HTMLFormElement).get('license'); if (typeof token === 'string' && token.trim()) void verifyLicense(token.trim(), true); });
  document.querySelector<HTMLSelectElement>('#currency')?.addEventListener('change', (event) => { state.currency = (event.currentTarget as HTMLSelectElement).value; void persistAndRender('Currency display updated.'); });
  document.querySelectorAll<HTMLInputElement>('[data-check-work]').forEach((input) => input.addEventListener('change', () => { state.checked[input.dataset.checkWork ?? ''] = input.checked; void persistAndRender(input.checked ? 'Item marked ready to invoice.' : 'Item returned to the queue.'); }));
  document.querySelectorAll<HTMLButtonElement>('[data-link-work]').forEach((button) => button.addEventListener('click', () => { const id = button.dataset.linkWork; const invoiceId = button.dataset.invoice; if (id && invoiceId) { state.decisions[id] = { kind: 'linked', invoiceId }; void persistAndRender('Invoice linked. The item left the list.'); } }));
  document.querySelectorAll<HTMLButtonElement>('[data-keep-work]').forEach((button) => button.addEventListener('click', () => { const id = button.dataset.keepWork; if (id) { state.decisions[id] = { kind: 'keep' }; void persistAndRender('Match reviewed. The work stays in the queue.'); } }));
  document.querySelectorAll<HTMLButtonElement>('[data-unlink-work]').forEach((button) => button.addEventListener('click', () => { const id = button.dataset.unlinkWork; if (id) { delete state.decisions[id]; void persistAndRender('Invoice unlinked. The item returned to the list.'); } }));
  document.querySelectorAll<HTMLElement>('[data-action]').forEach((button) => button.addEventListener('click', () => void action(button.dataset.action ?? '')));
  document.querySelector<HTMLInputElement>('#import-workspace')?.addEventListener('change', async (event) => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0]; if (!file) return;
    try {
      const value: unknown = JSON.parse(await file.text());
      if (!isSweepState(value)) throw new Error('Invalid workspace backup');
      const imported = structuredClone(value);
      imported.importedAt = new Date().toISOString();
      // Commit first. A bad file or a failed write must leave the rendered and
      // persisted workspace alone so its recovery controls remain reachable.
      await saveState(imported, isDemo);
      state = imported;
      message = 'Workspace imported.'; error = '';
      await render();
    }
    catch { error = 'That workspace file is not valid. Choose an exported workspace JSON file.'; await render(); }
  });
}

async function action(name: string): Promise<void> {
  if (name === 'cancel-mapping') { pending = null; await render(); }
  if (name === 'reset-demo') { resetDemo(); state = sampleState(); await saveState(state, true); message = 'Demo reset to its original sample.'; await render(); }
  if (name === 'start-real') { resetDemo(); await navigate('/'); }
  if (name === 'export-checklist') {
    const queue = queueFor(state); const rows = [['Ready', 'Date', 'Client', 'Project', 'Description', 'Amount', 'Currency'], ...queue.map((work) => [state.checked[work.id] ? 'yes' : 'no', work.date, work.client, work.project, work.description, work.amount.toFixed(2), state.currency])];
    download('invoice-draft-checklist.csv', toCsv(rows), 'text/csv;charset=utf-8'); message = `Checklist exported with ${queue.length} rows.`; await render();
  }
  if (name === 'export-workspace') { download('unbilled-work-sweep.json', JSON.stringify(state, null, 2), 'application/json'); message = 'Workspace exported.'; await render(); }
  if (name === 'clear-data') { if (!confirm('Clear every imported row and review decision from this workspace?')) return; undoState = structuredClone(state); state = emptyState(); await saveState(state, isDemo); message = 'Imported data cleared.'; await render(); }
  if (name === 'undo-clear' && undoState) { state = undoState; undoState = null; await saveState(state, isDemo); message = 'Imported data restored.'; await render(); }
  if (name === 'save-snapshot') {
    if (!licensed) { if (currentPath() === '/') document.querySelector('#paid')?.scrollIntoView({ behavior: 'smooth' }); else await navigate('/#paid'); return; }
    const nameValue = prompt('Name this weekly review', `Week of ${new Date().toLocaleDateString()}`); if (!nameValue) return;
    const queue = queueFor(state); const snapshotStore = isDemo ? sessionStorage : localStorage; const snapshotKey = isDemo ? 'demo:unbilled:snapshots' : 'unbilled:snapshots';
    const snapshots = JSON.parse(snapshotStore.getItem(snapshotKey) ?? '[]') as unknown[];
    snapshots.unshift({ name: nameValue, date: new Date().toISOString().slice(0, 10), count: queue.length, value: queue.reduce((sum, work) => sum + work.amount, 0) });
    snapshotStore.setItem(snapshotKey, JSON.stringify(snapshots)); message = 'Review total saved on this device.'; await render();
  }
  if (name === 'apply-update' && waitingServiceWorker) {
    const reload = () => location.reload();
    navigator.serviceWorker.addEventListener('controllerchange', reload, { once: true });
    waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
    window.setTimeout(reload, 1500);
  }
}

async function verifyLicense(token: string, announce = false): Promise<void> {
  localStorage.setItem(LICENSE_KEY, token);
  try {
    const response = await fetch(`https://api.sociobot.in/api/v1/products/${PRODUCT}/verify?license=${encodeURIComponent(token)}`);
    const verdict = await response.json() as { valid: boolean; reason?: string };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: verdict.valid, checkedAt: Date.now() }));
    licensed = verdict.valid;
    if (announce) message = verdict.valid ? 'License verified. Review history is active.' : 'License no longer active. Check the token or buy a new license.';
  } catch { if (announce) error = 'The license check could not connect. Imports and exports still work; try again when online.'; }
  await render();
}

async function initLicense(): Promise<void> {
  const params = new URLSearchParams(location.search); const returned = params.get('license');
  if (returned) { localStorage.setItem(LICENSE_KEY, returned); params.delete('license'); history.replaceState({}, '', `${location.pathname}${params.size ? `?${params}` : ''}${location.hash}`); }
  const token = localStorage.getItem(LICENSE_KEY); if (!token) return;
  const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? 'null') as { valid: boolean; checkedAt: number } | null;
  licensed = cached?.valid ?? false;
  if (!cached || Date.now() - cached.checkedAt > 86_400_000 || returned) void verifyLicense(token);
}

function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  const readyKey = 'unbilled:service-worker-ready';
  let canAnnounceUpdate = sessionStorage.getItem(readyKey) === '1';
  void navigator.serviceWorker.ready.then(() => {
    // Do not turn an app's first installation into a user-facing update.
    // Later checks in this tab, and future visits in this browser tab, can
    // announce a genuinely waiting replacement worker.
    sessionStorage.setItem(readyKey, '1');
    canAnnounceUpdate = true;
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // The initial worker may have briefly been observed as waiting. Once it
    // claims this page, it is active rather than an available update.
    waitingServiceWorker = null;
    document.querySelector<HTMLElement>('#update-notice')?.setAttribute('hidden', '');
  });
  const register = () => navigator.serviceWorker.register('/sw.js').then((registration) => {
    const showWaitingUpdate = () => {
      const worker = registration.waiting;
      // A waiting worker is an update only when an older worker is already
      // active. The install worker itself can briefly appear as waiting.
      if (!canAnnounceUpdate || !worker || !registration.active || registration.active === worker) return;
      waitingServiceWorker = worker;
      document.querySelector<HTMLElement>('#update-notice')?.removeAttribute('hidden');
      // Do not leave a stale notice behind if the worker activates between
      // the state-change callback and this paint.
      window.setTimeout(() => {
        if (registration.waiting === worker) return;
        if (waitingServiceWorker === worker) waitingServiceWorker = null;
        document.querySelector<HTMLElement>('#update-notice')?.setAttribute('hidden', '');
      }, 250);
    };
    showWaitingUpdate();
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      const announceThisWorker = canAnnounceUpdate;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && announceThisWorker) {
          // Initial installation briefly reports `installed` before it
          // activates. A genuine upgrade remains waiting for an open client.
          window.setTimeout(showWaitingUpdate, 100);
        }
      });
    });
  }).catch(() => { /* The app still works without installation support. */ });
  if (document.readyState === 'complete') void register();
  else window.addEventListener('load', () => void register(), { once: true });
}

// Register before asynchronous IndexedDB and license initialization. On a
// normal first visit those operations can finish after the load event; adding
// a new load listener then means it never fires and leaves the app offline.
registerServiceWorker();

window.addEventListener('popstate', async () => {
  const demoRoute = currentPath() === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
  state = await loadState(demoRoute);
  if (demoRoute && state.work.length === 0) { state = sampleState(); await saveState(state, true); }
  await render(true);
});
window.addEventListener('online', () => void render());
window.addEventListener('offline', () => void render());

await initLicense();
isDemo = currentPath() === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
state = await loadState(isDemo);
if (isDemo && state.work.length === 0) { state = sampleState(); await saveState(state, true); }
await render();
