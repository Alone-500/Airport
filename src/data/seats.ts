import { hash, rng } from '../lib/utils';
import type { CabinId } from '../types';

export interface SeatRow {
  num: number;
  seats: Seat[];
}
export interface Seat {
  id: string;
  row: number;
  col: string;
  state: 'available' | 'occupied' | 'premium' | 'exit' | 'selected' | 'blocked' | 'extra';
  priceUSD: number;
  window: boolean;
  aisle: boolean;
  feature?: string;
  cabin: CabinId;
}

export interface LayoutSpec {
  cabin: CabinId;
  rows: [number, number];
  letters: string[];
  pitch: string;
  recline: string;
  width: string;
  exitRows: number[];
  label: string;
}

export const LAYOUTS: Record<string, LayoutSpec[]> = {
  A320: [
    { cabin: 'BUSINESS', rows: [1, 4], letters: ['A', 'C', 'D', 'F'], pitch: '38"', recline: '6"', width: '20.1"', exitRows: [], label: 'Business · 2-2' },
    { cabin: 'ECONOMY', rows: [10, 30], letters: ['A', 'B', 'C', '—', 'D', 'E', 'F'], pitch: '31"', recline: '4"', width: '18"', exitRows: [16], label: 'Economy · 3-3' },
  ],
  A321: [
    { cabin: 'BUSINESS', rows: [1, 4], letters: ['A', 'C', 'D', 'F'], pitch: '40"', recline: '8"', width: '20.6"', exitRows: [], label: 'Business · 2-2' },
    { cabin: 'PREMIUM', rows: [10, 14], letters: ['A', 'C', '—', 'D', 'E', 'F'], pitch: '37"', recline: '6"', width: '18.5"', exitRows: [], label: 'Premium · 2-3-2' },
    { cabin: 'ECONOMY', rows: [20, 40], letters: ['A', 'B', 'C', '—', 'D', 'E', 'F'], pitch: '31.5"', recline: '4"', width: '18"', exitRows: [20, 21], label: 'Economy · 3-3' },
  ],
  A330: [
    { cabin: 'BUSINESS', rows: [1, 6], letters: ['A', 'C', 'H', 'K'], pitch: '78" flat', recline: 'Lie-flat', width: '21"', exitRows: [], label: 'Business suites · 1-2-1' },
    { cabin: 'PREMIUM', rows: [10, 13], letters: ['A', 'C', '—', 'D', 'E', 'F', '—', 'H', 'K'], pitch: '38"', recline: '6"', width: '18.5"', exitRows: [], label: 'Premium · 2-3-2' },
    { cabin: 'ECONOMY', rows: [20, 46], letters: ['A', 'B', 'C', '—', 'D', 'E', 'F', '—', 'G', 'H', 'J'], pitch: '32"', recline: '5"', width: '18"', exitRows: [25, 36], label: 'Economy · 3-3-3' },
  ],
  '787': [
    { cabin: 'BUSINESS', rows: [1, 9], letters: ['A', 'C', 'H', 'K'], pitch: '80" flat', recline: 'Lie-flat pod', width: '22"', exitRows: [], label: 'Business pods · 1-2-1' },
    { cabin: 'PREMIUM', rows: [11, 16], letters: ['A', 'C', '—', 'D', 'E', 'F', '—', 'H', 'K'], pitch: '38"', recline: '6"', width: '19"', exitRows: [11], label: 'Premium · 2-3-2' },
    { cabin: 'ECONOMY', rows: [20, 44], letters: ['A', 'B', 'C', '—', 'D', 'E', 'F', '—', 'G', 'H', 'J'], pitch: '32"', recline: '5"', width: '18"', exitRows: [21, 33], label: 'Economy · 3-3-3' },
  ],
};

export const layoutFor = (aircraft: string) => {
  const a = aircraft.toLowerCase();
  if (a.includes('320')) return 'A320';
  if (a.includes('321')) return 'A321';
  if (a.includes('330')) return 'A330';
  return '787';
};

export const SEAT_PRICE = { extra: 34, front: 22, exit: 39, windowPair: 16 };

/** Deterministic inventory so the same flight always shows the same map. */
export function buildSeatMap(aircraft: string, flightNo: string, cabin: CabinId, selected: string[]): SeatRow[] {
  const key = layoutFor(aircraft);
  const specs = LAYOUTS[key];
  const r = rng(hash(flightNo + 'seats'));
  const rows: SeatRow[] = [];
  specs.forEach((spec) => {
    for (let n = spec.rows[0]; n <= spec.rows[1]; n++) {
      const seats: Seat[] = [];
      const isExit = spec.exitRows.includes(n);
      spec.letters.forEach((col) => {
        if (col === '—') {
          seats.push({ id: `${n}-`, row: n, col: '—', state: 'blocked', priceUSD: 0, window: false, aisle: false, cabin: spec.cabin });
          return;
        }
        const window = col === spec.letters[0] || col === spec.letters[spec.letters.length - 1];
        const aisle = col === spec.letters[1] || col === spec.letters[spec.letters.length - 2];
        let state: Seat['state'] = 'available';
        let priceUSD = 0;
        let feature: string | undefined;
        const roll = r();
        const forwardRow = n - spec.rows[0];
        if (spec.cabin === 'BUSINESS') {
          state = roll < 0.34 ? 'occupied' : 'premium';
          feature = 'Lie-flat suite';
        } else if (isExit) {
          state = roll < 0.42 ? 'occupied' : 'exit';
          priceUSD = SEAT_PRICE.exit;
          feature = 'Extra legroom +13 cm · bulkhead storage';
        } else if (spec.cabin === 'PREMIUM') {
          state = roll < 0.3 ? 'occupied' : 'premium';
          priceUSD = roll < 0.3 ? 0 : SEAT_PRICE.front;
          feature = 'Calf rest · 6-way recline';
        } else if (forwardRow <= 2) {
          state = roll < 0.4 ? 'occupied' : 'extra';
          priceUSD = SEAT_PRICE.front;
          feature = 'Forward cabin · deplane first';
        } else if (roll < 0.3) {
          state = 'occupied';
        } else if (roll > 0.955) {
          state = 'blocked';
          feature = 'Crew rest / not for sale';
        }
        if (selected.includes(`${n}${col}`)) state = 'selected';
        seats.push({
          id: `${n}${col}`,
          row: n,
          col,
          state,
          priceUSD,
          window,
          aisle,
          feature,
          cabin: spec.cabin,
        });
      });
      rows.push({ num: n, seats });
    }
  });
  return rows.filter((x) => x.seats.some((s) => s.cabin === cabin));
}

export const seatLabel = (s: Seat) =>
  s.state === 'occupied'
    ? 'Occupied'
    : s.state === 'blocked'
      ? 'Not available'
      : s.state === 'selected'
        ? 'Selected'
        : s.priceUSD
          ? `Available · ${s.state === 'exit' ? 'extra legroom' : s.state === 'premium' ? 'premium' : 'preferred'} $${s.priceUSD}`
          : 'Available · no charge';
