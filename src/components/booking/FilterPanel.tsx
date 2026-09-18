import { useMemo } from 'react';
import { Luggage, RotateCcw, SlidersHorizontal, Star } from 'lucide-react';
import { cx, money } from '../../lib/utils';
import { Badge, Button } from '../ui/Primitives';
import { Checkbox, RangeSlider, SegmentedControl } from '../ui/Form';
import { AIRLINE_OPTIONS, CARRIERS } from '../../data/fares';
import type { Itinerary } from '../../types';

export interface Filters {
  stops: ('direct' | 'one')[];
  airlines: string[];
  allianceOnly: boolean;
  price: [number, number];
  depWindow: [number, number];
  arrWindow: [number, number];
  duration: 'any' | 'under5' | 'under8' | 'under12';
  baggage: 'any' | 'included';
  cabin: 'any' | 'ECONOMY' | 'PREMIUM' | 'BUSINESS';
  times: 'any' | 'morning' | 'afternoon' | 'evening' | 'night';
  maxConnect: number;
  novaOnly: boolean;
}

export const defaultFilters = (min: number, max: number): Filters => ({
  stops: ['direct', 'one'],
  airlines: CARRIERS.map((c) => c.code),
  allianceOnly: false,
  price: [min, max],
  depWindow: [0, 24],
  arrWindow: [0, 24],
  duration: 'any',
  baggage: 'any',
  cabin: 'any',
  times: 'any',
  maxConnect: 4,
  novaOnly: false,
});

export function applyFilters(list: Itinerary[], f: Filters, fareId: string) {
  return list.filter((it) => {
    if (!f.stops.includes(it.stops === 0 ? 'direct' : 'one')) return false;
    if (!f.airlines.includes(it.airlineCode)) return false;
    if (f.novaOnly && !it.isNova) return false;
    const price = it.cabins[Object.keys(it.cabins)[0] as keyof Itinerary['cabins']]?.[fareId] ?? it.bestPrice;
    if (price < f.price[0] || price > f.price[1]) return false;
    const depH = new Date(it.depEpoch).getUTCHours() + new Date(it.depEpoch).getUTCMinutes() / 60;
    const arrH = new Date(it.arrEpoch).getUTCHours() + new Date(it.arrEpoch).getUTCMinutes() / 60;
    if (depH < f.depWindow[0] || depH > f.depWindow[1]) return false;
    if (arrH < f.arrWindow[0] || arrH > f.arrWindow[1]) return false;
    if (f.duration === 'under5' && it.totalMin > 300) return false;
    if (f.duration === 'under8' && it.totalMin > 480) return false;
    if (f.duration === 'under12' && it.totalMin > 720) return false;
    if (f.baggage === 'included') {
      const fare = fareId;
      if (fare === 'LIGHT') return false;
    }
    if (f.times === 'morning' && !(depH >= 5 && depH < 12)) return false;
    if (f.times === 'afternoon' && !(depH >= 12 && depH < 18)) return false;
    if (f.times === 'evening' && !(depH >= 18 && depH < 23)) return false;
    if (f.times === 'night' && !(depH >= 23 || depH < 5)) return false;
    if (it.layoverMin && it.layoverMin > f.maxConnect * 60) return false;
    return true;
  });
}

