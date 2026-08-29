import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { sampleState } from '../src/data';
import { isSweepState } from '../src/validation';

test('@claim:demo-sample-ready opens a complete actionable sample in one click', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo$/u);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('.import-card').first()).toContainText('6 rows imported');
  await expect(page.locator('.match-box')).toHaveCount(2);
  await expect(page.locator('.work-slip')).toHaveCount(4);
  await expect(page.getByTestId('queue-total')).toContainText('$5,840.00');

  const visibleTargets = [
    page.getByTestId('queue-total'),
    page.locator('.work-slip').first(),
    page.locator('.match-box').first(),
    page.getByRole('button', { name: 'Link invoice' }).first()
  ];
  for (const target of visibleTargets) {
    const box = await target.boundingBox();
    expect(box, 'expected a demo target bounding box').not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  }
  expect(await page.evaluate(() => sessionStorage.getItem('demo:unbilled-work-sweep'))).toContain('Final responsive page build');
  expect(await page.evaluate(() => localStorage.getItem('unbilled-work-sweep'))).toBeNull();
  await page.getByRole('button', { name: 'Link invoice' }).first().click();
  await expect(page.getByTestId('queue-total')).toContainText('$3,640.00');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Demo reset to its original sample.')).toBeVisible();
  await expect(page.getByTestId('queue-total')).toContainText('$5,840.00');
  await expect(page.getByRole('button', { name: 'Link invoice' })).toHaveCount(2);
});

test('@claim:csv-import imports work and invoice CSV exports', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({
    name: 'work.csv', mimeType: 'text/csv',
    buffer: Buffer.from('date,client,project,description,status,amount,hours,rate\n2026-08-01,Acme,Site,Build page,completed,100,,\n2026-08-02,Acme,Site,Call,in progress,50,,\n2026-08-03,Acme,Site,Research,completed,,2,75')
  });
  await page.getByRole('button', { name: 'Import work', exact: true }).click();
  await expect(page.getByText('3 work rows imported.')).toBeVisible();
  await page.locator('#file-invoices').setInputFiles({
    name: 'invoices.csv', mimeType: 'text/csv',
    buffer: Buffer.from('invoice date,invoice number,client,project,status\n2026-08-03,INV-1,Acme,Site,sent')
  });
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await expect(page.getByText('1 invoice rows imported.')).toBeVisible();
  await expect(page.getByTestId('queue-total')).toContainText('250');
  await expect(page.getByText('Possible invoice:').first()).toBeVisible();
});

test('@claim:header-mapping imports manually mapped columns with unrelated header names', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({
    name: 'custom-export.csv', mimeType: 'text/csv',
    buffer: Buffer.from('when,who,engagement,details,value\n8/1/2026,Acme,Launch,Custom header row,275')
  });
  await expect(page.getByText('Dates must use YYYY-MM-DD or M/D/YYYY.')).toBeVisible();
  await page.locator('select[name="date"]').selectOption('when');
  await page.locator('select[name="client"]').selectOption('who');
  await page.locator('select[name="project"]').selectOption('engagement');
  await page.locator('select[name="description"]').selectOption('details');
  await page.locator('select[name="amount"]').selectOption('value');
  await page.getByRole('button', { name: 'Import work', exact: true }).click();
  await expect(page.getByText('1 work rows imported.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Custom header row' })).toBeVisible();
  await expect(page.getByTestId('queue-total')).toContainText('275');

  await page.locator('#file-invoices').setInputFiles({
    name: 'custom-invoices.csv', mimeType: 'text/csv',
    buffer: Buffer.from('issued,reference,buyer,engagement\n8/2/2026,ACME-42,Acme,Launch')
  });
  await page.locator('select[name="date"]').selectOption('issued');
  await page.locator('select[name="number"]').selectOption('reference');
  await page.locator('select[name="client"]').selectOption('buyer');
  await page.locator('select[name="project"]').selectOption('engagement');
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await expect(page.getByText('1 invoice rows imported.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Custom header row' }).locator('..')).toContainText('Possible invoice: ACME-42');
});

