import { useState } from 'react';
import { ArrowLeftRight, BatteryCharging, Check, ChevronDown, Clock, Luggage, Plane, Star, Usb, Wifi } from 'lucide-react';
import { cx, durationLabel, money } from '../../lib/utils';
import type { Itinerary } from '../../types';
import { fareById } from '../../data/fares';
import { Badge, Button, Tooltip } from '../ui/Primitives';
import { useStore } from '../../store/store';
import type { CabinId } from '../../types';

export function FlightCard({
  it,
  cabin,
  fareId,
  onSelect,
  selected,
  flag,
  priceNote,
  showFares = true,
  dense,
}: {
  it: Itinerary;
  cabin: CabinId;
  fareId: string;
  onSelect?: (it: Itinerary, fareId: string) => void;
  selected?: boolean;
  flag?: { label: string; tone: 'teal' | 'gold' | 'ember' | 'sky' | 'navy' };
  priceNote?: string;
  showFares?: boolean;
  dense?: boolean;
}) {
  const { prefs } = useStore();
  const [open, setOpen] = useState(false);
  const fare = fareById(fareId);
  const price = it.cabins[cabin]?.[fareId] ?? it.bestPrice;
  const first = it.segments[0];
  const last = it.segments[it.segments.length - 1];
  const depTime = new Date(first.dep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const arrTime = new Date(last.arr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const plusDay = new Date(last.arr).getDate() !== new Date(first.dep).getDate();

  return (
    <article className={cx('group relative rounded-card border bg-white transition-all duration-200', selected ? 'border-navy-800 ring-1 ring-navy-800 shadow-panel' : 'border-line hover:border-sky-300 hover:shadow-card')}>
      <div className={cx('flex flex-col gap-3 p-4', !dense && 'sm:flex-row sm:items-center sm:gap-5')}>
        {/* carrier */}
        <div className="flex shrink-0 items-center gap-2.5 sm:w-[124px] sm:flex-col sm:items-start sm:gap-1.5">
          <div className="flex items-center gap-2">
            <span className={cx('grid h-8 w-8 place-items-center rounded-[9px] font-display text-[.625rem] font-bold', it.isNova ? 'bg-navy-800 text-gold-400' : 'bg-mist-100 text-ink-600')}>{it.airlineCode}</span>
            <span className="font-display text-[.8125rem] font-semibold text-navy-900 sm:hidden">{it.isNova ? 'AeroNova' : it.airlineCode}</span>
          </div>
          <span className="hidden text-[.75rem] leading-tight text-ink-500 sm:block">{first.carrier}</span>
          <span className="num hidden text-[.6875rem] text-ink-400 sm:block">{first.flightNo}</span>
          {flag && (
            <Badge tone={flag.tone} className="!text-[.625rem] sm:mt-0.5">
              {flag.label}
            </Badge>
          )}
        </div>

        {/* times */}
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
          <div className="shrink-0">
            <p className="num font-display text-[1.5rem] font-semibold leading-none text-navy-900">{depTime}</p>
            <p className="num mt-1 text-[.8125rem] font-semibold text-ink-700">{first.from}</p>
            <p className="text-[.6875rem] text-ink-400">{first.terminal}</p>
          </div>
          <div className="relative flex-1">
            <p className="num text-center text-[.6875rem] font-medium uppercase tracking-wide text-ink-500">{durationLabel(it.totalMin)}</p>
            <div className="mt-1 flex items-center gap-1">
              <span className="h-[6px] w-[6px] shrink-0 rounded-full border-[1.5px] border-navy-700" />
              <span className={cx('h-[1.5px] flex-1', it.stops ? 'border-t-2 border-dashed border-ink-300' : 'bg-navy-700')} />
              {it.via && (
                <span className="flex flex-col items-center">
                  <span className="num text-[.625rem] font-semibold text-ink-500">{it.via}</span>
                  <ArrowLeftRight size={9} className="text-ink-300" />
                </span>
              )}
              <span className={cx('h-[1.5px] flex-1', it.stops ? 'border-t-2 border-dashed border-ink-300' : 'bg-navy-700')} />
              <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-navy-700" />
            </div>
            <p className={cx('text-center text-[.6875rem] font-semibold', it.stops === 0 ? 'text-teal-600' : 'text-ink-500')}>
              {it.stops === 0 ? 'Non-stop' : `${it.stops} stop`}
              {it.layoverMin ? ` · ${durationLabel(it.layoverMin)} in ${it.via}` : ''}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="num font-display text-[1.5rem] font-semibold leading-none text-navy-900">
              {arrTime}
              {plusDay && <sup className="num ml-0.5 text-[.6875rem] font-semibold text-ember-600">+1</sup>}
            </p>
            <p className="num mt-1 text-[.8125rem] font-semibold text-ink-700">{last.to}</p>
            <p className="text-[.6875rem] text-ink-400">{last.terminal}</p>
          </div>
        </div>

        {/* price + actions */}
        <div className="flex shrink-0 items-end justify-between gap-3 border-t border-line pt-3 sm:w-[168px] sm:flex-col sm:items-end sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          <div className="sm:text-right">
            <p className="num font-display text-[1.375rem] font-semibold leading-none text-navy-900">{money(price, prefs.currency)}</p>
            <p className="mt-1 text-[.6875rem] text-ink-400">{priceNote ?? 'per adult · incl. taxes'}</p>
            {it.seatsLeft <= 5 && <p className="mt-1 text-[.6875rem] font-semibold text-ember-600">Only {it.seatsLeft} seats left</p>}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setOpen((v) => !v)} iconRight={<ChevronDown size={14} className={cx('transition-transform', open && 'rotate-180')} />}>
              Details
            </Button>
            <Button size="sm" onClick={() => onSelect?.(it, fareId)}>
              Select
            </Button>
          </div>
        </div>
      </div>

      {/* fare strip */}
      {showFares && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line bg-mist-50/70 px-4 py-2.5 text-[.75rem] text-ink-600">
          <span className="flex items-center gap-1.5 font-medium text-navy-800">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> {fare.name}
          </span>
          <span className="flex items-center gap-1.5">
            <Luggage size={13} className={fare.checkedBags ? 'text-teal-600' : 'text-ink-300'} />
            {fare.checkedBags ? `${fare.checkedBags} × ${fare.bagKg} kg` : 'No checked bag'}
          </span>
          <span className="flex items-center gap-1.5">
            <Plane size={13} className="text-ink-400" /> {first.aircraft}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={13} className="text-ink-400" /> {fare.boarding}
          </span>
          {it.wifi && (
            <Tooltip label={it.wifi ? 'Nova Connect available' : 'No Wi-Fi on this aircraft'}>
              <span className="flex items-center gap-1.5">
                <Wifi size={13} className="text-teal-600" /> Wi-Fi
              </span>
            </Tooltip>
          )}
          {it.power && (
            <Tooltip label="Power and USB-C at every seat">
              <span className="flex items-center gap-1.5">
                <Usb size={13} className="text-teal-600" /> Power
              </span>
            </Tooltip>
          )}
          <span className="ml-auto flex items-center gap-1.5 text-ink-500">
            <Star size={13} className="fill-gold-500 text-gold-500" />
            {it.rating} · {it.ratingCount.toLocaleString()}
          </span>
        </div>
      )}

      {open && (
        <div className="border-t border-line bg-white p-4 animate-fade-in sm:p-5">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-ink-400">Itinerary</p>
              <ol className="mt-3 space-y-0">
                {it.segments.map((s, i) => (
                  <li key={s.flightNo + i} className="relative flex gap-4 pb-4 last:pb-0">
                    {i < it.segments.length - 1 && <span className="absolute left-[9px] top-5 h-full w-px bg-line" aria-hidden />}
                    <span className="mt-1.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-2 border-navy-800 bg-white">
                      <span className="h-[6px] w-[6px] rounded-full bg-navy-800" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-display text-[.9375rem] font-semibold text-navy-900">
                          {s.from} → {s.to}
                        </p>
                        <p className="num text-[.8125rem] text-ink-500">
                          {new Date(s.dep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} – {new Date(s.arr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {durationLabel(s.durationMin)}
                        </p>
                      </div>
                      <p className="mt-0.5 text-[.8125rem] text-ink-500">
                        {s.carrier} {s.flightNo} · {s.aircraft} · {s.seatMiles.toLocaleString()} km · {s.terminal} → gate {s.gate}
                      </p>
                      {i < it.segments.length - 1 && it.layoverMin && (
                        <p className="mt-1 inline-flex items-center gap-1.5 rounded-pill bg-gold-100 px-2 py-0.5 text-[.6875rem] font-semibold text-gold-600">
                          Layover {durationLabel(it.layoverMin)} in {s.to} · minimum connect {it.via === 'NBO' ? '60 min' : '75 min'}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-ink-400">What {fare.name} includes</p>
              <ul className="mt-3 space-y-2">
                {[
                  [fare.cabinBag, 'Cabin'],
                  [fare.checkedBags ? `${fare.checkedBags} × ${fare.bagKg} kg checked` : 'Checked bag not included', 'Hold'],
                  [fare.seatSelection, 'Seats'],
                  [fare.meals, 'Dining'],
                  [fare.wifi, 'Connectivity'],
                  [fare.changeable ? (fare.changeFee ? `Changes from $${fare.changeFee}` : 'Free changes') : 'No changes', 'Flexibility'],
                  [fare.refundable ? 'Refundable to travel wallet' : 'Not refundable', 'Refund'],
                  [fare.earn, 'Points'],
                ].map(([v, k]) => (
                  <li key={k} className="flex items-start gap-2.5 border-b border-line pb-2 last:border-0">
                    <span className="mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-700">
                      <Check size={11} strokeWidth={3} />
                    </span>
                    <span className="min-w-0 text-[.8125rem] leading-snug text-ink-600">
                      <span className="mr-1.5 font-display text-[.6875rem] font-semibold uppercase tracking-wide text-ink-400">{k}</span>
                      {v}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center gap-2 text-[.75rem] text-ink-400">
                <BatteryCharging size={14} className="text-teal-500" /> Seat pitch and width depend on the assigned aircraft — {first.aircraft}.
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
