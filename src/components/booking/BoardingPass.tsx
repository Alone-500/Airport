import { useMemo } from 'react';
import { Printer } from 'lucide-react';
import { cx, fmtDate, hash, rng } from '../../lib/utils';
import type { Booking } from '../../types';
import { Sunburst } from '../brand/Brand';
import { Button } from '../ui/Primitives';

/** Deterministic QR-like code built from the PNR (visually credible, not a real QR payload). */
function QrCode({ seed, size = 92 }: { seed: string; size?: number }) {
  const n = 25;
  const cells = useMemo(() => {
    const r = rng(hash(seed));
    const grid: boolean[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => r() > 0.52));
    const finder = (ox: number, oy: number) => {
      for (let y = 0; y < 7; y++)
        for (let x = 0; x < 7; x++) {
          const edge = x === 0 || y === 0 || x === 6 || y === 6;
          const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          grid[oy + y][ox + x] = edge || core;
        }
      for (let y = -1; y < 8; y++)
        for (let x = -1; x < 8; x++) {
          const gx = ox + x;
          const gy = oy + y;
          if (gx < 0 || gy < 0 || gx >= n || gy >= n) continue;
          if (x === -1 || y === -1 || x === 7 || y === 7) grid[gy][gx] = false;
        }
    };
    finder(0, 0);
    finder(n - 7, 0);
    finder(0, n - 7);
    for (let i = 8; i < n - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }
    return grid;
  }, [seed]);
  const step = size / n;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Boarding pass scan code" className="rounded-[6px] bg-white">
      {cells.map((row, y) =>
        row.map((on, x) =>
          on ? <rect key={`${x}-${y}`} x={x * step} y={y * step} width={step} height={step} fill="#071A2E" /> : null,
        ),
      )}
    </svg>
  );
}

function Barcode({ seed, className }: { seed: string; className?: string }) {
  const bars = useMemo(() => {
    const r = rng(hash(seed + 'bc'));
    return Array.from({ length: 58 }, () => 1 + Math.floor(r() * 3));
  }, [seed]);
  return (
    <div className={cx('flex h-12 items-stretch gap-[1.5px]', className)} aria-hidden>
      {bars.map((w, i) => (
        <span key={i} className="block bg-navy-900" style={{ width: `${w}px`, opacity: i % 4 === 0 ? 1 : 0.82 }} />
      ))}
    </div>
  );
}

