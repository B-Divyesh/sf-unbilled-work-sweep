import type { Invoice, SweepState, WorkItem } from './types';
import { parseCalendarDate } from './dates';

export const emptyState = (): SweepState => ({ work: [], invoices: [], decisions: {}, checked: {}, currency: 'USD', importedAt: null });

export const sampleState = (): SweepState => ({
  work: [
    { id: 'w-bright-1', date: '2026-08-18', client: 'Brightside Studio', project: 'Website launch', description: 'Final responsive page build', status: 'completed', amount: 2200, billed: false },
    { id: 'w-north-1', date: '2026-08-20', client: 'North Star Foods', project: 'Brand sprint', description: 'Packaging direction and review', status: 'done', amount: 1800, billed: false },
    { id: 'w-morrow-1', date: '2026-08-21', client: 'Morrow & Co', project: 'August retainer', description: 'Campaign reporting and edits', status: 'closed', amount: 1200, billed: false },
    { id: 'w-north-2', date: '2026-08-23', client: 'North Star Foods', project: 'Customer research', description: 'Interview synthesis', status: 'completed', amount: 640, billed: false },
    { id: 'w-atelier-1', date: '2026-08-19', client: 'Atelier Lune', project: 'Autumn catalogue', description: 'Layout production', status: 'completed', amount: 950, billed: true },
    { id: 'w-morrow-2', date: '2026-08-27', client: 'Morrow & Co', project: 'September retainer', description: 'Planning call', status: 'in progress', amount: 300, billed: false }
  ],
  invoices: [
    { id: 'i-bright-1', date: '2026-08-25', number: 'INV-1042', client: 'Brightside Studios', project: 'Website launch', status: 'sent' },
    { id: 'i-morrow-1', date: '2026-08-24', number: 'INV-1043', client: 'Morrow and Co', project: 'August retainer', status: 'draft' }
  ],
  decisions: {}, checked: {}, currency: 'USD', importedAt: '2026-08-28T09:00:00.000Z'
});

const clean = (value: string) => value.toLowerCase().replace(/&/g, 'and').replace(/\b(ltd|limited|llc|inc|studio|studios|company)\b/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

function similarity(a: string, b: string): number {
  const left = clean(a);
  const right = clean(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  const aa = new Set(left.split(' '));
  const bb = new Set(right.split(' '));
  const common = [...aa].filter((token) => bb.has(token)).length;
  return common / new Set([...aa, ...bb]).size;
}

export function isCompleted(work: WorkItem): boolean {
  return /^(complete|completed|done|closed|finished)$/i.test(work.status.trim());
}

export function suggestions(work: WorkItem, invoices: Invoice[]): { invoice: Invoice; score: number }[] {
  return invoices.map((invoice) => {
    const clientScore = similarity(work.client, invoice.client);
    const projectScore = !invoice.project ? 0.7 : similarity(work.project, invoice.project);
    const workDate = parseCalendarDate(work.date);
    const invoiceDate = parseCalendarDate(invoice.date);
    const dateOk = workDate !== null && invoiceDate !== null && invoiceDate >= workDate;
    // A shared client alone is not enough when both exports name different
    // projects. Keeping those rows out of the suggestion list avoids turning
    // a broad client match into a misleading invoice recommendation.
    const projectsAgree = !work.project || !invoice.project || projectScore >= 0.55;
    return { invoice, score: dateOk && projectsAgree ? clientScore * 0.65 + projectScore * 0.35 : 0 };
  }).filter(({ score }) => score >= 0.55).sort((a, b) => b.score - a.score);
}

export function queueFor(state: SweepState): WorkItem[] {
  return state.work.filter((work) => isCompleted(work) && !work.billed && state.decisions[work.id]?.kind !== 'linked');
}
