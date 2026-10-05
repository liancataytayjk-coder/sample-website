import { useEffect, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LEAD_SLA_MIN,
  type Lead,
  type LeadSource,
  type LeadStage,
  leadSources,
  leadStages,
  uid,
} from '../lib/data'
import { elapsed } from '../lib/format'
import { spring } from '../lib/motion'
import { Icon } from './Icon'

type Setter = Dispatch<SetStateAction<Lead[]>>

function useNow(ms = 30_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(id)
  }, [ms])
  return now
}

function Timer({ lead, now }: { lead: Lead; now: number }) {
  if (lead.lastContactAt == null) {
    const late = now - lead.receivedAt > LEAD_SLA_MIN * 60_000
    return (
      <span className={`timer ${late ? 'is-late' : 'is-fresh'}`}>
        <Icon name="clock" size={12} />
        {late ? `No reply · ${elapsed(lead.receivedAt, now)}` : `New · ${elapsed(lead.receivedAt, now)}`}
      </span>
    )
  }
  return <span className="timer">Last contact {elapsed(lead.lastContactAt, now)} ago</span>
}

function leadActions(setLeads: Setter) {
  const logContact = (id: string) =>
    setLeads((ls) =>
      ls.map((l) =>
        l.id === id
          ? { ...l, lastContactAt: Date.now(), stage: l.stage === 'New' ? 'Contacted' : l.stage }
          : l,
      ),
    )
  const setStage = (id: string, stage: LeadStage) =>
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, stage } : l)))
  return { logContact, setStage }
}

export function Leads({ leads, setLeads }: { leads: Lead[]; setLeads: Setter }) {
  const now = useNow()
  const [filter, setFilter] = useState<LeadStage | 'All'>('All')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [source, setSource] = useState<LeadSource>('Zillow')
  const [intent, setIntent] = useState<Lead['intent']>('Buyer')
  const { logContact, setStage } = leadActions(setLeads)

  const shown = [...leads]
    .filter((l) => filter === 'All' || l.stage === filter)
    .sort((a, b) => Number(a.lastContactAt != null) - Number(b.lastContactAt != null) || a.receivedAt - b.receivedAt)
  const waiting = leads.filter((l) => l.lastContactAt == null).length

  function add(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLeads((ls) => [
      {
        id: uid(), name: name.trim(), phone: phone.trim(), source, intent,
        budget: '—', area: '—', stage: 'New', receivedAt: Date.now(), lastContactAt: null,
      },
      ...ls,
    ])
    setName('')
    setPhone('')
  }

  return (
    <section className="card" aria-labelledby="leads-title">
      <header className="card-head">
        <div>
          <h2 id="leads-title">Lead follow-up</h2>
          <p className="muted">
            {waiting} waiting for a first reply · goal: respond within {LEAD_SLA_MIN} min
          </p>
        </div>
      </header>

      <form className="todo-form" onSubmit={add}>
        <input id="lead-name" className="input grow" placeholder="Lead name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Lead name" />
        <input id="lead-phone" className="input" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} aria-label="Phone" />
        <select id="lead-source" className="input" value={source} onChange={(e) => setSource(e.target.value as LeadSource)} aria-label="Source">
          {leadSources.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select id="lead-intent" className="input" value={intent} onChange={(e) => setIntent(e.target.value as Lead['intent'])} aria-label="Buyer or seller">
          <option>Buyer</option>
          <option>Seller</option>
        </select>
        <motion.button className="btn primary" type="submit" whileTap={{ scale: 0.95 }} disabled={!name.trim()}>
          <Icon name="plus" size={16} /> Add lead
        </motion.button>
      </form>

      <div className="chips" role="tablist" aria-label="Filter by stage">
        {(['All', ...leadStages] as const).map((s) => (
          <button key={s} role="tab" aria-selected={filter === s} className="chip" onClick={() => setFilter(s)}>
            {filter === s && <motion.span layoutId="lead-chip" className="chip-pill" transition={spring} />}
            <span>{s}</span>
            <span className="chip-count">{s === 'All' ? leads.length : leads.filter((l) => l.stage === s).length}</span>
          </button>
        ))}
      </div>

      <ul className="leads">
        <AnimatePresence initial={false}>
          {shown.map((l) => (
            <motion.li
              key={l.id}
              layout
              className="lead"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={spring}
            >
              <span className="avatar" aria-hidden="true">
                {l.name.split(' ').map((w) => w[0]).filter((c) => /[A-Z]/.test(c)).slice(0, 2).join('')}
              </span>
              <div className="lead-main">
                <div className="lead-name">
                  <strong>{l.name}</strong>
                  <span className="tag">{l.intent}</span>
                  <span className="tag">{l.source}</span>
                </div>
                <span className="muted small">
                  {l.budget} · {l.area} · <span className="phone">{l.phone || 'No phone'}</span>
                </span>
                <Timer lead={l} now={now} />
              </div>
              <div className="lead-actions">
                <select
                  id={`stage-${l.id}`}
                  className="input compact-input"
                  value={l.stage}
                  onChange={(e) => setStage(l.id, e.target.value as LeadStage)}
                  aria-label={`Stage for ${l.name}`}
                >
                  {leadStages.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <motion.button className="btn" onClick={() => logContact(l.id)} whileTap={{ scale: 0.95 }}>
                  <Icon name="phone" size={14} /> Log call
                </motion.button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {shown.length === 0 && <p className="empty">No leads in this stage.</p>}
    </section>
  )
}

/** Overview card: leads that have not heard back yet, oldest first. */
export function SpeedToLead({ leads, setLeads, onSeeAll }: { leads: Lead[]; setLeads: Setter; onSeeAll: () => void }) {
  const now = useNow()
  const { logContact } = leadActions(setLeads)
  const waiting = leads.filter((l) => l.lastContactAt == null).sort((a, b) => a.receivedAt - b.receivedAt)

  return (
    <section className="card" aria-labelledby="stl-title">
      <header className="card-head">
        <div>
          <h2 id="stl-title">Speed to lead</h2>
          <p className="muted">Reply within {LEAD_SLA_MIN} min</p>
        </div>
        <button className="link-btn" onClick={onSeeAll}>
          All leads
        </button>
      </header>
      <ul className="events">
        <AnimatePresence initial={false}>
          {waiting.map((l) => (
            <motion.li
              key={l.id}
              layout
              className="event"
              exit={{ opacity: 0, x: 24 }}
              transition={spring}
            >
              <div className="event-body">
                <strong>{l.name}</strong>
                <span className="muted small">
                  {l.intent} · {l.source} · <span className="phone">{l.phone}</span>
                </span>
                <Timer lead={l} now={now} />
              </div>
              <motion.button className="btn small-btn" onClick={() => logContact(l.id)} whileTap={{ scale: 0.95 }}>
                <Icon name="phone" size={14} /> Log call
              </motion.button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {waiting.length === 0 && <p className="empty">Every lead has a reply. Nice work.</p>}
    </section>
  )
}
