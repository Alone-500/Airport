import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Armchair, Check, ChevronRight, Download, Gift, Luggage, Plane, RefreshCw, ShieldCheck, Sparkles, Ticket, Wallet, Wifi, Utensils, CalendarPlus,
} from 'lucide-react';
import { cx, durationLabel, fmtDate, makePnr, money, toISODate, DAY } from '../../lib/utils';
import type { Booking as BookingType, Itinerary, Passenger } from '../../types';
import { BAGGAGE_ITEMS, EXTRAS, fareById, TAX_NOTES } from '../../data/fares';
import { cityOf } from '../../data/airports';
import { BY_CODE } from '../../data/airports';
import { searchFlights } from '../../data/flights';
import { Badge, Button, Divider, EmptyState, SectionHeading } from '../../components/ui/Primitives';
import { Modal, Tabs } from '../../components/ui/Overlay';
import { Checkbox } from '../../components/ui/Form';
import { PassengerDetails, emptyPassenger } from '../../components/booking/PassengerForm';
import { SeatMap } from '../../components/booking/SeatMap';
import { PaymentForm, usePaymentErrors, type PaymentState, defaultPayment } from '../../components/booking/PaymentForm';
import { BoardingPass, BoardingPassActions } from '../../components/booking/BoardingPass';
import { useStore } from '../../store/store';
import type { CabinId } from '../../types';

const STEPS = ['Flight', 'Passengers', 'Seats', 'Baggage', 'Extras', 'Review', 'Payment', 'Confirmed'] as const;

