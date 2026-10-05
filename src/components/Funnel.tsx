import { motion } from 'framer-motion'
import { formatInt } from '../lib/format'
import { ease } from '../lib/motion'

interface Stage {
  stage: string
  value: number
}

export function Funnel({ data }: { data: Stage[] }) {
  const max = data[0]?.value ?? 1
  const overall = ((data[data.length - 1].value / max) * 100).toFixed(1)
  return (
    <section className="card" aria-labelledby="funnel-title">
      <header className="card-head">
        <div>
          <h2 id="funnel-title">Deal pipeline</h2>
          <p className="muted">Last 90 days · {overall}% lead-to-close</p>
        </div>
      </header>
      <ol className="funnel">
        {data.map((s, i) => {
          const pct = (s.value / max) * 100
          const conv = i ? Math.round((s.value / data[i - 1].value) * 100) : null
          return (
            <li key={s.stage}>
              <div className="funnel-top">
                <span>{s.stage}</span>
                <span className="funnel-nums">
                  {conv != null && <span className="muted">{conv}% ·</span>}
                  <strong>{formatInt(s.value)}</strong>
                </span>
              </div>
              <div className="funnel-track">
                <motion.div
                  className="funnel-bar"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(pct, 1.5)}%` }}
                  transition={{ duration: 0.9, ease, delay: 0.2 + i * 0.08 }}
                />
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
