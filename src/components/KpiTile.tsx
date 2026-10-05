import { useEffect, useRef } from 'react'
import { animate, motion, useReducedMotion } from 'framer-motion'
import type { Kpi } from '../lib/data'
import { formatKpi } from '../lib/format'
import { ease, rise } from '../lib/motion'
import { Icon } from './Icon'

function AnimatedValue({ value, format }: { value: number; format: Kpi['format'] }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (!node || reduce) return
    const controls = animate(value * 0.6, value, {
      duration: 1.2,
      ease,
      onUpdate: (v) => {
        node.textContent = formatKpi(v, format)
      },
    })
    return () => controls.stop()
  }, [value, format, reduce])

  return <span ref={ref}>{formatKpi(value, format)}</span>
}

function Sparkline({ data }: { data: number[] }) {
  const w = 96
  const h = 32
  const pad = 4
  const min = Math.min(...data)
  const max = Math.max(...data)
  const x = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2)
  const y = (v: number) => h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2)
  const d = data.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')
  const last = data.length - 1

  return (
    <svg className="sparkline" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <motion.path
        d={d}
        fill="none"
        stroke="var(--spark)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease, delay: 0.2 }}
      />
      <motion.circle
        cx={x(last)}
        cy={y(data[last])}
        r={4}
        fill="var(--series-1)"
        stroke="var(--surface)"
        strokeWidth={2}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.1, type: 'spring', stiffness: 500, damping: 20 }}
      />
    </svg>
  )
}

export function KpiTile({ kpi }: { kpi: Kpi }) {
  const up = kpi.delta >= 0
  const good = up === kpi.upIsGood
  return (
    <motion.article
      className="card kpi"
      variants={rise}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      <h3 className="kpi-label">{kpi.label}</h3>
      <div className="kpi-row">
        <p className="kpi-value">
          <AnimatedValue value={kpi.value} format={kpi.format} />
        </p>
        <Sparkline data={kpi.trend} />
      </div>
      <p className={`delta ${good ? 'is-good' : 'is-bad'}`}>
        <Icon name={up ? 'arrowUp' : 'arrowDown'} size={14} />
        <span>
          {up ? '+' : '−'}
          {Math.abs(kpi.delta).toFixed(1)}%
        </span>
        <span className="delta-period">{kpi.period}</span>
      </p>
    </motion.article>
  )
}
