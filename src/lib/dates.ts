/** Local-time YYYY-MM-DD key (avoids the UTC shift of toISOString). */
export function dateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(d: Date, n: number): Date {
  const next = new Date(d)
  next.setDate(next.getDate() + n)
  return next
}

export function isSameDay(a: Date, b: Date): boolean {
  return dateKey(a) === dateKey(b)
}

export const fmtLong = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
})

export const fmtMonth = new Intl.DateTimeFormat(undefined, {
  month: 'long',
  year: 'numeric',
})

export const fmtShort = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
})

export function relativeDay(key: string, today = new Date()): string {
  const diff = Math.round(
    (fromKey(key).getTime() - fromKey(dateKey(today)).getTime()) / 86_400_000,
  )
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff < 0) return `${-diff}d overdue`
  return fmtShort.format(fromKey(key))
}

/** 6x7 grid of dates covering the month, weeks starting Monday. */
export function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7
  const start = addDays(first, -offset)
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}
