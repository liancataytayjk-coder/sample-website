import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { CalendarView, Upcoming } from './components/CalendarView'
import { Funnel } from './components/Funnel'
import { Icon, type IconName } from './components/Icon'
import { KpiTile } from './components/KpiTile'
import { Leads, SpeedToLead } from './components/Leads'
import { Deadlines, Listings } from './components/Listings'
import { TodoList } from './components/TodoList'
import { TrendChart } from './components/TrendChart'
import { UpdatesFeed } from './components/UpdatesFeed'
import {
  funnel,
  kpis,
  seedEvents,
  seedLeads,
  seedListings,
  seedTodos,
  seedUpdates,
  weeklyLeads,
} from './lib/data'
import { dateKey, fmtLong } from './lib/dates'
import { page, rise, spring, stagger } from './lib/motion'
import { useStoredState } from './lib/useStoredState'

type View = 'overview' | 'tasks' | 'calendar' | 'pipeline' | 'leads' | 'activity'
type Theme = 'light' | 'dark'

const nav: { id: View; label: string; icon: IconName }[] = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'tasks', label: 'Tasks', icon: 'tasks' },
  { id: 'leads', label: 'Leads', icon: 'users' },
  { id: 'pipeline', label: 'Pipeline', icon: 'home' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'activity', label: 'Activity', icon: 'bell' },
]

const AGENT = { name: 'Jessica Moreno', team: 'Moreno Realty Group' }

function greeting(d = new Date()) {
  const h = d.getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem('pulse.theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // ignore
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function ThemeSwitch({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  return (
    <div className="theme-switch" role="radiogroup" aria-label="Color theme">
      {(['light', 'dark'] as const).map((t) => (
        <button
          key={t}
          role="radio"
          aria-checked={theme === t}
          className="theme-opt"
          onClick={() => setTheme(t)}
        >
          {theme === t && <motion.span layoutId="theme-pill" className="theme-pill" transition={spring} />}
          <Icon name={t === 'light' ? 'sun' : 'moon'} size={15} />
          <span>{t === 'light' ? 'Light' : 'Dark'}</span>
        </button>
      ))}
    </div>
  )
}

export default function App() {
  const [view, setView] = useStoredState<View>('pulse.v2.view', () => 'overview')
  const [todos, setTodos] = useStoredState('pulse.v2.todos', () => seedTodos())
  const [events, setEvents] = useStoredState('pulse.v2.events', () => seedEvents())
  const [updates, setUpdates] = useStoredState('pulse.v2.updates', () => seedUpdates())
  const [listings, setListings] = useStoredState('pulse.v2.listings', () => seedListings())
  const [leads, setLeads] = useStoredState('pulse.v2.leads', () => seedLeads())
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const leadTrend = useMemo(() => weeklyLeads(), [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('pulse.theme', theme)
    } catch {
      // ignore
    }
  }, [theme])

  const unread = updates.filter((u) => !u.read).length
  const openTasks = todos.filter((t) => !t.done).length
  const newLeads = leads.filter((l) => l.lastContactAt == null).length
  const badges: Partial<Record<View, number>> = { tasks: openTasks, leads: newLeads, activity: unread }
  const properties = listings.filter((l) => l.status !== 'Closed').map((l) => l.address)
  const title = nav.find((n) => n.id === view)?.label ?? ''

  return (
    <MotionConfig reducedMotion="user">
      <div className="shell">
        <div className="sidebar-rail">
        <aside className="sidebar">
          <div className="brand">
            <motion.span
              className="brand-mark"
              initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
              <Icon name="home" size={17} />
            </motion.span>
            <span className="brand-text">
              <span className="brand-name">Pulse</span>
              <span className="brand-sub">{AGENT.team}</span>
            </span>
          </div>

          <nav aria-label="Main">
            <ul className="nav">
              {nav.map((n) => (
                <li key={n.id}>
                  <button
                    className={`nav-item ${view === n.id ? 'is-active' : ''}`}
                    aria-current={view === n.id ? 'page' : undefined}
                    aria-label={badges[n.id] ? `${n.label}, ${badges[n.id]}` : n.label}
                    onClick={() => setView(n.id)}
                  >
                    {view === n.id && <motion.span layoutId="nav-pill" className="nav-pill" transition={spring} />}
                    <Icon name={n.icon} />
                    <span className="nav-label">{n.label}</span>
                    <AnimatePresence>
                      {!!badges[n.id] && (
                        <motion.span
                          key={badges[n.id]}
                          className={`badge ${n.id === 'leads' ? 'badge-alert' : ''}`}
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.4, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                        >
                          {badges[n.id]}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="agent-card">
            <span className="avatar">JM</span>
            <span>
              <span className="agent-label">Assisting</span>
              <strong>{AGENT.name}</strong>
            </span>
          </div>
        </aside>
        </div>

        <main className="main">
          <header className="topbar">
            <div className="topbar-text">
              <p className="eyebrow">{fmtLong.format(new Date())}</p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.h1
                  key={view}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {view === 'overview' ? greeting() : title}
                </motion.h1>
              </AnimatePresence>
              {view === 'overview' && (
                <motion.p className="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <strong>{newLeads}</strong> leads waiting on a reply · <strong>{openTasks}</strong> open tasks ·{' '}
                  <strong>{events.filter((e) => e.date === dateKey(new Date())).length || 'No'}</strong>{' '}
                  appointments today
                </motion.p>
              )}
            </div>
            <ThemeSwitch theme={theme} setTheme={setTheme} />
          </header>

          <AnimatePresence mode="wait">
            <motion.div key={view} variants={page} initial="hidden" animate="show" exit="exit">
              {view === 'overview' && (
                <motion.div className="stack" variants={stagger} initial="hidden" animate="show">
                  <div className="kpi-grid">
                    {kpis.map((k) => (
                      <KpiTile key={k.id} kpi={k} />
                    ))}
                  </div>
                  <motion.div className="grid-2" variants={rise}>
                    <TrendChart data={leadTrend} title="New leads" subtitle="Per week · last 12 weeks · all sources" unit="leads" />
                    <Funnel data={funnel} />
                  </motion.div>
                  <motion.div className="grid-3" variants={rise}>
                    <SpeedToLead leads={leads} setLeads={setLeads} onSeeAll={() => setView('leads')} />
                    <TodoList todos={todos} setTodos={setTodos} compact onSeeAll={() => setView('tasks')} />
                    <Upcoming events={events} onSeeAll={() => setView('calendar')} />
                  </motion.div>
                  <motion.div className="grid-2 even" variants={rise}>
                    <Deadlines listings={listings} setListings={setListings} onSeeAll={() => setView('pipeline')} />
                    <UpdatesFeed updates={updates} setUpdates={setUpdates} compact onSeeAll={() => setView('activity')} />
                  </motion.div>
                </motion.div>
              )}
              {view === 'tasks' && <TodoList todos={todos} setTodos={setTodos} properties={properties} />}
              {view === 'leads' && <Leads leads={leads} setLeads={setLeads} />}
              {view === 'pipeline' && <Listings listings={listings} setListings={setListings} />}
              {view === 'calendar' && <CalendarView events={events} setEvents={setEvents} />}
              {view === 'activity' && <UpdatesFeed updates={updates} setUpdates={setUpdates} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  )
}
