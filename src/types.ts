export type WorkItem = {
  id: string;
  date: string;
  client: string;
  project: string;
  description: string;
  status: string;
  amount: number;
  billed: boolean;
};

export type Invoice = {
  id: string;
  date: string;
  number: string;
  client: string;
  project: string;
  status: string;
};

export type Decision = { kind: 'linked'; invoiceId: string } | { kind: 'keep' };

export type SweepState = {
  work: WorkItem[];
  invoices: Invoice[];
  decisions: Record<string, Decision>;
  checked: Record<string, boolean>;
  currency: string;
  importedAt: string | null;
};

export type ParsedCsv = { headers: string[]; rows: Record<string, string>[]; filename: string };
export type ImportKind = 'work' | 'invoices';
export type Mapping = Record<string, string>;
