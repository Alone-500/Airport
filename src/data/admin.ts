import { hash, makePnr, rng, toISODate } from '../lib/utils';
import { AIRPORTS } from './airports';

const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

export const REVENUE_SERIES = MONTHS.map((m, i) => {
  const base = 452 + i * 14 + Math.sin(i / 1.7) * 38;
  return {
    month: m,
    passenger: Math.round(base * 0.71),
    cargo: Math.round(base * 0.19),
    ancillary: Math.round(base * 0.1),
    target: Math.round(base * 1.03),
  };
});

export const PUNCTUALITY_SERIES = Array.from({ length: 30 }, (_, i) => {
  const r = rng(hash('otp' + i));
  return { day: `${i + 1}`, otp: Math.round((80 + r() * 14) * 10) / 10, delays: Math.round(6 + r() * 22), cancellation: Math.round(r() * 3 * 10) / 10 };
});

export const LOAD_FACTOR_SERIES = MONTHS.map((m, i) => {
  const r = rng(hash('lf' + m));
  return { month: m, load: Math.round(76 + r() * 12 + i * 0.3), premium: Math.round(63 + r() * 14), economy: Math.round(82 + r() * 11) };
});

export const BOOKINGS_BY_DAY = Array.from({ length: 21 }, (_, i) => {
  const r = rng(hash('bk' + i));
  const d = new Date(Date.now() - (20 - i) * 86400000);
  return { day: toISODate(d).slice(5), web: Math.round(3100 + r() * 1400), agency: Math.round(900 + r() * 500), mobile: Math.round(1500 + r() * 900) };
});

export const TOP_ROUTES = [
  { route: 'ACC – LOS', bookings: 18420, revenue: 3.42, yield: 0.186, load: 88.4, delta: 4.2 },
  { route: 'ACC – LHR', bookings: 9240, revenue: 11.8, yield: 0.128, load: 86.1, delta: 6.8 },
  { route: 'NBO – JNB', bookings: 12980, revenue: 4.11, yield: 0.142, load: 84.7, delta: -1.4 },
  { route: 'ACC – NBO', bookings: 14310, revenue: 5.06, yield: 0.139, load: 89.2, delta: 2.9 },
  { route: 'CPT – JNB', bookings: 21140, revenue: 3.88, yield: 0.091, load: 91.4, delta: 1.1 },
  { route: 'ACC – DXB', bookings: 7420, revenue: 6.24, yield: 0.121, load: 82.9, delta: 9.4 },
  { route: 'LOS – JNB', bookings: 8130, revenue: 3.02, yield: 0.158, load: 80.2, delta: -3.2 },
  { route: 'ACC – JFK', bookings: 3110, revenue: 5.91, yield: 0.146, load: 79.8, delta: 12.6 },
];

export const CABIN_MIX = [
  { name: 'Economy Light', value: 27, colour: '#AECCE4' },
  { name: 'Economy Classic', value: 38, colour: '#4FB1E8' },
  { name: 'Economy Flex', value: 14, colour: '#0FA79A' },
  { name: 'Premium', value: 9, colour: '#C99A3B' },
  { name: 'Business', value: 12, colour: '#0B2340' },
];

export const CHANNEL_MIX = [
  { name: 'Web', value: 46 },
  { name: 'Mobile app', value: 29 },
  { name: 'TMC / GDS', value: 15 },
  { name: 'Airport', value: 6 },
  { name: 'Call centre', value: 4 },
];

const FIRST = ['Akosua', 'Kwame', 'Ngozi', 'Chidi', 'Wanjiru', 'Baraka', 'Thabo', 'Lerato', 'Yara', 'Omar', 'Ama', 'Kojo', 'Fatima', 'Ibrahim', 'Zainab', 'Tendai', 'Nomvula', 'Selom', 'Adaeze', 'Makena', 'Kofi', 'Aisha', 'Deng', 'Naledi', 'Yaw', 'Chipimo', 'Sipho', 'Amina'];
const LAST = ['Mensah', 'Okafor', 'Kimani', 'Dlamini', 'Haddad', 'Boateng', 'Nwosu', 'Mwangi', 'Botha', 'Farouk', 'Asante', 'Okonkwo', 'Nkosi', 'Abubakar', 'Chirwa', 'Makinde', 'van Wyk', 'Adeyemi', 'Banda', 'Osei', 'Kamau', 'Diallo', 'Sithole', 'Tetteh'];
const CORPS = ['CocoaLink Ltd', 'Serengeti Safaris', 'Zenith Capital', 'Lagos Freight Co', 'Kivu Minerals', 'Adom Health', 'Trans-Sahel Logistics', 'Nairobi Fintech', 'Durban Marine', 'Accra Legal Partners'];

