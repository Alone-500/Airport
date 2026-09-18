import type { CabinId, Itinerary, SearchQuery, Segment } from '../types';
import { BY_CODE, distanceKm } from './airports';
import { CARRIERS, FARES } from './fares';
import { hash, parseISODate, rng, toISODate } from '../lib/utils';

export const HUBS = ['ACC', 'NBO', 'JNB'];

/* ------------------------------------------------------------------ *
 * Deterministic network engine. Same route + date always yields the
 * same schedule and prices, so the demo behaves like a real GDS.
 * ------------------------------------------------------------------ */

export function flightCategory(km: number) {
  if (km < 1400) return 'short' as const;
  if (km < 4200) return 'medium' as const;
  if (km < 8200) return 'long' as const;
  return 'ultra' as const;
}

const AIRCRAFT_BY_CAT: Record<string, string[]> = {
  short: ['A320neo', 'A321neo'],
  medium: ['A321neo', 'A330-900neo'],
  long: ['A330-900neo', '787-9 Dreamliner'],
  ultra: ['787-9 Dreamliner'],
};

const DEP_TIMES: Record<string, number[]> = {
  short: [6 * 60 + 15, 8 * 60 + 45, 11 * 60 + 30, 14 * 60 + 20, 16 * 60 + 55, 19 * 60 + 40, 21 * 60 + 50],
  medium: [5 * 60 + 50, 9 * 60 + 10, 12 * 60 + 45, 15 * 60 + 40, 18 * 60 + 30, 22 * 60 + 15],
  long: [0 * 60 + 55, 8 * 60 + 25, 15 * 60 + 10, 23 * 60 + 45],
  ultra: [1 * 60 + 20, 22 * 60 + 40],
};

const TAILS = ['5Y', '9K', '2R', '8T', '4N', '7Q', '1L', '6V'];

export function utcOf(code: string) {
  return BY_CODE.get(code)?.utc ?? 0;
}

export function blockMinutes(km: number) {
  const cat = flightCategory(km);
  const cruise = cat === 'short' ? 700 : cat === 'medium' ? 800 : 860;
  const taxii = cat === 'short' ? 32 : 44;
  return Math.round(km / cruise + taxii / 60) * 60;
}

function demandFactor(from: string, to: string, dateISO: string) {
  const d = parseISODate(dateISO);
  const dow = d.getDay();
  let f = 1;
  if (dow === 5 || dow === 0) f += 0.11;
  if (dow === 2 || dow === 3) f -= 0.06;
  const m = d.getMonth() + 1;
  if (m === 12 || m === 7 || m === 8) f += 0.18;
  if (m === 4 || m === 5 || m === 9) f -= 0.09;
  if (m === 11 || m === 2) f -= 0.04;
  // business routes peak midweek, leisure routes at weekends
  const biz = ['LHR', 'JNB', 'DXB', 'FRA', 'IAD', 'JFK', 'CDG'].includes(to) || ['ACC', 'LHR'].includes(from);
  if (biz && (dow === 1 || dow === 2)) f += 0.05;
  const leisure = ['CPT', 'ZNZ', 'MRU', 'SEZ', 'VFA', 'DXB'].includes(to);
  if (leisure && (dow === 6 || dow === 0)) f += 0.08;
  const seed = rng(hash(from + to + dateISO + 'dem'));
  return Math.max(0.72, f + (seed() - 0.5) * 0.06);
}

function baseFare(km: number, from: string, to: string, dateISO: string, category = flightCategory(km)) {
  const perKm = category === 'short' ? 0.29 : category === 'medium' ? 0.175 : category === 'long' ? 0.128 : 0.116;
  const floor = category === 'short' ? 112 : category === 'medium' ? 188 : 388;
  let fare = floor + km * perKm;
  fare *= demandFactor(from, to, dateISO);
  const dep = new Date(
    Date.UTC(parseISODate(dateISO).getUTCFullYear(), parseISODate(dateISO).getUTCMonth(), parseISODate(dateISO).getUTCDate()),
  ).getTime();
  const daysOut = Math.max(1, Math.round((dep - Date.now()) / 86400000));
  if (daysOut <= 3) fare *= 1.46;
  else if (daysOut <= 7) fare *= 1.24;
  else if (daysOut <= 21) fare *= 1.07;
  else if (daysOut >= 90) fare *= 0.93;
  return Math.round(fare);
}

