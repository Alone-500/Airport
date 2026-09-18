import type { FareFamily } from '../types';

export const CARRIERS = [
  { code: 'AN', name: 'AeroNova Airways', short: 'AeroNova', nova: true },
  { code: 'BI', name: 'Blue Ibis Air', short: 'Blue Ibis', nova: false },
  { code: 'SA', name: 'Sahel Airways', short: 'Sahel', nova: false },
  { code: 'AU', name: 'Auric Air', short: 'Auric', nova: false },
  { code: 'GM', name: 'Gulf Meridian', short: 'Gulf Meridian', nova: false },
  { code: 'KC', name: 'Kirinyaga Coast', short: 'Kirinyaga', nova: false },
];

export const AIRLINE_OPTIONS = CARRIERS.map((c) => ({ code: c.code, label: c.name }));

export const isNova = (flightNo: string) => flightNo.startsWith('AN');

/** Fleet-wide seat inventories keyed by aircraft id. */
export const CABIN_LABEL: Record<string, string> = {
  ECONOMY: 'Economy',
  PREMIUM: 'Premium Economy',
  BUSINESS: 'Business',
};

export const CABIN_ORDER: ('BUSINESS' | 'PREMIUM' | 'ECONOMY')[] = ['BUSINESS', 'PREMIUM', 'ECONOMY'];

export const FARES: FareFamily[] = [
  {
    id: 'LIGHT',
    name: 'Economy Light',
    cabin: 'ECONOMY',
    priceIndex: 1,
    refundable: false,
    changeable: false,
    changeFee: 0,
    checkedBags: 0,
    bagKg: 0,
    cabinBag: '1 personal item (40×30×20 cm)',
    seatSelection: 'Seat assigned at check-in · standard fare to choose earlier',
    lounge: false,
    boarding: 'Group 5',
    meals: 'Buy-on-board Nova Pantry',
    wifi: 'Messaging free · 25 MB/day',
    earn: 'Explorer: 1,500 pts per long-haul sector',
    summary: 'The essentials, priced low. No checked bag, no changes.',
    perks: ['Priority waitlist', 'Full safety record', 'In-flight purchase menu'],
  },
  {
    id: 'CLASSIC',
    name: 'Economy Classic',
    cabin: 'ECONOMY',
    priceIndex: 1.34,
    refundable: false,
    changeable: true,
    changeFee: 75,
    checkedBags: 1,
    bagKg: 23,
    cabinBag: '1 cabin bag (8 kg) + personal item',
    seatSelection: 'Free standard seat selection',
    lounge: false,
    boarding: 'Group 3',
    meals: 'Complimentary hot meal & barista coffee',
    wifi: '1 hour Nova Connect included',
    earn: '2,000 pts + 10% tier bonus',
    summary: 'Our most booked fare: bag, seat and a proper meal.',
    perks: ['Change fee waived within 24 h of booking', 'Checked bag included', 'Seat selection included'],
  },
  {
    id: 'FLEX',
    name: 'Economy Flex',
    cabin: 'ECONOMY',
    priceIndex: 1.72,
    refundable: true,
    changeable: true,
    changeFee: 0,
    checkedBags: 2,
    bagKg: 23,
    cabinBag: '2 cabin bags (12 kg each)',
    seatSelection: 'Free, including extra legroom',
    lounge: false,
    boarding: 'Group 2 · fast-track security',
    meals: 'Hot meal, snack box on request, free Wi-Fi full flight',
    wifi: 'Unlimited Nova Connect',
    earn: '3,000 pts + 25% tier bonus',
    summary: 'Refundable to travel wallet, date changes free.',
    perks: ['Full refund as travel credit', 'Same-day changes at no cost', '2 checked bags', 'Fast-track lane'],
  },
  {
    id: 'PREMIUM',
    name: 'Premium Economy',
    cabin: 'PREMIUM',
    priceIndex: 2.5,
    refundable: true,
    changeable: true,
    changeFee: 0,
    checkedBags: 2,
    bagKg: 23,
    cabinBag: '2 cabin bags (12 kg each)',
    seatSelection: 'Free, all rows including forward cabin',
    lounge: false,
    boarding: 'Group 1 · dedicated line',
    meals: 'Two-course service on chinaware, sparkling option',
    wifi: 'Unlimited Nova Connect',
    earn: '4,500 pts + 50% tier bonus',
    summary: '38" pitch, 6-way recline, footrest and earlier boarding.',
    perks: ['Dedicated check-in row', 'Amenity kit & memory-foam pillow', 'Priority baggage tags'],
  },
  {
    id: 'BUSINESS',
    name: 'Nova Business',
    cabin: 'BUSINESS',
    priceIndex: 4.35,
    refundable: true,
    changeable: true,
    changeFee: 0,
    checkedBags: 3,
    bagKg: 32,
    cabinBag: '2 cabin bags (12 kg each)',
    seatSelection: 'Any suite, at booking, on all aircraft',
    lounge: true,
    boarding: 'Group 1 · lounge-to-seat escort at ACC & NBO',
    meals: 'À la carte dining any time, reserve a Nova Table meal pre-departure',
    wifi: 'Unlimited Nova Connect Pro (streaming)',
    earn: '7,500 pts + 100% tier bonus',
    summary: 'Lie-flat or angled-flat suite, Galaxy Lounge, fast track both ends.',
    perks: ['Galaxy Lounge + showers', 'Dedicated transfer at hub', 'Premium bedding by Lumen & Thread'],
  },
];

