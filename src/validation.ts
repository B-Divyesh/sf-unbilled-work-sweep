import type { Decision, Invoice, SweepState, WorkItem, WorkSource } from './types';
import { parseCalendarDate } from './dates';

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

function nonEmptyStringFields(value: Record<string, unknown>, keys: string[]): boolean {
  return keys.every((key) => typeof value[key] === 'string' && value[key].trim().length > 0);
}

function isWorkItem(value: unknown): value is WorkItem {
  if (!record(value) || !exactKeys(value, ['id', 'sourceId', 'date', 'client', 'project', 'description', 'status', 'amount', 'billed'])) return false;
  return stringFields(value, ['id', 'sourceId', 'date', 'client', 'project', 'description', 'status'])
    && nonEmptyStringFields(value, ['sourceId'])
    && nonEmptyStringFields(value, ['date', 'client', 'project', 'description'])
    && parseCalendarDate(value.date as string) !== null
    && typeof value.amount === 'number' && Number.isFinite(value.amount)
    && typeof value.billed === 'boolean';
}

function isWorkSource(value: unknown): value is WorkSource {
  if (!record(value) || !exactKeys(value, ['id', 'name', 'importedAt'])) return false;
  return stringFields(value, ['id', 'name', 'importedAt']) && nonEmptyStringFields(value, ['id', 'name', 'importedAt']);
}

function isInvoice(value: unknown): value is Invoice {
  if (!record(value) || !exactKeys(value, ['id', 'date', 'number', 'client', 'project', 'status'])) return false;
  return stringFields(value, ['id', 'date', 'number', 'client', 'project', 'status'])
    && nonEmptyStringFields(value, ['date', 'number', 'client'])
    && parseCalendarDate(value.date as string) !== null;
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
  if (!record(value) || !exactKeys(value, ['work', 'workSources', 'invoices', 'decisions', 'checked', 'currency', 'importedAt'])) return false;
  if (!Array.isArray(value.work) || !value.work.every(isWorkItem)
    || !Array.isArray(value.workSources) || !value.workSources.every(isWorkSource)) return false;
  const sources = value.workSources as WorkSource[];
  return value.work.every((work) => sources.some((source) => source.id === work.sourceId))
    && Array.isArray(value.invoices) && value.invoices.every(isInvoice)
    && isDecisionRecord(value.decisions)
    && isCheckedRecord(value.checked)
    && typeof value.currency === 'string' && currencies.has(value.currency)
    && (typeof value.importedAt === 'string' || value.importedAt === null);
}

function isLegacyWorkItem(value: unknown): value is Omit<WorkItem, 'sourceId'> {
  if (!record(value) || !exactKeys(value, ['id', 'date', 'client', 'project', 'description', 'status', 'amount', 'billed'])) return false;
  return stringFields(value, ['id', 'date', 'client', 'project', 'description', 'status'])
    && nonEmptyStringFields(value, ['date', 'client', 'project', 'description'])
    && parseCalendarDate(value.date as string) !== null
    && typeof value.amount === 'number' && Number.isFinite(value.amount)
    && typeof value.billed === 'boolean';
}

/** Keep work saved by the pre-multi-source release instead of silently dropping it. */
export function restoreSweepState(value: unknown): SweepState | null {
  if (isSweepState(value)) return value;
  if (!record(value) || !exactKeys(value, ['work', 'invoices', 'decisions', 'checked', 'currency', 'importedAt'])) return null;
  if (!Array.isArray(value.work) || !value.work.every(isLegacyWorkItem)
    || !Array.isArray(value.invoices) || !value.invoices.every(isInvoice)
    || !isDecisionRecord(value.decisions) || !isCheckedRecord(value.checked)
    || typeof value.currency !== 'string' || !currencies.has(value.currency)
    || !(typeof value.importedAt === 'string' || value.importedAt === null)) return null;
  const sourceId = 'earlier-completed-work';
  return {
    work: value.work.map((work) => ({ ...work, sourceId })),
    workSources: value.work.length ? [{ id: sourceId, name: 'Earlier completed-work import', importedAt: value.importedAt ?? new Date().toISOString() }] : [],
    invoices: value.invoices,
    decisions: value.decisions,
    checked: value.checked,
    currency: value.currency,
    importedAt: value.importedAt
  };
}