function mkSegments(
  flightNo: string,
  carrier: string,
  aircraft: string,
  from: string,
  mid: string | undefined,
  to: string,
  depDate: Date,
  depMinutes: number,
  kmTotal: number,
  seedRng: () => number,
): Segment[] {
  const legs: [string, string][] = mid ? [[from, mid], [mid, to]] : [[from, to]];
  const out: Segment[] = [];
  let cursor = new Date(depDate.getTime() + depMinutes * 60000);
  legs.forEach(([a, b], i) => {
    const km = i === 0 && mid ? Math.round(distanceKm(a, mid) * 0.94) : mid ? Math.round(distanceKm(mid, b) * 0.96) : kmTotal;
    const dur = blockMinutes(km);
    const dep = new Date(cursor.getTime() + (utcOf(a) - utcOf(from)) * 3600000);
    const arr = new Date(dep.getTime() + dur * 60000 + (utcOf(b) - utcOf(a)) * 3600000);
    const airports = BY_CODE.get(a);
    out.push({
      flightNo: i === 0 ? flightNo : `${flightNo.split(' ')[0]} ${Number(flightNo.split(' ')[1]) + 1}`,
      carrier,
      aircraft,
      from: a,
      to: b,
      dep: dep.toISOString(),
      arr: arr.toISOString(),
      depDateLabel: toISODate(dep),
      durationMin: dur,
      terminal: airports?.terminals[Math.floor(seedRng() * airports.terminals.length)],
      gate: `${['A', 'B', 'C', 'D'][Math.floor(seedRng() * 4)]}${1 + Math.floor(seedRng() * 26)}`,
      seatMiles: km,
    });
    cursor = new Date(arr.getTime() + (mid ? 62 + Math.floor(seedRng() * 46) : 0) * 60000);
  });

  return out;
}

export interface SearchResult {
  outbound: Itinerary[];
  inbound: Itinerary[];
  fromCity: string;
  toCity: string;
  routeKm: number;
  category: ReturnType<typeof flightCategory>;
  datePrices: { date: string; price: number }[];
  returnPrices: { date: string; price: number }[];
}

