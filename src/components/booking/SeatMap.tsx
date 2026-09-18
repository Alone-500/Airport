import {useMemo, useState} from 'react';
import { Info, Luggage, Armchair, DoorOpen } from 'lucide-react';
import { cx } from '../../lib/utils';
import { buildSeatMap, layoutFor, LAYOUTS, seatLabel, type Seat } from '../../data/seats';
import { Badge, Tooltip } from '../ui/Primitives';

const CELL = { base: 'h-8 w-8 sm:h-9 sm:w-9' };

export function SeatMap({
  aircraft,
  flightNo,
  selected = {},
  onChange,
  cabinsShown = ['BUSINESS', 'PREMIUM', 'ECONOMY'],
  className,
  adultCount = 1,
}: {
  aircraft: string;
  flightNo: string;
  selected?: Record<string, string>;
  onChange?: (paxId: string, seatId: string, price: number) => void;
  cabinsShown?: ('BUSINESS' | 'PREMIUM' | 'ECONOMY')[];
  className?: string;
  adultCount?: number;
}) {
  const key = layoutFor(aircraft);
  const selectedIds = Object.values(selected).filter(Boolean);
  const [activeCabin, setActiveCabin] = useState<(typeof cabinsShown)[number]>(cabinsShown[0]);
  const [focus, setFocus] = useState<string | null>(null);
  const [hover, setHover] = useState<Seat | null>(null);
  const rows = useMemo(() => buildSeatMap(aircraft, flightNo, activeCabin, selectedIds), [aircraft, flightNo, activeCabin, selectedIds.join(',')]);
  const visible = rows.filter((r) => r.seats.some((s) => s.col !== '—'));
  const specs = LAYOUTS[key].filter((sp) => cabinsShown.includes(sp.cabin));
  const totalSelected = selectedIds.filter(Boolean).length;

  const click = (s: Seat) => {
    if (!onChange) return;
    if (s.state === 'occupied' || s.state === 'blocked') return;
    const order = Object.keys(selected).length ? Object.keys(selected) : Array.from({ length: adultCount }, (_, i) => `p${i}`);
    const pax = order.find((p) => selected[p] !== s.id) ?? order[0];
    onChange(pax, s.id, s.priceUSD);
  };

  const seatStateClass = (s: Seat) => {
    switch (s.state) {
      case 'occupied':
        return 'cursor-not-allowed border-ink-200 bg-ink-200/70 text-ink-400';
      case 'blocked':
        return 'cursor-not-allowed border-dashed border-ink-200 bg-transparent text-ink-300';
      case 'selected':
        return 'border-navy-800 bg-navy-800 text-white shadow-card';
      case 'exit':
        return 'border-teal-500/70 bg-teal-50 text-teal-800 hover:bg-teal-100';
      case 'premium':
        return 'border-gold-400/70 bg-gold-100 text-gold-600 hover:bg-gold-100/70';
      case 'extra':
        return 'border-sky-400/70 bg-sky-50 text-sky-900 hover:bg-sky-100';
      default:
        return 'border-ink-200 bg-white text-ink-600 hover:border-navy-500 hover:bg-sky-50';
    }
  };

  return (
    <div className={cx('space-y-4', className)}>
      {cabinsShown.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          {cabinsShown.map((c) => {
            const spec = LAYOUTS[key].find((x) => x.cabin === c);
            return (
              <button
                key={c}
                onClick={() => setActiveCabin(c)}
                className={cx('rounded-pill border px-3 py-1.5 text-[.8125rem] font-semibold transition', activeCabin === c ? 'border-navy-800 bg-navy-800 text-white' : 'border-line bg-white text-ink-600 hover:border-navy-300')}
              >
                {spec?.label ?? c}
              </button>
            );
          })}
          <span className="ml-auto text-[.75rem] text-ink-400">{aircraft} · layout {key}</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(220px,260px)]">
        <div className="relative overflow-x-auto rounded-card border border-line bg-mist-50/60 p-3 sm:p-5">
          {/* fuselage outline */}
          <div className="pointer-events-none absolute inset-x-6 inset-y-3 rounded-t-[999px] rounded-b-[40px] border border-line bg-white/60" aria-hidden />
          <div className="relative mx-auto w-max">
            <div className="mb-3 flex items-center justify-between px-1 text-[.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-400">
              <span>Front · {specs.find((s) => s.cabin === activeCabin)?.pitch ?? ''}</span>
              <span className="flex items-center gap-1.5">
                <DoorOpen size={12} /> Crew
              </span>
            </div>
            <div className="space-y-1.5">
              {visible.map((row) => (
                <div key={row.num} className="flex items-center gap-1.5">
                  <span className="num w-6 shrink-0 text-right text-[.6875rem] font-semibold text-ink-400">{row.num}</span>
                  {row.seats.map((s, i) => {
                    const isAisleGap = s.col === '—';
                    if (isAisleGap) return <span key={`g${i}`} className="h-8 w-3 sm:h-9 sm:w-4" />;
                    const sel = selectedIds.includes(s.id);
                    const disabled = s.state === 'occupied' || s.state === 'blocked';
                    return (
                      <Tooltip key={s.id} label={seatLabel(s)} className="contents">
                        <button
                          type="button"
                          aria-label={`Seat ${s.id} — ${seatLabel(s)}`}
                          aria-pressed={sel}
                          tabIndex={focus === s.id || (!focus && i === 0) ? 0 : -1}
                          onFocus={() => setFocus(s.id)}
                          onMouseEnter={() => setHover(s)}
                          onMouseLeave={() => setHover(null)}
                          disabled={disabled}
                          onKeyDown={(e) => {
                            const flat = visible.flatMap((r) => r.seats.filter((x) => x.col !== '—'));
                            const idx = flat.findIndex((x) => x.id === s.id);
                            let next = -1;
                            if (e.key === 'ArrowRight') next = idx + 1;
                            if (e.key === 'ArrowLeft') next = idx - 1;
                            if (e.key === 'ArrowDown') next = idx + flat.length / visible.length;
                            if (e.key === 'ArrowUp') next = idx - flat.length / visible.length;
                            if (next >= 0 && next < flat.length) {
                              e.preventDefault();
                              setFocus(flat[Math.round(next)].id);
                              requestAnimationFrame(() => document.getElementById(`seat-${flat[Math.round(next)].id}`)?.focus());
                            }
                          }}
                          id={`seat-${s.id}`}
                          onClick={() => click(s)}
                          className={cx(
                            'relative grid place-items-center rounded-[9px] border font-display text-[.625rem] font-bold transition-all duration-150',
                            CELL.base,
                            seatStateClass(s),
                            sel && 'scale-[1.06]',
                          )}
                        >
                          {s.state === 'occupied' ? (
                            <span aria-hidden className="h-3 w-3 rounded-full bg-ink-400/60" />
                          ) : s.state === 'blocked' ? (
                            <span aria-hidden>–</span>
                          ) : (
                            s.id.replace(String(s.row), '')
                          )}
                          {s.priceUSD > 0 && !sel && <span className="absolute -right-1 -top-1 rounded-full bg-white px-1 text-[.5rem] font-bold text-navy-800 shadow-sm ring-1 ring-line">${s.priceUSD}</span>}
                        </button>
                      </Tooltip>
                    );
                  })}
                  <span className="w-6 shrink-0 text-[.6875rem] font-semibold text-ink-400">{row.seats[0]?.col}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between px-1 text-[.6875rem] uppercase tracking-[0.14em] text-ink-400">
              <span>Rear galley</span>
              <span>Lavatory</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <p className="font-display text-[.8125rem] font-semibold uppercase tracking-[0.08em] text-navy-900">Legend</p>
            <ul className="mt-3 space-y-2 text-[.8125rem] text-ink-600">
              {[
                ['border-ink-200 bg-white', 'Available · no charge'],
                ['border-sky-400 bg-sky-50', 'Preferred / forward'],
                ['border-teal-500 bg-teal-50', 'Exit row · +13 cm'],
                ['border-gold-400 bg-gold-100', 'Premium / suite'],
                ['border-ink-200 bg-ink-200', 'Occupied'],
                ['border-dashed border-ink-200 bg-white', 'Not for sale'],
                ['border-navy-800 bg-navy-800', 'Your selection'],
              ].map(([c, l]) => (
                <li key={l} className="flex items-center gap-2.5">
                  <span className={cx('h-5 w-5 shrink-0 rounded-[6px] border', c)} />
                  {l}
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-start gap-1.5 border-t border-line pt-3 text-[.75rem] leading-snug text-ink-400">
              <Info size={13} className="mt-0.5 shrink-0" />
              Use arrow keys to move around the map. Seats held for 10 minutes while you decide.
            </p>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <p className="font-display text-[.8125rem] font-semibold uppercase tracking-[0.08em] text-navy-900">Your seats</p>
              <Badge tone={totalSelected ? 'teal' : 'neutral'}>{totalSelected} selected</Badge>
            </div>
            {totalSelected === 0 ? (
              <p className="mt-3 text-[.8125rem] leading-relaxed text-ink-500">Nothing selected yet. We will assign seats free at check-in if you prefer to decide later.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {Object.entries(selected).map(([pax, seat]) =>
                  seat ? (
                    <li key={pax} className="flex items-center justify-between gap-3 rounded-[10px] bg-mist-50 px-3 py-2">
                      <span className="flex items-center gap-2 text-[.8125rem] font-medium text-navy-900">
                        <Armchair size={14} className="text-teal-600" /> {seat}
                      </span>
                      <span className="text-[.75rem] text-ink-500">{pax}</span>
                    </li>
                  ) : null,
                )}
              </ul>
            )}
            {hover && (
              <p className="mt-3 border-t border-line pt-2.5 text-[.75rem] text-ink-500">
                <span className="num font-semibold text-navy-900">{hover.id}</span> · {seatLabel(hover)}
                {hover.feature ? ` · ${hover.feature}` : ''}
              </p>
            )}
          </div>

          <div className="rounded-card border border-line bg-white p-4">
            <p className="flex items-center gap-2 font-display text-[.8125rem] font-semibold text-navy-900">
              <Luggage size={15} className="text-ink-400" /> Bag size check
            </p>
            <p className="mt-2 text-[.8125rem] leading-relaxed text-ink-500">
              Every seat on this {aircraft} takes one 8 kg cabin bag in the overhead above it, plus a personal item under the seat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