test('@claim:queue-filter excludes billed and unfinished work from the list', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({
    name: 'filter.csv', mimeType: 'text/csv',
    buffer: Buffer.from('date,client,project,description,status,amount,already billed\n2026-08-01,Acme,Site,Ready for review,completed,100,no\n2026-08-02,Acme,Site,Already billed,completed,200,yes\n2026-08-03,Acme,Site,Still in progress,in progress,300,no')
  });
  await page.getByRole('button', { name: 'Import work', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Ready for review' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Already billed' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Still in progress' })).toHaveCount(0);
  await expect(page.getByTestId('queue-total')).toContainText('100');
});

test('@claim:missing-status treats a work row without a status column as completed', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({
    name: 'no-status.csv', mimeType: 'text/csv',
    buffer: Buffer.from('date,client,project,description,amount\n2026-08-01,Acme,Launch,No status row,180')
  });
  await page.getByRole('button', { name: 'Import work', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No status row' })).toBeVisible();
  await expect(page.getByTestId('queue-total')).toContainText('180');
  await expect(page.getByRole('heading', { name: '1 completed item to review' })).toBeVisible();
});

test('@claim:validated-import rejects blank required cells and non-numeric amounts without replacing saved work', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({
    name: 'valid-work.csv', mimeType: 'text/csv',
    buffer: Buffer.from('date,client,project,description,status,amount\n2026-08-01,Acme,Site,Safe saved row,completed,125')
  });
  await page.getByRole('button', { name: 'Import work', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Safe saved row' })).toBeVisible();

  await page.locator('#file-work').setInputFiles({
    name: 'invalid-work.csv', mimeType: 'text/csv',
    buffer: Buffer.from('date,client,project,description,status,amount\n,,,,completed,not-a-number')
  });
  await page.getByRole('button', { name: 'Import work', exact: true }).click();

  await expect(page.getByRole('alert')).toContainText('Work CSV row 2');
  await expect(page.getByRole('alert')).toContainText('date, client, project, and description are required');
  await expect(page.getByRole('alert')).toContainText('amount must be a number');
  await expect(page.getByRole('heading', { name: 'Safe saved row' })).toBeVisible();
  await expect(page.getByTestId('queue-total')).toContainText('125');

  const finiteButOverflowing = `1${'0'.repeat(199)}`;
  await page.locator('#file-work').setInputFiles({
    name: 'overflowing-hours.csv', mimeType: 'text/csv',
    buffer: Buffer.from(`date,client,project,description,hours,rate\n2026-08-02,Acme,Site,Overflowing calculation,${finiteButOverflowing},${finiteButOverflowing}`)
  });
  await page.getByRole('button', { name: 'Import work', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Work CSV row 2: hours multiplied by rate must produce a finite amount');
  await expect(page.getByRole('heading', { name: 'Safe saved row' })).toBeVisible();
  await expect(page.getByTestId('queue-total')).toContainText('125');
  expect(pageErrors).toEqual([]);

  await page.locator('#file-work').setInputFiles({
    name: 'recovered-work.csv', mimeType: 'text/csv',
    buffer: Buffer.from('date,client,project,description,status,amount\n2026-08-02,Acme,Site,Recovered row,completed,250')
  });
  await page.getByRole('button', { name: 'Import work', exact: true }).click();
  await expect(page.getByText('1 work rows imported.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recovered row' })).toBeVisible();
  await expect(page.getByTestId('queue-total')).toContainText('250');

  await page.locator('#file-invoices').setInputFiles({
    name: 'valid-invoices.csv', mimeType: 'text/csv',
    buffer: Buffer.from('invoice date,invoice number,client,project\n2026-08-03,INV-SAFE,Acme,Site')
  });
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await expect(page.getByText('Possible invoice:').first()).toBeVisible();
  await page.locator('#file-invoices').setInputFiles({
    name: 'invalid-invoices.csv', mimeType: 'text/csv',
    buffer: Buffer.from('invoice date,invoice number,client,project\n,,,Site')
  });
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await expect(page.getByRole('alert')).toContainText('Invoice CSV row 2');
  await expect(page.getByRole('alert')).toContainText('invoice date, invoice number, and client are required');
  await expect(page.getByText('Possible invoice:').first()).toBeVisible();
});

test('@claim:hours-times-rate calculates a missing amount from hours and rate', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({
    name: 'hours.csv', mimeType: 'text/csv',
    buffer: Buffer.from('date,client,project,description,hours,rate\n2026-08-01,Acme,Site,Hourly design,2,75')
  });
  await page.getByRole('button', { name: 'Import work', exact: true }).click();
  await expect(page.getByTestId('queue-total')).toContainText('150');
  await expect(page.getByRole('heading', { name: 'Hourly design' }).locator('xpath=ancestor::li')).toContainText('$150.00');
});

test('@claim:review-matches keeps suggestions under user control', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('/demo');
  await expect(page.getByTestId('queue-total')).toContainText('5,840');
  await page.getByRole('button', { name: 'Link invoice' }).first().click();
  await expect(page.getByText('Invoice linked. The item left the list.')).toBeVisible();
  await expect(page.getByTestId('queue-total')).toContainText('3,640');
  await expect(page.getByRole('heading', { name: 'Final responsive page build' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Linked matches' })).toBeVisible();
  await expect(page.locator('.linked-matches')).toContainText('Final responsive page build');
  await page.reload();
  const unlink = page.getByRole('button', { name: 'Unlink invoice' });
  await expect(unlink).toBeVisible();
  await unlink.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Invoice unlinked. The item returned to the list.')).toBeVisible();
  await expect(page.getByTestId('queue-total')).toContainText('5,840');
  await expect(page.getByRole('heading', { name: 'Final responsive page build' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Linked matches' })).toHaveCount(0);

  const client = 'Extremely Long Client Organization Name';
  const project = 'Quarterly Platform Migration';
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({
    name: 'reviewed-work.csv', mimeType: 'text/csv',
    buffer: Buffer.from(`date,client,project,description,status,amount\n2026-08-01,${client},${project},Original reviewed task,completed,100`)
  });
  await page.getByRole('button', { name: 'Import work', exact: true }).click();
  await expect(page.getByText('1 work rows imported.')).toBeVisible();
  await page.locator('#file-invoices').setInputFiles({
    name: 'reviewed-invoice.csv', mimeType: 'text/csv',
    buffer: Buffer.from(`invoice date,invoice number,client,project\n2026-08-02,INV-OLD,${client},${project}`)
  });
  await page.getByRole('button', { name: 'Import invoices', exact: true }).click();
  await page.getByRole('button', { name: 'Link invoice' }).click();
  await expect(page.getByTestId('queue-total')).toContainText('0.00');

  await page.locator('#file-work').setInputFiles({
    name: 'replacement-work.csv', mimeType: 'text/csv',
    buffer: Buffer.from(`date,client,project,description,status,amount\n2026-08-01,${client},${project},New implementation task never reviewed,completed,500`)
  });
  await page.getByRole('button', { name: 'Import work', exact: true }).click();
  await expect(page.getByText('1 work rows imported. 1 prior review decision was cleared because that work changed.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'New implementation task never reviewed' })).toBeVisible();
  await expect(page.getByTestId('queue-total')).toContainText('500');
  await expect(page.getByRole('heading', { name: 'Linked matches' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'New implementation task never reviewed' })).toBeVisible();
  await expect(page.getByTestId('queue-total')).toContainText('500');
  expect(pageErrors).toEqual([]);
});

test('@claim:invoice-replacement clears links to invoices missing from the replacement CSV', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Link invoice' }).first().click();
  await expect(page.getByTestId('queue-total')).toContainText('3,640');

  await page.locator('#file-invoices').setInputFiles({
    name: 'reordered-invoices.csv', mimeType: 'text/csv',
    buffer: Buffer.from('invoice date,invoice number,client,project,status\n2026-08-28,INV-UNRELATED,Other Client,Other Project,sent\n2026-08-25,INV-1042,Brightside Studios,Website launch,sent')
  });
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await expect(page.getByText('2 invoice rows imported.')).toBeVisible();
  await expect(page.getByTestId('queue-total')).toContainText('3,640');
  await expect(page.locator('.linked-matches')).toContainText('INV-1042');

  await page.locator('#file-invoices').setInputFiles({
    name: 'replacement-invoices.csv', mimeType: 'text/csv',
    buffer: Buffer.from('invoice date,invoice number,client,project,status\n2026-08-28,INV-UNRELATED,Other Client,Other Project,sent')
  });
  await page.getByRole('button', { name: 'Import invoices' }).click();

  await expect(page.getByText('1 invoice rows imported. 1 stale invoice link cleared.')).toBeVisible();
  await expect(page.getByTestId('queue-total')).toContainText('5,840');
  await expect(page.getByRole('heading', { name: 'Final responsive page build' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Linked matches' })).toHaveCount(0);
});

test('@claim:work-replacement keeps unchanged reviews and clears changed work reviews', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({
    name: 'original-work.csv', mimeType: 'text/csv',
    buffer: Buffer.from('date,client,project,description,status,amount\n2026-08-01,Acme,Launch,Unchanged reviewed work,completed,100\n2026-08-02,Beta,Site,Work that will change,completed,200')
  });
  await page.getByRole('button', { name: 'Import work', exact: true }).click();
  await page.locator('#file-invoices').setInputFiles({
    name: 'invoices.csv', mimeType: 'text/csv',
    buffer: Buffer.from('invoice date,invoice number,client,project\n2026-08-03,INV-ACME,Acme,Launch\n2026-08-03,INV-BETA,Beta,Site')
  });
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await page.getByRole('heading', { name: 'Unchanged reviewed work' }).locator('..').getByRole('button', { name: 'Link invoice' }).click();
  await page.getByRole('heading', { name: 'Work that will change' }).locator('..').getByRole('button', { name: 'Keep unbilled' }).click();

  await page.locator('#file-work').setInputFiles({
    name: 'replacement-work.csv', mimeType: 'text/csv',
    buffer: Buffer.from('date,client,project,description,status,amount\n2026-08-01,Acme,Launch,Unchanged reviewed work,completed,100\n2026-08-02,Beta,Site,Changed work returns,completed,250')
  });
  await page.getByRole('button', { name: 'Import work', exact: true }).click();
  await expect(page.getByText('2 work rows imported. 1 prior review decision was cleared because that work changed.')).toBeVisible();
  await expect(page.locator('.linked-matches')).toContainText('Unchanged reviewed work');
  await expect(page.getByRole('heading', { name: 'Changed work returns' })).toBeVisible();
  await expect(page.getByText('Work that will change')).toHaveCount(0);
  await expect(page.getByTestId('queue-total')).toContainText('250');
});

test('@claim:csv-export exports one checklist row per queue item', async ({ page }) => {
  await page.goto('/demo');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export checklist CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('invoice-draft-checklist.csv');
  const path = await download.path();
  expect(path).not.toBeNull();
  const content = await readFile(path!, 'utf8');
  const lines = content.trim().split('\n');
  expect(lines[0]).toBe('Ready,Date,Client,Project,Description,Amount,Currency');
  expect(lines).toHaveLength(5);
  expect(content).toContain('Final responsive page build');
});

test('@claim:local-only sends no imported or demo review rows off-device', async ({ page }) => {
  const offOrigin: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') offOrigin.push(request.url());
  });
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({ name: 'private.csv', mimeType: 'text/csv', buffer: Buffer.from('date,client,project,description,status,amount\n2026-08-01,Private Client,Secret Job,Private task,completed,100') });
  await page.getByRole('button', { name: 'Import work' }).click();
  await page.getByRole('checkbox').first().check();
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Keep unbilled' }).first().click();
  expect(offOrigin).toEqual([]);
});

test('@claim:network-boundary contacts Sociobot only for explicit license actions', async ({ page }) => {
  const offOrigin: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') offOrigin.push(request.url());
  });
  await page.route('https://api.sociobot.in/api/v1/products/unbilled-work-sweep/verify?license=boundary-license', (route) => route.fulfill({ json: { valid: true, reason: 'ok', expires_at: null } }));
  await page.route('https://api.sociobot.in/api/v1/products/unbilled-work-sweep/checkout', (route) => route.fulfill({ contentType: 'text/html', body: '<title>Hosted checkout</title>' }));

  await page.goto('/');
  await page.locator('#file-work').setInputFiles({ name: 'private.csv', mimeType: 'text/csv', buffer: Buffer.from('date,client,project,description,status,amount\n2026-08-01,Private Client,Secret Job,Private task,completed,100') });
  await page.getByRole('button', { name: 'Import work' }).click();
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Keep unbilled' }).first().click();
  expect(offOrigin).toEqual([]);

  await page.goto('/');
  await page.getByLabel('Have a license? Paste it here').fill('boundary-license');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('License verified. Review history is active.')).toBeVisible();
  await page.getByRole('link', { name: 'Review history active' }).click();
  await expect.poll(() => offOrigin).toEqual([
    'https://api.sociobot.in/api/v1/products/unbilled-work-sweep/verify?license=boundary-license',
    'https://api.sociobot.in/api/v1/products/unbilled-work-sweep/checkout'
  ]);
});

test('@claim:offline-reload works offline after the first visit', async ({ page, context }) => {
  await page.goto(`http://pwa-offline-${Date.now()}.localhost:4173/`);
  await expect.poll(() => page.evaluate(async () => Boolean(await navigator.serviceWorker.getRegistration()))).toBe(true);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  const cachedShell = await page.evaluate(async () => {
    const entries = await Promise.all((await caches.keys()).map(async (name) => (await (await caches.open(name)).keys()).map((request) => new URL(request.url).pathname)));
    return entries.flat();
  });
  expect(cachedShell.some((path) => /\/assets\/index-.+\.js$/u.test(path))).toBe(true);
  expect(cachedShell.some((path) => /\/assets\/index-.+\.css$/u.test(path))).toBe(true);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await context.setOffline(true);
  const cachedModule = await page.evaluate(async () => {
    const asset = performance.getEntriesByType('resource').map((entry) => entry.name).find((url) => /\/assets\/index-.+\.js$/u.test(url));
    if (!asset) return { ok: false, length: 0 };
    const response = await fetch(asset, { cache: 'no-store' });
    return { ok: response.ok, length: (await response.text()).length };
  });
  expect(cachedModule.ok).toBe(true);
  expect(cachedModule.length).toBeGreaterThan(1_000);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Find finished work you have not billed' })).toBeVisible();
  await expect(page.getByTestId('workspace')).toBeVisible();
});

test('@claim:manifest-mime serves the web app manifest with a manifest JSON content type', async ({ request }) => {
  const response = await request.get('/manifest.webmanifest');
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toMatch(/^application\/(?:manifest\+json|json)(?:;|$)/u);
  const config = JSON.parse(await readFile('public/staticwebapp.config.json', 'utf8')) as { routes: Array<{ route: string; headers?: Record<string, string> }> };
  const manifestRoute = config.routes.find((route) => route.route === '/manifest.webmanifest');
  expect(manifestRoute).toMatchObject({ rewrite: '/manifest.json' });
  expect(JSON.parse(await readFile('public/manifest.json', 'utf8'))).toEqual(JSON.parse(await readFile('public/manifest.webmanifest', 'utf8')));
});

test('@claim:runtime-asset-cache stores a fetched same-origin asset for offline reuse', async ({ page }) => {
  await page.goto(`http://runtime-cache-${Date.now()}.localhost:4173/demo`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  const assetPath = '/assets/og-paperwork-garden.webp';
  await expect(page.evaluate(async (path) => (await fetch(path, { cache: 'no-store' })).ok, assetPath)).resolves.toBe(true);
  await expect.poll(() => page.evaluate(async (path) => {
    const requests = await Promise.all((await caches.keys()).map(async (name) => (await (await caches.open(name)).keys()).map((request) => new URL(request.url).pathname)));
    return requests.flat().includes(path);
  }, assetPath)).toBe(true);
});

test('@claim:invoice-date-guard never suggests an invoice dated before its work', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({ name: 'work.csv', mimeType: 'text/csv', buffer: Buffer.from('date,client,project,description,status,amount\n10/1/2026,Acme,Launch,October work,completed,100\n12/31/2025,Beta,Renewal,Year end work,completed,200') });
  await page.getByRole('button', { name: 'Import work', exact: true }).click();
  await page.locator('#file-invoices').setInputFiles({ name: 'invoice.csv', mimeType: 'text/csv', buffer: Buffer.from('invoice date,invoice number,client,project\n9/1/2026,INV-OLD,Acme,Launch\n1/1/2026,INV-NEW,Beta,Renewal') });
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await expect(page.getByRole('heading', { name: 'October work' }).locator('..')).toContainText('No invoice match found');
  await expect(page.getByRole('heading', { name: 'October work' }).locator('..')).not.toContainText('INV-OLD');
  await expect(page.getByRole('heading', { name: 'Year end work' }).locator('..')).toContainText('Possible invoice: INV-NEW');
  await expect(page.getByTestId('queue-total')).toContainText('300');

  await page.locator('#file-invoices').setInputFiles({ name: 'invalid-invoice-date.csv', mimeType: 'text/csv', buffer: Buffer.from('invoice date,invoice number,client,project\nnot-a-date,INV-BAD,Beta,Renewal') });
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await expect(page.getByRole('alert')).toContainText('invoice date must use YYYY-MM-DD or M/D/YYYY and be a real calendar date');
  await expect(page.getByRole('heading', { name: 'Year end work' }).locator('..')).toContainText('Possible invoice: INV-NEW');

  await page.locator('#file-work').setInputFiles({ name: 'invalid-date.csv', mimeType: 'text/csv', buffer: Buffer.from('date,client,project,description,status,amount\nnot-a-date,Acme,Launch,Bad date,completed,999\n2/30/2026,Acme,Launch,Impossible date,completed,999') });
  await page.getByRole('button', { name: 'Import work', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('row 2: date must use YYYY-MM-DD or M/D/YYYY and be a real calendar date');
  await expect(page.getByRole('alert')).toContainText('row 3: date must use YYYY-MM-DD or M/D/YYYY and be a real calendar date');
  await expect(page.getByRole('heading', { name: 'October work' })).toBeVisible();
  await expect(page.getByTestId('queue-total')).toContainText('300');
});

test('@claim:match-normalization suggests matching client and project wording, not a different project', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({ name: 'work.csv', mimeType: 'text/csv', buffer: Buffer.from('date,client,project,description,status,amount\n2026-08-01,Brightside Studio,Website launch,Landing page work,completed,500') });
  await page.getByRole('button', { name: 'Import work', exact: true }).click();
  await page.locator('#file-invoices').setInputFiles({ name: 'invoices.csv', mimeType: 'text/csv', buffer: Buffer.from('invoice date,invoice number,client,project\n2026-08-02,INV-GOOD,Brightside Studios,Website Launch\n2026-08-03,INV-NEAR,Brightside Studios,Annual audit') });
  await page.getByRole('button', { name: 'Import invoices' }).click();
  const row = page.getByRole('heading', { name: 'Landing page work' }).locator('..');
  await expect(row).toContainText('Possible invoice: INV-GOOD');
  await expect(row).not.toContainText('INV-NEAR');
});

test('@claim:paid-license uses the Sociobot checkout and verification contract', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/unbilled-work-sweep/verify?license=test-license', (route) => route.fulfill({ json: { valid: true, reason: 'ok', expires_at: null } }));
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Buy review history — $19' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/unbilled-work-sweep/checkout');
  await page.getByLabel('Have a license? Paste it here').fill('test-license');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('License verified. Review history is active.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Review history active' })).toBeVisible();
  await page.goto('/demo');
  page.once('dialog', (dialog) => dialog.accept('Friday sweep'));
  await page.getByRole('button', { name: 'Save review total' }).click();
  await expect(page.getByText('Friday sweep')).toBeVisible();
  await expect(page.locator('.snapshots').getByText(/4 items/)).toBeVisible();
});

test('@claim:snapshot-history saves two named review totals on this device', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/unbilled-work-sweep/verify?license=history-license', (route) => route.fulfill({ json: { valid: true, reason: 'ok', expires_at: null } }));
  await page.goto('/');
  await page.getByLabel('Have a license? Paste it here').fill('history-license');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await page.goto('/demo');
  page.once('dialog', (dialog) => dialog.accept('Before invoice review'));
  await page.getByRole('button', { name: 'Save review total' }).click();
  await expect(page.locator('.snapshots')).toContainText('Before invoice review');
  await expect(page.locator('.snapshots')).toContainText('4 items · $5,840.00');
  await page.getByRole('button', { name: 'Link invoice' }).first().click();
  page.once('dialog', (dialog) => dialog.accept('After invoice review'));
  await page.getByRole('button', { name: 'Save review total' }).click();
  await expect(page.locator('.snapshots')).toContainText('After invoice review');
  await expect(page.locator('.snapshots')).toContainText('3 items · $3,640.00');
  await expect(page.locator('.snapshots li')).toHaveCount(2);
});

test('@claim:local-persistence keeps a real workspace after reload', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({ name: 'saved.csv', mimeType: 'text/csv', buffer: Buffer.from('date,client,project,description,status,amount\n2026-08-01,Acme,Site,Saved task,completed,125') });
  await page.getByRole('button', { name: 'Import work' }).click();
  await expect(page.getByText('1 work rows imported.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Saved task' })).toBeVisible();
  await expect(page.getByTestId('queue-total')).toContainText('125');
});