export type AdminBookingStatus = 'CONFIRMED' | 'TICKETED' | 'PENDING' | 'CHANGED' | 'CANCELLED' | 'REFUND_REQUESTED' | 'NO_SHOW';
export interface AdminBooking {
  id: string;
  ref: string;
  pnr: string;
  passenger: string;
  email: string;
  route: string;
  flight: string;
  date: string;
  cabin: string;
  fare: string;
  pax: number;
  total: number;
  status: AdminBookingStatus;
  channel: string;
  bag: number;
  seat: string;
  issued: string;
  corporate?: string;
}

export const ADMIN_BOOKINGS: AdminBooking[] = Array.from({ length: 48 }, (_, i) => {
  const r = rng(hash('bklist' + i));
  const a = AIRPORTS[Math.floor(r() * AIRPORTS.length)];
  let b = AIRPORTS[Math.floor(r() * AIRPORTS.length)];
  if (b.code === a.code) b = AIRPORTS[(AIRPORTS.indexOf(a) + 5) % AIRPORTS.length];
  const names = `${FIRST[Math.floor(r() * FIRST.length)]} ${LAST[Math.floor(r() * LAST.length)]}`;
  const cabins = ['Economy', 'Economy', 'Economy', 'Premium', 'Business'];
  const fares = ['Light', 'Classic', 'Flex', 'Classic', 'Flex', 'Business'];
  const statuses: AdminBookingStatus[] = ['TICKETED', 'TICKETED', 'CONFIRMED', 'PENDING', 'CHANGED', 'CANCELLED', 'REFUND_REQUESTED', 'NO_SHOW', 'TICKETED', 'CONFIRMED'];
  const day = Math.floor(r() * 40) - 6;
  return {
    id: `B${90210 + i}`,
    ref: makePnr(hash('ref' + i)),
    pnr: makePnr(hash('pnr' + i)),
    passenger: names,
    email: `${names.split(' ')[0].toLowerCase()}.${names.split(' ')[1].toLowerCase()}@${r() > 0.5 ? 'mail.com' : CORPS[Math.floor(r() * CORPS.length)].toLowerCase().replace(/[^a-z]/g, '') + '.com'}`,
    route: `${a.code}–${b.code}`,
    flight: `AN ${100 + Math.floor(r() * 880)}`,
    date: toISODate(new Date(Date.now() + day * 86400000)),
    cabin: cabins[Math.floor(r() * cabins.length)],
    fare: fares[Math.floor(r() * fares.length)],
    pax: 1 + Math.floor(r() * 3),
    total: Math.round((95 + r() * 2400) * 100) / 100,
    status: statuses[Math.floor(r() * statuses.length)],
    channel: ['Web', 'Mobile', 'GDS', 'Call centre', 'Airport'][Math.floor(r() * 5)],
    bag: Math.floor(r() * 4),
    seat: `${10 + Math.floor(r() * 30)}${['A', 'B', 'C', 'D', 'E', 'F'][Math.floor(r() * 6)]}`,
    issued: toISODate(new Date(Date.now() - (1 + Math.floor(r() * 60)) * 86400000)),
    corporate: r() > 0.72 ? CORPS[Math.floor(r() * CORPS.length)] : undefined,
  };
});

export interface AdminFlight {
  id: string;
  flightNo: string;
  route: string;
  origin: string;
  dest: string;
  dep: string;
  arr: string;
  date: string;
  aircraft: string;
  reg: string;
  gate: string;
  terminal: string;
  status: 'SCHEDULED' | 'BOARDING' | 'DEPARTED' | 'IN AIR' | 'LANDED' | 'DELAYED' | 'CANCELLED' | 'GATE CHANGE';
  booked: number;
  capacity: number;
  crewSet: string;
  remark?: string;
}

