import { addDays, dateKey } from './dates'

export const uid = () => Math.random().toString(36).slice(2, 10)

/* ---------- Tasks ---------- */

export type Priority = 'high' | 'medium' | 'low'
export type TaskCategory = 'Listing' | 'Transaction' | 'Marketing' | 'Follow-up' | 'Admin'
export const taskCategories: TaskCategory[] = ['Listing', 'Transaction', 'Marketing', 'Follow-up', 'Admin']

export interface Todo {
  id: string
  title: string
  done: boolean
  priority: Priority
  due: string // YYYY-MM-DD
  category: TaskCategory
  property?: string
}

/** One-click starters for the jobs a realtor's VA repeats every week. */
export const taskTemplates: { title: string; category: TaskCategory; priority: Priority }[] = [
  { title: 'Schedule showing', category: 'Listing', priority: 'high' },
  { title: 'Upload listing to MLS', category: 'Listing', priority: 'high' },
  { title: 'Order listing photos', category: 'Marketing', priority: 'medium' },
  { title: 'Send CMA to seller', category: 'Follow-up', priority: 'medium' },
  { title: 'Submit docs to broker', category: 'Transaction', priority: 'high' },
  { title: 'Post on Instagram & Facebook', category: 'Marketing', priority: 'low' },
  { title: 'Follow up with lead', category: 'Follow-up', priority: 'high' },
  { title: 'Update CRM notes', category: 'Admin', priority: 'low' },
]

/* ---------- Calendar ---------- */

export type EventKind = 'showing' | 'openhouse' | 'closing' | 'deadline' | 'call'

export interface CalEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  kind: EventKind
  location?: string
}

/* ---------- Listings & deals ---------- */

export type ListingStatus = 'Coming soon' | 'Active' | 'Pending' | 'Closed'
export const listingStatuses: ListingStatus[] = ['Coming soon', 'Active', 'Pending', 'Closed']

export interface Milestone {
  id: string
  label: string
  date: string // YYYY-MM-DD
  done: boolean
}

export interface Listing {
  id: string
  address: string
  city: string
  price: number
  beds: number
  baths: number
  sqft: number
  status: ListingStatus
  side: 'Seller' | 'Buyer'
  client: string
  listedOn: string // YYYY-MM-DD
  showings: number
  milestones: Milestone[]
}

/* ---------- Leads ---------- */

export type LeadSource = 'Zillow' | 'Realtor.com' | 'Website' | 'Referral' | 'Open house'
export type LeadStage = 'New' | 'Contacted' | 'Nurturing' | 'Appointment set'
export const leadStages: LeadStage[] = ['New', 'Contacted', 'Nurturing', 'Appointment set']
export const leadSources: LeadSource[] = ['Zillow', 'Realtor.com', 'Website', 'Referral', 'Open house']

export interface Lead {
  id: string
  name: string
  source: LeadSource
  intent: 'Buyer' | 'Seller'
  budget: string
  area: string
  stage: LeadStage
  receivedAt: number // epoch ms
  lastContactAt: number | null // epoch ms
  phone: string
}

/** A new lead should hear back within this many minutes. */
export const LEAD_SLA_MIN = 15

/* ---------- Activity ---------- */

export type UpdateCategory = 'Lead' | 'Listing' | 'Transaction' | 'Agent note'

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

/* ---------- KPIs ---------- */

export interface Kpi {
  id: string
  label: string
  value: number
  format: 'currency' | 'number' | 'minutes'
  delta: number
  period: string
  upIsGood: boolean
  trend: number[]
}

export const kpis: Kpi[] = [
  {
    id: 'volume',
    label: 'Closed volume, YTD',
    value: 8_640_000,
    format: 'currency',
    delta: 14.2,
    period: 'vs last year',
    upIsGood: true,
    trend: [4.1, 4.6, 4.9, 5.3, 5.6, 6.0, 6.4, 6.9, 7.3, 7.8, 8.2, 8.64],
  },
  {
    id: 'active',
    label: 'Active listings',
    value: 12,
    format: 'number',
    delta: 20,
    period: 'vs last month',
    upIsGood: true,
    trend: [7, 8, 8, 9, 9, 10, 9, 10, 11, 10, 11, 12],
  },
  {
    id: 'leads',
    label: 'New leads, this week',
    value: 23,
    format: 'number',
    delta: 18.4,
    period: 'vs last week',
    upIsGood: true,
    trend: [12, 14, 13, 16, 15, 17, 18, 16, 19, 20, 19, 23],
  },
  {
    id: 'response',
    label: 'Avg. lead response',
    value: 14,
    format: 'minutes',
    delta: -22.2,
    period: 'vs last month',
    upIsGood: false,
    trend: [31, 29, 27, 26, 24, 22, 21, 19, 18, 17, 18, 14],
  },
]

/** New leads per week, oldest first. */
export function weeklyLeads(today = new Date()) {
  const values = [12, 14, 13, 16, 15, 17, 18, 16, 19, 20, 19, 23]
  const monday = addDays(today, -((today.getDay() + 6) % 7))
  return values.map((value, i) => ({
    week: addDays(monday, (i - (values.length - 1)) * 7),
    value,
  }))
}

