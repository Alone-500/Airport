import type { Airport } from '../types';

const mk = (a: Partial<Airport> & Pick<Airport, 'code' | 'city' | 'country' | 'region' | 'name'>): Airport => ({
  tz: 'GMT',
  utc: 0,
  terminals: ['T1'],
  counters: 'Departures level, rows A–H',
  gates: 18,
  lounges: ['AeroNova Galaxy Lounge'],
  transitMin: 60,
  opening: '24 hours',
  security: 'Standard screening;Smart lanes at T1',
  parking: [
    { label: 'Short stay', price: 'per 30 min' },
    { label: 'Long stay', price: 'per day' },
  ],
  transport: [
    { mode: 'Metro / rail', detail: 'Direct line to city centre', time: '28 min' },
    { mode: 'Taxi', detail: 'Metered ranks outside arrivals', time: '20–45 min' },
    { mode: 'Shuttle', detail: 'Hourly hotel connector', time: '40 min' },
  ],
  facilities: ['Currency exchange', 'Duty free', 'Prayer room', 'Nursing rooms', 'Medical centre', 'Sleep pods'],
  blurb: 'AeroNova serves this airport with daily departures from the Galaxy terminal.',
  ...a,
});

export const AIRPORTS: Airport[] = [
  mk({
    code: 'ACC',
    city: 'Accra',
    country: 'Ghana',
    region: 'Africa',
    name: 'Kotoka International Airport',
    hub: true,
    tz: 'GMT',
    utc: 0,
    terminals: ['Galaxy T1', 'Regional T2'],
    counters: 'Galaxy T1, departures level, rows A–L (112 benches)',
    gates: 24,
    lounges: ['AeroNova Galaxy Lounge', 'Nova Business Suite', 'Plaza Premium (partner)'],
    transitMin: 45,
    security: 'BI scanners in Galaxy T1; average wait 6 min at off-peak',
    parking: [
      { label: 'Short stay', price: 'GH₵ 12 / 30 min' },
      { label: 'Hourly', price: 'GH₵ 25' },
      { label: 'Valet Galaxy', price: 'GH₵ 90 / day' },
    ],
    transport: [
      { mode: 'NovaRail Link', detail: 'Terminal 1 to Kwame Nkrumah Circle', time: '22 min' },
      { mode: 'Ride hailing', detail: 'Designated bay, departures level door 4', time: '15–50 min' },
      { mode: 'City coach', detail: 'Line 342 every 20 min', time: '35 min' },
    ],
    facilities: ['Galaxy Lounge', 'Fast track lane', 'Chapel & prayer room', 'Climb & play zone', 'Free Wi-Fi 60 min', 'Simulated-flight gallery', 'Hydroponic garden (T1 mezzanine)'],
    blurb:
      'AeroNova’s primary hub. The Galaxy terminal was designed around a single idea: land, connect and depart without ever feeling rushed. 92% of connecting passengers clear transit in under 30 minutes.',
  }),
  mk({ code: 'NBO', city: 'Nairobi', country: 'Kenya', region: 'Africa', name: 'Jomo Kenyatta International Airport', hub: true, utc: 3, tz: 'EAT', terminals: ['Terminal 1E', 'Galaxy Concourse C'], counters: 'T1E, rows 12–22', gates: 22, transitMin: 60, blurb: 'East African hub with the widest AeroNova frequency schedule on the continent.' }),
  mk({ code: 'JNB', city: 'Johannesburg', country: 'South Africa', region: 'Africa', name: 'O.R. Tambo International', utc: 2, tz: 'SAST', terminals: ['Terminal A', 'Terminal B'], gates: 28, transitMin: 75, counters: 'Terminal A, rows A1–F12', blurb: 'Southern African gateway and the airline’s overnight heavy-lift base.' }),
  mk({ code: 'CPT', city: 'Cape Town', country: 'South Africa', region: 'Africa', name: 'Cape Town International', utc: 2, tz: 'SAST', gates: 16, transitMin: 60, counters: 'Departures level, rows B–E' }),
  mk({ code: 'LOS', city: 'Lagos', country: 'Nigeria', region: 'Africa', name: 'Murtala Muhammed International', utc: 1, tz: 'WAT', terminals: ['Domestic', 'International FIDS'], gates: 20, transitMin: 90, counters: 'International terminal, rows 4–16' }),
  mk({ code: 'KGL', city: 'Kigali', country: 'Rwanda', region: 'Africa', name: 'Kigali International', utc: 2, tz: 'CAT', gates: 9, transitMin: 45 }),
  mk({ code: 'EBB', city: 'Entebbe', country: 'Uganda', region: 'Africa', name: 'Entebbe International', utc: 3, tz: 'EAT', gates: 8, transitMin: 60 }),
  mk({ code: 'DSS', city: 'Dakar', country: 'Senegal', region: 'Africa', name: 'Blaise Diagne International', utc: 0, tz: 'GMT', gates: 10, transitMin: 50 }),
  mk({ code: 'ABJ', city: 'Abidjan', country: "Côte d'Ivoire", region: 'Africa', name: 'Félix Houphouët-Boigny', utc: 0, tz: 'GMT', gates: 12, transitMin: 60 }),
  mk({ code: 'DLA', city: 'Douala', country: 'Cameroon', region: 'Africa', name: 'Douala International', utc: 1, tz: 'WAT', gates: 7, transitMin: 60 }),
  mk({ code: 'LAD', city: 'Luanda', country: 'Angola', region: 'Africa', name: 'Quatro de Fevereiro', utc: 1, tz: 'WAT', gates: 11, transitMin: 70 }),
  mk({ code: 'MPM', city: 'Maputo', country: 'Mozambique', region: 'Africa', name: 'Maputo International', utc: 2, tz: 'CAT', gates: 6, transitMin: 60 }),
  mk({ code: 'VFA', city: 'Victoria Falls', country: 'Zimbabwe', region: 'Africa', name: 'Victoria Falls Airport', utc: 2, tz: 'CAT', gates: 4, transitMin: 40 }),
  mk({ code: 'JRO', city: 'Kilimanjaro', country: 'Tanzania', region: 'Africa', name: 'Kilimanjaro International', utc: 3, tz: 'EAT', gates: 6, transitMin: 55 }),
  mk({ code: 'ZNZ', city: 'Zanzibar', country: 'Tanzania', region: 'Africa', name: 'Abeid Amani Karume Intl', utc: 3, tz: 'EAT', gates: 5, transitMin: 50 }),
  mk({ code: 'MRU', city: 'Port Louis', country: 'Mauritius', region: 'Africa', name: 'Sir Seewoosagur Ramgoolam', utc: 4, tz: 'MUT', gates: 8, transitMin: 55 }),
  mk({ code: 'SEZ', city: 'Victoria', country: 'Seychelles', region: 'Africa', name: 'Seychelles International', utc: 4, tz: 'SCT', gates: 5, transitMin: 50 }),
  mk({ code: 'ADD', city: 'Addis Ababa', country: 'Ethiopia', region: 'Africa', name: 'Bole International', utc: 3, tz: 'EAT', gates: 18, transitMin: 70 }),
  mk({ code: 'CAI', city: 'Cairo', country: 'Egypt', region: 'Africa', name: 'Cairo International', utc: 2, tz: 'EET', gates: 24, transitMin: 75 }),
  mk({ code: 'CMN', city: 'Casablanca', country: 'Morocco', region: 'Africa', name: 'Mohammed V International', utc: 1, tz: 'WEST', gates: 16, transitMin: 70 }),
  mk({ code: 'RAK', city: 'Marrakech', country: 'Morocco', region: 'Africa', name: 'Marrakech Menara', utc: 1, tz: 'WEST', gates: 10, transitMin: 60 }),
  mk({ code: 'TUN', city: 'Tunis', country: 'Tunisia', region: 'Africa', name: 'Tunis–Carthage', utc: 1, tz: 'CET', gates: 12, transitMin: 65 }),
  mk({ code: 'WDH', city: 'Windhoek', country: 'Namibia', region: 'Africa', name: 'Hosea Kutako International', utc: 2, tz: 'CAT', gates: 5, transitMin: 55 }),
  mk({ code: 'HRE', city: 'Harare', country: 'Zimbabwe', region: 'Africa', name: 'Robert Gabriel Mugabe Intl', utc: 2, tz: 'CAT', gates: 7, transitMin: 60 }),
  mk({ code: 'PHC', city: 'Port Harcourt', country: 'Nigeria', region: 'Africa', name: 'Port Harcourt International', utc: 1, tz: 'WAT', gates: 6, transitMin: 70 }),
  mk({ code: 'LHR', city: 'London', country: 'United Kingdom', region: 'Europe', name: 'Heathrow Airport', utc: 1, tz: 'BST', terminals: ['Terminal 2 (Star)', 'Terminal 5 partner'], gates: 30, transitMin: 90, counters: 'T2, rows 380–412 (shared desk with Blue Ibis)', lounges: ['AeroNova Galaxy Lounge T2', 'Emirates Skywards partner access'], blurb: 'AeroNova’s first long-haul route outside Africa and still its highest-yielding lane.' }),
  mk({ code: 'CDG', city: 'Paris', country: 'France', region: 'Europe', name: 'Charles de Gaulle', utc: 2, tz: 'CEST', terminals: ['Terminal 2E'], gates: 22, transitMin: 80 }),
  mk({ code: 'FRA', city: 'Frankfurt', country: 'Germany', region: 'Europe', name: 'Frankfurt Airport', utc: 2, tz: 'CEST', gates: 26, transitMin: 75 }),
  mk({ code: 'LIS', city: 'Lisbon', country: 'Portugal', region: 'Europe', name: 'Humberto Delgado Airport', utc: 1, tz: 'WEST', gates: 14, transitMin: 70 }),
  mk({ code: 'IST', city: 'Istanbul', country: 'Türkiye', region: 'Europe', name: 'Istanbul Airport', utc: 3, tz: '+03', gates: 32, transitMin: 70 }),
  mk({ code: 'DXB', city: 'Dubai', country: 'UAE', region: 'Middle East', name: 'Dubai International', utc: 4, tz: 'GST', terminals: ['T3', 'T2'], gates: 30, transitMin: 60, blurb: 'Overnight bank flights connect AeroNova passengers to 26 Asian destinations.' }),
  mk({ code: 'DOH', city: 'Doha', country: 'Qatar', region: 'Middle East', name: 'Hamad International', utc: 3, tz: '+03', gates: 28, transitMin: 55 }),
  mk({ code: 'JED', city: 'Jeddah', country: 'Saudi Arabia', region: 'Middle East', name: 'King Abdulaziz Intl', utc: 3, tz: '+03', gates: 18, transitMin: 65 }),
  mk({ code: 'BOM', city: 'Mumbai', country: 'India', region: 'Asia', name: 'Chhatrapati Shivaji Maharaj', utc: 5.5, tz: 'IST', gates: 20, transitMin: 80 }),
  mk({ code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', region: 'Asia', name: 'KL International', utc: 8, tz: '+08', gates: 22, transitMin: 70 }),
  mk({ code: 'CAN', city: 'Guangzhou', country: 'China', region: 'Asia', name: 'Baiyun International', utc: 8, tz: '+08', gates: 26, transitMin: 80 }),
  mk({ code: 'JFK', city: 'New York', country: 'United States', region: 'North America', name: 'John F. Kennedy International', utc: -4, tz: 'EDT', terminals: ['Terminal 4'], gates: 24, transitMin: 100, blurb: 'Four weekly non-stops from Accra land in New York before the afternoon bank.' }),
  mk({ code: 'IAD', city: 'Washington D.C.', country: 'United States', region: 'North America', name: 'Dulles International', utc: -4, tz: 'EDT', gates: 20, transitMin: 90 }),
  mk({ code: 'ATL', city: 'Atlanta', country: 'United States', region: 'North America', name: 'Hartsfield–Jackson', utc: -4, tz: 'EDT', gates: 34, transitMin: 90 }),
  mk({ code: 'YYZ', city: 'Toronto', country: 'Canada', region: 'North America', name: 'Pearson International', utc: -4, tz: 'EDT', gates: 22, transitMin: 95 }),
  mk({ code: 'GIG', city: 'Rio de Janeiro', country: 'Brazil', region: 'South America', name: 'Galeão International', utc: -3, tz: 'BRT', gates: 18, transitMin: 85 }),
];

export const BY_CODE = new Map(AIRPORTS.map((a) => [a.code, a]));

export const cityOf = (code: string) => BY_CODE.get(code)?.city ?? code;
export const airportName = (code: string) => BY_CODE.get(code)?.name ?? 'Airport';
export const countryOf = (code: string) => BY_CODE.get(code)?.country ?? '';

/** Haversine-ish great-circle distance in km, rounded — drives durations & mileage. */
const COORDS: Record<string, [number, number]> = {
  ACC: [5.605, -0.169], NBO: [-1.319, 36.928], JNB: [-26.137, 28.241], CPT: [-33.97, 18.602],
  LOS: [6.577, 3.321], KGL: [-1.969, 30.139], EBB: [0.042, 32.443], DSS: [14.74, -17.49],
  ABJ: [5.262, -3.926], DLA: [4.006, 9.718], LAD: [-8.858, 13.232], MPM: [-25.921, 32.573],
  VFA: [-17.932, 25.855], JRO: [-3.077, 37.071], ZNZ: [-6.22, 39.225], MRU: [-20.0, 57.683],
  SEZ: [-4.674, 55.522], ADD: [8.978, 38.799], CAI: [30.122, 31.406], CMN: [33.367, -7.59],
  RAK: [31.607, -8.036], TUN: [36.851, 10.227], WDH: [-22.46, 17.459], HRE: [-17.918, 31.099],
  PHC: [5.006, 6.945], LHR: [51.47, -0.454], CDG: [49.01, 2.55], FRA: [50.03, 8.56],
  LIS: [38.774, -9.135], IST: [41.26, 28.742], DXB: [25.253, 55.364], DOH: [25.273, 51.608],
  JED: [21.679, 39.166], BOM: [19.089, 72.868], KUL: [2.746, 101.707], CAN: [23.392, 113.299],
  JFK: [40.64, -73.779], IAD: [38.944, -77.455], ATL: [33.64, -84.428], YYZ: [43.678, -79.635],
  GIG: [-20.524, -43.581],
};

export function distanceKm(a: string, b: string) {
  const p = COORDS[a];
  const q = COORDS[b];
  if (!p || !q) return 1200;
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(q[0] - p[0]);
  const dLng = toRad(q[1] - p[1]);
  const lat1 = toRad(p[0]);
  const lat2 = toRad(q[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) / 5) * 5;
}

export const hasAirport = (code: string) => BY_CODE.has(code.toUpperCase());

export const SEARCHABLE = AIRPORTS.map((a) => ({
  code: a.code,
  city: a.city,
  name: a.name,
  country: a.country,
  region: a.region,
  label: `${a.city} (${a.code})`,
  sub: `${a.name}, ${a.country}`,
}));