export const ADMIN_FLIGHTS: AdminFlight[] = Array.from({ length: 34 }, (_, i) => {
  const r = rng(hash('flt' + i));
  const a = AIRPORTS[Math.floor(r() * 25)];
  let b = AIRPORTS[Math.floor(r() * AIRPORTS.length)];
  if (b.code === a.code) b = AIRPORTS[(AIRPORTS.indexOf(a) + 3) % AIRPORTS.length];
  const cap = [156, 192, 262, 244][Math.floor(r() * 4)];
  const booked = Math.round(cap * (0.58 + r() * 0.4));
  const hour = Math.floor(5 + r() * 19);
  const min = Math.floor(r() * 60);
  const dur = 1 + Math.floor(r() * 9);
  const statuses: AdminFlight['status'][] = ['SCHEDULED', 'BOARDING', 'DEPARTED', 'IN AIR', 'LANDED', 'DELAYED', 'SCHEDULED', 'GATE CHANGE', 'CANCELLED', 'SCHEDULED'];
  const st = statuses[Math.floor(r() * statuses.length)];
  return {
    id: `F${4100 + i}`,
    flightNo: `AN ${100 + i * 3 + Math.floor(r() * 4)}`,
    route: `${a.code}–${b.code}`,
    origin: a.code,
    dest: b.code,
    dep: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
    arr: `${String((hour + dur) % 24).padStart(2, '0')}:${String((min + 25) % 60).padStart(2, '0')}`,
    date: toISODate(new Date(Date.now() + (i % 3 - 1) * 86400000)),
    aircraft: ['A320neo', 'A321neo', 'A330-900neo', '787-9'][Math.floor(r() * 4)],
    reg: `9G-${['AIN', 'AIX', 'AKQ', 'ANR', 'ATC', 'AVL', 'AZD'][Math.floor(r() * 7)]}`,
    gate: `${['A', 'B', 'C', 'D'][Math.floor(r() * 4)]}${1 + Math.floor(r() * 24)}`,
    terminal: ['T1', 'T1', 'T2', 'Galaxy'][Math.floor(r() * 4)],
    status: st,
    booked,
    capacity: cap,
    crewSet: `SET ${String.fromCharCode(65 + Math.floor(r() * 8))}${Math.floor(r() * 9)}`,
    remark: st === 'DELAYED' ? ['ATC flow control', 'Late inbound aircraft', 'Ramp equipment shortage', 'Medical consultation'][Math.floor(r() * 4)] : st === 'GATE CHANGE' ? 'Gate moved from A12 to C4 — passengers notified' : undefined,
  };
});

export const ADMIN_CREW = [
  { id: 'C-2201', name: 'Cpt. Zanele Mthembu', role: 'Commander', licence: 'GHA-ATPL-4471', hours: 14210, base: 'ACC', status: 'On duty · AN 204', nextRest: '22:40' },
  { id: 'C-1188', name: 'F/O Daniel Amankwah', role: 'First Officer', licence: 'GHA-CPL-9920', hours: 3410, base: 'ACC', status: 'On duty · AN 204', nextRest: '22:40' },
  { id: 'C-3345', name: 'Purser Amina Yusuf', role: 'Cabin Manager', licence: 'KCA-CCT-1194', hours: 8120, base: 'NBO', status: 'Standby', nextRest: '—' },
  { id: 'C-2077', name: 'Cpt. Pieter van Rensburg', role: 'Commander', licence: 'RSA-ATPL-7712', hours: 11340, base: 'JNB', status: 'Off duty', nextRest: '04:10' },
  { id: 'C-4512', name: 'SFO Grace Wanjiru', role: 'Senior FO', licence: 'KEA-CPL-3390', hours: 5290, base: 'NBO', status: 'On duty · AN 512', nextRest: '19:05' },
  { id: 'C-5091', name: 'Cabin Crew Selom Agbeko', role: 'CC', licence: 'GHA-CC-88021', hours: 1980, base: 'ACC', status: 'Training · 14 days', nextRest: '—' },
];

export const ADMIN_AIRPORT_ROWS = AIRPORTS.slice(0, 22).map((a, i) => {
  const r = rng(hash('apt' + i));
  return {
    code: a.code,
    name: a.name,
    country: a.country,
    terminals: a.terminals.length,
    gates: a.gates,
    counters: a.counters.startsWith('—') ? 0 : 8 + Math.floor(r() * 40),
    lounges: a.lounges.length,
    stands: 12 + Math.floor(r() * 30),
    dailySectors: a.hub ? 34 + Math.floor(r() * 26) : 2 + Math.floor(r() * 12),
    minConnect: a.transitMin,
    status: r() > 0.9 ? 'Adverse weather' : r() > 0.82 ? 'Ramp congestion' : 'Normal ops',
    otp: Math.round(72 + r() * 24),
  };
});