test('@claim:workspace-backup exports and restores the full workspace', async ({ page }) => {
  await page.goto('/demo');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export workspace' }).click();
  const backup = await downloadPromise;
  const backupPath = await backup.path();
  expect(backupPath).not.toBeNull();
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.locator('#import-workspace').setInputFiles(backupPath!);
  await expect(page.getByText('Workspace imported.')).toBeVisible();
  await expect(page.getByTestId('queue-total')).toContainText('5,840');
});

test('@claim:demo-isolation keeps demo data separate and discards it when leaving', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({ name: 'real.csv', mimeType: 'text/csv', buffer: Buffer.from('date,client,project,description,status,amount\n2026-08-01,Real Client,Real Project,Real workspace row,completed,125') });
  await page.getByRole('button', { name: 'Import work' }).click();
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Final responsive page build' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep unbilled' }).first().click();
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page.getByRole('heading', { name: 'Real workspace row' })).toBeVisible();
  const demoKeys = await page.evaluate(() => Object.keys(sessionStorage).filter((key) => key.startsWith('demo:')));
  expect(demoKeys).toEqual([]);
});

test('@claim:demo-session-removal removes reviewed demo state when the browser session ends', async ({ browser }) => {
  const firstContext = await browser.newContext();
  const firstPage = await firstContext.newPage();
  await firstPage.goto('http://127.0.0.1:4173/demo');
  await firstPage.getByRole('button', { name: 'Keep unbilled' }).first().click();
  await expect(firstPage.getByText('Match reviewed. The work stays in the queue.')).toBeVisible();
  expect(await firstPage.evaluate(() => sessionStorage.getItem('demo:unbilled-work-sweep'))).toContain('"kind":"keep"');
  await firstContext.close();

  const secondContext = await browser.newContext();
  const secondPage = await secondContext.newPage();
  await secondPage.goto('http://127.0.0.1:4173/demo');
  await expect(secondPage.getByText('Reviewed · kept in queue')).toHaveCount(0);
  const decisions = await secondPage.evaluate(() => JSON.parse(sessionStorage.getItem('demo:unbilled-work-sweep') ?? '{}').decisions);
  expect(decisions).toEqual({});
  await secondContext.close();
});