function buildDay(from: string, to: string, dateISO: string, cabin: CabinId, opts: { allowStops?: boolean; carriers?: string[] } = {}) {
  const km = distanceKm(from, to);
  const category = flightCategory(km);
  const direct = from === to ? 0 : Math.max(2, Math.min(6, category === 'short' ? 5 : category === 'medium' ? 4 : 3));
  const r = rng(hash(`${from}${to}${dateISO}`));
  const times = DEP_TIMES[category];
  const results: Itinerary[] = [];
  const carriers = opts.carriers ?? CARRIERS.map((c) => c.code);
  const fareBase = baseFare(km, from, to, dateISO, category);

  for (let i = 0; i < direct; i++) {
    const carrierCode = i < Math.ceil(direct * 0.72) ? 'AN' : carriers[1 + Math.floor(r() * Math.max(1, carriers.length - 1))];
    const carrier = CARRIERS.find((c) => c.code === carrierCode) ?? CARRIERS[0];
    const aircraftList = carrier.nova ? AIRCRAFT_BY_CAT[category] : AIRCRAFT_BY_CAT[category].slice(0, 1);
    const aircraft = aircraftList[Math.floor(r() * aircraftList.length)];
    const depMin = times[i % times.length] + Math.floor(r() * 26) - 12;
    const d = parseISODate(dateISO);
    const segments = mkSegments(
      `${carrier.code} ${100 + Math.floor(r() * 880)}`,
      carrier.name,
      aircraft,
      from,
      undefined,
      to,
      d,
      Math.max(0, depMin),
      km,
      r,
    );
    const totalMin = segments.reduce((s, x) => s + x.durationMin, 0);
    const seatsLeft = 1 + Math.floor(r() * 9);
    const price = Math.round(fareBase * (0.9 + r() * 0.26) * (carrier.nova ? 1 : 0.9));
    const cabins: Itinerary['cabins'] = {} as Itinerary['cabins'];
    (['ECONOMY', 'PREMIUM', 'BUSINESS'] as CabinId[]).forEach((c) => {
      const mult = c === 'ECONOMY' ? 1 : c === 'PREMIUM' ? 2.5 / 1.34 : 4.35 / 1.34;
      const map: Record<string, number> = {};
      FARES.filter((f) => f.cabin === c).forEach((f) => {
        const jitter = 0.97 + r() * 0.08;
        map[f.id] = Math.max(59, Math.round((price * mult * f.priceIndex * jitter) / 1) );
      });
      cabins[c] = map;
    });
    const first = segments[0];
    const last = segments[segments.length - 1];
    results.push({
      id: `${carrier.code}-${from}-${to}-${dateISO}-${i}`,
      direction: 'outbound',
      from,
      to,
      segments,
      stops: 0,
      totalMin,
      cabins,
      bestPrice: cabins[cabin].LIGHT ?? Math.min(...Object.values(cabins[cabin])),
      seatsLeft,
      wifi: carrier.nova ? category !== 'short' || r() > 0.35 : r() > 0.6,
      power: carrier.nova,
      rating: Math.round((3.9 + r() * 1.05) * 10) / 10,
      ratingCount: 40 + Math.floor(r() * 3200),
      refundable: cabin === 'BUSINESS' || r() > 0.6,
      bagsIncluded: cabin === 'ECONOMY' ? 0 : cabin === 'PREMIUM' ? 2 : 3,
      depEpoch: new Date(first.dep).getTime(),
      arrEpoch: new Date(last.arr).getTime(),
      isNova: carrier.nova,
      airlineCode: carrier.code,
    });
  }

  if (opts.allowStops !== false && category !== 'short') {
    // one-stop itineraries via hubs — useful for filters and thin routes
    const candidates = HUBS.filter((h) => h !== from && h !== to).concat(['DXB', 'ADD', 'DSS', 'IST', 'LAD']);
    for (const via of candidates.slice(0, 4)) {
      const leg1 = distanceKm(from, via);
      const leg2 = distanceKm(via, to);
      if (leg1 + leg2 > km * 2.1 || leg1 === 0 || leg2 === 0) continue;
      const lay = 52 + Math.floor(r() * 130);
      const carrier = CARRIERS[Math.floor(r() * (r() > 0.45 ? 1 : 3))];
      const aircraft = AIRCRAFT_BY_CAT[flightCategory(Math.max(leg1, leg2))][0];
      const segments = mkSegments(`${carrier.code} ${100 + Math.floor(r() * 880)}`, carrier.name, aircraft, from, via, to, parseISODate(dateISO), times[Math.floor(r() * times.length)], leg1 + leg2, r);
      if (segments.length < 2) continue;
      const totalMin = segments.reduce((s, x) => s + x.durationMin, 0) + lay;
      const price = Math.round(fareBase * (0.66 + r() * 0.2));
      const cabins = {} as Itinerary['cabins'];
      (['ECONOMY', 'PREMIUM', 'BUSINESS'] as CabinId[]).forEach((c) => {
        const mult = c === 'ECONOMY' ? 1 : c === 'PREMIUM' ? 1.86 : 3.24;
        const map: Record<string, number> = {};
        FARES.filter((f) => f.cabin === c).forEach((f) => {
          map[f.id] = Math.max(59, Math.round(price * mult * f.priceIndex));
        });
        cabins[c] = map;
      });
      results.push({
        id: `${carrier.code}-1${via}-${from}-${to}-${dateISO}`,
        direction: 'outbound',
        from,
        to,
        segments,
        stops: 1,
        via,
        layoverMin: lay,
        totalMin,
        cabins,
        bestPrice: cabins[cabin].LIGHT ?? Math.min(...Object.values(cabins[cabin])),
        seatsLeft: 2 + Math.floor(r() * 12),
        wifi: r() > 0.5,
        power: r() > 0.4,
        rating: Math.round((3.4 + r() * 1.2) * 10) / 10,
        ratingCount: 20 + Math.floor(r() * 900),
        refundable: false,
        bagsIncluded: 0,
        depEpoch: new Date(segments[0].dep).getTime(),
        arrEpoch: new Date(segments[segments.length - 1].arr).getTime(),
        isNova: carrier.nova,
        airlineCode: carrier.code,
      });
    }
  }
  return results.sort((a, b) => a.depEpoch - b.depEpoch);
}

