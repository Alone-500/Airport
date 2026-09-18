import type { Currency } from '../lib/utils';

export interface Offer {
  id: string;
  kind: 'flight' | 'weekend' | 'seasonal' | 'business' | 'family' | 'student';
  title: string;
  kicker: string;
  destination: string;
  city: string;
  code: string;
  from: string;
  priceUSD: number;
  wasUSD?: number;
  cabin: string;
  travelWindow: string;
  bookBy: string;
  conditions: string[];
  img: string;
  badge?: string;
  tone: 'navy' | 'teal' | 'ember' | 'gold' | 'sky';
}

export const OFFERS: Offer[] = [
  {
    id: 'ov-lag',
    kind: 'flight',
    title: 'Accra ⇄ Lagos from $179',
    kicker: 'The biggest trunk route in West Africa, priced for the week you actually travel.',
    destination: 'Lagos',
    city: 'Lagos',
    code: 'LOS',
    from: 'ACC',
    priceUSD: 179,
    wasUSD: 246,
    cabin: 'Economy Light, one way',
    travelWindow: '5 Jan – 28 Mar 2027',
    bookBy: '31 Dec 2026, 23:59 GMT',
    conditions: [
      'Excludes 18 Dec – 6 Jan and 20–30 Mar (peak)',
      'Economy Light includes a personal item only; bags from $30',
      'Changeable for $75 plus fare difference; not refundable',
      'Available on AN 102/106/110/114; sold on a per-flight basis',
    ],
    img: '/img/city-lagos.jpg',
    badge: 'Best seller',
    tone: 'navy',
  },
  {
    id: 'ov-lhr',
    kind: 'seasonal',
    title: 'London returns from $649 one way',
    kicker: 'Winter in Heathrow’s Terminal 2 — six daily frequencies and a lounge worth arriving early for.',
    destination: 'London',
    city: 'London',
    code: 'LHR',
    from: 'ACC',
    priceUSD: 649,
    wasUSD: 810,
    cabin: 'Economy Classic, one way',
    travelWindow: '12 Jan – 30 Apr 2027',
    bookBy: '21 Dec 2026',
    conditions: [
      'Includes 23 kg checked bag, seat selection and hot meal service',
      'UK visa holders only — allow 3 weeks for the appointment',
      'Not valid with 25 Dec – 3 Jan departures',
      'Upgrade to Nova Business from $610, subject to suite availability',
    ],
    img: '/img/city-london.jpg',
    badge: 'Long-haul',
    tone: 'sky',
  },
  {
    id: 'ov-wknd',
    kind: 'weekend',
    title: 'Weekend Escape: Zanzibar',
    kicker: 'Leave Friday 19:40, be on the sand by Saturday sunrise, home Sunday night.',
    destination: 'Zanzibar',
    city: 'Zanzibar',
    code: 'ZNZ',
    from: 'ACC',
    priceUSD: 468,
    wasUSD: 615,
    cabin: 'Economy Classic, return',
    travelWindow: 'Any Fri–Sun, Jan – Jun 2027',
    bookBy: 'Rolling — released each Monday at 06:00 GMT',
    conditions: [
      'Must include a Saturday night; minimum 2, maximum 4 days',
      'Applies to AN 372/376 with a Nairobi turn',
      'Two 23 kg bags included for the whole party',
      'Free cancellation up to 72 h before departure',
    ],
    img: '/img/dest-zanzibar.jpg',
    badge: 'Friday release',
    tone: 'teal',
  },
  {
    id: 'ov-biz',
    kind: 'business',
    title: 'Business Class: 40% off the Accra ⇄ Dubai bank',
    kicker: 'Lie-flat, lounge, and the fastest way onward to Asia in the same calendar day.',
    destination: 'Dubai',
    city: 'Dubai',
    code: 'DXB',
    from: 'ACC',
    priceUSD: 1740,
    wasUSD: 2900,
    cabin: 'Nova Business, one way',
    travelWindow: '4 Jan – 30 Jun 2027',
    bookBy: '15 Jan 2027',
    conditions: [
      'Suite with door on rows 1–2, subject to availability at booking',
      'Includes Galaxy Lounge, fast track, chauffeur transfer at ACC',
      'Fully refundable up to 4 h before departure',
      'Not combinable with corporate fares or travel-agent commission',
    ],
    img: '/img/city-dubai.jpg',
    badge: 'Lie-flat',
    tone: 'gold',
  },
  {
    id: 'ov-fam',
    kind: 'family',
    title: 'Children fly half fare to 12 destinations',
    kicker: 'Under-12s at 50% on every African route, plus free seats and free bags for the stroller.',
    destination: 'Nairobi',
    city: 'Nairobi',
    code: 'NBO',
    from: 'ACC',
    priceUSD: 120,
    cabin: 'Economy Classic, child one way',
    travelWindow: '1 Mar – 30 Nov 2027',
    bookBy: 'No deadline while seats last',
    conditions: [
      'Applies to ages 2–11 sharing an adult’s cabin',
      'Infants under 2 travel at 10% of the adult fare',
      'Two 23 kg bags, one stroller and one car seat checked free',
      'Kids’ Climb zone and family security lane at ACC, NBO and JNB',
    ],
    img: '/img/city-nairobi.jpg',
    badge: 'Family',
    tone: 'ember',
  },
  {
    id: 'ov-stu',
    kind: 'student',
    title: 'Student Fares: extra bag, real price',
    kicker: 'Verified students get 12% off, an extra 23 kg, and free date changes around exam season.',
    destination: 'Johannesburg',
    city: 'Johannesburg',
    code: 'JNB',
    from: 'ACC',
    priceUSD: 282,
    wasUSD: 319,
    cabin: 'Economy Classic, one way',
    travelWindow: 'Jan – Dec 2027 (academic year)',
    bookBy: 'Enrolment verified annually',
    conditions: [
      'Valid ISIC or institution email required at booking and check-in',
      'One free date change per sector, including after departure',
      'Extra 23 kg checked bag on top of the standard allowance',
      'Available on all AeroNova-operated African routes',
    ],
    img: '/img/city-johannesburg.jpg',
    badge: 'Verified ID',
    tone: 'navy',
  },
  {
    id: 'ov-mru',
    kind: 'flight',
    title: 'Mauritius: 7 nights, resort credit included',
    kicker: 'Book a full week and we put USD 200 of resort credit on your card before you fly.',
    destination: 'Mauritius',
    city: 'Port Louis',
    code: 'MRU',
    from: 'ACC',
    priceUSD: 892,
    wasUSD: 1105,
    cabin: 'Economy Flex, return',
    travelWindow: '1 May – 30 Sep 2027',
    bookBy: '28 Feb 2027',
    conditions: [
      'Minimum 5, maximum 14 nights; winter shoulder season',
      'Refundable to travel wallet; includes two bags and Wi-Fi',
      'Resort credit issued at check-in with partner hotels',
      'One free stopover in Johannesburg on the way out',
    ],
    img: '/img/dest-mauritius.jpg',
    tone: 'teal',
  },
  {
    id: 'ov-cpt',
    kind: 'seasonal',
    title: 'Cape Town winter: 2-for-1 lounge and attraction passes',
    kicker: 'Table Mountain in July is empty, cheap and beautiful. Bring a jacket.',
    destination: 'Cape Town',
    city: 'Cape Town',
    code: 'CPT',
    from: 'JNB',
    priceUSD: 158,
    cabin: 'Economy Classic, one way',
    travelWindow: '1 Jun – 31 Aug 2027',
    bookBy: '30 Jun 2027',
    conditions: [
      'Includes Zeitz MOCAA and Table Mountain cable car for two',
      'Two-for-one Galaxy Lounge access at JNB and CPT',
      'Excludes 19 Jun and 9 Aug public holiday weekends',
      'Free stopover up to 7 days on return via Johannesburg',
    ],
    img: '/img/city-capetown.jpg',
    badge: 'Seasonal',
    tone: 'sky',
  },
];

