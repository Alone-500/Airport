import { useMemo, useState } from 'react';
import { ArrowUpRight, CalendarClock, Check, ChevronRight, Clock, Filter, MapPin, Pencil, Plane, PlaneLanding, PlaneTakeoff, Plus, RotateCcw, Save, Search, Users, Wrench, X } from 'lucide-react';
import { cx, fmtDate, money, toISODate } from '../../lib/utils';
import { ADMIN_AIRCRAFT, ADMIN_AIRPORT_ROWS, ADMIN_BOOKINGS, ADMIN_CREW, ADMIN_FLIGHTS, type AdminBooking, type AdminFlight } from '../../data/admin';
import { AIRPORTS, BY_CODE, cityOf } from '../../data/airports';
import { DESTINATIONS } from '../../data/destinations';
import { FLEET } from '../../data/fleet';
import { statusBoard } from '../../data/flights';
import { AdminPage, BarList, MiniTable, Panel } from './AdminApp';
import { Badge, Button, Divider, EmptyState, Meter, StatusBadge } from '../../components/ui/Primitives';
import { DataTable, KpiCard, type Column } from '../../components/ui/Table';
import { ConfirmDialog, Drawer, Menu, MenuItem, Modal, Tabs } from '../../components/ui/Overlay';
import { Checkbox, DateField, Field, Input, RangeSlider, Select, TextArea } from '../../components/ui/Form';
import { useStore } from '../../store/store';
import { SeatMap } from '../../components/booking/SeatMap';