export const fareById = (id: string) => FARES.find((f) => f.id === id) ?? FARES[1];

export const FARES_FOR_CABIN = (cabin: string) => FARES.filter((f) => f.cabin === cabin);

/** Ancillaries offered in booking step 4/5 and in Manage Booking. */
export const BAGGAGE_ITEMS = [
  { id: 'BAG23', label: 'Extra checked bag · 23 kg', priceUSD: 45, per: 'passenger' as const, note: 'Pre-pay saves 35% vs airport rate' },
  { id: 'BAG32', label: 'Heavy bag · 32 kg', priceUSD: 78, per: 'passenger' as const, note: 'Single piece up to 32 kg' },
  { id: 'SPORT', label: 'Sports equipment', priceUSD: 60, per: 'passenger' as const, note: 'Bikes, surfboards, skis — crated' },
  { id: 'INSTR', label: 'Extra seat for instrument', priceUSD: 120, per: 'itinerary' as const, note: 'Cabin seat for a cello or similar' },
  { id: 'OVER', label: 'Oversize handling', priceUSD: 95, per: 'passenger' as const, note: 'Any piece over 158 cm total' },
];

export const EXTRAS = [
  { id: 'MEAL-VEG', label: 'Vegetarian / vegan meal', priceUSD: 0, note: 'Ordered free up to 24 h before departure', kind: 'meal' },
  { id: 'MEAL-KOSHER', label: 'Kosher meal (KOSM)', priceUSD: 0, note: 'Requires 48 h notice', kind: 'meal' },
  { id: 'MEAL-CHILD', label: 'Child meal with activity tray', priceUSD: 8, note: 'Ages 2–11', kind: 'meal' },
  { id: 'MEAL-CHEF', label: 'Nova Table chef selection', priceUSD: 34, note: 'Curated four-course, business only', kind: 'meal' },
  { id: 'WIFI-1H', label: 'Nova Connect · 1 hour', priceUSD: 9, note: 'Browsing and messaging', kind: 'wifi' },
  { id: 'WIFI-FLIGHT', label: 'Nova Connect · full flight', priceUSD: 21, note: 'Streaming, calls and 1 GB cloud', kind: 'wifi' },
  { id: 'LOUNGE', label: 'Galaxy Lounge day pass', priceUSD: 58, note: 'Includes shower suites & buffet', kind: 'lounge' },
  { id: 'LOUNGE-FAM', label: 'Galaxy Lounge · family pass (4)', priceUSD: 175, note: 'Kids’ Climb zone open till 21:00', kind: 'lounge' },
  { id: 'FAST', label: 'Priority boarding & fast track', priceUSD: 24, note: 'Group 1 and security lane at both ends', kind: 'service' },
  { id: 'INSURE', label: 'Nova Cover travel insurance', priceUSD: 42, note: 'Trip cancellation, medical, 3× delay cover', kind: 'insurance' },
  { id: 'INSURE-PLUS', label: 'Nova Cover Plus (adventure sports)', priceUSD: 71, note: 'Adds altitude & equipment protection', kind: 'insurance' },
  { id: 'LEGROOM', label: 'Nova Space · extra legroom row', priceUSD: 39, note: 'Exit row or forward bulkhead, +13 cm', kind: 'seat' },
  { id: 'SEAT-WINDOW', label: 'Guaranteed window pair', priceUSD: 18, note: 'Reserved for you at check-in too', kind: 'seat' },
  { id: 'BASSINET', label: 'Bassinet & infant kit', priceUSD: 0, note: 'For infants under 11 kg', kind: 'family' },
  { id: 'TRANSFER', label: 'Hub arrival transfer (chauffeured)', priceUSD: 46, note: 'Business only, ACC & NBO', kind: 'service' },
];

export const SEAT_PRICES = { standard: 0, extra: 39, front: 22, exit: 34, suite: 0 };

export const TAX_NOTES = {
  Africa: { rate: 0.082, label: 'Passenger service charge, VAT & airport levy' },
  Europe: { rate: 0.146, label: 'Departure tax, aviation duty & EU levies' },
  'Middle East': { rate: 0.061, label: 'GCT, departure & navigation fees' },
  Asia: { rate: 0.098, label: 'Fuel surcharge recovery & state taxes' },
  'North America': { rate: 0.118, label: 'US APHIS, TSA & international fees' },
  'South America': { rate: 0.131, label: 'Embarkation tax & CONDEC' },
};
