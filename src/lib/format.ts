import type { Kpi } from './data'

const compact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})
const whole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

export function formatKpi(value: number, format: Kpi['format']): string {
  switch (format) {
    case 'currency':
      return `$${compact.format(value)}`
    case 'minutes':
      return `${Math.round(value)} min`
    default:
      return value >= 10_000 ? compact.format(value) : whole.format(Math.round(value))
  }
}

export const formatInt = (n: number) => whole.format(n)

export const formatPrice = (n: number) => `$${whole.format(n)}`

export const formatPriceShort = (n: number) => `$${compact.format(n)}`

/** "9 min", "3 h", "2 d" since the given epoch ms. */
export function elapsed(since: number, now = Date.now()): string {
  const m = Math.max(0, Math.round((now - since) / 60_000))
  if (m < 60) return `${m} min`
  const h = Math.round(m / 60)
  if (h < 48) return `${h} h`
  return `${Math.round(h / 24)} d`
}
