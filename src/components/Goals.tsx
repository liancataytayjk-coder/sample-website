import { motion } from 'framer-motion'
import type { Goal } from '../lib/data'
import { ease } from '../lib/motion'

function fmt(goal: Goal, v: number) {
  if (goal.unit === 'M') return `$${v.toFixed(2)}M`
  return `${v}${goal.unit}`
}

export function Goals({ goals }: { goals: Goal[] }) {
  return (
    <section className="card" aria-labelledby="goals-title">
      <header className="card-head">
        <div>
          <h2 id="goals-title">Quarter goals</h2>
          <p className="muted">Progress toward Q4 targets</p>
        </div>
      </header>
      <ul className="goals">
        {goals.map((g, i) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100))
          return (
            <li key={g.id}>
              <div className="goal-top">
                <span>{g.label}</span>
                <strong>{pct}%</strong>
              </div>
              <div
                className="meter"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                aria-label={g.label}
              >
                <motion.div
                  className="meter-fill"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease, delay: 0.15 + i * 0.1 }}
                />
              </div>
              <p className="muted small">
                {fmt(g, g.current)} of {fmt(g, g.target)}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
