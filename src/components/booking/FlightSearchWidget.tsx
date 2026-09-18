import {useEffect, useMemo, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownUp, Gift, Plane, Search, Ticket, Users } from 'lucide-react';
import { cx, toISODate, DAY, parseISODate, fmtDate } from '../../lib/utils';
import { SEARCHABLE } from '../../data/airports';
import { CARRIERS } from '../../data/fares';
import type { SearchQuery } from '../../types';
import { AirportField, Counter, DateField, SegmentedControl, Select } from '../ui/Form';
import { Button, InfoDot } from '../ui/Primitives';
import { Modal } from '../ui/Overlay';
import { useStore } from '../../store/store';

const today = toISODate(new Date());

export function useDefaultQuery(existing?: SearchQuery | null): SearchQuery {
  const { query } = useStore();
  const src = existing ?? query;
  return useMemo<SearchQuery>(
    () =>
      src ?? {
        tripType: 'round',
        legs: [{ from: 'ACC', to: 'LOS', date: toISODate(new Date(Date.now() + 16 * DAY)) }],
        returnDate: toISODate(new Date(Date.now() + 23 * DAY)),
        adults: 1,
        children: 0,
        infants: 0,
        cabin: 'ECONOMY',
        promo: '',
      },
    [src],
  );
}

