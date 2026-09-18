import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeftRight, Bell, CalendarRange, Check, Filter, Info, Plane, Search as SearchIcon, SlidersHorizontal, Ticket, X,
} from 'lucide-react';
import { cx, durationLabel, fmtDate, money, parseISODate, toISODate, DAY } from '../../lib/utils';
import { searchFlights } from '../../data/flights';
import { fareById } from '../../data/fares';
import { cityOf } from '../../data/airports';
import type { Itinerary, SearchQuery } from '../../types';
import { Badge, Button, EmptyState, FlightSkeleton } from '../../components/ui/Primitives';
import { Modal } from '../../components/ui/Overlay';
import { Field, Input, SegmentedControl } from '../../components/ui/Form';
import { FlightCard } from '../../components/booking/FlightCard';
import { FilterPanel, applyFilters, defaultFilters, type Filters } from '../../components/booking/FilterPanel';
import { useStore } from '../../store/store';
import type { CabinId } from '../../types';

const CABIN_NAME: Record<CabinId, string> = { ECONOMY: 'Economy', PREMIUM: 'Premium Economy', BUSINESS: 'Nova Business' };
const FARE_ORDER = ['LIGHT', 'CLASSIC', 'FLEX', 'PREMIUM', 'BUSINESS'];

function useQueryFromParams(params: URLSearchParams): SearchQuery {
  const dep = params.get('dep') || toISODate(new Date(Date.now() + 14 * DAY));
  const legsParam = params.get('legs');
  let legs = [{ from: params.get('from') || 'ACC', to: params.get('to') || 'LOS', date: dep }];
  if (legsParam) {
    try {
      const parsed = JSON.parse(legsParam);
      if (Array.isArray(parsed) && parsed.length) legs = parsed;
    } catch {
      /* malformed param — fall back to the single leg */
    }
  }
  const pax = (params.get('pax') || '1,0,0').split(',').map(Number);
  return {
    tripType: (params.get('trip') as SearchQuery['tripType']) || (params.get('trip') === 'oneway' ? 'oneway' : legs.length > 1 ? 'multi' : 'round'),
    legs,
    returnDate: params.get('ret') || (params.get('trip') === 'oneway' ? '' : toISODate(new Date(parseISODate(dep).getTime() + 7 * DAY))),
    adults: pax[0] || 1,
    children: pax[1] || 0,
    infants: pax[2] || 0,
    cabin: (params.get('cabin') as CabinId) || 'ECONOMY',
    promo: params.get('promo') || '',
  };
}

function priceStr(it: Itinerary | undefined, cabin: CabinId, fareId: string) {
  if (!it) return '';
  const p = it.cabins[cabin]?.[fareId] ?? it.bestPrice;
  return money(p);
}

