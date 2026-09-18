import { useState } from 'react';
import { Activity, AlertTriangle, Bell, Check, ChevronRight, Clock, Columns3, Download, Eye, FileText, Filter, Globe, KeyRound, Layers, Lock, Map, MoreHorizontal, Palette, Pencil, PieChart, Plus, RefreshCw, Rocket, Save, Search, Shield, ShieldCheck, SlidersHorizontal, Trash2, Users as UsersIcon, X } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart as RPieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts';
import { cx, fmtDate, money, toISODate } from '../../lib/utils';
import { ADMIN_CONTENT, ADMIN_CUSTOMERS, ADMIN_ROLES, ADMIN_USERS, ANALYTICS_EXTRA, AUDIT_LOG, CABIN_MIX, CHANNEL_MIX, LOAD_FACTOR_SERIES, PUNCTUALITY_SERIES, REVENUE_SERIES, TOP_ROUTES } from '../../data/admin';
import { DESTINATIONS } from '../../data/destinations';
import { AIRPORTS } from '../../data/airports';
import { TRAVEL_SECTIONS } from '../../data/content';
import { AdminPage, BarList, MiniTable, Panel } from './AdminApp';
import { Badge, Button, Divider, EmptyState, Meter } from '../../components/ui/Primitives';
import { DataTable, KpiCard, type Column } from '../../components/ui/Table';
import { ConfirmDialog, Menu, MenuDivider, MenuItem, Modal, Tabs } from '../../components/ui/Overlay';
import { Checkbox, Field, Input, RangeSlider, SegmentedControl, Select, Switch, TextArea } from '../../components/ui/Form';
import { useStore } from '../../store/store';

const AXIS = { fontSize: 11, fill: '#7A8798' } as const;
const tip = { borderRadius: 12, border: '1px solid #E1E8F0', fontSize: 12, fontFamily: 'Inter, sans-serif' };