test('@claim:clear-workspace removes the current workspace and persists the empty state', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByText('Use “Clear imported data” to remove the current workspace.')).toBeVisible();
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({ name: 'clear-me.csv', mimeType: 'text/csv', buffer: Buffer.from('date,client,project,description,status,amount\n2026-08-01,Acme,Site,Clear this row,completed,125') });
  await page.getByRole('button', { name: 'Import work' }).click();
  await expect(page.getByRole('heading', { name: 'Clear this row' })).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Clear imported data' }).click();
  await expect(page.getByText('Imported data cleared.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Clear this row' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByText('Your unbilled-work list will appear here')).toBeVisible();
});

test('@claim:license-storage stores only the license token and latest verification result', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/unbilled-work-sweep/verify?license=privacy-test', (route) => route.fulfill({ json: { valid: false, reason: 'invalid', expires_at: null } }));
  await page.goto('/privacy');
  await expect(page.getByText('This app stores only your license token and its latest verification result.')).toBeVisible();
  await page.goto('/');
  await page.getByLabel('Have a license? Paste it here').fill('privacy-test');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('License no longer active. Check the token or buy a new license.')).toBeVisible();
  const stored = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  expect(Object.keys(stored).sort()).toEqual([
    'sb_license:unbilled-work-sweep',
    'sb_license_verdict:unbilled-work-sweep'
  ]);
  expect(stored['sb_license:unbilled-work-sweep']).toBe('privacy-test');
  expect(JSON.parse(stored['sb_license_verdict:unbilled-work-sweep'])).toEqual({ valid: false, checkedAt: expect.any(Number) });
});