export function FlightSearchWidget({ variant = 'panel', initial, className }: { variant?: 'panel' | 'compact' | 'hero' | 'plain'; initial?: SearchQuery; className?: string }) {
  const q = useDefaultQuery(initial);
  const [draft, setDraft] = useState<SearchQuery>(q);
  const [swapSpin, setSwapSpin] = useState(false);
  const [paxOpen, setPaxOpen] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoInput, setPromoInput] = useState(draft.promo);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const nav = useNavigate();
  const { setQuery, toast } = useStore();

  useEffect(() => setDraft(q), [q]);

  const multi = draft.tripType === 'multi';
  const legs = draft.legs.length ? draft.legs : [{ from: '', to: '', date: '' }];

  const setLeg = (i: number, patch: Partial<{ from: string; to: string; date: string }>) =>
    setDraft((d) => ({ ...d, legs: d.legs.map((l, k) => (k === i ? { ...l, ...patch } : l)) }));

  const swap = () => {
    setSwapSpin(true);
    setTimeout(() => setSwapSpin(false), 420);
    setDraft((d) => ({ ...d, legs: d.legs.map((l) => ({ ...l, from: l.to, to: l.from })) }));
  };

  const submit = () => {
    const first = draft.legs[0];
    if (!first.from || !first.to) {
      setError('Tell us where you are flying from and to.');
      return;
    }
    if (first.from === first.to) {
      setError('Departure and arrival airports cannot be the same.');
      return;
    }
    if (!first.date) {
      setError('Choose a departure date.');
      return;
    }
    if (draft.tripType === 'round' && !draft.returnDate) {
      setError('Add a return date, or switch to one way.');
      return;
    }
    if (draft.tripType === 'round' && parseISODate(draft.returnDate) < parseISODate(first.date)) {
      setError('Your return is before you leave. Check the dates.');
      return;
    }
    if (parseISODate(first.date) < parseISODate(today)) {
      setError('Departure is in the past.');
      return;
    }
    setError(null);
    setQuery(draft);
    setApplied(true);
    toast({ tone: 'success', title: 'Searching availability', body: `${first.from} → ${first.to} · ${fmtDate(first.date, 'short')} · ${draft.adults + draft.children + draft.infants} passenger${draft.adults + draft.children + draft.infants > 1 ? 's' : ''}` });
    nav(`/search?${new URLSearchParams({ ...(multi ? { legs: JSON.stringify(draft.legs) } : { from: first.from, to: first.to }), dep: first.date, ret: draft.returnDate, pax: `${draft.adults},${draft.children},${draft.infants}`, cabin: draft.cabin, trip: draft.tripType }).toString()}`);
  };

  const paxTotal = draft.adults + draft.children + draft.infants;
  const isHero = variant === 'hero';
  const isCompact = variant === 'compact';

  const shell = isHero
    ? 'panel p-3 sm:p-4 shadow-lift'
    : isCompact
      ? 'rounded-[14px] border border-line bg-white p-2 shadow-card'
      : variant === 'panel'
        ? 'panel p-4 sm:p-5'
        : '';

  return (
    <div className={cx('relative', shell, className)}>
      <div className={cx('flex flex-wrap items-center gap-1.5', !isCompact && 'mb-3 border-b border-line pb-3')}>
        <SegmentedControl
          size={isCompact ? 'sm' : 'md'}
          value={draft.tripType}
          onChange={(v) => setDraft((d) => ({ ...d, tripType: v }))}
          options={[
            { id: 'round', label: 'Round trip' },
            { id: 'oneway', label: 'One way' },
            { id: 'multi', label: 'Multi-city' },
          ]}
        />
        {!isCompact && (
          <p className="ml-auto hidden items-center gap-1.5 text-[.75rem] text-ink-400 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> 41 destinations · fares shown including taxes
          </p>
        )}
      </div>

      <div className={cx('grid gap-2.5', isCompact ? 'lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_minmax(140px,0.8fr)_minmax(140px,0.8fr)_auto]' : multi ? '' : 'md:grid-cols-2 lg:grid-cols-[minmax(0,1.15fr)_auto_minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)]')}>
        {!multi && (
          <>
            <div className="contents">
              <AirportField label="From" value={legs[0].from} onChange={(v) => setLeg(0, { from: v })} suggestions={SEARCHABLE as never} error={error && !legs[0].from ? 'Required' : undefined} required />
            </div>
            <div className="flex items-end justify-center pb-1">
              <button
                type="button"
                onClick={swap}
                aria-label="Swap origin and destination"
                className={cx('grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-ink-500 shadow-card transition hover:border-navy-400 hover:text-navy-800', swapSpin && 'rotate-180 duration-500')}
              >
                <ArrowDownUp size={14} />
              </button>
            </div>
            <AirportField label="To" value={legs[0].to} onChange={(v) => setLeg(0, { to: v })} suggestions={SEARCHABLE as never} exclude={legs[0].from} error={error && !legs[0].to ? 'Required' : undefined} required />
          </>
        )}

        {multi && (
          <div className="space-y-2 md:col-span-2">
            {legs.map((l, i) => (
              <div key={i} className="grid items-end gap-2 rounded-[12px] border border-line p-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_150px_auto]">
                <AirportField compact label={`Leg ${i + 1} from`} value={l.from} onChange={(v) => setLeg(i, { from: v })} suggestions={SEARCHABLE as never} />
                <AirportField compact label="To" value={l.to} onChange={(v) => setLeg(i, { to: v })} suggestions={SEARCHABLE as never} exclude={l.from} />
                <DateField label="Departure" value={l.date} onChange={(v) => setLeg(i, { date: v })} minDate={today} />
                <button
                  type="button"
                  aria-label={`Remove leg ${i + 1}`}
                  disabled={legs.length <= 1}
                  onClick={() => setDraft((d) => ({ ...d, legs: d.legs.filter((_, k) => k !== i) }))}
                  className="mb-1 grid h-9 w-9 place-items-center rounded-full border border-line text-ink-400 transition hover:border-red-300 hover:text-red-600 disabled:opacity-40"
                >
                  ×
                </button>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => setDraft((d) => ({ ...d, legs: [...d.legs, { from: d.legs[d.legs.length - 1]?.to ?? '', to: '', date: '' }] }))}>
                + Add another flight
              </Button>
              <span className="text-xs text-ink-400">Up to 6 sectors on one ticket</span>
            </div>
          </div>
        )}

        {!multi && (
          <>
            <DateField
              label="Departure"
              value={legs[0].date}
              onChange={(v) => {
                setLeg(0, { date: v });
                if (draft.returnDate && parseISODate(draft.returnDate) < parseISODate(v)) setDraft((d) => ({ ...d, returnDate: toISODate(new Date(parseISODate(v).getTime() + 5 * DAY)) }));
              }}
              minDate={today}
              maxDate={toISODate(new Date(Date.now() + 330 * DAY))}
              required
            />
            {draft.tripType === 'round' ? (
              <DateField label="Return" value={draft.returnDate} onChange={(v) => setDraft((d) => ({ ...d, returnDate: v }))} minDate={legs[0].date || today} maxDate={toISODate(new Date(Date.now() + 330 * DAY))} required />
            ) : (
              <div className="hidden lg:block" />
            )}
          </>
        )}

        {!isCompact || multi ? null : null}
      </div>

      <div className={cx('mt-2.5 flex flex-wrap items-end gap-2', isCompact && 'mt-2')}>
        <button type="button" onClick={() => setPaxOpen(true)} className={cx('min-w-[168px] rounded-[11px] border border-line bg-white px-3 text-left transition hover:border-sky-400', isCompact ? 'py-1.5' : 'py-2')}>
          <span className="block text-[.6875rem] font-semibold uppercase tracking-[0.09em] text-ink-500">Passengers</span>
          <span className="flex items-center gap-1.5 text-[.9375rem] font-medium text-navy-900">
            <Users size={14} className="text-ink-400" />
            <span className="num">
              {paxTotal} {paxTotal === 1 ? 'traveller' : 'travellers'}
            </span>
            {(draft.children > 0 || draft.infants > 0) && <span className="text-[.75rem] font-normal text-ink-400">· {draft.children} ch {draft.infants} inf</span>}
          </span>
        </button>

        <label className={cx('min-w-[150px] flex-1 rounded-[11px] border border-line bg-white px-3 transition focus-within:border-sky-500', isCompact ? 'py-1.5' : 'py-2')}>
          <span className="block text-[.6875rem] font-semibold uppercase tracking-[0.09em] text-ink-500">Cabin</span>
          <span className="-ml-1 flex items-center gap-1">
            <Select value={draft.cabin} onChange={(e) => setDraft((d) => ({ ...d, cabin: e.target.value as SearchQuery['cabin'] }))} className="h-7 border-0 bg-transparent px-1 py-0 text-[.9375rem] font-medium focus:ring-0" aria-label="Cabin class">
              <option value="ECONOMY">Economy</option>
              <option value="PREMIUM">Premium Economy</option>
              <option value="BUSINESS">Nova Business</option>
            </Select>
          </span>
        </label>

        <button type="button" onClick={() => setPromoOpen(true)} className={cx('rounded-[11px] border border-line bg-white px-3 text-left transition hover:border-sky-400', isCompact ? 'py-1.5' : 'py-2')}>
          <span className="block text-[.6875rem] font-semibold uppercase tracking-[0.09em] text-ink-500">Promo code</span>
          <span className="flex items-center gap-1.5 text-[.9375rem] font-medium text-navy-900">
            <Gift size={14} className={draft.promo ? 'text-teal-600' : 'text-ink-400'} />
            {draft.promo || 'Add code'}
          </span>
        </button>

        <Button size={isCompact ? 'md' : 'lg'} className={cx('shrink-0', isCompact ? 'h-11' : 'min-w-[190px] flex-1 sm:flex-none')} icon={<Search size={17} />} onClick={submit}>
          Search Flights
        </Button>
      </div>

      {error && (
        <p role="alert" className="mt-2 flex items-center gap-2 rounded-[10px] bg-red-50 px-3 py-2 text-[.8125rem] font-medium text-red-700">
          <span aria-hidden>⚠</span> {error}
        </p>
      )}

      {applied && !isCompact && (
        <p className="mt-2 text-[.75rem] text-ink-400">Fares refresh every 60 seconds. Best price found is locked for 20 minutes once you select a flight.</p>
      )}

      {!isCompact && variant !== 'plain' && (
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-line pt-3 text-[.8125rem] text-ink-500">
          <button className="inline-flex items-center gap-1.5 font-medium text-navy-800 hover:underline" onClick={() => nav('/manage-booking')}>
            <Ticket size={14} /> Manage booking
          </button>
          <button className="inline-flex items-center gap-1.5 font-medium text-navy-800 hover:underline" onClick={() => nav('/check-in')}>
            <Plane size={14} /> Check in
          </button>
          <button className="inline-flex items-center gap-1.5 font-medium text-navy-800 hover:underline" onClick={() => nav('/flight-status')}>
            <Search size={14} /> Flight status
          </button>
          <span className="ml-auto hidden items-center gap-1.5 sm:inline-flex">
            <InfoDot label="Prices shown in your selected currency. Taxes and carrier-imposed surcharges are included." />
            Prices include taxes
          </span>
        </div>
      )}

      <Modal open={paxOpen} onClose={() => setPaxOpen(false)} title="Passengers" subtitle="Fares are per person. Infants travel on an adult’s lap." size="sm">
        <div className="divide-y divide-line">
          <Counter label="Adults" sub="18 years and over" value={draft.adults} onChange={(v) => setDraft((d) => ({ ...d, adults: v }))} max={9} onPrice={0} />
          <Counter label="Children" sub="2–11 years · 50% of the published fare" value={draft.children} onChange={(v) => setDraft((d) => ({ ...d, children: v }))} max={8} />
          <Counter label="Infants" sub="Under 2, on an adult’s lap" value={draft.infants} onChange={(v) => setDraft((d) => ({ ...d, infants: v }))} max={4} />
        </div>
        <p className="mt-3 rounded-[10px] bg-mist-50 p-3 text-[.8125rem] leading-relaxed text-ink-500">
          Maximum 9 passengers per booking. For {paxTotal > 9 ? 'larger parties' : 'groups of 10 or more'} use our Group desk — different fares, one invoice, and seat blocking at no charge.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setPaxOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setPaxOpen(false)}>Done</Button>
        </div>
      </Modal>

      <Modal open={promoOpen} onClose={() => setPromoOpen(false)} title="Promo code" subtitle="One code per booking, applied to the base fare." size="sm">
        <div className="space-y-3">
          <input
            autoFocus
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
            placeholder="e.g. NOVADAY"
            className="h-12 w-full rounded-[12px] border border-line px-4 font-display text-[1rem] uppercase tracking-[0.12em] outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/12"
          />
          <div className="grid gap-2 text-[.8125rem]">
            {[
              { c: 'NOVADAY', d: '10% off the base fare · all routes · ends 30 Sep' },
              { c: 'STUDENT', d: '12% off + one extra 23 kg bag · verified students' },
              { c: 'AERONOVA5', d: 'USD 5 off intra-African one ways' },
            ].map((p) => (
              <button key={p.c} onClick={() => setPromoInput(p.c)} className="flex items-center justify-between gap-3 rounded-[10px] border border-line px-3 py-2 text-left transition hover:border-sky-400 hover:bg-sky-50/50">
                <span className="font-display font-bold tracking-[0.08em] text-navy-900">{p.c}</span>
                <span className="text-right text-ink-500">{p.d}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 pt-1">
            <button className="text-[.8125rem] font-semibold text-ink-500 underline-offset-4 hover:underline" onClick={() => setPromoInput('')}>
              Remove code
            </button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setPromoOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setDraft((d) => ({ ...d, promo: promoInput.trim() }));
                  setPromoOpen(false);
                  if (promoInput.trim()) toast({ tone: 'success', title: `${promoInput.trim()} applied`, body: 'Discount is shown on the review step.' });
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function CarrierStrip({ className }: { className?: string }) {
  return (
    <div className={cx('flex flex-wrap items-center gap-x-6 gap-y-2', className)}>
      {CARRIERS.slice(0, 5).map((c) => (
        <span key={c.code} className="font-display text-[.75rem] font-semibold uppercase tracking-[0.14em] text-ink-300">
          {c.short}
        </span>
      ))}
    </div>
  );
}
