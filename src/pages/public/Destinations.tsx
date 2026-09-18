import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Compass, Grid2x2, List, Plane, Search, SlidersHorizontal, Ticket } from 'lucide-react';
import { cx, durationLabel, money } from '../../lib/utils';
import { DESTINATIONS } from '../../data/destinations';
import { AIRPORTS } from '../../data/airports';
import { Photo, SkylineTile } from '../../components/brand/Brand';
import { DestinationCard } from '../../components/airline/Cards';
import { NetworkMap } from '../../components/airline/NetworkMap';
import { Button, EmptyState, SectionHeading } from '../../components/ui/Primitives';
import { Input, SegmentedControl, Select } from '../../components/ui/Form';
import { useStore } from '../../store/store';
import { PageHero } from '../../components/layout/PublicLayout';

const REGIONS = ['All', 'Africa', 'Europe', 'Middle East', 'Asia', 'North America', 'South America'] as const;
type Region = (typeof REGIONS)[number];

export default function Destinations() {
  const { prefs } = useStore();
  const [region, setRegion] = useState<Region>('All');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'featured' | 'price' | 'time' | 'name'>('featured');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showAll, setShowAll] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  const list = useMemo(() => {
    let out = DESTINATIONS.filter((d) => (region === 'All' ? true : d.region === region));
    if (q.trim()) {
      const t = q.toLowerCase();
      out = out.filter((d) => `${d.city} ${d.country} ${d.code} ${d.tags.join(' ')} ${d.blurb}`.toLowerCase().includes(t));
    }
    if (sort === 'price') out = [...out].sort((a, b) => a.startFare - b.startFare);
    if (sort === 'time') out = [...out].sort((a, b) => a.durationMin - b.durationMin);
    if (sort === 'name') out = [...out].sort((a, b) => a.city.localeCompare(b.city));
    return out;
  }, [region, q, sort]);

  const shown = showAll ? list : list.slice(0, 8);
  const extraCities = AIRPORTS.filter((a) => !DESTINATIONS.some((d) => d.code === a.code)).slice(0, 18);

  return (
    <div>
      <PageHero
        tone="navy"
        image="/img/airport-night.jpg"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Destinations' }]}
        eyebrow="41 destinations · 5 continents"
        title={
          <>
            Cities we know
            <br />
            from the inside.
          </>
        }
        lead="Our crews live in these places, our engineers are based in most of them, and the guides below were written by people who eat there. No scraped prose."
      >
        <div className="mt-7 flex flex-wrap items-center gap-2.5">
          <Button variant="onDark" onClick={() => setMapOpen(true)} icon={<Compass size={16} />}>
            Open the network map
          </Button>
          <Button variant="ghost" className="border border-white/25 text-white hover:bg-white/10" to="/offers">
            See current offers
          </Button>
          <div className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-1 text-[.8125rem] text-white/60">
            <span className="flex items-center gap-1.5">
              <Plane size={14} className="text-teal-300" /> 317 weekly departures
            </span>
            <span className="flex items-center gap-1.5">
              <Ticket size={14} className="text-teal-300" /> Fares from {money(98, prefs.currency)}
            </span>
          </div>
        </div>
      </PageHero>

      {/* filter bar */}
      <div className="sticky top-[var(--nav)] z-30 border-b border-line bg-white/95 backdrop-blur-xl">
        <div className="shell flex flex-wrap items-center gap-3 py-3">
          <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cities, countries, tags…" className="h-10 pl-9" aria-label="Search destinations" />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRegion(r);
                  setShowAll(false);
                }}
                className={cx('shrink-0 rounded-pill border px-3 py-1.5 text-[.8125rem] font-semibold transition', region === r ? 'border-navy-800 bg-navy-800 text-white' : 'border-line text-ink-600 hover:border-navy-300')}
              >
                {r}
                <span className="num ml-1.5 text-[.6875rem] opacity-70">{r === 'All' ? DESTINATIONS.length : DESTINATIONS.filter((d) => d.region === r).length}</span>
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-10 w-[160px] text-[.8125rem]" aria-label="Sort destinations">
              <option value="featured">Featured first</option>
              <option value="price">Lowest fare</option>
              <option value="time">Shortest flight</option>
              <option value="name">A–Z</option>
            </Select>
            <SegmentedControl
              size="sm"
              value={view}
              onChange={setView}
              options={[
                { id: 'grid', label: <Grid2x2 size={14} /> },
                { id: 'list', label: <List size={14} /> },
              ]}
            />
          </div>
        </div>
      </div>

      <section className="bg-mist-50/60 py-10">
        <div className="shell">
          {list.length === 0 ? (
            <EmptyState
              title={`Nothing matches “${q}” in ${region}`}
              body="We serve 41 cities. Try a country, a region, or a reason — beach, business, safari."
              icon={<Search size={20} />}
              action={
                <Button size="sm" onClick={() => { setQ(''); setRegion('All'); }}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="num text-[.875rem] text-ink-500">
                  Showing {shown.length} of {list.length} destination{list.length === 1 ? '' : 's'}
                </p>
                <p className="flex items-center gap-1.5 text-[.8125rem] text-ink-400">
                  <SlidersHorizontal size={13} /> Sorted by {sort}
                </p>
              </div>

              {view === 'grid' ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {shown.map((d, i) => (
                    <div key={d.slug} className={cx(i % 4 === 1 && 'lg:translate-y-5', i % 4 === 3 && 'lg:-translate-y-3')}>
                      <DestinationCard d={d} />
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="space-y-3">
                  {shown.map((d) => (
                    <li key={d.slug}>
                      <Link to={`/destinations/${d.slug}`} className="group grid items-center gap-4 rounded-card border border-line bg-white p-3 transition hover:border-sky-300 hover:shadow-card sm:grid-cols-[130px_1fr_auto]">
                        <Photo src={d.img} alt="" seed={d.slug} className="h-24 rounded-[12px]" />
                        <div className="min-w-0">
                          <p className="font-display text-[1.0625rem] font-semibold text-navy-900">
                            {d.city} <span className="text-[.8125rem] font-medium text-ink-400">{d.country}</span>
                          </p>
                          <p className="mt-1 line-clamp-2 text-[.875rem] leading-relaxed text-ink-500">{d.blurb}</p>
                          <p className="mt-1.5 flex flex-wrap gap-1.5">
                            {d.tags.slice(0, 3).map((t) => (
                              <span key={t} className="rounded-pill bg-mist-100 px-2 py-0.5 text-[.6875rem] text-ink-500">
                                {String(t ?? '').replace(/-/g, ' ')}
                              </span>
                            ))}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-6 pr-2">
                          <p className="text-right">
                            <span className="num block text-[.75rem] text-ink-400">{d.durationMin ? durationLabel(d.durationMin) : 'hub'}</span>
                            <span className="num font-display text-[1.125rem] font-semibold text-navy-900">{money(d.startFare, prefs.currency)}</span>
                          </p>
                          <ArrowUpRight size={17} className="text-ink-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-navy-800" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {!showAll && list.length > 8 && (
                <div className="mt-8 flex justify-center">
                  <Button variant="secondary" onClick={() => setShowAll(true)}>
                    Show {list.length - 8} more destinations
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* beyond the guides */}
      <section className="border-t border-line bg-white py-14">
        <div className="shell">
          <SectionHeading
            eyebrow="Also on the network"
            title="33 more cities we fly, without the long guide."
            lead="These stations have full airport pages, schedules and fares — the written guides are being added by our station teams through the year."
            action={<Button size="sm" variant="secondary" to="/airports">Airport guides</Button>}
          />
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {extraCities.map((a) => (
              <li key={a.code}>
                <Link to={`/search?to=${a.code}&from=ACC`} className="group flex items-center gap-3 rounded-[14px] border border-line p-2.5 transition hover:border-sky-300 hover:bg-sky-50/40">
                  <span className="grid h-10 w-12 shrink-0 place-items-center overflow-hidden rounded-[9px]">
                    <SkylineTile seed={a.code} ratio="4/3" className="h-full w-full" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[.875rem] font-semibold text-navy-900">{a.city}</span>
                    <span className="num block truncate text-[.6875rem] text-ink-400">
                      {a.code} · {a.country}
                    </span>
                  </span>
                  <ArrowUpRight size={14} className="shrink-0 text-ink-300 transition group-hover:text-navy-800" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* map + request a route */}
      <section className="relative overflow-hidden bg-navy-900 py-16 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] texture-grid" />
        <div className="shell relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div>
            <p className="eyebrow text-teal-300">Route planning</p>
            <h2 className="h-1 mt-3 text-white">Where should we fly next?</h2>
            <p className="mt-4 max-w-xl text-[1rem] leading-relaxed text-white/70">
              Two of our last five routes exist because passengers asked for them in the app. If you fly a corridor regularly, tell us — we publish the shortlist we are modelling every quarter.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Monrovia', 'Freetown', 'Niamey', 'N’Djamena', 'Kampala', 'Lilongwe', 'Port Elizabeth', 'Skikda'].map((c) => (
                <button key={c} onClick={() => setMapOpen(true)} className="rounded-pill border border-white/15 px-3 py-1.5 text-[.8125rem] font-medium text-white/70 transition hover:border-teal-400 hover:text-white">
                  {c}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setMapOpen(true);
              }}
              className="mt-7 flex max-w-lg flex-col gap-2 sm:flex-row"
            >
              <input placeholder="Your city" aria-label="City you would like us to serve" className="h-12 flex-1 rounded-[12px] border border-white/15 bg-white/5 px-4 text-white outline-none placeholder:text-white/35 focus:border-teal-400" />
              <Button type="submit" variant="onDark">
                Request a route
              </Button>
            </form>
          </div>
          <div className="rounded-card border border-white/10 bg-navy-950/60 p-4">
            <NetworkMap className="w-full" />
            <p className="mt-3 text-[.75rem] text-white/45">Hover a node for the station · click to search flights from that hub</p>
          </div>
        </div>
      </section>

      {mapOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm" onClick={() => setMapOpen(false)}>
          <div className="w-full max-w-5xl rounded-card bg-white p-5 shadow-lift" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <h2 className="h-3">AeroNova network</h2>
                <p className="text-[.8125rem] text-ink-500">41 destinations · hubs at Accra, Nairobi and Johannesburg</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setMapOpen(false)}>
                Close
              </Button>
            </div>
            <NetworkMap className="w-full" hubs={['ACC', 'NBO', 'JNB']} />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                ['Africa', '27 cities'],
                ['Europe & Türkiye', '6 cities'],
                ['Middle East, Asia, Americas', '8 cities'],
              ].map(([a, b]) => (
                <div key={a} className="rounded-[12px] border border-line p-3">
                  <p className="font-display text-[.875rem] font-semibold text-navy-900">{a}</p>
                  <p className="num text-[.8125rem] text-ink-500">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
