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

test('@claim:local-only sends no imported or demo rows off-device', async ({ page }) => {
  const offOrigin: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') offOrigin.push(request.url());
  });
  await page.goto('/');
  await page.locator('#file-work').setInputFiles({ name: 'private.csv', mimeType: 'text/csv', buffer: Buffer.from('date,client,project,description,status,amount\n2026-08-01,Private Client,Secret Job,Private task,completed,100') });
  await page.getByRole('button', { name: 'Import work' }).click();
  await page.getByRole('checkbox').first().check();
  expect(offOrigin).toEqual([]);
});

test('@claim:offline-reload works offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Review work before you invoice' })).toBeVisible();
  await expect(page.getByTestId('work-list')).toBeVisible();
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