export const ADMIN_AIRCRAFT = [
  { reg: '9G-AIN', type: 'A330-900neo', msn: '2418', year: 2022, base: 'ACC', status: 'In service · AN 204', hours: 11840, cycles: 2610, nextCheck: 'A-check · 12 Nov', config: '30J / 21W / 211Y', load: 84 },
  { reg: '9G-AIX', type: '787-9', msn: '68211', year: 2024, base: 'ACC', status: 'In service · AN 240', hours: 4120, cycles: 790, nextCheck: 'C-check · 3 Feb', config: '36J / 24W / 184Y', load: 79 },
  { reg: '9G-AKQ', type: 'A321neo', msn: '11204', year: 2023, base: 'NBO', status: 'In service · AN 300', hours: 6980, cycles: 3110, nextCheck: 'A-check · 27 Sep', config: '16J / 24W / 152Y', load: 91 },
  { reg: '9G-ANR', type: 'A320neo', msn: '9988', year: 2021, base: 'ACC', status: 'Maintenance · A-check', hours: 14210, cycles: 7420, nextCheck: 'Completion 15 Sep', config: '12J / 144Y', load: 0 },
  { reg: '9G-ATC', type: 'A330-900neo', msn: '2560', year: 2023, base: 'JNB', status: 'In service · AN 516', hours: 7310, cycles: 1520, nextCheck: 'A-check · 8 Dec', config: '30J / 21W / 211Y', load: 88 },
  { reg: '9G-AVL', type: '787-9', msn: '68902', year: 2025, base: 'ACC', status: 'In service · AN 812', hours: 940, cycles: 172, nextCheck: 'First A · 19 Oct', config: '36J / 24W / 184Y', load: 76 },
  { reg: '9G-AZD', type: 'A321neo', msn: '11560', year: 2024, base: 'LOS', status: 'AOG · hydraulic BITE', hours: 3290, cycles: 1480, nextCheck: 'Parts ETA 14:20', config: '16J / 24W / 152Y', load: 0 },
];

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  tier: string;
  points: number;
  yqp: number;
  segments: number;
  bookings: number;
  spend: number;
  since: string;
  lastActive: string;
  status: 'Active' | 'Dormant' | 'Frozen' | 'Churn risk';
  market: string;
  nps: number;
}

export const ADMIN_CUSTOMERS: AdminCustomer[] = Array.from({ length: 32 }, (_, i) => {
  const r = rng(hash('cust' + i));
  const name = `${FIRST[Math.floor(r() * FIRST.length)]} ${LAST[Math.floor(r() * LAST.length)]}`;
  const tiers = ['Explorer', 'Explorer', 'Voyager', 'Voyager', 'Elite', 'Elite Plus'];
  return {
    id: `C${50120 + i}`,
    name,
    email: `${name.split(' ')[0].toLowerCase()}${Math.floor(r() * 90)}@${r() > 0.6 ? 'gmail.com' : 'outlook.com'}`,
    tier: tiers[Math.floor(r() * tiers.length)],
    points: Math.round(r() * 148000),
    yqp: Math.round(r() * 128000),
    segments: Math.round(r() * 96),
    bookings: 1 + Math.round(r() * 24),
    spend: Math.round(220 + r() * 24800),
    since: toISODate(new Date(Date.now() - (200 + Math.floor(r() * 3200)) * 86400000)).slice(0, 7),
    lastActive: toISODate(new Date(Date.now() - Math.floor(r() * 90) * 86400000)),
    status: r() > 0.86 ? 'Churn risk' : r() > 0.78 ? 'Dormant' : r() > 0.74 ? 'Frozen' : 'Active',
    market: ['GH', 'NG', 'KE', 'ZA', 'US', 'GB', 'AE'][Math.floor(r() * 7)],
    nps: 6 + Math.floor(r() * 5),
  };
});

