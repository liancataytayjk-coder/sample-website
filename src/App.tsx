import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { CalendarView, Upcoming } from './components/CalendarView'
import { Goals } from './components/Goals'
import { Icon, type IconName } from './components/Icon'
import { KpiTile } from './components/KpiTile'
import { TodoList } from './components/TodoList'
import { TrendChart } from './components/TrendChart'
import { UpdatesFeed } from './components/UpdatesFeed'
import { goals, kpis, seedEvents, seedTodos, seedUpdates, weeklyThroughput } from './lib/data'
import { fmtLong } from './lib/dates'
import { page, rise, spring, stagger } from './lib/motion'
import { useStoredState } from './lib/useStoredState'

type View = 'overview' | 'tasks' | 'calendar' | 'updates'
type Theme = 'light' | 'dark'

const nav: { id: View; label: string; icon: IconName }[] = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'tasks', label: 'To-dos', icon: 'tasks' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'updates', label: 'Updates', icon: 'bell' },
]

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

export default function App() {
  const [view, setView] = useStoredState<View>('pulse.view', () => 'overview')
  const [todos, setTodos] = useStoredState('pulse.todos', () => seedTodos())
  const [events, setEvents] = useStoredState('pulse.events', () => seedEvents())
  const [updates, setUpdates] = useStoredState('pulse.updates', () => seedUpdates())
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const throughput = useMemo(() => weeklyThroughput(), [])

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
  const badges: Partial<Record<View, number>> = { tasks: openTasks, updates: unread }
  const title = nav.find((n) => n.id === view)?.label ?? ''

  return (
    <MotionConfig reducedMotion="user">
      <div className="shell">
        <aside className="sidebar">
          <div className="brand">
            <motion.span
              className="brand-mark"
              initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
              <Icon name="pulse" size={18} />
            </motion.span>
            <span className="brand-name">Pulse</span>
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
                          className="badge"
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

          <button
            className="theme-toggle"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="theme-icon"
              >
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
              </motion.span>
            </AnimatePresence>
            <span className="nav-label">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
        </aside>

        <main className="main">
          <header className="topbar">
            <div>
              <p className="muted">{fmtLong.format(new Date())}</p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.h1
                  key={view}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {view === 'overview' ? `${greeting()} 👋` : title}
                </motion.h1>
              </AnimatePresence>
            </div>
            {view === 'overview' && (
              <motion.p className="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                You have <strong>{openTasks}</strong> open tasks and <strong>{unread}</strong> unread updates.
              </motion.p>
            )}
          </header>

          <AnimatePresence mode="wait">
            <motion.div key={view} variants={page} initial="hidden" animate="show" exit="exit">
              {view === 'overview' && (
                <motion.div className="overview" variants={stagger} initial="hidden" animate="show">
                  <div className="kpi-grid">
                    {kpis.map((k) => (
                      <KpiTile key={k.id} kpi={k} />
                    ))}
                  </div>
                  <motion.div className="grid-2" variants={rise}>
                    <TrendChart data={throughput} />
                    <Goals goals={goals} />
                  </motion.div>
                  <motion.div className="grid-3" variants={rise}>
                    <TodoList todos={todos} setTodos={setTodos} compact onSeeAll={() => setView('tasks')} />
                    <Upcoming events={events} onSeeAll={() => setView('calendar')} />
                    <UpdatesFeed updates={updates} setUpdates={setUpdates} compact onSeeAll={() => setView('updates')} />
                  </motion.div>
                </motion.div>
              )}
              {view === 'tasks' && <TodoList todos={todos} setTodos={setTodos} />}
              {view === 'calendar' && <CalendarView events={events} setEvents={setEvents} />}
              {view === 'updates' && <UpdatesFeed updates={updates} setUpdates={setUpdates} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  )
}
