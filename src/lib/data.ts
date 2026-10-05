import { addDays, dateKey } from './dates'

export type Priority = 'high' | 'medium' | 'low'

export interface Todo {
  id: string
  title: string
  done: boolean
  priority: Priority
  due: string // YYYY-MM-DD
}

export type EventKind = 'meeting' | 'deadline' | 'focus' | 'social'

export interface CalEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  kind: EventKind
}

export type UpdateCategory = 'Release' | 'Team' | 'Metrics' | 'Announcement'

export interface Update {
  id: string
  author: string
  role: string
  initials: string
  hoursAgo: number
  category: UpdateCategory
  title: string
  body: string
  read: boolean
}

export interface Kpi {
  id: string
  label: string
  value: number
  format: 'currency' | 'number' | 'percent' | 'hours'
  delta: number // percent change vs previous period
  period: string
  upIsGood: boolean
  trend: number[]
}

export interface Goal {
  id: string
  label: string
  current: number
  target: number
  unit: string
}

export const uid = () => Math.random().toString(36).slice(2, 10)

export const kpis: Kpi[] = [
  {
    id: 'revenue',
    label: 'Revenue, month to date',
    value: 482_600,
    format: 'currency',
    delta: 12.4,
    period: 'vs last month',
    upIsGood: true,
    trend: [310, 322, 318, 341, 356, 349, 372, 390, 401, 428, 455, 483],
  },
  {
    id: 'tasks',
    label: 'Tasks completed',
    value: 1284,
    format: 'number',
    delta: 8.1,
    period: 'vs last month',
    upIsGood: true,
    trend: [880, 910, 960, 940, 1010, 1040, 1065, 1110, 1150, 1190, 1230, 1284],
  },
  {
    id: 'csat',
    label: 'Customer satisfaction',
    value: 92,
    format: 'percent',
    delta: 1.8,
    period: 'vs last month',
    upIsGood: true,
    trend: [86, 87, 87, 88, 89, 88, 90, 90, 91, 90, 91, 92],
  },
  {
    id: 'response',
    label: 'Avg. response time',
    value: 2.4,
    format: 'hours',
    delta: -14.3,
    period: 'vs last month',
    upIsGood: false,
    trend: [3.9, 3.7, 3.6, 3.5, 3.4, 3.2, 3.1, 2.9, 2.8, 2.7, 2.6, 2.4],
  },
]

/** Tasks shipped per week, oldest first. */
export function weeklyThroughput(today = new Date()) {
  const values = [142, 156, 149, 171, 165, 182, 178, 195, 188, 204, 212, 226]
  const monday = addDays(today, -((today.getDay() + 6) % 7))
  return values.map((value, i) => ({
    week: addDays(monday, (i - (values.length - 1)) * 7),
    value,
  }))
}

export const goals: Goal[] = [
  { id: 'g1', label: 'Q4 revenue target', current: 1.42, target: 2.0, unit: 'M' },
  { id: 'g2', label: 'Enterprise deals closed', current: 18, target: 24, unit: '' },
  { id: 'g3', label: 'Onboarding NPS', current: 61, target: 70, unit: '' },
  { id: 'g4', label: 'Docs coverage', current: 88, target: 95, unit: '%' },
]

export function seedTodos(today = new Date()): Todo[] {
  const d = (n: number) => dateKey(addDays(today, n))
  return [
    { id: uid(), title: 'Review Q4 roadmap with product leads', done: false, priority: 'high', due: d(0) },
    { id: uid(), title: 'Send weekly KPI summary to leadership', done: false, priority: 'high', due: d(0) },
    { id: uid(), title: 'Approve design specs for onboarding v2', done: true, priority: 'medium', due: d(0) },
    { id: uid(), title: 'Prep 1:1 notes for Maya', done: false, priority: 'medium', due: d(1) },
    { id: uid(), title: 'Update hiring pipeline tracker', done: false, priority: 'low', due: d(2) },
    { id: uid(), title: 'Reply to vendor contract questions', done: false, priority: 'medium', due: d(-1) },
    { id: uid(), title: 'Draft offsite agenda', done: false, priority: 'low', due: d(5) },
  ]
}

export function seedEvents(today = new Date()): CalEvent[] {
  const d = (n: number) => dateKey(addDays(today, n))
  return [
    { id: uid(), title: 'Team standup', date: d(0), time: '09:30', kind: 'meeting' },
    { id: uid(), title: 'Roadmap review', date: d(0), time: '14:00', kind: 'meeting' },
    { id: uid(), title: 'Deep work: pricing model', date: d(1), time: '10:00', kind: 'focus' },
    { id: uid(), title: '1:1 with Maya', date: d(1), time: '15:30', kind: 'meeting' },
    { id: uid(), title: 'Launch checklist due', date: d(3), time: '17:00', kind: 'deadline' },
    { id: uid(), title: 'Team lunch', date: d(4), time: '12:30', kind: 'social' },
    { id: uid(), title: 'Board deck draft due', date: d(8), time: '12:00', kind: 'deadline' },
    { id: uid(), title: 'Quarterly planning', date: d(10), time: '13:00', kind: 'meeting' },
    { id: uid(), title: 'Customer advisory call', date: d(-2), time: '11:00', kind: 'meeting' },
  ]
}

export function seedUpdates(): Update[] {
  return [
    {
      id: uid(), author: 'Priya Natarajan', role: 'Engineering', initials: 'PN', hoursAgo: 1,
      category: 'Release', title: 'Onboarding v2 is live for 25% of new accounts',
      body: 'Staged rollout started this morning. Early activation is up 9% over control — we will expand to 50% on Thursday if error rates hold.',
      read: false,
    },
    {
      id: uid(), author: 'Marcus Lee', role: 'Finance', initials: 'ML', hoursAgo: 4,
      category: 'Metrics', title: 'Revenue passed $480K month to date',
      body: 'We are tracking 12% ahead of last month, driven mostly by enterprise renewals. Full breakdown in the finance channel.',
      read: false,
    },
    {
      id: uid(), author: 'Sofia Alvarez', role: 'People', initials: 'SA', hoursAgo: 22,
      category: 'Team', title: 'Welcome Jordan and Amara to the support team',
      body: 'Both start Monday. Please say hi and help them find their way around — buddy assignments are in the onboarding doc.',
      read: false,
    },
    {
      id: uid(), author: 'Daniel Kim', role: 'Leadership', initials: 'DK', hoursAgo: 30,
      category: 'Announcement', title: 'Q4 offsite confirmed for November 14–15',
      body: 'Location and agenda coming next week. Block your calendars and share topic ideas in the planning thread.',
      read: true,
    },
    {
      id: uid(), author: 'Hana Okafor', role: 'Support', initials: 'HO', hoursAgo: 52,
      category: 'Metrics', title: 'Response time down to 2.4 hours',
      body: 'The new triage rotation cut average first-response time by 14%. Thanks to everyone who volunteered for weekend coverage.',
      read: true,
    },
  ]
}