test('@claim:free-core keeps imports, review, and checklist export available without a license', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('button', { name: 'Review history · paid' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep unbilled' }).first().click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export checklist CSV' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('invoice-draft-checklist.csv');
});

test('@claim:billing-boundary uses one Sociobot checkout link with no embedded payment form', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('One payment; no subscription.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy review history — $19' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/unbilled-work-sweep/checkout');
  await expect(page.locator('iframe, input[name*="card" i], input[autocomplete="cc-number"]')).toHaveCount(0);
});

test('@claim:scope-boundaries keeps the sweep as a review and export tool', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'It does not send invoices' })).toBeVisible();
  await expect(page.getByText('It does not track time, calculate tax, or change your source files.')).toBeVisible();
  await expect(page.getByRole('button', { name: /send invoice|calculate tax|track time/i })).toHaveCount(0);
});

test('@claim:art-disclosure discloses generated product artwork in the footer', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer')).toContainText('Artwork disclosure: generated for this product.');
});

test('a malformed workspace backup is rejected without replacing or bricking the saved workspace', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', (error) => pageErrors.push(error));
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({
    name: 'valid-work.csv', mimeType: 'text/csv',
    buffer: Buffer.from('date,client,project,description,status,amount\n2026-08-01,Acme,Site,Safe workspace row,completed,125')
  });
  await page.getByRole('button', { name: 'Import work' }).click();
  await expect(page.getByRole('heading', { name: 'Safe workspace row' })).toBeVisible();
  await page.locator('#import-workspace').setInputFiles({
    name: 'malformed-workspace.json', mimeType: 'application/json',
    buffer: Buffer.from('{"work":[],"invoices":[],"decisions":null,"checked":{},"currency":"USD","importedAt":null}')
  });
  await expect(page.getByRole('alert')).toHaveText('That workspace file is not valid. Choose an exported workspace JSON file.');
  await expect(page.getByRole('heading', { name: 'Safe workspace row' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Safe workspace row' })).toBeVisible();
  await expect(page.getByTestId('queue-total')).toContainText('125');
  expect(pageErrors).toEqual([]);
});

test('workspace backup validation rejects malformed nested records and fields', () => {
  const valid = sampleState();
  valid.decisions = { 'w-bright-1': { kind: 'linked', invoiceId: 'i-bright-1' }, 'w-north-1': { kind: 'keep' } };
  valid.checked = { 'w-bright-1': true };
  expect(isSweepState(valid)).toBe(true);

  const malformed: unknown[] = [
    { ...valid, decisions: null },
    { ...valid, decisions: { 'w-bright-1': { kind: 'linked', invoiceId: 42 } } },
    { ...valid, checked: { 'w-bright-1': 'yes' } },
    { ...valid, work: [{ ...valid.work[0], amount: '125' }] },
    { ...valid, work: [{ ...valid.work[0], description: '  ' }] },
    { ...valid, invoices: [{ ...valid.invoices[0], status: false }] },
    { ...valid, invoices: [{ ...valid.invoices[0], number: '' }] },
    { ...valid, currency: 'JPY' },
    { ...valid, importedAt: 42 }
  ];
  malformed.forEach((backup) => expect(isSweepState(backup)).toBe(false));
});

test('the update action targets only the waiting worker', async () => {
  const app = await readFile('src/main.ts', 'utf8');
  expect(app).toContain('const worker = registration.waiting');
  expect(app).toContain("if (!canAnnounceUpdate || !worker || !registration.active || registration.active === worker) return;");
  expect(app).toContain('waitingServiceWorker.postMessage({ type: \'SKIP_WAITING\' })');
  expect(app).not.toContain('navigator.serviceWorker.controller?.postMessage({ type: \'SKIP_WAITING\' })');
});

test('the update notice stays hidden when the controlled page has no waiting worker', async ({ page }) => {
  const origin = `http://no-update-${Date.now()}.localhost:4173`;
  await page.goto(`${origin}/demo`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await expect.poll(() => page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return Boolean(registration?.waiting);
  })).toBe(false);
  await expect(page.locator('#update-notice')).toBeHidden();
});

test('routes, keyboard landmarks, and serious accessibility issues pass', async ({ page }) => {
  for (const path of ['/', '/demo', '/privacy', '/terms', '/missing-page']) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Unbilled Work Sweep/);
    await expect(page.locator('meta[name="description"]')).not.toHaveAttribute('content', '');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', await page.title());
    await expect(page.locator('meta[property="og:description"]')).not.toHaveAttribute('content', '');
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', await page.title());
    await expect(page.locator('meta[name="twitter:description"]')).not.toHaveAttribute('content', '');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://unbilled-work-sweep.sociobot.in${path === '/' ? '/' : path}`);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
    expect(results.violations.find((violation) => violation.id === 'heading-order')).toBeUndefined();
    const headingLevels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
    headingLevels.slice(1).forEach((level, index) => expect(level).toBeLessThanOrEqual(headingLevels[index] + 1));
  }
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeVisible();

  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page).toHaveURL(/\/privacy$/u);
  await expect(page).toHaveTitle('Privacy — Unbilled Work Sweep');
  await expect(page.getByRole('heading', { name: 'Your files stay on this device' })).toBeFocused();
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms');
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Find finished work you have not billed' })).toBeFocused();
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Your files stay on this device' })).toBeFocused();
});

