/**
 * Parse the two calendar formats accepted by CSV imports without relying on
 * Date.parse, whose handling of locale-formatted dates differs by browser.
 */
export function parseCalendarDate(value: string): number | null {
  const text = value.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(text);
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/u.exec(text);
  if (!iso && !us) return null;

  const year = Number(iso?.[1] ?? us?.[3]);
  const month = Number(iso?.[2] ?? us?.[1]);
  const day = Number(iso?.[3] ?? us?.[2]);
  if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31) return null;

  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day
    ? timestamp
    : null;
}
