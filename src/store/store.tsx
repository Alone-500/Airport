import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { Booking, Passenger, SearchQuery } from '../types';
import type { Currency } from '../lib/utils';
import { toISODate } from '../lib/utils';
import { DEMO_LOGIN } from '../data/admin';
import { makeDemoBooking, makePastBookings } from '../data/demo';

const LS = 'aeronova.v1';

/* ------------------------------------------------------------------ */
export interface Prefs {
  currency: Currency;
  language: string;
  units: 'metric' | 'imperial';
  seatPref: string;
  mealPref: string;
  sms: boolean;
  marketing: boolean;
  sharing: boolean;
  assistProfile: string;
}

const defaultPrefs: Prefs = {
  currency: 'USD',
  language: 'en',
  units: 'metric',
  seatPref: 'window',
  mealPref: 'none',
  sms: true,
  marketing: false,
  sharing: true,
  assistProfile: '',
};

/* ------------------------------------------------------------------ */
export interface User {
  email: string;
  name: string;
  tier: string;
  points: number;
  yqp: number;
  segments: number;
  since: string;
  role?: 'staff';
}

interface Persisted {
  prefs: Prefs;
  user: User | null;
  bookings: Booking[];
  savedPassengers: Passenger[];
  wallet: { id: string; label: string; amount: number; expires: string; kind: string }[];
  notifications: { id: string; title: string; body: string; when: string; kind: string; read: boolean }[];
  adminPin?: string;
}

const seedPassengers: Passenger[] = [
  {
    id: 'sp-1', salutation: 'Ms', firstName: 'Ama', lastName: 'Mensah', dob: '1988-04-12', gender: 'Female',
    nationality: 'Ghana', docType: 'Passport', docNumber: 'G02948811', docExpiry: '2030-11-02',
    email: 'ama.mensah@example.com', phone: '+233 24 551 0188', ffp: 'ANV-4471-8802', type: 'adult',
  },
  {
    id: 'sp-2', salutation: 'Mr', firstName: 'Kwabena', lastName: 'Mensah', dob: '1986-09-30', gender: 'Male',
    nationality: 'Ghana', docType: 'Passport', docNumber: 'G01884022', docExpiry: '2029-06-18',
    email: 'k.mensah@example.com', phone: '+233 20 447 2210', ffp: 'ANV-4471-8803', type: 'adult',
  },
  {
    id: 'sp-3', salutation: 'Miss', firstName: 'Naa', lastName: 'Mensah', dob: '2016-02-19', gender: 'Female',
    nationality: 'Ghana', docType: 'Passport', docNumber: 'G22110489', docExpiry: '2028-01-09',
    email: '', phone: '', type: 'child',
  },
];

const seedWallet = [
  { id: 'w1', label: 'Travel wallet credit', amount: 342.6, expires: '2028-04-30', kind: 'Refund credit' },
  { id: 'w2', label: 'Nova Cover claim', amount: 90, expires: '2027-02-11', kind: 'Delay payout' },
  { id: 'w3', label: 'Anniversary bonus', amount: 50, expires: '2026-12-31', kind: 'Promotion' },
];

const seedNotes = [
  { id: 'n1', title: 'Check-in is open for AN 214', body: 'Accra → Lagos, tomorrow 06:15. Your seat 12A is confirmed; two bags are already paid.', when: '2 h ago', kind: 'trip', read: false },
  { id: 'n2', title: 'Gate change at Kotoka', body: 'AN 214 now departs from C9 instead of B4. Same time.', when: '5 h ago', kind: 'ops', read: false },
  { id: 'n3', title: '5,400 points credited', body: 'Business sector Accra → London, plus your Elite tier bonus.', when: 'Yesterday', kind: 'rewards', read: true },
  { id: 'n4', title: 'Your bag tag was scanned in Lagos', body: 'Bag 221904 arrived on the 08:40 flight and was delivered at 11:12.', when: '3 days ago', kind: 'baggage', read: true },
  { id: 'n5', title: 'Student fare verification expires', body: 'Kwabena’s ISIC document needs a refresh before 1 December.', when: '5 days ago', kind: 'account', read: true },
];

const state0: Persisted = {
  prefs: defaultPrefs,
  user: null,
  bookings: [],
  savedPassengers: seedPassengers,
  wallet: seedWallet,
  notifications: seedNotes,
};