export function searchFlights(q: SearchQuery): SearchResult {
  const leg = q.legs[0];
  const from = (leg.from || 'ACC').toUpperCase();
  const to = (leg.to || 'LOS').toUpperCase();
  const outbound = buildDay(from, to, leg.date, q.cabin, { allowStops: from === to ? false : true });
  const inbound =
    q.tripType === 'round' && q.returnDate && from !== to
      ? buildDay(to, from, q.returnDate, q.cabin, { allowStops: true }).map((x) => ({ ...x, direction: 'return' as const }))
      : [];

  const d0 = parseISODate(leg.date);
  const datePrices = Array.from({ length: 14 }, (_, i) => {
    const dd = new Date(d0.getTime() + (i - 3) * 86400000);
    const iso = toISODate(dd);
    const day = buildDay(from, to, iso, q.cabin, { allowStops: false });
    const price = day.length ? Math.min(...day.map((x) => x.bestPrice)) : 0;
    return { date: iso, price };
  });
  const returnPrices =
    q.tripType === 'round' && q.returnDate
      ? Array.from({ length: 14 }, (_, i) => {
          const dd = new Date(parseISODate(q.returnDate).getTime() + (i - 3) * 86400000);
          const iso = toISODate(dd);
          const day = buildDay(to, from, iso, q.cabin, { allowStops: false });
          return { date: iso, price: day.length ? Math.min(...day.map((x) => x.bestPrice)) : 0 };
        })
      : [];

  return {
    outbound,
    inbound,
    fromCity: from,
    toCity: to,
    routeKm: distanceKm(from, to),
    category: flightCategory(distanceKm(from, to)),
    datePrices,
    returnPrices,
  };
}

/** Cheapest fare across itineraries, used by the calendar & summary. */
export const cheapestOf = (list: Itinerary[]) => (list.length ? Math.min(...list.map((x) => x.bestPrice)) : 0);

export function priceOf(itin: Itinerary, cabin: CabinId, fareId: string) {
  const fares = itin.cabins[cabin];
  if (!fares) return 0;
  return fares[fareId] ?? Object.values(fares)[0] ?? 0;
}

/* ------------------------------------------------------------------ *
 * Live flight status board
 * ------------------------------------------------------------------ */

const STATUS_WEIGHTS = ['ON_TIME', 'ON_TIME', 'ON_TIME', 'BOARDING', 'DELAYED', 'DEPARTED', 'LANDED', 'ON_TIME', 'CANCELLED', 'ON_TIME'];

export function statusBoard(dateISO: string, focus?: string) {
  const list: import('../types').FlightStatusEntry[] = [];
  const codes = Object.keys(BY_CODE).filter((c) => c !== focus);
  const r = rng(hash(dateISO + (focus ?? '')));
  const pairs = new Set<string>();
  let guard = 0;
  while (list.length < 26 && guard++ < 400) {
    const from = focus && r() > 0.4 ? focus : codes[Math.floor(r() * codes.length)];
    const to = codes[Math.floor(r() * codes.length)];
    if (from === to || pairs.has(`${from}${to}`)) continue;
    pairs.add(`${from}${to}${dateISO}`);
    const km = distanceKm(from, to);
    const category = flightCategory(km);
    const times = DEP_TIMES[category];
    const depMin = times[Math.floor(r() * times.length)];
    const dur = blockMinutes(km);
    const today = parseISODate(dateISO);
    const schedDep = new Date(today.getTime() + depMin * 60000);
    const status = STATUS_WEIGHTS[Math.floor(r() * STATUS_WEIGHTS.length)] as import('../types').FlightStatusEntry['status'];
    const delayMin = status === 'DELAYED' ? 25 + Math.floor(r() * 150) : status === 'CANCELLED' ? 0 : Math.floor(r() * 9) - 4;
    const schedArr = new Date(schedDep.getTime() + dur * 60000);
    const carrier = CARRIERS[Math.floor(r() * (r() > 0.42 ? 1 : 3))];
    list.push({
      flightNo: `${carrier.code} ${100 + Math.floor(r() * 880)}`,
      carrier: carrier.name,
      origin: from,
      destination: to,
      originCity: BY_CODE.get(from)?.city ?? from,
      destCity: BY_CODE.get(to)?.city ?? to,
      schedDep: schedDep.toISOString(),
      estDep: new Date(schedDep.getTime() + Math.max(0, delayMin) * 60000).toISOString(),
      schedArr: schedArr.toISOString(),
      estArr: new Date(schedArr.getTime() + Math.max(0, delayMin) * 60000).toISOString(),
      status,
      gate: status === 'CANCELLED' ? '—' : `${['A', 'B', 'C', 'D'][Math.floor(r() * 4)]}${1 + Math.floor(r() * 26)}`,
      terminal: BY_CODE.get(from)?.terminals[0] ?? 'T1',
      aircraft: (carrier.nova ? AIRCRAFT_BY_CAT[category] : ['A320neo', 'B737-800', 'A350-900'])[Math.floor(r() * 3)],
      registration: `9G-${TAILS[Math.floor(r() * TAILS.length)]}${['A', 'N', 'X', 'Q'][Math.floor(r() * 4)]}`,
      distanceKm: km,
      loadFactor: 62 + Math.floor(r() * 36),
      delayMin: Math.max(0, delayMin),
    });
  }
  return list.sort((a, b) => a.schedDep.localeCompare(b.schedDep));
}