test('the static 404 fallback has the product skeleton, literal copy, and route metadata', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Unbilled Work Sweep');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /requested Unbilled Work Sweep page was not found/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://unbilled-work-sweep.sociobot.in/404.html');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Page not found — Unbilled Work Sweep');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeVisible();
  await expect(page.getByRole('banner')).toContainText('Unbilled Work Sweep');
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toContainText('Demo');
  await expect(page.getByRole('main')).toContainText('404 error');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return home' })).toHaveAttribute('href', '/');
  await expect(page.getByRole('contentinfo')).toContainText('Privacy');
  await expect(page.getByRole('contentinfo')).toContainText('Terms');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('demo heading order and persistent controls meet the accessibility contract', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  const results = await new AxeBuilder({ page }).withRules(['heading-order']).analyze();
  expect(results.violations).toEqual([]);
  await expect(page.locator('h1').first()).toHaveText('Review work before you invoice');
  await expect(page.locator('h2').first()).toHaveText('4 completed items to review');
  const targets = await page.locator('.demo-banner button').evaluateAll((buttons) => buttons.map((button) => {
    const bounds = button.getBoundingClientRect();
    return { name: button.textContent?.trim(), width: bounds.width, height: bounds.height };
  }));
  expect(targets.map(({ name }) => name)).toEqual(['Reset demo', 'Start for real']);
  for (const target of targets) {
    expect(target.width).toBeGreaterThanOrEqual(44);
    expect(target.height).toBeGreaterThanOrEqual(44);
  }
});