function seed(): Persisted {
  const g = globalThis as { __AN_DEMO_USER__?: string; process?: { env?: Record<string, string | undefined> } };
  const flag = g.__AN_DEMO_USER__ ?? g.process?.env?.AN_DEMO_USER;
  const user =
    flag === 'staff'
      ? { email: DEMO_LOGIN.admin.email, name: DEMO_LOGIN.admin.name, role: 'staff' as const, tier: 'Staff', points: 0, yqp: 0, segments: 0, since: '2019-04-18' }
      : flag === 'customer'
        ? { email: DEMO_LOGIN.customer.email, name: DEMO_LOGIN.customer.name, tier: DEMO_LOGIN.customer.tier, points: DEMO_LOGIN.customer.points, yqp: DEMO_LOGIN.customer.yqp, segments: DEMO_LOGIN.customer.segments, since: DEMO_LOGIN.customer.since }
        : null;
  return { ...state0, user, bookings: [makeDemoBooking(), ...makePastBookings()] };
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(LS);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as Persisted;
    const merged = { ...state0, ...parsed, prefs: { ...defaultPrefs, ...(parsed.prefs ?? {}) } };
    if (!merged.bookings.length) merged.bookings = seed().bookings;
    return merged;
  } catch {
    return seed();
  }
}

/* ------------------------------------------------------------------ */
export interface Toast {
  id: number;
  title: string;
  body?: string;
  tone: 'info' | 'success' | 'warn' | 'error';
  action?: { label: string; to?: string; onClick?: () => void };
}

interface Store {
  prefs: Prefs;
  setPrefs: (p: Partial<Prefs>) => void;
  user: User | null;
  signIn: (email: string, name?: string) => void;
  signOut: () => void;
  bookings: Booking[];
  addBooking: (b: Booking) => void;
  updateBooking: (ref: string, patch: Partial<Booking>) => void;
  findBooking: (ref: string, lastName?: string) => Booking | undefined;
  savedPassengers: Passenger[];
  savePassenger: (p: Passenger) => void;
  removePassenger: (id: string) => void;
  wallet: Persisted['wallet'];
  notifications: Persisted['notifications'];
  markRead: (id: string) => void;
  markAllRead: () => void;
  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => number;
  dismissToast: (id: number) => void;
  query: SearchQuery | null;
  setQuery: (q: SearchQuery) => void;
}

const Ctx = createContext<Store | null>(null);
export const useStore = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore outside provider');
  return v;
};

