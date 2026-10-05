import { useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { type CalEvent, type EventKind, uid } from '../lib/data'
import { dateKey, fmtLong, fmtMonth, fromKey, monthGrid, relativeDay } from '../lib/dates'
import { ease, spring } from '../lib/motion'
import { Icon } from './Icon'

const kindLabel: Record<EventKind, string> = {
  showing: 'Showing',
  openhouse: 'Open house',
  closing: 'Closing',
  deadline: 'Inspection / appraisal',
  call: 'Client call',
}
const kinds = Object.keys(kindLabel) as EventKind[]
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const byTime = (a: CalEvent, b: CalEvent) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)

interface Props {
  events: CalEvent[]
  setEvents: Dispatch<SetStateAction<CalEvent[]>>
}

export function CalendarView({ events, setEvents }: Props) {
  const now = new Date()
  const todayKey = dateKey(now)
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() })
  const [dir, setDir] = useState(0)
  const [selected, setSelected] = useState(todayKey)
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('10:00')
  const [location, setLocation] = useState('')
  const [kind, setKind] = useState<EventKind>('showing')

  const days = monthGrid(cursor.y, cursor.m)
  const byDay = new Map<string, CalEvent[]>()
  for (const e of [...events].sort(byTime)) {
    byDay.set(e.date, [...(byDay.get(e.date) ?? []), e])
  }
  const dayEvents = byDay.get(selected) ?? []

  function shift(n: number) {
    setDir(n)
    setCursor(({ y, m }) => {
      const d = new Date(y, m + n, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  }

  function goToday() {
    setDir(0)
    setCursor({ y: now.getFullYear(), m: now.getMonth() })
    setSelected(todayKey)
  }

  function add(e: FormEvent) {
    e.preventDefault()
    const text = title.trim()
    if (!text) return
    setEvents((es) => [
      ...es,
      { id: uid(), title: text, date: selected, time, kind, location: location.trim() || undefined },
    ])
    setTitle('')
    setLocation('')
  }

  const remove = (id: string) => setEvents((es) => es.filter((e) => e.id !== id))

  return (
    <div className="calendar-layout">
      <section className="card" aria-labelledby="cal-title">
        <header className="card-head">
          <div>
            <h2 id="cal-title">{fmtMonth.format(new Date(cursor.y, cursor.m, 1))}</h2>
            <ul className="legend" aria-label="Event types">
              {kinds.map((k) => (
                <li key={k}>
                  <i className={`dot kind-${k}`} aria-hidden="true" />
                  {kindLabel[k]}
                </li>
              ))}
            </ul>
          </div>
          <div className="cal-nav">
            <button className="btn" onClick={goToday}>
              Today
            </button>
            <motion.button className="icon-btn" aria-label="Previous month" onClick={() => shift(-1)} whileTap={{ x: -3 }}>
              <Icon name="chevronLeft" />
            </motion.button>
            <motion.button className="icon-btn" aria-label="Next month" onClick={() => shift(1)} whileTap={{ x: 3 }}>
              <Icon name="chevronRight" />
            </motion.button>
          </div>
        </header>

        <div className="cal-weekdays" aria-hidden="true">
          {weekdays.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="cal-viewport">
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.div
              key={`${cursor.y}-${cursor.m}`}
              className="cal-grid"
              role="grid"
              custom={dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 40 }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: d * -40 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease }}
            >
              {days.map((d) => {
                const key = dateKey(d)
                const evs = byDay.get(key) ?? []
                const inMonth = d.getMonth() === cursor.m
                const isSel = key === selected
                return (
                  <button
                    key={key}
                    role="gridcell"
                    aria-selected={isSel}
                    aria-label={`${fmtLong.format(d)}, ${evs.length} event${evs.length === 1 ? '' : 's'}`}
                    className={`cal-day ${inMonth ? '' : 'is-out'} ${key === todayKey ? 'is-today' : ''}`}
                    onClick={() => setSelected(key)}
                  >
                    {isSel && <motion.span layoutId="cal-sel" className="cal-sel" transition={spring} />}
                    <span className="cal-num">{d.getDate()}</span>
                    <span className="cal-dots">
                      {evs.slice(0, 3).map((e) => (
                        <i key={e.id} className={`dot kind-${e.kind}`} />
                      ))}
                      {evs.length > 3 && <em>+{evs.length - 3}</em>}
                    </span>
                  </button>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section className="card" aria-labelledby="day-title">
        <header className="card-head">
          <div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.h2
                id="day-title"
                key={selected}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
              >
                {fmtLong.format(fromKey(selected))}
              </motion.h2>
            </AnimatePresence>
            <p className="muted">
              {dayEvents.length} event{dayEvents.length === 1 ? '' : 's'}
            </p>
          </div>
        </header>

        <ul className="events">
          <AnimatePresence initial={false} mode="popLayout">
            {dayEvents.map((e) => (
              <motion.li
                key={e.id}
                layout
                className="event"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={spring}
              >
                <i className={`event-bar kind-${e.kind}`} aria-hidden="true" />
                <div className="event-body">
                  <strong>{e.title}</strong>
                  <span className="muted small">
                    {e.time} · {kindLabel[e.kind]}
                  </span>
                  {e.location && (
                    <span className="event-loc">
                      <Icon name="pin" size={12} /> {e.location}
                    </span>
                  )}
                </div>
                <button className="icon-btn ghost" aria-label={`Delete ${e.title}`} onClick={() => remove(e.id)}>
                  <Icon name="x" size={16} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {dayEvents.length === 0 && <p className="empty">Nothing scheduled.</p>}

        <form className="event-form" onSubmit={add}>
          <input id="event-title" className="input" placeholder="e.g. Showing — Kim family" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Event title" />
          <input id="event-location" className="input" placeholder="Property address or place (optional)" value={location} onChange={(e) => setLocation(e.target.value)} aria-label="Location" />
          <div className="row">
            <input id="event-time" className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Time" />
            <select id="event-kind" className="input grow" value={kind} onChange={(e) => setKind(e.target.value as EventKind)} aria-label="Event type">
              {kinds.map((k) => (
                <option key={k} value={k}>
                  {kindLabel[k]}
                </option>
              ))}
            </select>
          </div>
          <motion.button className="btn primary" type="submit" whileTap={{ scale: 0.96 }} disabled={!title.trim()}>
            <Icon name="plus" size={16} /> Add event
          </motion.button>
        </form>
      </section>
    </div>
  )
}

export function Upcoming({ events, onSeeAll }: { events: CalEvent[]; onSeeAll: () => void }) {
  const today = dateKey(new Date())
  const next = events.filter((e) => e.date >= today).sort(byTime).slice(0, 5)
  return (
    <section className="card" aria-labelledby="up-title">
      <header className="card-head">
        <div>
          <h2 id="up-title">Schedule</h2>
          <p className="muted">Showings, calls and closings</p>
        </div>
        <button className="link-btn" onClick={onSeeAll}>
          Calendar
        </button>
      </header>
      <ul className="events">
        {next.map((e) => (
          <li key={e.id} className="event">
            <i className={`event-bar kind-${e.kind}`} aria-hidden="true" />
            <div className="event-body">
              <strong>{e.title}</strong>
              <span className="muted small">
                {relativeDay(e.date)} · {e.time} · {kindLabel[e.kind]}
              </span>
              {e.location && (
                <span className="event-loc">
                  <Icon name="pin" size={12} /> {e.location}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      {next.length === 0 && <p className="empty">Your calendar is clear.</p>}
    </section>
  )
}