test('row entrance motion preserves text contrast throughout the animation', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('.work-slip').first().waitFor();
  await page.addStyleTag({ content: '.work-slip { animation: place-row 220ms ease -110ms paused both !important; }' });
  await expect(page.locator('.work-slip').first()).toHaveCSS('opacity', '1');
  const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
  expect(results.violations).toEqual([]);
});

test('keyboard focus is visibly transferred to all three file chooser labels at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');

  for (const id of ['file-work', 'file-invoices', 'import-workspace']) {
    for (let step = 0; step < 80 && await page.evaluate((target) => document.activeElement?.id !== target, id); step += 1) {
      await page.keyboard.press('Tab');
    }
    await expect(page.locator(`#${id}`)).toBeFocused();
    const focusStyle = await page.locator(`label[for="${id}"]`).evaluate((label) => {
      const style = getComputedStyle(label);
      return { outlineStyle: style.outlineStyle, outlineWidth: Number.parseFloat(style.outlineWidth), outlineColor: style.outlineColor };
    });
    expect(focusStyle.outlineStyle).toBe('solid');
    expect(focusStyle.outlineWidth).toBeGreaterThanOrEqual(3);
    expect(focusStyle.outlineColor).not.toBe('rgba(0, 0, 0, 0)');
  }
});

