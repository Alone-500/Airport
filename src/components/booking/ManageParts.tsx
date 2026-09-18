import { Check, Clock, Luggage, Plane, Utensils, Wifi } from 'lucide-react';
import { cx, durationLabel, fmtDate, money } from '../../lib/utils';
import type { Itinerary } from '../../types';
import { BAGGAGE_ITEMS, EXTRAS } from '../../data/fares';
import { Badge } from '../ui/Primitives';
import { useStore } from '../../store/store';

export function FlightRow({ it, label, fareName, detailed }: { it: Itinerary; label: string; fareName: string; detailed?: boolean }) {
  const { prefs } = useStore();
  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-mist-50/70 px-4 py-2.5">
        <p className="flex items-center gap-2 font-display text-[.875rem] font-semibold uppercase tracking-[0.08em] text-navy-900">
          <Plane size={15} className="text-teal-600" /> {label}
        </p>
        <p className="text-[.8125rem] text-ink-500">
          {fmtDate(it.segments[0].depDateLabel, 'long')} · {fareName} · {money(it.bestPrice, prefs.currency)} per adult
        </p>
      </div>
      <ol className="divide-y divide-line">
        {it.segments.map((s, i) => (
          <li key={s.flightNo + i} className="px-4 py-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-baseline gap-2">
                <span className="num font-display text-[1.375rem] font-semibold text-navy-900">{new Date(s.dep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-[.875rem] font-medium text-ink-700">
                  {s.from} {s.terminal ? `· ${s.terminal}` : ''}
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-ink-300">
                <span className="h-px w-8 bg-ink-200 sm:w-16" />
                <Plane size={13} />
                <span className="h-px w-8 bg-ink-200 sm:w-16" />
              </span>
              <div className="flex items-baseline gap-2">
                <span className="num font-display text-[1.375rem] font-semibold text-navy-900">{new Date(s.arr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-[.875rem] font-medium text-ink-700">
                  {s.to} {detailed ? `· belt ${1 + i}` : ''}
                </span>
              </div>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{s.carrier.split(' ')[0]} {s.flightNo}</Badge>
                <span className="num text-[.75rem] text-ink-500">{durationLabel(s.durationMin)}</span>
              </div>
            </div>
            {detailed && (
              <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 border-t border-line pt-3 text-[.8125rem] sm:grid-cols-5">
                {[
                  ['Aircraft', s.aircraft],
                  ['Registration', `9G-${['AIN', 'AKQ', 'AVL', 'ATC'][i % 4]}`],
                  ['Gate', s.gate ?? 'TBA'],
                  ['Distance', `${s.seatMiles.toLocaleString()} km`],
                  ['On-time history', `${82 + ((i * 7) % 14)}.${i}%`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[.6875rem] uppercase tracking-[0.1em] text-ink-400">{k}</dt>
                    <dd className="num font-medium text-navy-900">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        ))}
      </ol>
      {detailed && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-line bg-mist-50/60 px-4 py-3 text-[.8125rem] text-ink-600">
          <span className="flex items-center gap-1.5">
            <Luggage size={14} className="text-teal-600" /> 1 × 23 kg included
          </span>
          <span className="flex items-center gap-1.5">
            <Utensils size={14} className="text-teal-600" /> Hot meal service
          </span>
          <span className="flex items-center gap-1.5">
            <Wifi size={14} className="text-teal-600" /> Nova Connect from $9
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-ink-400" /> Boarding 30 min before · gate closes 10 min before
          </span>
        </div>
      )}
    </section>
  );
}

export function BaggagePicker({
  bags,
  extras,
  onToggle,
  paxCount = 1,
}: {
  bags: string[];
  extras: string[];
  onToggle: (kind: 'bags' | 'extras', id: string, on: boolean) => void;
  paxCount?: number;
}) {
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <div>
        <p className="mb-2 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-400">Add baggage</p>
        <ul className="space-y-2">
          {BAGGAGE_ITEMS.map((b) => {
            const on = bags.includes(b.id);
            return (
              <li key={b.id}>
                <button
                  onClick={() => onToggle('bags', b.id, !on)}
                  className={cx('flex w-full items-center gap-3 rounded-[12px] border p-3 text-left transition', on ? 'border-teal-500 bg-teal-50/60' : 'border-line hover:border-sky-300')}
                >
                  <span className={cx('grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border', on ? 'border-teal-600 bg-teal-500 text-white' : 'border-ink-300')}>{on && <Check size={12} strokeWidth={3} />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[.875rem] font-medium text-navy-900">{b.label}</span>
                    <span className="block text-[.75rem] text-ink-500">{b.note}</span>
                  </span>
                  <span className="num text-[.875rem] font-semibold text-navy-900">
                    {money(b.priceUSD * paxCount)}
                    {paxCount > 1 && <span className="block text-right text-[.625rem] font-normal text-ink-400">{paxCount} pax</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <p className="mb-2 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-400">Extras & meals</p>
        <ul className="space-y-2">
          {EXTRAS.filter((e) => e.kind !== 'seat').map((e) => {
            const on = extras.includes(e.id);
            return (
              <li key={e.id}>
                <button
                  onClick={() => onToggle('extras', e.id, !on)}
                  className={cx('flex w-full items-center gap-3 rounded-[12px] border p-3 text-left transition', on ? 'border-teal-500 bg-teal-50/60' : 'border-line hover:border-sky-300')}
                >
                  <span className={cx('grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border', on ? 'border-teal-600 bg-teal-500 text-white' : 'border-ink-300')}>{on && <Check size={12} strokeWidth={3} />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[.875rem] font-medium text-navy-900">{e.label}</span>
                    <span className="block text-[.75rem] text-ink-500">{e.note}</span>
                  </span>
                  <span className="num text-[.875rem] font-semibold text-navy-900">{e.priceUSD ? money(e.priceUSD) : 'Free'}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
