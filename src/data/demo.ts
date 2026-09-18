import type { Booking } from '../types';
import { makePnr, toISODate, DAY, parseISODate } from '../lib/utils';
import { searchFlights } from './flights';

/** Builds the demo booking that Manage Booking / Check-in / Account are seeded with. */
export function makeDemoBooking(): Booking {
  const dep = toISODate(new Date(Date.now() + 3 * DAY));
  const ret = toISODate(new Date(parseISODate(dep).getTime() + 6 * DAY));
  const q = { tripType: 'round' as const, legs: [{ from: 'ACC', to: 'LOS', date: dep }], returnDate: ret, adults: 2, children: 1, infants: 0, cabin: 'ECONOMY' as const, promo: '' };
  const r = searchFlights(q);
  const outbound = r.outbound[1] ?? r.outbound[0];
  const inbound = r.inbound[0] ?? outbound;
  const base = ((outbound?.cabins.ECONOMY.CLASSIC ?? 239) + (inbound?.cabins.ECONOMY.CLASSIC ?? 239)) * 2 + Math.round(((outbound?.cabins.ECONOMY.CLASSIC ?? 239) + (inbound?.cabins.ECONOMY.CLASSIC ?? 239)) * 0.5);
  const taxes = Math.round(base * 0.082);
  const seats: Record<string, string> = { 'p1': '12A', 'p2': '12C', 'p3': '12F' };
  return {
    ref: 'ANV7X2K',
    createdAt: new Date(Date.now() - 9 * DAY).toISOString(),
    status: 'TICKETED',
    itinerary: { outbound, return: inbound },
    passengers: [
      { id: 'p1', salutation: 'Ms', firstName: 'Ama', lastName: 'Mensah', dob: '1988-04-12', gender: 'Female', nationality: 'Ghana', docType: 'Passport', docNumber: 'G02948811', docExpiry: '2030-11-02', email: 'ama.mensah@example.com', phone: '+233 24 551 0188', ffp: 'ANV-4471-8802', meal: 'VGML', seat: '12A', type: 'adult' },
      { id: 'p2', salutation: 'Mr', firstName: 'Kwabena', lastName: 'Mensah', dob: '1986-09-30', gender: 'Male', nationality: 'Ghana', docType: 'Passport', docNumber: 'G01884022', docExpiry: '2029-06-18', email: 'k.mensah@example.com', phone: '+233 20 447 2210', ffp: 'ANV-4471-8803', meal: 'none', seat: '12C', type: 'adult' },
      { id: 'p3', salutation: 'Miss', firstName: 'Naa', lastName: 'Mensah', dob: '2016-02-19', gender: 'Female', nationality: 'Ghana', docType: 'Passport', docNumber: 'G22110489', docExpiry: '2028-01-09', email: '', phone: '', meal: 'CHML', seat: '12F', type: 'child' },
    ],
    cabin: 'ECONOMY',
    fareId: 'CLASSIC',
    contact: { email: 'ama.mensah@example.com', phone: '+233 24 551 0188', country: 'Ghana' },
    services: {
      bags: [{ id: 'BAG23', label: 'Extra checked bag · 23 kg', priceUSD: 45, per: 'itinerary' }],
      extras: [
        { id: 'WIFI-FLIGHT', label: 'Nova Connect · full flight', priceUSD: 21, note: 'Both sectors' },
        { id: 'MEAL-CHILD', label: 'Child meal with activity tray', priceUSD: 8, note: 'Naa' },
      ],
      seats,
      seatFees: { p1: 0, p2: 0, p3: 0 },
    },
    totals: { base, taxes, services: 45 + 21 + 8, discount: 0, total: base + taxes + 74 },
    currency: 'USD',
    ownerEmail: 'ama.mensah@example.com',
    checkedIn: false,
    payment: { brand: 'visa', last4: '4417', auth: '482913', amount: base + taxes + 74 },
    progress: 62,
  };
}

export const DEMO_REF = 'ANV7X2K';
export const DEMO_LAST = 'Mensah';

/** A second, past trip so the account has history. */
export function makePastBookings(): Booking[] {
  const seeds = [
    { ref: 'ANK4P71', from: 'ACC', to: 'LHR', dep: -74, fare: 'FLEX', pax: 1, status: 'CONFIRMED' as const },
    { ref: 'ANQ9L4M', from: 'NBO', to: 'JNB', dep: -128, fare: 'CLASSIC', pax: 2, status: 'CONFIRMED' as const },
    { ref: 'ANB2T8S', from: 'ACC', to: 'DXB', dep: -196, fare: 'BUSINESS', pax: 1, status: 'CONFIRMED' as const },
  ];
  return seeds.map((s, i) => {
    const dep = toISODate(new Date(Date.now() + s.dep * DAY));
    const r = searchFlights({ tripType: 'oneway', legs: [{ from: s.from, to: s.to, date: dep }], returnDate: '', adults: s.pax, children: 0, infants: 0, cabin: s.fare === 'BUSINESS' ? 'BUSINESS' : 'ECONOMY', promo: '' });
    const it = r.outbound[i % Math.max(1, r.outbound.length)];
    const base = it?.cabins?.[s.fare === 'BUSINESS' ? 'BUSINESS' : 'ECONOMY']?.[s.fare] ?? 420;
    return {
      ref: s.ref,
      createdAt: new Date(Date.now() + (s.dep - 20) * DAY).toISOString(),
      status: s.status,
      itinerary: { outbound: it },
      passengers: [{ id: 'p1', salutation: 'Ms', firstName: 'Ama', lastName: 'Mensah', dob: '1988-04-12', gender: 'Female', nationality: 'Ghana', docType: 'Passport', docNumber: 'G02948811', docExpiry: '2030-11-02', email: 'ama.mensah@example.com', phone: '+233 24 551 0188', seat: '8C', type: 'adult', meal: 'VGML' }],
      cabin: s.fare === 'BUSINESS' ? 'BUSINESS' : 'ECONOMY',
      fareId: s.fare,
      contact: { email: 'ama.mensah@example.com', phone: '+233 24 551 0188', country: 'Ghana' },
      services: { bags: [], extras: [], seats: { p1: '8C' }, seatFees: {} },
      totals: { base, taxes: Math.round(base * 0.12), services: 0, discount: 0, total: Math.round(base * 1.12) },
      currency: 'USD',
      ownerEmail: 'ama.mensah@example.com',
      checkedIn: true,
      payment: { brand: 'visa', last4: '4417', auth: makePnr(1234).slice(0, 6), amount: base },
    } as Booking;
  });
}
