import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Bell, CalendarClock, Check, CreditCard, Download, Luggage, Mail, Pencil, Plane, RotateCcw, Send, Share2, Ticket, Trash2 } from 'lucide-react';
import { cx, durationLabel, fmtDate, money, parseISODate, relativeDay, toISODate } from '../../lib/utils';
import type { Booking } from '../../types';
import { fareById } from '../../data/fares';
import { cityOf } from '../../data/airports';
import { Badge, Button, Divider, StatusBadge } from '../../components/ui/Primitives';
import { ConfirmDialog, Modal, Tabs } from '../../components/ui/Overlay';
import { Checkbox, Field, Input } from '../../components/ui/Form';
import { BoardingPass } from '../../components/booking/BoardingPass';
import { SeatMap } from '../../components/booking/SeatMap';
import { BaggagePicker, FlightRow } from '../../components/booking/ManageParts';
import { useStore } from '../../store/store';
import { DEMO_LAST, DEMO_REF } from '../../data/demo';

export default function ManageBooking() {
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const { bookings, findBooking, updateBooking, toast, user, signIn } = useStore();
  const [ref, setRef] = useState(params.get('ref') ?? '');
  const [last, setLast] = useState(params.get('name') ?? '');
  const [err, setErr] = useState<string | null>(null);
  const [found, setFound] = useState<Booking | null>(null);
  const [tab, setTab] = useState<'overview' | 'flights' | 'passengers' | 'bags' | 'payment' | 'history'>('overview');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);
  const [resend, setResend] = useState(false);
  const [pass, setPass] = useState(false);

  const lookup = (r: string, n: string) => {
    const b = findBooking(r, n) ?? (r.toUpperCase() === DEMO_REF && n.toLowerCase() === DEMO_LAST.toLowerCase() ? bookings.find((x) => x.ref === DEMO_REF) : undefined);
    if (b) {
      setFound(b);
      setErr(null);
      setParams({ ref: b.ref });
      toast({ tone: 'success', title: `Booking ${b.ref} found`, body: `${b.passengers.length} traveller${b.passengers.length > 1 ? 's' : ''} · ${b.itinerary.outbound.from} → ${b.itinerary.outbound.to}` });
      if (!user) signIn(b.ownerEmail ?? 'ama.mensah@example.com');
    } else {
      setErr(
        r.toUpperCase() === DEMO_REF
          ? 'That reference exists but the surname does not match. Try surname Mensah.'
          : 'We cannot find that booking on this device. Bookings made in this demo live in your browser — try the sample reference below.',
      );
    }
  };

  useEffect(() => {
    const r = params.get('ref');
    if (r && !found) {
      const b = bookings.find((x) => x.ref === r.toUpperCase());
      if (b) setFound(b);
    }
  }, [params, bookings, found]);

  const live = found ? bookings.find((b) => b.ref === found.ref) ?? found : null;

  if (!live) {
    return (
      <div className="bg-mist-50/60 pb-20 pt-[calc(var(--nav)+3rem)]">
        <div className="shell-narrow">
          <div className="text-center">
            <p className="eyebrow justify-center">Manage booking</p>
            <h1 className="h-hero mt-3 text-[clamp(2rem,5vw,3rem)]">Find your trip</h1>
            <p className="lead mx-auto mt-3 max-w-lg">
              Six-character booking reference from your confirmation email, and the surname on the ticket. No account needed for this screen.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              lookup(ref, last);
            }}
            className="panel mt-8 p-5 sm:p-6"
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <Field label="Booking reference" required error={err && !ref ? 'Required' : undefined}>
                <Input
                  value={ref}
                  onChange={(e) => {
                    setRef(e.target.value.toUpperCase());
                    setErr(null);
                  }}
                  placeholder="ANV7X2K"
                  className="num font-display text-[1.0625rem] uppercase tracking-[0.16em]"
                  invalid={!!err}
                  autoComplete="off"
                />
              </Field>
              <Field label="Surname of lead passenger" required error={err && !last ? 'Required' : undefined}>
                <Input value={last} onChange={(e) => { setLast(e.target.value); setErr(null); }} placeholder="Mensah" invalid={!!err} autoComplete="family-name" />
              </Field>
              <Button type="submit" size="lg" className="sm:mb-0" icon={<SearchIcon />}>
                Find booking
              </Button>
            </div>
            {err && (
              <p role="alert" className="mt-3 rounded-[10px] bg-red-50 px-3 py-2 text-[.8125rem] font-medium text-red-700">
                {err}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
              <span className="text-[.75rem] uppercase tracking-[0.12em] text-ink-400">Try the sample</span>
              <button
                type="button"
                onClick={() => {
                  setRef(DEMO_REF);
                  setLast(DEMO_LAST);
                  lookup(DEMO_REF, DEMO_LAST);
                }}
                className="num rounded-pill border border-line bg-white px-3 py-1 text-[.8125rem] font-semibold text-navy-900 transition hover:border-navy-400"
              >
                {DEMO_REF} · {DEMO_LAST}
              </button>
              <span className="ml-auto text-[.75rem] text-ink-400">
                {bookings.length} booking{bookings.length === 1 ? '' : 's'} saved on this device
              </span>
            </div>
          </form>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { icon: <RotateCcw size={16} />, t: 'Change or cancel', b: 'Date changes on Flex are free. Anything cancelled within 24 h of booking is refunded in full.' },
              { icon: <Luggage size={16} />, t: 'Add a bag, cheaper', b: 'Pre-purchase up to 3 hours before departure saves about 35% against the counter.' },
              { icon: <Bell size={16} />, t: 'Alerts without an account', b: 'Add an email or mobile number to the booking and we will push gate changes to it.' },
            ].map((c) => (
              <div key={c.t} className="card p-4">
                <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-navy-50 text-navy-700">{c.icon}</span>
                <p className="mt-3 font-display text-[.9375rem] font-semibold text-navy-900">{c.t}</p>
                <p className="mt-1 text-[.8125rem] leading-relaxed text-ink-500">{c.b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const fare = fareById(live.fareId);
  const outbound = live.itinerary.outbound;
  const inbound = live.itinerary.return;
  const daysAway = Math.round((new Date(outbound.segments[0].dep).getTime() - Date.now()) / 86400000);

  const actions = (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" icon={<Send size={14} />} onClick={() => setResend(true)}>
        Resend email
      </Button>
      <Button size="sm" variant="secondary" icon={<Share2 size={14} />} onClick={() => { navigator.clipboard?.writeText(`${location.origin}/manage-booking?ref=${live.ref}`); toast({ tone: 'success', title: 'Link copied', body: 'Anyone with the link and the surname can view this trip.' }); }}>
        Share trip
      </Button>
      <Button size="sm" variant="ghost" icon={<Download size={14} />} onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(live, null, 2)], { type: 'application/json' })); a.download = `aeronova-${live.ref}.json`; a.click(); toast({ tone: 'success', title: 'Itinerary downloaded' }); }}>
        Download
      </Button>
    </div>
  );

  return (
    <div className="bg-mist-50/60 pb-16">
      <div className="border-b border-line bg-white pt-[var(--nav)]">
        <div className="shell py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="num font-display text-[clamp(1.5rem,3.6vw,2.25rem)] font-semibold tracking-[-0.02em] text-navy-900">Booking {live.ref}</h1>
                <StatusBadge status={live.status === 'TICKETED' ? 'ON_TIME' : live.status === 'CANCELLED' ? 'CANCELLED' : live.status === 'PENDING_PAYMENT' ? 'DELAYED' : 'BOARDING'} />
                <span className={cx('rounded-pill px-2.5 py-0.5 text-[.6875rem] font-semibold uppercase tracking-wider', live.status === 'CANCELLED' ? 'bg-red-50 text-red-700' : live.status === 'PENDING_PAYMENT' ? 'bg-gold-100 text-gold-600' : 'bg-teal-50 text-teal-800')}>{live.status.replace('_', ' ')}</span>
              </div>
              <p className="mt-2 text-[.9375rem] text-ink-500">
                {outbound.from} → {outbound.to}
                {inbound && ` · ${inbound.from} → ${inbound.to}`} · {fmtDate(outbound.segments[0].depDateLabel, 'long')} · booked {relativeDay(live.createdAt)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {actions}
              {live.status !== 'CANCELLED' && (
                <div className="flex gap-2">
                  {!live.checkedIn && daysAway <= 2 && daysAway >= -1 && (
                    <Button size="sm" onClick={() => nav(`/check-in?ref=${live.ref}`)}>
                      Check in now
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" onClick={() => setChangeOpen(true)}>
                    Change flight
                  </Button>
                </div>
              )}
            </div>
          </div>

          {live.status === 'CANCELLED' && (
            <p role="status" className="mt-4 rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[.875rem] text-red-800">
              This booking is cancelled. A refund of {money(live.totals.total, live.currency)} was issued to your Visa •••• {live.payment?.last4} on {fmtDate(live.createdAt, 'short')} — 5 to 10 working days to appear.
            </p>
          )}
          {daysAway >= 0 && daysAway <= 3 && live.status !== 'CANCELLED' && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[12px] border border-sky-200 bg-sky-50 px-4 py-3">
              <CalendarClock size={16} className="text-sky-700" />
              <p className="flex-1 text-[.875rem] text-sky-900">
                {live.checkedIn ? 'You are checked in. Your boarding pass is in the app and attached to this booking.' : `Check-in is open — ${daysAway === 0 ? 'your flight is today' : `departs in ${daysAway} days`}. Pick your seats and drop the bags in one pass.`}
              </p>
              <Button size="sm" onClick={() => nav(`/check-in?ref=${live.ref}`)}>
                {live.checkedIn ? 'View boarding pass' : 'Check in'}
              </Button>
            </div>
          )}

          <Tabs
            className="mt-5"
            value={tab}
            onChange={setTab}
            items={[
              { id: 'overview', label: 'Overview' },
              { id: 'flights', label: 'Flights' },
              { id: 'passengers', label: 'Passengers & seats', count: live.passengers.length },
              { id: 'bags', label: 'Bags & extras', count: live.services.bags.length + live.services.extras.length },
              { id: 'payment', label: 'Payment' },
              { id: 'history', label: 'History' },
            ]}
          />
        </div>
      </div>

      <div className="shell grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          {tab === 'overview' && (
            <>
              {[outbound, inbound].filter(Boolean).map((it, i) => (
                <FlightRow key={i} it={it!} label={i === 0 ? 'Outbound' : 'Return'} fareName={fare.name} />
              ))}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="card p-4">
                  <p className="text-h3 text-[1rem]">What is included</p>
                  <ul className="mt-3 space-y-2 text-[.875rem]">
                    {[fare.cabinBag, fare.checkedBags ? `${fare.checkedBags} × ${fare.bagKg} kg checked` : 'No checked bag', fare.seatSelection, fare.meals, fare.wifi, fare.boarding].map((x) => (
                      <li key={x} className="flex items-start gap-2 text-ink-600">
                        <Check size={14} className="mt-0.5 shrink-0 text-teal-600" /> {x}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card p-4">
                  <p className="text-h3 text-[1rem]">Quick actions</p>
                  <div className="mt-3 grid gap-2">
                    {[
                      { l: 'Add a checked bag', to: '', act: () => setTab('bags') },
                      { l: 'Upgrade to Nova Business', to: '', act: () => toast({ tone: 'info', title: 'Upgrade quote', body: `Suites open for upgrade from ${money(Math.round(live.totals.base * 0.62))} from 72 h before departure.` }) },
                      { l: 'Pre-order a meal', to: '', act: () => setTab('bags') },
                      { l: 'Add APD / ETA details', to: '', act: () => setTab('passengers') },
                      { l: 'Request a refund', to: '', act: () => setCancelOpen(true) },
                      { l: 'Invoice for expenses', to: '', act: () => toast({ tone: 'success', title: 'Invoice emailed', body: `Tax invoice for ${money(live.totals.total, live.currency)} sent to ${live.contact.email}.` }) },
                    ].map((a) => (
                      <button key={a.l} onClick={a.act} className="flex items-center justify-between rounded-[10px] border border-line px-3 py-2 text-left text-[.875rem] font-medium text-navy-900 transition hover:border-sky-300 hover:bg-sky-50/50">
                        {a.l}
                        <Pencil size={13} className="text-ink-300" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {live.checkedIn && (
                <div className="space-y-4">
                  <p className="text-h3">Boarding passes</p>
                  {live.passengers.map((_, i) => (
                    <BoardingPass key={i} booking={live} paxIndex={i} />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'flights' && (
            <div className="space-y-4">
              {[outbound, inbound].filter(Boolean).map((it, i) => (
                <FlightRow key={i} it={it!} label={i === 0 ? 'Outbound' : 'Return'} fareName={fare.name} detailed />
              ))}
              <div className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-[.9375rem] font-semibold text-navy-900">Change to a different flight</p>
                    <p className="mt-1 text-[.8125rem] text-ink-500">On {fare.name}, changes cost {fare.changeable ? (fare.changeFee ? `USD ${fare.changeFee} plus any fare difference` : 'nothing') : 'nothing back — this fare cannot be changed'}.</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => setChangeOpen(true)}>
                    Look for alternatives
                  </Button>
                </div>
              </div>
            </div>
          )}

          {tab === 'passengers' && (
            <div className="space-y-4">
              <div className="card divide-y divide-line">
                {live.passengers.map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center gap-4 p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy-50 font-display text-[.8125rem] font-bold text-navy-800">
                      {p.firstName.slice(0, 1)}
                      {p.lastName.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-[.9375rem] font-semibold text-navy-900">
                        {p.salutation} {p.firstName} {p.lastName}
                        <span className="ml-2 text-[.75rem] font-medium uppercase tracking-wide text-ink-400">{p.type}</span>
                      </p>
                      <p className="mt-0.5 text-[.8125rem] text-ink-500">
                        {p.nationality} · {p.docType} ••••{p.docNumber.slice(-4)} · expires {fmtDate(p.docExpiry, 'short')} · born {fmtDate(p.dob, 'short')}
                      </p>
                      <p className="mt-1 flex flex-wrap gap-2 text-[.75rem]">
                        <Badge tone={live.checkedIn ? 'teal' : 'neutral'}>Seat {live.checkedIn ? p.seat ?? 'assigned' : seatsOf(live, p.id)}</Badge>
                        {p.meal && p.meal !== 'none' && <Badge tone="gold">Meal {p.meal}</Badge>}
                        {p.ffp && <Badge tone="sky">{p.ffp}</Badge>}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => { setTab('passengers'); setPass((v) => !v); }}>
                        {pass ? 'Done' : 'Edit'}
                      </Button>
                      {live.status !== 'CANCELLED' && (
                        <Button size="sm" variant="ghost" onClick={() => { updateBooking(live.ref, { passengers: live.passengers.filter((x) => x.id !== p.id) }); toast({ tone: 'warn', title: `${p.firstName} removed`, body: 'Refund for that passenger is calculated in Payment.' }); }}>
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {pass && (
                  <div className="p-4">
                    <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-400">Edit traveller</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-4">
                      <Field label="Given name">
                        <Input defaultValue={live.passengers[0].firstName} />
                      </Field>
                      <Field label="Family name">
                        <Input defaultValue={live.passengers[0].lastName} />
                      </Field>
                      <Field label="Document number">
                        <Input defaultValue={live.passengers[0].docNumber} />
                      </Field>
                      <Field label="Known traveller (APD / RED)">
                        <Input placeholder="Optional" />
                      </Field>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setPass(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={() => { setPass(false); toast({ tone: 'success', title: 'Passenger updated', body: 'Name change inside the 3-character tolerance — no re-issue fee.' }); }}>
                        Save changes
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {live.status !== 'CANCELLED' && (
                <div className="card p-4">
                  <p className="font-display text-[.9375rem] font-semibold text-navy-900">Seat map</p>
                  <p className="mt-1 text-[.8125rem] text-ink-500">{live.checkedIn ? 'You are checked in — seats can still be swapped at the gate.' : 'Choose seats now, or leave it and we will assign free seats at check-in.'}</p>
                  <SeatMap
                    className="mt-4"
                    aircraft={outbound.segments[0].aircraft}
                    flightNo={outbound.segments[0].flightNo}
                    adultCount={live.passengers.length}
                    selected={live.services.seats}
                    cabinsShown={live.cabin === 'BUSINESS' ? ['BUSINESS'] : live.cabin === 'PREMIUM' ? ['BUSINESS', 'PREMIUM'] : ['BUSINESS', 'PREMIUM', 'ECONOMY']}
                    onChange={(paxId, seatId, price) => {
                      updateBooking(live.ref, { services: { ...live.services, seats: { ...live.services.seats, [paxId]: seatId }, seatFees: { ...live.services.seatFees, [paxId]: price } } });
                      toast({ tone: 'success', title: `Seat ${seatId}`, body: price ? `${money(price)} added to your total` : 'No charge' });
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {tab === 'bags' && (
            <div className="space-y-4">
              <div className="card p-4 sm:p-5">
                <p className="text-h3 text-[1.125rem]">Baggage & extras</p>
                <p className="mt-1 text-[.875rem] text-ink-500">Everything here is priced 35% below the airport counter, and closes 3 hours before departure.</p>
                <BaggagePicker
                  bags={live.services.bags.map((b) => b.id)}
                  extras={live.services.extras.map((e) => e.id)}
                  onToggle={(kind, id, on) => {
                    if (kind === 'bags') {
                      const item = { id, label: '', priceUSD: 0, per: 'passenger' as const };
                      updateBooking(live.ref, {
                        services: { ...live.services, bags: on ? [...live.services.bags, { ...item, label: id, priceUSD: id === 'BAG32' ? 78 : 45, per: 'passenger' }] : live.services.bags.filter((b) => b.id !== id) },
                        totals: { ...live.totals, total: live.totals.total + (on ? 45 : -45) * live.passengers.length },
                      });
                    } else {
                      updateBooking(live.ref, {
                        services: { ...live.services, extras: on ? [...live.services.extras, { id, label: id, priceUSD: 0, note: '' }] : live.services.extras.filter((e) => e.id !== id) },
                      });
                    }
                    toast({ tone: on ? 'success' : 'info', title: on ? 'Added to your booking' : 'Removed', body: 'Charged to the card on file.' });
                  }}
                />
              </div>
              <div className="card p-4">
                <p className="font-display text-[.9375rem] font-semibold text-navy-900">Where your bags are</p>
                <ol className="mt-3 space-y-2.5">
                  {[
                    { t: 'Checked in · ACC', s: '05:52 · belt loader 3', done: true },
                    { t: 'Loaded · AN 214', s: '06:24 · 3 bags on this flight', done: daysAway < 0 || live.checkedIn },
                    { t: 'Arrival scan · LOS', s: daysAway < 0 ? '08:02 · belt 2' : 'pending', done: daysAway < 0 },
                    { t: 'Delivered', s: daysAway < 0 ? '08:12 · signed by A. Mensah' : 'estimated 08:15', done: daysAway < 0 },
                  ].map((x, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className={cx('grid h-6 w-6 place-items-center rounded-full text-[.625rem] font-bold', x.done ? 'bg-teal-500 text-white' : 'bg-mist-200 text-ink-400')}>{x.done ? '✓' : i + 1}</span>
                      <span className="text-[.875rem] font-medium text-navy-900">{x.t}</span>
                      <span className="ml-auto text-[.75rem] text-ink-400">{x.s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {tab === 'payment' && (
            <div className="space-y-4">
              <div className="card overflow-hidden">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Fares · {live.passengers.length} {live.passengers.length === 1 ? 'traveller' : 'travellers'} · {fare.name}</td>
                      <td className="text-right">{money(live.totals.base, live.currency)}</td>
                    </tr>
                    <tr>
                      <td>Taxes, fees & carrier charges</td>
                      <td className="text-right">{money(live.totals.taxes, live.currency)}</td>
                    </tr>
                    <tr>
                      <td>Services (bags, seats, extras)</td>
                      <td className="text-right">{money(live.totals.services, live.currency)}</td>
                    </tr>
                    {live.totals.discount > 0 && (
                      <tr>
                        <td className="text-teal-700">Promo discount</td>
                        <td className="text-right text-teal-700">−{money(live.totals.discount, live.currency)}</td>
                      </tr>
                    )}
                    <tr className="bg-mist-50">
                      <td className="font-display font-semibold text-navy-900">Total paid</td>
                      <td className="num text-right font-display text-[1.0625rem] font-semibold text-navy-900">{money(live.totals.total, live.currency)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="card p-4">
                <p className="flex items-center gap-2 font-display text-[.9375rem] font-semibold text-navy-900">
                  <CreditCard size={16} className="text-ink-400" /> Paid with Visa ending {live.payment?.last4 ?? '4417'}
                </p>
                <p className="mt-1 text-[.8125rem] text-ink-500">
                  Authorisation {live.payment?.auth ?? '482913'} · captured {fmtDate(live.createdAt, 'long')} · e-ticket 216-4471889021
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => toast({ tone: 'success', title: 'Receipt emailed', body: `Receipt for ${money(live.totals.total, live.currency)} sent to ${live.contact.email}` })} icon={<Mail size={14} />}>
                    Email receipt
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setCancelOpen(true)} icon={<RotateCcw size={14} />}>
                    Request refund
                  </Button>
                </div>
              </div>
            </div>
          )}

          {tab === 'history' && (
            <div className="card overflow-hidden">
              <ul className="divide-y divide-line">
                {[
                  { t: 'Seats confirmed 12A / 12C / 12F', w: toISODate(new Date(Date.now() - 1 * 86400000)), by: 'You · app' },
                  { t: 'Extra bag added (1 × 23 kg)', w: toISODate(new Date(Date.now() - 2 * 86400000)), by: 'You · Manage Booking' },
                  { t: 'Ticket issued to Visa •••• 4417', w: live.createdAt.slice(0, 16).replace('T', ' '), by: 'System' },
                  { t: 'Child meal CHML requested for Naa', w: toISODate(new Date(Date.now() - 4 * 86400000)), by: 'Reservations · agent 2214' },
                  { t: 'Booking created and held', w: toISODate(new Date(parseISODate(live.createdAt).getTime() - 40 * 60000)), by: 'You · web' },
                  { t: 'Passport expiry recorded (2030-11-02)', w: toISODate(new Date(Date.now() - 9 * 86400000)), by: 'You' },
                ].map((h, i) => (
                  <li key={i} className="flex flex-wrap items-baseline gap-3 px-4 py-3">
                    <span className="text-[.875rem] font-medium text-navy-900">{h.t}</span>
                    <span className="num ml-auto text-[.75rem] text-ink-400">{h.w}</span>
                    <span className="w-full text-[.75rem] text-ink-400 sm:w-auto">{h.by}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* rail */}
        <aside className="space-y-3">
          <div className="card overflow-hidden">
            <div className="relative">
              <img src="/img/cabin-economy.jpg" alt="" className="h-28 w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-navy-950/55" />
              <div className="absolute inset-x-4 bottom-3 text-white">
                <p className="text-[.6875rem] uppercase tracking-[0.14em] text-teal-300">{fare.name}</p>
                <p className="font-display text-[1.0625rem] font-semibold">{cityOf(outbound.from)} → {cityOf(outbound.to)}</p>
              </div>
            </div>
            <dl className="space-y-2.5 p-4 text-[.875rem]">
              {[
                ['Status', live.status.replace('_', ' ')],
                ['Departs', `${fmtDate(outbound.segments[0].depDateLabel, 'short')} · ${new Date(outbound.segments[0].dep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`],
                ['Flight', outbound.segments.map((s) => s.flightNo).join(', ')],
                ['Travellers', `${live.passengers.length}`],
                ['Baggage', `${fare.checkedBags * live.passengers.length + live.services.bags.length * live.passengers.length} pieces`],
                ['Total', money(live.totals.total, live.currency)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-line pb-2 last:border-0">
                  <dt className="text-ink-400">{k}</dt>
                  <dd className="num text-right font-medium text-navy-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card p-4">
            <p className="font-display text-[.9375rem] font-semibold text-navy-900">This trip earns</p>
            <p className="num mt-2 font-display text-[1.75rem] font-semibold text-teal-700">{Math.round(live.totals.base * 1.1 + 4200).toLocaleString()}</p>
            <p className="text-[.75rem] text-ink-500">points · {(outbound.segments[0].seatMiles * 2).toLocaleString()} tier miles</p>
            <Divider className="my-3" />
            <p className="text-[.8125rem] leading-relaxed text-ink-500">
              Credited within 48 hours of your last flight. Elite tier bonus of 25% is already included.
            </p>
          </div>

          <div className="rounded-card border border-line bg-white p-4">
            <p className="font-display text-[.9375rem] font-semibold text-navy-900">Need something else?</p>
            <ul className="mt-2.5 space-y-2 text-[.875rem]">
              {[
                { l: 'Check-in & boarding pass', to: `/check-in?ref=${live.ref}` },
                { l: 'Flight status', to: `/flight-status?flight=${outbound.segments[0].flightNo}` },
                { l: 'Report a bag issue', to: '/travel-information/lost-baggage' },
                { l: 'Help centre', to: '/help' },
                { l: user ? 'My account' : 'Create an account', to: user ? '/account' : '/sign-in' },
              ].map((a) => (
                <li key={a.l}>
                  <Link to={a.to} className="flex items-center gap-2 text-ink-600 transition hover:text-navy-900">
                    <Ticket size={14} className="text-ink-300" /> {a.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border border-red-200 bg-red-50/60 p-4">
            <p className="font-display text-[.9375rem] font-semibold text-red-800">Cancel this booking</p>
            <p className="mt-1 text-[.8125rem] leading-relaxed text-red-700/90">
              {fare.refundable ? 'Refundable to your travel wallet, instantly, minus nothing.' : fare.changeable ? `Not refundable, but cancellable before departure for a ${money(Math.round(live.totals.base * 0.5))} flight credit.` : 'This fare is not refundable. Cancelling keeps the taxes back.'}
            </p>
            <Button size="sm" variant="danger" className="mt-3" onClick={() => setCancelOpen(true)}>
              Cancel booking
            </Button>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onCancel={() => setCancelOpen(false)}
        onConfirm={() => {
          updateBooking(live.ref, { status: 'CANCELLED' });
          setCancelOpen(false);
          toast({ tone: 'warn', title: 'Booking cancelled', body: `${fare.refundable ? 'Travel wallet credit issued' : 'Refund request submitted'} for ${money(live.totals.total, live.currency)}.` });
        }}
        title={`Cancel ${live.ref}?`}
        confirmLabel="Yes, cancel it"
        tone="danger"
        body={
          <div className="space-y-2">
            <p>
              This releases {live.passengers.length} seat{live.passengers.length > 1 ? 's' : ''} on {outbound.segments.map((s) => s.flightNo).join(' / ')} and cannot be undone.
            </p>
            <p className="rounded-[10px] bg-mist-50 p-3 text-ink-600">
              {fare.refundable ? 'Your fare is refundable — the full amount returns to your travel wallet as soon as we confirm.' : 'Your fare is not refundable, but unpaid taxes are always returned. Anything within 24 hours of booking comes back in full.'}
            </p>
            <Checkbox label="Tell me about the flight credit option instead" />
          </div>
        }
      />

      <Modal open={changeOpen} onClose={() => setChangeOpen(false)} title="Change flight" subtitle={`${live.ref} · ${fare.name} · ${live.passengers.length} travellers`} size="lg">
        <div className="space-y-3">
          <p className="rounded-[10px] bg-sky-50 px-3 py-2.5 text-[.8125rem] text-sky-900">
            {fare.changeable ? `Changes are ${fare.changeFee ? `USD ${fare.changeFee} per person plus fare difference` : 'free on this fare'}. Any cheaper fare is credited to your wallet.` : 'This fare cannot be changed. You can cancel and rebook — the difference is usually smaller than you expect, so ask us.'}
          </p>
          {[1, 2, 3].map((d) => {
            const alt = { ...outbound, id: `alt${d}`, segments: outbound.segments.map((s) => ({ ...s, dep: new Date(new Date(s.dep).getTime() + d * 86400000 * 0 + d * 3600000 * 5).toISOString(), arr: new Date(new Date(s.arr).getTime() + d * 3600000 * 5).toISOString(), depDateLabel: toISODate(new Date(new Date(s.depDateLabel).getTime() + d * 86400000)) })) };
            return (
              <button key={d} onClick={() => { updateBooking(live.ref, { itinerary: { ...live.itinerary, outbound: alt } }); setChangeOpen(false); toast({ tone: 'success', title: 'Flight changed', body: `Now ${new Date(alt.segments[0].dep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} on ${fmtDate(alt.segments[0].depDateLabel, 'short')} · re-issue fee applied` }); }} className="flex w-full items-center gap-4 rounded-card border border-line p-3 text-left transition hover:border-navy-500 hover:bg-sky-50/40">
                <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-navy-50 text-navy-700">
                  <Plane size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[.9375rem] font-semibold text-navy-900">
                    {new Date(alt.segments[0].dep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {fmtDate(alt.segments[0].depDateLabel, 'weekday')}
                  </span>
                  <span className="block text-[.8125rem] text-ink-500">
                    {alt.segments[0].flightNo} · {durationLabel(alt.totalMin)} · same aircraft
                  </span>
                </span>
                <span className="num shrink-0 text-right">
                  <span className="block text-[.9375rem] font-semibold text-navy-900">{d === 2 ? '+$0' : d === 1 ? '+$36' : '−$54'}</span>
                  <span className="block text-[.6875rem] text-ink-400">per person</span>
                </span>
              </button>
            );
          })}
        </div>
      </Modal>

      <Modal open={resend} onClose={() => setResend(false)} title="Resend confirmation" size="sm" footer={<><Button variant="ghost" onClick={() => setResend(false)}>Cancel</Button><Button onClick={() => { setResend(false); toast({ tone: 'success', title: 'Email sent', body: `Itinerary for ${live.ref} re-sent to ${live.contact.email}` }); }}>Send it</Button></>}>
        <Field label="Email address">
          <Input defaultValue={live.contact.email} />
        </Field>
        <div className="mt-3 space-y-2">
          <Checkbox label="Also send as SMS with the boarding-pass link" defaultChecked />
          <Checkbox label="Attach the PDF itinerary" defaultChecked />
        </div>
      </Modal>
    </div>
  );
}

const seatsOf = (b: Booking, id: string) => b.services.seats[id] ?? 'not selected';
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
