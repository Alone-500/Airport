import type { CabinId } from '../types';

export interface AircraftType {
  id: string;
  name: string;
  maker: string;
  family: string;
  img: string;
  capacity: number;
  rangeKm: number;
  cruise: number;
  wingspan: number;
  length: number;
  engines: string;
  firstFlight: string;
  delivered: number;
  config: string;
  cabins: Record<CabinId, { rows: string; pitch: string; width: string; layout: string; seats: number }>;
  features: string[];
  wifi: string;
  ife: string;
  power: string;
  notes: string;
  layoutSeed: string;
  onTime: number;
  bestFor: string;
}

export const FLEET: AircraftType[] = [
  {
    id: 'A320N',
    name: 'Airbus A320neo',
    maker: 'Airbus',
    family: 'single-aisle',
    img: '/img/fleet-a320neo.jpg',
    capacity: 156,
    rangeKm: 6300,
    cruise: 828,
    wingspan: 35.8,
    length: 37.57,
    engines: '2× Pratt & Whitney PW1133G (GTF)',
    firstFlight: '2014 · delivered to AeroNova 2021',
    delivered: 18,
    config: '12 Business / 144 Economy',
    cabins: {
      BUSINESS: { rows: '1–3', pitch: '38"', width: '20.1"', layout: '2-2 reverse herringbone-lite', seats: 12 },
      PREMIUM: { rows: '—', pitch: '—', width: '—', layout: 'Not fitted on this aircraft', seats: 0 },
      ECONOMY: { rows: '10–33', pitch: '31"', width: '18"', layout: '3-3 with slimline shell', seats: 144 },
    },
    features: [
      'Sharklets and GTF engines cut burn 19% per seat',
      'Latest-gen cabin air: 20% more fresh flow, 20% lower cabin altitude',
      'LED mood lighting tuned to the local sunrise at destination',
      'Two lavatories reserved for families at the rear galley',
    ],
    wifi: 'Nova Connect on 11 of 18 aircraft (rolling out by Q2)',
    ife: 'Stream-to-device Nova Play, 380+ hours',
    power: 'USB-C 45 W at every seat',
    notes:
      'The workhorse of our West and Central African network. Quiet enough that cabin crew use indoor voices at cruising level.',
    layoutSeed: 'A320',
    onTime: 88.4,
    bestFor: 'Short and medium-haul Africa (up to 4 h)',
  },
  {
    id: 'A321N',
    name: 'Airbus A321neo',
    maker: 'Airbus',
    family: 'single-aisle',
    img: '/img/fleet-a321neo.jpg',
    capacity: 192,
    rangeKm: 7400,
    cruise: 833,
    wingspan: 35.8,
    length: 44.51,
    engines: '2× CFM International LEAP-1A32',
    firstFlight: '2016 · delivered to AeroNova 2023',
    delivered: 9,
    config: '16 Business / 24 Premium / 152 Economy',
    cabins: {
      BUSINESS: { rows: '1–4', pitch: '40"', width: '20.6"', layout: '1-1 direct aisle', seats: 16 },
      PREMIUM: { rows: '10–14', pitch: '37"', width: '18.5"', layout: '2-3-2 with calf rest', seats: 24 },
      ECONOMY: { rows: '20–44', pitch: '31.5"', width: '18"', layout: '3-3 slimline', seats: 152 },
    },
    features: [
      'Our first single-aisle with a true Premium Economy cabin',
      'Extra-large overhead bins: two cabin bags per passenger',
      'Rear galley redesigned so no seat faces a service wall',
      'Transcontinental range — Accra to Nairobi non-stop with reserves',
    ],
    wifi: 'Nova Connect on all aircraft',
    ife: '10.6" 4K seatback on Business & Premium, stream-to-device elsewhere',
    power: 'USB-C 45 W + 110 V socket in Business and Premium',
    notes:
      'Bought for the long thin routes: high density, low unit cost, and still a proper three-cabin experience.',
    layoutSeed: 'A321',
    onTime: 90.1,
    bestFor: 'High-frequency trunk routes and thin long-haul',
  },
  {
    id: 'A339',
    name: 'Airbus A330-900neo',
    maker: 'Airbus',
    family: 'twin-aisle widebody',
    img: '/img/fleet-a330neo.jpg',
    capacity: 262,
    rangeKm: 13330,
    cruise: 877,
    wingspan: 64,
    length: 63.69,
    engines: '2× Rolls-Royce Trent 7000',
    firstFlight: '2017 · delivered to AeroNova 2022',
    delivered: 7,
    config: '30 Business (Angled-flat) / 21 Premium / 211 Economy',
    cabins: {
      BUSINESS: { rows: '1–6', pitch: 'Lie-flat 78"', width: '21"', layout: '1-2-1 direct aisle access', seats: 30 },
      PREMIUM: { rows: '10–13', pitch: '38"', width: '18.5"', layout: '2-3-2 cocoon shell', seats: 21 },
      ECONOMY: { rows: '20–48', pitch: '32"', width: '18"', layout: '3-3-3 Airspace', seats: 211 },
    },
    features: [
      'Airspace cabin: taller arching walls and 10% larger windows',
      'Lie-flat suites with closing doors on rows 1–2',
      'Nova Table dine-anytime service on all long-haul flights',
      'Onboard hydroponic herb wall for the galley (ACC & NBO rotations)',
      'Two Galaxy Showers and a quiet nap room between rows 12 and 20',
    ],
    wifi: 'Nova Connect Pro — Ka-band, 300 Mbps, video calls',
    ife: '17.3" 4K HDR seatback, noise-cancelling headsets in Business',
    power: 'USB-C 61 W + 110 V at every seat',
    notes:
      'The aircraft that built the brand. Seven of them carry half our international revenue, and every one wears the gold sunburst tail.',
    layoutSeed: 'A330',
    onTime: 86.7,
    bestFor: 'Europe, Middle East and the North American swing',
  },
  {
    id: 'B789',
    name: 'Boeing 787-9 Dreamliner',
    maker: 'Boeing',
    family: 'twin-aisle widebody',
    img: '/img/fleet-787-9.jpg',
    capacity: 244,
    rangeKm: 14630,
    cruise: 903,
    wingspan: 60.1,
    length: 62.81,
    engines: '2× GEnx-1B (or Trent 1000 TEN on 4 airframes)',
    firstFlight: '2013 · delivered to AeroNova 2024',
    delivered: 6,
    config: '36 Business (full-flat pod) / 24 Premium / 184 Economy',
    cabins: {
      BUSINESS: { rows: '1–9', pitch: 'Lie-flat 80"', width: '22"', layout: '1-2-1 reverse herringbone', seats: 36 },
      PREMIUM: { rows: '11–16', pitch: '38"', width: '19"', layout: '2-3-2 with side shell', seats: 24 },
      ECONOMY: { rows: '20–44', pitch: '32"', width: '18"', layout: '3-3-3 with 6-headrest', seats: 184 },
    },
    features: [
      'Composite fuselage: 6,000 ft cabin altitude at cruise — you land less tired',
      'Electrochromic dimming windows, four stages, no shades to fight over',
      'Smoothest ride in our fleet: active gust suppression on the wing',
      'Business pods with 1.4 m bed, side storage and a real drawer',
      'Largest duty-free and fragrance bar in the sky, aft galley',
    ],
    wifi: 'Nova Connect Pro — unlimited on Business & Premium',
    ife: '18.6" 4K HDR, Bluetooth pairing to your own headphones',
    power: 'USB-C 61 W + 110 V at every seat, wireless pad in rows 1–2',
    notes:
      'Our longest-range jet. It opened Accra–New York and Guangzhou in the same season, and carries the newest Nova Play hardware.',
    layoutSeed: '787',
    onTime: 91.2,
    bestFor: 'North America, Asia and premium overnight banks',
  },
];

export const aircraftById = (id: string) => FLEET.find((a) => a.id === id) ?? FLEET[2];
export const aircraftByName = (name: string) => FLEET.find((a) => a.name === name) ?? FLEET[2];

/** Which aircraft typically fly a route — used by the search engine. */
export const ROUTE_AIRCRAFT: Record<string, string[]> = {
  short: ['A320N', 'A321N'],
  medium: ['A321N', 'A339'],
  long: ['A339', 'B789'],
  ultra: ['B789'],
};
