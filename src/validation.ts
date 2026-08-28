import type { Decision, Invoice, SweepState, WorkItem } from './types';

const currencies = new Set(['USD', 'GBP', 'EUR', 'CAD', 'AUD']);

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  const actual = Object.keys(value);
  return actual.length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

function stringFields(value: Record<string, unknown>, keys: string[]): boolean {
  return keys.every((key) => typeof value[key] === 'string');
}

function isWorkItem(value: unknown): value is WorkItem {
  if (!record(value) || !exactKeys(value, ['id', 'date', 'client', 'project', 'description', 'status', 'amount', 'billed'])) return false;
  return stringFields(value, ['id', 'date', 'client', 'project', 'description', 'status'])
    && typeof value.amount === 'number' && Number.isFinite(value.amount)
    && typeof value.billed === 'boolean';
}

function isInvoice(value: unknown): value is Invoice {
  if (!record(value) || !exactKeys(value, ['id', 'date', 'number', 'client', 'project', 'status'])) return false;
  return stringFields(value, ['id', 'date', 'number', 'client', 'project', 'status']);
}

function isDecision(value: unknown): value is Decision {
  if (!record(value) || typeof value.kind !== 'string') return false;
  if (value.kind === 'keep') return exactKeys(value, ['kind']);
  return value.kind === 'linked' && exactKeys(value, ['kind', 'invoiceId']) && typeof value.invoiceId === 'string';
}

function isDecisionRecord(value: unknown): value is Record<string, Decision> {
  return record(value) && Object.values(value).every(isDecision);
}

function isCheckedRecord(value: unknown): value is Record<string, boolean> {
  return record(value) && Object.values(value).every((checked) => typeof checked === 'boolean');
}

/**
 * Imported JSON is untrusted. Keep this guard deliberately complete because a
 * saved workspace is loaded before the recovery controls are rendered.
 */
export function isSweepState(value: unknown): value is SweepState {
  if (!record(value) || !exactKeys(value, ['work', 'invoices', 'decisions', 'checked', 'currency', 'importedAt'])) return false;
  return Array.isArray(value.work) && value.work.every(isWorkItem)
    && Array.isArray(value.invoices) && value.invoices.every(isInvoice)
    && isDecisionRecord(value.decisions)
    && isCheckedRecord(value.checked)
    && typeof value.currency === 'string' && currencies.has(value.currency)
    && (typeof value.importedAt === 'string' || value.importedAt === null);
}
