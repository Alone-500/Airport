import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Bell, CalendarDays, Clock, CloudSun, Plane, PlaneLanding, PlaneTakeoff, RefreshCw, Search, Ticket } from 'lucide-react';
import { cx, durationLabel, fmtDate, toISODate, DAY, parseISODate } from '../../lib/utils';
import { statusBoard, trackFlight } from '../../data/flights';
import { BY_CODE, cityOf } from '../../data/airports';
import { FLEET } from '../../data/fleet';
import { Badge, Button, Divider, EmptyState, SectionHeading, StatusBadge } from '../../components/ui/Primitives';
import { Breadcrumbs, Modal } from '../../components/ui/Overlay';
import { Checkbox, DateField, Field, Input, SegmentedControl } from '../../components/ui/Form';
import { useStore } from '../../store/store';

const STATUS_COPY: Record<string, { text: string; tone: 'teal' | 'gold' | 'navy' | 'red' | 'sky' | 'neutral' }> = {
  ON_TIME: { text: 'Departing and arriving as scheduled.', tone: 'teal' },
  BOARDING: { text: 'Boarding is open at the gate now.', tone: 'sky' },
  DELAYED: { text: 'Delayed — new time below. Meals at 4 h, hotel overnight if the wait crosses the night.', tone: 'gold' },
  DEPARTED: { text: 'Airborne. We will update the arrival time on descent.', tone: 'navy' },
  LANDED: { text: 'Arrived. Bags are on the belt — the belt number is at the bottom.', tone: 'teal' },
  CANCELLED: { text: 'Cancelled. Free rebooking on the next AeroNova or partner flight; tap to see your options.', tone: 'red' },
  DIVERTED: { text: 'Diverted to the alternate. Crew will call every passenger.', tone: 'gold' },
};

