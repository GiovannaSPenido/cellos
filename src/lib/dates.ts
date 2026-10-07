/**
 * Helpers for Postgres `date` columns, which carry no time or zone.
 *
 * `new Date('2026-06-01')` parses as UTC midnight, which renders as the
 * previous day anywhere west of Greenwich. These convert through the local
 * calendar instead, so a stored date reads back as the same day.
 */

export function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) {
    return null
  }
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) {
    return null
  }
  return new Date(year, month - 1, day)
}

export function formatDateOnly(date: Date | null | undefined): string | null {
  if (!date) {
    return null
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** For `timestamptz` columns, which do carry a zone. */
export function parseTimestamp(value: string | null | undefined): Date | null {
  if (!value) {
    return null
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}
