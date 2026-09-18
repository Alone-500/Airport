import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Armchair, ArrowRight, Check, Fuel, Gauge, Layers, Plane, Ruler, ShieldCheck, Wifi, X } from 'lucide-react';
import { cx } from '../../lib/utils';
import { FLEET, aircraftById } from '../../data/fleet';
import { Photo } from '../../components/brand/Brand';
import { Badge, Button, Divider, EmptyState, Meter, SectionHeading, StatusBadge } from '../../components/ui/Primitives';
import { Breadcrumbs } from '../../components/ui/Overlay';
import { Radio, SegmentedControl } from '../../components/ui/Form';
import { PageHero } from '../../components/layout/PublicLayout';
import { useStore } from '../../store/store';
import { statusBoard } from '../../data/flights';
import { toISODate } from '../../lib/utils';

export default function Fleet() {
  const { toast } = useStore();
  const [compare, setCompare] = useState<string[]>(['A339', 'B789']);
  const [tab, setTab] = useState<'types' | 'maintenance' | '_numbers'>('types');

  const toggle = (id: string) => setCompare((v) => (v.includes(id) ? v.filter((x) => x !== id) : v.length >= 3 ? v : [...v, id]));

  return (
    <div>
      <PageHero
        tone="navy"
        image="/img/fleet.jpg"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Fleet' }]}
        eyebrow="46 aircraft · average age 4.7 years"
        title="Four types. No mystery sub-fleet."
        lead="Everything we schedule is one of these four. That is not modesty — it is why our repeat defect rate is low, our crews can be rostered anywhere, and your seat is what the page said it would be."
      >
        <div className="mt-6 flex flex-wrap gap-2">
          {FLEET.map((f) => (
            <a key={f.id} href={`#${f.id}`} className="rounded-pill border border-white/20 bg-white/5 px-3 py-1.5 text-[.8125rem] font-semibold text-white/85 backdrop-blur transition hover:border-teal-400 hover:text-white">
              {f.name}
            </a>
          ))}
        </div>
      </PageHero>

      <div className="sticky top-[var(--nav)] z-30 border-b border-line bg-white/95 backdrop-blur-xl">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-2.5">
          <SegmentedControl
            size="sm"
            value={tab}
            onChange={setTab}
            options={[
              { id: 'types', label: 'Aircraft types' },
              { id: 'maintenance', label: 'Maintenance & bases' },
              { id: '_numbers', label: 'Fleet numbers' },
            ]}
          />
          <p className="text-[.75rem] text-ink-400">
            Select up to three to compare · <span className="num font-semibold text-navy-800">{compare.length}</span> chosen
          </p>
        </div>
      </div>

      <section className="bg-mist-50/60 py-12">
        <div className="shell">
          {tab === 'types' && (
            <>
              <div className="space-y-8">
                {FLEET.map((f, i) => (
                  <article key={f.id} id={f.id} className={cx('grid scroll-mt-[calc(var(--nav)+64px)] gap-6 overflow-hidden rounded-card border border-line bg-white shadow-card lg:grid-cols-[1.05fr_1fr]', i % 2 === 1 && 'lg:grid-cols-[1fr_1.05fr]')}>
                    <div className={cx('relative min-h-[260px] overflow-hidden', i % 2 === 1 && 'lg:order-2')}>
                      <Photo src={f.img} alt={f.name} seed={f.id} className="absolute inset-0 h-full w-full" imgClassName="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-transparent" />
                      <div className="absolute inset-x-5 bottom-4 text-white">
                        <p className="eyebrow text-teal-300">{f.maker} · {f.family}</p>
                        <h2 className="mt-2 font-display text-[1.75rem] font-semibold leading-tight">{f.name}</h2>
                        <p className="mt-1 text-[.875rem] text-white/70">{f.config}</p>
                      </div>
                      <button
                        onClick={() => toggle(f.id)}
                        className={cx('absolute right-4 top-4 rounded-pill border px-2.5 py-1 text-[.75rem] font-semibold backdrop-blur transition', compare.includes(f.id) ? 'border-teal-400 bg-teal-400/20 text-white' : 'border-white/30 bg-white/10 text-white/80 hover:bg-white/20')}
                      >
                        {compare.includes(f.id) ? '✓ Comparing' : 'Compare'}
                      </button>
                    </div>
                    <div className="p-5 sm:p-7">
                      <p className="text-[.9375rem] leading-relaxed text-ink-600">{f.notes}</p>
                      <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">
                        {[
                          ['Seats', String(f.capacity)],
                          ['Range', `${f.rangeKm.toLocaleString()} km`],
                          ['Cruise', `${f.cruise} km/h`],
                          ['Length', `${f.length} m`],
                          ['Wingspan', `${f.wingspan} m`],
                          ['In fleet', `${f.delivered}`],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <dt className="text-[.625rem] uppercase tracking-[0.12em] text-ink-400">{k}</dt>
                            <dd className="num font-display text-[1rem] font-semibold text-navy-900">{v}</dd>
                          </div>
                        ))}
                      </dl>
                      <div className="mt-5 grid gap-2 sm:grid-cols-3">
                        {(['BUSINESS', 'PREMIUM', 'ECONOMY'] as const).map((c) => {
                          const cab = f.cabins[c];
                          return (
                            <div key={c} className={cx('rounded-[12px] border p-3', cab.seats ? 'border-line' : 'border-dashed border-ink-200 opacity-60')}>
                              <p className="text-[.625rem] font-semibold uppercase tracking-[0.1em] text-ink-400">{c === 'BUSINESS' ? 'Business' : c === 'PREMIUM' ? 'Premium' : 'Economy'}</p>
                              <p className="num mt-1 font-display text-[.9375rem] font-semibold text-navy-900">{cab.pitch}</p>
                              <p className="mt-0.5 text-[.6875rem] leading-snug text-ink-500">{cab.layout}</p>
                              <p className="num mt-1 text-[.6875rem] text-teal-700">{cab.seats ? `${cab.seats} seats · rows ${cab.rows}` : 'not fitted'}</p>
                            </div>
                          );
                        })}
                      </div>
                      <ul className="mt-5 space-y-2">
                        {f.features.map((x) => (
                          <li key={x} className="flex gap-2.5 text-[.875rem] leading-relaxed text-ink-600">
                            <Check size={14} className="mt-1 shrink-0 text-teal-600" /> {x}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 flex flex-wrap items-center gap-2">
                        <Button size="sm" to={`/fleet/${f.id}`}>
                          Full specification
                        </Button>
                        <Button size="sm" variant="secondary" to={`/cabins/${f.id === 'A320N' ? 'economy' : f.id === 'A321N' ? 'premium-economy' : 'business'}`}>
                          Cabins on this type
                        </Button>
                        <Badge tone="neutral" className="ml-auto">
                          On-time {f.onTime}%
                        </Badge>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {compare.length > 1 && (
                <div className="sticky bottom-3 z-20 mt-8 overflow-hidden rounded-card border border-navy-800/20 bg-white shadow-lift">
                  <div className="flex items-center justify-between border-b border-line bg-navy-900 px-4 py-2.5 text-white">
                    <p className="font-display text-[.9375rem] font-semibold">Comparing {compare.length} types</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-white/80 hover:bg-white/10" onClick={() => toast({ tone: 'info', title: 'Specification sheet emailed', body: 'PDF with the full technical data for the selected types.' })}>
                        Email spec sheet
                      </Button>
                      <button onClick={() => setCompare([])} className="grid h-7 w-7 place-items-center rounded-full text-white/60 hover:bg-white/10" aria-label="Clear comparison">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="table-base min-w-[520px]">
                      <tbody>
                        {[
                          ['Seats', (f: (typeof FLEET)[number]) => String(f.capacity)],
                          ['Range', (f: (typeof FLEET)[number]) => `${(f.rangeKm / 1000).toFixed(1)}k km`],
                          ['Business', (f: (typeof FLEET)[number]) => f.cabins.BUSINESS.pitch],
                          ['Premium', (f: (typeof FLEET)[number]) => (f.cabins.PREMIUM.seats ? f.cabins.PREMIUM.pitch : '—')],
                          ['Economy pitch', (f: (typeof FLEET)[number]) => f.cabins.ECONOMY.pitch],
                          ['Wi-Fi', (f: (typeof FLEET)[number]) => (f.wifi.includes('all') || f.wifi.includes('Pro') ? 'Yes' : 'Partial')],
                          ['On-time', (f: (typeof FLEET)[number]) => `${f.onTime}%`],
                        ].map(([label, fn], i) => (
                          <tr key={i} className={i % 2 ? 'bg-mist-50/60' : ''}>
                            <td className="w-[150px] text-[.75rem] font-semibold uppercase tracking-wide text-ink-400">{label as string}</td>
                            {compare.map((id) => {
                              const f = aircraftById(id);
                              return <td key={id} className="num text-[.875rem] font-medium text-navy-900">{(fn as (x: typeof f) => string)(f)}</td>;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'maintenance' && (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="card p-6">
                <SectionHeading eyebrow="Bases" title="Three line bases, one heavy facility." className="mb-6 [&_h2]:text-[1.5rem]" />
                <ul className="space-y-3">
                  {[
                    { n: 'Tema Heavy Maintenance', c: 'GHANA · ACC', s: 'C-checks, structural, engines on-wing', m: 100 },
                    { n: 'Accra Galaxy Line', c: 'GHANA · ACC', s: 'Daily line checks, A-checks, LNAR', m: 96 },
                    { n: 'Nairobi Line', c: 'KENYA · NBO', s: 'Overnight A-checks on the East Africa fleet', m: 92 },
                    { n: 'Johannesburg Line', c: 'SOUTH AFRICA · JNB', s: 'Line plus component exchange', m: 90 },
                  ].map((b) => (
                    <li key={b.n} className="flex flex-wrap items-center gap-4 rounded-[14px] border border-line p-4">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-navy-50 text-navy-700">
                        <Layers size={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-[.9375rem] font-semibold text-navy-900">{b.n}</span>
                        <span className="block text-[.8125rem] text-ink-500">{b.c} · {b.s}</span>
                      </span>
                      <Meter value={b.m} tone="teal" className="w-24" />
                    </li>
                  ))}
                </ul>
                <Divider className="my-6" label="How we work" />
                <ul className="grid gap-3 sm:grid-cols-2">
                  {[
                    ['Same engineer, same airframe', 'One person owns an aircraft through a rotation, not a shift. Repeat defects fell 18%.'],
                    ['Predictive not calendar', '1,400 sensors per aircraft stream to Tema; 71% of removals are now predicted within 10 hours.'],
                    ['In-house everything we can', '91% of maintenance is ours, which is why a parts wait is 3 hours and not 3 days.'],
                    ['Tooling for apprentices', 'The Tema facility trains 120 apprentices a year on live aircraft under supervision.'],
                  ].map(([t, b]) => (
                    <li key={t} className="rounded-[14px] border border-line p-4">
                      <p className="font-display text-[.9375rem] font-semibold text-navy-900">{t}</p>
                      <p className="mt-1.5 text-[.875rem] leading-relaxed text-ink-500">{b}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <div className="card p-5">
                  <p className="h-3 text-[1rem]">Fleet technical readout</p>
                  <dl className="mt-3 space-y-2 text-[.875rem]">
                    {[
                      ['Dispatch reliability', '99.6%'],
                      ['Avg. technical delay', '4.1 min'],
                      ['AOG events, 12 months', '34'],
                      ['Engine Borescope interval', 'On condition'],
                      ['Cabin defects per 1k flights', '6.2'],
                      ['Modifications in-house', 'A320neo 100%'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-line pb-1.5 last:border-0">
                        <dt className="text-ink-500">{k}</dt>
                        <dd className="num font-semibold text-navy-900">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="relative overflow-hidden rounded-card bg-navy-900 p-5 text-white">
                  <Fuel className="pointer-events-none absolute -right-3 -top-3 h-24 w-24 text-teal-400/10" />
                  <p className="relative text-[.6875rem] uppercase tracking-[0.16em] text-teal-300">Fuel & emissions</p>
                  <p className="relative mt-2 text-[.9375rem] leading-relaxed text-white/75">
                    3.02 litres per 100 passenger-kilometres across the fleet — 19.4% below our 2019 baseline. The A320neo is the reason: it burns 2.4 l/100 pax-km on the Lagos and Accra shuttles, which is where most of our seats are.
                  </p>
                  <Button size="sm" variant="onDark" className="relative mt-4" to="/about#sustainability">
                    Sustainability programme
                  </Button>
                </div>
              </div>
            </div>
          )}

          {tab === '_numbers' && (
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="card overflow-hidden lg:col-span-2">
                <div className="border-b border-line px-5 py-4">
                  <p className="h-3 text-[1.0625rem]">Where every aircraft is right now</p>
                  <p className="mt-1 text-[.8125rem] text-ink-500">Live from the operations control feed · {toISODate(new Date())}</p>
                </div>
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Flight</th>
                      <th className="hide-below-sm">Route</th>
                      <th>Aircraft</th>
                      <th className="hide-below-md">Reg</th>
                      <th className="text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusBoard(toISODate(new Date())).slice(0, 12).map((f) => (
                      <tr key={f.flightNo}>
                        <td className="num font-semibold text-navy-900">{f.flightNo}</td>
                        <td className="hidden sm:table-cell num">
                          {f.origin}–{f.destination}
                        </td>
                        <td>{f.aircraft}</td>
                        <td className="num hidden md:table-cell text-ink-500">{f.registration}</td>
                        <td className="text-right">
                          <StatusBadge status={f.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-4">
                {[
                  ['46', 'aircraft', '18 A320neo · 9 A321neo · 7 A330neo · 6 787-9 · 6 spare/leasing'],
                  ['4.7 yrs', 'average age', 'Youngest widebody fleet in Africa by our count of public data'],
                  ['11', 'orders placed', '9 A321neo + 2 787-9, delivering 2027–2029'],
                  ['2', 'configs per type', 'One narrowbody and one widebody layout each, so upgrades are predictable'],
                ].map(([v, l, n]) => (
                  <div key={l} className="card p-4">
                    <p className="num font-display text-[1.75rem] font-semibold text-navy-900">{v}</p>
                    <p className="text-[.75rem] font-semibold uppercase tracking-[0.1em] text-ink-500">{l}</p>
                    <p className="mt-1 text-[.8125rem] leading-relaxed text-ink-500">{n}</p>
                  </div>
                ))}
                <div className="rounded-card border border-line bg-white p-4">
                  <p className="flex items-center gap-2 font-display text-[.9375rem] font-semibold text-navy-900">
                    <ShieldCheck size={15} className="text-teal-600" /> Cabin standards
                  </p>
                  <p className="mt-1.5 text-[.8125rem] leading-relaxed text-ink-500">Every seat has power. Every aircraft has a wheelchair-sized lavatory or an aisle chair and a fitted one. Every long-haul seat reclines without stealing the knee of the person behind you.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function FleetDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const f = FLEET.find((x) => x.id === id);
  if (!f)
    return (
      <div className="shell py-24">
        <EmptyState title="Unknown aircraft" body="Four types fly scheduled services for AeroNova." icon={<Plane size={20} />} action={<Button size="sm" onClick={() => nav('/fleet')}>Back to fleet</Button>} />
      </div>
    );

  const board = statusBoard(toISODate(new Date())).filter((b) => b.aircraft.includes(f.name.split(' ')[1] ?? '')).slice(0, 5);

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-navy-950 pb-14 pt-[calc(var(--nav)+2.5rem)] text-white">
        <Photo src={f.img} alt="" seed={f.id} className="absolute inset-0 -z-10" imgClassName="h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/30" />
        <div className="shell">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Fleet', to: '/fleet' }, { label: f.name }]} dark className="mb-5" />
          <div className="grid gap-8 lg:grid-cols-[1.2fr_minmax(0,360px)] lg:items-end">
            <div>
              <p className="eyebrow text-teal-300">
                {f.maker} · {f.family} · delivered from {f.firstFlight.split('· ')[1] ?? f.firstFlight}
              </p>
              <h1 className="mt-3 font-display text-[clamp(2rem,5.4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.03em]">{f.name}</h1>
              <p className="mt-4 max-w-2xl text-[1rem] leading-relaxed text-white/75">{f.notes}</p>
            </div>
            <div className="rounded-card border border-white/12 bg-navy-900/70 p-5 backdrop-blur-md">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['In fleet', f.delivered],
                  ['Seats', f.capacity],
                  ['Range km', f.rangeKm.toLocaleString()],
                  ['On-time', `${f.onTime}%`],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <p className="text-[.625rem] uppercase tracking-[0.14em] text-white/45">{k}</p>
                    <p className="num font-display text-[1.375rem] font-semibold text-white">{v}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[.8125rem] leading-relaxed text-white/60">Best for: {f.bestFor}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mist-50/60 py-12">
        <div className="shell grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-5">
            <div className="card p-5 sm:p-6">
              <SectionHeading eyebrow="Configuration" title={`How the ${f.name} is laid out`} className="mb-5 [&_h2]:text-[1.375rem]" />
              <div className="grid gap-3 sm:grid-cols-3">
                {(['BUSINESS', 'PREMIUM', 'ECONOMY'] as const).map((c) => {
                  const cab = f.cabins[c];
                  return (
                    <div key={c} className={cx('rounded-[14px] border p-4', cab.seats ? 'border-line bg-white' : 'border-dashed border-ink-200 bg-mist-50/60')}>
                      <p className="text-[.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-400">{c === 'BUSINESS' ? 'Nova Business' : c === 'PREMIUM' ? 'Premium Economy' : 'Economy'}</p>
                      <p className="num mt-2 font-display text-[1.5rem] font-semibold text-navy-900">{cab.seats || '—'}</p>
                      <ul className="mt-2 space-y-1.5 text-[.8125rem]">
                        {[
                          ['Rows', cab.rows],
                          ['Pitch', cab.pitch],
                          ['Width', cab.width],
                          ['Layout', cab.layout],
                        ].map(([k, v]) => (
                          <li key={k} className="flex justify-between gap-3 border-b border-line pb-1 last:border-0">
                            <span className="text-ink-400">{k}</span>
                            <span className="num text-right font-medium text-navy-900">{v}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 flex items-start gap-2.5 rounded-[12px] bg-navy-50 p-3.5 text-[.875rem] leading-relaxed text-navy-900">
                <Armchair size={15} className="mt-0.5 shrink-0 text-navy-700" />
                Seats are not interchangeable across types. If we swap an aircraft, we re-assign your seat to an equivalent one and tell you in the app.
              </p>
            </div>

            <div className="card p-5 sm:p-6">
              <SectionHeading eyebrow="Engineering" title="What makes it different to fly on" className="mb-5 [&_h2]:text-[1.375rem]" />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: <Ruler size={16} />, k: 'Airframe', v: `${f.length} m long · ${f.wingspan} m span` },
                  { icon: <Fuel size={16} />, k: 'Engines', v: f.engines },
                  { icon: <Gauge size={16} />, k: 'Cruise', v: `${f.cruise} km/h at FL390 typical` },
                  { icon: <Wifi size={16} />, k: 'Connectivity', v: f.wifi },
                  { icon: <Layers size={16} />, k: 'Entry into service', v: f.firstFlight },
                  { icon: <ShieldCheck size={16} />, k: 'IFE', v: f.ife },
                ].map((x) => (
                  <div key={x.k} className="flex items-start gap-3 rounded-[12px] border border-line p-3.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-mist-100 text-navy-700">{x.icon}</span>
                    <span className="min-w-0">
                      <span className="block text-[.6875rem] uppercase tracking-[0.1em] text-ink-400">{x.k}</span>
                      <span className="block text-[.875rem] font-medium leading-snug text-navy-900">{x.v}</span>
                    </span>
                  </div>
                ))}
              </div>
              <Divider className="my-5" label="Power & cabin" />
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {[f.power, f.wifi, f.ife, `Config: ${f.config}`].map((x) => (
                  <li key={x} className="flex gap-2.5 text-[.875rem] leading-relaxed text-ink-600">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="card p-5">
              <p className="h-3 text-[1rem]">On this type today</p>
              {board.length === 0 ? (
                <p className="mt-3 text-[.8125rem] text-ink-500">No scheduled sectors on this type today — it is on a maintenance window or the overnight bank.</p>
              ) : (
                <ul className="mt-3 space-y-2.5">
                  {board.map((b) => (
                    <li key={b.flightNo}>
                      <Link to={`/flight-status?flight=${b.flightNo}`} className="group flex items-center gap-3 rounded-[12px] border border-line p-3 transition hover:border-sky-300">
                        <span className="num font-display text-[.875rem] font-semibold text-navy-900">{b.flightNo}</span>
                        <span className="num text-[.8125rem] text-ink-500">
                          {b.origin}→{b.destination}
                        </span>
                        <StatusBadge status={b.status} className="ml-auto" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card p-5">
              <p className="h-3 text-[1rem]">Why we bought it</p>
              <ul className="mt-3 space-y-2">
                {f.features.map((x) => (
                  <li key={x} className="flex gap-2.5 text-[.875rem] leading-relaxed text-ink-600">
                    <Check size={14} className="mt-1 shrink-0 text-teal-600" /> {x}
                  </li>
                ))}
              </ul>
              <Button size="sm" className="mt-4 w-full" to="/search">
                Fly on this aircraft
              </Button>
            </div>
            <div className="rounded-card bg-navy-900 p-5 text-white">
              <p className="text-[.6875rem] uppercase tracking-[0.16em] text-teal-300">Reliability</p>
              <p className="num mt-1.5 font-display text-[1.75rem] font-semibold">{f.onTime}%</p>
              <p className="text-[.8125rem] text-white/60">on-time performance, rolling 12 months, this type</p>
              <Meter value={f.onTime} tone="teal" className="mt-3" />
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-line bg-white py-12">
        <div className="shell">
          <Divider label="Other types" className="mb-6" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {FLEET.filter((x) => x.id !== f.id).map((x) => (
              <Link key={x.id} to={`/fleet/${x.id}`} className="group overflow-hidden rounded-card border border-line transition hover:shadow-card">
                <Photo src={x.img} alt={x.name} seed={x.id} className="h-28" imgClassName="transition-transform duration-700 group-hover:scale-105" />
                <div className="p-4">
                  <p className="font-display text-[.9375rem] font-semibold text-navy-900">{x.name}</p>
                  <p className="num mt-0.5 text-[.8125rem] text-ink-500">
                    {x.delivered} in fleet · {x.capacity} seats
                  </p>
                  <span className="mt-2.5 inline-flex items-center gap-1 text-[.8125rem] font-semibold text-sky-700 transition group-hover:gap-2">
                    View <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export const FleetRadio = Radio;