/* ============================= FLIGHTS ============================= */
function Flights() {
  const { toast } = useStore();
  const [tab, setTab] = useState<'board' | 'timeline' | 'crew' | 'gates'>('board');
  const [status] = useState('all');
  const [selected, setSelected] = useState<AdminFlight | null>(null);
  const [date, setDate] = useState(toISODate(new Date()));
  const [statusDraft, setStatusDraft] = useState('SCHEDULED');
  const [note, setNote] = useState('');
  const rows = useMemo(() => ADMIN_FLIGHTS.filter((f) => status === 'all' || f.status === status || (status === 'irregular' && ['DELAYED', 'CANCELLED', 'GATE CHANGE'].includes(f.status))), [status]);

  return (
    <AdminPage
      title="Flight management"
      lead="Schedule, status, delays and crew for every sector. Changing a status here is what the airport boards, the app and the SMS gateway read."
      actions={
        <>
          <DateField label="" value={date} onChange={setDate} className="[&>div>div]:mb-0" />
          <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={() => toast({ tone: 'info', title: 'Add a maintenance slot', body: 'Pick the aircraft and the window; ops checks the schedule impact before it is accepted.' })}>
            Maintenance window
          </Button>
          <Button size="sm" icon={<CalendarClock size={14} />} onClick={() => toast({ tone: 'success', title: 'Board published', body: '34 sectors pushed to display systems and the app.' })}>
            Publish board
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Scheduled" value="34" note={`${rows.length} shown after filter`} icon={<Plane size={15} />} />
        <KpiCard label="Boarding now" value={String(ADMIN_FLIGHTS.filter((f) => f.status === 'BOARDING').length)} tone="sky" note="gate closes 10 min before" icon={<PlaneTakeoff size={15} />} />
        <KpiCard label="Delayed" value={String(ADMIN_FLIGHTS.filter((f) => f.status === 'DELAYED').length)} tone="gold" note="mean delay 38 min" icon={<Clock size={15} />} />
        <KpiCard label="Cancelled" value={String(ADMIN_FLIGHTS.filter((f) => f.status === 'CANCELLED').length)} tone="red" note="all re-protected" icon={<X size={15} />} />
        <KpiCard label="Avg turnaround" value="47 min" tone="teal" note="target 50 · Nairobi 95" icon={<RotateCcw size={15} />} />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'board', label: 'Board', count: rows.length },
          { id: 'timeline', label: 'Timeline' },
          { id: 'crew', label: 'Crew & assignments' },
          { id: 'gates', label: 'Gates & stands' },
        ]}
      />

      {tab === 'board' && (
        <Panel pad={false} title="Sector board" lead="Click a row to open the status editor" right={<Button size="sm" variant="ghost" icon={<Filter size={14} />}>Columns</Button>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-[.8125rem]">
              <thead>
                <tr className="border-b border-[#E1E8F0] bg-[#F7FAFC] text-2xs uppercase tracking-wider text-ink-400">
                  {['Flight', 'Route', 'STD / STA', 'Aircraft · reg', 'Load', 'Gate', 'Status', 'Remark', ''].map((h, i) => (
                    <th key={h + i} className={cx('px-3 py-2 font-semibold', i >= 4 && i <= 5 && 'text-right')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF1F6]">
                {rows.map((f) => {
                  const load = Math.round((f.booked / f.capacity) * 100);
                  return (
                    <tr key={f.id} className="group cursor-pointer transition hover:bg-[#F2F7FB]" onClick={() => { setSelected(f); setStatusDraft(f.status); setNote(f.remark ?? ''); }}>
                      <td className="px-3 py-2">
                        <span className="num font-display font-semibold text-[#0B2340]">{f.flightNo}</span>
                        <span className="ml-1.5 text-[.6875rem] text-ink-400">{f.id}</span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="num font-medium">{f.origin} → {f.dest}</span>
                        <span className="block text-[.6875rem] text-ink-400">{cityOf(f.origin)} → {cityOf(f.dest)}</span>
                      </td>
                      <td className="num px-3 py-2">
                        {f.dep} <span className="text-ink-300">/</span> {f.arr}
                        <span className="block text-[.6875rem] text-ink-400">{fmtDate(f.date, 'short')}</span>
                      </td>
                      <td className="px-3 py-2">
                        {f.aircraft}
                        <span className="num block text-[.6875rem] text-ink-400">{f.reg}</span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="num font-semibold text-[#0B2340]">{load}%</span>
                        <span className="block text-[.6875rem] text-ink-400">
                          {f.booked}/{f.capacity}
                        </span>
                      </td>
                      <td className="num px-3 py-2">
                        {f.terminal} · {f.gate}
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={f.status} className="!text-[.5625rem]" />
                      </td>
                      <td className="max-w-[220px] px-3 py-2">
                        <span className="block truncate text-[.75rem] text-ink-500">{f.remark ?? '—'}</span>
                      </td>
                      <td className="px-3 py-2 text-right opacity-0 transition group-hover:opacity-100">
                        <Pencil size={14} className="inline text-ink-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === 'timeline' && (
        <Panel title="Galaxy T1 · bank plan" lead="07:00–11:00, 20-minute grid. Bars are stand occupancy; the dashed outline is a scheduled turnaround.">
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="mb-2 flex text-[.625rem] uppercase tracking-wide text-ink-400">
                <span className="w-[120px] shrink-0">Stand</span>
                {Array.from({ length: 13 }).map((_, i) => (
                  <span key={i} className="num flex-1 border-l border-[#EDF1F6] pl-1">
                    {String(7 + Math.floor(i / 3)).padStart(2, '0')}:{String((i % 3) * 20).padStart(2, '0')}
                  </span>
                ))}
              </div>
              {['A1', 'A3', 'B2', 'B5', 'C1', 'C4', 'C9', 'D2'].map((stand, si) => (
                <div key={stand} className="mb-1 flex items-center">
                  <span className="num w-[120px] shrink-0 text-[.75rem] font-semibold text-[#0B2340]">{stand}</span>
                  <div className="relative h-8 flex-1 rounded-[6px] bg-[#F7FAFC] ring-1 ring-inset ring-[#EDF1F6]">
                    {[0, 1, 2].map((k) => {
                      const start = (si * 2 + k * 3 + si) % 9;
                      if (start > 10) return null;
                      const f = ADMIN_FLIGHTS[(si * 3 + k) % ADMIN_FLIGHTS.length];
                      return (
                        <div
                          key={k}
                          className={cx('absolute top-1 flex h-6 items-center overflow-hidden rounded-[5px] px-1.5 text-[.625rem] font-semibold text-white', f.status === 'DELAYED' ? 'bg-gold-500' : f.status === 'CANCELLED' ? 'bg-red-400' : k === 0 ? 'bg-[#0B2340]' : 'bg-teal-600')}
                          style={{ left: `${(start / 13) * 100}%`, width: `${(2 + (k % 2)) / 13 * 100}%` }}
                          title={`${f.flightNo} ${f.origin}-${f.dest}`}
                        >
                          <span className="truncate">{f.flightNo}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 flex flex-wrap items-center gap-4 text-[.75rem] text-ink-400">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded bg-[#0B2340]" /> inbound</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded bg-teal-600" /> outbound</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded bg-gold-500" /> delayed</span>
            <span className="ml-auto">Two stands over-committed in the 09:20 bank — remote stand C12 is available.</span>
          </p>
        </Panel>
      )}

      {tab === 'crew' && (
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <Panel title="Crew assignments today" lead="Set-based rostering; rest limits enforced at publication" pad={false}>
            <ul className="divide-y divide-[#EDF1F6]">
              {ADMIN_CREW.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0B2340] font-display text-[.6875rem] font-bold text-gold-400">{c.name.split(' ').slice(-1)[0].slice(0, 2).toUpperCase()}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[.875rem] font-semibold text-[#0B2340]">{c.name}</span>
                    <span className="num block text-[.75rem] text-ink-500">
                      {c.role} · {c.licence} · {c.hours.toLocaleString()} h · base {c.base}
                    </span>
                  </span>
                  <Badge tone={c.status.startsWith('On duty') ? 'teal' : c.status.includes('Standby') ? 'sky' : c.status.includes('Training') ? 'gold' : 'neutral'}>{c.status}</Badge>
                  <span className="num text-[.75rem] text-ink-400">rest {c.nextRest}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Assignment conflict" lead="AN 300 needs a senior FO by 13:40">
            <p className="text-[.875rem] leading-relaxed text-ink-600">SFO Grace Wanjiru is on the 512 rotation and cannot be swapped without a rest breach. Two reserve crew are at NBO; one is current on the A321neo.</p>
            <div className="mt-3 space-y-2">
              {ADMIN_CREW.filter((c) => c.role.includes('FO') || c.role.includes('Purser')).map((c) => (
                <button key={c.id} onClick={() => toast({ tone: 'success', title: `Crew ${c.id} assigned to AN 300`, body: 'Rest check passed · roster published to the app.' })} className="flex w-full items-center gap-3 rounded-[10px] border border-[#E1E8F0] p-2.5 text-left transition hover:border-teal-400 hover:bg-teal-50/40">
                  <Users size={14} className="text-ink-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[.8125rem] font-semibold text-[#0B2340]">{c.name}</span>
                    <span className="block text-[.6875rem] text-ink-400">
                      {c.hours.toLocaleString()} h · {c.base}
                    </span>
                  </span>
                  <ChevronRight size={14} className="text-ink-300" />
                </button>
              ))}
            </div>
            <Divider className="my-4" />
            <p className="text-[.75rem] leading-relaxed text-ink-400">If nobody is legal, the sector is delayed rather than flown under an exception — that is the standing instruction, and it is why our captains can decline schedule pressure.</p>
          </Panel>
        </div>
      )}

      {tab === 'gates' && (
        <Panel title="Gate & stand allocation" lead="Drag-free: choose a gate, we check conflicts and notification state" pad={false}>
          <MiniTable
            head={['Gate', 'Stand type', 'Bridges', 'Assigned', 'Passenger notice', 'Status']}
            rows={[
              ['A4', 'Air bridge', '2', 'AN 106', 'sent', 'ok'],
              ['C9', 'Air bridge', '1', 'AN 214', 'sent', 'changed'],
              ['C12', 'Remote', '—', 'AN 300', 'not sent', 'conflict'],
              ['B2', 'Air bridge', '1', '—', 'n/a', 'free'],
              ['D7', 'Air bridge', '2', 'AN 512', 'sent', 'ok'],
            ].map((r) => r.map((c, i) => (i === 5 ? <Badge key={i} tone={c === 'ok' ? 'teal' : c === 'conflict' ? 'red' : c === 'changed' ? 'gold' : 'neutral'}>{c}</Badge> : <span key={i} className={i === 0 ? 'font-semibold' : ''}>{c}</span>)))}
          />
          <div className="flex flex-wrap items-center gap-2 border-t border-[#E1E8F0] px-4 py-3">
            <Button size="sm" onClick={() => toast({ tone: 'success', title: 'Pushed to C12', body: '428 passengers notified by push and SMS; boards updated.' })}>
              Notify passengers of C12
            </Button>
            <Button size="sm" variant="ghost" onClick={() => toast({ tone: 'info', title: 'Released', body: 'C12 put back in the free pool for the 09:40 bank.' })}>
              Release stand
            </Button>
          </div>
        </Panel>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.flightNo} · ${selected.origin} → ${selected.dest}` : ''}
        subtitle={selected ? `${selected.aircraft} ${selected.reg} · booked ${selected.booked}/${selected.capacity} · STD ${selected.dep} · ${fmtDate(selected.date, 'long')}` : ''}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast({ tone: 'success', title: `${selected?.flightNo} updated to ${statusDraft.replace('_', ' ')}`, body: note ? `Reason filed: ${note}` : 'No delay code filed — the board will prompt for one.' });
                setSelected(null);
              }}
              icon={<Save size={15} />}
            >
              Apply & publish
            </Button>
          </>
        }
      >
        {selected && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-3.5">
              <Field label="Status" hint="Publishes to airport boards, the app and SMS in one action">
                <Select value={statusDraft} onChange={(e) => setStatusDraft(e.target.value)}>
                  {['SCHEDULED', 'BOARDING', 'DEPARTED', 'IN AIR', 'LANDED', 'DELAYED', 'GATE CHANGE', 'CANCELLED'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Delay / disruption code">
                <Select defaultValue="ATCF">
                  {[
                    ['ATCF', 'ATC flow control'],
                    ['TECH', 'Technical'],
                    ['OPR', 'Own operations'],
                    ['WX', 'Weather'],
                    ['SEC', 'Security'],
                    ['PRV', 'Private (passenger)'],
                  ].map(([v, l]) => (
                    <option key={v} value={v}>
                      {v} — {l}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Agent note (visible on the crew and station feed)">
                <TextArea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
              </Field>
              <div className="space-y-2">
                <Checkbox label="Trigger duty-of-care: meals at 4 h, hotel overnight" desc={selected.status === 'CANCELLED' ? 'Recommended for this sector — 141 passengers' : 'Not required under 4 hours'} checked={selected.status === 'CANCELLED'} onChange={() => {}} />
                <Checkbox label="Re-protect automatically onto the next AeroNova or partner flight" defaultChecked />
                <Checkbox label="Hold bags and transfer them without telling the passenger" defaultChecked />
              </div>
            </div>
            <div className="space-y-3.5">
              <div className="rounded-[12px] border border-[#E1E8F0] p-3.5">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-400">Load & seats</p>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="num font-display text-[1.5rem] font-semibold text-[#0B2340]">{Math.round((selected.booked / selected.capacity) * 100)}%</span>
                  <span className="num text-[.75rem] text-ink-400">
                    {selected.capacity - selected.booked} seats open
                  </span>
                </div>
                <Meter value={(selected.booked / selected.capacity) * 100} tone={selected.booked / selected.capacity > 0.92 ? 'ember' : 'teal'} className="mt-2" />
                <p className="mt-2 text-[.75rem] leading-relaxed text-ink-500">
                  Premium {Math.round((selected.booked / selected.capacity) * 78)}% · Economy {Math.round((selected.booked / selected.capacity) * 104)}% · 4 wheelchair positions, 2 used
                </p>
              </div>
              <div className="rounded-[12px] border border-[#E1E8F0] p-3.5">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-400">Turnaround</p>
                <ul className="mt-2 space-y-1.5 text-[.8125rem]">
                  {[
                    ['Chocks on', '12:04', 'done'],
                    ['Unload + fuel', '12:09', 'done'],
                    ['Cabin clean', '12:18', 'in progress'],
                    ['Catering', '12:22', 'due'],
                    ['Boarding', '12:38', 'due'],
                  ].map(([k, t, st]) => (
                    <li key={k} className="flex items-center gap-2">
                      <span className={cx('h-1.5 w-1.5 rounded-full', st === 'done' ? 'bg-teal-500' : st === 'in progress' ? 'bg-gold-500' : 'bg-ink-200')} />
                      <span className="flex-1 text-ink-600">{k}</span>
                      <span className="num text-ink-400">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[12px] border border-[#E1E8F0] p-3.5">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-400">Crew</p>
                <p className="mt-1.5 text-[.8125rem] text-ink-600">
                  Set {selected.crewSet} · {ADMIN_CREW[0].name}, {ADMIN_CREW[1].name}, +4 cabin
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminPage>
  );
}

/* ============================= BOOKINGS ============================= */
function Bookings() {
  const { toast } = useStore();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [cabin, setCabin] = useState('all');
  const [open, setOpen] = useState<AdminBooking | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      ADMIN_BOOKINGS.filter(
        (b) => (status === 'all' || b.status === status) && (cabin === 'all' || b.cabin === cabin) && `${b.ref} ${b.passenger} ${b.route} ${b.email}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, status, cabin],
  );

  const cols: Column<AdminBooking>[] = [
    { key: 'ref', header: 'Reference', primary: true, render: (b) => <span className="num">{b.ref}</span> },
    { key: 'passenger', header: 'Lead passenger', render: (b) => <span className="block">{b.passenger}<span className="block text-[.6875rem] font-normal text-ink-400">{b.email}</span></span> },
    { key: 'route', header: 'Route', render: (b) => <span className="num">{b.route}</span> },
    { key: 'flight', header: 'Flight', hideBelow: 'lg' },
    { key: 'date', header: 'Departs', render: (b) => <span className="num">{fmtDate(b.date, 'short')}</span> },
    { key: 'cabin', header: 'Cabin', hideBelow: 'md', render: (b) => <Badge tone={b.cabin === 'Business' ? 'gold' : b.cabin === 'Premium' ? 'sky' : 'neutral'}>{b.cabin} · {b.fare}</Badge> },
    { key: 'pax', header: 'Pax', align: 'right' },
    { key: 'total', header: 'Total', align: 'right', render: (b) => money(b.total, 'USD', { decimals: true }) },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (b) => (
        <Badge tone={b.status === 'CANCELLED' ? 'red' : b.status === 'PENDING' ? 'gold' : b.status === 'REFUND_REQUESTED' ? 'ember' : b.status === 'TICKETED' ? 'teal' : 'sky'}>
          {b.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'act',
      header: '',
      sort: false,
      align: 'right',
      render: (b) => (
        <div className="flex justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); setOpen(b); }} className="rounded-[7px] border border-[#E1E8F0] px-2 py-1 text-[.6875rem] font-semibold text-ink-600 hover:border-navy-400 hover:text-navy-900">
            Open
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminPage
      title="Booking management"
      lead="Every reservation on the system: re-issue, refund, change, split a PNR, add APD, push it to the airport. Reads are logged."
      actions={
        <>
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter: ref, name, email" className="h-9 w-[230px] pl-8 text-[.8125rem]" />
          </div>
          <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={() => toast({ tone: 'info', title: 'New PNR', body: 'A blank booking opened in the agent console — fare quote requires the passenger name.' })}>
            New booking
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Bookings, 7 days" value="28,412" delta={4.1} note="web 46% · mobile 29%" />
        <KpiCard label="Pending ticketing" value={String(ADMIN_BOOKINGS.filter((b) => b.status === 'PENDING').length)} tone="gold" note="oldest 41 min" />
        <KpiCard label="Changes today" value="412" tone="sky" note="68% self-served in app" />
        <KpiCard label="No-shows" value={String(ADMIN_BOOKINGS.filter((b) => b.status === 'NO_SHOW').length)} tone="ember" note="0.62% of departures" />
        <KpiCard label="Value in the queue" value={money(ADMIN_BOOKINGS.filter((b) => b.status === 'PENDING').reduce((s, b) => s + b.total, 0))} tone="teal" note="awaiting payment" />
      </div>

      <Panel pad={false}>
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E1E8F0] px-4 py-3">
          {['all', 'TICKETED', 'CONFIRMED', 'PENDING', 'CHANGED', 'CANCELLED', 'REFUND_REQUESTED', 'NO_SHOW'].map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={cx('rounded-pill border px-2.5 py-1 text-[.75rem] font-semibold transition', status === s ? 'border-[#0B2340] bg-[#0B2340] text-white' : 'border-[#E1E8F0] text-ink-500 hover:border-navy-300')}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
              <span className="num ml-1.5 opacity-70">{s === 'all' ? ADMIN_BOOKINGS.length : ADMIN_BOOKINGS.filter((b) => b.status === s).length}</span>
            </button>
          ))}
          <Select value={cabin} onChange={(e) => setCabin(e.target.value)} className="ml-auto h-8 w-[130px] text-[.75rem]" aria-label="Cabin filter">
            <option value="all">All cabins</option>
            <option value="Economy">Economy</option>
            <option value="Premium">Premium</option>
            <option value="Business">Business</option>
          </Select>
        </div>
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No booking matches" body="Clear the filter, or search by the airline record locator as well as ours." icon={<Search size={20} />} action={<Button size="sm" variant="secondary" onClick={() => { setQ(''); setStatus('all'); setCabin('all'); }}>Reset</Button>} />
          </div>
        ) : (
          <DataTable rows={filtered} columns={cols} pageSize={12} searchable={false} onRowClick={(b) => setOpen(b)} initialSort={{ key: 'date', dir: 'desc' }} />
        )}
      </Panel>

      <Drawer
        open={!!open}
        onClose={() => setOpen(null)}
        title={open ? `PNR ${open.ref}` : ''}
        footer={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => toast({ tone: 'success', title: 'Re-issued', body: 'New e-ticket 216-4471994201 emailed; old ticket voided.' })}>
              Re-issue ticket
            </Button>
            <Button size="sm" variant="secondary" onClick={() => toast({ tone: 'info', title: 'Seat held', body: 'Exit row 20C held for 15 minutes while the passenger decides.' })}>
              Hold seat
            </Button>
            <Button size="sm" variant="danger" onClick={() => { setCancelId(open?.ref ?? null); setOpen(null); }}>
              Cancel
            </Button>
          </div>
        }
      >
        {open && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Status', open.status],
                ['Channel', open.channel],
                ['Flight', open.flight],
                ['Departs', fmtDate(open.date, 'long')],
                ['Fare', `${open.cabin} ${open.fare}`],
                ['Total', money(open.total, 'USD', { decimals: true })],
                ['Bags', String(open.bag)],
                ['Seat', open.seat],
              ].map(([k, v]) => (
                <div key={k} className="rounded-[10px] border border-[#E1E8F0] p-2.5">
                  <p className="text-[.625rem] uppercase tracking-wide text-ink-400">{k}</p>
                  <p className="num mt-0.5 text-[.875rem] font-semibold text-[#0B2340]">{v}</p>
                </div>
              ))}
            </div>
            {open.corporate && (
              <p className="flex items-center gap-2 rounded-[10px] bg-sky-50 px-3 py-2 text-[.8125rem] text-sky-900">
                <Users size={14} /> Corporate PNR · {open.corporate} · bills on the 30-day account, cost centre CLL-TRV
              </p>
            )}
            <Divider label="Segment" />
            <div className="rounded-[12px] border border-[#E1E8F0] p-3.5">
              <p className="num text-[.875rem] font-semibold text-[#0B2340]">
                {open.route} · {open.flight}
              </p>
              <p className="mt-1 text-[.75rem] text-ink-500">
                {fmtDate(open.date, 'long')} · A321neo 9G-AKQ · gate C4 · {open.bag} bag(s) · 1 connection if routed via NBO
              </p>
            </div>
            <Divider label="Seats" />
            <SeatMap aircraft="A321neo" flightNo={open.flight} selected={{ p1: open.seat }} cabinsShown={['ECONOMY']} onChange={(_, id) => toast({ tone: 'success', title: `Seat ${id} reassigned`, body: 'Passenger notified by SMS; airport PDA updated.' })} />
            <Divider label="History" />
            <ul className="space-y-2 text-[.8125rem]">
              {[
                ['Created via web', `${fmtDate(open.issued, 'short')} · agent auto`],
                ['Ticket issued', `${open.email}`],
                ['Baggage added', '1 × 23 kg pre-paid, USD 45'],
                ['Status', open.status.replace('_', ' ')],
              ].map(([a, b]) => (
                <li key={a} className="flex items-start justify-between gap-3 border-b border-[#EDF1F6] pb-1.5">
                  <span className="font-medium text-[#0B2340]">{a}</span>
                  <span className="text-right text-ink-500">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!cancelId}
        onCancel={() => setCancelId(null)}
        onConfirm={() => {
          setCancelId(null);
          toast({ tone: 'warn', title: `${cancelId} cancelled`, body: 'Refund USD 239 to wallet, seats returned to inventory, airport record flagged for bag pull.' });
        }}
        title={`Cancel ${cancelId}?`}
        confirmLabel="Cancel the booking"
        tone="danger"
        body="This voids the tickets and refunds per fare rules. The passenger gets an email and an SMS; the station gets a bag pull if they were already checked in."
      />
    </AdminPage>
  );
}

/* ============================= PASSENGERS ============================= */
function Passengers() {
  const { toast } = useStore();
  const [mode, setMode] = useState<'manifest' | 'people' | 'assist'>('people');
  const [flight, setFlight] = useState(ADMIN_FLIGHTS[0].flightNo);
  const manifest = useMemo(() => ADMIN_BOOKINGS.slice(0, 14).map((b, i) => ({ ...b, seatNo: `${10 + i}${['A', 'C', 'D', 'F'][i % 4]}`, assist: i % 5 === 0 ? 'WCHS' : i % 7 === 0 ? 'AVIH' : '', doc: `••••${(4000 + i * 7).toString().slice(-4)}` })), []);
  const board = statusBoard(toISODate(new Date()), BY_CODE.get(ADMIN_FLIGHTS[0].origin)?.code);

  return (
    <AdminPage
      title="Passenger management"
      lead="Manifests, special service requests, document status and the individual record any agent can pull up in nine seconds."
      actions={
        <>
          <Button size="sm" variant="secondary" icon={<PlaneLanding size={14} />} onClick={() => toast({ tone: 'success', title: 'Manifest exported', body: 'APC + API pack generated for the destination authority, encrypted, receipt logged.' })}>
            Export manifest
          </Button>
          <Button size="sm" icon={<Plus size={14} />}>Add service request</Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Guests today" value="4,812" note="across 34 sectors" icon={<Users size={15} />} />
        <KpiCard label="Special assistance" value="118" tone="sky" note="wheelchairs 64 · medical 21 · UM 9" />
        <KpiCard label="Document warnings" value="27" tone="gold" note="expiry inside 6 months" />
        <KpiCard label="Unaccompanied minors" value="9" tone="teal" note="guardian agents assigned" />
        <KpiCard label="No-shows" value="31" tone="ember" note="0.64% · bags pulled" />
      </div>

      <Tabs
        value={mode}
        onChange={setMode}
        items={[
          { id: 'people', label: 'Customer records', count: ADMIN_BOOKINGS.length },
          { id: 'manifest', label: 'Flight manifest' },
          { id: 'assist', label: 'Assistance queue' },
        ]}
      />

      {mode === 'people' && (
        <Panel pad={false}>
          <DataTable
            searchable
            rows={ADMIN_BOOKINGS.map((b, i) => ({ id: b.id, name: b.passenger, email: b.email, tier: ['Elite', 'Voyager', 'Explorer', 'Elite Plus'][i % 4], points: 1000 * ((i * 37) % 140), pnr: b.ref, route: b.route, date: b.date, seat: b.seat, doc: `••••${(4000 + i * 7).toString().slice(-4)}`, status: b.status }))}
            columns={[
              { key: 'name', header: 'Passenger', primary: true, render: (r: { name: string; email: string }) => <span>{r.name}<span className="block text-[.6875rem] font-normal text-ink-400">{r.email}</span></span> },
              { key: 'tier', header: 'Tier', render: (r: { tier: string }) => <Badge tone={r.tier === 'Elite Plus' ? 'ember' : r.tier === 'Elite' ? 'gold' : 'neutral'}>{r.tier}</Badge> },
              { key: 'points', header: 'Points', align: 'right' },
              { key: 'pnr', header: 'PNR', hideBelow: 'sm' },
              { key: 'route', header: 'Next sector', hideBelow: 'md' },
              { key: 'date', header: 'Date', hideBelow: 'md', render: (r: { date: string }) => <span className="num">{fmtDate(r.date, 'short')}</span> },
              { key: 'seat', header: 'Seat', align: 'center' },
              { key: 'doc', header: 'Doc', hideBelow: 'lg', render: (r: { doc: string }) => <span className="num text-ink-500">{r.doc}</span> },
              { key: 'status', header: 'Status', align: 'right', render: (r: { status: string }) => <Badge tone={r.status === 'CANCELLED' ? 'red' : 'teal'}>{r.status.replace('_', ' ')}</Badge> },
              {
                key: 'a',
                header: '',
                sort: false,
                render: () => (
                  <Menu label={() => <span className="text-ink-400 hover:text-navy-800">⋯</span>} widthClass="w-60">
                    {(close) => (
                      <>
                        <MenuItem onClick={() => { close(); toast({ tone: 'success', title: 'Record opened', body: 'Full history, documents and payment for this passenger.' }); }}>Open record</MenuItem>
                        <MenuItem onClick={() => { close(); toast({ tone: 'info', title: 'SMS queued', body: 'Gate change message sent to the mobile on file.' }); }}>Send SMS</MenuItem>
                        <MenuItem onClick={() => { close(); toast({ tone: 'warn', title: 'Flagged for review', body: 'Document mismatch — a supervisor sees this in the queue.' }); }}>Flag document</MenuItem>
                      </>
                    )}
                  </Menu>
                ),
              },
            ]}
            pageSize={10}
            onRowClick={() => toast({ tone: 'info', title: 'Passenger record', body: 'Opens the full dossier: 3 bookings, 2 documents, 1 open case.' })}
          />
        </Panel>
      )}

      {mode === 'manifest' && (
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <Panel
            pad={false}
            title={`Manifest · ${flight}`}
            lead={`${ADMIN_FLIGHTS[0].origin} → ${ADMIN_FLIGHTS[0].dest} · A321neo · ${manifest.length} of 192 shown`}
            right={
              <Select value={flight} onChange={(e) => setFlight(e.target.value)} className="h-8 w-[110px] text-[.75rem]" aria-label="Choose flight">
                {ADMIN_FLIGHTS.slice(0, 8).map((f) => (
                  <option key={f.id}>{f.flightNo}</option>
                ))}
              </Select>
            }
          >
            <table className="w-full text-left text-[.8125rem]">
              <thead>
                <tr className="border-b border-[#E1E8F0] bg-[#F7FAFC] text-2xs uppercase tracking-wider text-ink-400">
                  {['Seat', 'Passenger', 'Status', 'Serv.', 'Bags', 'Doc'].map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF1F6]">
                {manifest.map((m) => (
                  <tr key={m.id} className="transition hover:bg-[#F2F7FB]">
                    <td className="num px-3 py-2 font-semibold text-[#0B2340]">{m.seatNo}</td>
                    <td className="px-3 py-2">
                      {m.passenger}
                      <span className="block text-[.6875rem] text-ink-400">
                        {m.cabin} {m.fare} · {m.pax} pax
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <Badge tone={m.status === 'TICKETED' ? 'teal' : m.status === 'NO_SHOW' ? 'red' : m.status === 'CANCELLED' ? 'red' : 'sky'}>{m.status.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-3 py-2">{m.assist ? <Badge tone="gold">{m.assist}</Badge> : <span className="text-ink-300">—</span>}</td>
                    <td className="num px-3 py-2">{m.bag}</td>
                    <td className="num px-3 py-2 text-ink-500">{m.doc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-wrap items-center gap-3 border-t border-[#E1E8F0] px-4 py-2.5 text-[.75rem] text-ink-500">
              <span className="num">Seat map: 176 sold · 8 open · 4 premium unsold</span>
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => toast({ tone: 'success', title: 'Upsell sent', body: 'Four premium seats offered to Elite members at USD 96; two accepted in 40 seconds.' })}>
                Offer premium upsell
              </Button>
            </div>
          </Panel>
          <div className="space-y-4">
            <Panel title="Service requests on this sector">
              <ul className="space-y-2.5">
                {[
                  { k: 'WCHS · aisle chair', n: '2', d: 'Guardian agent + lift available; boarding group 2' },
                  { k: 'AVIH · live animal', n: '1', d: 'Dog, hold, temperature cleared at 26°C' },
                  { k: 'UMNR · unaccompanied minor', n: '1', d: 'Age 9 · handover to grandmother at LOS' },
                  { k: 'BLND · blind passenger', n: '1', d: 'Verbal briefing + assistance dog in cabin' },
                  { k: 'MEAL · Kosher', n: '1', d: 'Loaded at ACC, sealed, seat 18F' },
                ].map((x) => (
                  <li key={x.k} className="flex items-start gap-3 rounded-[10px] border border-[#E1E8F0] p-2.5">
                    <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-[8px] bg-gold-100 text-[.75rem] font-bold text-gold-600">{x.n}</span>
                    <span className="min-w-0">
                      <span className="block text-[.8125rem] font-semibold text-[#0B2340]">{x.k}</span>
                      <span className="block text-[.6875rem] leading-snug text-ink-500">{x.d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Connections to protect" lead="Passengers at risk on the onward bank">
              <ul className="space-y-2">
                {board.slice(0, 4).map((b) => (
                  <li key={b.flightNo} className="flex items-center gap-3 rounded-[10px] border border-[#E1E8F0] px-3 py-2">
                    <span className="num text-[.8125rem] font-semibold text-[#0B2340]">{b.flightNo}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      )}

      {mode === 'assist' && (
        <Panel pad={false} title="Assistance queue" lead="Five-minute response promise, 99.2% met last month">
          <table className="w-full min-w-[720px] text-left text-[.8125rem]">
            <thead>
              <tr className="border-b border-[#E1E8F0] bg-[#F7FAFC] text-2xs uppercase tracking-wider text-ink-400">
                {['Request', 'Passenger', 'Flight', 'Station', 'Waiting', 'Agent', ''].map((h) => (
                  <th key={h} className="px-3 py-2 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1F6]">
              {[
                ['WCHR · ramp', 'A. Okafor', 'AN 106', 'ACC', '2 min', 'E. Tetteh'],
                ['WCHC · to seat', 'M. Nkosi', 'AN 300', 'NBO', '4 min', 'awaiting'],
                ['Sunflower lanyard', 'P. Dlamini', 'AN 512', 'JNB', '1 min', 'S. Khumalo'],
                ['Assistance dog', 'R. Abubakar', 'AN 730', 'ACC', '0 min', 'E. Tetteh'],
                ['Bassinet + family lane', 'C. Mwaka', 'AN 372', 'NBO', '9 min', 'overdue'],
                ['Oxygen · approved', 'J. Van Wyk', 'AN 204', 'LHR', '3 min', 'crew briefed'],
              ].map((r) => (
                <tr key={r[1]} className="transition hover:bg-[#F2F7FB]">
                  <td className="px-3 py-2 font-semibold text-[#0B2340]">{r[0]}</td>
                  <td className="px-3 py-2">{r[1]}</td>
                  <td className="num px-3 py-2">{r[2]}</td>
                  <td className="px-3 py-2">{r[3]}</td>
                  <td className={cx('num px-3 py-2 font-semibold', r[4].startsWith('9') ? 'text-red-600' : 'text-teal-700')}>{r[4]}</td>
                  <td className="px-3 py-2 text-ink-500">{r[5]}</td>
                  <td className="px-3 py-2 text-right">
                    <Button size="sm" variant="ghost" onClick={() => toast({ tone: 'success', title: 'Agent dispatched', body: 'Assistant at the gate in 3 minutes; promise clock reset.' })}>
                      Assign
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </AdminPage>
  );
}

/* ============================= AIRPORTS ============================= */
function AirportsAdmin() {
  const { toast } = useStore();
  const [sel, setSel] = useState<string | null>(null);
  const [counters, setCounters] = useState(24);
  const [minConnect, setMinConnect] = useState(45);
  const a = sel ? BY_CODE.get(sel) : null;
  return (
    <AdminPage
      title="Airport management"
      lead="Stations, counters, gate banks, minimum connect times and the facilities the passenger site advertises. Everything here changes what travellers see."
      actions={
        <>
          <Button size="sm" variant="secondary" icon={<MapPin size={14} />}>
            Add station
          </Button>
          <Button size="sm" icon={<Save size={14} />} onClick={() => toast({ tone: 'success', title: 'Station data published', body: 'Airport pages, MCT in the booking engine and the app were updated together.' })}>
            Save & publish
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Stations served" value={String(AIRPORTS.length)} note="3 hubs · 5 regions" icon={<MapPin size={15} />} />
        <KpiCard label="Counters owned" value="112" tone="teal" note="benches, incl. shared desks" />
        <KpiCard label="Ramp congestion today" value="1 station" tone="gold" note="LOS · 19 min median bag drop" />
        <KpiCard label="Adverse weather" value="0" tone="sky" note="all stations normal ops" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel pad={false} title="Stations" lead="Click a row to edit its public guide">
          <div className="max-h-[520px] overflow-y-auto">
            <table className="w-full min-w-[760px] text-left text-[.8125rem]">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-[#E1E8F0] bg-[#F7FAFC] text-2xs uppercase tracking-wider text-ink-400">
                  {['Code', 'Station', 'Country', 'Ctrs', 'Gates', 'Stands', 'Sectors/day', 'MCT', 'Ops', 'OTP'].map((h, i) => (
                    <th key={h} className={cx('px-3 py-2 font-semibold', i > 2 && 'text-right')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF1F6]">
                {ADMIN_AIRPORT_ROWS.map((r) => (
                  <tr key={r.code} onClick={() => { setSel(r.code); setCounters(r.counters); setMinConnect(r.minConnect); }} className={cx('cursor-pointer transition hover:bg-[#F2F7FB]', sel === r.code && 'bg-sky-50/70')}>
                    <td className="num px-3 py-2 font-display font-bold text-[#0B2340]">{r.code}</td>
                    <td className="px-3 py-2">
                      {r.name}
                      {r.code === 'ACC' && <Badge tone="gold" className="ml-2">
                        HUB
                      </Badge>}
                    </td>
                    <td className="px-3 py-2 text-ink-500">{r.country}</td>
                    <td className="num px-3 py-2 text-right">{r.counters}</td>
                    <td className="num px-3 py-2 text-right">{r.gates}</td>
                    <td className="num px-3 py-2 text-right">{r.stands}</td>
                    <td className="num px-3 py-2 text-right">{r.dailySectors}</td>
                    <td className="num px-3 py-2 text-right">{r.minConnect}′</td>
                    <td className="px-3 py-2 text-right">
                      <Badge tone={r.status === 'Normal ops' ? 'teal' : r.status === 'Ramp congestion' ? 'gold' : 'ember'}>{r.status}</Badge>
                    </td>
                    <td className={cx('num px-3 py-2 text-right font-semibold', r.otp > 85 ? 'text-teal-700' : 'text-gold-600')}>{r.otp}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title={a ? `Edit · ${a.city} (${a.code})` : 'Select a station'} lead={a?.name}>
            {!a ? (
              <EmptyState title="Nothing selected" body="Pick a station on the left to edit its counters, connect times and public text." icon={<MapPin size={20} />} />
            ) : (
              <div className="space-y-3.5">
                <Field label="Counter rows" hint="Shown in “where to stand” on the public site">
                  <Input defaultValue={a.counters} />
                </Field>
                <Field label={`Check-in benches: ${counters}`}>
                  <RangeSlider min={4} max={64} value={[counters, counters]} onChange={(v) => setCounters(v[0])} format={(n) => `${n} benches`} />
                </Field>
                <Field label="Minimum connect time" hint="Drives whether the booking engine sells the connection at all">
                  <div className="flex items-center gap-3">
                    <input type="range" min={30} max={120} step={5} value={minConnect} onChange={(e) => setMinConnect(Number(e.target.value))} className="h-1.5 flex-1 appearance-none rounded-full bg-mist-200 accent-teal-500" aria-label="Minimum connect time" />
                    <span className="num w-16 text-right font-display text-[1.125rem] font-semibold text-[#0B2340]">{minConnect}′</span>
                  </div>
                </Field>
                <div className="rounded-[10px] border border-[#E1E8F0] p-3">
                  <p className="text-2xs font-semibold uppercase tracking-wider text-ink-400">Facilities shown publicly</p>
                  <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {a.facilities.slice(0, 6).map((f, i) => (
                      <label key={f} className="flex items-center gap-2 text-[.75rem] text-ink-600">
                        <input type="checkbox" defaultChecked={i < 5} /> {f}
                      </label>
                    ))}
                  </div>
                </div>
                <Field label="Public blurb">
                  <TextArea rows={3} defaultValue={a.blurb} />
                </Field>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => toast({ tone: 'success', title: `${a.code} saved`, body: 'MCT change affects the booking engine immediately — 3 routes now need 10 more minutes.' })} icon={<Check size={14} />}>
                    Save station
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toast({ tone: 'info', title: 'Preview opened', body: `Public guide for ${a.code} rendered in a new tab.` })}>
                    Preview public page
                  </Button>
                </div>
              </div>
            )}
          </Panel>
          <Panel title="Lounges" lead="Access rules are shared with the loyalty engine">
            <MiniTable head={['Lounge', 'Station', 'Hours', 'Seats', 'Access']} rows={AIRPORTS.filter((x) => x.lounges.length > 1).slice(0, 5).map((x) => [x.lounges[0], x.code, x.lounges.length > 1 ? '04:00–01:00' : '05:00–22:00', String(180 + x.gates * 12), 'Business · Elite · pass'])} />
          </Panel>
        </div>
      </div>
    </AdminPage>
  );
}

/* ============================= AIRCRAFT ============================= */
function Aircraft() {
  const { toast } = useStore();
  const [sel, setSel] = useState<(typeof ADMIN_AIRCRAFT)[number] | null>(null);
  const [defer, setDefer] = useState(false);
  return (
    <AdminPage
      title="Aircraft management"
      lead="Fleet status, defects, MEL deferrals and the maintenance programme. Anything deferred here is visible to the captain before they accept the aircraft."
      actions={
        <>
          <Button size="sm" variant="secondary" icon={<Wrench size={14} />}>
            Log a defect
          </Button>
          <Button size="sm" icon={<Plus size={14} />}>Schedule check</Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="In service" value="41 / 46" tone="teal" note="5 in scheduled maintenance" icon={<Plane size={15} />} />
        <KpiCard label="AOG" value="1" tone="red" note="9G-AZD · LOS hydraulic" />
        <KpiCard label="Open defects" value="7" tone="gold" note="2 MEL category B" />
        <KpiCard label="Avg utilisation" value="11.4 h" note="per aircraft per day" tone="sky" />
        <KpiCard label="Dispatch reliability" value="99.6%" tone="teal" note="rolling 30 days" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel pad={false} title="Aircraft in the fleet" lead="Sorted by those needing a decision">
          <table className="w-full min-w-[860px] text-left text-[.8125rem]">
            <thead>
              <tr className="border-b border-[#E1E8F0] bg-[#F7FAFC] text-2xs uppercase tracking-wider text-ink-400">
                {['Registration', 'Type', 'Status', 'Hours / cycles', 'Next check', 'Config', 'Load', ''].map((h, i) => (
                  <th key={h} className={cx('px-3 py-2 font-semibold', i >= 3 && i <= 6 && 'text-right')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1F6]">
              {ADMIN_AIRCRAFT.map((ac) => {
                const out = ac.status.includes('AOG') || ac.status.includes('Maintenance');
                return (
                  <tr key={ac.reg} onClick={() => setSel(ac)} className={cx('cursor-pointer transition hover:bg-[#F2F7FB]', out && 'bg-red-50/40')}>
                    <td className="num px-3 py-2 font-display font-bold text-[#0B2340]">{ac.reg}</td>
                    <td className="px-3 py-2">
                      {ac.type}
                      <span className="num block text-[.6875rem] text-ink-400">
                        msn {ac.msn} · {ac.year}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <Badge tone={ac.status.includes('AOG') ? 'red' : ac.status.includes('Maintenance') ? 'gold' : 'teal'}>{ac.status}</Badge>
                    </td>
                    <td className="num px-3 py-2 text-right">
                      {ac.hours.toLocaleString()} h
                      <span className="block text-[.6875rem] text-ink-400">{ac.cycles.toLocaleString()} cycles</span>
                    </td>
                    <td className="px-3 py-2 text-right text-ink-500">{ac.nextCheck}</td>
                    <td className="num px-3 py-2 text-right text-[.75rem]">{ac.config}</td>
                    <td className="px-3 py-2 text-right">{ac.load > 0 ? <span className="num font-semibold">{ac.load}%</span> : <span className="text-ink-300">—</span>}</td>
                    <td className="px-3 py-2 text-right">
                      <ChevronRight size={14} className="inline text-ink-300" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        <div className="space-y-4">
          <Panel title="Maintenance programme" lead="Next 30 days">
            <ul className="space-y-2.5">
              {[
                { d: '15 Sep', t: '9G-ANR · A-check completion', p: 78, tone: 'gold' as const },
                { d: '19 Sep', t: '9G-AVL · first A-check', p: 12, tone: 'sky' as const },
                { d: '27 Sep', t: '9G-AKQ · A-check', p: 34, tone: 'navy' as const },
                { d: '12 Nov', t: '9G-AIN · A-check', p: 4, tone: 'navy' as const },
                { d: '3 Feb', t: '9G-AIX · C-check (Tema)', p: 0, tone: 'neutral' as const },
              ].map((x) => (
                <li key={x.d + x.t} className="rounded-[10px] border border-[#E1E8F0] p-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="num text-[.75rem] font-semibold text-ink-400">{x.d}</span>
                    <Badge tone={x.tone}>{x.p}% planned</Badge>
                  </div>
                  <p className="mt-1 text-[.875rem] font-medium text-[#0B2340]">{x.t}</p>
                  <Meter value={x.p} tone={x.tone === 'gold' ? 'gold' : 'teal'} className="mt-1.5" />
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Fleet reliability" lead="Defects per 1,000 sectors, by type">
            <BarList
              tone="ember"
              rows={FLEET.map((f, i) => ({ label: f.name, value: [4.1, 3.4, 6.8, 2.9][i], note: `${f.delivered} aircraft · on-time ${f.onTime}%` }))}
            />
            <p className="mt-3 text-[.75rem] leading-relaxed text-ink-400">Repeat-defect rate is 18% below industry because one engineer owns an airframe per rotation. The A330 number reflects the new Trent 7000 borescope programme.</p>
          </Panel>
        </div>
      </div>

      <Modal
        open={!!sel}
        onClose={() => setSel(null)}
        title={sel ? `${sel.reg} · ${sel.type}` : ''}
        subtitle={sel ? `msn ${sel.msn} · delivered ${sel.year} · base ${sel.base} · ${sel.config}` : ''}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSel(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                toast(defer ? { tone: 'warn', title: 'MEL deferral filed', body: 'Category B · repaired within 3 days. Captain briefed; dispatch released with the item inactivated.' } : { tone: 'success', title: 'Aircraft released to service', body: 'Logbook signed off, crew notified, the 516 rotation is back to normal.' });
                setSel(null);
              }}
            >
              {defer ? 'File deferral' : 'Release to service'}
            </Button>
          </>
        }
      >
        {sel && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ['Airframe hours', sel.hours.toLocaleString()],
                ['Cycles', sel.cycles.toLocaleString()],
                ['Status', sel.status],
                ['Next check', sel.nextCheck],
              ].map(([k, v]) => (
                <div key={k} className="rounded-[10px] border border-[#E1E8F0] p-3">
                  <p className="text-[.625rem] uppercase tracking-wide text-ink-400">{k}</p>
                  <p className="num mt-0.5 text-[.875rem] font-semibold text-[#0B2340]">{v}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-wider text-ink-400">Open technical log</p>
              <ul className="mt-2 space-y-2">
                {[
                  { t: 'Hydraulic system B pressure low', ref: '29-11-01A', cat: 'B', note: 'Quantity within limits after service 08:40 · monitoring 3 sectors' },
                  { t: 'Cabin seat 14F recline inoperative', ref: '25-62-02', cat: 'C', note: 'Blocked upright, passenger reassigned at check-in' },
                  { t: 'APU bleed air slow to respond', ref: '49-41-00', note: 'Scheduled for the 19 Sep check', cat: 'D' },
                ].map((x) => (
                  <li key={x.t} className="flex items-start gap-3 rounded-[10px] border border-[#E1E8F0] p-3">
                    <span className={cx('num grid h-7 w-7 shrink-0 place-items-center rounded-[8px] text-[.6875rem] font-bold', x.cat === 'B' ? 'bg-gold-100 text-gold-600' : x.cat === 'C' ? 'bg-mist-100 text-ink-500' : 'bg-sky-100 text-sky-800')}>{x.cat}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[.875rem] font-semibold text-[#0B2340]">{x.t}</span>
                      <span className="num block text-[.6875rem] text-ink-400">MEL {x.ref}</span>
                      <span className="mt-1 block text-[.75rem] leading-snug text-ink-500">{x.note}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[12px] bg-[#F7FAFC] p-3.5">
              <Checkbox label="Defer under MEL rather than hold the aircraft" desc="Category B allows 3 days. The captain sees this before accepting the aircraft, always." checked={defer} onChange={setDefer} />
              <Checkbox label="Book the Tema heavy facility slot" desc="Auto-suggested from the parts ETA of 14:20." defaultChecked />
            </div>
          </div>
        )}
      </Modal>
    </AdminPage>
  );
}

/* ============================= DESTINATIONS ============================= */
function DestinationsAdmin() {
  const { toast } = useStore();
  const [edit, setEdit] = useState<(typeof DESTINATIONS)[number] | null>(null);
  const rows = DESTINATIONS.map((d) => {
    const r = Math.abs(d.city.length * 7 + d.startFare) % 40;
    return { ...d, bookings: 4200 + r * 137, load: 68 + (r % 26), revenue: Math.round((d.startFare * (40 + (r % 40))) / 10) / 10, trend: -4 + (r % 18) / 2 };
  });
  return (
    <AdminPage
      title="Destination management"
      lead="Route frequency, public guide content and the load factor that justifies the schedule. Removing a frequency here changes what the engine can sell."
      actions={
        <>
          <Button size="sm" variant="secondary" icon={<Search size={14} />}>
            Route profitability
          </Button>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => toast({ tone: 'info', title: 'New station request', body: 'Opened the commercial case form — needs a slot assessment and a 3-year demand model.' })}>
            Propose a route
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Destinations" value={String(DESTINATIONS.length)} note="of 41 served · guides published" />
        <KpiCard label="Routes profitable" value="33 / 41" tone="teal" note="8 under review for 2027" />
        <KpiCard label="Weakest load factor" value="61.2%" tone="gold" note="ACC–MRU winter, cut to 4 weekly" />
        <KpiCard label="Highest yield" value="$0.186" tone="sky" note="ACC–LOS, intra-Africa" />
        <KpiCard label="New routes 2027" value="3" tone="ember" note="Kumasi LHR 3rd daily, plus two African" />
      </div>

      <Panel pad={false} title="Guided destinations" lead="Content, schedule and commercial performance in one place">
        <DataTable
          searchable={false}
          rows={rows}
          pageSize={10}
          columns={[
            { key: 'city', header: 'Destination', primary: true, render: (r: (typeof rows)[number]) => <span>{r.city} <span className="num text-[.6875rem] font-normal text-ink-400">{r.code}</span><span className="block text-[.6875rem] font-normal text-ink-400">{r.country} · {r.region}</span></span> },
            { key: 'weekly', header: 'Weekly freq', align: 'right', render: (r: (typeof rows)[number]) => <span className="num">{r.weekly}</span> },
            { key: 'startFare', header: 'Lowest fare', align: 'right', render: (r: (typeof rows)[number]) => <span className="num">{money(r.startFare)}</span> },
            { key: 'bookings', header: 'Bookings 30d', align: 'right', hideBelow: 'sm' },
            { key: 'load', header: 'Load', hideBelow: 'md', render: (r: (typeof rows)[number]) => <Meter value={r.load} tone={r.load > 85 ? 'teal' : r.load < 70 ? 'ember' : 'navy'} className="w-24" /> },
            { key: 'revenue', header: 'Revenue', align: 'right', hideBelow: 'lg', render: (r: (typeof rows)[number]) => <span className="num">{money(r.revenue * 1000)}</span> },
            { key: 'trend', header: 'Trend', align: 'right', render: (r: (typeof rows)[number]) => <span className={cx('num font-semibold', r.trend >= 0 ? 'text-teal-700' : 'text-red-600')}>{r.trend >= 0 ? '+' : ''}{r.trend}%</span> },
            { key: 'tags', header: 'Tags', hideBelow: 'xl', render: (r: (typeof rows)[number]) => <span className="flex flex-wrap gap-1">{r.tags.slice(0, 2).map((t) => <span key={t} className="rounded-pill bg-mist-100 px-1.5 text-[.625rem] text-ink-500">{t}</span>)}</span> },
            {
              key: 'a',
              header: '',
              sort: false,
              align: 'right',
              render: (r: (typeof rows)[number]) => (
                <div className="flex justify-end gap-1">
                  <button onClick={(e) => { e.stopPropagation(); setEdit(r); }} className="rounded-[7px] border border-[#E1E8F0] px-2 py-1 text-[.6875rem] font-semibold text-ink-600 hover:border-navy-400 hover:text-navy-900">
                    Edit
                  </button>
                </div>
              ),
            },
          ]}
          onRowClick={(r) => setEdit(r as never)}
        />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Frequency changes pending" lead="Effective the 2027 winter season">
          <MiniTable head={['Route', 'Now', 'Proposed', 'Reason', 'Decision']} rows={[['ACC – MRU', '7 weekly', '4 weekly', 'Load factor 61.2% in winter', 'approved'], ['LOS – JNB', '5 weekly', '7 weekly', 'Yield 15.8c, slot granted', 'pending slots'], ['NBO – ZNZ', '4 weekly', '5 weekly', 'Weekend demand +19%', 'approved'], ['ACC – PHC', '3 weekly', '2 weekly', 'Sahel undercutting by 22%', 'under review']].map((r) => r.map((c, i) => (i === 4 ? <Badge key={i} tone={c === 'approved' ? 'teal' : c === 'pending slots' ? 'gold' : 'neutral'}>{c}</Badge> : <span key={i} className={i === 0 ? 'num font-semibold' : ''}>{c}</span>)))} />
        </Panel>
        <Panel title="Content workflow" lead="Station teams submit; brand and legal review before publish">
          <ul className="space-y-2">
            {DESTINATIONS.slice(0, 5).map((d, i) => (
              <li key={d.slug} className="flex items-center gap-3 rounded-[10px] border border-[#E1E8F0] p-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-mist-100 font-display text-[.6875rem] font-bold text-navy-700">{d.code}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[.8125rem] font-semibold text-[#0B2340]">{d.city} guide</span>
                  <span className="block text-[.6875rem] text-ink-400">{['legal review', 'published', 'photos pending', 'draft', 'published'][i]} · {d.attractions.length} attractions · {d.hotels.length} hotels</span>
                </span>
                <Badge tone={i % 2 ? 'teal' : 'gold'}>{i % 2 ? 'live' : 'in review'}</Badge>
              </li>
            ))}
          </ul>
          <Button size="sm" variant="secondary" className="mt-3 w-full" icon={<ArrowUpRight size={14} />}>
            Open the CMS
          </Button>
        </Panel>
      </div>

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit ? `${edit.city} · ${edit.code}` : ''}
        subtitle="Changes publish to the public site and the booking engine together"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEdit(null)}>
              Cancel
            </Button>
            <Button onClick={() => { toast({ tone: 'success', title: `${edit?.city} updated`, body: 'Guide and frequency data published; cache cleared for 4 markets.' }); setEdit(null); }}>
              Publish
            </Button>
          </>
        }
      >
        {edit && (
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Tagline">
              <Input defaultValue={edit.tagline} />
            </Field>
            <Field label="Best time to visit">
              <Input defaultValue={edit.bestTime} />
            </Field>
            <Field label="Weekly frequencies" className="sm:col-span-1">
              <Input type="number" defaultValue={edit.weekly} className="num" />
            </Field>
            <Field label="Lowest published fare (USD)">
              <Input type="number" defaultValue={edit.startFare} className="num" />
            </Field>
            <Field label="Visa note" className="sm:col-span-2" hint="Legal reviews this text before it appears anywhere">
              <TextArea rows={2} defaultValue={edit.visa} />
            </Field>
            <Field label="Blurb" className="sm:col-span-2">
              <TextArea rows={3} defaultValue={edit.blurb} />
            </Field>
            <div className="sm:col-span-2">
              <Checkbox label="Mark route as seasonal" desc="Reduces the schedule automatically outside the window." defaultChecked />
              <Checkbox label="Allow stopover pricing" desc="Lets the engine price a free stopover in Johannesburg or Nairobi." defaultChecked />
            </div>
          </div>
        )}
      </Modal>
    </AdminPage>
  );
}

export const OpsPages = [
  { path: 'flights', el: <Flights /> },
  { path: 'bookings', el: <Bookings /> },
  { path: 'passengers', el: <Passengers /> },
  { path: 'airports', el: <AirportsAdmin /> },
  { path: 'aircraft', el: <Aircraft /> },
  { path: 'destinations', el: <DestinationsAdmin /> },
];

export { Flights, Bookings as AdminBookings, Passengers, AirportsAdmin, Aircraft, DestinationsAdmin };