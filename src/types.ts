import { type Currency } from './lib/utils';

export type Region = 'Africa' | 'Europe' | 'Middle East' | 'Asia' | 'North America' | 'South America';
export type CabinId = 'ECONOMY' | 'PREMIUM' | 'BUSINESS';

export interface Airport {
  code: string;
  city: string;
  country: string;
  region: Region;
  name: string;
  tz: string;
  utc: number;
  terminals: string[];
  counters: string;
  gates: number;
  lounges: string[];
  transitMin: number;
  opening: string;
  security: string;
  parking: { label: string; price: string }[];
  transport: { mode: string; detail: string; time: string }[];
  facilities: string[];
  blurb: string;
  hub?: boolean;
}

export interface Attraction {
  name: string;
  kind: string;
  note: string;
}
export interface Hotel {
  name: string;
  area: string;
  stars: number;
  priceUSD: number;
  note: string;
}

export interface Destination {
  slug: string;
  city: string;
  country: string;
  code: string;
  region: Region;
  img: string;
  tagline: string;
  blurb: string;
  story?: string;
  startFare: number;
  durationMin: number;
  flightNos: string[];
  weekly: number;
  bestTime: string;
  visa: string;
  currency: string;
  language: string;
  highlights: { title: string; desc: string; tag: string }[];
  tips: string[];
  attractions: Attraction[];
  hotels: Hotel[];
  weather: { month: string; high: number; low: number; rain: number }[];
  related: string[];
  tags: string[];
  angle: string;
}

export interface FareFamily {
  id: string;
  name: string;
  cabin: CabinId;
  priceIndex: number;
  refundable: boolean;
  changeable: boolean;
  changeFee: number;
  checkedBags: number;
  bagKg: number;
  cabinBag: string;
  seatSelection: string;
  lounge: boolean;
  boarding: string;
  meals: string;
  wifi: string;
  earn: string;
  summary: string;
  perks: string[];
}

export interface Segment {
  flightNo: string;
  carrier: string;
  aircraft: string;
  from: string;
  to: string;
  dep: string;
  arr: string;
  depDateLabel: string;
  durationMin: number;
  terminal?: string;
  gate?: string;
  seatMiles: number;
}

export interface Itinerary {
  id: string;
  direction: 'outbound' | 'return';
  from: string;
  to: string;
  segments: Segment[];
  stops: number;
  via?: string;
  totalMin: number;
  cabins: Record<CabinId, Record<string, number>>;
  bestPrice: number;
  seatsLeft: number;
  wifi: boolean;
  power: boolean;
  rating: number;
  ratingCount: number;
  refundable: boolean;
  bagsIncluded: number;
  depEpoch: number;
  arrEpoch: number;
  isNova: boolean;
  airlineCode: string;
  layoverMin?: number;
}

export interface SearchLeg {
  from: string;
  to: string;
  date: string;
}

export interface SearchQuery {
  tripType: 'round' | 'oneway' | 'multi';
  legs: SearchLeg[];
  returnDate: string;
  adults: number;
  children: number;
  infants: number;
  cabin: CabinId;
  promo: string;
}

export interface Passenger {
  id: string;
  salutation: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  nationality: string;
  docType: string;
  docNumber: string;
  docExpiry: string;
  email: string;
  phone: string;
  ffp?: string;
  meal?: string;
  seat?: string | null;
  type: 'adult' | 'child' | 'infant';
}

export interface BookingServices {
  bags: { id: string; label: string; priceUSD: number; per: 'passenger' | 'itinerary' }[];
  extras: { id: string; label: string; priceUSD: number; note: string }[];
  seats: Record<string, string>;
  seatFees: Record<string, number>;
}

export interface Booking {
  ref: string;
  createdAt: string;
  status: 'CONFIRMED' | 'TICKETED' | 'CHANGED' | 'CANCELLED' | 'PENDING_PAYMENT' | 'REFUND_REQUESTED';
  itinerary: { outbound: Itinerary; return?: Itinerary };
  passengers: Passenger[];
  cabin: CabinId;
  fareId: string;
  contact: { email: string; phone: string; country: string };
  services: BookingServices;
  totals: { base: number; taxes: number; services: number; discount: number; total: number };
  currency: Currency;
  ownerEmail?: string;
  checkedIn: boolean;
  payment?: { brand: string; last4: string; auth: string; amount: number };
  progress?: number;
  emailOptIn?: boolean;
}

export interface FlightStatusEntry {
  flightNo: string;
  carrier: string;
  origin: string;
  destination: string;
  originCity: string;
  destCity: string;
  schedDep: string;
  estDep: string;
  schedArr: string;
  estArr: string;
  status: 'ON_TIME' | 'BOARDING' | 'DELAYED' | 'DEPARTED' | 'LANDED' | 'CANCELLED' | 'DIVERTED';
  gate: string;
  terminal: string;
  aircraft: string;
  registration: string;
  distanceKm: number;
  loadFactor: number;
  delayMin: number;
}
