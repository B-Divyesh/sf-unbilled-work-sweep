import type { ImportKind, Invoice, Mapping, ParsedCsv, WorkItem } from './types';

const aliases: Record<ImportKind, Record<string, string[]>> = {
  work: {
    date: ['date', 'completed date', 'task date', 'entry date'],
    client: ['client', 'customer', 'customer name', 'client name'],
    project: ['project', 'project name', 'job'],
    description: ['description', 'task', 'task name', 'notes', 'activity'],
    status: ['status', 'task status', 'state'],
    amount: ['amount', 'value', 'total', 'billable amount'],
    hours: ['hours', 'duration hours', 'billable hours'],
    rate: ['rate', 'hourly rate', 'billable rate'],
    billed: ['billed', 'invoiced', 'is billed', 'invoice status']
  },
  invoices: {
    date: ['date', 'invoice date', 'issued date'],
    number: ['invoice', 'invoice number', 'invoice no', 'number', 'reference'],
    client: ['client', 'customer', 'customer name', 'client name'],
    project: ['project', 'project name', 'job'],
    status: ['status', 'invoice status', 'state']
  }
};

export function parseCsv(text: string, filename = 'import.csv'): ParsedCsv {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const source = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(field.trim()); field = ''; }
    else if (char === '\n') { row.push(field.trim()); rows.push(row); row = []; field = ''; }
    else if (char !== '\r') field += char;
  }
  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  if (quoted) throw new Error('The CSV has an unclosed quoted field. Fix that row and import it again.');
  const headers = (rows.shift() ?? []).map((value) => value.trim());
  if (headers.length < 2 || rows.length === 0) throw new Error('The CSV needs a header row and at least one data row.');
  const records = rows.filter((values) => values.some(Boolean)).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
  );
  return { headers, rows: records, filename };
}

export function suggestedMapping(kind: ImportKind, headers: string[]): Mapping {
  const normalized = new Map(headers.map((header) => [header.toLowerCase().trim(), header]));
  return Object.fromEntries(Object.entries(aliases[kind]).map(([field, names]) => [
    field,
    names.map((name) => normalized.get(name)).find(Boolean) ?? ''
  ]));
}

export function mappingFields(kind: ImportKind): { key: string; label: string; required: boolean }[] {
  return kind === 'work'
    ? [
        ['date', 'Date', true], ['client', 'Client', true], ['project', 'Project', true],
        ['description', 'Description', true], ['status', 'Status', false], ['amount', 'Amount', false],
        ['hours', 'Hours', false], ['rate', 'Hourly rate', false], ['billed', 'Already billed', false]
      ].map(([key, label, required]) => ({ key: String(key), label: String(label), required: Boolean(required) }))
    : [
        ['date', 'Invoice date', true], ['number', 'Invoice number', true], ['client', 'Client', true],
        ['project', 'Project', false], ['status', 'Status', false]
      ].map(([key, label, required]) => ({ key: String(key), label: String(label), required: Boolean(required) }));
}

const truthy = (value: string) => /^(yes|true|1|billed|invoiced|paid)$/i.test(value.trim());
const safe = (row: Record<string, string>, mapping: Mapping, key: string) => mapping[key] ? row[mapping[key]] ?? '' : '';
const idFor = (values: string[], index: number) => `${values.join('|').toLowerCase().replace(/[^a-z0-9|]/g, '').slice(0, 50)}-${index}`;

const readableList = (values: string[]): string => values.length < 2
  ? values[0] ?? ''
  : `${values.slice(0, -1).join(', ')}${values.length > 2 ? ',' : ''} and ${values.at(-1)}`;

function numeric(value: string): number | null {
  const normalized = value.trim().replace(/[$£€¥,\s]/g, '');
  if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/u.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function invalidRows(kind: 'Work' | 'Invoice', failures: { row: number; issues: string[] }[]): never {
  const details = failures.map(({ row, issues }) => `row ${row}: ${issues.join('; ')}`).join('. ');
  throw new Error(`${kind} CSV ${details}. Fix ${failures.length === 1 ? 'that row' : 'those rows'} and import again.`);
}

export function mapWork(csv: ParsedCsv, mapping: Mapping): WorkItem[] {
  const failures: { row: number; issues: string[] }[] = [];
  const work = csv.rows.map((row, index) => {
    const date = safe(row, mapping, 'date');
    const client = safe(row, mapping, 'client');
    const project = safe(row, mapping, 'project');
    const description = safe(row, mapping, 'description');
    const missing = [
      ['date', date], ['client', client], ['project', project], ['description', description]
    ].filter(([, value]) => !value.trim()).map(([field]) => field);
    const issues: string[] = [];
    if (missing.length) issues.push(`${readableList(missing)} ${missing.length === 1 ? 'is' : 'are'} required`);

    const amountText = safe(row, mapping, 'amount');
    const hoursText = safe(row, mapping, 'hours');
    const rateText = safe(row, mapping, 'rate');
    let amount = 0;
    if (amountText.trim()) {
      const parsedAmount = numeric(amountText);
      if (parsedAmount === null) issues.push('amount must be a number');
      else amount = parsedAmount;
    } else if (hoursText.trim() || rateText.trim()) {
      const hours = hoursText.trim() ? numeric(hoursText) : null;
      const rate = rateText.trim() ? numeric(rateText) : null;
      if (hours === null || rate === null) issues.push('hours and rate must both be numbers when amount is blank');
      else amount = hours * rate;
    }
    if (issues.length) failures.push({ row: index + 2, issues });
    return {
      id: idFor([date, client, project, description], index), date, client, project, description,
      status: safe(row, mapping, 'status') || 'completed', amount,
      billed: truthy(safe(row, mapping, 'billed'))
    };
  });
  if (failures.length) invalidRows('Work', failures);
  return work;
}

export function mapInvoices(csv: ParsedCsv, mapping: Mapping): Invoice[] {
  const failures: { row: number; issues: string[] }[] = [];
  const invoices = csv.rows.map((row, index) => {
    const date = safe(row, mapping, 'date');
    const number = safe(row, mapping, 'number');
    const client = safe(row, mapping, 'client');
    const project = safe(row, mapping, 'project');
    const missing = [['invoice date', date], ['invoice number', number], ['client', client]]
      .filter(([, value]) => !value.trim()).map(([field]) => field);
    if (missing.length) failures.push({
      row: index + 2,
      issues: [`${readableList(missing)} ${missing.length === 1 ? 'is' : 'are'} required`]
    });
    return { id: idFor([date, number, client, project], index), date, number, client, project, status: safe(row, mapping, 'status') || 'issued' };
  });
  if (failures.length) invalidRows('Invoice', failures);
  return invoices;
}

export function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map((value) => /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value).join(',')).join('\n');
}
