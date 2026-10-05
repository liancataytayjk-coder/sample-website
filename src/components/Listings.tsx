import { useState, type Dispatch, type SetStateAction } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { type Listing, type ListingStatus, listingStatuses, uid } from '../lib/data'
import { addDays, dateKey, fmtShort, fromKey, relativeDay } from '../lib/dates'
import { formatInt, formatPrice, formatPriceShort } from '../lib/format'
import { ease, rise, spring, stagger } from '../lib/motion'
import { Icon } from './Icon'

type Setter = Dispatch<SetStateAction<Listing[]>>

const statusClass: Record<ListingStatus, string> = {
  'Coming soon': 'st-soon',
  Active: 'st-active',
  Pending: 'st-pending',
  Closed: 'st-closed',
}

function daysBetween(a: string, b: string) {
  return Math.round((fromKey(b).getTime() - fromKey(a).getTime()) / 86_400_000)
}

/** Standard contract-to-close timeline, used when a listing goes under contract. */
function defaultMilestones() {
  const t = new Date()
  const rows: [string, number][] = [
    ['Earnest money delivered', 3],
    ['Inspection', 7],
    ['Option period ends', 10],
    ['Appraisal', 14],
    ['Financing approval', 21],
    ['Final walkthrough', 29],
    ['Closing', 30],
  ]
  return rows.map(([label, n]) => ({ id: uid(), label, date: dateKey(addDays(t, n)), done: false }))
}

function StatusPill({ status }: { status: ListingStatus }) {
  return (
    <span className={`status ${statusClass[status]}`}>
      <i aria-hidden="true" />
      {status}
    </span>
  )
}

