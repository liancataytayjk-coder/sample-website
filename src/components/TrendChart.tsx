import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { fmtShort } from '../lib/dates'
import { formatInt } from '../lib/format'
import { ease } from '../lib/motion'
import { Icon } from './Icon'

interface Point {
  week: Date
  value: number
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(node)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

/** Round tick step (1, 2, 5 × 10^k) giving about four intervals. */
function niceStep(max: number) {
  const rough = max / 4
  const pow = 10 ** Math.floor(Math.log10(rough))
  return ([1, 2, 5, 10].find((m) => m * pow >= rough) ?? 10) * pow
}

interface Props {
  data: Point[]
  title: string
  subtitle: string
  unit: string
}

export function TrendChart({ data, title, subtitle, unit }: Props) {
  const [wrapRef, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const [view, setView] = useState<'chart' | 'table'>('chart')

  const height = 240
  const m = { top: 16, right: 56, bottom: 28, left: 40 }
  const innerW = Math.max(0, width - m.left - m.right)
  const innerH = height - m.top - m.bottom
  const step = niceStep(Math.max(...data.map((d) => d.value)) * 1.1)
  const yMax = Math.ceil((Math.max(...data.map((d) => d.value)) * 1.1) / step) * step
  const ticks = Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step)

  const x = (i: number) => m.left + (i / (data.length - 1)) * innerW
  const y = (v: number) => m.top + innerH - (v / yMax) * innerH
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.value)}`).join('')
  const area = `${line}L${x(data.length - 1)},${y(0)}L${x(0)},${y(0)}Z`
  const last = data.length - 1
  const labelEvery = Math.max(1, Math.ceil(64 / (innerW / last || 1)))
  const total = data.reduce((s, d) => s + d.value, 0)

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const rel = (e.clientX - rect.left) / rect.width
    setHover(Math.max(0, Math.min(last, Math.round(rel * last))))
  }

  return (
    <section className="card chart-card" aria-labelledby="trend-title">
      <header className="card-head">
        <div>
          <h2 id="trend-title">{title}</h2>
          <p className="muted">
            {subtitle} · {formatInt(total)} total
          </p>
        </div>
        <div className="seg" role="tablist" aria-label="Display as">
          {(['chart', 'table'] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              className="seg-btn"
              onClick={() => setView(v)}
            >
              {view === v && <motion.span layoutId="trend-seg" className="seg-pill" />}
              <Icon name={v === 'chart' ? 'chart' : 'table'} size={14} />
              <span>{v === 'chart' ? 'Chart' : 'Table'}</span>
            </button>
          ))}
        </div>
      </header>

      <div ref={wrapRef}>
      <AnimatePresence mode="wait" initial={false}>
        {view === 'chart' ? (
          <motion.div
            key="chart"
            className="chart-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {width > 0 && (
              <svg width={width} height={height} role="img" aria-label={`Line chart: ${title}`}>
                {ticks.map((t) => (
                  <g key={t}>
                    <line
                      x1={m.left}
                      x2={m.left + innerW}
                      y1={y(t)}
                      y2={y(t)}
                      className={t === 0 ? 'axis-base' : 'gridline'}
                    />
                    <text x={m.left - 8} y={y(t)} className="tick" textAnchor="end" dominantBaseline="middle">
                      {formatInt(t)}
                    </text>
                  </g>
                ))}
                {data.map((d, i) =>
                  (last - i) % labelEvery === 0 ? (
                    <text key={i} x={x(i)} y={height - 8} className="tick" textAnchor="middle">
                      {fmtShort.format(d.week)}
                    </text>
                  ) : null,
                )}

                <motion.path
                  d={area}
                  fill="var(--series-1)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                />
                <motion.path
                  d={line}
                  fill="none"
                  stroke="var(--series-1)"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease }}
                />

                {/* Direct label on the endpoint only */}
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
                  <circle cx={x(last)} cy={y(data[last].value)} r={4.5} fill="var(--series-1)" stroke="var(--surface)" strokeWidth={2} />
                  <text x={x(last) + 10} y={y(data[last].value)} className="end-label" dominantBaseline="middle">
                    {formatInt(data[last].value)}
                  </text>
                </motion.g>

                {hover != null && (
                  <g pointerEvents="none">
                    <line x1={x(hover)} x2={x(hover)} y1={m.top} y2={m.top + innerH} className="crosshair" />
                    <motion.circle
                      cx={x(hover)}
                      cy={y(data[hover].value)}
                      r={5}
                      fill="var(--series-1)"
                      stroke="var(--surface)"
                      strokeWidth={2}
                      initial={{ scale: 0.4 }}
                      animate={{ scale: 1 }}
                    />
                  </g>
                )}

                <rect
                  x={m.left}
                  y={m.top}
                  width={innerW}
                  height={innerH}
                  fill="transparent"
                  onPointerMove={onMove}
                  onPointerLeave={() => setHover(null)}
                />
              </svg>
            )}

            <AnimatePresence>
              {hover != null && (
                <motion.div
                  className="tooltip"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    left: Math.min(Math.max(x(hover), 70), width - 70),
                    top: y(data[hover].value) - 12,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                >
                  <span className="muted">Week of {fmtShort.format(data[hover].week)}</span>
                  <strong>
                    {formatInt(data[hover].value)} {unit}
                  </strong>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="table"
            className="table-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">Week of</th>
                  <th scope="col" className="num">
                    {unit[0].toUpperCase() + unit.slice(1)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.week.toISOString()}>
                    <td>{fmtShort.format(d.week)}</td>
                    <td className="num">{formatInt(d.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </section>
  )
}