/** Deal funnel, last 90 days. */
export const funnel = [
  { stage: 'Leads', value: 214 },
  { stage: 'Consultations', value: 64 },
  { stage: 'Showings', value: 41 },
  { stage: 'Offers written', value: 17 },
  { stage: 'Under contract', value: 9 },
  { stage: 'Closed', value: 6 },
]

/* ---------- Seeds ---------- */

export function seedTodos(today = new Date()): Todo[] {
  const d = (n: number) => dateKey(addDays(today, n))
  return [
    { id: uid(), title: 'Confirm Saturday showings with buyer agents', done: false, priority: 'high', due: d(0), category: 'Listing', property: '1842 Juniper Ln' },
    { id: uid(), title: 'Send inspection report to buyer and lender', done: false, priority: 'high', due: d(0), category: 'Transaction', property: '77 Harbor View Dr' },
    { id: uid(), title: 'Upload new listing to MLS', done: true, priority: 'high', due: d(0), category: 'Listing', property: '305 Alder Ct' },
    { id: uid(), title: 'Call back Zillow lead — Daniel Ortiz', done: false, priority: 'high', due: d(-1), category: 'Follow-up' },
    { id: uid(), title: 'Order twilight photos', done: false, priority: 'medium', due: d(1), category: 'Marketing', property: '305 Alder Ct' },
    { id: uid(), title: 'Prepare CMA for Patel listing appointment', done: false, priority: 'medium', due: d(1), category: 'Follow-up', property: '9 Larkspur Way' },
    { id: uid(), title: 'Schedule open house social posts', done: false, priority: 'low', due: d(2), category: 'Marketing', property: '1842 Juniper Ln' },
    { id: uid(), title: 'Submit commission docs to broker', done: false, priority: 'medium', due: d(3), category: 'Transaction', property: '412 Cedar St' },
    { id: uid(), title: 'Clean up CRM tags from open house', done: false, priority: 'low', due: d(4), category: 'Admin' },
  ]
}

export function seedEvents(today = new Date()): CalEvent[] {
  const d = (n: number) => dateKey(addDays(today, n))
  return [
    { id: uid(), title: 'Showing — Kim family', date: d(0), time: '10:30', kind: 'showing', location: '1842 Juniper Ln' },
    { id: uid(), title: 'Lender check-in call', date: d(0), time: '13:00', kind: 'call' },
    { id: uid(), title: 'Showing — buyer agent tour', date: d(0), time: '16:00', kind: 'showing', location: '305 Alder Ct' },
    { id: uid(), title: 'Appraisal', date: d(1), time: '11:00', kind: 'deadline', location: '77 Harbor View Dr' },
    { id: uid(), title: 'Listing appointment — Patel', date: d(1), time: '17:30', kind: 'call', location: '9 Larkspur Way' },
    { id: uid(), title: 'Open house', date: d(5), time: '13:00', kind: 'openhouse', location: '1842 Juniper Ln' },
    { id: uid(), title: 'Final walkthrough', date: d(6), time: '09:00', kind: 'deadline', location: '412 Cedar St' },
    { id: uid(), title: 'Closing — Cedar St', date: d(7), time: '14:00', kind: 'closing', location: 'Summit Title Co.' },
    { id: uid(), title: 'Open house', date: d(12), time: '12:00', kind: 'openhouse', location: '305 Alder Ct' },
    { id: uid(), title: 'Closing — Harbor View', date: d(21), time: '10:00', kind: 'closing', location: 'Summit Title Co.' },
    { id: uid(), title: 'Showing — Nguyen', date: d(-2), time: '15:00', kind: 'showing', location: '1842 Juniper Ln' },
  ]
}

