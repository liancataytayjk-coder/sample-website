import { useState, type Dispatch, type SetStateAction } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Update, UpdateCategory } from '../lib/data'
import { rise, spring, stagger } from '../lib/motion'
import { Icon } from './Icon'

const categories: (UpdateCategory | 'All')[] = ['All', 'Agent note', 'Lead', 'Listing', 'Transaction']

function ago(h: number) {
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

interface Props {
  updates: Update[]
  setUpdates: Dispatch<SetStateAction<Update[]>>
  compact?: boolean
  onSeeAll?: () => void
}

export function UpdatesFeed({ updates, setUpdates, compact = false, onSeeAll }: Props) {
  const [cat, setCat] = useState<UpdateCategory | 'All'>('All')
  const unread = updates.filter((u) => !u.read).length
  const list = compact
    ? updates.slice(0, 3)
    : updates.filter((u) => cat === 'All' || u.category === cat)

  const markRead = (id: string) =>
    setUpdates((us) => us.map((u) => (u.id === id ? { ...u, read: true } : u)))
  const markAll = () => setUpdates((us) => us.map((u) => ({ ...u, read: true })))

  return (
    <section className="card" aria-labelledby={compact ? 'upd-title-c' : 'upd-title'}>
      <header className="card-head">
        <div>
          <h2 id={compact ? 'upd-title-c' : 'upd-title'}>{compact ? 'Latest activity' : 'Activity & notes'}</h2>
          <p className="muted">{unread} unread</p>
        </div>
        {compact ? (
          <button className="link-btn" onClick={onSeeAll}>
            See all
          </button>
        ) : (
          <motion.button className="btn" onClick={markAll} disabled={unread === 0} whileTap={{ scale: 0.96 }}>
            <Icon name="checkAll" size={16} /> Mark all read
          </motion.button>
        )}
      </header>

      {!compact && (
        <div className="chips" role="tablist" aria-label="Filter by category">
          {categories.map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} className="chip" onClick={() => setCat(c)}>
              {cat === c && <motion.span layoutId="upd-chip" className="chip-pill" transition={spring} />}
              <span>{c}</span>
            </button>
          ))}
        </div>
      )}

      <motion.ul className="updates" variants={stagger} initial="hidden" animate="show" key={cat}>
        <AnimatePresence initial={false}>
          {list.map((u) => (
            <motion.li
              key={u.id}
              layout
              variants={rise}
              className={`update ${u.read ? '' : 'is-unread'}`}
              onClick={() => markRead(u.id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && markRead(u.id)}
              tabIndex={0}
            >
              <span className="avatar" aria-hidden="true">
                {u.initials}
              </span>
              <div className="update-body">
                <div className="update-meta">
                  <strong>{u.author}</strong>
                  <span className="muted small">
                    {u.role} · {ago(u.hoursAgo)}
                  </span>
                  <span className="tag">{u.category}</span>
                </div>
                <h3>{u.title}</h3>
                {!compact && <p>{u.body}</p>}
              </div>
              <AnimatePresence>
                {!u.read && (
                  <motion.span
                    className="unread-dot"
                    aria-label="Unread"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  />
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </section>
  )
}