export const ADMIN_PAYMENTS = Array.from({ length: 26 }, (_, i) => {
  const r = rng(hash('pay' + i));
  const methods = ['Visa •••• 4417', 'MC •••• 8802', 'Amex •••• 1004', 'M-Pesa', 'MTN MoMo', 'Bank transfer', 'Apple Pay', 'GPay'];
  const stat = ['Captured', 'Captured', 'Captured', 'Authorised', 'Settled', 'Failed — 51', 'Refunded', 'Captured'];
  const amt = Math.round((60 + r() * 4200) * 100) / 100;
  return {
    id: `P${781100 + i}`,
    ref: ADMIN_BOOKINGS[i % ADMIN_BOOKINGS.length].ref,
    method: methods[Math.floor(r() * methods.length)],
    amount: amt,
    currency: r() > 0.55 ? 'USD' : ['GHS', 'NGN', 'KES', 'ZAR', 'EUR'][Math.floor(r() * 5)],
    status: stat[Math.floor(r() * stat.length)],
    psp: ['NovaPay', 'Flutterwave', 'Adyen', 'Paystack'][Math.floor(r() * 4)],
    auth: `${Math.floor(r() * 899999 + 100000)}`,
    time: `${String(Math.floor(r() * 24)).padStart(2, '0')}:${String(Math.floor(r() * 60)).padStart(2, '0')}`,
    date: toISODate(new Date(Date.now() - Math.floor(r() * 12) * 86400000)),
    fee: Math.round(amt * (0.011 + r() * 0.012) * 100) / 100,
  };
});

export const ADMIN_REFUNDS = Array.from({ length: 14 }, (_, i) => {
  const r = rng(hash('ref' + i));
  const reasons = ['Flight cancelled by carrier', 'Medical — documentation accepted', 'Duplicate charge', 'Visa denial', 'Fare rules — Flex to wallet', 'Schedule change > 6 h', 'Bank charge-back dispute'];
  const stat = ['Approved', 'Paid', 'Pending review', 'Partially approved', 'Declined', 'Pending docs'];
  const amount = Math.round((90 + r() * 2400) * 100) / 100;
  return {
    id: `R${3300 + i}`,
    ref: ADMIN_BOOKINGS[(i * 3) % ADMIN_BOOKINGS.length].ref,
    passenger: ADMIN_BOOKINGS[(i * 3) % ADMIN_BOOKINGS.length].passenger,
    amount,
    method: r() > 0.4 ? 'Original card' : 'Travel wallet',
    reason: reasons[Math.floor(r() * reasons.length)],
    status: stat[Math.floor(r() * stat.length)],
    age: `${Math.floor(r() * 13)}d`,
    sla: Math.round(r() * 100),
    agent: ['A. Tetteh', 'J. Mwangi', 'System', 'P. Dlamini', 'L. Abiodun'][Math.floor(r() * 5)],
  };
});

export const ADMIN_BAGGAGE = Array.from({ length: 16 }, (_, i) => {
  const r = rng(hash('bag' + i));
  const kinds = ['Delayed (AHX)', 'Damaged', 'Missing — 4 days', 'Delivered', 'Short-shipped', 'Contents claim', 'Found, unmatched'];
  const stat = ['Tracing', 'Located', 'Awaiting customs', 'Closed — delivered', 'Valuation sent', 'Payment approved'];
  return {
    id: `BAG-${10400 + i * 7}`,
    pnr: ADMIN_BOOKINGS[i % ADMIN_BOOKINGS.length].ref,
    tag: `${String(22100 + Math.floor(r() * 8000)).padStart(6, '0')}`,
    desc: ['Grey Samsonite 75cm', 'Red cabin trolley + garment bag', 'Blue North Face duffel', 'Leather holdall, brass tags', 'Child’s bicycle, boxed', 'Hard case, cello'][Math.floor(r() * 6)],
    station: ['ACC', 'NBO', 'JNB', 'LOS', 'LHR', 'DXB'][Math.floor(r() * 6)],
    kind: kinds[Math.floor(r() * kinds.length)],
    status: stat[Math.floor(r() * stat.length)],
    age: `${Math.floor(r() * 19) + 1}d`,
    value: Math.round(200 + r() * 2400),
    owner: ADMIN_BOOKINGS[(i * 2 + 1) % ADMIN_BOOKINGS.length].passenger,
  };
});