export function seedListings(today = new Date()): Listing[] {
  const d = (n: number) => dateKey(addDays(today, n))
  const ms = (rows: [string, number, boolean][]): Milestone[] =>
    rows.map(([label, n, done]) => ({ id: uid(), label, date: d(n), done }))
  return [
    {
      id: uid(), address: '1842 Juniper Ln', city: 'Westbrook', price: 689_000, beds: 4, baths: 3, sqft: 2_480,
      status: 'Active', side: 'Seller', client: 'The Hendersons', listedOn: d(-9), showings: 14, milestones: [],
    },
    {
      id: uid(), address: '305 Alder Ct', city: 'Maple Grove', price: 524_900, beds: 3, baths: 2, sqft: 1_860,
      status: 'Active', side: 'Seller', client: 'Rachel Kim', listedOn: d(-2), showings: 5, milestones: [],
    },
    {
      id: uid(), address: '77 Harbor View Dr', city: 'Bayside', price: 1_150_000, beds: 5, baths: 4, sqft: 3_920,
      status: 'Pending', side: 'Buyer', client: 'Omar & Leah Haddad', listedOn: d(-34), showings: 0,
      milestones: ms([
        ['Earnest money delivered', -12, true],
        ['Inspection', -6, true],
        ['Option period ends', -1, true],
        ['Appraisal', 1, false],
        ['Financing approval', 9, false],
        ['Clear to close', 18, false],
        ['Closing', 21, false],
      ]),
    },
    {
      id: uid(), address: '412 Cedar St', city: 'Westbrook', price: 449_000, beds: 3, baths: 2, sqft: 1_540,
      status: 'Pending', side: 'Seller', client: 'Marcus Webb', listedOn: d(-41), showings: 0,
      milestones: ms([
        ['Earnest money delivered', -25, true],
        ['Inspection', -19, true],
        ['Option period ends', -14, true],
        ['Appraisal', -8, true],
        ['Financing approval', 2, false],
        ['Final walkthrough', 6, false],
        ['Closing', 7, false],
      ]),
    },
    {
      id: uid(), address: '9 Larkspur Way', city: 'Maple Grove', price: 615_000, beds: 4, baths: 2.5, sqft: 2_210,
      status: 'Coming soon', side: 'Seller', client: 'Anita Patel', listedOn: d(10), showings: 0, milestones: [],
    },
    {
      id: uid(), address: '28 Orchard Rd', city: 'Bayside', price: 732_000, beds: 4, baths: 3, sqft: 2_650,
      status: 'Closed', side: 'Buyer', client: 'Grace Liu', listedOn: d(-70), showings: 0, milestones: [],
    },
  ]
}

export function seedLeads(now = Date.now()): Lead[] {
  const min = 60_000
  return [
    { id: uid(), name: 'Daniel Ortiz', source: 'Zillow', intent: 'Buyer', budget: '$450–520K', area: 'Westbrook', stage: 'New', receivedAt: now - 26 * 60 * min, lastContactAt: null, phone: '(555) 201-4410' },
    { id: uid(), name: 'Monica Reyes', source: 'Website', intent: 'Seller', budget: '~$600K home', area: 'Maple Grove', stage: 'New', receivedAt: now - 9 * min, lastContactAt: null, phone: '(555) 318-0092' },
    { id: uid(), name: 'Tom & Priya Shah', source: 'Open house', intent: 'Buyer', budget: '$650–700K', area: 'Westbrook', stage: 'Contacted', receivedAt: now - 3 * 24 * 60 * min, lastContactAt: now - 2 * 24 * 60 * min, phone: '(555) 774-2210' },
    { id: uid(), name: 'Kevin Brooks', source: 'Realtor.com', intent: 'Buyer', budget: '$380–420K', area: 'Bayside', stage: 'Nurturing', receivedAt: now - 12 * 24 * 60 * min, lastContactAt: now - 6 * 24 * 60 * min, phone: '(555) 640-7781' },
    { id: uid(), name: 'Anita Patel', source: 'Referral', intent: 'Seller', budget: '~$615K home', area: 'Maple Grove', stage: 'Appointment set', receivedAt: now - 5 * 24 * 60 * min, lastContactAt: now - 20 * 60 * min, phone: '(555) 412-9930' },
    { id: uid(), name: 'Jasmine Cole', source: 'Zillow', intent: 'Buyer', budget: '$500–560K', area: 'Maple Grove', stage: 'Contacted', receivedAt: now - 30 * 60 * min, lastContactAt: now - 28 * 60 * min, phone: '(555) 908-1174' },
  ]
}

export function seedUpdates(): Update[] {
  return [
    {
      id: uid(), author: 'Jessica Moreno', role: 'Agent', initials: 'JM', hoursAgo: 1,
      category: 'Agent note', title: 'Hendersons are open to a price reduction',
      body: 'If we have no offers by Friday, prep a $15K reduction and draft the "new price" email blast for Monday morning.',
      read: false,
    },
    {
      id: uid(), author: 'Zillow', role: 'Lead source', initials: 'Z', hoursAgo: 2,
      category: 'Lead', title: 'New buyer lead: Monica Reyes, Maple Grove',
      body: 'Asked about selling her current home before buying. Wants a call after 5 pm.',
      read: false,
    },
    {
      id: uid(), author: 'Summit Title Co.', role: 'Title', initials: 'ST', hoursAgo: 5,
      category: 'Transaction', title: 'Title commitment received for 412 Cedar St',
      body: 'No exceptions flagged. Closing is still on track for next week; seller ID and payoff info still needed.',
      read: false,
    },
    {
      id: uid(), author: 'Jessica Moreno', role: 'Agent', initials: 'JM', hoursAgo: 20,
      category: 'Listing', title: '305 Alder Ct is live on MLS',
      body: 'Thanks for turning this around fast. Please book the twilight photographer this week.',
      read: true,
    },
    {
      id: uid(), author: 'Bay Lending', role: 'Lender', initials: 'BL', hoursAgo: 30,
      category: 'Transaction', title: 'Appraisal ordered for 77 Harbor View Dr',
      body: 'Appraiser confirmed for tomorrow at 11:00. Lockbox code shared with the listing agent.',
      read: true,
    },
  ]
}
