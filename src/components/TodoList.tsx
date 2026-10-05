import { useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import {
  type Priority,
  type TaskCategory,
  type Todo,
  taskCategories,
  taskTemplates,
  uid,
} from '../lib/data'
import { dateKey, relativeDay } from '../lib/dates'
import { spring } from '../lib/motion'
import { Icon } from './Icon'

type Filter = 'open' | 'done' | TaskCategory

interface Props {
  todos: Todo[]
  setTodos: Dispatch<SetStateAction<Todo[]>>
  properties?: string[]
  compact?: boolean
  onSeeAll?: () => void
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className={`check ${checked ? 'is-checked' : ''}`}
      onClick={onChange}
      whileTap={{ scale: 0.85 }}
    >
      <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden="true">
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.25 }}
        />
      </svg>
    </motion.button>
  )
}

const priorityLabel: Record<Priority, string> = { high: 'High', medium: 'Medium', low: 'Low' }

export function TodoList({ todos, setTodos, properties = [], compact = false, onSeeAll }: Props) {
  const [filter, setFilter] = useState<Filter>('open')
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [category, setCategory] = useState<TaskCategory>('Listing')
  const [property, setProperty] = useState('')
  const [due, setDue] = useState(() => dateKey(new Date()))

  const today = dateKey(new Date())
  const sorted = [...todos].sort(
    (a, b) => Number(a.done) - Number(b.done) || a.due.localeCompare(b.due),
  )
  const visible = compact
    ? sorted.filter((t) => t.due <= today).slice(0, 5)
    : sorted.filter((t) =>
        filter === 'open' ? !t.done : filter === 'done' ? t.done : t.category === filter,
      )
  const remaining = todos.filter((t) => !t.done).length
  const overdue = todos.filter((t) => !t.done && t.due < today).length

  function add(e: FormEvent) {
    e.preventDefault()
    const text = title.trim()
    if (!text) return
    setTodos((ts) => [
      { id: uid(), title: text, done: false, priority, due, category, property: property || undefined },
      ...ts,
    ])
    setTitle('')
  }

  function applyTemplate(t: (typeof taskTemplates)[number]) {
    setTitle(t.title)
    setCategory(t.category)
    setPriority(t.priority)
    document.getElementById('task-title')?.focus()
  }

  const toggle = (id: string) =>
    setTodos((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const remove = (id: string) => setTodos((ts) => ts.filter((t) => t.id !== id))

  const filters: Filter[] = ['open', ...taskCategories, 'done']

  return (
    <section className="card todo-card" aria-labelledby={compact ? 'todo-title-c' : 'todo-title'}>
      <header className="card-head">
        <div>
          <h2 id={compact ? 'todo-title-c' : 'todo-title'}>{compact ? 'Due today' : 'VA task board'}</h2>
          <p className="muted">
            {remaining} open{overdue ? ` · ${overdue} overdue` : ''}
          </p>
        </div>
        {compact && (
          <button className="link-btn" onClick={onSeeAll}>
            All tasks
          </button>
        )}
      </header>

      {!compact && (
        <>
          <div className="templates">
            <span className="eyebrow">
              <Icon name="zap" size={12} /> Quick add
            </span>
            <div className="template-row">
              {taskTemplates.map((t) => (
                <motion.button
                  key={t.title}
                  type="button"
                  className="template"
                  onClick={() => applyTemplate(t)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {t.title}
                </motion.button>
              ))}
            </div>
          </div>

          <form className="todo-form" onSubmit={add}>
            <input
              id="task-title"
              className="input grow"
              placeholder="What needs doing?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Task title"
            />
            <select id="task-category" className="input" value={category} onChange={(e) => setCategory(e.target.value as TaskCategory)} aria-label="Category">
              {taskCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select id="task-property" className="input" value={property} onChange={(e) => setProperty(e.target.value)} aria-label="Property">
              <option value="">No property</option>
              {properties.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <select id="task-priority" className="input" value={priority} onChange={(e) => setPriority(e.target.value as Priority)} aria-label="Priority">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input id="task-due" className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" />
            <motion.button className="btn primary" type="submit" whileTap={{ scale: 0.95 }} disabled={!title.trim()}>
              <Icon name="plus" size={16} />
              Add task
            </motion.button>
          </form>

          <div className="chips" role="tablist" aria-label="Filter tasks">
            {filters.map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} className="chip" onClick={() => setFilter(f)}>
                {filter === f && <motion.span layoutId="todo-chip" className="chip-pill" transition={spring} />}
                <span>{f === 'open' ? 'All open' : f === 'done' ? 'Done' : f}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <LayoutGroup id={compact ? 'todos-compact' : 'todos'}>
        <motion.ul className="todos" layout>
          <AnimatePresence initial={false}>
            {visible.map((t) => (
              <motion.li
                key={t.id}
                layout
                className={`todo ${t.done ? 'is-done' : ''}`}
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
                transition={spring}
              >
                <Checkbox checked={t.done} onChange={() => toggle(t.id)} label={`Mark "${t.title}" ${t.done ? 'not done' : 'done'}`} />
                <div className="todo-body">
                  <span className="todo-title">{t.title}</span>
                  <span className="todo-meta">
                    <span className="tag">{t.category}</span>
                    {t.property && (
                      <span>
                        <Icon name="home" size={12} /> {t.property}
                      </span>
                    )}
                    <span className={`prio prio-${t.priority}`}>
                      <i aria-hidden="true" />
                      {priorityLabel[t.priority]}
                    </span>
                    <span className={!t.done && t.due < today ? 'overdue' : ''}>
                      <Icon name="clock" size={12} /> {relativeDay(t.due)}
                    </span>
                  </span>
                </div>
                {!compact && (
                  <motion.button
                    className="icon-btn ghost"
                    aria-label={`Delete "${t.title}"`}
                    onClick={() => remove(t.id)}
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.85 }}
                  >
                    <Icon name="x" size={16} />
                  </motion.button>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
        <AnimatePresence>
          {visible.length === 0 && (
            <motion.p className="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {compact ? 'Nothing due today.' : 'No tasks in this view.'}
            </motion.p>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </section>
  )
}
