import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

test('@claim:csv-import imports work and invoice CSV exports', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({
    name: 'work.csv', mimeType: 'text/csv',
    buffer: Buffer.from('date,client,project,description,status,amount,hours,rate\n2026-08-01,Acme,Site,Build page,completed,100,,\n2026-08-02,Acme,Site,Call,in progress,50,,\n2026-08-03,Acme,Site,Research,completed,,2,75')
  });
  await page.getByRole('button', { name: 'Import work' }).click();
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

test('@claim:hours-times-rate calculates a missing amount from hours and rate', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({
    name: 'hours.csv', mimeType: 'text/csv',
    buffer: Buffer.from('date,client,project,description,hours,rate\n2026-08-01,Acme,Site,Hourly design,2,75')
  });
  await page.getByRole('button', { name: 'Import work' }).click();
  await expect(page.getByTestId('queue-total')).toContainText('150');
  await expect(page.getByRole('heading', { name: 'Hourly design' }).locator('xpath=ancestor::li')).toContainText('$150.00');
});

test('@claim:review-matches keeps suggestions under user control', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByTestId('queue-total')).toContainText('5,840');
  await page.getByRole('button', { name: 'Link invoice' }).first().click();
  await expect(page.getByText('Invoice linked. The item left the attention queue.')).toBeVisible();
  await expect(page.getByTestId('queue-total')).toContainText('3,640');
  await expect(page.getByRole('heading', { name: 'Final responsive page build' })).toHaveCount(0);
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

test('@claim:offline-reload works offline after the first visit', async ({ page, context }) => {
  await page.goto(`http://pwa-offline-${Date.now()}.localhost:4173/demo`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  const cachedShell = await page.evaluate(async () => {
    const entries = await Promise.all((await caches.keys()).map(async (name) => (await (await caches.open(name)).keys()).map((request) => new URL(request.url).pathname)));
    return entries.flat();
  });
  expect(cachedShell.some((path) => /\/assets\/index-.+\.js$/u.test(path))).toBe(true);
  expect(cachedShell.some((path) => /\/assets\/index-.+\.css$/u.test(path))).toBe(true);
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
  await expect(page.getByRole('heading', { name: 'Review work before you invoice' })).toBeVisible();
  await expect(page.getByTestId('work-list')).toBeVisible();
});

test('@claim:invoice-date-guard never suggests an invoice dated before its work', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({ name: 'work.csv', mimeType: 'text/csv', buffer: Buffer.from('date,client,project,description,status,amount\n2026-08-10,Acme,Site,Later work,completed,100') });
  await page.getByRole('button', { name: 'Import work' }).click();
  await page.locator('#file-invoices').setInputFiles({ name: 'invoice.csv', mimeType: 'text/csv', buffer: Buffer.from('invoice date,invoice number,client,project\n2026-08-09,INV-1,Acme,Site') });
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await expect(page.getByRole('heading', { name: 'Later work' }).locator('..')).toContainText('No invoice match found');
  await expect(page.getByTestId('queue-total')).toContainText('100');
});

test('@claim:paid-license uses the Sociobot checkout and verification contract', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/unbilled-work-sweep/verify?license=test-license', (route) => route.fulfill({ json: { valid: true, reason: 'ok', expires_at: null } }));
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Buy saved review tools' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/unbilled-work-sweep/checkout');
  await page.getByLabel('Have a license? Paste it here').fill('test-license');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.getByText('License verified. Saved review tools are active.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'License active' })).toBeVisible();
  await page.goto('/demo');
  page.once('dialog', (dialog) => dialog.accept('Friday sweep'));
  await page.getByRole('button', { name: 'Save named snapshot' }).click();
  await expect(page.getByText('Friday sweep')).toBeVisible();
  await expect(page.locator('.snapshots').getByText(/4 items/)).toBeVisible();
});

test('@claim:local-persistence keeps a real workspace after reload', async ({ page }) => {
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({ name: 'saved.csv', mimeType: 'text/csv', buffer: Buffer.from('date,client,project,description,status,amount\n2026-08-01,Acme,Site,Saved task,completed,125') });
  await page.getByRole('button', { name: 'Import work' }).click();
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

test('@claim:free-core keeps imports, review, and checklist export available without a license', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('button', { name: 'Save snapshots · paid' })).toBeVisible();
  await page.getByRole('button', { name: 'Keep unbilled' }).first().click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export checklist CSV' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('invoice-draft-checklist.csv');
});

test('@claim:billing-boundary uses one Sociobot checkout link with no embedded payment form', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('One payment; no subscription.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy saved review tools' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/unbilled-work-sweep/checkout');
  await expect(page.locator('iframe, input[name*="card" i], input[autocomplete="cc-number"]')).toHaveCount(0);
});

test('@claim:scope-boundaries keeps the sweep as a review and export tool', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'It does not send invoices' })).toBeVisible();
  await expect(page.getByText('It does not track time, calculate tax, or change your source files.')).toBeVisible();
  await expect(page.getByRole('button', { name: /send invoice|calculate tax|track time/i })).toHaveCount(0);
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
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  }
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeVisible();
});

test('query demo entry and invalid CSV error state work', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.locator('#file-work').setInputFiles({ name: 'broken.csv', mimeType: 'text/csv', buffer: Buffer.from('only-one-header\nvalue') });
  await expect(page.getByRole('alert')).toContainText('header row and at least one data row');
});

test('the 390px layout stays inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole('button', { name: 'Export checklist CSV' })).toBeVisible();
});