export function FilterPanel({
  filters,
  setFilters,
  bounds,
  resultCount,
  className,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  bounds: { min: number; max: number };
  resultCount: number;
  className?: string;
}) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters({ ...filters, [k]: v });
  const activeCount = useMemo(() => {
    const d = defaultFilters(bounds.min, bounds.max);
    let n = 0;
    (Object.keys(d) as (keyof Filters)[]).forEach((k) => {
      if (JSON.stringify(d[k]) !== JSON.stringify(filters[k])) n++;
    });
    return n;
  }, [filters, bounds]);

  const airlineCounts = useMemo(() => {
    const m: Record<string, number> = {};
    return m;
  }, []);

  return (
    <div className={cx('space-y-5', className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-display text-[.9375rem] font-semibold text-navy-900">
          <SlidersHorizontal size={16} className="text-ink-400" /> Filter
          {activeCount > 0 && <Badge tone="navy">{activeCount}</Badge>}
        </p>
        <button onClick={() => setFilters(defaultFilters(bounds.min, bounds.max))} className="inline-flex items-center gap-1 text-[.75rem] font-semibold text-ink-500 transition hover:text-navy-800">
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <p className="num rounded-[10px] bg-teal-50 px-3 py-2 text-[.8125rem] font-medium text-teal-900">
        {resultCount} of {resultCount === 0 ? 'no' : ''} itineraries match
      </p>

      <fieldset>
        <legend className="mb-2 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-400">Stops</legend>
        <div className="space-y-2">
          {[
            { id: 'direct' as const, label: 'Non-stop only' },
            { id: 'one' as const, label: '1 stop maximum' },
          ].map((o) => (
            <label key={o.id} className="flex cursor-pointer items-center gap-2.5 text-[.875rem] text-ink-700">
              <input
                type="checkbox"
                checked={filters.stops.includes(o.id)}
                onChange={(e) => set('stops', e.target.checked ? [...filters.stops, o.id] : filters.stops.filter((s) => s !== o.id))}
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-400">Price · per adult</legend>
        <RangeSlider min={bounds.min} max={bounds.max} step={10} value={filters.price} onChange={(v) => set('price', v)} format={(n) => money(n)} />
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-400">Departure window</legend>
        <RangeSlider min={0} max={24} value={filters.depWindow} onChange={(v) => set('depWindow', v)} format={(n) => `${String(n).padStart(2, '0')}:00`} />
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-400">Arrival window</legend>
        <RangeSlider min={0} max={24} value={filters.arrWindow} onChange={(v) => set('arrWindow', v)} format={(n) => `${String(n).padStart(2, '0')}:00`} />
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-400">Total travel time</legend>
        <SegmentedControl
          full
          size="sm"
          value={filters.duration}
          onChange={(v) => set('duration', v)}
          options={[
            { id: 'any', label: 'Any' },
            { id: 'under5', label: '< 5h' },
            { id: 'under8', label: '< 8h' },
            { id: 'under12', label: '< 12h' },
          ]}
        />
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-400">Airline</legend>
        <div className="space-y-1.5">
          {AIRLINE_OPTIONS.map((a) => (
            <label key={a.code} className="flex cursor-pointer items-center gap-2.5 text-[.875rem] text-ink-700">
              <input
                type="checkbox"
                checked={filters.airlines.includes(a.code)}
                onChange={(e) => set('airlines', e.target.checked ? [...filters.airlines, a.code] : filters.airlines.filter((x) => x !== a.code))}
              />
              <span className="flex-1">{a.label}</span>
              <span className="num text-[.6875rem] text-ink-400">{airlineCounts[a.code] ?? (a.code === 'AN' ? 'self' : 'partner')}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2.5">
        <legend className="mb-1 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-400">Preferences</legend>
        <Checkbox
          label={
            <span className="flex items-center gap-1.5">
              <Star size={13} className="text-gold-500" /> AeroNova operated only
            </span>
          }
          checked={filters.novaOnly}
          onChange={(v) => set('novaOnly', v)}
        />
        <Checkbox
          label={
            <span className="flex items-center gap-1.5">
              <Luggage size={13} className="text-teal-600" /> Baggage included in fare
            </span>
          }
          checked={filters.baggage === 'included'}
          onChange={(v) => set('baggage', v ? 'included' : 'any')}
        />
        <Checkbox label="Alliance & partner flights" checked={filters.allianceOnly} onChange={(v) => set('allianceOnly', v)} />
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-400">Maximum connection</legend>
        <input type="range" min={1} max={6} step={0.5} value={filters.maxConnect} onChange={(e) => set('maxConnect', Number(e.target.value))} className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-mist-200 accent-teal-500" aria-label="Maximum connection length in hours" />
        <p className="num mt-1 text-[.75rem] text-ink-500">Up to {filters.maxConnect} h layover</p>
      </fieldset>

      <div className="rounded-card border border-line bg-mist-50 p-3">
        <p className="text-[.75rem] leading-relaxed text-ink-500">
          Fares are per adult and include taxes and carrier surcharges. Bags, seats and Wi-Fi are shown for the selected fare family and can be changed before payment.
        </p>
        <Button size="sm" variant="secondary" className="mt-2.5 w-full" to="/help">
          Fare rules explained
        </Button>
      </div>
    </div>
  );
}