let toastSeq = 1;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(() => (typeof window === 'undefined' ? seed() : load()));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [query, setQuery] = useState<SearchQuery | null>(null);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    try {
      localStorage.setItem(LS, JSON.stringify(state));
    } catch {
      /* storage full or blocked — demo keeps running in memory */
    }
  }, [state]);

  const setPrefs = useCallback((p: Partial<Prefs>) => setState((s) => ({ ...s, prefs: { ...s.prefs, ...p } })), []);

  const signIn = useCallback((email: string, name?: string) => {
    setState((s) => ({
      ...s,
      user: {
        email,
        name: name ?? DEMO_LOGIN.customer.name,
        tier: DEMO_LOGIN.customer.tier,
        points: DEMO_LOGIN.customer.points,
        yqp: DEMO_LOGIN.customer.yqp,
        segments: DEMO_LOGIN.customer.segments,
        since: DEMO_LOGIN.customer.since,
        role: email.endsWith('@aeronova.aero') ? 'staff' : undefined,
      },
    }));
  }, []);

  const signOut = useCallback(() => setState((s) => ({ ...s, user: null })), []);

  const addBooking = useCallback((b: Booking) => setState((s) => ({ ...s, bookings: [b, ...s.bookings] })), []);
  const updateBooking = useCallback(
    (ref: string, patch: Partial<Booking>) =>
      setState((s) => ({ ...s, bookings: s.bookings.map((b) => (b.ref === ref ? { ...b, ...patch } : b)) })),
    [],
  );
  const findBooking = useCallback(
    (ref: string, lastName?: string) => {
      const r = ref.trim().toUpperCase();
      const found = state.bookings.find((b) => b.ref === r);
      if (!found) return undefined;
      if (lastName && found.passengers[0]?.lastName.toUpperCase() !== lastName.trim().toUpperCase()) return undefined;
      return found;
    },
    [state.bookings],
  );

  const savePassenger = useCallback(
    (p: Passenger) =>
      setState((s) => ({
        ...s,
        savedPassengers: s.savedPassengers.some((x) => x.id === p.id) ? s.savedPassengers.map((x) => (x.id === p.id ? p : x)) : [...s.savedPassengers, p],
      })),
    [],
  );
  const removePassenger = useCallback((id: string) => setState((s) => ({ ...s, savedPassengers: s.savedPassengers.filter((x) => x.id !== id) })), []);

  const markRead = useCallback((id: string) => setState((s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })), []);
  const markAllRead = useCallback(() => setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })), []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    const timer = timers.current[id];
    if (timer) clearTimeout(timer);
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = toastSeq++;
      setToasts((list) => [...list.slice(-3), { ...t, id }]);
      timers.current[id] = setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 5200);
      return id;
    },
    [],
  );

  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);

  const value = useMemo<Store>(
    () => ({
      prefs: state.prefs,
      setPrefs,
      user: state.user,
      signIn,
      signOut,
      bookings: state.bookings,
      addBooking,
      updateBooking,
      findBooking,
      savedPassengers: state.savedPassengers,
      savePassenger,
      removePassenger,
      wallet: state.wallet,
      notifications: state.notifications,
      markRead,
      markAllRead,
      toasts,
      toast,
      dismissToast,
      query,
      setQuery,
    }),
    [state, setPrefs, signIn, signOut, addBooking, updateBooking, findBooking, savePassenger, removePassenger, markRead, markAllRead, toasts, toast, dismissToast, query],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* ------------------------------------------------------------------ *
 * Booking flow state machine (search → pay → confirm)
 * ------------------------------------------------------------------ */
export interface FlowState {
  step: number;
  query: SearchQuery;
  outboundId: string | null;
  returnId: string | null;
  fareId: string;
  cabin: SearchQuery['cabin'];
  passengers: Passenger[];
  contact: { email: string; phone: string; country: string };
  seats: Record<string, string>;
  seatFees: Record<string, number>;
  bags: string[];
  extras: string[];
  payment: { brand: string; name: string; last4: string; exp: string; method: string; billing: string };
  promo: string;
  accepted: boolean;
  hold: boolean;
  edited: boolean;
}

export type FlowAction =
  | { type: 'start'; query: SearchQuery }
  | { type: 'goto'; step: number }
  | { type: 'choose'; side: 'outbound' | 'return'; id: string; fareId?: string; cabin?: SearchQuery['cabin'] }
  | { type: 'passengers'; passengers: Passenger[] }
  | { type: 'contact'; contact: FlowState['contact'] }
  | { type: 'seats'; seats: Record<string, string>; fees: Record<string, number> }
  | { type: 'services'; bags?: string[]; extras?: string[] }
  | { type: 'payment'; payment: FlowState['payment'] }
  | { type: 'promo'; code: string }
  | { type: 'accept'; value: boolean }
  | { type: 'hold' }
  | { type: 'reset' };

const emptyFlow: FlowState = {
  step: 1,
  query: { tripType: 'round', legs: [{ from: 'ACC', to: 'LOS', date: toISODate(new Date(Date.now() + 14 * 86400000)) }], returnDate: '', adults: 1, children: 0, infants: 0, cabin: 'ECONOMY', promo: '' },
  outboundId: null,
  returnId: null,
  fareId: 'CLASSIC',
  cabin: 'ECONOMY',
  passengers: [],
  contact: { email: '', phone: '', country: 'Ghana' },
  seats: {},
  seatFees: {},
  bags: [],
  extras: [],
  payment: { brand: '', name: '', last4: '', exp: '', method: 'card', billing: '' },
  promo: '',
  accepted: false,
  hold: false,
  edited: false,
};

function flowReducer(s: FlowState, a: FlowAction): FlowState {
  switch (a.type) {
    case 'start':
      return { ...emptyFlow, query: a.query, cabin: a.query.cabin, step: 1 };
    case 'goto':
      return { ...s, step: Math.max(1, Math.min(8, a.step)) };
    case 'choose':
      return {
        ...s,
        ...(a.side === 'outbound' ? { outboundId: a.id } : { returnId: a.id }),
        fareId: a.fareId ?? s.fareId,
        cabin: a.cabin ?? s.cabin,
      };
    case 'passengers':
      return { ...s, passengers: a.passengers, edited: true };
    case 'contact':
      return { ...s, contact: a.contact };
    case 'seats':
      return { ...s, seats: a.seats, seatFees: a.fees };
    case 'services':
      return { ...s, bags: a.bags ?? s.bags, extras: a.extras ?? s.extras };
    case 'payment':
      return { ...s, payment: a.payment };
    case 'promo':
      return { ...s, promo: a.code };
    case 'accept':
      return { ...s, accepted: a.value };
    case 'hold':
      return { ...s, hold: true, step: 8 };
    case 'reset':
      return { ...emptyFlow, query: s.query };
    default:
      return s;
  }
}

export function useBookingFlow() {
  return useReducer(flowReducer, emptyFlow);
}
