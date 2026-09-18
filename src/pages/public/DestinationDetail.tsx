import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Building2, CalendarDays, Camera, Clock, Landmark, Palmtree, Ticket, Umbrella, Waves } from 'lucide-react';
import { cx, durationLabel, money, toISODate, DAY } from '../../lib/utils';
import { bySlug, DESTINATIONS } from '../../data/destinations';
import { BY_CODE } from '../../data/airports';
import { Photo, RouteArc, SkylineTile } from '../../components/brand/Brand';
import { DestinationCard } from '../../components/airline/Cards';
import { Badge, Button, Divider, EmptyState, Meter, NovaRule, SectionHeading } from '../../components/ui/Primitives';
import { Breadcrumbs } from '../../components/ui/Overlay';
import { Tabs } from '../../components/ui/Overlay';
import { FlightSearchWidget } from '../../components/booking/FlightSearchWidget';
import { useStore } from '../../store/store';
import { StickyBookBar } from '../../components/layout/PublicLayout';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'when', label: 'When to go' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'do', label: 'What to do' },
  { id: 'stay', label: 'Where to stay' },
  { id: 'around', label: 'Getting around' },
  { id: 'flights', label: 'Flights' },
];

export default function DestinationDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const d = bySlug(slug ?? '');
  const { prefs } = useStore();
  const [tab, setTab] = useState<(typeof SECTIONS)[number]['id']>('overview');
  const [saved, setSaved] = useState(false);
  const [budget, setBudget] = useState(2);

  const dep = useMemo(() => toISODate(new Date(Date.now() + 21 * DAY)), []);

  if (!d)
    return (
      <div className="shell py-24">
        <EmptyState title="That destination is not in the guide yet" body="We fly 41 cities; sixteen have written guides so far. Search the fares anyway." icon={<Palmtree size={20} />} action={<Button onClick={() => nav('/destinations')}>All destinations</Button>} />
      </div>
    );

  const airport = BY_CODE.get(d.code);

  return (
    <div>
      {/* hero */}
      <section className="relative isolate overflow-hidden bg-navy-950 pb-14 pt-[calc(var(--nav)+1rem)] text-white">
        <Photo src={d.img} alt="" seed={d.slug} className="absolute inset-0 -z-10" imgClassName="h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950 via-navy-950/75 to-navy-950/35" />
        <div className="shell">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Destinations', to: '/destinations' }, { label: d.city }]} dark className="mb-6" />
          <div className="grid gap-8 lg:grid-cols-[1.3fr_minmax(0,340px)] lg:items-end">
            <div>
              <p className="eyebrow text-teal-300">
                {d.region} · {d.code} · {d.weekly} departures a week
              </p>
              <h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,4.75rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-white">{d.city}</h1>
              <p className="mt-3 font-display text-[1.125rem] font-medium text-teal-200">{d.tagline}</p>
              <p className="mt-5 max-w-2xl text-[1rem] leading-relaxed text-white/75">{d.blurb}</p>
              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <Button variant="onDark" onClick={() => nav(`/search?from=ACC&to=${d.code}&dep=${dep}`)}>
                  Search flights to {d.city}
                </Button>
                <Button variant="ghost" className="border border-white/25 text-white hover:bg-white/10" onClick={() => { setSaved(!saved); }}>
                  {saved ? 'Saved to your trips' : 'Save this destination'}
                </Button>
                <span className="ml-2 flex items-baseline gap-2">
                  <span className="text-[.6875rem] uppercase tracking-[0.14em] text-white/50">fares from</span>
                  <span className="num font-display text-[1.5rem] font-semibold">{money(d.startFare, prefs.currency)}</span>
                </span>
              </div>
            </div>
            <div className="rounded-card border border-white/12 bg-navy-900/70 p-4 backdrop-blur-md">
              <dl className="space-y-3 text-[.875rem]">
                {[
                  ['Country', d.country],
                  ['Airport', `${airport?.name ?? d.code} (${d.code})`],
                  ['Flight time from Accra', d.durationMin ? durationLabel(d.durationMin) : 'Hub station'],
                  ['Best time to visit', d.bestTime],
                  ['Currency', d.currency],
                  ['Language', d.language],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-3 border-b border-white/8 pb-2 last:border-0 last:pb-0">
                    <dt className="text-white/45">{k}</dt>
                    <dd className="text-right font-medium text-white">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 rounded-[10px] bg-teal-400/10 p-2.5 text-[.75rem] leading-snug text-teal-200">
                <span className="font-semibold">Visa:</span> {d.visa}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* section nav */}
      <div className="sticky top-[var(--nav)] z-30 border-b border-line bg-white/95 backdrop-blur-xl">
        <div className="shell">
          <Tabs
            value={tab}
            onChange={(v) => {
              setTab(v);
              document.getElementById(v)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            items={SECTIONS.map((s) => ({ id: s.id, label: s.label }))}
            className="!border-b-0"
          />
        </div>
      </div>

      <div className="bg-mist-50/50 pb-20">
        <div className="shell py-10">
          {/* overview */}
          <section id="overview" className="grid scroll-mt-[calc(var(--nav)+64px)] gap-10 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <SectionHeading eyebrow="The short version" title={`Why ${d.city}, and why now`} className="mb-0" />
              <div className="prose-body mt-5">
                <p className="text-[1.0625rem] leading-[1.7] text-ink-700">{d.story ?? d.blurb}</p>
                <p className="mt-4 text-[.9375rem] leading-relaxed text-ink-600">
                  {d.angle} AeroNova runs {d.weekly} departures a week into {airport?.name ?? 'the airport'} on {d.flightNos.join(', ')} — enough that a missed connection is an inconvenience, not a lost day.
                </p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: <CalendarDays size={16} />, k: 'Season', v: d.bestTime },
                  { icon: <Ticket size={16} />, k: 'Entry', v: d.visa.split('—')[0].split(';')[0] },
                  { icon: <Waves size={16} />, k: 'Tags', v: d.tags.map((t) => t.replace(/-/g, ' ')).join(' · ') },
                  { icon: <Clock size={16} />, k: 'From Accra', v: d.durationMin ? `${durationLabel(d.durationMin)} non-stop` : 'We are here' },
                ].map((x) => (
                  <div key={x.k} className="flex items-start gap-3 rounded-[14px] border border-line bg-white p-3.5">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-navy-50 text-navy-700">{x.icon}</span>
                    <span className="min-w-0">
                      <span className="block text-[.6875rem] uppercase tracking-[0.1em] text-ink-400">{x.k}</span>
                      <span className="block text-[.875rem] font-medium text-navy-900">{x.v}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="overflow-hidden rounded-card border border-line bg-white">
                <Photo src={d.img} alt={`${d.city} at dusk`} seed={d.slug + 'b'} className="h-44" imgClassName="object-cover" />
                <div className="p-4">
                  <p className="font-display text-[.9375rem] font-semibold text-navy-900">Landing tips from our crew</p>
                  <ul className="mt-2.5 space-y-2">
                    {d.tips.map((t) => (
                      <li key={t} className="flex gap-2.5 text-[.8125rem] leading-relaxed text-ink-600">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-teal-500" />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <NovaRule className="mt-4" />
                </div>
              </div>
              <div className="rounded-card border border-line bg-white p-4">
                <p className="font-display text-[.9375rem] font-semibold text-navy-900">Daily budget, per person</p>
                <div className="mt-3 flex items-center gap-2">
                  {[
                    { k: 1, l: 'Backpacker' },
                    { k: 2, l: 'Comfortable' },
                    { k: 3, l: 'Spoiled' },
                  ].map((b) => (
                    <button key={b.k} onClick={() => setBudget(b.k)} className={cx('flex-1 rounded-[10px] border px-2 py-1.5 text-[.8125rem] font-semibold transition', budget === b.k ? 'border-navy-800 bg-navy-800 text-white' : 'border-line text-ink-600 hover:border-navy-300')}>
                      {b.l}
                    </button>
                  ))}
                </div>
                <ul className="mt-3 space-y-2 text-[.8125rem]">
                  {[
                    ['Meal, mid-range', [22, 46, 110][budget - 1]],
                    ['Airport transfer', [14, 28, 62][budget - 1]],
                    ['Bed, decent', [48, 118, 320][budget - 1]],
                    ['One big ticket activity', [35, 95, 260][budget - 1]],
                  ].map(([k, v]) => (
                    <li key={k as string} className="flex items-center justify-between gap-3 border-b border-line pb-1.5 last:border-0">
                      <span className="text-ink-500">{k}</span>
                      <span className="num font-semibold text-navy-900">{money(v as number, prefs.currency)}</span>
                    </li>
                  ))}
                </ul>
                <p className="num mt-3 flex items-baseline justify-between rounded-[10px] bg-teal-50 px-3 py-2">
                  <span className="text-[.8125rem] font-medium text-teal-900">Realistic day total</span>
                  <span className="font-display text-[1.125rem] font-semibold text-teal-800">{money([119, 287, 752][budget - 1], prefs.currency)}</span>
                </p>
              </div>
            </div>
          </section>

          <Divider className="my-12" />

          {/* when to go */}
          <section id="when" className="scroll-mt-[calc(var(--nav)+64px)]">
            <SectionHeading eyebrow="When to go" title="Weather, crowds and the two windows that matter." lead="Our station managers add these numbers every month from what they actually see, not a climate average." />
            <div className="mt-7 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="card p-5">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <p className="h-3 text-[1.0625rem]">Temperature &amp; rain</p>
                  <p className="text-[.75rem] text-ink-400">°C high / low · mm rain per month</p>
                </div>
                <div className="mt-5 flex h-56 items-end gap-2">
                  {d.weather.map((w) => {
                    const max = Math.max(...d.weather.map((x) => x.rain), 60);
                    return (
                      <div key={w.month} className="group flex flex-1 flex-col items-center gap-1.5">
                        <div className="relative flex h-full w-full items-end justify-center gap-1">
                          <span className="w-2/5 rounded-t-[4px] bg-navy-700 transition group-hover:bg-navy-900" style={{ height: `${(w.high / 40) * 100}%` }} title={`${w.high}°C`} />
                          <span className="w-2/5 rounded-t-[4px] bg-sky-300 transition group-hover:bg-sky-400" style={{ height: `${(w.low / 40) * 100}%` }} title={`${w.low}°C`} />
                          <span className="absolute bottom-0 w-full rounded-t-[4px] bg-teal-500/25 transition group-hover:bg-teal-500/40" style={{ height: `${(w.rain / max) * 66}%` }} title={`${w.rain} mm`} />
                          <span className="num pointer-events-none absolute inset-x-0 -top-5 text-center text-[.625rem] font-semibold text-ink-400 opacity-0 transition group-hover:opacity-100">{w.high}°</span>
                        </div>
                        <span className="text-[.625rem] font-medium uppercase tracking-wide text-ink-400">{w.month}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-line pt-3 text-[.75rem] text-ink-500">
                  {[
                    ['bg-navy-700', 'High °C'],
                    ['bg-sky-300', 'Low °C'],
                    ['bg-teal-500/40', 'Rain mm'],
                  ].map(([c, l]) => (
                    <span key={l} className="flex items-center gap-1.5">
                      <span className={cx('h-2.5 w-2.5 rounded-sm', c)} /> {l}
                    </span>
                  ))}
                  <span className="ml-auto flex items-center gap-1.5">
                    <Umbrella size={13} /> {d.bestTime}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { t: 'Peak', b: 'December – February and July – August. Fares run 15–22% higher and the good hotels need six weeks notice.', tone: 'ember' as const },
                  { t: 'Shoulder', b: 'May – June and September – October. Same weather, fewer people, and the fares below are what we actually sell.', tone: 'teal' as const },
                  { t: 'Avoid if you can', b: d.slug === 'lagos' ? 'Mid-February to March: traffic is at its worst and the harmattan dust grounds visibility some mornings.' : 'The long rains — not because it rains constantly, but because day trips get cancelled and roads slow down.', tone: 'gold' as const },
                ].map((x) => (
                  <div key={x.t} className="card p-4">
                    <p className="flex items-center gap-2 font-display text-[.9375rem] font-semibold text-navy-900">
                      <span className={cx('h-2 w-2 rounded-full', x.tone === 'ember' ? 'bg-ember-500' : x.tone === 'teal' ? 'bg-teal-500' : 'bg-gold-500')} /> {x.t}
                    </p>
                    <p className="mt-1.5 text-[.875rem] leading-relaxed text-ink-600">{x.b}</p>
                  </div>
                ))}
                <div className="rounded-card border border-line bg-white p-4">
                  <p className="text-[.8125rem] leading-relaxed text-ink-600">
                    <span className="font-semibold text-navy-900">Fare insight:</span> Tuesdays and Wednesdays out of Accra are cheapest into {d.city} in {d.weather.length ? 'most months' : 'general'} — our load factor drops about {8 + d.city.length % 6} points midweek.
                  </p>
                  <div className="mt-3 space-y-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                      const load = [86, 71, 66, 74, 93, 89, 80][i];
                      return <Meter key={day} value={load} label={day} tone={load > 88 ? 'ember' : load < 72 ? 'teal' : 'navy'} />;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Divider className="my-12" />

          {/* highlights */}
          <section id="highlights" className="scroll-mt-[calc(var(--nav)+64px)]">
            <SectionHeading eyebrow="Highlights" title={`Six things worth building the trip around.`} action={<Badge tone="neutral">{d.highlights.length} curated</Badge>} />
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {d.highlights.map((h, i) => (
                <article key={h.title} className={cx('group relative overflow-hidden rounded-card border border-line bg-white p-5 transition hover:shadow-card', i === 0 && 'sm:col-span-2 sm:flex sm:gap-6')}>
                  {i === 0 && (
                    <div className="mb-4 shrink-0 overflow-hidden rounded-[12px] sm:mb-0 sm:w-56">
                      <SkylineTile seed={h.title} ratio="4/3" className="h-full w-full transition-transform duration-700 group-hover:scale-105" label={d.code} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-teal-600">{h.tag}</p>
                    <h3 className="mt-2 font-display text-[1.0625rem] font-semibold text-navy-900">{h.title}</h3>
                    <p className="mt-1.5 text-[.875rem] leading-relaxed text-ink-600">{h.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <Divider className="my-12" />

          {/* what to do */}
          <section id="do" className="grid scroll-mt-[calc(var(--nav)+64px)] gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <SectionHeading eyebrow="What to do" title="The list our crew actually uses." className="mb-0" />
              <ul className="mt-6 divide-y divide-line overflow-hidden rounded-card border border-line bg-white">
                {d.attractions.map((a) => (
                  <li key={a.name} className="flex flex-wrap items-start gap-4 p-4 transition hover:bg-mist-50/60">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-navy-50 text-navy-700">
                      <Landmark size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-[.9375rem] font-semibold text-navy-900">{a.name}</p>
                      <p className="mt-0.5 text-[.8125rem] leading-relaxed text-ink-500">{a.note}</p>
                    </div>
                    <Badge tone="neutral">{a.kind}</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="rounded-card border border-line bg-white p-5">
                <p className="font-display text-[.9375rem] font-semibold text-navy-900">Practical notes</p>
                <ul className="mt-3 space-y-2.5 text-[.875rem] leading-relaxed text-ink-600">
                  <li><span className="font-medium text-navy-900">Money:</span> {d.currency}. Cards work in hotels and most restaurants; carry small notes for markets.</li>
                  <li><span className="font-medium text-navy-900">Language:</span> {d.language}.</li>
                  <li><span className="font-medium text-navy-900">Airport:</span> {airport?.name}. {airport?.transitMin ?? 60} minutes minimum connect, and transit is {airport?.region === 'Africa' ? 'usually' : 'normally'} airside on one ticket.</li>
                  <li><span className="font-medium text-navy-900">Check-in:</span> counters in {airport?.counters ?? 'the main hall'}.</li>
                </ul>
              </div>
              <div className="relative overflow-hidden rounded-card bg-navy-900 p-5 text-white">
                <RouteArc className="pointer-events-none absolute -right-6 -top-2 h-24 w-64 text-teal-400/40" />
                <p className="relative text-2xs font-semibold uppercase tracking-[0.16em] text-teal-300">AeroNova in {d.city}</p>
                <h3 className="relative mt-2 font-display text-[1.125rem] font-semibold">{d.angle}</h3>
                <ul className="relative mt-3 space-y-1.5 text-[.875rem] text-white/70">
                  <li>{d.flightNos.length} daily frequencies · {d.weekly} a week</li>
                  <li>{airport?.lounges.length ?? 1} lounge {((airport?.lounges.length ?? 1) > 1 ? 'options' : 'option')} at {d.code}</li>
                  <li>Our {d.slug === 'accra' ? 'engineering base' : 'station team'} is {airport?.gates ?? 8} gates from the arrivals hall</li>
                </ul>
                <Button size="sm" variant="onDark" className="relative mt-4" to={`/airports/${d.code}`}>
                  Airport guide
                </Button>
              </div>
            </div>
          </section>

          <Divider className="my-12" />

          {/* where to stay */}
          <section id="stay" className="scroll-mt-[calc(var(--nav)+64px)]">
            <SectionHeading eyebrow="Where to stay" title="Four addresses we would send a colleague to." lead="Not sponsored. Our crew hotels and partner properties, priced per night in your currency." />
            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {d.hotels.map((h) => (
                <article key={h.name} className="group flex flex-col overflow-hidden rounded-card border border-line bg-white transition hover:shadow-card">
                  <div className="relative h-32 overflow-hidden">
                    <SkylineTile seed={h.name} ratio="auto" className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute right-3 top-3 flex items-center gap-0.5 rounded-pill bg-white/90 px-2 py-0.5 text-[.6875rem] font-semibold text-navy-900 backdrop-blur">
                      {Array.from({ length: h.stars }).map((_, i) => (
                        <span key={i} className="text-gold-500">
                          ★
                        </span>
                      ))}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="font-display text-[.9375rem] font-semibold text-navy-900">{h.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[.75rem] text-ink-400">
                      <Building2 size={12} /> {h.area}
                    </p>
                    <p className="mt-2 flex-1 text-[.8125rem] leading-relaxed text-ink-500">{h.note}</p>
                    <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
                      <p>
                        <span className="num font-display text-[1.125rem] font-semibold text-navy-900">{money(h.priceUSD, prefs.currency)}</span>
                        <span className="text-[.6875rem] text-ink-400"> / night</span>
                      </p>
                      <span className="flex items-center gap-1 text-[.75rem] font-semibold text-sky-700 transition group-hover:gap-2">
                        Partner rate <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <Divider className="my-12" />

          {/* getting around */}
          <section id="around" className="scroll-mt-[calc(var(--nav)+64px)]">
            <SectionHeading eyebrow="Getting around" title={`${airport?.name ?? 'The airport'} to the city, and what it costs.`} />
            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {(airport?.transport ?? []).map((t, i) => (
                <div key={t.mode} className="card p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-display text-[.9375rem] font-semibold text-navy-900">{t.mode}</p>
                    <Badge tone={i === 0 ? 'teal' : 'neutral'}>{t.time}</Badge>
                  </div>
                  <p className="mt-2 text-[.8125rem] leading-relaxed text-ink-500">{t.detail}</p>
                  <p className="num mt-3 border-t border-line pt-2.5 text-[.8125rem] text-ink-600">
                    Typical cost {money([6, 28, 18, 45][i % 4], prefs.currency)}
                  </p>
                </div>
              ))}
              <div className="card flex flex-col justify-between p-4">
                <p className="font-display text-[.9375rem] font-semibold text-navy-900">Nova chauffeur</p>
                <p className="mt-2 text-[.8125rem] leading-relaxed text-ink-500">Included for Nova Business on African routes; USD 46 for anyone else. Flight-aware, 60 minutes of free waiting.</p>
                <Button size="sm" variant="secondary" className="mt-3" to="/experience/airport">
                  Ground transfers
                </Button>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-card border border-line bg-white p-4 text-[.8125rem] text-ink-500">
              {airport?.facilities.slice(0, 6).map((f) => (
                <span key={f} className="flex items-center gap-1.5">
                  <Camera size={13} className="text-ink-300" /> {f}
                </span>
              ))}
            </div>
          </section>

          <Divider className="my-12" />

          {/* flights */}
          <section id="flights" className="scroll-mt-[calc(var(--nav)+64px)]">
            <SectionHeading eyebrow="Flights" title={`Getting to ${d.city}.`} lead="The widget below is live: change the origin and it will price the route." />
            <div className="mt-7">
              <FlightSearchWidget
                variant="panel"
                initial={{ tripType: 'round', legs: [{ from: 'ACC', to: d.code, date: dep }], returnDate: toISODate(new Date(Date.now() + 28 * DAY)), adults: 2, children: 0, infants: 0, cabin: 'ECONOMY', promo: '' }}
              />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { t: 'Best day to fly', b: `Midweek into ${d.city}. Friday and Sunday carry a premium of about ${12 + (d.city.length % 9)}%.` },
                { t: 'Book 3–8 weeks out', b: 'Our intra-African fares rise sharply inside 7 days; long-haul inside 21.' },
                { t: 'One-stop can be cheaper', b: `Routing via ${d.region === 'Africa' ? 'Nairobi or Johannesburg' : 'Accra'} often saves 20–35% and adds under 3 hours.` },
              ].map((x) => (
                <div key={x.t} className="rounded-card border border-line bg-white p-4">
                  <p className="font-display text-[.9375rem] font-semibold text-navy-900">{x.t}</p>
                  <p className="mt-1.5 text-[.875rem] leading-relaxed text-ink-500">{x.b}</p>
                </div>
              ))}
            </div>
          </section>

          {/* related */}
          {d.related.length > 0 && (
            <section className="mt-14">
              <SectionHeading eyebrow="Keep going" title="Combine it with…" action={<Button size="sm" variant="secondary" to="/destinations">All destinations</Button>} className="[&_h2]:text-[1.5rem]" />
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {d.related.map((r) => {
                  const rel = DESTINATIONS.find((x) => x.slug === r);
                  return rel ? <DestinationCard key={r} d={rel} /> : null;
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      <StickyBookBar price={`${money(d.startFare, prefs.currency)} to ${d.city}`} meta={`${d.flightNos.length} frequencies · ${d.weekly} a week`} onBook={() => nav(`/search?from=ACC&to=${d.code}&dep=${dep}`)} label="Search flights" />
    </div>
  );
}
