import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftRight, Check, Clock, Luggage, MapPin, Plane, Search, TrainFront, Users } from 'lucide-react';
import { cx, toISODate } from '../../lib/utils';
import { AIRPORTS, BY_CODE, cityOf } from '../../data/airports';
import { TRAVEL_SECTIONS } from '../../data/content';
import { statusBoard } from '../../data/flights';
import { SkylineTile } from '../../components/brand/Brand';
import { Badge, Button, Divider, EmptyState, Meter, SectionHeading, StatusBadge } from '../../components/ui/Primitives';
import { Breadcrumbs } from '../../components/ui/Overlay';
import { Input, SegmentedControl } from '../../components/ui/Form';
import { useStore } from '../../store/store';
import { PageHero } from '../../components/layout/PublicLayout';

export default function Airports() {
  const [q, setQ] = useState('');
  const [region, setRegion] = useState<'All' | 'Africa' | 'Europe' | 'Middle East' | 'Asia' | 'North America' | 'South America'>('All');
  const list = AIRPORTS.filter((a) => (region === 'All' || a.region === region) && `${a.city} ${a.code} ${a.country} ${a.name}`.toLowerCase().includes(q.toLowerCase()));
  const regions = ['All', 'Africa', 'Europe', 'Middle East', 'Asia', 'North America', 'South America'] as const;

  return (
    <div>
      <PageHero
        tone="navy"
        image="/img/airport-night.jpg"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Airports' }]}
        eyebrow="Airport guides"
        title="Where to stand, and how long it takes."
        lead="Twenty-two of our stations in detail: counter rows, real wait times measured by our own people, the door you should use, and the lounge nobody finds on the first visit."
        height="sm"
      >
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs sm:flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search airport or city" className="h-12 pl-10 bg-white/10 text-white placeholder:text-white/40 border-white/20" aria-label="Search airports" />
          </div>
          <SegmentedControl
            value={region}
            onChange={setRegion}
            size="sm"
            options={regions.map((r) => ({ id: r, label: r }))}
            className="!bg-white/8 !border-white/15"
          />
        </div>
      </PageHero>

      <section className="bg-mist-50/60 py-12">
        <div className="shell">
          {list.length === 0 ? (
            <EmptyState title="No station matches that" body="We serve 41 destinations; 22 have full guides. Try a city or an IATA code." icon={<MapPin size={20} />} action={<Button size="sm" onClick={() => { setQ(''); setRegion('All'); }}>Clear</Button>} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {list.map((a, i) => (
                <article key={a.code} className={cx('group flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition hover:shadow-lift', i % 4 === 1 && 'xl:translate-y-4')}>
                  <div className="relative h-28 overflow-hidden">
                    <SkylineTile seed={a.code + a.city} ratio="auto" className="h-full w-full transition-transform duration-700 group-hover:scale-105" label={`${a.gates} gates`} />
                    {a.hub && (
                      <span className="absolute right-3 top-3">
                        <Badge tone="gold">Hub</Badge>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="font-display text-[1.0625rem] font-semibold text-navy-900">
                        {a.city} <span className="num text-[.8125rem] text-ink-400">{a.code}</span>
                      </h2>
                      <span className="num text-[.75rem] text-ink-400">{a.tz}</span>
                    </div>
                    <p className="mt-0.5 text-[.8125rem] text-ink-500">{a.name}</p>
                    <p className="mt-2.5 line-clamp-2 flex-1 text-[.8125rem] leading-relaxed text-ink-500">{a.blurb}</p>
                    <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
                      {[
                        ['Terminals', a.terminals.length],
                        ['Gates', a.gates],
                        ['Connect', `${a.transitMin}m`],
                      ].map(([k, v]) => (
                        <div key={k as string}>
                          <dt className="text-[.625rem] uppercase tracking-wide text-ink-400">{k}</dt>
                          <dd className="num text-[.875rem] font-semibold text-navy-900">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="flex-1" to={`/airports/${a.code}`}>
                        Guide
                      </Button>
                      <Button size="sm" variant="secondary" to={`/search?from=${a.code}&to=${a.hub ? 'LOS' : 'ACC'}`}>
                        Flights
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function AirportDetail() {
  const { code } = useParams();
  const nav = useNavigate();
  const { toast } = useStore();
  const a = BY_CODE.get((code ?? '').toUpperCase());
  const [tab, setTab] = useState<'arriving' | 'departing' | 'transit'>('departing');

  if (!a)
    return (
      <div className="shell py-24">
        <EmptyState title="No guide for that station yet" body="Twenty-two airports have full guides. Ours are written by the station team, so they are only published when they are accurate." icon={<Plane size={20} />} action={<Button size="sm" onClick={() => nav('/airports')}>All airports</Button>} />
      </div>
    );

  const board = statusBoard(toISODate(new Date()), a.code).slice(0, 8);
  const load = a.hub ? 96 : 70 + (a.city.length % 22);

  return (
    <div>
      <div className="relative isolate overflow-hidden bg-navy-950 pb-12 pt-[calc(var(--nav)+2.5rem)] text-white">
        <div className="absolute inset-0 -z-10 opacity-[0.08] texture-grid" />
        <div className="shell relative">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Airports', to: '/airports' }, { label: a.city }]} dark className="mb-5" />
          <div className="grid gap-8 lg:grid-cols-[1.2fr_minmax(0,340px)] lg:items-end">
            <div>
              <p className="eyebrow text-teal-300">
                {a.country} · {a.region} {a.hub && '· AeroNova hub'}
              </p>
              <h1 className="mt-3 font-display text-[clamp(2rem,5.4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-white">{a.name}</h1>
              <p className="mt-4 max-w-2xl text-[1rem] leading-relaxed text-white/72">{a.blurb}</p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Button variant="onDark" size="sm" to={`/search?from=${a.code}&to=${a.hub ? 'LOS' : 'ACC'}`}>
                  Search flights from {a.city}
                </Button>
                <Button size="sm" variant="ghost" className="border border-white/25 text-white hover:bg-white/10" onClick={() => toast({ tone: 'success', title: 'Added to trip notes', body: `Airport guide for ${a.code} is saved with your next trip.` })}>
                  Save to trip
                </Button>
              </div>
            </div>
            <div className="rounded-card border border-white/12 bg-white/[0.06] p-5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="num font-display text-[2.25rem] font-semibold leading-none">{a.code}</span>
                <Badge tone={load > 90 ? 'ember' : 'teal'}>{load}% occupied today</Badge>
              </div>
              <Meter value={load} tone={load > 90 ? 'ember' : 'teal'} className="mt-3" label="Terminal busyness now" />
              <dl className="mt-4 space-y-2 text-[.8125rem]">
                {[
                  ['Timezone', `${a.tz} (UTC${a.utc >= 0 ? '+' : ''}${a.utc})`],
                  ['Terminals', a.terminals.join(' · ')],
                  ['Gates', String(a.gates)],
                  ['Open', a.opening],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-white/8 pb-1.5 last:border-0">
                    <dt className="text-white/45">{k}</dt>
                    <dd className="text-right font-medium text-white">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-[var(--nav)] z-30 border-b border-line bg-white/95 backdrop-blur-xl">
        <div className="shell py-2.5">
          <SegmentedControl
            value={tab}
            onChange={setTab}
            options={[
              { id: 'departing', label: 'Departing' },
              { id: 'arriving', label: 'Arriving' },
              { id: 'transit', label: 'Connecting' },
            ]}
          />
        </div>
      </div>

      <section className="bg-mist-50/60 py-12">
        <div className="shell grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-5">
            {tab === 'departing' && (
              <>
                <div className="card p-5">
                  <SectionHeading eyebrow="Check-in" title={`Where to go at ${a.code}`} className="mb-4 [&_h2]:text-[1.375rem]" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { icon: <Users size={16} />, k: 'Counters', v: a.counters },
                      { icon: <Clock size={16} />, k: 'Security', v: a.security },
                      { icon: <Luggage size={16} />, k: 'Bag drop', v: 'Separate lane for pre-paid bags; closes 10 min after the counter' },
                      { icon: <Plane size={16} />, k: 'Gate closing', v: '10 minutes before departure, enforced' },
                    ].map((x) => (
                      <div key={x.k} className="flex items-start gap-3 rounded-[12px] border border-line p-3.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-navy-50 text-navy-700">{x.icon}</span>
                        <span>
                          <span className="block text-[.6875rem] uppercase tracking-[0.1em] text-ink-400">{x.k}</span>
                          <span className="block text-[.875rem] font-medium text-navy-900">{x.v}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-[12px] bg-mist-50 p-4">
                    <p className="text-[.875rem] leading-relaxed text-ink-600">
                      <span className="font-semibold text-navy-900">Our advice for {a.city}:</span> {a.hub ? 'use the fast-track lane if your fare includes it — you will save 20 minutes at exactly the hour everyone else is queueing.' : 'the AeroNova desk shares the hall; come to the far end where the queue doubles back, it moves faster.'}
                    </p>
                  </div>
                </div>

                <div className="card overflow-hidden">
                  <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                    <p className="font-display text-[1rem] font-semibold text-navy-900">Live departures</p>
                    <Badge tone="teal" dot>
                      Updated 2 min ago
                    </Badge>
                  </div>
                  <table className="table-base">
                    <thead>
                      <tr>
                        <th>Flight</th>
                        <th>To</th>
                        <th>Dep</th>
                        <th className="hide-below-sm">Gate</th>
                        <th className="text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {board.map((f) => (
                        <tr key={f.flightNo} className="cursor-pointer" onClick={() => nav(`/flight-status?flight=${f.flightNo}`)}>
                          <td className="num font-semibold text-navy-900">{f.flightNo}</td>
                          <td>
                            {f.destCity} <span className="num text-ink-400">{f.destination}</span>
                          </td>
                          <td className="num">{new Date(f.schedDep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="num hidden sm:table-cell">{f.gate}</td>
                          <td className="text-right">
                            <StatusBadge status={f.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {tab === 'arriving' && (
              <>
                <div className="card p-5">
                  <SectionHeading eyebrow="Arrivals" title={`Getting from ${a.code} into ${cityOf(a.code)}`} lead={a.city} className="mb-4 [&_h2]:text-[1.375rem]" />
                  <ul className="space-y-3">
                    {a.transport.map((t) => (
                      <li key={t.mode} className="flex flex-wrap items-center gap-4 rounded-[12px] border border-line p-3.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-navy-50 text-navy-700">
                          <TrainFront size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-[.9375rem] font-semibold text-navy-900">{t.mode}</span>
                          <span className="block text-[.8125rem] text-ink-500">{t.detail}</span>
                        </span>
                        <Badge tone="neutral">{t.time}</Badge>
                      </li>
                    ))}
                  </ul>
                  <Divider className="my-5" label="Parking" />
                  <ul className="grid gap-2 sm:grid-cols-3">
                    {a.parking.map((p) => (
                      <li key={p.label} className="rounded-[12px] border border-line p-3">
                        <p className="text-[.8125rem] font-semibold text-navy-900">{p.label}</p>
                        <p className="num text-[.8125rem] text-ink-500">{p.price}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card p-5">
                  <p className="h-3 text-[1.0625rem]">Immigration & customs</p>
                  <p className="mt-2 text-[.9375rem] leading-relaxed text-ink-600">
                    {a.hub ? 'AeroNova passengers use the dedicated row at the end of the hall; median wait 9 minutes on a 06:00 arrival. ' : 'The hall is small; the wait is usually under the time it takes to get your bag. '}
                    All arriving passengers complete the digital declaration up to 72 hours before landing — the link is in your app trip.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => toast({ tone: 'info', title: 'Declaration form', body: 'Opens 72 h before arrival and pre-fills from your booking.' })}>
                      Pre-fill my arrival card
                    </Button>
                    <Button size="sm" variant="ghost" to={`/destinations/${DEST_SLUG[a.code] ?? ''}`}>
                      {a.city} guide
                    </Button>
                  </div>
                </div>
              </>
            )}

            {tab === 'transit' && (
              <>
                <div className="card p-5">
                  <SectionHeading eyebrow="Connections" title={`Minimum connect time at ${a.code}: ${a.transitMin} minutes`} lead="And the honest number, which is what it feels like when the inbound is late." className="mb-4 [&_h2]:text-[1.375rem]" />
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ['Same terminal', `${a.transitMin} min`, 'Airside, no re-screening'],
                      ['Terminal change', `${a.transitMin + 25} min`, 'Escort available at the gate desk, free'],
                      ['Re-check bags', `${a.transitMin + 35} min`, 'Only needed on separate tickets'],
                    ].map(([k, v, n]) => (
                      <div key={k as string} className="rounded-[14px] border border-line p-4">
                        <p className="text-[.6875rem] uppercase tracking-[0.1em] text-ink-400">{k}</p>
                        <p className="num font-display text-[1.5rem] font-semibold text-navy-900">{v}</p>
                        <p className="mt-1 text-[.8125rem] text-ink-500">{n}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 flex items-start gap-2.5 rounded-[12px] bg-teal-50 p-3.5 text-[.875rem] leading-relaxed text-teal-900">
                    <Check size={15} className="mt-0.5 shrink-0" />
                    On a single AeroNova ticket your bags go through, and if you miss the connection because we were late, the next flight, the hotel and the food are ours. {a.code === 'ACC' && 'The transit lounge is at the top of the mezzanine with showers and a nap pod bank.'}
                  </p>
                </div>
                <div className="card p-5">
                  <p className="h-3 text-[1.0625rem]">While you wait</p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {a.facilities.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-[.875rem] text-ink-600">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" /> {f}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-[.8125rem] text-ink-500">Lounges here: {a.lounges.join(' · ')}</p>
                </div>
              </>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-[calc(var(--nav)+64px)] lg:self-start">
            <div className="card p-4">
              <p className="font-display text-[.9375rem] font-semibold text-navy-900">Practical</p>
              <dl className="mt-3 space-y-2 text-[.8125rem]">
                {[
                  ['Opening', a.opening],
                  ['Terminals', a.terminals.join(', ')],
                  ['Gates', String(a.gates)],
                  ['Check-in rows', a.counters],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-line pb-1.5 last:border-0">
                    <dt className="text-ink-400">{k}</dt>
                    <dd className="text-right font-medium text-navy-900">{v}</dd>
                  </div>
                ))}
              </dl>
              <Button size="sm" variant="secondary" className="mt-4 w-full" to={`/flight-status?from=${a.code}`}>
                Flight status here
              </Button>
            </div>
            <div className="card p-4">
              <p className="font-display text-[.9375rem] font-semibold text-navy-900">Related rules</p>
              <ul className="mt-2.5 space-y-1.5">
                {TRAVEL_SECTIONS.slice(0, 4).map((s) => (
                  <li key={s.id}>
                    <Link to={`/travel-information/${s.id}`} className="flex items-center justify-between gap-2 text-[.8125rem] text-ink-600 hover:text-navy-900">
                      {s.title}
                      <ArrowLeftRight size={12} className="text-ink-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-card bg-navy-900 p-4 text-white">
              <p className="text-[.6875rem] uppercase tracking-[0.16em] text-teal-300">Tip from the station manager</p>
              <p className="mt-2 text-[.875rem] leading-relaxed text-white/75">
                {a.hub ? `Arrive at the ${a.terminals[0]} door 4 — it is the only one with a covered walkway that does not back up.` : `Our crew bus leaves the terminal 15 minutes before boarding; if you see them walking, so should you.`}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

const DEST_SLUG: Record<string, string> = { ACC: 'accra', NBO: 'nairobi', JNB: 'johannesburg', CPT: 'cape-town', LOS: 'lagos', KGL: 'kigali', ZNZ: 'zanzibar', VFA: 'victoria-falls', MRU: 'mauritius', DXB: 'dubai', LHR: 'london', JFK: 'new-york', IST: 'istanbul', SEZ: 'seychelles' };

export const cityLabel = cityOf;
