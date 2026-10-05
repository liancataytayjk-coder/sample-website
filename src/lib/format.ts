import type { Kpi } from './data'

const compact = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 1,
})
const whole = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })

export function formatKpi(value: number, format: Kpi['format']): string {
  switch (format) {
    case 'currency':
      return `$${compact.format(value)}`
    case 'percent':
      return `${Math.round(value)}%`
    case 'hours':
      return `${value.toFixed(1)}h`
    default:
      return value >= 10_000 ? compact.format(value) : whole.format(value)
  }
}

export const formatInt = (n: number) => whole.format(n)