export function BoardingPass({ booking, paxIndex = 0, className, stub = true }: { booking: Booking; paxIndex?: number; className?: string; stub?: boolean }) {
  const pax = booking.passengers[paxIndex] ?? booking.passengers[0];
  const seg = booking.itinerary.outbound.segments[0];
  const last = booking.itinerary.outbound.segments[booking.itinerary.outbound.segments.length - 1];
  const seat = pax?.seat ?? booking.services.seats[pax?.id ?? ''] ?? '12A';
  const group = booking.cabin === 'BUSINESS' ? '1' : booking.cabin === 'PREMIUM' ? '2' : '3';
  const seq = String(40 + paxIndex * 7).padStart(3, '0');
  const date = fmtDate(seg.dep, 'short');

  const Cell = ({ label, value, wide }: { label: string; value: string; wide?: boolean }) => (
    <div className={cx('min-w-0', wide && 'sm:col-span-2')}>
      <p className="text-[.5625rem] font-semibold uppercase tracking-[0.16em] text-ink-400">{label}</p>
      <p className="num truncate font-display text-[.9375rem] font-semibold text-navy-900">{value}</p>
    </div>
  );

  return (
    <div className={cx('print-block overflow-hidden rounded-[18px] bg-white shadow-lift ring-1 ring-line', className)}>
      <div className="flex flex-col sm:flex-row">
        <div className="relative flex-1 p-5">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#0B2340_0_58%,#0FA79A_58%_84%,#C99A3B_84%_100%)]" aria-hidden />
          <div className="flex items-start justify-between gap-4 pt-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-navy-800 text-gold-500">
                <Sunburst size={20} />
              </span>
              <div>
                <p className="font-display text-[.9375rem] font-bold leading-none text-navy-900">AeroNova Airways</p>
                <p className="mt-1 text-[.625rem] uppercase tracking-[0.22em] text-ink-400">Boarding pass · {booking.ref}</p>
              </div>
            </div>
            <span className="rounded-pill bg-teal-100 px-2 py-0.5 text-[.625rem] font-bold uppercase tracking-wider text-teal-900">
              {booking.checkedIn ? 'Checked in' : 'Ready'}
            </span>
          </div>

          <div className="mt-5 flex items-center gap-4">
            <div>
              <p className="num font-display text-[2rem] font-bold leading-none text-navy-900">{seg.from}</p>
              <p className="mt-1 text-[.6875rem] uppercase tracking-wide text-ink-400">{fmtDate(seg.dep, 'weekday')}</p>
            </div>
            <svg viewBox="0 0 120 26" className="h-6 flex-1 text-navy-800" fill="none" aria-hidden>
              <path d="M2 13h96" stroke="currentColor" strokeWidth="1.4" strokeDasharray="4 5" />
              <path d="M100 6l14 7-14 7 4-7z" fill="currentColor" />
            </svg>
            <div className="text-right">
              <p className="num font-display text-[2rem] font-bold leading-none text-navy-900">{last.to}</p>
              <p className="mt-1 text-[.6875rem] uppercase tracking-wide text-ink-400">{fmtDate(last.arr, 'weekday')}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-line pt-4 sm:grid-cols-4">
            <Cell label="Passenger" value={`${pax?.lastName?.toUpperCase()}, ${pax?.firstName}`} wide />
            <Cell label="From / to" value={`${seg.from} – ${last.to}`} />
            <Cell label="Flight" value={seg.flightNo} />
            <Cell label="Date" value={date} />
            <Cell label="Departs" value={new Date(seg.dep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} />
            <Cell label="Boarding" value={new Date(new Date(seg.dep).getTime() - 30 * 60000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} />
            <Cell label="Gate" value={seg.gate ?? 'TBA'} />
            <Cell label="Seat" value={seat} />
            <Cell label="Group" value={group} />
            <Cell label="Seq" value={seq} />
            <Cell label="Class" value={booking.fareId.slice(0, 1)} />
            <Cell label="Bags" value={String(booking.services.bags.length + (booking.cabin === 'BUSINESS' ? 3 : 1))} />
          </div>

          <div className="mt-4 flex items-end justify-between gap-4 border-t border-dashed border-line pt-3">
            <p className="max-w-[60%] text-[.6875rem] leading-snug text-ink-400">
              Non-transferable. Document verified at check-in. Arrival {fmtDate(last.arr, 'short')} · {new Date(last.arr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} local. Aircraft {seg.aircraft}.
            </p>
            <QrCode seed={`${booking.ref}-${pax?.id ?? 0}`} size={78} />
          </div>
        </div>

        {stub && (
          <div className="relative border-t border-dashed border-line sm:border-l sm:border-t-0">
            <span className="absolute -left-2 -top-2 hidden h-4 w-4 rounded-full bg-mist-50 ring-1 ring-line sm:block" aria-hidden />
            <span className="absolute -bottom-2 -left-2 hidden h-4 w-4 rounded-full bg-mist-50 ring-1 ring-line sm:block" aria-hidden />
            <div className="flex h-full flex-col justify-between gap-4 bg-mist-50/60 p-5 sm:w-[220px]">
              <div>
                <p className="text-[.5625rem] font-semibold uppercase tracking-[0.18em] text-ink-400">Stub · keep with bag tag</p>
                <p className="num mt-2 font-display text-[1.125rem] font-bold text-navy-900">
                  {seg.from}–{last.to}
                </p>
                <p className="text-[.75rem] text-ink-500">
                  {seg.flightNo} · {date} · Seat {seat}
                </p>
              </div>
              <Barcode seed={booking.ref + (pax?.id ?? '')} className="!h-10" />
              <p className="num text-[.625rem] tracking-[0.18em] text-ink-400">
                {booking.ref}
                {pax?.lastName ? `/${pax.lastName.toUpperCase()}` : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function BoardingPassActions({ fileName = 'aeronova-boarding-pass' }: { fileName?: string }) {
  return (
    <div className="no-print flex flex-wrap gap-2">
      <Button size="sm" variant="secondary" icon={<Printer size={15} />} onClick={() => window.print()}>
        Print
      </Button>
      <Button size="sm" variant="ghost" onClick={() => alert(`Saved as ${fileName}.pdf — demo download`)}>
        Save to phone
      </Button>
    </div>
  );
}