export const ADMIN_TICKETS = Array.from({ length: 18 }, (_, i) => {
  const r = rng(hash('sup' + i));
  const subjects = [
    'Bag never arrived in Lagos', 'Charged twice on booking', 'Wheelchair not at gate in Nairobi',
    'Seat changed after paying for exit row', 'Refund not received after 14 days', 'Missed connection — hotel?',
    'Infant bassinet not confirmed', 'Cabin crew commendation', 'Lounge access denied at Elite',
    'Ticket name correction', 'Visa denial — refund request', 'Power bank confiscated, can I have it back',
    'App check-in fails for group booking', 'Damaged instrument claim', 'Upgrade certificate not applied',
    'Lost item on AN 512', 'Involuntary reroute via Dubai', 'Corporate invoice dispute',
  ];
  const cats = ['Baggage', 'Payments', 'Assistance', 'Seating', 'Refunds', 'IROPS', 'Family', 'Loyalty', 'Loyalty', 'Booking', 'Refunds', 'Dangerous goods', 'Digital', 'Baggage', 'Loyalty', 'Lost property', 'IROPS', 'Billing'];
  const pri = ['Low', 'Normal', 'Normal', 'High', 'Urgent', 'Normal', 'Low', 'Low', 'Normal', 'Normal', 'High', 'Low', 'Normal', 'High', 'Normal', 'Low', 'Urgent', 'Normal'];
  const st = ['Open', 'In progress', 'Awaiting customer', 'Resolved', 'Escalated', 'In progress', 'Open'];
  return {
    id: `T-${4410 + i}`,
    subject: subjects[i],
    category: cats[i],
    priority: pri[i],
    status: st[Math.floor(r() * st.length)],
    channel: ['Email', 'In-app chat', 'Phone', 'Twitter/X', 'Airport desk'][Math.floor(r() * 5)],
    customer: ADMIN_CUSTOMERS[i % ADMIN_CUSTOMERS.length].name,
    ref: ADMIN_BOOKINGS[i % ADMIN_BOOKINGS.length].ref,
    age: `${Math.floor(r() * 40) + (i % 3)}h`,
    sla: Math.round(18 + r() * 78),
    agent: ['Adwoa K.', 'Mwangi N.', 'Sipho D.', 'Unassigned', 'Farai T.'][Math.floor(r() * 5)],
    csat: r() > 0.5 ? 4 + Math.round(r()) : Math.round(r() * 3) + 1,
  };
});

export const ADMIN_CONTENT = Array.from({ length: 12 }, (_, i) => {
  const r = rng(hash('cms' + i));
  const types = ['Banner', 'Offer', 'Destination page', 'Travel info article', 'Homepage tile', 'Push campaign', 'FAQ entry'];
  const st = ['Published', 'Draft', 'In review', 'Scheduled', 'Published', 'Archived'];
  return {
    id: `CMS-${200 + i}`,
    title: [
      'Hero — Accra winter bank', 'Business 40% off DXB', 'Zanzibar weekend escape', 'Baggage allowance update',
      'Loyalty: double points March', 'New: Nairobi nap pods', 'Visa info — Nigeria e-visa', 'Galaxy Lounge menu refresh',
      'Student fare verification flow', 'A321neo premium cabin story', 'IRROPS duty-of-care notice', 'App check-in copy A/B',
    ][i],
    type: types[Math.floor(r() * types.length)],
    status: st[Math.floor(r() * st.length)],
    owner: ['Brand', 'Commercial', 'Comms', 'Support', 'Digital'][Math.floor(r() * 5)],
    updated: toISODate(new Date(Date.now() - Math.floor(r() * 30) * 86400000)),
    views: Math.floor(r() * 240000),
    langs: 1 + Math.floor(r() * 5),
  };
});

export const ADMIN_USERS = Array.from({ length: 14 }, (_, i) => {
  const r = rng(hash('usr' + i));
  const roles = ['Super admin', 'Ops controller', 'Revenue manager', 'Support agent', 'Station manager', 'Finance', 'Content editor', 'Crew scheduler', 'Auditor'];
  const name = `${FIRST[Math.floor(r() * FIRST.length)]} ${LAST[Math.floor(r() * LAST.length)]}`;
  return {
    id: `U-${1010 + i}`,
    name,
    email: `${name.split(' ')[0].toLowerCase()}@aeronova.aero`,
    role: roles[Math.floor(r() * roles.length)],
    station: ['ACC', 'NBO', 'JNB', 'LOS', 'Remote'][Math.floor(r() * 5)],
    mfa: r() > 0.18,
    lastLogin: `${['4 min', '22 min', '1 h', 'yesterday', '3 days'][Math.floor(r() * 5)]} ago`,
    status: r() > 0.9 ? 'Suspended' : 'Active',
    sessions: 1 + Math.floor(r() * 3),
  };
});