export default function Booking() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const store = useStore();
  const { prefs, toast, addBooking, updateBooking } = store;
  void updateBooking;

  const cabin = (params.get('cabin') as CabinId) || 'ECONOMY';
  const fareId = params.get('fare') || 'CLASSIC';
  const adults = Number(params.get('pax')?.split(',')[0] ?? 1);
  const children = Number(params.get('pax')?.split(',')[1] ?? 0);
  const infants = Number(params.get('pax')?.split(',')[2] ?? 0);
  const paxCount = adults + children + infants;

  const query = useMemo(
    () => ({
      tripType: (params.get('ret') ? 'round' : 'oneway') as 'round' | 'oneway',
      legs: [{ from: params.get('from') || 'ACC', to: params.get('to') || 'LOS', date: params.get('dep') || toISODate(new Date(Date.now() + 14 * DAY)) }],
      returnDate: params.get('ret') || '',
      adults,
      children,
      infants,
      cabin,
      promo: params.get('promo') || '',
    }),
    [params, cabin, fareId, adults, children, infants],
  );

  const results = useMemo(() => searchFlights(query), [query]);
  const outbound: Itinerary | undefined = results.outbound.find((x) => x.id === params.get('out')) ?? results.outbound[0];
  const inbound: Itinerary | undefined = results.inbound.find((x) => x.id === params.get('ret-id')) ?? (query.tripType === 'round' ? results.inbound[0] : undefined);

  const [step, setStep] = useState(1);
  const [fare, setFare] = useState(fareId);
  const [passengers, setPassengers] = useState<Passenger[]>(() =>
    Array.from({ length: paxCount }, (_, i) => (i === 0 && store.user ? { ...emptyPassenger(1, 'adult'), firstName: store.user.name.split(' ')[0], lastName: store.user.name.split(' ').slice(1).join(' '), email: store.user.email } : emptyPassenger(i + 1, i >= adults ? (i < adults + children ? 'child' : 'infant') : 'adult'))),
  );
  const [contact, setContact] = useState({ email: store.user?.email ?? '', phone: '+233 24 000 0000', country: 'Ghana' });
  const [emailOptIn, setEmailOptIn] = useState(false);
  const [seats, setSeats] = useState<Record<string, string>>({});
  const [seatFees, setSeatFees] = useState<Record<string, number>>({});
  const [bags, setBags] = useState<string[]>([]);
  const [extras, setExtras] = useState<string[]>([]);
  const [payment, setPayment] = useState<PaymentState>(defaultPayment);
  const [paying, setPaying] = useState(false);
  const [ref, setRef] = useState<string | null>(null);
  const [swap, setSwap] = useState(false);
  const [holdModal, setHoldModal] = useState(false);
  const [agree, setAgree] = useState(false);
  const [touchedStep2, setTouchedStep2] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  if (!outbound) {
    return (
      <div className="shell pt-[calc(var(--nav)+4rem)] pb-16">
        <EmptyState
          title="We could not find that flight any more"
          body="The fare bucket you selected sold out while you were reading. Search again and we will show you what is left."
          icon={<Plane size={20} />}
          action={<Button onClick={() => nav('/book')}>Start a new search</Button>}
        />
      </div>
    );
  }

  const fareMeta = fareById(fare);
  const perPax = (it?: Itinerary) => (it?.cabins[cabin]?.[fare] ?? it?.bestPrice ?? 0);
  const base = (perPax(outbound) + (query.tripType === 'round' ? perPax(inbound) : 0)) * paxCount;
  const bagTotal = bags.reduce((s, id) => {
    const item = BAGGAGE_ITEMS.find((b) => b.id === id);
    return s + (item ? item.priceUSD * (item.per === 'passenger' ? paxCount : 1) : 0);
  }, 0);
  const extrasTotal = extras.reduce((s, id) => s + (EXTRAS.find((e) => e.id === id)?.priceUSD ?? 0) * (['MEAL-CHILD'].includes(id) ? paxCount : 1), 0);
  const seatTotal = Object.values(seatFees).reduce((s, v) => s + v, 0);
  const promoOff = query.promo === 'NOVADAY' ? Math.round(base * 0.1) : query.promo === 'AERONOVA5' ? 5 * paxCount : query.promo === 'STUDENT' ? Math.round(base * 0.12) : 0;
  const taxRate = TAX_NOTES[(BY_CODE.get(outbound.to)?.region ?? 'Africa') as keyof typeof TAX_NOTES]?.rate ?? 0.09;
  const taxes = Math.round((base + bagTotal + extrasTotal + seatTotal - promoOff) * taxRate);
  const total = Math.max(0, base + bagTotal + extrasTotal + seatTotal - promoOff + taxes);
  const payErrors = usePaymentErrors(payment, payment.method);

  const booking: BookingType = {
    ref: ref ?? 'DEMO00',
    createdAt: new Date().toISOString(),
    status: 'TICKETED',
    itinerary: { outbound, return: inbound },
    passengers: passengers.map((p) => ({ ...p, seat: seats[p.id] ?? null })),
    cabin,
    fareId: fare,
    contact,
    services: {
      bags: bags.map((id) => BAGGAGE_ITEMS.find((b) => b.id === id)!).filter(Boolean),
      extras: extras.map((id) => ({ id, label: EXTRAS.find((e) => e.id === id)?.label ?? id, priceUSD: EXTRAS.find((e) => e.id === id)?.priceUSD ?? 0, note: '' })),
      seats,
      seatFees,
    },
    totals: { base, taxes, services: bagTotal + extrasTotal + seatTotal, discount: promoOff, total },
    currency: prefs.currency,
    ownerEmail: store.user?.email,
    checkedIn: false,
    payment: { brand: payment.brand || 'visa', last4: payment.number.replace(/\D/g, '').slice(-4) || '0002', auth: String(Math.floor(Math.random() * 899999 + 100000)), amount: total },
  };

  const canContinue = () => {
    if (step === 2) {
      const bad = passengers.some((p) => !p.firstName || !p.lastName || !p.dob || p.docNumber.length < 6);
      if (bad) {
        setTouchedStep2(true);
        toast({ tone: 'warn', title: 'Passenger details incomplete', body: 'Every traveller needs a name, date of birth and travel document.' });
        return false;
      }
      if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(contact.email)) {
        toast({ tone: 'warn', title: 'Contact email needed', body: 'Your e-ticket goes to that address.' });
        return false;
      }
      return true;
    }
    if (step === 7) {
      if (Object.keys(payErrors).length) {
        toast({ tone: 'error', title: 'Payment details need attention', body: Object.values(payErrors)[0] });
        return false;
      }
      if (!agree) {
        toast({ tone: 'warn', title: 'Please accept the Contract of Carriage', body: 'One tick, then we can ticket you.' });
        return false;
      }
      return true;
    }
    return true;
  };

  const next = () => {
    if (!canContinue()) return;
    setStep((s) => Math.min(8, s + 1));
  };

  const pay = () => {
    setPaying(true);
    setTimeout(() => {
      const r = makePnr();
      setRef(r);
      addBooking({ ...booking, ref: r });
      setPaying(false);
      setStep(8);
      toast({ tone: 'success', title: `Booking ${r} confirmed`, body: 'Tickets issued · e-ticket emailed within two minutes' });
    }, 1600);
  };

  const assignAuto = () => {
    const cols = ['A', 'C', 'F'];
    const next: Record<string, string> = {};
    passengers.forEach((p, i) => {
      next[p.id] = `${20 + i}${cols[i % 3]}`;
    });
    setSeats(next);
    setSeatFees({});
    toast({ tone: 'success', title: 'Seats assigned', body: 'We kept the party together in one row block, no charge.' });
  };

  const priceLine = (label: string, v: number, note?: string, tone?: 'teal') => (
    <div className="flex items-baseline justify-between gap-4 py-1.5 text-[.875rem]">
      <span className={cx('min-w-0 flex-1', tone === 'teal' ? 'font-medium text-teal-700' : 'text-ink-600')}>
        {label}
        {note && <span className="ml-1.5 text-[.75rem] text-ink-400">{note}</span>}
      </span>
      <span className={cx('num shrink-0 font-medium', tone === 'teal' ? 'text-teal-700' : 'text-navy-900')}>{money(v, prefs.currency)}</span>
    </div>
  );

  return (
    <div className="bg-mist-50/60 pb-24">
      {/* stepper */}
      <div className="sticky top-[var(--nav)] z-40 border-b border-line bg-white/95 backdrop-blur-xl">
        <div className="shell py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => (step === 1 ? nav('/search?' + params.toString()) : setStep((s) => s - 1))} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-ink-600 transition hover:border-navy-400 hover:text-navy-900" aria-label="Back">
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0 flex-1">
              <ol className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {STEPS.map((s, i) => {
                  const n = i + 1;
                  const state = n < step ? 'done' : n === step ? 'active' : 'todo';
                  return (
                    <li key={s} className="flex shrink-0 items-center gap-1.5">
                      {i > 0 && <span className={cx('h-px w-4 sm:w-7', state !== 'todo' ? 'bg-teal-500' : 'bg-ink-200')} />}
                      <button
                        onClick={() => n < step && setStep(n)}
                        disabled={n > step}
                        className={cx('flex items-center gap-1.5 rounded-pill px-2 py-1 text-[.75rem] font-semibold transition', state === 'active' && 'bg-navy-800 text-white', state === 'done' && 'text-teal-700 hover:bg-teal-50', state === 'todo' && 'text-ink-400')}
                      >
                        <span className={cx('num grid h-4 w-4 place-items-center rounded-full text-[.5625rem]', state === 'active' ? 'bg-white/25' : state === 'done' ? 'bg-teal-500 text-white' : 'bg-mist-200')}>{state === 'done' ? '✓' : n}</span>
                        <span className="hidden sm:inline">{s}</span>
                        <span className="sm:hidden">{s.slice(0, 4)}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
            <div className="hidden shrink-0 items-center gap-3 md:flex">
              <div className="text-right">
                <p className="text-[.625rem] uppercase tracking-[0.14em] text-ink-400">Total</p>
                <p className="num font-display text-[1.0625rem] font-semibold text-navy-900">{money(total, prefs.currency)}</p>
              </div>
              <Button size="sm" onClick={() => setHoldModal(true)} variant="ghost">
                Hold 24 h
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="shell grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_368px]">
        <div className="min-w-0">
          {/* ---------------- STEP 1 — flight ---------------- */}
          {step === 1 && (
            <section className="space-y-4">
              <SectionHeading eyebrow="Step 1" title="Your flights" lead="Change the flight, the cabin or the fare family — the price on the right updates as you go." className="[&_h2]:text-[1.5rem]" />
              {[
                { label: 'Outbound', it: outbound, side: 'out' as const },
                ...(inbound ? [{ label: 'Return', it: inbound, side: 'ret-id' as const }] : []),
              ].map(({ label, it }) => (
                <div key={label} className="card p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="eyebrow">{label} · {fmtDate(it.segments[0].depDateLabel, 'weekday')}</p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="secondary" icon={<RefreshCw size={14} />} onClick={() => setSwap(true)}>
                        Change flight
                      </Button>
                      <Badge tone="teal">{money(perPax(it), prefs.currency)} / adult</Badge>
                    </div>
                  </div>
                  {it.segments.map((s, i) => (
                    <div key={s.flightNo + i} className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3">
                      <div className="flex items-baseline gap-3">
                        <span className="num font-display text-[1.375rem] font-semibold text-navy-900">{new Date(s.dep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[.875rem] font-medium text-ink-700">
                          {s.from} · {cityOf(s.from)}
                        </span>
                      </div>
                      <span className="num rounded-pill bg-mist-100 px-2 py-0.5 text-[.6875rem] font-semibold text-ink-600">{durationLabel(it.segments.length > 1 ? s.durationMin : it.totalMin)}</span>
                      <div className="flex items-baseline gap-3">
                        <span className="num font-display text-[1.375rem] font-semibold text-navy-900">{new Date(s.arr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[.875rem] font-medium text-ink-700">
                          {s.to} · {cityOf(s.to)}
                        </span>
                      </div>
                      <span className="ml-auto text-[.75rem] text-ink-400">
                        {s.carrier} {s.flightNo} · {s.aircraft} · {s.terminal} → gate {s.gate}
                      </span>
                    </div>
                  ))}
                  {it.via && it.layoverMin && (
                    <p className="mt-3 flex items-center gap-2 rounded-[10px] bg-gold-100/70 px-3 py-2 text-[.8125rem] font-medium text-gold-600">
                      <Plane size={14} /> Connection in {it.via} · {durationLabel(it.layoverMin)} · minimum connect time {BY_CODE.get(it.via)?.transitMin ?? 60} min
                    </p>
                  )}
                </div>
              ))}

              <div className="card overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
                  <p className="h-3">Choose your fare</p>
                  <button className="text-[.8125rem] font-semibold text-sky-700 hover:underline" onClick={() => nav('/travel-information/baggage')}>
                    Fare rules
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="table-base min-w-[620px]">
                    <thead>
                      <tr>
                        <th className="w-[190px]">What you get</th>
                        {(['LIGHT', 'CLASSIC', 'FLEX', 'PREMIUM', 'BUSINESS'] as const)
                          .filter((f) => Object.keys(outbound.cabins[cabin] ?? {}).includes(f))
                          .map((f) => (
                            <th key={f} className={cx('min-w-[150px] align-top', fare === f && '!bg-navy-50 !text-navy-900')}>
                              <span className="block text-[.8125rem] normal-case tracking-normal">{fareById(f).name}</span>
                              <span className="num mt-0.5 block text-[.9375rem] font-semibold normal-case tracking-normal">{money(outbound.cabins[cabin]?.[f] ?? 0, prefs.currency)}</span>
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {([
                        ['Checked bags', (f: string) => (fareById(f).checkedBags ? `${fareById(f).checkedBags} × ${fareById(f).bagKg} kg` : '—')],
                        ['Cabin bag', (f: string) => fareById(f).cabinBag],
                        ['Seat selection', (f: string) => fareById(f).seatSelection],
                        ['Changes', (f: string) => (fareById(f).changeable ? (fareById(f).changeFee ? `USD ${fareById(f).changeFee}` : 'Free') : 'Not allowed')],
                        ['Refund', (f: string) => (fareById(f).refundable ? 'Refundable to wallet' : 'Not refundable')],
                        ['Meals', (f: string) => fareById(f).meals],
                        ['Lounge', (f: string) => (fareById(f).lounge ? 'Galaxy Lounge included' : '—')],
                        ['Points', (f: string) => fareById(f).earn],
                      ] as [string, (f: string) => string][]).map(([label, fn]) => (
                        <tr key={label}>
                          <td className="text-[.75rem] font-semibold uppercase tracking-wide text-ink-400">{label}</td>
                          {(['LIGHT', 'CLASSIC', 'FLEX', 'PREMIUM', 'BUSINESS'] as const)
                            .filter((f) => Object.keys(outbound.cabins[cabin] ?? {}).includes(f))
                            .map((f) => (
                              <td key={f} className={cx('align-top text-[.8125rem]', fare === f && 'bg-navy-50/60')}>
                                {fn(f)}
                              </td>
                            ))}
                        </tr>
                      ))}
                      <tr>
                        <td />
                        {(['LIGHT', 'CLASSIC', 'FLEX', 'PREMIUM', 'BUSINESS'] as const)
                          .filter((f) => Object.keys(outbound.cabins[cabin] ?? {}).includes(f))
                          .map((f) => (
                            <td key={f} className={cx('pt-1', fare === f && 'bg-navy-50/60')}>
                              <button
                                onClick={() => {
                                  const target = ['PREMIUM', 'BUSINESS'].includes(f) ? (f === 'PREMIUM' ? 'PREMIUM' : 'BUSINESS') : 'ECONOMY';
                                  setFare(f);
                                  toast({ tone: 'info', title: `${fareById(f).name} selected`, body: target !== cabin ? `Cabin switched to ${target.toLowerCase()}` : undefined });
                                }}
                                className={cx('w-full rounded-[9px] px-2 py-1.5 text-[.8125rem] font-semibold transition', fare === f ? 'bg-navy-800 text-white' : 'border border-line text-navy-800 hover:border-navy-500')}
                              >
                                {fare === f ? 'Selected' : 'Select'}
                              </button>
                            </td>
                          ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <Button full size="lg" onClick={next} iconRight={<ChevronRight size={17} />}>
                Continue to passengers
              </Button>
            </section>
          )}

          {/* ---------------- STEP 2 — passengers ---------------- */}
          {step === 2 && (
            <section className="space-y-4">
              <SectionHeading eyebrow="Step 2" title="Who is flying?" lead="Names must match the travel document exactly, including middle names where they appear on it." className="[&_h2]:text-[1.5rem]" />
              <PassengerDetails passengers={passengers} onChange={setPassengers} contact={contact} onContact={setContact} emailOptIn={emailOptIn} onEmailOptIn={setEmailOptIn} />
              {touchedStep2 && <p className="text-[.8125rem] text-ink-400">Fix the highlighted fields above, then continue.</p>}
              <Button full size="lg" onClick={next} iconRight={<ChevronRight size={17} />}>
                Continue to seats
              </Button>
            </section>
          )}

          {/* ---------------- STEP 3 — seats ---------------- */}
          {step === 3 && (
            <section className="space-y-4">
              <SectionHeading eyebrow="Step 3" title="Pick your seats" lead={`Exit rows and forward cabins cost extra on ${fareMeta.name}. Everyone else is assigned free at check-in.`} className="[&_h2]:text-[1.5rem]" />
              <div className="card p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[.875rem] text-ink-600">
                    Travellers:
                    <span className="ml-2 flex flex-wrap gap-1.5">
                      {passengers.map((p) => (
                        <span key={p.id} className={cx('rounded-pill border px-2 py-0.5 text-[.75rem] font-medium', seats[p.id] ? 'border-teal-400 bg-teal-50 text-teal-800' : 'border-line text-ink-500')}>
                          {p.firstName} {p.lastName.slice(0, 1)}. {seats[p.id] ? `· ${seats[p.id]}` : ''}
                        </span>
                      ))}
                    </span>
                  </p>
                  <button onClick={() => { setSeats({}); setSeatFees({}); }} className="text-[.8125rem] font-semibold text-ink-500 underline-offset-4 hover:text-navy-800 hover:underline">
                    Clear all seats
                  </button>
                </div>
                <SeatMap
                  aircraft={outbound.segments[0].aircraft}
                  flightNo={outbound.segments[0].flightNo}
                  adultCount={paxCount}
                  selected={seats}
                  cabinsShown={cabin === 'BUSINESS' ? ['BUSINESS'] : cabin === 'PREMIUM' ? ['BUSINESS', 'PREMIUM'] : ['BUSINESS', 'PREMIUM', 'ECONOMY']}
                  onChange={(paxId, seatId, price) => {
                    const pax = passengers.find((p) => p.id === paxId) ?? passengers[0];
                    const name = pax ? `${pax.firstName} ${pax.lastName}` : paxId;
                    setSeats((s) => ({ ...s, [pax?.id ?? paxId]: seatId, [name]: seatId }));
                    setSeatFees((f) => ({ ...f, [pax?.id ?? paxId]: price }));
                    toast({ tone: 'success', title: `Seat ${seatId} reserved`, body: price ? `Added at ${money(price)} per seat` : 'No charge for this seat' });
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => { assignAuto(); }}>
                  Let us assign
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setSeats({}); setSeatFees({}); }}>
                  Decide at check-in
                </Button>
              </div>
              <Button full size="lg" onClick={next} iconRight={<ChevronRight size={17} />}>
                Continue to baggage
              </Button>
            </section>
          )}

          {/* ---------------- STEP 4 — baggage ---------------- */}
          {step === 4 && (
            <section className="space-y-4">
              <SectionHeading eyebrow="Step 4" title="Baggage" lead={`Your ${fareMeta.name} fare includes ${fareMeta.checkedBags ? `${fareMeta.checkedBags} × ${fareMeta.bagKg} kg` : 'no checked bags'} per passenger. Pre-purchasing beats the airport counter by about 35%.`} className="[&_h2]:text-[1.5rem]" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="card p-4">
                  <p className="flex items-center gap-2 font-display text-[.9375rem] font-semibold text-navy-900">
                    <Luggage size={16} className="text-teal-600" /> Included allowance
                  </p>
                  <ul className="mt-3 space-y-2 text-[.875rem] text-ink-600">
                    <li className="flex justify-between gap-3 border-b border-line pb-2">
                      <span>Cabin bag</span>
                      <span className="num font-medium text-navy-900">{fareMeta.cabinBag}</span>
                    </li>
                    <li className="flex justify-between gap-3 border-b border-line pb-2">
                      <span>Checked</span>
                      <span className="num font-medium text-navy-900">{fareMeta.checkedBags ? `${fareMeta.checkedBags} × ${fareMeta.bagKg} kg` : 'None'}</span>
                    </li>
                    <li className="flex justify-between gap-3">
                      <span>Personal item</span>
                      <span className="num font-medium text-navy-900">1 · 40×30×20 cm</span>
                    </li>
                  </ul>
                  <p className="mt-3 rounded-[10px] bg-mist-50 p-2.5 text-[.75rem] leading-relaxed text-ink-500">
                    Total linear dimensions must stay under 158 cm per piece. Elite tiers and above always add one bag free.
                  </p>
                </div>
                <div className="card p-4">
                  <p className="flex items-center gap-2 font-display text-[.9375rem] font-semibold text-navy-900">
                    <Gift size={16} className="text-ember-500" /> Sports & special items
                  </p>
                  <p className="mt-2 text-[.875rem] leading-relaxed text-ink-600">
                    One item of sports equipment up to 23 kg can replace a checked bag on Classic and above — a bike needs pedals removed and a box. Instruments under 8 kg can take a cabin seat.
                  </p>
                  <Button size="sm" variant="secondary" className="mt-3" to="/travel-information/baggage">
                    Read the baggage rules
                  </Button>
                </div>
              </div>

              <div className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <p className="font-display text-[.9375rem] font-semibold text-navy-900">Add baggage for {paxCount} {paxCount === 1 ? 'traveller' : 'travellers'}</p>
                  {bags.length > 0 && <Badge tone="teal">{money(bagTotal, prefs.currency)} added</Badge>}
                </div>
                <ul className="divide-y divide-line">
                  {BAGGAGE_ITEMS.map((b) => {
                    const on = bags.includes(b.id);
                    return (
                      <li key={b.id}>
                        <button
                          onClick={() => setBags((v) => (on ? v.filter((x) => x !== b.id) : [...v, b.id]))}
                          className={cx('flex w-full items-center gap-4 px-4 py-3.5 text-left transition', on ? 'bg-teal-50/60' : 'hover:bg-mist-50')}
                        >
                          <span className={cx('grid h-6 w-6 shrink-0 place-items-center rounded-[7px] border transition', on ? 'border-teal-600 bg-teal-500 text-white' : 'border-ink-300')}>{on && <Check size={14} strokeWidth={3} />}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[.9375rem] font-medium text-navy-900">{b.label}</span>
                            <span className="block text-[.75rem] text-ink-500">
                              {b.note} · {b.per === 'passenger' ? 'per traveller' : 'per booking'}
                            </span>
                          </span>
                          <span className="num shrink-0 font-display text-[.9375rem] font-semibold text-navy-900">{money(b.priceUSD, prefs.currency)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <Button full size="lg" onClick={next} iconRight={<ChevronRight size={17} />}>
                Continue to extras
              </Button>
            </section>
          )}

          {/* ---------------- STEP 5 — extras ---------------- */}
          {step === 5 && (
            <section className="space-y-4">
              <SectionHeading eyebrow="Step 5" title="Make the trip easier" lead="Everything here can be added later in Manage Booking — but meals close 24 hours out and lounge passes sell out on the day." className="[&_h2]:text-[1.5rem]" />
              <Tabs
                tone="pill"
                value="all"
                onChange={() => {}}
                items={[{ id: 'all', label: 'All extras' }]}
                className="hidden"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {EXTRAS.map((e) => {
                  const on = extras.includes(e.id);
                  const icon = e.kind === 'meal' ? <Utensils size={15} /> : e.kind === 'wifi' ? <Wifi size={15} /> : e.kind === 'lounge' ? <Sparkles size={15} /> : e.kind === 'insurance' ? <ShieldCheck size={15} /> : e.kind === 'seat' ? <Armchair size={15} /> : <Ticket size={15} />;
                  return (
                    <button
                      key={e.id}
                      onClick={() => setExtras((v) => (on ? v.filter((x) => x !== e.id) : [...v, e.id]))}
                      className={cx('group flex items-start gap-3 rounded-card border p-4 text-left transition', on ? 'border-navy-800 bg-navy-50/50 shadow-card' : 'border-line bg-white hover:border-sky-300')}
                    >
                      <span className={cx('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[9px] transition', on ? 'bg-navy-800 text-gold-400' : 'bg-mist-100 text-navy-700')}>{icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="font-display text-[.9375rem] font-semibold text-navy-900">{e.label}</span>
                          <span className="num shrink-0 text-[.875rem] font-semibold text-navy-900">{e.priceUSD ? money(e.priceUSD, prefs.currency) : 'Free'}</span>
                        </span>
                        <span className="mt-0.5 block text-[.8125rem] leading-snug text-ink-500">{e.note}</span>
                      </span>
                      <span className={cx('mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition', on ? 'border-teal-600 bg-teal-500 text-white' : 'border-ink-300 text-transparent group-hover:border-navy-400')}>
                        <Check size={12} strokeWidth={3} />
                      </span>
                    </button>
                  );
                })}
              </div>
              <Button full size="lg" onClick={next} iconRight={<ChevronRight size={17} />}>
                Review booking
              </Button>
            </section>
          )}

          {/* ---------------- STEP 6 — review ---------------- */}
          {step === 6 && (
            <section className="space-y-4">
              <SectionHeading eyebrow="Step 6" title="Check it over" lead="One look before we ticket. Anything wrong here is cheaper to fix now than at the airport." className="[&_h2]:text-[1.5rem]" />
              <div className="card divide-y divide-line">
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="h-3">Flights</p>
                    <button onClick={() => setStep(1)} className="text-[.8125rem] font-semibold text-sky-700 hover:underline">
                      Change
                    </button>
                  </div>
                  {[outbound, inbound].filter(Boolean).map((it, i) => (
                    <div key={i} className="mt-3">
                      {it!.segments.map((s, k) => (
                        <div key={k} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-l-2 border-teal-500/60 pl-3 text-[.875rem]">
                          <span className="num font-semibold text-navy-900">
                            {new Date(s.dep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} – {new Date(s.arr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="font-medium text-ink-700">
                            {s.from} → {s.to}
                          </span>
                          <span className="text-ink-500">
                            {s.carrier} {s.flightNo} · {s.aircraft}
                          </span>
                          <span className="num ml-auto text-ink-400">{fmtDate(s.depDateLabel, 'short')}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  <p className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-[.8125rem] text-ink-500">
                    <Badge tone="navy">{fareMeta.name}</Badge> {fareMeta.summary}
                  </p>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="h-3">Travellers</p>
                    <button onClick={() => setStep(2)} className="text-[.8125rem] font-semibold text-sky-700 hover:underline">
                      Change
                    </button>
                  </div>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {passengers.map((p) => (
                      <li key={p.id} className="rounded-[12px] border border-line p-3">
                        <p className="font-display text-[.9375rem] font-semibold text-navy-900">
                          {p.salutation} {p.firstName} {p.lastName}
                        </p>
                        <p className="mt-0.5 text-[.8125rem] text-ink-500">
                          {p.type === 'adult' ? 'Adult' : p.type === 'child' ? 'Child' : 'Infant'} · {p.nationality} · {p.docType} ••••{p.docNumber.slice(-4)}
                        </p>
                        <p className="mt-1 flex flex-wrap gap-2 text-[.75rem]">
                          {seats[p.id] && <span className="rounded-pill bg-teal-50 px-2 py-0.5 font-semibold text-teal-800">Seat {seats[p.id]}</span>}
                          {p.meal && p.meal !== 'none' && <span className="rounded-pill bg-mist-100 px-2 py-0.5 text-ink-600">Meal {p.meal}</span>}
                          {p.ffp && <span className="rounded-pill bg-gold-100 px-2 py-0.5 text-gold-600">{p.ffp}</span>}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[.8125rem] text-ink-500">
                    Ticketless: <span className="font-medium text-navy-900">{contact.email}</span> · SMS <span className="num font-medium text-navy-900">{contact.phone}</span>
                  </p>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="h-3">Services</p>
                    <div className="flex gap-3">
                      <button onClick={() => setStep(4)} className="text-[.8125rem] font-semibold text-sky-700 hover:underline">
                        Bags
                      </button>
                      <button onClick={() => setStep(5)} className="text-[.8125rem] font-semibold text-sky-700 hover:underline">
                        Extras
                      </button>
                    </div>
                  </div>
                  {bags.length + extras.length === 0 ? (
                    <p className="mt-2 text-[.875rem] text-ink-500">No paid extras. The included allowance for {fareMeta.name} applies.</p>
                  ) : (
                    <ul className="mt-3 space-y-1.5 text-[.875rem]">
                      {[...bags.map((id) => BAGGAGE_ITEMS.find((b) => b.id === id)!), ...extras.map((id) => EXTRAS.find((e) => e.id === id)!)].filter(Boolean).map((s, i) => (
                        <li key={i} className="flex items-center justify-between gap-3 border-b border-line pb-1.5">
                          <span className="text-ink-600">{s.label}</span>
                          <span className="num font-medium">{money(s.priceUSD, prefs.currency)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="card p-4 sm:p-5">
                <p className="h-3">Price breakdown</p>
                <div className="mt-2">
                  {priceLine(`Base fare · ${paxCount} × ${fareMeta.name}`, base, 'outbound' + (inbound ? ' + return' : ''))}
                  {bagTotal > 0 && priceLine('Baggage', bagTotal)}
                  {extrasTotal > 0 && priceLine('Extras', extrasTotal)}
                  {seatTotal > 0 && priceLine('Seat selection', seatTotal)}
                  {promoOff > 0 && priceLine(`Promo ${query.promo}`, -promoOff, undefined, 'teal')}
                  {priceLine('Taxes, fees & carrier charges', taxes, (TAX_NOTES[(BY_CODE.get(outbound.to)?.region ?? 'Africa') as keyof typeof TAX_NOTES]?.label ?? 'Government taxes').toString())}
                  <Divider className="my-2" />
                  <div className="flex items-baseline justify-between">
                    <p className="font-display text-[1.0625rem] font-semibold text-navy-900">Total</p>
                    <p className="num font-display text-[1.5rem] font-semibold text-navy-900">{money(total, prefs.currency, { decimals: true })}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <Checkbox
                  label={
                    <span>
                      I have read and accept the <span className="font-semibold text-navy-900 underline underline-offset-2">Contract of Carriage</span>, fare rules and the privacy notice, and every traveller's name and document match their passport.
                    </span>
                  }
                  checked={agree}
                  onChange={setAgree}
                />
                {!agree && <p className="text-[.75rem] text-ink-400">We need this tick before we can issue tickets — it is what makes the fare and the rules binding.</p>}
              </div>
              <Button full size="lg" onClick={next} iconRight={<ChevronRight size={17} />}>
                Continue to payment
              </Button>
            </section>
          )}

          {/* ---------------- STEP 7 — payment ---------------- */}
          {step === 7 && (
            <section className="space-y-4">
              <SectionHeading eyebrow="Step 7" title="Payment" lead="Your card is authorised now and captured at ticketing, usually within 30 minutes." className="[&_h2]:text-[1.5rem]" />
              <PaymentForm value={payment} onChange={(p) => setPayment({ ...payment, ...p })} totalUSD={total} onPay={pay} paying={paying} errors={payErrors} />
              <div className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-white p-4 text-[.75rem] text-ink-500">
                {['PCI-DSS Level 1', '3-D Secure 2.0', 'No card data stored', 'Refunds via original method'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-teal-600" /> {t}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* ---------------- STEP 8 — confirmation ---------------- */}
          {step === 8 && ref && (
            <section className="space-y-4">
              <div className="relative overflow-hidden rounded-card bg-navy-900 p-6 text-white sm:p-8">
                <div className="pointer-events-none absolute inset-0 opacity-[0.08] texture-dots" />
                <div className="relative">
                  <p className="eyebrow text-teal-300">Step 8 · Confirmed</p>
                  <h2 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-tight text-white">You are booked, {passengers[0]?.firstName}.</h2>
                  <p className="mt-3 max-w-xl text-[.9375rem] leading-relaxed text-white/70">
                    Three tickets issued to {contact.email}. Your reference is <span className="num font-display font-bold text-white">{ref}</span> — we have also sent it to your phone.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button variant="onDark" to={`/manage-booking?ref=${ref}`}>
                      Manage booking
                    </Button>
                    <Button variant="ghost" className="border border-white/20 text-white hover:bg-white/10" to="/check-in">
                      Check in
                    </Button>
                    <Button
                      variant="ghost"
                      className="border border-white/20 text-white hover:bg-white/10"
                      icon={<Download size={15} />}
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(booking, null, 2)], { type: 'application/json' });
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = `aeronova-${ref}-itinerary.json`;
                        a.click();
                        toast({ tone: 'success', title: 'Itinerary downloaded', body: `aeronova-${ref}-itinerary.json` });
                      }}
                    >
                      Download itinerary
                    </Button>
                    <Button
                      variant="ghost"
                      className="border border-white/20 text-white hover:bg-white/10"
                      icon={<CalendarPlus size={15} />}
                      onClick={() => {
                        const s = new Date(outbound.segments[0].dep).toISOString().replace(/[-:]/g, '').split('.')[0];
                        const e = new Date(outbound.segments[outbound.segments.length - 1].arr).toISOString().replace(/[-:]/g, '').split('.')[0];
                        const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:${ref}@aeronova.aero\nDTSTAMP:${s}\nDTSTART:${s}\nDTEND:${e}\nSUMMARY:AeroNova ${outbound.segments[0].flightNo} ${outbound.from}-${outbound.to}\nDESCRIPTION:Booking ${ref} · seat ${seats[passengers[0]?.id] ?? 'assigned at check-in'}\nLOCATION:${BY_CODE.get(outbound.from)?.name}\nEND:VEVENT\nEND:VCALENDAR`;
                        const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `aeronova-${ref}.ics`;
                        a.click();
                        toast({ tone: 'success', title: 'Calendar file created', body: 'Import it into any calendar app.' });
                      }}
                    >
                      Add to calendar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {passengers.slice(0, 2).map((p, i) => (
                  <BoardingPass key={p.id} booking={{ ...booking, ref }} paxIndex={i} />
                ))}
              </div>
              <BoardingPassActions fileName={`aeronova-${ref}`} />

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: <Plane size={16} />, t: 'What happens next', b: 'Check-in opens 48 h before departure. We will text you when it does, and again if the gate changes.' },
                  { icon: <Luggage size={16} />, t: 'Your bags', b: `${fareMeta.checkedBags ? `${fareMeta.checkedBags} × ${fareMeta.bagKg} kg included` : 'No checked bag on this fare'}${bags.length ? ` plus ${bags.length} added` : ''}. Tag them at rows A–D, 12-minute lane.` },
                  { icon: <Wallet size={16} />, t: 'Changes & refunds', b: fareMeta.refundable ? 'Refundable to travel wallet until 4 h before departure.' : fareMeta.changeable ? `Free date change once; otherwise USD ${fareMeta.changeFee} plus fare difference.` : 'This fare is not changeable or refundable.' },
                ].map((c) => (
                  <div key={c.t} className="card p-4">
                    <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-navy-50 text-navy-700">{c.icon}</span>
                    <p className="mt-3 font-display text-[.9375rem] font-semibold text-navy-900">{c.t}</p>
                    <p className="mt-1 text-[.8125rem] leading-relaxed text-ink-500">{c.b}</p>
                  </div>
                ))}
              </div>

              {!store.user && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-dashed border-navy-300 bg-navy-50/60 p-5">
                  <div>
                    <p className="font-display text-[1rem] font-semibold text-navy-900">Create an account to keep this trip</p>
                    <p className="mt-1 text-[.875rem] text-ink-600">Your booking is already saved on this device. An account adds points, saved travellers and one-tap check-in.</p>
                  </div>
                  <Button to="/sign-in?next=/account">Create account · {Math.round(base * 0.6).toLocaleString()} pts</Button>
                </div>
              )}
            </section>
          )}
        </div>

        {/* ---------- price rail ---------- */}
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--nav)+72px)] space-y-3">
            <div className="card overflow-hidden">
              <div className="bg-navy-900 px-5 py-4 text-white">
                <p className="text-[.6875rem] uppercase tracking-[0.16em] text-teal-300">{STEPS[step - 1]}</p>
                <p className="num mt-1 font-display text-[1.75rem] font-semibold leading-none">{money(total, prefs.currency)}</p>
                <p className="mt-1.5 text-[.75rem] text-white/55">
                  {paxCount} {paxCount === 1 ? 'traveller' : 'travellers'} · {fareMeta.name} · {CABIN_LABEL(cabin)}
                </p>
              </div>
              <div className="px-5 py-3">
                {priceLine(`${outbound.from}→${outbound.to}`, perPax(outbound) * paxCount, `${paxCount} × ${money(perPax(outbound))}`)}
                {inbound && priceLine(`${inbound.from}→${inbound.to}`, perPax(inbound) * paxCount, `${paxCount} × ${money(perPax(inbound))}`)}
                {seatTotal > 0 && priceLine('Seats', seatTotal)}
                {bagTotal > 0 && priceLine('Baggage', bagTotal)}
                {extrasTotal > 0 && priceLine('Extras', extrasTotal)}
                {promoOff > 0 && priceLine('Promo', -promoOff, undefined, 'teal')}
                {priceLine('Taxes & fees', taxes)}
              </div>
              <div className="border-t border-line px-5 py-3">
                <button onClick={() => nav('/search?' + params.toString())} className="text-[.8125rem] font-semibold text-sky-700 hover:underline">
                  Back to results
                </button>
              </div>
            </div>

            <div className="card p-4">
              <p className="flex items-center justify-between font-display text-[.875rem] font-semibold text-navy-900">
                Price guarantee <Badge tone="teal">Held 20 min</Badge>
              </p>
              <p className="mt-2 text-[.8125rem] leading-relaxed text-ink-500">
                If the fare rises before you pay, we honour the lower one. If the flight is disrupted by us, you are rebooked free and the hotel is on us.
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setHoldModal(true)}>
                  Hold 24 h
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSwap(true)}>
                  Change flight
                </Button>
              </div>
            </div>

            <div className="rounded-card border border-line bg-white p-4">
              <p className="font-display text-[.875rem] font-semibold text-navy-900">Need a hand?</p>
              <p className="mt-1.5 text-[.8125rem] leading-relaxed text-ink-500">Reservations in Accra answer in 90 seconds on average, 24/7, and can see this basket with your reference.</p>
              <a href="tel:+233302200100" className="num mt-2 block font-display text-[.9375rem] font-semibold text-sky-700 hover:underline">
                +233 302 200 100
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* mobile pay bar */}
      <div className="fixed inset-x-0 bottom-[68px] z-40 border-t border-line bg-white/95 p-3 backdrop-blur-xl safe-b lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[.625rem] uppercase tracking-[0.14em] text-ink-400">{STEPS[step - 1]}</p>
            <p className="num font-display text-[1.125rem] font-semibold text-navy-900">{money(total, prefs.currency)}</p>
          </div>
          {step === 7 ? (
            <Button onClick={pay} loading={paying}>
              Pay now
            </Button>
          ) : (
            <Button onClick={next}>Continue</Button>
          )}
        </div>
      </div>

      {/* flight swap modal */}
      <Modal open={swap} onClose={() => setSwap(false)} title="Change flight" subtitle="Pick another departure for the outbound." size="lg">
        <div className="space-y-2.5">
          {results.outbound.slice(0, 6).map((it) => (
            <button
              key={it.id}
              onClick={() => {
                const p = new URLSearchParams(params);
                p.set('out', it.id);
                nav(`/booking?${p.toString()}`);
                setSwap(false);
                toast({ tone: 'success', title: 'Outbound updated', body: `${it.segments[0].flightNo} · ${new Date(it.depEpoch).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` });
              }}
              className={cx('flex w-full items-center gap-4 rounded-card border p-3 text-left transition hover:border-navy-500', outbound.id === it.id ? 'border-navy-800 bg-navy-50/50' : 'border-line')}
            >
              <span className="num text-[.8125rem] font-semibold text-navy-900">{new Date(it.depEpoch).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="flex-1 text-[.875rem] text-ink-600">
                {it.segments[0].flightNo} · {durationLabel(it.totalMin)} · {it.stops === 0 ? 'non-stop' : `1 stop via ${it.via}`}
              </span>
              <span className="num text-[.875rem] font-semibold text-navy-900">{money(it.cabins[cabin]?.[fare] ?? it.bestPrice, prefs.currency)}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* 24h hold */}
      <Modal
        open={holdModal}
        onClose={() => setHoldModal(false)}
        title="Hold this fare for 24 hours"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setHoldModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setHoldModal(false);
                const r = makePnr();
                setRef(r);
                addBooking({ ...booking, ref: r, status: 'PENDING_PAYMENT' });
                toast({ tone: 'success', title: `Fare held · ${r}`, body: 'Pay within 24 hours and the price is guaranteed. No card charged.' });
                setStep(8);
              }}
            >
              Hold for free
            </Button>
          </>
        }
      >
        <p className="text-[.875rem] leading-relaxed text-ink-600">
          We lock {money(total, prefs.currency)} for {fareMeta.name} on {outbound.segments[0].flightNo} for 24 hours, free, no card needed. Nothing is ticketed until you pay — so seats stay with the pool and we cannot promise the same window on return.
        </p>
        <p className="mt-3 rounded-[10px] bg-mist-50 p-3 text-[.8125rem] text-ink-500">
          Reference <span className="num font-semibold text-navy-900">{ref ?? makePnr()}</span> will appear in Manage Booking immediately.
        </p>
      </Modal>
    </div>
  );
}

function CABIN_LABEL(c: CabinId) {
  return c === 'ECONOMY' ? 'Economy' : c === 'PREMIUM' ? 'Premium Economy' : 'Nova Business';
}