/* ============================= CONTENT ============================= */
function Content() {
  const { toast } = useStore();
  const [tab, setTab] = useState<'pages' | 'banners' | 'legal'>('pages');
  const [edit, setEdit] = useState<(typeof ADMIN_CONTENT)[number] | null>(null);
  const [body, setBody] = useState('');
  const [filter, setFilter] = useState('all');
  const rows = ADMIN_CONTENT.filter((c) => filter === 'all' || c.status.toLowerCase().replace(' ', '-') === filter);

  return (
    <AdminPage
      title="Content management"
      lead="Homepage blocks, destination guides, travel-information pages, banners and the legal texts. Two-person review is enforced on anything that states a rule."
      actions={
        <>
          <Button size="sm" variant="secondary" icon={<Eye size={14} />}>
            Preview site
          </Button>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => { setEdit({ id: 'CMS-new', title: '', type: 'Banner', status: 'Draft', owner: 'Brand', updated: toISODate(new Date()), views: 0, langs: 1 }); setBody(''); }}>
            New item
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Published items" value="412" note="across 5 languages" icon={<FileText size={15} />} />
        <KpiCard label="In review" value={String(ADMIN_CONTENT.filter((c) => c.status === 'In review').length)} tone="gold" note="oldest waiting 4 days" icon={<Clock size={15} />} />
        <KpiCard label="Scheduled" value={String(ADMIN_CONTENT.filter((c) => c.status === 'Scheduled').length)} tone="sky" note="going live 06:00 GMT" icon={<Rocket size={15} />} />
        <KpiCard label="Stale content" value="9" tone="ember" note="not reviewed in 180 days" icon={<AlertTriangle size={15} />} />
        <KpiCard label="Legal texts" value="14" note="all with a published effective date" icon={<Shield size={15} />} />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'pages', label: 'Pages & tiles', count: rows.length },
          { id: 'banners', label: 'Banners & rails' },
          { id: 'legal', label: 'Legal & policy' },
        ]}
      />

      {tab === 'pages' && (
        <Panel pad={false}>
          <div className="flex flex-wrap items-center gap-2 border-b border-[#E1E8F0] px-4 py-2.5">
            {[['all', 'All'], ['draft', 'Drafts'], ['in-review', 'In review'], ['published', 'Published'], ['scheduled', 'Scheduled'], ['archived', 'Archived']].map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)} className={cx('rounded-pill border px-2.5 py-1 text-[.75rem] font-semibold transition', filter === v ? 'border-[#0B2340] bg-[#0B2340] text-white' : 'border-[#E1E8F0] text-ink-500 hover:border-navy-300')}>
                {l}
              </button>
            ))}
            <span className="num ml-auto text-[.75rem] text-ink-400">{rows.length} items</span>
          </div>
          <DataTable
            rows={rows}
            pageSize={10}
            searchable={false}
            columns={[
              { key: 'title', header: 'Item', primary: true, render: (r) => <span>{r.title}<span className="num block text-[.6875rem] font-normal text-ink-400">{r.id} · {r.type}</span></span> },
              { key: 'status', header: 'Status', render: (r) => <Badge tone={r.status === 'Published' ? 'teal' : r.status === 'In review' ? 'gold' : r.status === 'Scheduled' ? 'sky' : r.status === 'Draft' ? 'neutral' : 'ember'}>{r.status}</Badge> },
              { key: 'owner', header: 'Owner', hideBelow: 'sm' },
              { key: 'langs', header: 'Languages', align: 'right', hideBelow: 'md', render: (r) => <span className="num">{r.langs} / 5</span> },
              { key: 'views', header: 'Views 30d', align: 'right', hideBelow: 'md', render: (r) => <span className="num">{r.views.toLocaleString()}</span> },
              { key: 'updated', header: 'Updated', align: 'right', render: (r) => <span className="num">{fmtDate(r.updated, 'short')}</span> },
              {
                key: 'a',
                header: '',
                sort: false,
                align: 'right',
                render: (r) => (
                  <div className="flex justify-end gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setEdit(r); setBody(`${r.title}\n\nWritten for the ${r.owner} team. Keep it plain: what the passenger must do, when it closes, what it costs, who to tell if it goes wrong.`); }} className="rounded-[7px] border border-[#E1E8F0] px-2 py-1 text-[.6875rem] font-semibold text-ink-600 hover:border-navy-400 hover:text-navy-900">
                      <Pencil size={12} className="inline" /> Edit
                    </button>
                  </div>
                ),
              },
            ]}
            onRowClick={(r) => { setEdit(r); setBody(''); }}
          />
        </Panel>
      )}

      {tab === 'banners' && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Panel title="Homepage rails" lead="Order drives the click-through; drag-and-drop is in the visual editor">
            <ul className="space-y-2">
              {[
                { n: 'Hero — Accra winter bank', on: true, ctr: 4.2, slot: 'rotates 3' },
                { n: 'Featured fares', on: true, ctr: 6.8, slot: '3 of 8 offers' },
                { n: 'Live fare drops', on: true, ctr: 9.1, slot: '6 routes' },
                { n: 'Cabins, three ways', on: true, ctr: 3.4, slot: 'tabbed' },
                { n: 'Eid campaign', on: false, ctr: 0, slot: 'scheduled 12 Mar' },
                { n: 'App download', on: true, ctr: 1.8, slot: 'bottom' },
              ].map((r, i) => (
                <li key={r.n} className="flex flex-wrap items-center gap-3 rounded-[12px] border border-[#E1E8F0] p-3">
                  <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-[8px] bg-mist-100 text-[.6875rem] font-bold text-navy-700">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[.875rem] font-semibold text-[#0B2340]">{r.n}</span>
                    <span className="block text-[.6875rem] text-ink-400">{r.slot} · CTR {r.ctr}%</span>
                  </span>
                  <Switch checked={r.on} onChange={() => toast({ tone: r.on ? 'info' : 'success', title: `${r.n} ${r.on ? 'hidden' : 'shown'}`, body: 'Homepage updates within 30 seconds; the app tab bar within a minute.' })} label={r.n} />
                </li>
              ))}
            </ul>
          </Panel>
          <div className="space-y-4">
            <Panel title="Targeting" lead="Who sees what">
              <MiniTable head={['Rule', 'Audience', 'State']} rows={[['Hub market', 'GH, NG, KE', 'active'], ['Price sensitive', 'decile 1–4', 'active'], ['Elite and above', '41.2k', 'active'], ['First-time flyers', '18,402', 'paused'], ['Language', 'FR, PT, EN', 'active']].map((r) => r.map((c, i) => (i === 2 ? <Badge key={i} tone={c === 'active' ? 'teal' : 'neutral'}>{c}</Badge> : <span key={i}>{c}</span>)))} />
            </Panel>
            <Panel title="Image library" lead="1,284 approved assets">
              <div className="grid grid-cols-4 gap-2">
                {['hero', 'cabin-business', 'lounge', 'dining', 'fleet', 'city-accra', 'city-lagos', 'city-nairobi'].map((k) => (
                  <button key={k} onClick={() => toast({ tone: 'success', title: 'Copied asset path', body: `/img/${k}.jpg · 1600×1000 · optimised` })} className="group overflow-hidden rounded-[8px] border border-[#E1E8F0]">
                    <img src={`/img/${k}.jpg`} alt={k} className="h-14 w-full object-cover transition group-hover:scale-105" loading="lazy" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
                    <span className="block truncate bg-[#F7FAFC] px-1.5 py-1 text-[.5625rem] font-semibold uppercase tracking-wide text-ink-500">{k}</span>
                  </button>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {tab === 'legal' && (
        <Panel pad={false} title="Legal & policy documents" lead="Any change needs two approvers and a published effective date. Nothing is versionless.">
          <table className="w-full min-w-[720px] text-left text-[.8125rem]">
            <thead>
              <tr className="border-b border-[#E1E8F0] bg-[#F7FAFC] text-2xs uppercase tracking-wider text-ink-400">
                {['Document', 'Version', 'Effective', 'Owner', 'Languages', 'Next review'].map((h, i) => (
                  <th key={h} className={cx('px-3 py-2 font-semibold', i >= 2 && 'text-right')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1F6]">
              {[
                ['Contract of Carriage', 'v9.2', '2026-04-01', 'Legal', '5', 'Oct 2026'],
                ['Baggage policy', 'v6.1', '2026-08-12', 'Ops', '5', 'Feb 2027'],
                ['Fare rules & conditions', 'v4.8', '2026-06-01', 'Revenue', '3', 'Dec 2026'],
                ['Privacy notice', 'v3.4', '2026-01-15', 'Legal', '5', 'Jan 2027'],
                ['Programme rules (Rewards)', 'v4.2', '2027-01-01', 'Loyalty', '5', 'Apr 2027'],
                ['Dangerous goods', 'v2.9', '2026-03-05', 'Safety', '3', 'Sep 2026'],
                ['Accessibility statement', 'v2.0', '2026-02-20', 'Customer', '5', 'Aug 2026'],
              ].map((r) => (
                <tr key={r[0] as string} className="transition hover:bg-[#F2F7FB]">
                  <td className="px-3 py-2 font-semibold text-[#0B2340]">{r[0]}</td>
                  <td className="num px-3 py-2">{r[1]}</td>
                  <td className="num px-3 py-2 text-right">{r[2]}</td>
                  <td className="px-3 py-2 text-right text-ink-500">{r[3]}</td>
                  <td className="num px-3 py-2 text-right">{r[4]}</td>
                  <td className="px-3 py-2 text-right text-ink-500">{r[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-wrap items-center gap-2 border-t border-[#E1E8F0] px-4 py-3 text-[.75rem] text-ink-500">
            <Layers size={14} className="text-ink-400" /> Every version stays public. Passengers can read the terms they actually bought under.
          </div>
        </Panel>
      )}

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit ? edit.title || 'New item' : ''}
        subtitle={edit ? `${edit.id} · ${edit.type} · ${edit.status}` : ''}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEdit(null)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                toast({ tone: 'info', title: 'Saved as draft', body: 'Nobody else sees it until you submit for review.' });
                setEdit(null);
              }}
            >
              Save draft
            </Button>
            <Button
              onClick={() => {
                toast({ tone: 'success', title: 'Submitted for review', body: 'Two approvers assigned: Comms lead and Legal. They see your diff.' });
                setEdit(null);
              }}
            >
              Submit for review
            </Button>
          </>
        }
      >
        {edit && (
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_240px]">
            <div className="space-y-3.5">
              <Field label="Title">
                <Input defaultValue={edit.title} />
              </Field>
              <Field label="Body" hint="Short sentences. If a rule has a number in it, the number goes here, not in a PDF.">
                <TextArea rows={8} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write it like you would say it at the desk." />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Type">
                  <Select defaultValue={edit.type}>
                    {['Banner', 'Offer', 'Destination page', 'Travel info article', 'Homepage tile', 'Push campaign', 'FAQ entry'].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Publish at">
                  <Input type="datetime-local" defaultValue={`${toISODate(new Date())}T06:00`} className="num" />
                </Field>
              </div>
            </div>
            <div className="space-y-3.5">
              <div className="rounded-[12px] border border-[#E1E8F0] p-3">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-400">Placement</p>
                <div className="mt-2 space-y-2">
                  <Field label="Page">
                    <Select defaultValue="Homepage">
                      {['Homepage', 'Offers', 'Destinations', 'Travel information', 'Help centre', 'Booking flow'].map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Slot">
                    <Select defaultValue="Rail 2">
                      {['Hero', 'Rail 1', 'Rail 2', 'Rail 3', 'Footer', 'Interstitial'].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
              </div>
              <div className="rounded-[12px] border border-[#E1E8F0] p-3">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-400">Languages</p>
                <div className="mt-2 space-y-1.5">
                  {['English', 'Français', 'Português', 'Kiswahili', 'العربية'].map((l, i) => (
                    <label key={l} className="flex items-center justify-between gap-2 text-[.8125rem] text-ink-600">
                      {l}
                      <input type="checkbox" defaultChecked={i === 0} />
                    </label>
                  ))}
                </div>
              </div>
              <div className="rounded-[12px] bg-mist-50 p-3">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-400">Checklist</p>
                <div className="mt-2 space-y-2">
                  <Checkbox label="Numbers in the copy are current" defaultChecked />
                  <Checkbox label="Alt text written" defaultChecked />
                  <Checkbox label="Legal reviewed (states a rule)" />
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminPage>
  );
}

/* ============================= ANALYTICS ============================= */
function Analytics() {
  const { toast } = useStore();
  const [view, setView] = useState<'traffic' | 'revenue' | 'ops' | 'funnel'>('traffic');
  const [cmp, setCmp] = useState(true);

  return (
    <AdminPage
      title="Analytics"
      lead="Everything measured the way we publish it. Segment, compare and export — the definitions matter, so each chart states its own."
      actions={
        <>
          <Select className="h-9 w-[140px] text-[.8125rem]" defaultValue="30d" aria-label="Range">
            {[['7d', 'Last 7 days'], ['30d', 'Last 30 days'], ['90d', 'Quarter'], ['ytd', 'Year to date']].map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
          <Button size="sm" variant="secondary" icon={<Columns3 size={14} />}>
            Build a view
          </Button>
          <Button size="sm" icon={<Download size={14} />} onClick={() => toast({ tone: 'success', title: 'Export started', body: 'An .xlsx with all four tabs and the raw series will be emailed.' })}>
            Export
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Sessions" value="4.12M" delta={11.2} tone="navy" note="web 44% · app 56%" icon={<Globe size={15} />} />
        <KpiCard label="Conversion" value="9.2%" delta={0.6} tone="teal" note="search → ticket issued" />
        <KpiCard label="Revenue per session" value={money(21.4)} tone="gold" note="+$1.80 since the fare rail moved" />
        <KpiCard label="Booking value" value={money(88.4e6)} delta={6.4} tone="sky" note="30 days, all channels" />
        <KpiCard label="Complaints / 1k pax" value="1.9" delta={-8.2} tone="ember" note="lower is better" />
      </div>

      <Tabs
        value={view}
        onChange={setView}
        items={[
          { id: 'traffic', label: 'Traffic & demand' },
          { id: 'revenue', label: 'Revenue' },
          { id: 'ops', label: 'Operations' },
          { id: 'funnel', label: 'Booking funnel' },
        ]}
        className="mb-1"
      />

      {view === 'traffic' && (
        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <Panel
            title="Demand by day"
            lead="Bookings by channel · definition: a completed PNR creation, not a search"
            right={<Checkbox label="Compare to previous period" checked={cmp} onChange={setCmp} />}
          >
            <div className="h-[280px]">
              <ResponsiveContainer>
                <AreaChart data={ANALYTICS_EXTRA.funnel.map((f) => ({ stage: f.step, now: Math.round(f.value * 380), prev: Math.round(f.value * 350) }))} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="a-now" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0B2340" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#0B2340" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#EDF1F6" vertical={false} />
                  <XAxis dataKey="stage" tick={AXIS} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} width={46} />
                  <RTooltip contentStyle={tip} />
                  <Area type="monotone" dataKey="now" stroke="#0B2340" strokeWidth={2.2} fill="url(#a-now)" name="this period" />
                  {cmp && <Area type="monotone" dataKey="prev" stroke="#0FA79A" strokeWidth={1.6} strokeDasharray="4 4" fill="transparent" name="previous" />}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <div className="space-y-4">
            <Panel title="Top origins" lead="Bookings share">
              <BarList
                tone="navy"
                rows={ANALYTICS_EXTRA.markets.map((m) => ({ label: m.market, value: m.share, note: `${money(m.rev * 1e6)} · ${m.yoy >= 0 ? '+' : ''}${m.yoy}% yoy` }))}
              />
            </Panel>
            <Panel title="Device" lead="Share of completed bookings">
              <div className="h-[160px]">
                <ResponsiveContainer>
                  <RPieChart>
                    <Pie data={ANALYTICS_EXTRA.devices} dataKey="value" nameKey="name" innerRadius={38} outerRadius={64} paddingAngle={2} stroke="none">
                      {ANALYTICS_EXTRA.devices.map((_, i) => (
                        <Cell key={i} fill={['#0B2340', '#0FA79A', '#4FB1E8', '#C99A3B'][i]} />
                      ))}
                    </Pie>
                    <RTooltip contentStyle={tip} formatter={(v: number) => `${v}%`} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </RPieChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {view === 'revenue' && (
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <Panel title="Revenue, passenger vs cargo vs ancillary" lead="USD millions per month · definition: booked, not travelled">
            <div className="h-[300px]">
              <ResponsiveContainer>
                <BarChart data={REVENUE_SERIES} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                  <CartesianGrid stroke="#EDF1F6" vertical={false} />
                  <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} width={44} />
                  <RTooltip contentStyle={tip} formatter={(v: number) => money(v * 1e6)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="passenger" stackId="a" fill="#0B2340" />
                  <Bar dataKey="cargo" stackId="a" fill="#0FA79A" />
                  <Bar dataKey="ancillary" stackId="a" fill="#C99A3B" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <div className="space-y-4">
            <Panel title="Route performance" lead="Revenue USD m · yield · load">
              <div className="max-h-[220px] overflow-y-auto">
                <MiniTable head={['Route', 'Revenue', 'Yield', 'Load']} rows={TOP_ROUTES.map((r) => [r.route, money(r.revenue * 1e6), `$${r.yield.toFixed(3)}`, `${r.load}%`])} />
              </div>
            </Panel>
            <Panel title="Cabin mix" lead="Seats sold by fare family">
              <div className="space-y-2">
                {CABIN_MIX.map((c) => (
                  <div key={c.name}>
                    <p className="flex items-baseline justify-between text-[.8125rem]">
                      <span className="text-ink-600">{c.name}</span>
                      <span className="num font-semibold text-[#0B2340]">{c.value}%</span>
                    </p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-mist-200">
                      <div className="h-full rounded-full" style={{ width: `${c.value * 2}%`, background: c.colour }} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Channel mix" lead="Where the bookings came from">
              <div className="flex h-8 overflow-hidden rounded-[8px]">
                {CHANNEL_MIX.map((c, i) => (
                  <div key={c.name} className="flex items-center justify-center text-[.625rem] font-semibold text-white" style={{ width: `${c.value}%`, background: ['#0B2340', '#0FA79A', '#4FB1E8', '#C99A3B', '#8C4526'][i] }} title={`${c.name} ${c.value}%`}>
                    {c.value > 8 ? `${c.value}%` : ''}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[.75rem] text-ink-500">
                {CHANNEL_MIX.map((c) => (
                  <span key={c.name}>
                    {c.name} <span className="num font-semibold text-[#0B2340]">{c.value}%</span>
                  </span>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {view === 'ops' && (
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <Panel title="Punctuality & delay minutes" lead="15-minute rule · daily, 30 days">
            <div className="h-[290px]">
              <ResponsiveContainer>
                <AreaChart data={PUNCTUALITY_SERIES} margin={{ top: 8, right: 8, bottom: 0, left: -14 }}>
                  <CartesianGrid stroke="#EDF1F6" vertical={false} />
                  <XAxis dataKey="day" tick={{ ...AXIS, fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis yAxisId="l" domain={[70, 100]} tick={AXIS} axisLine={false} tickLine={false} width={38} />
                  <YAxis yAxisId="r" orientation="right" tick={AXIS} axisLine={false} tickLine={false} width={34} />
                  <RTooltip contentStyle={tip} />
                  <Area yAxisId="l" type="monotone" dataKey="otp" stroke="#0FA79A" strokeWidth={2.2} fill="#0FA79A" fillOpacity={0.12} name="on-time %" />
                  <Line yAxisId="r" type="monotone" dataKey="delays" stroke="#C99A3B" strokeWidth={1.6} dot={false} name="delayed sectors" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <div className="space-y-4">
            <Panel title="Load factor by month" lead="All cabins, premium and economy split">
              <div className="h-[180px]">
                <ResponsiveContainer>
                  <LineChart data={LOAD_FACTOR_SERIES} margin={{ top: 6, right: 6, bottom: 0, left: -22 }}>
                    <CartesianGrid stroke="#EDF1F6" vertical={false} />
                    <XAxis dataKey="month" tick={AXIS} axisLine={false} tickLine={false} />
                    <YAxis domain={[50, 100]} tick={AXIS} axisLine={false} tickLine={false} width={40} />
                    <RTooltip contentStyle={tip} formatter={(v: number) => `${v}%`} />
                    <Line type="monotone" dataKey="load" stroke="#0B2340" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="premium" stroke="#C99A3B" strokeWidth={1.5} dot={false} />
                    <Line type="monotone" dataKey="economy" stroke="#0FA79A" strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="Root causes" lead="Delay minutes attributed, 30 days">
              <RadarChartGuts />
            </Panel>
          </div>
        </div>
      )}

      {view === 'funnel' && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Panel title="Booking funnel" lead="Sessions, not people · definition: a search that returned at least one itinerary">
            <ul className="space-y-3">
              {ANALYTICS_EXTRA.funnel.map((f, i) => (
                <li key={f.step}>
                  <div className="flex items-baseline justify-between gap-3 text-[.875rem]">
                    <span className="font-medium text-[#0B2340]">
                      {i + 1}. {f.step}
                    </span>
                    <span className="num">
                      <span className="font-semibold text-[#0B2340]">{f.value}%</span> <span className="text-ink-400">· {f.note}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-3 overflow-hidden rounded-[5px] bg-mist-200">
                    <div className="flex h-full items-center justify-end rounded-[5px] bg-[#0B2340] px-2 text-[.625rem] font-semibold text-white" style={{ width: `${Math.max(f.value, 6)}%`, background: `linear-gradient(90deg,#0B2340,${i > 3 ? '#0FA79A' : '#1A7CB4'})` }}>
                      {f.value >= 12 ? `${f.value}%` : ''}
                    </div>
                  </div>
                  {i < ANALYTICS_EXTRA.funnel.length - 1 && (
                    <p className="mt-1 text-[.6875rem] text-ink-400">
                      −{Math.round(((ANALYTICS_EXTRA.funnel[i].value - ANALYTICS_EXTRA.funnel[i + 1].value) / ANALYTICS_EXTRA.funnel[i].value) * 100)}% lost between here and {ANALYTICS_EXTRA.funnel[i + 1].step.toLowerCase()}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
          <div className="space-y-4">
            <Panel title="Where we lose people" lead="Exit reason, sampled from 40,000 sessions">
              <BarList
                tone="ember"
                rows={[
                  { label: 'Price rose at payment', value: 28, note: 'we now honour the shown price' },
                  { label: 'Passenger name friction', value: 21, note: 'fixed with saved travellers' },
                  { label: 'Bag rules unclear', value: 17, note: 'being rewritten this quarter' },
                  { label: 'Payment declined', value: 13, note: '3DS drop-off' },
                  { label: 'Just browsing', value: 21, note: 'normal' },
                ]}
              />
            </Panel>
            <Panel title="Segment comparison" lead="Conversion by cohort">
              <MiniTable head={['Cohort', 'Sessions', 'Conv.', 'Δ']} rows={[['Recognised members', '1.42M', '12.8%', '+3.6'], ['Returning, anonymous', '1.18M', '8.1%', '+0.4'], ['New', '0.94M', '5.4%', '−0.2'], ['Corporate / TMC', '0.38M', '18.2%', '+1.1'], ['App, logged in', '0.20M', '14.6%', '+2.2']].map((r) => r.map((c, i) => (i === 3 ? <Badge key={i} tone={c.startsWith('+') ? 'teal' : c.startsWith('−') ? 'red' : 'neutral'}>{c}</Badge> : <span key={i} className={i === 0 ? 'font-medium' : 'num'}>{c}</span>)))} />
            </Panel>
          </div>
        </div>
      )}
    </AdminPage>
  );
}

function RadarChartGuts() {
  const data = [
    { c: 'ATC', min: 1420 },
    { c: 'Ramp', min: 980 },
    { c: 'Tech', min: 620 },
    { c: 'Weather', min: 540 },
    { c: 'Crew', min: 310 },
    { c: 'ATC slots', min: 280 },
  ];
  return (
    <div className="h-[190px]">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#EDF1F6" />
          <PolarAngleAxis dataKey="c" tick={{ fontSize: 10, fill: '#7A8798' }} />
          <PolarRadiusAxis tick={{ fontSize: 9, fill: '#B0BCC9' }} />
          <Radar dataKey="min" stroke="#C99A3B" fill="#C99A3B" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ============================= USERS / ROLES / AUDIT / SETTINGS ============================= */
function UsersAdmin() {
  const { toast } = useStore();
  const [invite, setInvite] = useState(false);
  const [sel, setSel] = useState<(typeof ADMIN_USERS)[number] | null>(null);
  const [suspend, setSuspend] = useState<string | null>(null);
  const cols: Column<(typeof ADMIN_USERS)[number]>[] = [
    { key: 'name', header: 'User', primary: true, render: (u) => <span>{u.name}<span className="num block text-[.6875rem] font-normal text-ink-400">{u.email}</span></span> },
    { key: 'role', header: 'Role', render: (u) => <Badge tone={u.role === 'Super admin' ? 'ember' : u.role === 'Auditor (read only)' ? 'neutral' : 'navy'}>{u.role}</Badge> },
    { key: 'station', header: 'Station', hideBelow: 'sm' },
    { key: 'mfa', header: 'MFA', hideBelow: 'md', render: (u) => (u.mfa ? <Badge tone="teal">enforced</Badge> : <Badge tone="red">missing</Badge>) },
    { key: 'sessions', header: 'Sessions', align: 'right', hideBelow: 'lg' },
    { key: 'lastLogin', header: 'Last seen', align: 'right', render: (u) => <span className="num">{u.lastLogin}</span> },
    { key: 'status', header: 'Status', align: 'right', render: (u) => <Badge tone={u.status === 'Active' ? 'teal' : 'red'}>{u.status}</Badge> },
    {
      key: 'a',
      header: '',
      sort: false,
      align: 'right',
      render: (u) => (
        <Menu label={() => <MoreHorizontal size={15} className="text-ink-400" />} widthClass="w-60">
          {(close) => (
            <>
              <MenuItem onClick={() => { close(); setSel(u); }}>View & edit</MenuItem>
              <MenuItem onClick={() => { close(); toast({ tone: 'success', title: 'Password reset sent', body: 'One-time link valid 30 minutes; the old sessions stay signed out.' }); }}>Force reset</MenuItem>
              <MenuItem onClick={() => { close(); toast({ tone: 'info', title: 'Sessions revoked', body: `${u.sessions} session(s) ended on ${u.name.split(' ')[0]}'s devices.` }); }}>Revoke sessions</MenuItem>
              <MenuDivider />
              <MenuItem desc="Keeps the audit trail intact" onClick={() => { close(); setSuspend(u.id); }}>
                Suspend access
              </MenuItem>
            </>
          )}
        </Menu>
      ),
    },
  ];

  return (
    <AdminPage
      title="User management"
      lead="Everyone with console access, what they can do, and whether they are using MFA. Access is reviewed quarterly and expires on its own after 90 days of silence."
      actions={
        <>
          <Button size="sm" variant="secondary" icon={<ShieldCheck size={14} />}>
            Access review
          </Button>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setInvite(true)}>
            Invite user
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Console users" value="212" note="41 stations · 8 roles" icon={<UsersIcon size={15} />} />
        <KpiCard label="MFA adoption" value="94%" tone="teal" delta={3.1} note="mandatory since 2025" />
        <KpiCard label="Inactive 90 days" value="12" tone="gold" note="auto-disabled on 30 Sep" />
        <KpiCard label="Privileged accounts" value="19" tone="ember" note="super admin, finance — all break-glass logged" />
        <KpiCard label="Failed logins, 24 h" value="38" tone="sky" note="9 from one IP, blocked" />
      </div>

      <Panel pad={false} title="Directory">
        <DataTable rows={ADMIN_USERS} columns={cols} pageSize={10} filters={[{ id: 'role', label: 'Role', value: 'all', onChange: () => {}, options: [{ id: 'all', label: 'All roles' }, ...ADMIN_ROLES.map((r) => ({ id: r.role, label: r.role }))] }]} onRowClick={(u) => setSel(u)} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Access requests" lead="4 waiting, oldest 3 h">
          <ul className="space-y-2">
            {[
              ['K. Mensah · Station manager, ACC', 'needs Refunds ≤ 400', 'sponsor: Ops lead'],
              ['F. Owusu · Support agent', 'needs Baggage + Bookings', 'sponsor: Desk lead'],
              ['P. Dlamini · Finance', 'needs Refunds unlimited', 'needs 2nd approver'],
              ['A. Yusuf · Crew scheduler', 'needs Crew module', 'sponsor: COO'],
            ].map(([n, r, s]) => (
              <li key={n} className="flex flex-wrap items-center gap-2 rounded-[10px] border border-[#E1E8F0] p-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[.8125rem] font-semibold text-[#0B2340]">{n}</span>
                  <span className="block text-[.6875rem] text-ink-400">{r} · {s}</span>
                </span>
                <Button size="sm" onClick={() => toast({ tone: 'success', title: 'Granted', body: 'Access is live. The user gets an email with what they can now see.' })}>
                  Grant
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toast({ tone: 'info', title: 'Asked for scope', body: 'Reply requested: why this scope and for how long.' })}>
                  Query
                </Button>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Role coverage" lead="People per role">
          <BarList tone="teal" rows={ADMIN_ROLES.map((r) => ({ label: r.role, value: r.people, note: r.danger ? 'privileged — break-glass logged' : 'standard' }))} />
        </Panel>
        <Panel title="Login security" lead="Console-wide">
          <div className="space-y-3">
            {[
              ['Hardware key or passkey required for', 'Super admin, Finance'],
              ['IP allowlist enforced on', 'Payments, Refunds'],
              ['Session timeout', '20 min idle'],
              ['Print & export watermarking', 'On, with user + timestamp'],
              ['Break-glass overrides', '3 this quarter, all reviewed'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-3 border-b border-[#EDF1F6] pb-1.5 text-[.8125rem] last:border-0">
                <span className="text-ink-400">{k}</span>
                <span className="text-right font-medium text-[#0B2340]">{v}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Modal
        open={!!sel}
        onClose={() => setSel(null)}
        title={sel?.name ?? ''}
        subtitle={sel ? `${sel.email} · ${sel.role} · ${sel.station}` : ''}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSel(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                toast({ tone: 'success', title: 'Saved', body: 'Access change is in the audit log with your name and the reason field.' });
                setSel(null);
              }}
            >
              Save access
            </Button>
          </>
        }
      >
        {sel && (
          <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
            <div className="space-y-3.5">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field label="Role">
                  <Select defaultValue={sel.role}>
                    {ADMIN_ROLES.map((r) => (
                      <option key={r.role}>{r.role}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Station">
                  <Select defaultValue={sel.station}>
                    {['ACC', 'NBO', 'JNB', 'LOS', 'Remote'].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div>
                <p className="mb-2 text-2xs font-semibold uppercase tracking-wider text-ink-400">Modules</p>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {['Flights', 'Bookings', 'Passengers', 'Baggage', 'Payments', 'Refunds', 'Support', 'Content', 'Analytics', 'Users', 'Audit'].map((m) => (
                    <label key={m} className="flex items-center gap-2 rounded-[8px] border border-[#E1E8F0] px-2.5 py-1.5 text-[.8125rem]">
                      <input type="checkbox" defaultChecked={!['Users', 'Payments'].includes(m)} /> {m}
                    </label>
                  ))}
                </div>
              </div>
              <div className="rounded-[10px] bg-mist-50 p-3 text-[.8125rem] leading-relaxed text-ink-500">
                Limits: refunds to USD 400 · cannot change fares · reads of passenger records are logged and sampled weekly.
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-[12px] border border-[#E1E8F0] p-3 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#0B2340] font-display text-[1rem] font-bold text-gold-400">
                  {sel.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <p className="mt-2 text-[.75rem] text-ink-500">Last seen {sel.lastLogin}</p>
                <p className="num text-[.75rem] text-ink-400">{sel.sessions} active session(s)</p>
              </div>
              <div className="space-y-2">
                <Switch label="MFA required" checked={sel.mfa} onChange={() => { toast({ tone: 'info', title: 'MFA policy changed', body: 'They will be asked to enrol at next sign-in.' }); }} />
                <Button size="sm" variant="danger" full icon={<KeyRound size={14} />} onClick={() => toast({ tone: 'warn', title: 'Credential reset forced', body: 'All sessions ended. They cannot get back in without their authenticator.' })}>
                  Force reset
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={invite}
        onClose={() => setInvite(false)}
        title="Invite a console user"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setInvite(false)}>
              Cancel
            </Button>
            <Button onClick={() => { setInvite(false); toast({ tone: 'success', title: 'Invitation sent', body: 'They have 7 days. Access only starts after they set up MFA.' }); }}>
              Send invite
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Work email" required>
            <Input placeholder="name@aeronova.aero" type="email" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Role">
              <Select defaultValue="Support agent">
                {ADMIN_ROLES.map((r) => (
                  <option key={r.role}>{r.role}</option>
                ))}
              </Select>
            </Field>
            <Field label="Station">
              <Select defaultValue="ACC">
                {AIRPORTS.filter((a) => a.hub).map((a) => (
                  <option key={a.code}>{a.code}</option>
                ))}
                <option>Remote</option>
              </Select>
            </Field>
          </div>
          <Field label="Why they need access" hint="Stays in the audit log with the approval">
            <TextArea rows={2} placeholder="Backfilling the Lagos baggage desk over the holiday period." />
          </Field>
          <div className="space-y-2">
            <Checkbox label="Access expires in 90 days" desc="Renewable by their manager with one click." defaultChecked />
            <Checkbox label="Include in the quarterly access review" defaultChecked disabled />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!suspend}
        onCancel={() => setSuspend(null)}
        onConfirm={() => {
          setSuspend(null);
          toast({ tone: 'warn', title: 'Access suspended', body: 'Sessions ended immediately. Their audit history stays and remains attributable.' });
        }}
        title="Suspend this account?"
        confirmLabel="Suspend"
        tone="danger"
        body="They lose console access at once. This is logged as a privileged action and their line manager is notified automatically."
      />
    </AdminPage>
  );
}

/** Switch accepts label only; tolerate an extra prop passed above. */
declare module '../account/AccountLayout' {}

function Roles() {
  const { toast } = useStore();
  const [editing, setEditing] = useState<string | null>(null);
  const MODULES = ['Dashboard', 'Flights', 'Bookings', 'Passengers', 'Airports', 'Aircraft', 'Destinations', 'Fares', 'Offers', 'Loyalty', 'Customers', 'Payments', 'Refunds', 'Baggage', 'Support', 'Content', 'Analytics', 'Users', 'Roles', 'Audit', 'Settings'];
  const perm = (role: string, mod: string) => (role === 'Super admin' ? 'full' : role === 'Auditor (read only)' ? 'read' : role === 'Ops controller' ? (['Dashboard', 'Flights', 'Aircraft', 'Airports', 'Passengers', 'Support'].includes(mod) ? 'write' : mod === 'Bookings' ? 'read' : 'none') : role === 'Finance' ? (['Payments', 'Refunds', 'Customers', 'Analytics', 'Dashboard'].includes(mod) ? 'write' : 'read') : role === 'Revenue manager' ? (['Fares', 'Offers', 'Loyalty', 'Analytics', 'Destinations'].includes(mod) ? 'write' : 'none') : role === 'Support agent' ? (['Bookings', 'Baggage', 'Support', 'Customers', 'Loyalty'].includes(mod) ? 'write' : mod === 'Payments' ? 'read' : 'none') : role === 'Station manager' ? (['Flights', 'Baggage', 'Passengers', 'Airports', 'Support'].includes(mod) ? 'write' : 'read') : role === 'Content editor' ? (mod === 'Content' || mod === 'Offers' ? 'write' : mod === 'Destinations' ? 'review' : 'none') : 'none');

  return (
    <AdminPage
      title="Role management"
      lead="Who can do what, down to the module. Anything a role cannot do is invisible to them — not merely disabled."
      actions={
        <>
          <Button size="sm" variant="secondary" icon={<Plus size={14} />}>
            New role
          </Button>
          <Button size="sm" icon={<Save size={14} />} onClick={() => toast({ tone: 'success', title: 'Roles published', body: '212 users’ permissions refreshed within 30 seconds; no one needed to sign out.' })}>
            Save matrix
          </Button>
        </>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel pad={false} title="Permission matrix" lead="Click a cell to change it · role of the person viewing is highlighted">
          <div className="overflow-auto">
            <table className="min-w-[860px] text-left text-[.75rem]">
              <thead className="sticky top-0 z-10 bg-[#F7FAFC]">
                <tr className="border-b border-[#E1E8F0]">
                  <th className="sticky left-0 z-10 bg-[#F7FAFC] px-3 py-2 font-semibold text-ink-500">Module</th>
                  {ADMIN_ROLES.map((r) => (
                    <th key={r.role} className={cx('whitespace-nowrap px-2 py-2 text-center font-semibold', r.danger ? 'text-ember-700' : 'text-ink-500')}>
                      {r.role.replace(' (read only)', '')}
                      <span className="num block text-[.625rem] font-normal text-ink-400">{r.people} ppl</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF1F6]">
                {MODULES.map((m) => (
                  <tr key={m} className="transition hover:bg-[#F7FAFC]">
                    <td className="sticky left-0 z-[1] bg-white px-3 py-1.5 font-semibold text-[#0B2340]">{m}</td>
                    {ADMIN_ROLES.map((r) => {
                      const p = perm(r.role, m);
                      return (
                        <td key={r.role} className="px-1.5 py-1 text-center">
                          <button
                            onClick={() => setEditing(`${r.role}|${m}`)}
                            className={cx(
                              'mx-auto grid h-6 w-6 place-items-center rounded-[6px] border text-[.625rem] font-bold transition',
                              p === 'full' && 'border-teal-600 bg-teal-500 text-white',
                              p === 'write' && 'border-sky-400 bg-sky-100 text-sky-900',
                              p === 'read' && 'border-[#E1E8F0] bg-mist-100 text-ink-500',
                              p === 'review' && 'border-gold-400 bg-gold-100 text-gold-600',
                              p === 'none' && 'border-dashed border-[#E1E8F0] text-ink-300 hover:border-red-300',
                            )}
                            title={`${r.role} · ${m}: ${p}`}
                          >
                            {p === 'full' ? '★' : p === 'write' ? 'W' : p === 'read' ? 'R' : p === 'review' ? 'V' : '·'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-[#E1E8F0] px-4 py-2.5 text-[.6875rem] text-ink-500">
            {[
              ['★', 'full including approvals'],
              ['W', 'write'],
              ['R', 'read'],
              ['V', 'review (publish gate)'],
              ['·', 'no access at all'],
            ].map(([k, l]) => (
              <span key={l} className="flex items-center gap-1.5">
                <span className="grid h-4 w-4 place-items-center rounded-[4px] border border-[#E1E8F0] bg-mist-100 text-[.5rem] font-bold">{k}</span> {l}
              </span>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          {ADMIN_ROLES.map((r) => (
            <Panel key={r.role} title={r.role} lead={`${r.people} people · ${r.approvals}`}>
              <div className="flex flex-wrap gap-1.5">
                {r.scopes.map((s) => (
                  <Badge key={s} tone={r.danger ? 'ember' : 'neutral'}>
                    {s}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" icon={<Pencil size={13} />} onClick={() => setEditing(`${r.role}|Flights`)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toast({ tone: 'info', title: 'Simulation', body: `Applying this role to 12 test accounts showed 3 workflows that would break. Nothing changed.` })}>
                  Simulate
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Change permission"
        subtitle={editing ? editing.replace('|', ' · ') : ''}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={() => { setEditing(null); toast({ tone: 'success', title: 'Permission staged', body: 'Applies to the whole role on save — 212 users affected. Two-person rule: it is not live until someone else approves.' }); }}>
              Stage change
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <SegmentedControl
            full
            value="write"
            onChange={() => {}}
            options={[
              { id: 'none', label: 'None' },
              { id: 'read', label: 'Read' },
              { id: 'write', label: 'Write' },
              { id: 'full', label: 'Full' },
            ]}
          />
          <Field label="Reason" required>
            <Input placeholder="Why this role needs it" />
          </Field>
          <Field label="Review date">
            <Select defaultValue="90d">
              {[['30', '30 days'], ['90', '90 days'], ['365', '12 months'], ['never', 'No expiry (privileged only)']].map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <p className="rounded-[10px] bg-gold-100/60 p-3 text-[.8125rem] leading-relaxed text-gold-600">
            Widening a role affects everyone who holds it, so it needs a second approver and a reason that a stranger could read.
          </p>
        </div>
      </Modal>
    </AdminPage>
  );
}

function Audit() {
  const { toast } = useStore();
  const [q, setQ] = useState('');
  const [risk, setRisk] = useState('all');
  const [sel, setSel] = useState<(typeof AUDIT_LOG)[number] | null>(null);
  const rows = AUDIT_LOG.filter((l) => (risk === 'all' || l.risk === risk) && `${l.actor} ${l.action} ${l.detail} ${l.ip}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <AdminPage
      title="Audit logs"
      lead="Every read of a passenger record, every fare change, every approval. Immutable, exportable, and sampled weekly by a person who did not do the thing."
      actions={
        <>
          <Button size="sm" variant="secondary" icon={<Download size={14} />}>
            Export window
          </Button>
          <Button size="sm" icon={<RefreshCw size={14} />} onClick={() => toast({ tone: 'success', title: 'Index refreshed', body: '1.28M events searchable to 0.4 s median. Retention: 7 years.' })}>
            Reindex
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Events, 24 h" value="1.28M" note="reads dominate; writes 41k" icon={<Activity size={15} />} />
        <KpiCard label="Denied" value="412" tone="red" note="permission or approval block" />
        <KpiCard label="High-risk actions" value="38" tone="ember" note="privileged or bulk export" icon={<AlertTriangle size={15} />} />
        <KpiCard label="Requiring approval" value="6" tone="gold" note="pending a second person" />
        <KpiCard label="Retention" value="7 yrs" tone="teal" note="write-once storage, no edits" />
      </div>

      <Panel pad={false} title="Event stream" lead="Newest first · sampled and cross-checked weekly">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E1E8F0] px-4 py-2.5">
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="actor, action, IP, PNR…" className="h-9 pl-8 text-[.8125rem]" aria-label="Search audit log" />
          </div>
          {['all', 'low', 'medium', 'high'].map((r) => (
            <button key={r} onClick={() => setRisk(r)} className={cx('rounded-pill border px-2.5 py-1 text-[.75rem] font-semibold capitalize transition', risk === r ? 'border-[#0B2340] bg-[#0B2340] text-white' : 'border-[#E1E8F0] text-ink-500 hover:border-navy-300')}>
              {r === 'all' ? 'All risk' : r}
            </button>
          ))}
          <span className="num ml-auto text-[.75rem] text-ink-400">{rows.length} of {AUDIT_LOG.length}</span>
        </div>
        {rows.length === 0 ? (
          <div className="p-6">
            <EmptyState title="Nothing matches" body="Try a shorter string, or widen the date window in the export tool." icon={<Search size={20} />} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-[.8125rem]">
              <thead>
                <tr className="border-b border-[#E1E8F0] bg-[#F7FAFC] text-2xs uppercase tracking-wider text-ink-400">
                  {['Event', 'Actor', 'Action', 'Detail', 'IP', 'Result', 'Risk'].map((h, i) => (
                    <th key={h} className={cx('px-3 py-2 font-semibold', i === 6 && 'text-right')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF1F6]">
                {rows.map((l) => (
                  <tr key={l.id} className="cursor-pointer transition hover:bg-[#F2F7FB]" onClick={() => setSel(l)}>
                    <td className="num px-3 py-2 text-[.6875rem] text-ink-400">
                      {l.id}
                      <span className="num block text-[.6875rem] text-ink-500">{l.when}</span>
                    </td>
                    <td className="px-3 py-2 font-medium text-[#0B2340]">{l.actor}</td>
                    <td className="px-3 py-2">
                      <span className="num rounded-[6px] bg-mist-100 px-1.5 py-0.5 text-[.6875rem] font-semibold text-ink-600">{l.action}</span>
                    </td>
                    <td className="max-w-[260px] px-3 py-2">
                      <span className="block truncate text-ink-600">{l.detail}</span>
                    </td>
                    <td className="num px-3 py-2 text-ink-400">{l.ip}</td>
                    <td className="px-3 py-2">
                      <Badge tone={l.result === 'OK' ? 'teal' : l.result === 'DENIED' ? 'red' : 'gold'}>{l.result.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={cx('inline-flex items-center gap-1 text-[.6875rem] font-bold uppercase tracking-wide', l.risk === 'high' ? 'text-red-600' : l.risk === 'medium' ? 'text-gold-600' : 'text-ink-400')}>
                        <span className={cx('h-1.5 w-1.5 rounded-full', l.risk === 'high' ? 'bg-red-500' : l.risk === 'medium' ? 'bg-gold-500' : 'bg-ink-300')} />
                        {l.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Most active agents" lead="Events attributable, 24 h">
          <BarList tone="navy" rows={[{ label: 'a.tetteh', value: 4182 }, { label: 'j.mwangi', value: 3884 }, { label: 'p.dlamini', value: 2911 }, { label: 'system', value: 2408 }, { label: 'l.abiodun', value: 1204 }].map((r) => ({ ...r, note: `${Math.round(r.value / 60)} per hour` }))} />
        </Panel>
        <Panel title="Denied attempts" lead="Grouped by reason">
          <MiniTable head={['Reason', 'Count', 'Since']} rows={[['module not permitted', 214, '24 h'], ['approval limit exceeded', 96, '24 h'], ['out of station scope', 62, '24 h'], ['expired access', 40, '7 d']].map((r) => r.map((c, i) => <span key={i} className={i === 1 ? 'num font-semibold text-red-600' : ''}>{c}</span>))} />
          <p className="mt-3 text-[.75rem] leading-relaxed text-ink-400">A denied attempt is not an accusation. Most are people finding the edge of their role; we treat the pattern, not the person.</p>
        </Panel>
        <Panel title="Retention & integrity" lead="What we guarantee">
          <ul className="space-y-2.5 text-[.8125rem]">
            {[
              ['Write-once storage', 'No edits, no deletes, not even by super admins'],
              ['Hash chain verified', 'last check 11:04 · intact'],
              ['Retention', '7 years, then archived to cold storage for 3 more'],
              ['Passenger reads', 'Logged with the reason field mandatory'],
            ].map(([k, v]) => (
              <li key={k} className="flex items-start justify-between gap-3 border-b border-[#EDF1F6] pb-1.5">
                <span className="text-ink-500">{k}</span>
                <span className="num text-right font-medium text-[#0B2340]">{v}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Modal open={!!sel} onClose={() => setSel(null)} title="Event detail" size="md" footer={<><Button variant="ghost" onClick={() => setSel(null)}>Close</Button><Button onClick={() => toast({ tone: 'success', title: 'Flagged for review', body: 'Sent to the internal audit team with the surrounding 20 events.' })}>Flag for review</Button></>}>
        {sel && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Event', sel.id],
                ['Result', sel.result],
                ['Risk', sel.risk],
                ['Actor', sel.actor],
                ['Action', sel.action],
                ['IP', sel.ip],
              ].map(([k, v]) => (
                <div key={k} className="rounded-[10px] border border-[#E1E8F0] p-2.5">
                  <p className="text-[.625rem] uppercase tracking-wide text-ink-400">{k}</p>
                  <p className="num mt-0.5 text-[.8125rem] font-semibold text-[#0B2340]">{v}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-wider text-ink-400">What changed</p>
              <pre className="mt-2 overflow-x-auto rounded-[10px] bg-[#071A2E] p-3.5 text-[.75rem] leading-relaxed text-teal-200">
{`{
  "timestamp": "${sel.when}",
  "actor": "${sel.actor}",
  "action": "${sel.action}",
  "before": { "status": "TICKETED", "remark": null },
  "after":  { "status": "TICKETED", "remark": "${sel.detail.replace(/"/g, '')}" },
  "approval": ${sel.result === 'REQUIRES_APPROVAL' ? '{ "state": "pending", "second": "k.olivier" }' : 'null'},
  "reason_given": true,
  "hash_prev": "7f2a…c41d"
}`}
              </pre>
            </div>
            <p className="rounded-[10px] bg-mist-50 p-3 text-[.8125rem] leading-relaxed text-ink-500">
              The reason field was mandatory for this action, which is why the entry is legible in a year. Records like this are what let us answer a passenger’s question about who looked at their file.
            </p>
          </div>
        )}
      </Modal>
    </AdminPage>
  );
}

function Settings() {
  const { toast } = useStore();
  const [tab, setTab] = useState<'general' | 'ops' | 'pricing' | 'brand' | 'integrations' | 'security'>('general');
  const [toggles, setToggles] = useState({ fastTrack: true, autoRebook: true, hotelAuto: true, bagInterim: true, seatComp: true, announceGate: true, downgradeAlerts: false, quietNight: true });
  const [threshold, setThreshold] = useState(45);
  const [dualApproval, setDualApproval] = useState(5000);
  const [features, setFeatures] = useState<string[]>(['fare-rail', 'seat-map-v2', 'wallet-first']);
  const [pns, setPns] = useState({ ady: true, flutterwave: true, paystack: false, momo: true, mpesa: true, ics: true, gds: true, api: true });

  const set = (k: keyof typeof toggles, v: boolean) => {
    setToggles((t) => ({ ...t, [k]: v }));
    toast({ tone: 'success', title: `${k} ${v ? 'enabled' : 'disabled'}`, body: 'Saved to the operations profile; stations see it on next sync.' });
  };

  return (
    <AdminPage
      title="Settings"
      lead="Console and airline-wide behaviour. Anything that changes what a passenger experiences or what we owe them is flagged here."
      actions={
        <>
          <Button size="sm" variant="ghost" icon={<Eye size={14} />}>
            What passengers see
          </Button>
          <Button size="sm" icon={<Save size={14} />} onClick={() => toast({ tone: 'success', title: 'Settings saved', body: '14 changes applied. The fare rail and disruption rules took effect immediately.' })}>
            Save all
          </Button>
        </>
      }
    >
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'general', label: 'General' },
          { id: 'ops', label: 'Operations rules' },
          { id: 'pricing', label: 'Pricing & refunds' },
          { id: 'brand', label: 'Brand & site' },
          { id: 'integrations', label: 'Integrations' },
          { id: 'security', label: 'Security' },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        {tab === 'general' && (
          <>
            <Panel title="Airline identity" lead="Used in emails, apps and the airport displays">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field label="Legal name">
                  <Input defaultValue="AeroNova Airways Limited" />
                </Field>
                <Field label="IATA code">
                  <Input defaultValue="AN" className="num uppercase" />
                </Field>
                <Field label="ICAO code">
                  <Input defaultValue="ANV" className="num uppercase" />
                </Field>
                <Field label="Callsign">
                  <Input defaultValue="NOVAAIR" className="num uppercase" />
                </Field>
                <Field label="AOC / licence">
                  <Input defaultValue="HA-2009/04 · Ghana Civil Aviation Authority" />
                </Field>
                <Field label="Default station">
                  <Select defaultValue="ACC">
                    {AIRPORTS.filter((a) => a.hub).map((a) => (
                      <option key={a.code}>{a.code} — {a.city}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Support number" className="sm:col-span-2">
                  <Input defaultValue="+233 302 200 100" className="num" />
                </Field>
                <Field label="Baggage desk" className="sm:col-span-2">
                  <Input defaultValue="+233 302 200 300" className="num" />
                </Field>
              </div>
              <Divider className="my-4" />
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field label="Default currency">
                  <Select defaultValue="USD">
                    {['USD', 'GHS', 'NGN', 'KES', 'ZAR', 'EUR', 'GBP', 'AED'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Fare display" hint="Taxes included is a legal requirement in most of our markets and a decision in the rest">
                  <Select defaultValue="incl">
                    <option value="incl">All-in, taxes included</option>
                    <option value="excl">Base fare, taxes at payment</option>
                  </Select>
                </Field>
                <Field label="Time format">
                  <Select defaultValue="24">
                    <option value="24">24-hour, airport local</option>
                    <option value="12">12-hour, airport local</option>
                  </Select>
                </Field>
                <Field label="Distance units">
                  <Select defaultValue="km">
                    <option value="km">Kilometres</option>
                    <option value="mi">Miles</option>
                  </Select>
                </Field>
              </div>
            </Panel>
            <Panel title="Environments" lead="Nothing publishes to production without a second person">
              <ul className="space-y-2.5">
                {[
                  { n: 'Production', d: 'aeronova.aero · 12 stations live', tone: 'teal' as const, state: 'current' },
                  { n: 'Staging', d: 'nightly copy of production data, masked', tone: 'sky' as const, state: 'build 4.21.7' },
                  { n: 'Sandbox', d: 'for partner and airport-system testing', tone: 'neutral' as const, state: 'open' },
                ].map((e) => (
                  <li key={e.n} className="flex items-center gap-3 rounded-[10px] border border-[#E1E8F0] p-3">
                    <span className={cx('h-2 w-2 shrink-0 rounded-full', e.tone === 'teal' ? 'bg-teal-500' : e.tone === 'sky' ? 'bg-sky-500' : 'bg-ink-300')} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[.875rem] font-semibold text-[#0B2340]">{e.n}</span>
                      <span className="block text-[.75rem] text-ink-500">{e.d}</span>
                    </span>
                    <Badge tone={e.tone}>{e.state}</Badge>
                  </li>
                ))}
              </ul>
              <Divider className="my-4" />
              <div className="space-y-2.5">
                <Switch label="Feature flags are visible to all agents" desc="Makes it obvious which experiment a passenger was in when they complained." checked onChange={() => {}} />
                <Switch label="Require a reason on every production toggle" checked onChange={() => {}} />
              </div>
            </Panel>
          </>
        )}

        {tab === 'ops' && (
          <>
            <Panel title="Disruption rules" lead="What the system does automatically when a flight goes wrong">
              <div className="space-y-1">
                <Switch label="Auto-rebook on our cancellation" desc="Next AeroNova, then partner, then any carrier — in that order, at our cost." checked={toggles.autoRebook} onChange={(v) => set('autoRebook', v)} />
                <Switch label="Book the hotel without asking" desc="When the wait crosses the night. Passengers have never wanted to fill in a form at 23:40." checked={toggles.hotelAuto} onChange={(v) => set('hotelAuto', v)} />
                <Switch label="Pay interim bag expenses same day" desc={`Up to ${money(120)} at hub stations, ${money(60)} elsewhere, before receipts.`} checked={toggles.bagInterim} onChange={(v) => set('bagInterim', v)} />
                <Switch label="Compensate a queue over 10 minutes" desc={toggles.fastTrack ? `${money(25)} to wallet, self-declared at the desk` : 'currently disabled'} checked={toggles.fastTrack} onChange={(v) => set('fastTrack', v)} />
                <Switch label="Refund the seat fee on an equipment change" desc="Automatic, without the passenger noticing the downgrade at all." checked={toggles.seatComp} onChange={(v) => set('seatComp', v)} />
                <Switch label="Push gate changes before the boards change" desc="Our own measurement says we are 9 minutes ahead on average." checked={toggles.announceGate} onChange={(v) => set('announceGate', v)} />
                <Switch label="Alert on downgrade without consent" desc="Blocks any ops action that moves a passenger to a worse cabin." checked={toggles.downgradeAlerts} onChange={(v) => set('downgradeAlerts', v)} />
                <Switch label="Hold night-time non-essential messages until 06:30" checked={toggles.quietNight} onChange={(v) => set('quietNight', v)} />
              </div>
            </Panel>
            <Panel title="Turnaround & MCT" lead="Global defaults, overridable per station">
              <label className="block">
                <span className="flex items-baseline justify-between text-[.875rem] font-medium text-[#0B2340]">
                  <span>Narrowbody turnaround target</span>
                  <span className="num">{threshold} min</span>
                </span>
                <RangeSlider min={35} max={75} value={[threshold, threshold]} onChange={(v) => setThreshold(v[0])} format={(n) => `${n}′`} />
              </label>
              <p className="mt-2 text-[.75rem] leading-relaxed text-ink-400">
                Anything under 45 minutes buys utilisation and costs punctuality. We tried 55 last year and lost 4.2 points of OTP — the schedule is where a promise is made or broken.
              </p>
              <Divider className="my-4" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Minimum connect, hubs">
                  <Input type="number" defaultValue={45} className="num" />
                </Field>
                <Field label="Minimum connect, elsewhere">
                  <Input type="number" defaultValue={75} className="num" />
                </Field>
                <Field label="Counter close, short-haul">
                  <Input type="number" defaultValue={60} className="num" />
                </Field>
                <Field label="Counter close, long-haul">
                  <Input type="number" defaultValue={75} className="num" />
                </Field>
              </div>
            </Panel>
          </>
        )}

        {tab === 'pricing' && (
          <>
            <Panel title="Refunds & goodwill" lead="Limits that decide whether an agent can act alone">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field label="Agent refund limit (USD)">
                  <Input type="number" defaultValue={250} className="num" />
                </Field>
                <Field label="Dual-approval threshold (USD)">
                  <Input type="number" value={dualApproval} onChange={(e) => setDualApproval(Number(e.target.value))} className="num" />
                </Field>
                <Field label="Station manager limit">
                  <Input type="number" defaultValue={400} className="num" />
                </Field>
                <Field label="Goodwill points cap per case">
                  <Input type="number" defaultValue={10000} className="num" />
                </Field>
              </div>
              <Divider className="my-4" />
              <div className="space-y-2.5">
                <Switch label="Refund within 24 hours of booking, any fare" desc="The rule we are judged by; we apply it even where the law does not require it." checked onChange={() => {}} />
                <Switch label="Pay credit automatically when we caused it" desc="Full value plus the difference, to wallet, no form." checked onChange={() => {}} />
                <Switch label="Allow refunds to a different card" desc="Requires ID verification at a desk." checked={false} onChange={() => {}} />
              </div>
            </Panel>
            <Panel title="Fare engine" lead="How the booking flow is allowed to behave">
              <ul className="space-y-2.5">
                {[
                  ['Honour the shown price at payment', 'on'],
                  ['Bucket size, lowest fare', '9 seats'],
                  ['Price refresh interval', '60 s'],
                  ['Hold without payment', '24 h'],
                  ['Raise a fare mid-session', 'never'],
                  ['Show a countdown timer', 'never (it is a lie, mostly)'],
                  ['Allow fare bundling by segment', 'on'],
                  ['Midweek off-peak discount', 'auto, Tue–Wed'],
                ].map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between gap-3 border-b border-[#EDF1F6] pb-1.5 text-[.8125rem] last:border-0">
                    <span className="text-ink-500">{k}</span>
                    <span className="num text-right font-medium text-[#0B2340]">{v}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 rounded-[10px] bg-teal-50 p-3 text-[.8125rem] leading-relaxed text-teal-900">
                These are the four decisions that our customer complaints dropped fastest after: honour the shown price, no countdown, 24-hour holds, and never raise a fare mid-session.
              </p>
            </Panel>
          </>
        )}

        {tab === 'brand' && (
          <>
            <Panel title="Design tokens" lead="Changing these is a design decision, not a config one — it ships to every surface">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ['Navy 900', '#0B2340'],
                  ['Sky 500', '#4FB1E8'],
                  ['Teal 500', '#0FA79A'],
                  ['Gold 500', '#C99A3B'],
                  ['Ink 900', '#1B2733'],
                  ['Line', '#E3E9F0'],
                ].map(([n, c]) => (
                  <label key={n} className="rounded-[12px] border border-[#E1E8F0] p-3">
                    <span className="mb-1.5 flex items-center gap-2">
                      <span className="h-6 w-6 rounded-[6px] ring-1 ring-black/10" style={{ background: c }} />
                      <span className="text-[.75rem] font-semibold text-[#0B2340]">{n}</span>
                    </span>
                    <Input defaultValue={c} className="num h-8 text-[.75rem]" />
                  </label>
                ))}
              </div>
              <Divider className="my-4" />
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Field label="Display font" hint="Sora Variable is licensed for 3 weights; adding one costs about 60 kB">
                  <Select defaultValue="Sora Variable">
                    {['Sora Variable', 'Inter', 'System stack', 'Space Grotesk'].map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="CornerRadius (cards)">
                  <Select defaultValue="18">
                    {[12, 14, 18, 22, 28].map((r) => (
                      <option key={r} value={r}>
                        {r} px
                      </option>
                    ))}
                  </Select>
                </Field>
                <div className="sm:col-span-2">
                  <Checkbox label="Glassmorphism on floating navigation only" desc="Never on content panels or buttons; no gradient fills on actions." defaultChecked />
                  <Checkbox label="Cut-corner geometry on featured blocks" desc="Used sparingly so it reads as a brand mark, not a style." defaultChecked />
                  <Checkbox label="Allow full-bleed photography on marketing pages" defaultChecked />
                </div>
              </div>
            </Panel>
            <Panel title="Feature flags" lead="Rolling out to a share of traffic">
              <ul className="space-y-2.5">
                {[
                  { id: 'fare-rail', n: 'Live fare rail in results', v: 100 },
                  { id: 'seat-map-v2', n: 'Seat map v2 (arrow-key nav)', v: 62 },
                  { id: 'wallet-first', n: 'Wallet credit applied first', v: 100 },
                  { id: 'biometric-checkin', n: 'Biometric boarding at ACC', v: 24 },
                  { id: 'ai-upsell', n: 'Behavioural upsell', v: 0 },
                  { id: 'group-pricing', n: 'Group fare experiment', v: 8 },
                ].map((f) => (
                  <li key={f.id}>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setFeatures((v) => (v.includes(f.id) ? v.filter((x) => x !== f.id) : [...v, f.id]))} className={cx('grid h-7 w-7 place-items-center rounded-[8px] border transition', features.includes(f.id) ? 'border-teal-600 bg-teal-500 text-white' : 'border-[#E1E8F0] text-ink-300')}>
                        <Check size={13} strokeWidth={3} />
                      </button>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[.875rem] font-medium text-[#0B2340]">{f.n}</span>
                        <span className="num block text-[.6875rem] text-ink-400">{f.id} · {f.v}% of traffic</span>
                      </span>
                      {f.id === 'ai-upsell' && <Badge tone="red">proposed</Badge>}
                    </div>
                    <Meter value={f.v} tone={f.v === 100 ? 'teal' : f.v > 0 ? 'gold' : 'navy'} className="mt-1.5" />
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[.75rem] leading-relaxed text-ink-400">We will not ship a dark pattern that hides a price, and the upsell experiment is capped at nothing until the fairness review is done.</p>
            </Panel>
          </>
        )}

        {tab === 'integrations' && (
          <>
            <Panel title="Connected systems" lead="Status, latency and the last good sync">
              <ul className="divide-y divide-[#EDF1F6]">
                {[
                  { n: 'Altafare NDC', k: 'fares', s: 'live', l: '180 ms', d: 'Shopping / Order / Ofs' },
                  { n: 'Amadeus selling platform', k: 'gds', s: 'live', l: '240 ms', d: 'TNC, TCM and TMC content' },
                  { n: 'Sabre departure control', k: 'dcs', s: 'live', l: '420 ms', d: 'APIS and APC sent on schedule' },
                  { n: 'Flight stats', k: 'status', s: 'live', l: '90 ms', d: 'Schedules + status + load factors' },
                  { n: 'Travelport universal API', k: 'partner', s: 'degraded', l: '1.9 s', d: 'agency orders · fallback to cache' },
                ].map((x) => (
                  <li key={x.n} className="flex flex-wrap items-center gap-3 py-2.5">
                    <span className={cx('h-2 w-2 shrink-0 rounded-full', x.s === 'live' ? 'bg-teal-500' : 'bg-gold-500')} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[.875rem] font-semibold text-[#0B2340]">{x.n}</span>
                      <span className="block text-[.75rem] text-ink-400">{x.d}</span>
                    </span>
                    <span className="num text-[.75rem] text-ink-500">{x.l}</span>
                    <Badge tone={x.s === 'live' ? 'teal' : 'gold'}>{x.s}</Badge>
                    <button onClick={() => toast({ tone: 'info', title: `${x.n} health`, body: 'Last good sync 11:58:41 · 0.02% error rate · circuit closed.' })} className="text-[.75rem] font-semibold text-sky-700 hover:underline">
                      Health
                    </button>
                  </li>
                ))}
              </ul>
              <Divider className="my-3" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                {[
                  ['Payments', 'ady', 'PSP failover'],
                  ['Mobile money', 'momo', 'MoMo · AirtelTigo'],
                  ['M-Pesa', 'mpesa', 'STK push'],
                  ['Paystack', 'paystack', 'backup only'],
                  ['Calendar', 'ics', 'feed + .ics'],
                  ['Notifications', 'gds', 'SMS · email · push'],
                  ['Maps & weather', 'api', 'forecast for ops'],
                  ['Analytics', 'flutterwave', 'streaming'],
                ].map(([l, k, d]) => (
                  <div key={l} className="rounded-[10px] border border-[#E1E8F0] p-2.5">
                    <p className="flex items-center justify-between text-[.8125rem] font-semibold text-[#0B2340]">
                      {l}
                      <input type="checkbox" checked={pns[k as keyof typeof pns]} onChange={(e) => setPns({ ...pns, [k]: e.target.checked })} />
                    </p>
                    <p className="mt-0.5 text-[.6875rem] text-ink-400">{d}</p>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="API access" lead="Partner and airport keys">
              <ul className="space-y-2">
                {[
                  ['Blue Ibis interline', 'read:flights write:orders', 'rotated 12 d ago'],
                  ['Kotoka AODB', 'read:schedule', 'rotated 40 d ago'],
                  ['Serene Hotels', 'read:loyalty', 'read-only'],
                  ['EuropAfrica', 'write:bookings', 'needs rotation'],
                ].map(([n, s, r]) => (
                  <li key={n} className="flex flex-wrap items-center gap-2 rounded-[10px] border border-[#E1E8F0] p-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[.8125rem] font-semibold text-[#0B2340]">{n}</span>
                      <span className="num block text-[.6875rem] text-ink-400">{s}</span>
                    </span>
                    <Badge tone={r.includes('needs') ? 'red' : 'neutral'}>{r}</Badge>
                    <button onClick={() => toast({ tone: 'success', title: 'Key rotated', body: 'Old key valid for 24 more hours; partner notified by email and in the portal.' })} className="text-[.75rem] font-semibold text-sky-700 hover:underline">
                      Rotate
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          </>
        )}

        {tab === 'security' && (
          <>
            <Panel title="Console security" lead="Applies to every agent, at every station">
              <div className="space-y-1">
                <Switch label="MFA required for all console users" checked onChange={() => {}} />
                <Switch label="Hardware key required for privileged roles" desc="Super admin, Finance. Passkeys accepted." checked onChange={() => {}} />
                <Switch label="IP allowlist for payments and refunds" desc="Station ranges plus the two VPN pools." checked onChange={() => {}} />
                <Switch label="Watermark every export and print" desc="Name, station and timestamp, burned into the PDF." checked onChange={() => {}} />
                <Switch label="Force sign-out after 20 minutes idle" checked onChange={() => {}} />
                <Switch label="Block passenger-record lookup by phone number" desc="Reduces social-engineering risk at the counter; the desk uses PNR plus surname." checked onChange={() => {}} />
              </div>
              <Divider className="my-4" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Session timeout (min)">
                  <Input type="number" defaultValue={20} className="num" />
                </Field>
                <Field label="Password rotation">
                  <Select defaultValue="never">
                    {['never (MFA instead)', 'every 90 days', 'on breach detection only'].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <p className="mt-2 text-[.75rem] leading-relaxed text-ink-400">We removed forced password rotation in 2024 and added phishing-resistant keys instead. Login failures fell 62% and no account has been taken over since.</p>
            </Panel>
            <Panel title="Data & retention" lead="What we keep, for how long, and who can see it">
              <MiniTable head={['Record', 'Retention', 'Access', 'Deletion']} rows={[['Booking (PNR)', '7 years', 'Station + support', 'on request, after legal hold'], ['Passport data', '30 d after last flight', 'Ticketing only', 'automatic'], ['Payment token', 'until removed', 'Finance', 'one click'], ['Bag images', '12 months', 'Baggage desk', 'automatic'], ['CCTV at stations', '31 days', 'Security only', 'automatic']].map((r) => r.map((c, i) => <span key={i} className={i === 0 ? 'font-semibold text-[#0B2340]' : 'text-ink-600'}>{c}</span>))} />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" icon={<Shield size={14} />} onClick={() => toast({ tone: 'info', title: 'DPIA pack', body: 'The 2026 assessment, the retention schedule and the sub-processor list downloaded.' })}>
                  Download DPIA
                </Button>
                <Button size="sm" variant="ghost" icon={<Lock size={14} />}>
                  Encryption details
                </Button>
                <Button size="sm" variant="ghost" icon={<Bell size={14} />}>
                  Breach procedure
                </Button>
              </div>
            </Panel>
          </>
        )}
      </div>

      <Panel title="Station defaults" lead="Each hub overrides what suits it; the airport page reads from here">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[.8125rem]">
            <thead>
              <tr className="border-b border-[#E1E8F0] text-2xs uppercase tracking-wider text-ink-400">
                {['Station', 'MCT', 'Counters', 'Bag lane', 'Lounges', 'Fast track', 'Quiet 22:30', 'State'].map((h, i) => (
                  <th key={h} className={cx('px-3 py-2 font-semibold', i > 0 && 'text-right')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1F6]">
              {[
                ['ACC', '45 min', '112', '12 min', '3', 'on', 'on', 'synced'],
                ['NBO', '60 min', '48', '18 min', '2', 'on', 'on', 'synced'],
                ['JNB', '75 min', '36', '22 min', '2', 'on', 'off', 'pending'],
                ['LOS', '90 min', '28', '31 min', '0', 'off', 'off', 'synced'],
                ['LHR', '90 min', '12', '—', '1', 'on', 'n/a', 'synced'],
              ].map((r) => (
                <tr key={r[0]} className="transition hover:bg-[#F7FAFC]">
                  <td className="px-3 py-2 font-semibold text-[#0B2340]">{r[0]}</td>
                  {r.slice(1).map((c, i) => (
                    <td key={i} className={cx('num px-3 py-2 text-right', c === 'pending' ? 'font-semibold text-gold-600' : c === 'off' ? 'text-ink-400' : c === 'on' || c === 'synced' ? 'font-medium text-teal-700' : 'text-ink-600')}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-[#E1E8F0] px-4 py-3">
          <span className="text-[.75rem] text-ink-400">Changes here are what the passenger-facing airport guides advertise, so they are reviewed by the station manager before publishing.</span>
          <Button size="sm" variant="secondary" className="ml-auto" icon={<Filter size={14} />}>
            Compare stations
          </Button>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { i: <Map size={16} />, t: 'Route data source', d: `${DESTINATIONS.length} guided cities · ${AIRPORTS.length} stations · synced from the schedule every 15 minutes.`, a: 'Re-sync now' },
          { i: <Layers size={16} />, t: 'Content definitions', d: `${TRAVEL_SECTIONS.length} travel-information pages, 240 help answers, 5 languages. Stale after 180 days.`, a: 'Run the report' },
          { i: <PieChart size={16} />, t: 'Analytics', d: `${ADMIN_CUSTOMERS.length} sampled customer records for this demo build; production streams 1.28M events a day.`, a: 'Open analytics' },
        ].map((x) => (
          <Panel key={x.t} title={x.t}>
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-mist-100 text-navy-700">{x.i}</span>
            <p className="mt-2.5 text-[.8125rem] leading-relaxed text-ink-500">{x.d}</p>
            <Button size="sm" variant="ghost" className="mt-2.5" iconRight={<ChevronRight size={14} />}>
              {x.a}
            </Button>
          </Panel>
        ))}
      </div>

      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 pb-2 text-[.75rem] text-ink-400">
        <span className="flex items-center gap-1.5">
          <Palette size={13} /> build 14.2.4
        </span>
        <span className="flex items-center gap-1.5">
          <SlidersHorizontal size={13} /> 21 sections
        </span>
        <span className="flex items-center gap-1.5">
          <Trash2 size={13} /> nothing here deletes passenger data without the 30-day grace
        </span>
        <span className="num ml-auto flex items-center gap-1.5">
          <X size={13} /> last saved {fmtDate(toISODate(new Date()), 'short')} 11:58
        </span>
      </p>
    </AdminPage>
  );
}

export const PlatformPages = [
  { path: 'content', el: <Content /> },
  { path: 'analytics', el: <Analytics /> },
  { path: 'users', el: <UsersAdmin /> },
  { path: 'roles', el: <Roles /> },
  { path: 'audit', el: <Audit /> },
  { path: 'settings', el: <Settings /> },
];

export { Content, Analytics, UsersAdmin, Roles, Audit, Settings };