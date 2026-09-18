import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, CalendarClock, ChevronRight, Clock, Gauge, PlaneTakeoff, RefreshCw, TriangleAlert, Users, Wallet, Wrench } from 'lucide-react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from 'recharts';
import { cx, durationLabel, fmtDate, money, relativeDay, toISODate } from '../../lib/utils';
import { ADMIN_AIRCRAFT, ADMIN_FLIGHTS, ADMIN_REFUNDS, ADMIN_TICKETS, BOOKINGS_BY_DAY, CABIN_MIX, LOAD_FACTOR_SERIES, PUNCTUALITY_SERIES, REVENUE_SERIES, TOP_ROUTES } from '../../data/admin';
import { statusBoard } from '../../data/flights';
import { AdminPage, BarList, Panel } from './AdminApp';
import { Badge, Button, Divider, StatusBadge } from '../../components/ui/Primitives';
import { KpiCard } from '../../components/ui/Table';
import { useStore } from '../../store/store';

const AXIS = { fontSize: 11, fill: '#7A8798' } as const;
const tipStyle = { borderRadius: 12, border: '1px solid #E1E8F0', fontSize: 12, fontFamily: 'Inter, sans-serif', boxShadow: '0 12px 28px rgba(11,35,64,.12)' };

export function AdminDashboard() {
  const nav = useNavigate();
  const { toast } = useStore();
  const [range, setRange] = useState<'24h' | '7d' | '30d' | 'qtd'>('24h');
  const board = statusBoard(toISODate(new Date()), 'ACC');
  const aog = ADMIN_AIRCRAFT.filter((a) => a.status.includes('AOG') || a.status.includes('Maintenance'));
  const urgent = ADMIN_TICKETS.filter((t) => t.priority === 'Urgent' || t.status === 'Escalated');
  const refundQueue = ADMIN_REFUNDS.filter((r) => r.status.startsWith('Pending'));

  return (
    <AdminPage
      title="Operations dashboard"
      lead={`Accra control · ${toISODate(new Date())} · 34 sectors scheduled, 2 aircraft on ground, 6 refunds past their SLA.`}
      actions={
        <>
          <div className="flex items-center gap-1 rounded-[10px] border border-[#E1E8F0] bg-white p-[3px]">
            {(['24h', '7d', '30d', 'qtd'] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)} className={cx('rounded-[7px] px-2.5 py-1 text-[.75rem] font-semibold uppercase tracking-wide transition', range === r ? 'bg-[#0B2340] text-white' : 'text-ink-500 hover:text-navy-800')}>
                {r}
              </button>
            ))}
          </div>
          <Button size="sm" variant="secondary" icon={<RefreshCw size={14} />} onClick={() => toast({ tone: 'success', title: 'Feed refreshed', body: 'Board, load factors and delay codes re-pulled from ops.' })}>
            Refresh
          </Button>
          <Button size="sm" icon={<CalendarClock size={14} />} onClick={() => nav('/admin/flights')}>
            Open flight control
          </Button>
        </>
      }
    >
      {/* KPI strip */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard label="Departures today" value="34" note={`${ADMIN_FLIGHTS.filter((f) => f.status === 'BOARDING').length} boarding · 2 delayed`} icon={<PlaneTakeoff size={15} />} spark={PUNCTUALITY_SERIES.slice(-8).map((p) => p.otp)} />
        <KpiCard label="On-time (15 min)" value="87.9%" delta={1.4} tone="teal" note="rolling 30 days" icon={<Gauge size={15} />} spark={PUNCTUALITY_SERIES.filter((_, i) => i % 2 === 0).map((p) => p.otp)} />
        <KpiCard label="Load factor" value="83.4%" delta={0.8} tone="sky" note="premium 71.2% · economy 85.9%" icon={<Users size={15} />} spark={LOAD_FACTOR_SERIES.map((l) => l.load)} />
        <KpiCard label="Revenue, today" value={money(9.42e6 / 24 * 17, 'USD')} delta={6.1} tone="gold" note="17 of 24 hours elapsed · target USD 9.4M" icon={<Wallet size={15} />} spark={REVENUE_SERIES.slice(-6).map((r) => r.passenger)} />
        <KpiCard label="AOG / maintenance" value={String(aog.length)} tone="ember" note="9G-AZD hydraulic · 9G-ANR A-check" icon={<Wrench size={15} />} />
        <KpiCard label="Open cases" value={String(ADMIN_TICKETS.filter((t) => t.status !== 'Resolved').length)} tone="red" note={`${urgent.length} urgent · SLA 94% met`} icon={<TriangleAlert size={15} />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* revenue chart */}
        <Panel
          title="Revenue by stream"
          lead={range === '24h' ? 'Hourly, USD millions · today versus target' : 'Monthly, USD millions · trailing 12'}
          right={
            <div className="flex items-center gap-3 text-[.6875rem]">
              {[
                ['#0B2340', 'Passenger'],
                ['#0FA79A', 'Cargo'],
                ['#C99A3B', 'Ancillary'],
              ].map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5 text-ink-500">
                  <span className="h-2 w-2 rounded-sm" style={{ background: c }} /> {l}
                </span>
              ))}
            </div>
          }
        >
          <div className="h-[268px]">
            <ResponsiveContainer>
              <AreaChart data={range === '24h' ? BOOKINGS_BY_DAY.slice(-14).map((b) => ({ month: b.day, passenger: Math.round(b.web / 90), cargo: Math.round(b.agency / 90), ancillary: Math.round(b.mobile / 120) })) : REVENUE_SERIES} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B2340" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#0B2340" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0FA79A" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0FA79A" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#EDF1F6" vertical={false} />
                <XAxis dataKey={range === '24h' ? 'month' : 'month'} tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} width={54} />
                <RTooltip contentStyle={tipStyle} formatter={(v: number) => [money(v * 1e6 / (range === '24h' ? 1 : 1)), 'USD']} />
                <Area type="monotone" dataKey="passenger" stackId="1" stroke="#0B2340" strokeWidth={2} fill="url(#g1)" />
                <Area type="monotone" dataKey="cargo" stackId="1" stroke="#0FA79A" strokeWidth={2} fill="url(#g2)" />
                <Area type="monotone" dataKey="ancillary" stackId="1" stroke="#C99A3B" strokeWidth={1.6} fill="#C99A3B" fillOpacity={0.14} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <Divider className="mt-3" />
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              ['vs target', '+2.1%', 'teal'],
              ['cargo yield', '+14% budget', 'gold'],
              ['ancillary per pax', money(41.2), 'sky'],
            ].map(([k, v, tone]) => (
              <div key={k as string} className="rounded-[10px] bg-[#F7FAFC] px-3 py-2">
                <p className="text-[.625rem] uppercase tracking-[0.12em] text-ink-400">{k}</p>
                <p className={cx('num mt-0.5 font-display text-[.9375rem] font-semibold', tone === 'teal' ? 'text-teal-700' : tone === 'gold' ? 'text-gold-600' : 'text-sky-700')}>{v}</p>
              </div>
            ))}
          </div>
        </Panel>

        {/* live departures */}
        <Panel
          title="Galaxy T1 departures"
          lead="Live from the station feed"
          right={
            <Button size="sm" variant="ghost" onClick={() => nav('/admin/flights')}>
              All 34 <ChevronRight size={13} />
            </Button>
          }
          pad={false}
        >
          <ul className="divide-y divide-[#EDF1F6]">
            {board.slice(0, 7).map((f) => (
              <li key={f.flightNo} className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-[#F7FAFC]">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-[#0B2340] font-display text-[.625rem] font-bold text-gold-400">AN</span>
                <span className="min-w-0 flex-1">
                  <span className="num block text-[.875rem] font-semibold text-[#0B2340]">
                    {f.flightNo} · {f.destination}
                  </span>
                  <span className="block text-[.6875rem] text-ink-400">
                    {new Date(f.schedDep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · gate {f.gate} · {f.loadFactor}% full · {f.registration}
                  </span>
                </span>
                <StatusBadge status={f.status} className="!text-[.5625rem]" />
              </li>
            ))}
          </ul>
          <div className="border-t border-[#E1E8F0] bg-[#F7FAFC] px-4 py-2.5">
            <p className="flex items-center gap-2 text-[.75rem] text-ink-500">
              <AlertTriangle size={13} className="text-gold-600" /> 3 sectors need a gate change pushed — the boards are still showing A-gate.
              <button onClick={() => toast({ tone: 'success', title: 'Gate changes pushed', body: '3 messages sent to 428 passengers; SMS fallback queued.' })} className="ml-auto font-semibold text-sky-700 hover:underline">
                Push now
              </button>
            </p>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr]">
        <Panel title="Punctuality, 30 days" lead="15-minute rule · bars are delay count">
          <div className="h-[190px]">
            <ResponsiveContainer>
              <LineChart data={PUNCTUALITY_SERIES} margin={{ top: 6, right: 6, bottom: 0, left: -24 }}>
                <CartesianGrid stroke="#EDF1F6" vertical={false} />
                <XAxis dataKey="day" tick={AXIS} axisLine={false} tickLine={false} interval={4} />
                <YAxis domain={[70, 100]} tick={AXIS} axisLine={false} tickLine={false} width={40} />
                <RTooltip contentStyle={tipStyle} />
                <Line type="monotone" dataKey="otp" stroke="#0FA79A" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="delays" stroke="#C99A3B" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[.75rem] leading-relaxed text-ink-400">Best day 12 Sep at 94.1%. The dip on 4 Sep was a Lagos ramp strike; we re-protected 611 passengers and paid the hotel without being asked.</p>
        </Panel>

        <Panel title="Cabin mix" lead="Seats sold, rolling 7 days">
          <div className="flex items-center gap-4">
            <div className="h-[176px] w-[176px] shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={CABIN_MIX} dataKey="value" nameKey="name" innerRadius={44} outerRadius={78} paddingAngle={2} stroke="none">
                    {CABIN_MIX.map((c) => (
                      <Cell key={c.name} fill={c.colour} />
                    ))}
                  </Pie>
                  <RTooltip contentStyle={tipStyle} formatter={(v: number) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="min-w-0 flex-1 space-y-1.5">
              {CABIN_MIX.map((c) => (
                <li key={c.name} className="flex items-center gap-2 text-[.8125rem]">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: c.colour }} />
                  <span className="min-w-0 flex-1 truncate text-ink-600">{c.name}</span>
                  <span className="num font-semibold text-[#0B2340]">{c.value}%</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-2 text-[.75rem] text-ink-400">Premium cabin share up 1.8 points month on month, driven by the Dubai business sale.</p>
        </Panel>

        <Panel title="Top routes by revenue" lead="USD millions · load factor · yield cents/seat-km">
          <BarList
            rows={TOP_ROUTES.slice(0, 6).map((r) => ({
              label: (
                <span className="flex items-center gap-2">
                  {r.route}
                  <span className={cx('num rounded-pill px-1.5 text-[.625rem] font-semibold', r.delta >= 0 ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-600')}>
                    {r.delta >= 0 ? '+' : ''}
                    {r.delta}%
                  </span>
                </span>
              ),
              value: Math.round(r.revenue * 100),
              note: `${r.bookings.toLocaleString()} bookings · ${r.load}% load · ${r.yield.toFixed(3)} yield`,
            }))}
            money={false}
          />
          <button onClick={() => nav('/admin/fares')} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-[#E1E8F0] py-2 text-[.8125rem] font-semibold text-[#0B2340] transition hover:bg-[#F7FAFC]">
            Open fare management <ArrowUpRight size={13} />
          </button>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_1fr]">
        <Panel title="Queue needing action" lead="Ordered by how late we already are" pad={false}>
          <ul className="divide-y divide-[#EDF1F6]">
            {[
              { t: `${refundQueue.length} refunds pending review`, d: 'Oldest 13 days · R3300 waiting on documents', to: '/admin/refunds', tone: 'gold' as const },
              { t: `${urgent.length} urgent support cases`, d: 'Damaged instrument, wheelchair missed, duplicate charge', to: '/admin/support', tone: 'ember' as const },
              { t: `${aog.length} aircraft out of service`, d: '9G-AZD parts ETA 14:20 · 9G-ANR A-check complete 15 Sep', to: '/admin/aircraft', tone: 'navy' as const },
              { t: '2 content items in review', d: 'Baggage policy update and the Lagos visa note', to: '/admin/content', tone: 'sky' as const },
              { t: '1 seat-map conflict', d: 'A321 rows 20–21 exit seats double-sold after swap', to: '/admin/bookings', tone: 'red' as const },
            ].map((x) => (
              <li key={x.t}>
                <button onClick={() => nav(x.to)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#F7FAFC]">
                  <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-[9px]', x.tone === 'gold' ? 'bg-gold-100 text-gold-600' : x.tone === 'ember' ? 'bg-ember-100 text-ember-700' : x.tone === 'red' ? 'bg-red-50 text-red-600' : x.tone === 'sky' ? 'bg-sky-100 text-sky-800' : 'bg-[#0B2340] text-white')}>
                    <Clock size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[.875rem] font-semibold text-[#0B2340]">{x.t}</span>
                    <span className="block truncate text-[.75rem] text-ink-400">{x.d}</span>
                  </span>
                  <ChevronRight size={15} className="shrink-0 text-ink-300" />
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Bookings by day" lead="Volume across web, app and agency">
          <div className="h-[190px]">
            <ResponsiveContainer>
              <BarChart data={BOOKINGS_BY_DAY} margin={{ top: 6, right: 6, bottom: 0, left: -22 }}>
                <CartesianGrid stroke="#EDF1F6" vertical={false} />
                <XAxis dataKey="day" tick={{ ...AXIS, fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} width={44} />
                <RTooltip contentStyle={tipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="web" stackId="a" fill="#0B2340" radius={[0, 0, 0, 0]} />
                <Bar dataKey="mobile" stackId="a" fill="#0FA79A" />
                <Bar dataKey="agency" stackId="a" fill="#C99A3B" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Latest passenger touches" lead="Across every channel, newest first" pad={false}>
          <ul className="divide-y divide-[#EDF1F6]">
            {[
              { n: 'A. Mensah', t: 'Asked for a cello cabin seat on AN 512', w: '2 min ago', tone: 'sky' as const },
              { n: 'B. Ochieng', t: 'Checked in · 2 bags · seat 14C kept', w: '6 min ago', tone: 'teal' as const },
              { n: 'T. Chikwava', t: 'Refund approved USD 640 to card', w: '18 min ago', tone: 'teal' as const },
              { n: 'L. Abiodun', t: 'Rebooked after the Lagos ATC delay', w: '31 min ago', tone: 'navy' as const },
              { n: 'S. Dube', t: 'Complaint: lounge denied at Elite, escalated', w: '44 min ago', tone: 'ember' as const },
              { n: 'K. Njoroge', t: 'Wheelchair requested for NBO arrival', w: '1 h ago', tone: 'sky' as const },
            ].map((x) => (
              <li key={x.n + x.w} className="flex items-start gap-3 px-4 py-2.5">
                <span className={cx('mt-0.5 h-2 w-2 shrink-0 rounded-full', x.tone === 'teal' ? 'bg-teal-500' : x.tone === 'ember' ? 'bg-ember-500' : x.tone === 'sky' ? 'bg-sky-500' : 'bg-[#0B2340]')} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[.8125rem] font-semibold text-[#0B2340]">{x.n}</span>
                  <span className="block text-[.75rem] leading-snug text-ink-500">{x.t}</span>
                </span>
                <span className="shrink-0 text-[.6875rem] text-ink-400">{x.w}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-[#E1E8F0] bg-[#F7FAFC] px-4 py-2.5">
            <Badge tone="neutral">{relativeDay(new Date(Date.now() - 3600000).toISOString())} · 1,284 interactions logged</Badge>
            <button onClick={() => nav('/admin/support')} className="float-right text-[.75rem] font-semibold text-sky-700 hover:underline">
              Open support desk
            </button>
          </div>
        </Panel>
      </div>

      <Panel title="Irregular operations board" lead="Anything a supervisor needs to see in the next two hours" pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-[.8125rem]">
            <thead>
              <tr className="border-b border-[#E1E8F0] text-2xs uppercase tracking-wider text-ink-400">
                {['Sector', 'Cause', 'Pax', 'Action taken', 'Cost', 'Next review'].map((h) => (
                  <th key={h} className="px-4 py-2 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1F6]">
              {[
                ['AN 106 LOS→ACC', 'ATC flow control 47 min', '151', 'Meals issued · 3 rebooked on Blue Ibis', money(2340), fmtDate(toISODate(new Date()), 'short') + ' 16:00'],
                ['AN 300 NBO→JNB', 'Late inbound 9G-AKQ', '188', 'Hotel for 12 · next sector 09:10', money(4120), 'tomorrow 06:00'],
                ['AN 812 ACC→IST', 'Technical: B787 APU', '204', 'Aircraft swapped to 9G-AVL, delay 2 h 10', money(8890), 'in progress'],
                ['AN 561 VFA→JNB', 'Weather at destination', '96', 'Diverted to HRE, 14 pax offloaded', money(6210), 'closed'],
              ].map((r) => (
                <tr key={r[0]} className="transition hover:bg-[#F7FAFC]">
                  <td className="px-4 py-2.5 font-semibold text-[#0B2340]">{r[0]}</td>
                  <td className="px-4 py-2.5 text-ink-600">{r[1]}</td>
                  <td className="num px-4 py-2.5">{r[2]}</td>
                  <td className="px-4 py-2.5 text-ink-600">{r[3]}</td>
                  <td className="num px-4 py-2.5 font-medium">{r[4]}</td>
                  <td className="px-4 py-2.5 text-ink-500">{r[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-[#E1E8F0] bg-[#F7FAFC] px-4 py-2.5">
          <p className="text-[.75rem] text-ink-500">Total disruption cost today {money(21560)} · 611 passengers re-protected · 34 hotels booked</p>
          <Button size="sm" variant="secondary" className="ml-auto" onClick={() => toast({ tone: 'info', title: 'Care pack sent', body: 'Meal and hotel vouchers pushed to 151 devices for AN 106.' })}>
            Send care packs
          </Button>
        </div>
      </Panel>

      <p className="pb-2 text-[.75rem] text-ink-400">
        Data is generated deterministically for {fmtDate(toISODate(new Date()), 'long')} so the console behaves the same on reload. Delay causes use our real code set: <span className="num">ATCF</span> flow control,{' '}
        <span className="num">TECH</span> technical, <span className="num">OPR</span> operations, <span className="num">WX</span> weather, <span className="num">PRV</span> private.
        {' '}Turnaround standard is {durationLabel(47 * 60000)} average narrowbody.
      </p>
    </AdminPage>
  );
}