function ListingCard({ l, setListings }: { l: Listing; setListings: Setter }) {
  const today = dateKey(new Date())
  const doneCount = l.milestones.filter((m) => m.done).length
  const next = l.milestones.find((m) => !m.done)
  const dom = Math.max(0, daysBetween(l.listedOn, today))

  const update = (patch: Partial<Listing>) =>
    setListings((ls) => ls.map((x) => (x.id === l.id ? { ...x, ...patch } : x)))

  function setStatus(status: ListingStatus) {
    update({
      status,
      milestones: status === 'Pending' && l.milestones.length === 0 ? defaultMilestones() : l.milestones,
    })
  }

  const toggleMilestone = (id: string) =>
    update({ milestones: l.milestones.map((m) => (m.id === id ? { ...m, done: !m.done } : m)) })

  return (
    <motion.article className="card listing" layout variants={rise} transition={spring}>
      <div className="listing-head">
        <StatusPill status={l.status} />
        <select
          id={`status-${l.id}`}
          className="status-select"
          value={l.status}
          onChange={(e) => setStatus(e.target.value as ListingStatus)}
          aria-label={`Change status for ${l.address}`}
        >
          {listingStatuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="listing-address">{l.address}</h3>
        <p className="muted small">
          {l.city} · {l.side === 'Seller' ? 'Listing side' : 'Buyer side'} · {l.client}
        </p>
      </div>

      <div className="listing-figures">
        <strong className="listing-price">{formatPrice(l.price)}</strong>
        <span className="muted small">
          {l.beds} bd · {l.baths} ba · {formatInt(l.sqft)} sq ft
        </span>
      </div>

      {l.status === 'Active' && (
        <dl className="listing-stats">
          <div>
            <dt>Days on market</dt>
            <dd>{dom}</dd>
          </div>
          <div>
            <dt>Showings</dt>
            <dd>{l.showings}</dd>
          </div>
          <div>
            <dt>Price / sq ft</dt>
            <dd>${Math.round(l.price / l.sqft)}</dd>
          </div>
        </dl>
      )}

      {l.status === 'Coming soon' && (
        <p className="listing-note">
          <Icon name="calendar" size={14} /> Goes live {relativeDay(l.listedOn)}
        </p>
      )}

      {l.status === 'Pending' && l.milestones.length > 0 && (
        <div className="milestones">
          <div className="milestones-top">
            <span className="eyebrow">Contract to close</span>
            <span className="small muted">
              {doneCount}/{l.milestones.length}
            </span>
          </div>
          <div className="meter">
            <motion.div
              className="meter-fill"
              initial={false}
              animate={{ width: `${(doneCount / l.milestones.length) * 100}%` }}
              transition={{ duration: 0.6, ease }}
            />
          </div>
          <ul>
            {l.milestones.map((m) => {
              const isNext = m === next
              const late = !m.done && m.date < today
              return (
                <li key={m.id} className={`milestone ${m.done ? 'is-done' : ''} ${isNext ? 'is-next' : ''}`}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={m.done}
                    className="ms-check"
                    onClick={() => toggleMilestone(m.id)}
                    aria-label={`${m.label} ${m.done ? 'done' : 'not done'}`}
                  >
                    <AnimatePresence>
                      {m.done && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="ms-dot" />
                      )}
                    </AnimatePresence>
                  </button>
                  <span className="ms-label">{m.label}</span>
                  <span className={`ms-date ${late ? 'overdue' : ''}`}>
                    {m.done ? fmtShort.format(fromKey(m.date)) : relativeDay(m.date)}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {l.status === 'Closed' && (
        <p className="listing-note">
          <Icon name="checkAll" size={14} /> Closed · file archived
        </p>
      )}
    </motion.article>
  )
}

export function Listings({ listings, setListings }: { listings: Listing[]; setListings: Setter }) {
  const [filter, setFilter] = useState<ListingStatus | 'All'>('All')
  const shown = listings.filter((l) => filter === 'All' || l.status === filter)
  const pendingVolume = listings.filter((l) => l.status === 'Pending').reduce((s, l) => s + l.price, 0)
  const activeVolume = listings.filter((l) => l.status === 'Active').reduce((s, l) => s + l.price, 0)

  return (
    <div className="stack">
      <section className="card">
        <header className="card-head no-gap">
          <div>
            <h2>Listings &amp; deals</h2>
            <p className="muted">
              {formatPriceShort(activeVolume)} active · {formatPriceShort(pendingVolume)} under contract
            </p>
          </div>
        </header>
        <div className="chips" role="tablist" aria-label="Filter by status">
          {(['All', ...listingStatuses] as const).map((s) => (
            <button key={s} role="tab" aria-selected={filter === s} className="chip" onClick={() => setFilter(s)}>
              {filter === s && <motion.span layoutId="listing-chip" className="chip-pill" transition={spring} />}
              <span>{s}</span>
              <span className="chip-count">
                {s === 'All' ? listings.length : listings.filter((l) => l.status === s).length}
              </span>
            </button>
          ))}
        </div>
      </section>

      <motion.div className="listing-grid" variants={stagger} initial="hidden" animate="show" key={filter}>
        <AnimatePresence mode="popLayout">
          {shown.map((l) => (
            <ListingCard key={l.id} l={l} setListings={setListings} />
          ))}
        </AnimatePresence>
      </motion.div>
      {shown.length === 0 && <p className="empty">No listings with this status.</p>}
    </div>
  )
}

/** Overview card: the next open contract milestones across every pending deal. */
export function Deadlines({ listings, setListings, onSeeAll }: { listings: Listing[]; setListings: Setter; onSeeAll: () => void }) {
  const today = dateKey(new Date())
  const rows = listings
    .filter((l) => l.status === 'Pending')
    .flatMap((l) => l.milestones.filter((m) => !m.done).map((m) => ({ l, m })))
    .sort((a, b) => a.m.date.localeCompare(b.m.date))
    .slice(0, 5)

  const complete = (lid: string, mid: string) =>
    setListings((ls) =>
      ls.map((l) =>
        l.id === lid ? { ...l, milestones: l.milestones.map((m) => (m.id === mid ? { ...m, done: true } : m)) } : l,
      ),
    )

  return (
    <section className="card" aria-labelledby="dl-title">
      <header className="card-head">
        <div>
          <h2 id="dl-title">Contract deadlines</h2>
          <p className="muted">Next steps on deals under contract</p>
        </div>
        <button className="link-btn" onClick={onSeeAll}>
          Pipeline
        </button>
      </header>
      <ul className="deadlines">
        <AnimatePresence initial={false}>
          {rows.map(({ l, m }) => (
            <motion.li
              key={m.id}
              layout
              className="deadline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: 24 }}
              transition={spring}
            >
              <div className="deadline-date">
                <strong className={m.date < today ? 'overdue' : ''}>{relativeDay(m.date)}</strong>
              </div>
              <div className="event-body">
                <strong>{m.label}</strong>
                <span className="muted small">{l.address}</span>
              </div>
              <button className="btn small-btn" onClick={() => complete(l.id, m.id)}>
                Done
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {rows.length === 0 && <p className="empty">No open contract deadlines.</p>}
    </section>
  )
}