export const OFFER_FILTERS: { id: Offer['kind'] | 'all'; label: string }[] = [
  { id: 'all', label: 'All offers' },
  { id: 'flight', label: 'Flight deals' },
  { id: 'weekend', label: 'Weekend escapes' },
  { id: 'seasonal', label: 'Seasonal' },
  { id: 'business', label: 'Business class' },
  { id: 'family', label: 'Family' },
  { id: 'student', label: 'Student' },
];

/* ---------------------------- loyalty ---------------------------- */
export interface Tier {
  id: string;
  name: string;
  qualify: string;
  qualifyPoints: number;
  tagline: string;
  colour: string;
  benefits: string[];
  earnBonus: number;
  perks: { label: string; detail: string }[];
}

export const TIERS: Tier[] = [
  {
    id: 'explorer',
    name: 'Explorer',
    qualify: 'Join free',
    qualifyPoints: 0,
    tagline: 'Every seat earns. Every flight counts.',
    colour: 'sky',
    earnBonus: 0,
    benefits: [
      'Earn 1 point per USD on eligible fares',
      'Points valid 36 months, extendable by any earning flight',
      'Family Pool: link up to 5 members into one balance',
      'Birthday double points on your month',
    ],
    perks: [
      { label: 'Bag allowance', detail: 'Standard +1 free bag on long-haul' },
      { label: 'Seat selection', detail: 'Free standard seats from 24 h before' },
      { label: 'Lounge', detail: 'Discounted day passes, USD 58' },
    ],
  },
  {
    id: 'voyager',
    name: 'Voyager',
    qualify: '30,000 points or 20 sectors',
    qualifyPoints: 30000,
    tagline: 'The quiet perks start here.',
    colour: 'teal',
    earnBonus: 15,
    benefits: [
      '+15% tier bonus on all earning flights',
      'Two free extra-legroom seats per year',
      'Priority check-in row at all African stations',
      'One free same-day change per 12 months',
    ],
    perks: [
      { label: 'Bag allowance', detail: '+1 checked bag on every route' },
      { label: 'Seat selection', detail: 'Free at booking, standard + preferred' },
      { label: 'Lounge', detail: 'Two Galaxy passes per year' },
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    qualify: '60,000 points or 45 sectors',
    qualifyPoints: 60000,
    tagline: 'Fast-track lanes and no queues.',
    colour: 'gold',
    earnBonus: 40,
    benefits: [
      '+40% tier bonus and guaranteed Economy Flex seats',
      'Fast-track security at ACC, NBO, JNB, LHR, DXB',
      'Galaxy Lounge access with one guest',
      'Elite desk: 90-second answer, staffed 24/7 in Accra',
      'Confirmed upgrade certificates: four per year',
    ],
    perks: [
      { label: 'Bag allowance', detail: '+2 checked bags · 32 kg each' },
      { label: 'Seat selection', detail: 'Free Nova Space rows, all cabins' },
      { label: 'Lounge', detail: 'Galaxy Lounge + guest, all stations' },
    ],
  },
  {
    id: 'elite-plus',
    name: 'Elite Plus',
    qualify: '110,000 points or 80 sectors',
    qualifyPoints: 110000,
    tagline: 'The suite is not the upgrade — it is the default.',
    colour: 'ember',
    earnBonus: 80,
    benefits: [
      '+80% tier bonus and no award blackout dates',
      'Unlimited Business access when travelling with the airline',
      'Dedicated travel concierge on WhatsApp, 24/7',
      'Six annual suite upgrades, transferable to guests',
      'Status never drops during medical or bereavement leave',
    ],
    perks: [
      { label: 'Bag allowance', detail: '3 × 32 kg · sports equipment free' },
      { label: 'Seat selection', detail: 'Any suite, any time, including at gate' },
      { label: 'Lounge', detail: 'Galaxy + showers + nap room, two guests' },
    ],
  },
];

export const EARN_TABLE = [
  { action: 'Fly AeroNova Economy', points: '1 pt per USD', note: 'Light fare earns 50%' },
  { action: 'Fly Premium Economy', points: '1.5 pts per USD', note: 'Plus tier bonus' },
  { action: 'Fly Nova Business', points: '2.25 pts per USD', note: 'Long-haul double on Mon–Thu' },
  { action: 'Nova Visa Signature card', points: '3 pts per USD', note: 'On fuel, dining, and AeroNova fares' },
  { action: 'Partner hotels (48 properties)', points: '500–2,000 pts', note: 'Per qualifying night' },
  { action: 'Nova Car by EuropAfrica', points: '100 pts/day', note: 'Compact and above' },
  { action: 'Duty free in Galaxy terminal', points: '2 pts per USD', note: 'Scan at payment' },
  { action: 'Bank transfers (Ecobank, KCB)', points: '1 pt per USD 8', note: 'Capped 20k per quarter' },
];

export const REDEEM_TABLE = [
  { route: 'Accra ⇄ Lagos', economy: '12,000', business: '26,000', note: 'No blackout on AN 102–114' },
  { route: 'Accra ⇄ Nairobi', economy: '22,500', business: '48,000', note: 'Plus taxes from $68' },
  { route: 'Accra ⇄ Johannesburg', economy: '19,000', business: '42,000', note: 'Weekend surcharge waived for Elite' },
  { route: 'Accra ⇄ London', economy: '48,000', business: '105,000', note: 'Cash + Points from 24,000 + $240' },
  { route: 'Accra ⇄ New York', economy: '66,000', business: '148,000', note: 'Opens 330 days ahead to members' },
  { route: 'Any African city pair', economy: 'from 9,500', business: 'from 21,000', note: 'Fixed-partner fares' },
];

export const PARTNERS = [
  { name: 'Galaxy Alliance', kind: 'Airline', detail: 'Earn and burn on 21 partners including Blue Ibis, Gulf Meridian and Auric Air' },
  { name: 'Nova Visa Signature', kind: 'Finance', detail: '3 pts per USD, free checked bags for the family, airport transfer credit' },
  { name: 'Serene Hotels', kind: 'Hospitality', detail: '48 African properties; late checkout guaranteed at Elite and above' },
  { name: 'EuropAfrica', kind: 'Car rental', detail: 'Up to 25% off, one free additional driver, points on every rental day' },
  { name: 'MTN Roam', kind: 'Telecom', detail: 'Data bundles from USD 3, points on all airport SIM purchases' },
  { name: 'Accra Rally & Nairobi Marathon', kind: 'Sport', detail: 'Priority race entry, free excess baggage for kit' },
];

/* ---------------------------- currency ---------------------------- */
export const CURRENCIES: Currency[] = ['USD', 'GHS', 'NGN', 'KES', 'ZAR', 'EUR', 'GBP', 'AED'];
export const LANGUAGES = [
  { code: 'en', label: 'English', note: 'Africa & global' },
  { code: 'fr', label: 'Français', note: 'Afrique de l’Ouest' },
  { code: 'pt', label: 'Português', note: 'Angola & Moçambique' },
  { code: 'sw', label: 'Kiswahili', note: 'Afrika Mashariki' },
  { code: 'ar', label: 'العربية', note: 'الشرق الأوسط' },
];
