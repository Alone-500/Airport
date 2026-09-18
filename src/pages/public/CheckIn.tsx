import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, Check, Luggage, Plane, Printer, ScanLine, Ticket, UserRound } from 'lucide-react';
import { cx, durationLabel, fmtDate, money, relativeDay } from '../../lib/utils';
import type { Booking } from '../../types';
import { fareById } from '../../data/fares';
import { Badge, Button, Divider } from '../../components/ui/Primitives';
import { Modal } from '../../components/ui/Overlay';
import { Checkbox, Field, Input } from '../../components/ui/Form';
import { SeatMap } from '../../components/booking/SeatMap';
import { BoardingPass, BoardingPassActions } from '../../components/booking/BoardingPass';
import { useStore } from '../../store/store';
import { DEMO_LAST, DEMO_REF } from '../../data/demo';

const STAGES = ['Find booking', 'Travellers & seats', 'Bags & documents', 'Done'];

export default function CheckIn() {
  const [params] = useSearchParams();
  const { bookings, findBooking, updateBooking, toast } = useStore();
  const [ref, setRef] = useState(params.get('ref') ?? '');
  const [last, setLast] = useState(params.get('name') ?? '');
  const [step, setStep] = useState(params.get('ref') ? 1 : 0);
  const [err, setErr] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const [seats, setSeats] = useState<Record<string, string>>({});
  const [bags, setBags] = useState<Record<string, number>>({});
  const [docs, setDocs] = useState<Record<string, boolean>>({});
  const [decl, setDecl] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const booking = useMemo(() => bookings.find((b) => b.ref === ref.toUpperCase()), [bookings, ref]);

  const lookup = () => {
    const b = findBooking(ref, last) ?? (ref.toUpperCase() === DEMO_REF && last.toLowerCase() === DEMO_LAST.toLowerCase() ? bookings.find((x) => x.ref === DEMO_REF) : undefined);
    if (!b) {
      setErr(ref ? 'No booking on this device with that reference and surname. Try the sample below, or open the booking you just created.' : 'Enter both the reference and the surname.');
      return;
    }
    setErr(null);
    setChosen(b.passengers.map((p) => p.id));
    setSeats(Object.fromEntries(b.passengers.map((p) => [p.id, p.seat ?? ''])));
    setBags(Object.fromEntries(b.passengers.map((p) => [p.id, 1])));
    setDocs(Object.fromEntries(b.passengers.map((p) => [p.id, false])));
    setStep(1);
  };

  if (!booking && step < 3) {
    return (
      <div className="bg-mist-50/60 pb-20 pt-[calc(var(--nav)+3rem)]">
        <div className="shell-narrow">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Online check-in</p>
              <h1 className="h-hero mt-3 text-[clamp(2rem,5vw,3rem)]">Check in, 48 hours out</h1>
              <p className="lead mt-3 max-w-xl">Seats, bags, document declarations and boarding passes in under two minutes. Airport counters stay open if you would rather talk to a person — they always will.</p>
            </div>
            <div className="rounded-card border border-line bg-white p-4">
              <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-400">Counter times</p>
              <ul className="mt-2 space-y-1 text-[.8125rem] text-ink-600">
                <li className="flex justify-between gap-6"><span>Intra-Africa</span><span className="num font-medium">closes 60 min</span></li>
                <li className="flex justify-between gap-6"><span>Long-haul</span><span className="num font-medium">closes 75 min</span></li>
                <li className="flex justify-between gap-6"><span>Bag drop</span><span className="num font-medium">closes 50 min</span></li>
              </ul>
            </div>
          </div>

          <div className="panel mt-8 grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <Field label="Booking reference" required error={err && !ref ? 'Required' : undefined}>
              <Input value={ref} onChange={(e) => { setRef(e.target.value.toUpperCase()); setErr(null); }} placeholder="ANV7X2K" className="num font-display uppercase tracking-[0.16em]" invalid={!!err} />
            </Field>
            <Field label="Surname" required error={err && !last ? 'Required' : undefined}>
              <Input value={last} onChange={(e) => { setLast(e.target.value); setErr(null); }} placeholder="Mensah" invalid={!!err} />
            </Field>
            <Button size="lg" onClick={lookup} icon={<ScanLine size={17} />}>
              Find & check in
            </Button>
            {err && (
              <p role="alert" className="lg:col-span-3 -mb-1 rounded-[10px] bg-red-50 px-3 py-2 text-[.8125rem] font-medium text-red-700">
                {err}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4 lg:col-span-3">
              <button onClick={() => { setRef(DEMO_REF); setLast(DEMO_LAST); }} className="rounded-pill border border-line bg-white px-3 py-1 text-[.8125rem] font-semibold text-navy-900 hover:border-navy-400">
                Use sample {DEMO_REF} / {DEMO_LAST}
              </button>
              {bookings.slice(0, 3).map((b) => (
                <button key={b.ref} onClick={() => { setRef(b.ref); setLast(b.passengers[0].lastName); }} className="flex items-center gap-2 rounded-pill border border-line bg-white px-3 py-1 text-[.8125rem] text-ink-600 hover:border-navy-400">
                  <Ticket size={13} className="text-ink-400" />
                  <span className="num font-semibold text-navy-900">{b.ref}</span> {b.itinerary.outbound.from}–{b.itinerary.outbound.to}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: <UserRound size={16} />, t: 'Who can check in', b: 'Everyone on the booking, or one person for the party. Passports are validated at the gate, not here.' },
              { icon: <Luggage size={16} />, t: 'Bag drop is separate', b: 'At Kotoka the pre-paid lane is 12 minutes maximum, rows A–D, departures level.' },
              { icon: <Plane size={16} />, t: 'If your flight is <4 h away', b: 'Online check-in closes 1 hour before departure. Go to the counter, or call the desk and we will do it for you.' },
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

  if (step >= 3 || done) {
    return (
      <div className="bg-mist-50/60 pb-20 pt-[calc(var(--nav)+2.5rem)]">
        <div className="shell-narrow">
          <div className="relative overflow-hidden rounded-card bg-navy-900 p-6 text-white sm:p-8">
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] texture-dots" />
            <div className="relative">
              <p className="eyebrow text-teal-300">Checked in</p>
              <h1 className="mt-3 font-display text-[clamp(1.75rem,4.5vw,2.5rem)] font-semibold leading-tight text-white">
                {chosen.length} boarding pass{chosen.length > 1 ? 'es' : ''} ready
              </h1>
              <p className="mt-3 max-w-xl text-[.9375rem] text-white/70">
                {booking?.itinerary.outbound.segments[0].flightNo} · {booking?.itinerary.outbound.from} → {booking?.itinerary.outbound.to} · gate {booking?.itinerary.outbound.segments[0].gate} · boarding {new Date(new Date(booking!.itinerary.outbound.segments[0].dep).getTime() - 30 * 60000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button variant="onDark" onClick={() => window.print()} icon={<Printer size={15} />}>
                  Print all
                </Button>
                <Button variant="ghost" className="border border-white/20 text-white hover:bg-white/10" onClick={() => { navigator.clipboard?.writeText(`${location.origin}/manage-booking?ref=${booking?.ref}`); toast({ tone: 'success', title: 'Trip link copied' }); }}>
                  Send to phone
                </Button>
                <Button variant="ghost" className="border border-white/20 text-white hover:bg-white/10" to={`/manage-booking?ref=${booking?.ref}`}>
                  Manage booking
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {booking!.passengers
              .filter((p) => chosen.includes(p.id))
              .map((p) => (
                <div key={p.id}>
                  <BoardingPass booking={{ ...booking!, checkedIn: true, services: { ...booking!.services, seats: { ...booking!.services.seats, ...seats } } }} paxIndex={booking!.passengers.indexOf(p)} />
                </div>
              ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              { t: 'Bag drop', b: `${Object.values(bags).reduce((s, n) => s + n, 0)} bags to drop at rows A–D. Closes 50 minutes before.` },
              { t: 'Arrive by', b: 'For a 06:15 departure, be through security by 05:10. The fast-track lane is left of door 4.' },
              { t: 'If you miss it', b: 'Your queue timestamp protects you — the duty supervisor will rebook on the next flight at no cost.' },
            ].map((c) => (
              <div key={c.t} className="card p-4">
                <p className="font-display text-[.9375rem] font-semibold text-navy-900">{c.t}</p>
                <p className="mt-1 text-[.8125rem] leading-relaxed text-ink-500">{c.b}</p>
              </div>
            ))}
          </div>
          <BoardingPassActions fileName={`aeronova-${booking?.ref}-boarding-pass`} />
        </div>
      </div>
    );
  }

  const b = booking as Booking;
  const fare = fareById(b.fareId);
  const seg = b.itinerary.outbound.segments[0];

  const finish = () => {
    setBusy(true);
    setTimeout(() => {
      updateBooking(b.ref, {
        checkedIn: true,
        services: { ...b.services, seats: { ...b.services.seats, ...seats } },
        passengers: b.passengers.map((p) => ({ ...p, seat: seats[p.id] ?? p.seat })),
      });
      setBusy(false);
      setDone(true);
      setStep(3);
      toast({ tone: 'success', title: 'Checked in', body: `${chosen.length} boarding passes issued · bags assigned` });
    }, 1100);
  };

  const incomplete = chosen.some((id) => !seats[id]) || (!decl ? true : false) || chosen.some((id) => !docs[id]);

  return (
    <div className="bg-mist-50/60 pb-24">
      <div className="border-b border-line bg-white pt-[var(--nav)]">
        <div className="shell py-5">
          <ol className="mb-4 flex flex-wrap items-center gap-2 text-[.8125rem]">
            {STAGES.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                {i > 0 && <span className={cx('h-px w-6', i <= step ? 'bg-teal-500' : 'bg-ink-200')} />}
                <button onClick={() => i < step && setStep(i)} className={cx('flex items-center gap-1.5 rounded-pill px-2.5 py-1 font-semibold transition', i === step ? 'bg-navy-800 text-white' : i < step ? 'bg-teal-50 text-teal-800' : 'text-ink-400')}>
                  <span className="num">{i < step ? '✓' : i + 1}</span> {s}
                </button>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-[clamp(1.375rem,3.2vw,2rem)] font-semibold tracking-[-0.02em] text-navy-900">
                {seg.from} → {b.itinerary.outbound.to} · {b.ref}
              </h1>
              <p className="mt-1.5 text-[.9375rem] text-ink-500">
                {seg.flightNo} · {fmtDate(seg.depDateLabel, 'long')} · departs {new Date(seg.dep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · gate {seg.gate} · booked {relativeDay(b.createdAt)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => { setStep(0); setRef(''); }}>
                Different booking
              </Button>
              <Badge tone={b.checkedIn ? 'teal' : 'gold'}>{b.checkedIn ? 'Already checked in' : 'Check-in open'}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="shell grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          {step === 1 && (
            <>
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-line bg-mist-50/70 px-4 py-3">
                  <p className="font-display text-[.9375rem] font-semibold text-navy-900">Who is checking in?</p>
                  <button onClick={() => setChosen(chosen.length === b.passengers.length ? [] : b.passengers.map((p) => p.id))} className="text-[.8125rem] font-semibold text-sky-700 hover:underline">
                    {chosen.length === b.passengers.length ? 'Clear all' : 'Select all'}
                  </button>
                </div>
                <ul className="divide-y divide-line">
                  {b.passengers.map((p) => {
                    const on = chosen.includes(p.id);
                    return (
                      <li key={p.id}>
                        <label className={cx('flex cursor-pointer items-center gap-3 px-4 py-3 transition', on ? 'bg-teal-50/40' : 'hover:bg-mist-50')}>
                          <input type="checkbox" checked={on} onChange={(e) => setChosen((v) => (e.target.checked ? [...v, p.id] : v.filter((x) => x !== p.id)))} />
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-50 font-display text-[.75rem] font-bold text-navy-800">
                            {p.firstName.slice(0, 1)}
                            {p.lastName.slice(0, 1)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[.9375rem] font-semibold text-navy-900">
                              {p.firstName} {p.lastName}
                            </span>
                            <span className="block text-[.8125rem] text-ink-500">
                              {p.type === 'adult' ? 'Adult' : p.type === 'child' ? 'Child' : 'Infant'} · seat {seats[p.id] || fare.seatSelection.toLowerCase().includes('check-in') ? 'to be assigned' : seats[p.id]} · {p.docType} ••••{p.docNumber.slice(-4)}
                            </span>
                          </span>
                          {p.type === 'infant' && <Badge tone="gold">Lap infant</Badge>}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="card p-4 sm:p-5">
                <p className="text-h3 text-[1.125rem]">Choose your seats</p>
                <p className="mt-1 text-[.875rem] text-ink-500">Free on {fare.name} from this screen. Exit rows stay priced, and we will not let anyone under 15 sit in one.</p>
                <SeatMap
                  className="mt-4"
                  aircraft={seg.aircraft}
                  flightNo={seg.flightNo}
                  adultCount={chosen.length}
                  selected={seats}
                  cabinsShown={b.cabin === 'BUSINESS' ? ['BUSINESS'] : b.cabin === 'PREMIUM' ? ['BUSINESS', 'PREMIUM'] : ['BUSINESS', 'PREMIUM', 'ECONOMY']}
                  onChange={(paxId, seatId) => {
                    const real = chosen.includes(paxId) ? paxId : chosen[0] ?? paxId;
                    setSeats((v) => ({ ...v, [real]: seatId }));
                  }}
                />
              </div>
              <Button full size="lg" disabled={!chosen.length} onClick={() => setStep(2)}>
                Continue · {chosen.length} traveller{chosen.length === 1 ? '' : 's'}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="card p-4 sm:p-5">
                <p className="text-h3 text-[1.125rem]">Bags</p>
                <p className="mt-1 text-[.875rem] text-ink-500">Your {fare.name} allowance is {fare.checkedBags ? `${fare.checkedBags} × ${fare.bagKg} kg` : 'no checked bag'}. Over-packing now is cheaper than at the counter.</p>
                <ul className="mt-4 divide-y divide-line">
                  {b.passengers
                    .filter((p) => chosen.includes(p.id))
                    .map((p) => {
                      const n = bags[p.id] ?? 0;
                      const over = Math.max(0, n - fare.checkedBags);
                      return (
                        <li key={p.id} className="flex flex-wrap items-center gap-4 py-3">
                          <span className="min-w-0 flex-1">
                            <span className="block text-[.9375rem] font-semibold text-navy-900">
                              {p.firstName} {p.lastName}
                            </span>
                            <span className="num block text-[.75rem] text-ink-500">
                              tag {String(221900 + (p.id.charCodeAt(1) % 800))} · {over ? `${over} extra · ${money(over * 45)}` : 'within allowance'}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            {[0, 1, 2, 3].map((v) => (
                              <button key={v} onClick={() => setBags((s) => ({ ...s, [p.id]: v }))} className={cx('num h-9 w-9 rounded-[10px] border text-[.875rem] font-semibold transition', n === v ? 'border-navy-800 bg-navy-800 text-white' : 'border-line text-ink-600 hover:border-navy-400')}>
                                {v}
                              </button>
                            ))}
                          </span>
                        </li>
                      );
                    })}
                </ul>
                <p className="mt-3 flex items-center justify-between rounded-[10px] bg-mist-50 px-3 py-2 text-[.875rem]">
                  <span className="text-ink-600">Excess baggage total</span>
                  <span className="num font-display font-semibold text-navy-900">
                    {money(
                      Object.entries(bags).reduce((s, [id, n]) => s + Math.max(0, n - fare.checkedBags) * 45 * (b.passengers.find((p) => p.id === id)?.type === 'child' ? 1 : 1), 0),
                    )}
                  </span>
                </p>
              </div>

              <div className="card p-4 sm:p-5">
                <p className="text-h3 text-[1.125rem]">Travel document declaration</p>
                <p className="mt-1 text-[.875rem] text-ink-500">Required for international sectors. Confirm each traveller’s document is valid for the destination — we check again at the gate.</p>
                <ul className="mt-4 space-y-2.5">
                  {b.passengers
                    .filter((p) => chosen.includes(p.id))
                    .map((p) => (
                      <li key={p.id}>
                        <Checkbox
                          label={
                            <span className="flex flex-wrap items-baseline gap-x-2">
                              <span className="font-medium">
                                {p.firstName} {p.lastName}
                              </span>
                              <span className="num text-[.75rem] font-normal text-ink-400">
                                {p.docType} ••••{p.docNumber.slice(-4)} · valid to {fmtDate(p.docExpiry, 'short')}
                              </span>
                            </span>
                          }
                          desc="I confirm the document is the one I will travel with, valid for at least six months, and I meet the destination’s entry requirements."
                          checked={!!docs[p.id]}
                          onChange={(v) => setDocs((d) => ({ ...d, [p.id]: v }))}
                        />
                      </li>
                    ))}
                </ul>
                <div className="mt-3">
                  <Checkbox label="Nothing in my bags that is forbidden in flight" desc="Lithium batteries above 100 Wh in the hold, aerosols over 500 ml, flammables — the full list is one tap away." checked={decl} onChange={setDecl} />
                </div>
                {new Date(seg.dep).getTime() - Date.now() < 0 && (
                  <p className="mt-3 flex items-start gap-2 rounded-[10px] bg-gold-100/70 p-3 text-[.8125rem] text-gold-600">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" /> This flight has already departed in the demo data. Checking in anyway is fine — it is how the flow behaves.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setStep(1)} icon={<span className="sr-only">Back</span>}>
                  Back to seats
                </Button>
                <Button className="flex-1" size="lg" disabled={incomplete} onClick={finish} loading={busy}>
                  {incomplete ? 'Finish the declarations to continue' : `Issue ${chosen.length} boarding pass${chosen.length > 1 ? 'es' : ''}`}
                </Button>
              </div>
              {incomplete && <p className="text-[.8125rem] text-ink-400">We need a seat and a document confirmation for every traveller you are checking in.</p>}
            </>
          )}
        </div>

        <aside className="space-y-3">
          <div className="card p-4">
            <p className="font-display text-[.9375rem] font-semibold text-navy-900">Your flight</p>
            <div className="mt-3 rounded-[12px] bg-navy-900 p-4 text-white">
              <p className="num text-[.75rem] uppercase tracking-[0.16em] text-teal-300">{seg.flightNo}</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                  <p className="num font-display text-[1.5rem] font-semibold leading-none">{new Date(seg.dep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="mt-1 text-[.8125rem] text-white/60">{seg.from}</p>
                </div>
                <div className="flex-1 border-t border-dashed border-white/25" />
                <div className="text-right">
                  <p className="num font-display text-[1.5rem] font-semibold leading-none">{new Date(b.itinerary.outbound.segments.at(-1)!.arr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="mt-1 text-[.8125rem] text-white/60">{b.itinerary.outbound.to}</p>
                </div>
              </div>
              <p className="mt-3 border-t border-white/10 pt-2.5 text-[.75rem] text-white/55">
                {durationLabel(b.itinerary.outbound.totalMin)} · {seg.aircraft} · gate {seg.gate} · {seg.terminal}
              </p>
            </div>
            <Divider className="my-3" label="Ready" />
            <ul className="space-y-2 text-[.8125rem]">
              {[
                ['Travellers selected', `${chosen.length} of ${b.passengers.length}`, chosen.length > 0],
                ['Seats chosen', `${Object.values(seats).filter(Boolean).length}`, chosen.every((id) => seats[id])],
                ['Documents declared', `${chosen.filter((id) => docs[id]).length}`, chosen.every((id) => docs[id])],
                ['Safety declaration', decl ? 'Accepted' : 'Needed', decl],
                ['Bags', `${Object.values(bags).reduce((s, n) => s + n, 0)} total`, true],
              ].map(([k, v, ok]) => (
                <li key={k as string} className="flex items-center justify-between gap-3 border-b border-line pb-1.5 last:border-0">
                  <span className="text-ink-500">{k}</span>
                  <span className={cx('num flex items-center gap-1 font-semibold', ok ? 'text-teal-700' : 'text-gold-600')}>
                    {v} {ok ? <Check size={13} /> : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border border-line bg-white p-4">
            <p className="font-display text-[.9375rem] font-semibold text-navy-900">At the airport today</p>
            <ul className="mt-2 space-y-1.5 text-[.8125rem] text-ink-500">
              <li>Fast-track lane: left of door 4, Galaxy T1</li>
              <li>Pre-paid bag drop: rows A–D · 12 min median</li>
              <li>Security median wait: 6 minutes</li>
              <li>Gate closes 10 minutes before departure</li>
            </ul>
            <Button size="sm" variant="secondary" className="mt-3 w-full" to={`/flight-status?flight=${seg.flightNo}`}>
              Check flight status
            </Button>
          </div>

          <Modal open={false} onClose={() => {}} title="">
            <span />
          </Modal>
        </aside>
      </div>
    </div>
  );
}
