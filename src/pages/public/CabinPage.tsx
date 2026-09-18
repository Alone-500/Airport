import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Check, Luggage, Minus, Plane, Ruler, Sparkles, Star } from 'lucide-react';
import { cx, money, toISODate, DAY } from '../../lib/utils';
import { cabinBySlug, CABINS } from '../../data/experience';
import { Photo } from '../../components/brand/Brand';
import { Badge, Button, Divider, EmptyState, Meter, SectionHeading } from '../../components/ui/Primitives';
import { Accordion } from '../../components/ui/Overlay';
import { SegmentedControl } from '../../components/ui/Form';
import { useStore } from '../../store/store';
import { FARES_FOR_CABIN } from '../../data/fares';

export default function CabinPage() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { prefs } = useStore();
  const c = cabinBySlug(slug ?? '');
  const [view, setView] = useState<'specs' | 'compare'>('specs');

  if (!c)
    return (
      <div className="shell py-24">
        <EmptyState title="That cabin does not exist on our aircraft" body="We fly Economy, Premium Economy and Nova Business. No ‘premium lite’ and no basic-economy-with-a-surcharge." icon={<Plane size={20} />} action={<Button size="sm" onClick={() => nav('/experience')}>Back to experience</Button>} />
      </div>
    );

  const fares = FARES_FOR_CABIN(c.id);
  const other = CABINS.filter((x) => x.slug !== c.slug);
  const dep = toISODate(new Date(Date.now() + 21 * DAY));

  const meterFor = (label: string, value: number) => <Meter key={label} value={value} label={label} tone={value > 85 ? 'teal' : value > 60 ? 'navy' : 'sky'} />;

  return (
    <div>
      {/* hero */}
      <section className="relative isolate overflow-hidden bg-navy-950 pb-16 pt-[calc(var(--nav)+3.5rem)] text-white">
        <Photo src={c.img} alt="" seed={c.slug} className="absolute inset-0 -z-10" imgClassName="h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950 via-navy-950/80 to-navy-950/25" />
        <div className="shell grid gap-10 lg:grid-cols-[1.1fr_minmax(0,380px)] lg:items-end">
          <div>
            <p className="eyebrow text-teal-300">
              {c.id === 'ECONOMY' ? 'Every aircraft' : c.id === 'PREMIUM' ? 'A321neo · A330neo · 787' : 'Widebody and high-value routes'}
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-[0.98] tracking-[-0.03em]">{c.name}</h1>
            <p className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-white/78">{c.tagline}</p>
            <p className="mt-5 max-w-2xl text-[.9375rem] leading-[1.75] text-white/65">{c.intro}</p>
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <Button variant="onDark" onClick={() => nav(`/search?from=ACC&to=LOS&dep=${dep}&cabin=${c.id}`)}>
                Search {c.name} fares
              </Button>
              <Button variant="ghost" className="border border-white/25 text-white hover:bg-white/10" to={`/fleet`}>
                See the aircraft
              </Button>
              <span className="num ml-2 flex items-baseline gap-2 text-white/70">
                <span className="text-[.6875rem] uppercase tracking-[0.14em] text-white/45">from</span>
                <span className="font-display text-[1.375rem] font-semibold text-white">{money(fares[0]?.priceIndex ? Math.round(179 * fares[0].priceIndex) : 179, prefs.currency)}</span>
              </span>
            </div>
          </div>

          <div className="rounded-card border border-white/12 bg-navy-900/70 p-5 backdrop-blur-md">
            <p className="text-[.6875rem] font-semibold uppercase tracking-[0.16em] text-teal-300">At a glance</p>
            <dl className="mt-3 space-y-2.5">
              {c.specs.slice(0, 4).map((s) => (
                <div key={s.label} className="flex items-baseline justify-between gap-4 border-b border-white/8 pb-2 last:border-0">
                  <dt className="text-[.8125rem] text-white/50">{s.label}</dt>
                  <dd className="num font-display text-[.9375rem] font-semibold text-white">{s.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[['Pitch', c.id === 'ECONOMY' ? 62 : c.id === 'PREMIUM' ? 78 : 100], ['Recline', c.id === 'ECONOMY' ? 45 : c.id === 'PREMIUM' ? 70 : 100], ['Privacy', c.id === 'ECONOMY' ? 30 : c.id === 'PREMIUM' ? 62 : 92]].map(([l, v]) => (
                <div key={l as string}>
                  <p className="mb-1 text-[.625rem] uppercase tracking-wide text-white/45">{l}</p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/12">
                    <div className="h-full rounded-full bg-teal-400" style={{ width: `${v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-[var(--nav)] z-30 border-b border-line bg-white/95 backdrop-blur-xl">
        <div className="shell flex items-center justify-between gap-4 py-2.5">
          <SegmentedControl size="sm" value={view} onChange={setView} options={[{ id: 'specs', label: 'Seat & specs' }, { id: 'compare', label: 'Compare cabins' }]} />
          <div className="hidden items-center gap-4 text-[.8125rem] text-ink-500 sm:flex">
            <span className="flex items-center gap-1.5">
              <Ruler size={14} className="text-ink-400" /> {c.specs[0].value} pitch
            </span>
            <span className="flex items-center gap-1.5">
              <Luggage size={14} className="text-ink-400" /> {c.specs.find((s) => s.label === 'Baggage')?.value ?? 'Included'}
            </span>
          </div>
        </div>
      </div>

      <section className="bg-mist-50/60 py-14">
        <div className="shell space-y-10">
          {view === 'specs' ? (
            <>
              <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <div className="card overflow-hidden">
                  <div className="border-b border-line px-5 py-4">
                    <p className="text-h3 text-[1.0625rem]">The seat, measured</p>
                  </div>
                  <ul className="divide-y divide-line">
                    {c.specs.map((s) => (
                      <li key={s.label} className="flex flex-wrap items-start gap-x-6 gap-y-1 px-5 py-3.5">
                        <span className="w-[130px] shrink-0 text-[.75rem] font-semibold uppercase tracking-[0.08em] text-ink-400">{s.label}</span>
                        <span className="num font-display text-[1rem] font-semibold text-navy-900">{s.value}</span>
                        <span className="min-w-[200px] flex-1 text-[.8125rem] leading-relaxed text-ink-500">{s.note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <div className="card p-5">
                    <p className="text-h3 text-[1rem]">Included</p>
                    <ul className="mt-3 space-y-2">
                      {c.includes.map((x) => (
                        <li key={x} className="flex gap-2.5 text-[.875rem] leading-snug text-ink-600">
                          <Check size={15} className="mt-0.5 shrink-0 text-teal-600" /> {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="card p-5">
                    <p className="text-h3 text-[1rem]">Not included</p>
                    <ul className="mt-3 space-y-2">
                      {c.excludes.map((x) => (
                        <li key={x} className="flex gap-2.5 text-[.875rem] leading-snug text-ink-500">
                          <Minus size={15} className="mt-0.5 shrink-0 text-ink-300" /> {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <SectionHeading eyebrow="By aircraft" title="The same cabin name is not the same seat on every aircraft." lead="We publish the difference instead of hiding behind the marketing name." className="mb-6" />
                <div className="overflow-x-auto rounded-card border border-line bg-white">
                  <table className="table-base min-w-[640px]">
                    <thead>
                      <tr>
                        <th>Aircraft</th>
                        <th>Layout</th>
                        <th>Pitch</th>
                        <th>Width</th>
                        <th className="text-right">Suites</th>
                        <th className="hide-below-md">Notes</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {c.perAircraft.map((a) => (
                        <tr key={a.aircraft}>
                          <td className="font-semibold text-navy-900">{a.aircraft}</td>
                          <td>{a.layout}</td>
                          <td className="num">{a.pitch}</td>
                          <td className="num">{a.width}</td>
                          <td className="num text-right">{a.seats || '—'}</td>
                          <td className="hidden md:table-cell text-ink-500">{a.note}</td>
                          <td className="text-right">
                            {a.seats > 0 ? (
                              <Link to={`/fleet/${a.aircraft.split(' ')[1]?.toLowerCase().startsWith('a320') ? 'A320N' : a.aircraft.includes('321') ? 'A321N' : a.aircraft.includes('330') ? 'A339' : 'B789'}`} className="text-[.8125rem] font-semibold text-sky-700 hover:underline">
                                Aircraft page
                              </Link>
                            ) : (
                              <Badge tone="neutral">Not fitted</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {[c, ...other].map((x) => (
                <div key={x.slug} className={cx('card overflow-hidden', x.slug === c.slug && 'ring-2 ring-navy-800')}>
                  <Photo src={x.img} alt={x.name} seed={x.slug} className="h-32" />
                  <div className="p-5">
                    <p className="font-display text-[1.125rem] font-semibold text-navy-900">{x.name}</p>
                    <p className="mt-1 text-[.8125rem] leading-snug text-ink-500">{x.tagline}</p>
                    <div className="mt-4 space-y-2.5">
                      {meterFor('Seat comfort', x.id === 'ECONOMY' ? 58 : x.id === 'PREMIUM' ? 78 : 96)}
                      {meterFor('Privacy', x.id === 'ECONOMY' ? 28 : x.id === 'PREMIUM' ? 62 : 92)}
                      {meterFor('Value for money', x.id === 'ECONOMY' ? 92 : x.id === 'PREMIUM' ? 74 : 56)}
                    </div>
                    <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[.8125rem]">
                      {x.specs.slice(0, 3).map((s) => (
                        <div key={s.label} className="flex justify-between gap-3">
                          <dt className="text-ink-400">{s.label}</dt>
                          <dd className="num font-medium text-navy-900">{s.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-4 flex gap-2">
                      {x.slug === c.slug ? <Badge tone="navy">Viewing</Badge> : <Button size="sm" variant="secondary" to={`/cabins/${x.slug}`}>Switch</Button>}
                      <Button size="sm" variant="ghost" to={`/experience/${x.id === 'BUSINESS' ? 'lounges' : 'comfort'}`}>
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="card p-5 sm:col-span-3 lg:col-span-3">
                <p className="text-h3 text-[1.0625rem]">Fare families for {c.name}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {fares.map((f) => (
                    <div key={f.id} className="rounded-[14px] border border-line p-4">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-display text-[.9375rem] font-semibold text-navy-900">{f.name}</p>
                        <span className="num text-[.8125rem] text-ink-400">×{f.priceIndex}</span>
                      </div>
                      <p className="mt-1.5 text-[.8125rem] leading-snug text-ink-500">{f.summary}</p>
                      <p className="num mt-3 border-t border-line pt-2.5 text-[.8125rem] text-ink-600">
                        <span className="font-semibold text-navy-900">{money(Math.round(179 * f.priceIndex), prefs.currency)}</span> typical one way, Accra–Lagos
                      </p>
                    </div>
                  ))}
                </div>
                <Divider className="my-5" />
                <div className="flex flex-wrap items-center gap-3">
                  <Button onClick={() => nav(`/search?from=ACC&to=LOS&dep=${dep}&cabin=${c.id}`)} iconRight={<ArrowRight size={16} />}>
                    Search {c.name}
                  </Button>
                  <span className="flex items-center gap-1.5 text-[.8125rem] text-ink-500">
                    <Star size={14} className="fill-gold-500 text-gold-500" /> 4.6 average across {c.id === 'ECONOMY' ? '18,402' : c.id === 'PREMIUM' ? '3,110' : '5,884'} reviews
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <SectionHeading eyebrow="Questions" title={`About ${c.name.toLowerCase()}.`} className="mb-0 lg:sticky lg:top-[calc(var(--nav)+16px)] lg:self-start" />
            <Accordion single items={c.faq.map((f, i) => ({ id: `${c.slug}${i}`, q: f.q, a: <p>{f.a}</p> }))} />
          </div>

          <div className="relative overflow-hidden rounded-card bg-navy-900 p-6 text-white sm:p-8">
            <Sparkles className="pointer-events-none absolute -right-4 -top-2 h-28 w-28 text-teal-400/15" />
            <div className="relative flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow text-teal-300">Upgrades</p>
                <h3 className="mt-2 max-w-xl font-display text-[1.5rem] font-semibold leading-snug">Already booked? Suites open for upgrade from 72 hours before departure.</h3>
                <p className="mt-2 max-w-xl text-[.9375rem] text-white/70">Prices are fixed by route, not by how badly you want it. Elite certificates clear first, and we tell you which one you are in.</p>
              </div>
              <Button variant="onDark" to="/manage-booking">
                Check my upgrade price
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