test('query demo entry and invalid CSV error state work', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByTestId('queue-total')).toContainText('5,840');
  expect(await page.evaluate(() => sessionStorage.getItem('demo:unbilled-work-sweep'))).not.toBeNull();
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.locator('#file-work').setInputFiles({ name: 'broken.csv', mimeType: 'text/csv', buffer: Buffer.from('only-one-header\nvalue') });
  await expect(page.getByRole('alert')).toContainText('header row and at least one data row');
});

test('the 390px layout stays inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  for (const name of ['Reset demo', 'Start for real']) {
    const box = await page.getByRole('button', { name }).boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  await expect(page.getByRole('button', { name: 'Export checklist CSV' })).toBeVisible();
});

test('the 390px landing page tolerates 200% text sizing', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const shortcut = await page.getByRole('link', { name: 'Or import your CSV files' }).boundingBox();
  expect(shortcut?.width).toBeGreaterThanOrEqual(44);
  expect(shortcut?.height).toBeGreaterThanOrEqual(44);
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
});

test('all three first-screen facts fit at phone and desktop review sizes', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const facts = page.locator('.plain-facts li');
    await expect(facts).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      const box = await facts.nth(index).boundingBox();
      expect(box, `fact ${index + 1} at ${viewport.width}x${viewport.height}`).not.toBeNull();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
    }
  }
});