/** A single flight, looked up by number — powers the Flight Status page. */
export function trackFlight(flightNo: string, dateISO: string) {
  const clean = flightNo.toUpperCase().replace(/\s+/g, '');
  const all = statusBoard(dateISO);
  const found = all.find((f) => f.flightNo.replace(/\s+/g, '') === clean);
  if (found) return found;
  const r = rng(hash(clean + dateISO));
  const codes = Object.keys(BY_CODE);
  const from = codes[Math.floor(r() * codes.length)];
  let to = codes[Math.floor(r() * codes.length)];
  if (to === from) to = codes[(codes.indexOf(from) + 7) % codes.length];
  const km = distanceKm(from, to);
  const dur = blockMinutes(km);
  const today = parseISODate(dateISO);
  const depMin = 7 * 60 + Math.floor(r() * 700);
  const schedDep = new Date(today.getTime() + depMin * 60000);
  const schedArr = new Date(schedDep.getTime() + dur * 60000);
  const statusPool: import('../types').FlightStatusEntry['status'][] =
    depMin < 14 * 60 ? ['LANDED', 'ON_TIME', 'DEPARTED'] : depMin < 20 * 60 ? ['BOARDING', 'ON_TIME', 'DELAYED'] : ['ON_TIME', 'ON_TIME', 'DELAYED'];
  const status = statusPool[Math.floor(r() * statusPool.length)] ?? 'ON_TIME';
  const delayMin = status === 'DELAYED' ? 20 + Math.floor(r() * 90) : 0;
  return {
    flightNo: `${clean.slice(0, 2)} ${clean.slice(2)}`,
    carrier: CARRIERS.find((c) => c.code === clean.slice(0, 2))?.name ?? 'AeroNova Airways',
    origin: from,
    destination: to,
    originCity: BY_CODE.get(from)?.city ?? from,
    destCity: BY_CODE.get(to)?.city ?? to,
    schedDep: schedDep.toISOString(),
    estDep: new Date(schedDep.getTime() + delayMin * 60000).toISOString(),
    schedArr: schedArr.toISOString(),
    estArr: new Date(schedArr.getTime() + delayMin * 60000).toISOString(),
    status: status === ('SCHEDULED' as never) ? 'DEPARTED' : status,
    gate: `${['A', 'B', 'C'][Math.floor(r() * 3)]}${1 + Math.floor(r() * 22)}`,
    terminal: BY_CODE.get(from)?.terminals[0] ?? 'T1',
    aircraft: AIRCRAFT_BY_CAT[flightCategory(km)][0],
    registration: `9G-${TAILS[Math.floor(r() * TAILS.length)]}A`,
    distanceKm: km,
    loadFactor: 68 + Math.floor(r() * 29),
    delayMin,
  } as import('../types').FlightStatusEntry;
}