export const ADMIN_ROLES = [
  { role: 'Super admin', people: 3, scopes: ['All modules', 'Dangerous goods override', 'User & role management'], danger: true, approvals: 'Self-approving blocked above USD 2,000' },
  { role: 'Ops controller', people: 22, scopes: ['Flights', 'Aircraft', 'Gates', 'Crew assignment', 'Flight status'], danger: false, approvals: 'Cannot change fares or refunds' },
  { role: 'Station manager', people: 41, scopes: ['Own station flights', 'Baggage', 'Assistance', 'Passengers'], danger: false, approvals: 'Refunds to USD 400' },
  { role: 'Revenue manager', people: 12, scopes: ['Fares', 'Offers', 'Analytics', 'Inventory'], danger: false, approvals: 'Fare changes need Commercial sign-off' },
  { role: 'Support agent', people: 118, scopes: ['Bookings (read + service)', 'Refunds to USD 250', 'Baggage'], danger: false, approvals: 'Anything above needs team lead' },
  { role: 'Finance', people: 16, scopes: ['Payments', 'Refunds', 'Invoices', 'PSP reconciliation'], danger: true, approvals: 'Dual approval above USD 5,000' },
  { role: 'Content editor', people: 9, scopes: ['CMS', 'Offers copy', 'Travel info'], danger: false, approvals: 'Two-person review for legal copy' },
  { role: 'Auditor (read only)', people: 4, scopes: ['Everything read-only', 'Audit logs', 'Exports'], danger: false, approvals: 'None' },
];

export const AUDIT_LOG = Array.from({ length: 26 }, (_, i) => {
  const r = rng(hash('audit' + i));
  const acts = [
    ['flight.status', 'AN 304 delayed to 14:20, cause ATC flow'],
    ['booking.rebook', 'Passenger re-protected AN 102 → AN 106'],
    ['refund.approve', 'USD 640 approved to original card'],
    ['fare.update', 'ACC–LOS Classic +USD 12 on Fri/Sun'],
    ['pnr.read', 'Lookup by last name at counter'],
    ['seat.comp', 'Exit row refunded after equipment change'],
    ['user.role', 'mfa enforced for Station Managers group'],
    ['baggage.claim', 'Valuation accepted USD 890'],
    ['offer.publish', 'Weekend Escape — Zanzibar went live'],
    ['crew.swap', 'C-3345 released, sick cover C-4512'],
    ['payment.void', 'Authorisation voided — seat map timeout'],
    ['document.update', 'Visa rule Nigeria — 6 wk notice'],
  ][Math.floor(r() * 12)];
  return {
    id: `L-${880120 + i * 13}`,
    actor: ADMIN_USERS[Math.floor(r() * ADMIN_USERS.length)].email,
    action: acts[0],
    detail: acts[1],
    ip: `41.${Math.floor(r() * 250)}.${Math.floor(r() * 250)}.${Math.floor(r() * 250)}`,
    when: `${toISODate(new Date(Date.now() - Math.floor(r() * 4) * 86400000))} ${String(Math.floor(r() * 24)).padStart(2, '0')}:${String(Math.floor(r() * 60)).padStart(2, '0')}`,
    result: r() > 0.94 ? 'DENIED' : r() > 0.9 ? 'REQUIRES_APPROVAL' : 'OK',
    risk: r() > 0.88 ? 'high' : r() > 0.6 ? 'medium' : 'low',
  };
});

export const ADMIN_LOYALTY_ROWS = ADMIN_CUSTOMERS.slice(0, 20).map((c, i) => ({
  id: c.id,
  member: c.name,
  number: `${1000 + i * 733} ${c.tier.slice(0, 2).toUpperCase()}`,
  tier: c.tier,
  points: c.points,
  expiry: toISODate(new Date(Date.now() + (30 + i * 11) * 86400000)).slice(0, 7),
  nextTierIn: Math.max(0, (i % 4 === 0 ? 0 : 12000 + i * 940 - (c.points % 12000))),
  earned30: Math.round(c.points * 0.04),
  burned: Math.round(c.points * (i % 3 ? 0.02 : 0.11)),
  status: i % 9 === 0 ? 'Under review' : 'Good standing',
}));