export default function FlightStatus() {
  const [params] = useSearchParams();
  const { toast } = useStore();
  const [mode, setMode] = useState<'flight' | 'route'>(params.get('flight') ? 'flight' : 'flight');
  const [flight, setFlight] = useState(params.get('flight') ?? 'AN 214');
  const [date, setDate] = useState(params.get('date') ?? toISODate(new Date()));
  const [from, setFrom] = useState(params.get('from') ?? 'ACC');
  const [to, setTo] = useState(params.get('to') ?? 'LOS');
  const [looked, setLooked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(false);
  const [email, setEmail] = useState('');

  const board = useMemo(() => statusBoard(date, mode === 'route' ? from : undefined), [date, mode, from]);
  const result = useMemo(() => {
    if (!looked) return null;
    if (mode === 'flight') return trackFlight(flight, date);
    const hit = board.find((f) => f.origin === from.toUpperCase() && f.destination === to.toUpperCase());
    return hit ?? null;
  }, [looked, mode, flight, date, from, to, board]);

  const search = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLooked(true);
    }, 700);
  };

  const status = result ? STATUS_COPY[result.status] ?? { text: '', tone: 'neutral' as const } : null;
  const sched = result ? new Date(result.schedDep) : null;
  const progress = result ? Math.max(0.02, Math.min(0.99, (Date.now() - sched!.getTime()) / (new Date(result.estArr).getTime() - sched!.getTime()))) : 0;

  return (
    <div className="bg-mist-50/60 pb-16">
      <div className="relative overflow-hidden bg-navy-900 pb-10 pt-[calc(var(--nav)+2.5rem)] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] texture-grid" />
        <img src="/img/airport-night.jpg" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25" aria-hidden />
        <div className="relative shell">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Flight status' }]} dark className="mb-5" />
          <div className="grid gap-8 lg:grid-cols-[1.05fr_minmax(0,480px)] lg:items-end">
            <div>
              <p className="eyebrow text-teal-300">Flight status</p>
              <h1 className="h-hero mt-3 text-white">Where is my flight?</h1>
              <p className="mt-4 max-w-lg text-[1rem] leading-relaxed text-white/70">
                Times come from the same feed the gate agents use — usually 4 to 9 minutes ahead of the boards. Delay reasons are the actual codes we file, not a shrug.
              </p>
            </div>
            <div className="rounded-card border border-white/12 bg-white/[0.06] p-3 backdrop-blur-xl">
              <SegmentedControl
                value={mode}
                onChange={setMode}
                options={[
                  { id: 'flight', label: 'By flight number' },
                  { id: 'route', label: 'By route' },
                ]}
                className="!bg-transparent !border-white/12"
              />
              {mode === 'flight' ? (
                <div className="mt-3 grid gap-2.5 sm:grid-cols-[1fr_1fr_auto]">
                  <label className="block">
                    <span className="mb-1 block text-[.6875rem] font-semibold uppercase tracking-[0.1em] text-white/50">Flight number</span>
                    <div className="relative">
                      <Plane size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        value={flight}
                        onChange={(e) => setFlight(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && search()}
                        placeholder="AN 214"
                        className="num h-11 w-full rounded-[11px] border border-white/15 bg-white/10 pl-9 pr-3 font-display text-[1rem] font-semibold uppercase tracking-[0.08em] text-white outline-none placeholder:text-white/30 focus:border-teal-400"
                        aria-label="Flight number"
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[.6875rem] font-semibold uppercase tracking-[0.1em] text-white/50">Date</span>
                    <div className="relative">
                      <input type="date" value={date} max={toISODate(new Date(Date.now() + 3 * DAY))} min={toISODate(new Date(Date.now() - 365 * DAY))} onChange={(e) => setDate(e.target.value)} className="num h-11 w-full rounded-[11px] border border-white/15 bg-white/10 px-3 text-[.9375rem] text-white outline-none focus:border-teal-400" aria-label="Date" />
                    </div>
                  </label>
                  <Button variant="onDark" size="lg" className="sm:mt-6" icon={<Search size={16} />} onClick={search}>
                    Search
                  </Button>
                </div>
              ) : (
                <div className="mt-3 grid gap-2.5 sm:grid-cols-[1fr_1fr_auto]">
                  {['from', 'to'].map((k) => (
                    <label key={k} className="block">
                      <span className="mb-1 block text-[.6875rem] font-semibold uppercase tracking-[0.1em] text-white/50">{k === 'from' ? 'Departure airport' : 'Arrival airport'}</span>
                      <select value={k === 'from' ? from : to} onChange={(e) => (k === 'from' ? setFrom(e.target.value) : setTo(e.target.value))} className="h-11 w-full rounded-[11px] border border-white/15 bg-white/10 px-3 font-display text-[.9375rem] font-semibold text-white outline-none focus:border-teal-400" aria-label={k === 'from' ? 'From' : 'To'}>
                        {Object.keys(BY_CODE).map((c) => (
                          <option key={c} value={c} className="text-navy-900">
                            {c} · {cityOf(c)}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                  <Button variant="onDark" size="lg" className="sm:mt-6" icon={<Search size={16} />} onClick={search}>
                    Search
                  </Button>
                </div>
              )}
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[.75rem] text-white/50">
                <span>Recent:</span>
                {['AN 214', 'AN 204', 'AN 300', 'AN 512'].map((f) => (
                  <button key={f} onClick={() => { setMode('flight'); setFlight(f); setLooked(true); }} className="num rounded-pill border border-white/15 px-2 py-0.5 font-medium transition hover:border-teal-400 hover:text-white">
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="shell -mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_336px]">
        <div className="min-w-0 space-y-4">
          {loading && (
            <div className="card space-y-3 p-5">
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton h-10 w-56 rounded" />
              <div className="skeleton h-3 w-full rounded" />
            </div>
          )}
          {!loading && !result && (
            <EmptyState
              title="No flight found on that date"
              body={mode === 'flight' ? `We have no record of ${flight} on ${fmtDate(date, 'long')}. Check the number — it is two letters and three digits, e.g. AN 214.` : `Nothing between ${from} and ${to} on ${fmtDate(date, 'long')}. Try another date or route.`}
              icon={<PlaneLanding size={20} />}
              action={<Button size="sm" variant="secondary" onClick={() => setMode('route')}>Search by route instead</Button>}
            />
          )}

          {!loading && result && (
            <>
              <section className="card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-mist-50/70 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-navy-800 font-display text-[.6875rem] font-bold text-gold-400">AN</span>
                    <div>
                      <p className="num font-display text-[1.0625rem] font-semibold text-navy-900">{result.flightNo}</p>
                      <p className="text-[.8125rem] text-ink-500">
                        {result.carrier} · operated by AeroNova · {result.aircraft} · {result.registration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={result.status} />
                    <button onClick={() => setAlert(true)} className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-white px-2.5 py-1 text-[.8125rem] font-semibold text-navy-800 transition hover:border-navy-400">
                      <Bell size={13} /> Alerts
                    </button>
                  </div>
                </div>

                <div className="px-4 py-5 sm:px-5">
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div>
                      <p className="text-[.6875rem] uppercase tracking-[0.14em] text-ink-400">Departs · {result.origin}</p>
                      <p className="num font-display text-[2.5rem] font-semibold leading-none text-navy-900">{new Date(result.schedDep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="mt-1.5 text-[.9375rem] font-medium text-ink-700">{cityOf(result.origin)}</p>
                      <p className="text-[.8125rem] text-ink-500">
                        {BY_CODE.get(result.origin)?.name}
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-[.8125rem]">
                        <Badge tone="neutral">Terminal {result.terminal}</Badge>
                        <Badge tone="neutral">Gate {result.gate}</Badge>
                      </p>
                    </div>
                    <div className="flex flex-1 flex-col items-center justify-center px-2 sm:min-w-[220px]">
                      <p className="num text-[.8125rem] font-medium text-ink-600">{durationLabel(Math.round((new Date(result.estArr).getTime() - new Date(result.estDep).getTime()) / 60000))}</p>
                      <div className="relative my-3 w-full max-w-[320px]">
                        <svg viewBox="0 0 320 40" className="w-full" fill="none" aria-hidden>
                          <path d="M6 32 C 90 4, 230 4, 314 26" stroke="#C6D3E0" strokeWidth="1.6" strokeDasharray="5 6" />
                          <path d="M6 32 C 90 4, 230 4, 314 26" stroke="#0FA79A" strokeWidth="2.2" strokeDasharray={`${progress * 380} 999`} />
                          <circle cx="6" cy="32" r="4" fill="#0B2340" />
                          <circle cx="314" cy="26" r="4" fill="#0B2340" opacity={progress > 0.98 ? 1 : 0.35} />
                        </svg>
                        <Plane className="absolute -top-1 text-navy-800" size={18} style={{ left: `${progress * 92}%`, transform: `rotate(${8 - progress * 16}deg)` }} />
                      </div>
                      <p className="num text-[.75rem] text-ink-400">
                        {result.distanceKm.toLocaleString()} km · {result.loadFactor}% seats occupied
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[.6875rem] uppercase tracking-[0.14em] text-ink-400">Arrives · {result.destination}</p>
                      <p className="num font-display text-[2.5rem] font-semibold leading-none text-navy-900">{new Date(result.schedArr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="mt-1.5 text-[.9375rem] font-medium text-ink-700">{cityOf(result.destination)}</p>
                      <p className="text-[.8125rem] text-ink-500">{BY_CODE.get(result.destination)?.name}</p>
                      <p className="mt-2 text-[.8125rem] text-ink-500">Belt {1 + (result.flightNo.charCodeAt(3) % 4)}</p>
                    </div>
                  </div>

                  {result.delayMin > 0 && (
                    <p className="mt-5 flex flex-wrap items-center gap-2 rounded-[12px] border border-gold-400/40 bg-gold-100/60 px-3.5 py-2.5 text-[.875rem] text-gold-600">
                      <Clock size={15} />
                      <span className="font-semibold">Revised to {new Date(result.estDep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span> · {result.delayMin} minutes late · cause: ATC flow control at {result.origin}. Duty-of-care: meals at 4 h, hotel if it crosses the night.
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-4 text-[.8125rem]">
                    <span className="flex items-center gap-1.5">
                      <PlaneTakeoff size={14} className="text-ink-400" />
                      Scheduled {new Date(result.schedDep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <PlaneLanding size={14} className="text-ink-400" />
                      Estimated {new Date(result.estArr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1.5 text-ink-500">
                      <RefreshCw size={14} /> Updated 2 min ago
                    </span>
                    <Link to={`/airports/${result.origin}`} className="ml-auto font-semibold text-sky-700 hover:underline">
                      Airport guide for {result.origin} →
                    </Link>
                  </div>
                </div>

                <div className={cx('flex flex-wrap items-center gap-3 border-t px-4 py-3 sm:px-5', status?.tone === 'teal' ? 'bg-teal-50/70' : status?.tone === 'gold' ? 'bg-gold-100/50' : 'bg-mist-50/70')}>
                  <span className={cx('h-2 w-2 rounded-full', status?.tone === 'teal' ? 'bg-teal-500' : status?.tone === 'gold' ? 'bg-gold-500' : 'bg-sky-500')} />
                  <p className="flex-1 text-[.875rem] font-medium text-ink-700">{status?.text}</p>
                  {result.status === 'CANCELLED' && (
                    <Button size="sm" onClick={() => toast({ tone: 'success', title: 'Rebooked on AN 218', body: 'Seats 14C/14D held for 20 minutes — confirm in Manage Booking.' })}>
                      Rebook free
                    </Button>
                  )}
                </div>
              </section>

              <section className="card p-4 sm:p-5">
                <SectionHeading eyebrow="Where it came from" title="Flight history" className="[&_h2]:text-[1.125rem]" />
                <div className="mt-4 overflow-x-auto">
                  <table className="table-base min-w-[560px]">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Route</th>
                        <th>Dep</th>
                        <th>Actual</th>
                        <th className="text-right">Δ</th>
                        <th className="text-right">Load</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 7 }, (_, i) => {
                        const d = toISODate(new Date(parseISODate(date).getTime() - (i + 1) * DAY));
                        const r = Math.round(((i * 37) % 23) - 8);
                        return (
                          <tr key={d}>
                            <td className="num">{fmtDate(d, 'short')}</td>
                            <td>
                              {result.origin} → {result.destination}
                            </td>
                            <td className="num">{new Date(result.schedDep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</td>
                            <td className="num">{new Date(new Date(result.schedDep).getTime() + Math.max(0, r) * 60000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</td>
                            <td className={cx('num text-right font-semibold', r > 15 ? 'text-red-600' : r > 0 ? 'text-gold-600' : 'text-teal-700')}>
                              {r > 0 ? `+${r}` : `${r}`}
                            </td>
                            <td className="num text-right">{72 + ((i * 13) % 24)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 flex items-center gap-2 text-[.75rem] text-ink-400">
                  <CloudSun size={13} /> This rotation is on time {result.origin === 'ACC' ? 88 : 82}% of the time in the last 12 months. Typical delay cause here: {result.origin === 'LOS' ? 'ramp congestion' : 'ATC flow control'}.
                </p>
              </section>
            </>
          )}

          {/* board */}
          <section className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
              <div>
                <p className="font-display text-[.9375rem] font-semibold text-navy-900">{mode === 'route' ? `${cityOf(from)} departures` : `${cityOf(result?.origin ?? 'ACC')} · today`}</p>
                <p className="text-[.8125rem] text-ink-500">{fmtDate(date, 'long')} · live board, {board.length} flights</p>
              </div>
              <div className="flex items-center gap-2">
                <DateField label="" value={date} onChange={setDate} minDate={toISODate(new Date(Date.now() - 2 * DAY))} maxDate={toISODate(new Date(Date.now() + 2 * DAY))} className="[&>div>div]:mb-0" />
                <Button size="sm" variant="secondary" icon={<CalendarDays size={14} />} onClick={() => toast({ tone: 'info', title: 'Timetable view', body: 'The full published timetable opens in the live product.' })}>
                  Timetable
                </Button>
              </div>
            </div>
            <div className="max-h-[420px] overflow-y-auto">
              <table className="table-base sticky:top-0">
                <thead className="sticky top-0 z-10">
                  <tr>
                    <th>Flight</th>
                    <th className="hidden sm:table-cell">To</th>
                    <th>Dep</th>
                    <th className="hidden md:table-cell">Gate</th>
                    <th className="text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {board.map((f) => (
                    <tr
                      key={f.flightNo}
                      onClick={() => {
                        setMode('flight');
                        setFlight(f.flightNo);
                        setLooked(true);
                        window.scrollTo({ top: 220, behavior: 'smooth' });
                      }}
                      className="cursor-pointer"
                    >
                      <td className="num font-semibold text-navy-900">{f.flightNo}</td>
                      <td className="hidden sm:table-cell">
                        {cityOf(f.destination)} <span className="num text-ink-400">{f.destination}</span>
                      </td>
                      <td className="num">{new Date(f.schedDep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="num hidden md:table-cell">{f.gate}</td>
                      <td className="text-right">
                        <StatusBadge status={f.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="space-y-3">
          <div className="card p-4">
            <p className="font-display text-[.9375rem] font-semibold text-navy-900">Airspace & weather</p>
            <ul className="mt-3 space-y-2.5 text-[.8125rem]">
              {[
                [result?.origin ?? 'ACC', '28°C · light haze · visibility 10 km', 'teal'],
                [result?.destination ?? 'LOS', '31°C · few clouds · wind 240/12kt', 'teal'],
                ['ATC flow', result?.status === 'DELAYED' ? 'Flow control active — 22 min average' : 'No restrictions', result?.status === 'DELAYED' ? 'gold' : 'teal'],
                ['Sunrise at destination', '06:14 local', 'neutral'],
              ].map(([a, b, tone]) => (
                <li key={a as string} className="flex items-start justify-between gap-3 border-b border-line pb-2 last:border-0">
                  <span className="num font-semibold text-navy-900">{a}</span>
                  <span className={cx('text-right', tone === 'gold' ? 'text-gold-600' : 'text-ink-500')}>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-4">
            <p className="font-display text-[.9375rem] font-semibold text-navy-900">Aircraft on this rotation</p>
            <p className="mt-2 text-[.8125rem] leading-relaxed text-ink-500">{FLEET.find((f) => result?.aircraft.includes(f.name.split(' ')[1] ?? 'x'))?.name ?? result?.aircraft}</p>
            <Divider className="my-3" />
            <ul className="space-y-1.5 text-[.8125rem] text-ink-600">
              <li className="flex justify-between"><span>Registration</span><span className="num font-medium text-navy-900">{result?.registration}</span></li>
              <li className="flex justify-between"><span>Seats</span><span className="num font-medium text-navy-900">{FLEET.find((f) => f.name.includes('330'))?.capacity} · {result?.loadFactor}% full</span></li>
              <li className="flex justify-between"><span>Wi-Fi</span><span className="font-medium text-teal-700">Nova Connect</span></li>
            </ul>
          </div>

          <div className="rounded-card border border-line bg-white p-4">
            <p className="font-display text-[.9375rem] font-semibold text-navy-900">Other ways to check</p>
            <ul className="mt-2 space-y-2 text-[.875rem]">
              {[
                { l: 'WhatsApp: +233 302 200 111', to: '' },
                { l: 'SMS “STATUS AN214” to 27806', to: '' },
                { l: 'Airport info desk, Galaxy T1', to: '/airports' },
                { l: 'Manage my booking', to: '/manage-booking' },
              ].map((x) => (
                <li key={x.l}>
                  {x.to ? (
                    <Link to={x.to} className="flex items-center gap-2 text-ink-600 hover:text-navy-900">
                      <Ticket size={14} className="text-ink-300" /> {x.l}
                    </Link>
                  ) : (
                    <span className="flex items-center gap-2 text-ink-600">
                      <span className="h-1 w-1 rounded-full bg-teal-500" /> {x.l}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <Modal
        open={alert}
        onClose={() => setAlert(false)}
        title="Get a status alert"
        subtitle={`We will message you about ${flight} on ${fmtDate(date, 'long')}.`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAlert(false)}>
              Later
            </Button>
            <Button
              onClick={() => {
                setAlert(false);
                toast({ tone: 'success', title: 'Alert set', body: email ? `Sent to ${email}` : 'Sent to the mobile number on your booking' });
              }}
            >
              Send me alerts
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Email or mobile" hint="No account needed. One message per change, never marketing.">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com or +233 24 000 0000" />
          </Field>
          <div className="space-y-2">
            {[
              ['Delay over 15 minutes', true],
              ['Gate change', true],
              ['Bag belt number', true],
              ['Diversion or cancellation', true],
            ].map(([l, on]) => (
              <Checkbox key={l as string} label={l as string} checked={!!on} disabled={l === 'Diversion or cancellation'} onChange={() => {}} />
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
