import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Check, Gift, Info, Tag } from 'lucide-react';
import { cx, fmtDate, money, parseISODate, toISODate, DAY } from '../../lib/utils';
import { OFFER_FILTERS, OFFERS, type Offer } from '../../data/offers';
import { Badge, Button, EmptyState, Eyebrow, SectionHeading } from '../../components/ui/Primitives';
import { Modal } from '../../components/ui/Overlay';
import { Checkbox, Field, Input, SegmentedControl, Select } from '../../components/ui/Form';
import { OfferCard } from '../../components/airline/Cards';
import { Photo } from '../../components/brand/Brand';
import { useStore } from '../../store/store';
import { PageHero } from '../../components/layout/PublicLayout';

export default function Offers() {
  const { prefs, toast } = useStore();
  const nav = useNavigate();
  const [kind, setKind] = useState<string>('all');
  const [sort, setSort] = useState<'best' | 'price' | 'deadline'>('best');
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [detail, setDetail] = useState<Offer | null>(null);
  const [code, setCode] = useState('');
  const [codeState, setCodeState] = useState<'idle' | 'ok' | 'bad'>('idle');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [alertRoute, setAlertRoute] = useState('ACC – LOS');

  const list = useMemo(() => {
    let out = OFFERS.filter((o) => kind === 'all' || o.kind === kind);
    if (sort === 'price') out = [...out].sort((a, b) => a.priceUSD - b.priceUSD);
    if (sort === 'deadline') out = [...out].sort((a, b) => parseISODate(a.bookBy.split(',')[0]).getTime() - parseISODate(b.bookBy.split(',')[0]).getTime());
    return out;
  }, [kind, sort]);

  const applyCode = () => {
    const valid = ['NOVADAY', 'STUDENT', 'AERONOVA5', 'BAGFREE'].includes(code.trim().toUpperCase());
    setCodeState(valid ? 'ok' : 'bad');
    toast(valid ? { tone: 'success', title: `${code.toUpperCase()} is valid`, body: 'Applied automatically when you reach payment.' } : { tone: 'error', title: 'Code not recognised', body: 'Check the code — they are case-insensitive but not forgiving.' });
  };

  return (
    <div>
      <PageHero
        tone="navy"
        image="/img/dining.jpg"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Offers' }]}
        eyebrow="Fares & offers"
        title="Discounts that survive the small print."
        lead="Every offer here is loaded into the booking engine with real dates and real rules. If a fare excludes a date, we say so on the card — not on page nine."
        height="sm"
      >
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-2 rounded-pill border border-white/15 bg-white/5 px-3 py-1.5 text-[.8125rem] text-white/75">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" /> 8 live offers · next deadline {fmtDate(OFFERS[1].bookBy.split(',')[0], 'short')}
          </span>
          <Button variant="onDark" size="sm" onClick={() => setAlertOpen(true)} icon={<Bell size={14} />}>
            Alert me on a route
          </Button>
        </div>
      </PageHero>

      {/* code + filters */}
      <div className="border-b border-line bg-white">
        <div className="shell flex flex-wrap items-center gap-3 py-3">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {OFFER_FILTERS.map((f) => {
              const count = f.id === 'all' ? OFFERS.length : OFFERS.filter((o) => o.kind === f.id).length;
              return (
                <button key={f.id} onClick={() => setKind(f.id)} className={cx('flex shrink-0 items-center gap-1.5 rounded-pill border px-3 py-1.5 text-[.8125rem] font-semibold transition', kind === f.id ? 'border-navy-800 bg-navy-800 text-white' : 'border-line text-ink-600 hover:border-navy-300')}>
                  {f.label}
                  <span className="num text-[.6875rem] opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <SegmentedControl size="sm" value={view} onChange={setView} options={[{ id: 'cards', label: 'Cards' }, { id: 'table', label: 'Table' }]} />
            <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-9 w-[150px] text-[.8125rem]" aria-label="Sort offers">
              <option value="best">Most relevant</option>
              <option value="price">Cheapest</option>
              <option value="deadline">Ending soonest</option>
            </Select>
          </div>
        </div>
      </div>

      <section className="bg-mist-50/60 py-10">
        <div className="shell">
          {/* big feature */}
          {kind === 'all' && (
            <div className="relative mb-8 grid gap-0 overflow-hidden rounded-card border border-line bg-white lg:grid-cols-[1.15fr_1fr]">
              <div className="relative min-h-[280px]">
                <Photo src={OFFERS[1].img} alt={OFFERS[1].destination} seed="feature" className="absolute inset-0" imgClassName="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/25 to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <Badge tone="teal">Editor’s pick</Badge>
                  <p className="mt-2 font-display text-[1.5rem] font-semibold leading-tight text-white">Long-haul in the wet season is the quiet luxury.</p>
                </div>
              </div>
              <div className="p-6">
                <Eyebrow>{OFFERS[1].kicker}</Eyebrow>
                <p className="mt-3 text-[.9375rem] leading-relaxed text-ink-600">{OFFERS[1].conditions.slice(0, 3).join(' ')}</p>
                <div className="mt-5 flex items-end gap-6">
                  <p>
                    <span className="block text-[.6875rem] uppercase tracking-[0.14em] text-ink-400">One way from</span>
                    <span className="num font-display text-[2rem] font-semibold text-navy-900">{money(OFFERS[1].priceUSD, prefs.currency)}</span>
                  </p>
                  <p>
                    <span className="block text-[.6875rem] uppercase tracking-[0.14em] text-ink-400">Book by</span>
                    <span className="num font-display text-[1rem] font-semibold text-ember-600">{fmtDate(OFFERS[1].bookBy.split(',')[0], 'long')}</span>
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Button onClick={() => nav(`/search?from=ACC&to=LHR&dep=${toISODate(new Date(Date.now() + 30 * DAY))}`)}>Search London fares</Button>
                  <Button variant="secondary" onClick={() => setDetail(OFFERS[1])}>
                    Full conditions
                  </Button>
                </div>
              </div>
            </div>
          )}

          {list.length === 0 ? (
            <EmptyState title="No offers in that category right now" body="We keep the list short and honest — when a sale ends, it goes. Try all offers, or set a fare alert." icon={<Gift size={20} />} action={<Button size="sm" onClick={() => setKind('all')}>Show all offers</Button>} />
          ) : view === 'cards' ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {list.map((o, i) => (
                <div key={o.id} className={cx(i % 3 === 1 && 'xl:translate-y-6')}>
                  <OfferCard o={o} />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-card border border-line bg-white">
              <div className="overflow-x-auto">
                <table className="table-base min-w-[720px]">
                  <thead>
                    <tr>
                      <th>Offer</th>
                      <th className="hide-below-sm">Route</th>
                      <th className="hide-below-md">Travel window</th>
                      <th className="hide-below-sm">Cabin</th>
                      <th className="text-right">From</th>
                      <th className="text-right">Book by</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((o) => (
                      <tr key={o.id}>
                        <td className="font-semibold text-navy-900">
                          {o.title}
                          {o.badge && <Badge tone="teal" className="ml-2">
                            {o.badge}
                          </Badge>}
                        </td>
                        <td className="num">
                          {o.from} → {o.code}
                        </td>
                        <td className="hidden md:table-cell text-ink-500">{o.travelWindow}</td>
                        <td className="hidden sm:table-cell text-ink-500">{o.cabin}</td>
                        <td className="text-right">
                          <span className="font-display font-semibold text-navy-900">{money(o.priceUSD, prefs.currency)}</span>
                          {o.wasUSD && <span className="num ml-2 text-[.75rem] text-ink-400 line-through">{money(o.wasUSD, prefs.currency)}</span>}
                        </td>
                        <td className="num text-right text-ember-600">{fmtDate(o.bookBy.split(',')[0], 'short')}</td>
                        <td className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button size="sm" variant="ghost" onClick={() => setDetail(o)}>
                              Details
                            </Button>
                            <Button size="sm" onClick={() => nav(`/search?from=${o.from}&to=${o.code}`)}>
                              Book
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* promo code + corporate */}
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
            <div className="card p-5 sm:p-6">
              <SectionHeading eyebrow="Promo codes" title="Have a code?" lead="Codes apply to the base fare, never to taxes. One per booking, stackable with a tier bonus." className="mb-0 [&_h2]:text-[1.375rem]" />
              <div className="mt-5 flex flex-wrap gap-2">
                <Field label="Code" className="min-w-[180px] flex-1" error={codeState === 'bad' ? 'We do not recognise that code' : undefined}>
                  <Input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeState('idle'); }} placeholder="NOVADAY" className="num font-display uppercase tracking-[0.14em]" invalid={codeState === 'bad'} />
                </Field>
                <Button className="mt-6" onClick={applyCode} icon={<Tag size={15} />}>
                  Apply
                </Button>
              </div>
              {codeState === 'ok' && (
                <p className="mt-3 flex items-center gap-2 rounded-[10px] bg-teal-50 px-3 py-2 text-[.8125rem] font-medium text-teal-800">
                  <Check size={14} /> Applied — the discount appears on the review step.
                </p>
              )}
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {[
                  { c: 'NOVADAY', d: '10% off base fare, all routes, ends 30 Sep' },
                  { c: 'STUDENT', d: '12% off + extra 23 kg, ISIC verified' },
                  { c: 'AERONOVA5', d: 'USD 5 off any African one way' },
                  { c: 'BAGFREE', d: 'One checked bag on Economy Light' },
                ].map((p) => (
                  <button key={p.c} onClick={() => setCode(p.c)} className="flex items-center justify-between gap-3 rounded-[12px] border border-line px-3 py-2.5 text-left transition hover:border-sky-400 hover:bg-sky-50/50">
                    <span>
                      <span className="num block font-display text-[.875rem] font-bold tracking-[0.08em] text-navy-900">{p.c}</span>
                      <span className="block text-[.75rem] text-ink-500">{p.d}</span>
                    </span>
                    <ArrowRight size={14} className="shrink-0 text-ink-300" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="relative overflow-hidden rounded-card bg-navy-900 p-6 text-white">
                <div className="pointer-events-none absolute inset-0 opacity-[0.08] texture-dots" />
                <div className="relative">
                  <p className="eyebrow text-teal-300">Nova for Business</p>
                  <h3 className="mt-2 font-display text-[1.375rem] font-semibold">Corporate fares, 30-day invoicing, zero stress.</h3>
                  <p className="mt-2.5 text-[.9375rem] leading-relaxed text-white/70">
                    Negotiated rates on your top three corridors, cost-centre reporting, and a named agent who answers on WhatsApp. 1,840 companies are on the programme.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button variant="onDark" size="sm" to="/contact">
                      Talk to the desk
                    </Button>
                    <Button size="sm" variant="ghost" className="border border-white/20 text-white hover:bg-white/10">
                      Download the rate card
                    </Button>
                  </div>
                </div>
              </div>
              <div className="card flex items-start gap-4 p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-mist-100 text-navy-700">
                  <Info size={18} />
                </span>
                <div>
                  <p className="font-display text-[.9375rem] font-semibold text-navy-900">How we price offers</p>
                  <p className="mt-1.5 text-[.875rem] leading-relaxed text-ink-600">
                    An offer is a real inventory bucket — typically 9 to 21 seats per flight — not a marketing price that vanishes at the payment page. When it sells out we pull the card. The
                    <span className="font-medium text-navy-900"> fare you saw is the fare you pay</span>, including if the published price rises while you book.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.title ?? ''}
        subtitle={detail ? `${detail.from} → ${detail.code} · ${detail.cabin}` : ''}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDetail(null)}>
              Close
            </Button>
            <Button onClick={() => { nav(`/search?from=${detail?.from}&to=${detail?.code}`); setDetail(null); }}>Search this route</Button>
          </>
        }
      >
        {detail && (
          <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
            <div>
              <p className="text-[.9375rem] leading-relaxed text-ink-600">{detail.kicker}</p>
              <p className="mt-4 text-2xs font-semibold uppercase tracking-[0.16em] text-ink-400">Conditions</p>
              <ul className="mt-2 space-y-2">
                {detail.conditions.map((c) => (
                  <li key={c} className="flex gap-2.5 text-[.875rem] leading-relaxed text-ink-600">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-teal-500" /> {c}
                  </li>
                ))}
              </ul>
              <dl className="mt-4 grid grid-cols-2 gap-3 rounded-[12px] bg-mist-50 p-3.5 text-[.8125rem]">
                {[
                  ['Travel window', detail.travelWindow],
                  ['Book by', detail.bookBy],
                  ['Price from', money(detail.priceUSD, prefs.currency)],
                  ['Cabin', detail.cabin],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[.6875rem] uppercase tracking-wide text-ink-400">{k}</dt>
                    <dd className="font-medium text-navy-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <Photo src={detail.img} alt={detail.destination} seed={detail.id} className="h-full min-h-[150px] rounded-[12px]" />
          </div>
        )}
      </Modal>

      <Modal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        title="Fare alert"
        subtitle="One email when the price moves. No digest, no marketing."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAlertOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(alertEmail)) {
                  toast({ tone: 'error', title: 'Check the email address' });
                  return;
                }
                setAlertOpen(false);
                toast({ tone: 'success', title: 'Alert created', body: `${alertRoute} · we will write to ${alertEmail}` });
              }}
            >
              Create alert
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Route">
            <Select value={alertRoute} onChange={(e) => setAlertRoute(e.target.value)}>
              {OFFERS.map((o) => (
                <option key={o.id} value={`${o.from} – ${o.code}`}>
                  {o.from} – {o.code}
                </option>
              ))}
              <option value="ACC – LHR">ACC – LHR</option>
              <option value="ACC – JFK">ACC – JFK</option>
            </Select>
          </Field>
          <Field label="Email" required>
            <Input type="email" value={alertEmail} onChange={(e) => setAlertEmail(e.target.value)} placeholder="you@company.com" />
          </Field>
          <div className="space-y-2">
            <Checkbox label="Any drop" desc="Email me whenever the lowest fare falls" checked={!alertRoute.includes('custom')} onChange={() => {}} />
            <Checkbox label="Only below my target" desc="Set a target: saves 10% or more" onChange={() => {}} />
            <Checkbox label="Also text me if a deadline is 48 h away" onChange={() => {}} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