export default function Search() {
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const store = useStore();
  const q = useMemo(() => useQueryFromParamsSafe(params, store.query), [params, store.query]);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<'outbound' | 'return' | 'done'>(q.tripType === 'round' ? 'outbound' : 'outbound');
  const [outbound, setOutbound] = useState<Itinerary | null>(null);
  const [returnSel, setReturnSel] = useState<Itinerary | null>(null);
  const [fareId, setFareId] = useState(store.query?.promo === 'NOVADAY' ? 'CLASSIC' : 'CLASSIC');
  const [sort, setSort] = useState<'recommended' | 'price' | 'duration' | 'departure'>('recommended');
  const [filters, setFilters] = useState<Filters>(() => defaultFilters(0, 4000));
  const [sheet, setSheet] = useState(false);
  const [modify, setModify] = useState(false);
  const [track, setTrack] = useState(false);
  const [draft, setDraft] = useState<SearchQuery>(q);
  const resultsRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => searchFlights(q), [q]);
  const list = stage === 'return' ? result.inbound : result.outbound;
  const bounds = useMemo(() => {
    if (!list.length) return { min: 100, max: 3000 };
    const prices = list.map((it) => it.cabins[q.cabin]?.LIGHT ?? it.bestPrice);
    return { min: Math.floor(Math.min(...prices) / 10) * 10, max: Math.ceil(Math.max(...prices) / 10) * 10 };
  }, [list, q.cabin]);

  useEffect(() => {
    setFilters(defaultFilters(bounds.min, bounds.max));
  }, [bounds.min, bounds.max]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 620 + Math.random() * 500);
    return () => clearTimeout(t);
  }, [q]);

  const filtered = useMemo(() => applyFilters(list, { ...filters, price: [filters.price[0] || bounds.min, filters.price[1] || bounds.max] }, fareId), [list, filters, fareId, bounds]);

  const sorted = useMemo(() => {
    const price = (it: Itinerary) => it.cabins[q.cabin]?.[fareId] ?? it.bestPrice;
    const arr = [...filtered];
    if (sort === 'price') arr.sort((a, b) => price(a) - price(b));
    else if (sort === 'duration') arr.sort((a, b) => a.totalMin - b.totalMin);
    else if (sort === 'departure') arr.sort((a, b) => a.depEpoch - b.depEpoch);
    else
      arr.sort((a, b) => {
        const score = (it: Itinerary) => it.rating * 22 - (it.stops * 55 + (it.totalMin / 12) * 2) - (price(it) / bounds.max) * 40 + (it.isNova ? 16 : 0);
        return score(b) - score(a);
      });
    return arr;
  }, [filtered, sort, q.cabin, fareId, bounds.max]);

  const minByDay = result.datePrices;
  const cheapestOverall = useMemo(() => (list.length ? Math.min(...list.map((it) => it.cabins[q.cabin]?.[fareId] ?? it.bestPrice)) : 0), [list, q.cabin, fareId]);

  const goToReturn = useCallback(
    (it: Itinerary) => {
      setOutbound(it);
      setStage('return');
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      store.toast({ tone: 'success', title: 'Outbound selected', body: `${it.segments[0].flightNo} · ${it.from} → ${it.to} on ${fmtDate(it.segments[0].depDateLabel, 'short')}` });
    },
    [store],
  );

  const toBooking = useCallback(
    (back: Itinerary) => {
      setReturnSel(back);
      setStage('done');
      store.setQuery(q);
      const p = new URLSearchParams({
        from: q.legs[0].from,
        to: q.legs[0].to,
        dep: q.legs[0].date,
        ret: q.returnDate,
        out: outbound?.id ?? '',
        'ret-id': back.id,
        fare: fareId,
        cabin: q.cabin,
        pax: `${q.adults},${q.children},${q.infants}`,
      });
      nav(`/booking?${p.toString()}`);
    },
    [nav, outbound, q, fareId, store],
  );

  const selectOutbound = (it: Itinerary) => {
    if (q.tripType === 'round') goToReturn(it);
    else {
      setOutbound(it);
      setStage('done');
      store.setQuery(q);
      nav(`/booking?from=${it.from}&to=${it.to}&dep=${it.segments[0].depDateLabel}&out=${it.id}&fare=${fareId}&cabin=${q.cabin}&pax=${q.adults},${q.children},${q.infants}`);
    }
  };

  const cheapestId = useMemo(() => {
    if (!sorted.length) return null;
    const price = (it: Itinerary) => it.cabins[q.cabin]?.[fareId] ?? it.bestPrice;
    return sorted.reduce((a, b) => (price(b) < price(a) ? b : a)).id;
  }, [sorted, q.cabin, fareId]);

  const bestValueId = useMemo(() => {
    if (!sorted.length) return null;
    return sorted.reduce((a, b) => (b.totalMin + b.stops * 90 < a.totalMin + a.stops * 90 ? b : a)).id;
  }, [sorted]);

  const modifyQuery = () => {
    const p = new URLSearchParams({
      from: draft.legs[0].from,
      to: draft.legs[0].to,
      dep: draft.legs[0].date,
      ret: draft.returnDate,
      pax: `${draft.adults},${draft.children},${draft.infants}`,
      cabin: draft.cabin,
      trip: draft.tripType,
    });
    setParams(p);
    store.setQuery(draft);
    setModify(false);
    setOutbound(null);
    setStage(draft.tripType === 'round' ? 'outbound' : 'outbound');
    store.toast({ tone: 'info', title: 'Search updated', body: `${draft.legs[0].from} → ${draft.legs[0].to} · ${CABIN_NAME[draft.cabin]}` });
  };

  const summaryPax = q.adults + q.children + q.infants;

  return (
    <div className="bg-mist-50/60">
      {/* summary bar */}
      <div className="border-b border-line bg-white pt-[var(--nav)]">
        <div className="shell py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-[1.25rem] font-semibold tracking-[-0.02em] text-navy-900 sm:text-[1.5rem]">
                  {cityOf(q.legs[0].from)} <ArrowLeftRight size={16} className="mx-0.5 -translate-y-px text-teal-600" /> {cityOf(q.legs[0].to)}
                </h1>
                <Badge tone="neutral">{q.legs[0].from} → {q.legs[0].to}</Badge>
                {q.tripType === 'round' && <Badge tone="navy">Round trip</Badge>}
                {q.tripType === 'oneway' && <Badge tone="navy">One way</Badge>}
                {q.tripType === 'multi' && <Badge tone="navy">{q.legs.length} legs</Badge>}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[.875rem] text-ink-500">
                <span className="flex items-center gap-1.5">
                  <CalendarRange size={14} className="text-ink-400" />
                  {fmtDate(q.legs[0].date, 'weekday')}
                  {q.tripType === 'round' && q.returnDate && <> → {fmtDate(q.returnDate, 'weekday')}</>}
                </span>
                <span className="flex items-center gap-1.5">
                  <Ticket size={14} className="text-ink-400" /> {summaryPax} {summaryPax === 1 ? 'traveller' : 'travellers'}
                  {q.children > 0 && ` · ${q.children} child`}
                  {q.infants > 0 && ` · ${q.infants} infant`}
                </span>
                <span className="flex items-center gap-1.5">
                  <Plane size={14} className="text-ink-400" /> {CABIN_NAME[q.cabin]}
                </span>
                {q.promo && <span className="flex items-center gap-1.5 font-medium text-teal-700"><Check size={13} /> Promo {q.promo}</span>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="secondary" icon={<SlidersHorizontal size={14} />} onClick={() => setModify(true)}>
                Modify search
              </Button>
              <Button size="sm" variant="ghost" icon={<Bell size={14} />} onClick={() => setTrack(true)}>
                Track prices
              </Button>
              <Button size="sm" variant="ghost" icon={<SearchIcon size={14} />} onClick={() => nav('/destinations')}>
                Change destination
              </Button>
            </div>
          </div>

          {/* stage rail */}
          {q.tripType === 'round' && (
            <ol className="mt-4 flex items-center gap-2 text-[.8125rem]">
              {[
                { id: 'outbound', label: `Outbound · ${q.legs[0].from}→${q.legs[0].to}`, done: !!outbound },
                { id: 'return', label: `Return · ${q.legs[0].to}→${q.legs[0].from}`, done: !!returnSel },
                { id: 'done', label: 'Passengers & payment', done: false },
              ].map((s, i) => (
                <li key={s.id} className="flex items-center gap-2">
                  {i > 0 && <span className="h-px w-6 bg-ink-200" />}
                  <button
                    disabled={i === 2}
                    onClick={() => {
                      if (i === 0) {
                        setStage('outbound');
                        setReturnSel(null);
                      } else if (i === 1 && outbound) setStage('return');
                    }}
                    className={cx('flex items-center gap-2 rounded-pill px-2.5 py-1 font-medium transition', stage === s.id ? 'bg-navy-800 text-white' : s.done ? 'bg-teal-50 text-teal-800 hover:bg-teal-100' : 'text-ink-500 hover:bg-mist-100 disabled:opacity-45')}
                  >
                    <span className={cx('num grid h-4 w-4 place-items-center rounded-full text-[.5625rem] font-bold', stage === s.id ? 'bg-white/20 text-white' : s.done ? 'bg-teal-500 text-white' : 'bg-mist-200 text-ink-500')}>{s.done ? '✓' : i + 1}</span>
                    {s.label}
                    {s.done && <span className="num text-[.6875rem] opacity-80">{priceStr(s.id === 'outbound' ? outbound ?? undefined : returnSel ?? undefined, q.cabin, fareId)}</span>}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* date strip */}
        <div className="border-t border-line bg-mist-50/70">
          <div className="shell flex items-stretch gap-1 overflow-x-auto py-2 no-scrollbar">
            <span className="flex shrink-0 items-center pr-3 text-[.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-400">
              {stage === 'return' ? 'Return dates' : 'Departure dates'}
            </span>
            {(stage === 'return' ? result.returnPrices : minByDay).map((d) => {
              const active = stage === 'return' ? d.date === q.returnDate : d.date === q.legs[0].date;
              const min = Math.min(...(stage === 'return' ? result.returnPrices : minByDay).map((x) => x.price));
              return (
                <button
                  key={d.date}
                  onClick={() => {
                    const next = { ...q };
                    if (stage === 'return') next.returnDate = d.date;
                    else next.legs = next.legs.map((l, i) => (i === 0 ? { ...l, date: d.date } : l));
                    store.setQuery(next);
                    setParams(new URLSearchParams({ ...Object.fromEntries(params), dep: next.legs[0].date, ret: next.returnDate }));
                  }}
                  className={cx('flex shrink-0 flex-col items-center rounded-[10px] border px-3 py-1.5 transition', active ? 'border-navy-800 bg-white shadow-card' : 'border-transparent hover:border-line hover:bg-white')}
                >
                  <span className="text-[.6875rem] uppercase tracking-wide text-ink-400">{fmtDate(d.date, 'weekday')}</span>
                  <span className={cx('num text-[.8125rem] font-semibold', d.price === min ? 'text-teal-600' : 'text-navy-900')}>{d.price ? money(d.price) : '—'}</span>
                </button>
              );
            })}
            <button onClick={() => store.toast({ tone: 'info', title: 'Calendar opened', body: 'In the live product this shows 90 days of fares with the cheapest per day.' })} className="shrink-0 rounded-[10px] px-3 py-1.5 text-[.75rem] font-semibold text-sky-700 hover:underline">
              90-day view
            </button>
          </div>
        </div>
      </div>

      <div className="shell grid gap-6 py-6 lg:grid-cols-[264px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]" ref={resultsRef}>
        {/* desktop filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--nav)+16px)] max-h-[calc(100vh-var(--nav)-40px)] overflow-y-auto rounded-card border border-line bg-white p-4 pr-3">
            <FilterPanel filters={filters} setFilters={setFilters} bounds={bounds} resultCount={filtered.length} />
          </div>
        </aside>

        <div className="min-w-0">
          {/* results header */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-[1rem] font-semibold text-navy-900">
                {stage === 'return' ? 'Choose your return' : 'Departing ' + fmtDate(q.legs[0].date, 'medium')}
              </h2>
              <Badge tone="neutral">{loading ? '…' : `${sorted.length} flights`}</Badge>
              {!loading && cheapestOverall > 0 && (
                <span className="hidden items-center gap-1.5 text-[.8125rem] text-ink-500 sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> Lowest {money(cheapestOverall)} in {CABIN_NAME[q.cabin]} {fareById(fareId).name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSheet(true)} className="flex items-center gap-1.5 rounded-[10px] border border-line bg-white px-2.5 py-1.5 text-[.8125rem] font-semibold text-ink-700 lg:hidden">
                <Filter size={14} /> Filters
              </button>
              <SegmentedControl
                size="sm"
                value={sort}
                onChange={setSort}
                options={[
                  { id: 'recommended', label: 'Recommended' },
                  { id: 'price', label: 'Price' },
                  { id: 'duration', label: 'Duration' },
                  { id: 'departure', label: 'Departure' },
                ]}
              />
            </div>
          </div>

          {/* fare family rail */}
          <div className="mb-3 overflow-x-auto rounded-card border border-line bg-white p-1.5 no-scrollbar">
            <div className="flex min-w-max items-center gap-1.5">
              <span className="pl-2 pr-1 text-[.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-400">Fare</span>
              {FARE_ORDER.filter((f) => Object.keys((list[0]?.cabins ?? {})[q.cabin] ?? {}).includes(f)).map((f) => {
                const fare = fareById(f);
                const sample = list[0]?.cabins[q.cabin]?.[f];
                return (
                  <button
                    key={f}
                    onClick={() => setFareId(f)}
                    className={cx('flex flex-col items-start rounded-[10px] border px-3 py-1.5 text-left transition', fareId === f ? 'border-navy-800 bg-navy-50' : 'border-transparent hover:bg-mist-100')}
                  >
                    <span className="text-[.8125rem] font-semibold text-navy-900">{fare.name}</span>
                    <span className="num text-[.6875rem] text-ink-500">
                      {sample ? money(sample) : '—'} · {fare.checkedBags ? `${fare.checkedBags} bag` : 'no bag'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <FlightSkeleton rows={4} />
          ) : sorted.length === 0 ? (
            <EmptyState
              title="No flights match these filters"
              body={`We fly ${list.length} itinerary option${list.length === 1 ? '' : 's'} on this date. Widen the price range or allow one stop to see them.`}
              icon={<SearchIcon size={20} />}
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button size="sm" onClick={() => setFilters(defaultFilters(bounds.min, bounds.max))}>
                    Clear filters
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setStage('outbound')}>
                    Pick another date
                  </Button>
                </div>
              }
            />
          ) : (
            <div className="space-y-3">
              {sorted.map((it) => (
                <FlightCard
                  key={it.id}
                  it={it}
                  cabin={q.cabin}
                  fareId={fareId}
                  selected={(stage === 'return' ? returnSel : outbound)?.id === it.id}
                  onSelect={stage === 'return' ? toBooking : selectOutbound}
                  flag={it.id === cheapestId ? { label: 'Lowest fare', tone: 'teal' } : it.id === bestValueId ? { label: 'Shortest total time', tone: 'sky' } : it.isNova && it.stops === 0 ? { label: 'AeroNova operated', tone: 'navy' } : undefined}
                />
              ))}

              <div className="flex items-start gap-3 rounded-card border border-line bg-white p-4">
                <Info size={16} className="mt-0.5 shrink-0 text-ink-400" />
                <div className="min-w-0 flex-1 text-[.8125rem] leading-relaxed text-ink-500">
                  <p>
                    {sorted.length} itineraries shown out of {list.length} available. We display fares for {CABIN_NAME[q.cabin]} on {summaryPax} {summaryPax === 1 ? 'adult' : 'adults'}.
                    Prices update every 60 seconds and are held for 20 minutes once you select.
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => store.toast({ tone: 'info', title: 'Fare calendar', body: 'Showing ±90 days. Cheapest day this month: ' + fmtDate(minByDay.reduce((a, b) => (b.price && b.price < a.price ? b : a)).date, 'short') })}>
                      Cheapest day this month
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => nav('/travel-information/baggage')}>
                      What each fare includes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* selection summary */}
          {(outbound || returnSel) && (
            <div className="sticky bottom-[76px] z-30 mt-4 lg:bottom-4">
              <div className="flex flex-wrap items-center gap-4 rounded-card border border-navy-800/20 bg-navy-900 p-4 text-white shadow-lift">
                <div className="min-w-0 flex-1">
                  <p className="text-[.6875rem] font-semibold uppercase tracking-[0.16em] text-teal-300">Your selection</p>
                  <p className="mt-1 truncate font-display text-[.9375rem] font-semibold">
                    {outbound ? `${outbound.segments[0].flightNo} ${outbound.from}→${outbound.to} · ${fmtDate(outbound.segments[0].depDateLabel, 'short')} · ${durationLabel(outbound.totalMin)}` : 'Outbound not selected'}
                    {returnSel && ` ＋ ${returnSel.segments[0].flightNo} ${returnSel.from}→${returnSel.to}`}
                  </p>
                </div>
                <p className="num font-display text-[1.375rem] font-semibold">
                  {money(Math.max(0, ((outbound?.cabins[q.cabin]?.[fareId] ?? 0) + (returnSel?.cabins[q.cabin]?.[fareId] ?? 0)) * summaryPax))}
                </p>
                {q.tripType === 'round' && stage === 'outbound' ? (
                  <span className="text-[.8125rem] text-white/60">Now choose the return</span>
                ) : (
                  <Button variant="onDark" size="sm" onClick={() => selectOutbound(outbound ?? sorted[0])} disabled={!outbound && stage === 'return'}>
                    Continue to passengers
                  </Button>
                )}
                <button onClick={() => { setOutbound(null); setReturnSel(null); setStage('outbound'); }} className="text-white/50 transition hover:text-white" aria-label="Clear selection">
                  <X size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* mobile filter sheet */}
      <Modal open={sheet} onClose={() => setSheet(false)} title="Filter flights" variant="sheet" size="lg">
        <FilterPanel filters={filters} setFilters={setFilters} bounds={bounds} resultCount={filtered.length} />
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" full onClick={() => setFilters(defaultFilters(bounds.min, bounds.max))}>
            Reset
          </Button>
          <Button full onClick={() => setSheet(false)}>
            Show {sorted.length} flights
          </Button>
        </div>
      </Modal>

      {/* modify search */}
      <Modal
        open={modify}
        onClose={() => setModify(false)}
        title="Modify search"
        subtitle="Everything resets the results view — your current flight choice is cleared."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModify(false)}>
              Cancel
            </Button>
            <Button onClick={modifyQuery}>Search again</Button>
          </>
        }
      >
        <div className="space-y-4">
          <SegmentedControl
            value={draft.tripType}
            onChange={(v) => setDraft({ ...draft, tripType: v })}
            options={[
              { id: 'round', label: 'Round trip' },
              { id: 'oneway', label: 'One way' },
              { id: 'multi', label: 'Multi-city' },
            ]}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="From">
              <Input value={draft.legs[0].from} onChange={(e) => setDraft({ ...draft, legs: [{ ...draft.legs[0], from: e.target.value.toUpperCase() }, ...draft.legs.slice(1)] })} />
            </Field>
            <Field label="To">
              <Input value={draft.legs[0].to} onChange={(e) => setDraft({ ...draft, legs: [{ ...draft.legs[0], to: e.target.value.toUpperCase() }, ...draft.legs.slice(1)] })} />
            </Field>
            <Field label="Departure">
              <Input type="date" value={draft.legs[0].date} onChange={(e) => setDraft({ ...draft, legs: [{ ...draft.legs[0], date: e.target.value }, ...draft.legs.slice(1)] })} />
            </Field>
            <Field label="Return">
              <Input type="date" value={draft.returnDate} onChange={(e) => setDraft({ ...draft, returnDate: e.target.value })} />
            </Field>
            <Field label="Adults">
              <Input type="number" min={1} max={9} value={draft.adults} onChange={(e) => setDraft({ ...draft, adults: Number(e.target.value) })} />
            </Field>
            <Field label="Cabin">
              <SegmentedControl
                size="sm"
                full
                value={draft.cabin}
                onChange={(v) => setDraft({ ...draft, cabin: v })}
                options={[
                  { id: 'ECONOMY', label: 'Economy' },
                  { id: 'PREMIUM', label: 'Premium' },
                  { id: 'BUSINESS', label: 'Business' },
                ]}
              />
            </Field>
          </div>
        </div>
      </Modal>

      {/* price tracking */}
      <Modal open={track} onClose={() => setTrack(false)} title="Track this price" size="sm" footer={<><Button variant="ghost" onClick={() => setTrack(false)}>Not now</Button><Button onClick={() => { setTrack(false); store.toast({ tone: 'success', title: 'Price tracking on', body: `We will email ${q.legs[0].from}–${q.legs[0].to} if fares drop below ${money(cheapestOverall)}` }); }}>Start tracking</Button></>}>
        <p className="text-[.875rem] leading-relaxed text-ink-600">
          We will watch {q.legs[0].from} ⇄ {q.legs[0].to} for {fmtDate(q.legs[0].date, 'short')} and email you if the {fareById(fareId).name} fare in {CABIN_NAME[q.cabin]} drops.
        </p>
        <div className="mt-3 rounded-[12px] bg-mist-50 p-3 text-[.8125rem] text-ink-500">Current lowest: <span className="num font-semibold text-navy-900">{money(cheapestOverall || 0)}</span> · last changed 14 minutes ago · 3 seats left at this price</div>
      </Modal>
    </div>
  );
}

/** keeps hook order stable while deriving a SearchQuery from params or the store */
function useQueryFromParamsSafe(params: URLSearchParams, fallback: SearchQuery | null): SearchQuery {
  const fromParams = useMemo(() => useQueryFromParams(params), [params]);
  return params.get('from') || params.get('to') ? fromParams : fallback ?? fromParams;
}