export const ADMIN_FARES = [
  { route: 'ACC–LOS', cabin: 'Economy', fare: 'Light', price: 179, mult: 1, bags: 0, refund: 'No', changes: 'No', load: 88, seats: 14, competitor: 164 },
  { route: 'ACC–LOS', cabin: 'Economy', fare: 'Classic', price: 239, mult: 1.34, bags: 1, refund: 'No', changes: '$75', load: 84, seats: 21, competitor: 228 },
  { route: 'ACC–LOS', cabin: 'Economy', fare: 'Flex', price: 307, mult: 1.72, bags: 2, refund: 'Wallet', changes: 'Free', load: 61, seats: 30, competitor: 315 },
  { route: 'ACC–LHR', cabin: 'Economy', fare: 'Classic', price: 649, mult: 1.34, bags: 1, refund: 'No', changes: '$95', load: 86, seats: 18, competitor: 612 },
  { route: 'ACC–LHR', cabin: 'Business', fare: 'Nova Business', price: 2840, mult: 4.35, bags: 3, refund: 'Yes', changes: 'Free', load: 74, seats: 7, competitor: 2610 },
  { route: 'NBO–JNB', cabin: 'Economy', fare: 'Classic', price: 289, mult: 1.34, bags: 1, refund: 'No', changes: '$75', load: 79, seats: 26, competitor: 264 },
  { route: 'ACC–NBO', cabin: 'Premium', fare: 'Premium Economy', price: 596, mult: 2.5, bags: 2, refund: 'Yes', changes: 'Free', load: 68, seats: 12, competitor: 0 },
  { route: 'CPT–JNB', cabin: 'Economy', fare: 'Light', price: 158, mult: 1, bags: 0, refund: 'No', changes: 'No', load: 91, seats: 9, competitor: 139 },
  { route: 'ACC–DXB', cabin: 'Business', fare: 'Nova Business', price: 1740, mult: 4.35, bags: 3, refund: 'Yes', changes: 'Free', load: 71, seats: 11, competitor: 1980 },
  { route: 'ACC–JFK', cabin: 'Economy', fare: 'Flex', price: 1108, mult: 1.72, bags: 2, refund: 'Wallet', changes: 'Free', load: 80, seats: 22, competitor: 1195 },
];

export const ADMIN_FARES_HISTORY = Array.from({ length: 24 }, (_, i) => {
  const r = rng(hash('fh' + i));
  return { day: `${i + 1}`, acclos: Math.round(172 + r() * 44), acclhr: Math.round(610 + r() * 130), nbojnb: Math.round(264 + r() * 60) };
});

export const ANALYTICS_EXTRA = {
  funnel: [
    { step: 'Search', value: 100, note: '412,880 sessions' },
    { step: 'Results viewed', value: 74, note: '305,130' },
    { step: 'Flight selected', value: 41, note: '169,280' },
    { step: 'Passenger data', value: 27, note: '111,480' },
    { step: 'Payment started', value: 16.4, note: '67,712' },
    { step: 'Ticket issued', value: 9.2, note: '37,985' },
  ],
  markets: [
    { market: 'Ghana', share: 28, rev: 1.76, yoy: 6.4 },
    { market: 'Nigeria', share: 19, rev: 1.21, yoy: 11.2 },
    { market: 'Kenya', share: 15, rev: 0.94, yoy: 3.1 },
    { market: 'South Africa', share: 13, rev: 0.83, yoy: -2.4 },
    { market: 'United Kingdom', share: 8, rev: 0.61, yoy: 9.8 },
    { market: 'UAE', share: 6, rev: 0.44, yoy: 18.4 },
    { market: 'United States', share: 5, rev: 0.38, yoy: 24.1 },
    { market: 'Rest', share: 6, rev: 0.31, yoy: 5.2 },
  ],
  devices: [
    { name: 'iOS', value: 38 },
    { name: 'Android', value: 34 },
    { name: 'Desktop', value: 21 },
    { name: 'Tablet', value: 7 },
  ],
  satisfaction: Array.from({ length: 12 }, (_, i) => {
    const r = rng(hash('nps' + i));
    return { month: MONTHS[i], nps: Math.round(-4 + r() * 30), csat: Math.round((3.9 + r() * 0.75) * 100) / 100, complaints: Math.round(1.4 + r() * 1.6) };
  }),
  ops: {
    otp: 87.9,
    delays: 8.6,
    cancels: 0.62,
    aog: 3,
    turnAvg: 47,
    irregular: 128,
  },
};

export const DEMO_LOGIN = {
  admin: { email: 'ops@aeronova.aero', name: 'Adwoa Kirkland-Adeyemi', role: 'Ops controller', station: 'ACC' },
  customer: {
    email: 'ama.mensah@example.com',
    name: 'Ama Mensah',
    tier: 'Elite',
    points: 78420,
    yqp: 54180,
    segments: 47,
    since: '2019-04-18',
  },
};
