import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Armchair, BatteryCharging, Check, Clock, Info, Luggage, Plane, Star, Utensils, Wifi } from 'lucide-react';
import { cx, durationLabel, fmtDate, money, toISODate, DAY } from '../../lib/utils';
import { searchFlights } from '../../data/flights';
import { FARES, fareById } from '../../data/fares';
import { BY_CODE } from '../../data/airports';
import { FLEET } from '../../data/fleet';
import { buildSeatMap } from '../../data/seats';
import type { Itinerary } from '../../types';
import { Badge, Button, SectionHeading, Tooltip } from '../../components/ui/Primitives';
import { Photo } from '../../components/brand/Brand';
import { Breadcrumbs } from '../../components/ui/Overlay';
import { useStore } from '../../store/store';
import type { CabinId } from '../../types';

export default function FlightDetails() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { prefs, toast, setQuery } = useStore();
  const cabin = (params.get('cabin') as CabinId) || 'ECONOMY';
  const dep = params.get('dep') || toISODate(new Date(Date.now() + 14 * DAY));
  const from = params.get('from') || 'ACC';
  const to = params.get('to') || 'LOS';
  const [hoverSeat, setHoverSeat] = useState<string | null>(null);

  const query = useMemo(
    () => ({ tripType: 'oneway' as const, legs: [{ from, to, date: dep }], returnDate: '', adults: 1, children: 0, infants: 0, cabin, promo: '' }),
    [from, to, dep, cabin],
  );
  const results = useMemo(() => searchFlights(query), [query]);
  const it: Itinerary | undefined = results.outbound.find((x) => x.id === params.get('id')) ?? results.outbound[0];

  if (!it)
    return (
      <div className="shell pt-[calc(var(--nav)+4rem)]">
        <p>No such flight. <button className="underline" onClick={() => nav('/book')}>Search again</button></p>
      </div>
    );

  const first = it.segments[0];
  const last = it.segments[it.segments.length - 1];
  const aircraft = FLEET.find((f) => first.aircraft.includes(f.name.split(' ')[1] ?? '') || first.aircraft.includes(f.id)) ?? FLEET[2];
  const seats = buildSeatMap(first.aircraft, first.flightNo, cabin, []);
  const freeSeats = seats.reduce((n, r) => n + r.seats.filter((s) => s.state === 'available').length, 0);
  const exitSeats = seats.reduce((n, r) => n + r.seats.filter((s) => s.state === 'exit').length, 0);
  const origin = BY_CODE.get(first.from);
  const destAir = BY_CODE.get(last.to);

  const timeline = it.segments.flatMap((s, i) => [
    { kind: 'depart', label: `${s.from} · ${s.terminal ?? 'T1'}`, time: new Date(s.dep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), sub: `Check-in closes 60 min before · gate ${s.gate}`, icon: '▲' },
    { kind: 'air', label: `Airborne · ${s.aircraft}`, time: durationLabel(s.durationMin), sub: `${s.seatMiles.toLocaleString()} km · cruise 862 km/h · Wi-Fi ${it.wifi ? 'available' : 'not fitted'}`, icon: '·' },
    ...(i < it.segments.length - 1 && it.layoverMin
      ? [{ kind: 'connect', label: `Connection · ${s.to}`, time: durationLabel(it.layoverMin), sub: `Minimum connect ${BY_CODE.get(s.to)?.transitMin ?? 60} min · baggage auto-transferred`, icon: '⇄' }]
      : []),
    { kind: 'arrive', label: `${s.to} · ${destAir?.terminals[0] ?? 'T1'}`, time: new Date(s.arr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), sub: `Belt ${1 + i} · 12 minutes from gate to belt on average`, icon: '▼' },
  ]);

  const fares = FARES.filter((f) => Object.keys(it.cabins[cabin] ?? {}).includes(f.id));

  return (
    <div className="bg-mist-50/60 pb-16">
      <div className="border-b border-line bg-white pt-[var(--nav)]">
        <div className="shell py-5">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Search', to: '/search' }, { label: `${first.from}–${last.to} ${first.flightNo}` }]} className="mb-4" />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-[clamp(1.5rem,3.4vw,2.25rem)] font-semibold tracking-[-0.02em] text-navy-900">
                  {first.from} → {last.to}
                </h1>
                <Badge tone="navy">{first.carrier} {first.flightNo}</Badge>
                {it.stops === 0 ? <Badge tone="teal">Non-stop</Badge> : <Badge tone="gold">1 stop via {it.via}</Badge>}
              </div>
              <p className="mt-2 text-[.9375rem] text-ink-500">
                {fmtDate(first.depDateLabel, 'long')} · departs {new Date(first.dep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {durationLabel(it.totalMin)} total · {first.aircraft}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => nav('/search?' + params.toString())}>
                Back to results
              </Button>
              <Button size="sm" onClick={() => { setQuery(query); toast({ tone: 'success', title: 'Flight selected', body: `${first.flightNo} · ${fareById('CLASSIC').name}` }); nav(`/booking?from=${from}&to=${to}&dep=${dep}&out=${it.id}&fare=CLASSIC&cabin=${cabin}&pax=1,0,0`); }}>
                Select this flight
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="shell grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {/* timeline */}
          <section className="card p-5">
            <h2 className="text-h3">Flight timeline</h2>
            <ol className="mt-5">
              {timeline.map((t, i) => (
                <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < timeline.length - 1 && <span className="absolute left-[13px] top-6 h-full w-px bg-line" aria-hidden />}
                  <span className={cx('mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[.625rem] font-bold', t.kind === 'connect' ? 'border-gold-400 bg-gold-100 text-gold-600' : t.kind === 'air' ? 'border-line bg-white text-ink-400' : 'border-navy-800 bg-navy-800 text-white')}>
                    {t.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-display text-[.9375rem] font-semibold text-navy-900">{t.label}</p>
                      <p className="num text-[.9375rem] font-semibold text-navy-900">{t.time}</p>
                    </div>
                    <p className="mt-0.5 text-[.8125rem] text-ink-500">{t.sub}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-4">
              {[
                ['Departure', `${new Date(first.dep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · ${first.from}`],
                ['Arrival', `${new Date(last.arr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · ${last.to}`],
                ['Duration', durationLabel(it.totalMin)],
                ['Stops', it.stops === 0 ? 'None' : `1 · ${it.via}`],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[.6875rem] uppercase tracking-[0.1em] text-ink-400">{k}</p>
                  <p className="num text-[.9375rem] font-semibold text-navy-900">{v}</p>
                </div>
              ))}
            </div>
          </section>

          {/* aircraft */}
          <section className="grid gap-0 overflow-hidden rounded-card border border-line bg-white sm:grid-cols-[1fr_1.1fr]">
            <Photo src={aircraft.img} alt={aircraft.name} seed={aircraft.id} className="min-h-[190px]" />
            <div className="p-5">
              <p className="eyebrow">Aircraft</p>
              <h2 className="text-h3 mt-2 text-[1.25rem]">
                {first.aircraft} · {origin?.hub ? 'hub rotation' : 'scheduled inbound'}
              </h2>
              <p className="mt-2 text-[.875rem] leading-relaxed text-ink-600">{aircraft.notes}</p>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[.8125rem]">
                {[
                  ['Capacity', `${aircraft.capacity} seats`],
                  ['Range', `${aircraft.rangeKm.toLocaleString()} km`],
                  ['Configuration', aircraft.config],
                  ['Engines', aircraft.engines],
                  ['On-time', `${aircraft.onTime}%`],
                  ['Wi-Fi', aircraft.wifi.split('—')[0]],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[.6875rem] uppercase tracking-[0.1em] text-ink-400">{k}</dt>
                    <dd className="font-medium text-navy-900">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { icon: <Wifi size={13} />, t: it.wifi ? 'Wi-Fi available' : 'No Wi-Fi' },
                  { icon: <BatteryCharging size={13} />, t: it.power ? 'Power at every seat' : 'USB only' },
                  { icon: <Star size={13} />, t: `${it.rating} / 5 · ${it.ratingCount.toLocaleString()}` },
                ].map((b) => (
                  <span key={b.t} className="flex items-center gap-1.5 rounded-pill bg-mist-100 px-2.5 py-1 text-[.75rem] font-medium text-ink-600">
                    {b.icon} {b.t}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* seat availability */}
          <section className="card p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Seat availability</p>
                <h2 className="text-h3 mt-2 text-[1.25rem]">{CABIN_LABEL(cabin)} · {freeSeats} seats free at no charge</h2>
              </div>
              <p className="text-[.8125rem] text-ink-500">
                {exitSeats} exit-row seats · {seats.reduce((n, r) => n + r.seats.filter((s) => s.state === 'occupied').length, 0)} taken
              </p>
            </div>
            <div className="mt-4 space-y-1 overflow-x-auto rounded-[14px] border border-line bg-mist-50/70 p-4">
              {seats.slice(0, 16).map((row) => (
                <div key={row.num} className="flex items-center gap-1">
                  <span className="num w-5 text-[.6875rem] font-semibold text-ink-400">{row.num}</span>
                  {row.seats.map((s) => (
                    <Tooltip key={s.id} label={s.state === 'occupied' ? `${s.id} · occupied` : s.priceUSD ? `${s.id} · ${money(s.priceUSD)}` : `${s.id} · free to select`} className="contents">
                      <button
                        onMouseEnter={() => setHoverSeat(s.id)}
                        onMouseLeave={() => setHoverSeat(null)}
                        className={cx('h-6 w-6 rounded-[6px] border text-[.5625rem] font-bold transition', s.state === 'occupied' && 'border-ink-200 bg-ink-200/70 text-transparent', s.state === 'available' && 'border-ink-200 bg-white text-ink-500 hover:border-navy-500', s.state === 'exit' && 'border-teal-500 bg-teal-50 text-teal-800', s.state === 'premium' && 'border-gold-400 bg-gold-100 text-gold-600', s.state === 'extra' && 'border-sky-400 bg-sky-50 text-sky-900', s.col === '—' && 'invisible', hoverSeat === s.id && 'scale-110')}
                        aria-label={`Seat ${s.id}`}
                      >
                        {s.col === '—' ? '' : s.col}
                      </button>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-2 text-[.8125rem] text-ink-500">
              <Info size={14} className="text-ink-400" /> First 16 rows shown. Full map opens in the next step, where you can pick seats for every traveller.
            </p>
          </section>

          {/* included services */}
          <section className="card p-5">
            <h2 className="text-h3">What is on board</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: <Utensils size={16} />, t: 'Dining', d: fareById('CLASSIC').meals },
                { icon: <Luggage size={16} />, t: 'Baggage', d: `${fareById('CLASSIC').checkedBags ? `${fareById('CLASSIC').checkedBags} × ${fareById('CLASSIC').bagKg} kg` : 'None on Light'} · ${fareById('CLASSIC').cabinBag}` },
                { icon: <Armchair size={16} />, t: 'Seat', d: `${aircraft.cabins[cabin]?.pitch ?? '31"'} pitch · ${aircraft.cabins[cabin]?.width ?? '18"'} wide · ${aircraft.cabins[cabin]?.layout ?? '3-3'}` },
                { icon: <Wifi size={16} />, t: 'Nova Play & Wi-Fi', d: aircraft.ife },
                { icon: <Clock size={16} />, t: 'Cabin crew', d: `${cabin === 'BUSINESS' ? '1:3 ratio, dine-anytime service' : 'Meal service then quiet hour on long-haul'}` },
                { icon: <Plane size={16} />, t: 'Regularity', d: `This rotation has been on time ${aircraft.onTime}% of the last 12 months` },
              ].map((f) => (
                <li key={f.t} className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-navy-50 text-navy-700">{f.icon}</span>
                  <span>
                    <span className="block font-display text-[.875rem] font-semibold text-navy-900">{f.t}</span>
                    <span className="mt-0.5 block text-[.8125rem] leading-snug text-ink-500">{f.d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* fare selection */}
        <aside>
          <div className="sticky top-[calc(var(--nav)+16px)] space-y-3">
            <div className="card overflow-hidden">
              <div className="border-b border-line bg-navy-900 px-4 py-3 text-white">
                <p className="text-[.6875rem] uppercase tracking-[0.16em] text-teal-300">Choose a fare</p>
                <p className="mt-1 font-display text-[1.0625rem] font-semibold">{CABIN_LABEL(cabin)} · per adult incl. taxes</p>
              </div>
              <ul className="divide-y divide-line">
                {fares.map((f) => {
                  const price = it.cabins[cabin]?.[f.id] ?? 0;
                  return (
                    <li key={f.id} className="p-4 transition hover:bg-mist-50">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="font-display text-[.9375rem] font-semibold text-navy-900">{f.name}</p>
                        <p className="num font-display text-[1.125rem] font-semibold text-navy-900">{money(price, prefs.currency)}</p>
                      </div>
                      <p className="mt-1 text-[.8125rem] leading-snug text-ink-500">{f.summary}</p>
                      <ul className="mt-2.5 space-y-1">
                        {[`${f.checkedBags ? `${f.checkedBags} × ${f.bagKg} kg bag` : 'No checked bag'}`, f.changeable ? (f.changeFee ? `Changes $${f.changeFee}` : 'Free changes') : 'No changes', f.refundable ? 'Refundable to wallet' : 'Non-refundable'].map((x) => (
                          <li key={x} className="flex items-center gap-1.5 text-[.75rem] text-ink-600">
                            <Check size={12} className="text-teal-600" /> {x}
                          </li>
                        ))}
                      </ul>
                      <Button
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => {
                          setQuery(query);
                          nav(`/booking?from=${from}&to=${to}&dep=${dep}&out=${it.id}&fare=${f.id}&cabin=${cabin}&pax=1,0,0`);
                        }}
                      >
                        Select {f.name}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="rounded-card border border-line bg-white p-4 text-[.8125rem] leading-relaxed text-ink-500">
              <SectionHeading title="" className="hidden" />
              <p className="font-display text-[.875rem] font-semibold text-navy-900">Fare conditions in one line</p>
              <p className="mt-1.5">Refunds and changes follow the fare you pick, not the flight. Cancel within 24 hours of booking for a full refund on any fare when travel starts more than 7 days out.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CABIN_LABEL(c: CabinId) {
  return c === 'ECONOMY' ? 'Economy' : c === 'PREMIUM' ? 'Premium Economy' : 'Nova Business';
}
