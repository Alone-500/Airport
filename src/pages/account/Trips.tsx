import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Check, Clock, Download, Luggage, MapPin, Plane, Send, Share2, Ticket } from 'lucide-react';
import { durationLabel, fmtDate, money, relativeDay } from '../../lib/utils';
import { AccountCard, AccountHeader } from './AccountLayout';
import { Badge, Button, Divider, EmptyState, Meter, SectionHeading, StatusBadge } from '../../components/ui/Primitives';
import { Tabs } from '../../components/ui/Overlay';
import { SegmentedControl } from '../../components/ui/Form';
import { fareById } from '../../data/fares';
import { BY_CODE, cityOf } from '../../data/airports';
import { Photo } from '../../components/brand/Brand';
import { useStore } from '../../store/store';
import { STORIES } from '../../data/content';

type Filter = 'all' | 'upcoming' | 'today' | 'past';

export default function Trips() {
  const { bookings, prefs, toast, user } = useStore();
  const nav = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<string | null>(null);

  const list = useMemo(() => {
    const now = Date.now();
    return bookings
      .map((b) => {
        const dep = new Date(b.itinerary.outbound.segments[0].dep).getTime();
        return { b, dep, state: dep > now ? 'upcoming' : 'past' as const };
      })
      .filter((x) => (filter === 'all' ? true : filter === 'today' ? Math.abs(x.dep - now) < 26 * 3600000 : x.state === filter))
      .sort((a, b) => b.dep - a.dep);
  }, [bookings, filter]);

  if (!user) return null;

  return (
    <div>
      <AccountHeader
        title="Trips"
        lead="Everything you have booked, past and future, with the details you actually reuse: seats, bags, hotels and the reference."
        badge={<Badge tone="neutral">{bookings.length} total</Badge>}
        action={
          <>
            <SegmentedControl
              size="sm"
              value={filter}
              onChange={setFilter}
              options={[
                { id: 'all', label: 'All' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'today', label: 'Today' },
                { id: 'past', label: 'Past' },
              ]}
            />
            <Button size="sm" variant="secondary" icon={<Ticket size={14} />} onClick={() => nav('/manage-booking')}>
              Add by reference
            </Button>
          </>
        }
      />

      {list.length === 0 ? (
        <AccountCard>
          <EmptyState title={`No ${filter === 'all' ? '' : filter + ' '}trips here`} body="Book a flight and it appears immediately, on this device and in the app." icon={<Plane size={20} />} action={<Button size="sm" onClick={() => nav('/book')}>Search flights</Button>} />
        </AccountCard>
      ) : (
        <div className="space-y-4">
          {list.map(({ b, state }) => {
            const out = b.itinerary.outbound;
            const ret = b.itinerary.return;
            const isOpen = open === b.ref;
            const depAirport = BY_CODE.get(out.segments[0].from);
            const arrAirport = BY_CODE.get(out.segments.at(-1)!.to);
            return (
              <article key={b.ref} className="overflow-hidden rounded-card border border-line bg-white shadow-card">
                <div className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-[12px]">
                    <Photo src={depAirport?.hub ? '/img/hero.jpg' : '/img/cabin-economy.jpg'} alt="" seed={b.ref} className="h-full w-full" imgClassName="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-[1.0625rem] font-semibold text-navy-900">
                        {out.from} → {out.to}
                      </p>
                      <span className="num rounded-pill bg-mist-100 px-2 py-0.5 text-[.75rem] font-semibold text-ink-600">{b.ref}</span>
                      <StatusBadge status={b.status === 'TICKETED' ? 'ON_TIME' : b.status === 'CANCELLED' ? 'CANCELLED' : b.status === 'PENDING_PAYMENT' ? 'DELAYED' : 'BOARDING'} />
                      {b.checkedIn && <Badge tone="teal" icon={<Check size={11} />}>Checked in</Badge>}
                    </div>
                    <p className="mt-1 text-[.875rem] text-ink-500">
                      {fmtDate(out.segments[0].depDateLabel, 'long')} · {out.segments.map((s) => s.flightNo).join(' + ')} · {b.passengers.length} traveller{b.passengers.length > 1 ? 's' : ''} ·{' '}
                      {fareById(b.fareId).name}
                    </p>
                    <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[.8125rem] text-ink-400">
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} /> {durationLabel(out.totalMin)} {out.stops === 0 ? 'non-stop' : `· 1 stop ${out.via}`}
                      </span>
                      {ret && (
                        <span>
                          Return {fmtDate(ret.segments[0].depDateLabel, 'short')}
                        </span>
                      )}
                      <span className="num">{money(b.totals.total, prefs.currency, { decimals: true })}</span>
                      <span>{relativeDay(b.createdAt)}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    <Button size="sm" onClick={() => nav(`/manage-booking?ref=${b.ref}`)}>
                      Manage
                    </Button>
                    {!b.checkedIn && state === 'upcoming' && (
                      <Button size="sm" variant="secondary" onClick={() => nav(`/check-in?ref=${b.ref}`)}>
                        Check in
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setOpen(isOpen ? null : b.ref)}>
                      {isOpen ? 'Hide' : 'Details'}
                    </Button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-line bg-mist-50/50 p-4 sm:p-5 animate-fade-in">
                    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
                      <div>
                        <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-ink-400">Segments</p>
                        <ul className="mt-2.5 space-y-2.5">
                          {[out, ret].filter(Boolean).flatMap((it) => it!.segments).map((s, i) => (
                            <li key={i} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-[12px] border border-line bg-white px-3.5 py-2.5 text-[.875rem]">
                              <span className="num font-semibold text-navy-900">
                                {new Date(s.dep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} – {new Date(s.arr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="font-medium text-ink-700">
                                {s.from} → {s.to}
                              </span>
                              <span className="text-ink-500">{s.aircraft}</span>
                              <span className="num ml-auto text-ink-400">
                                {s.flightNo} · gate {s.gate}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <Divider className="my-4" />
                        <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-ink-400">Travellers & seats</p>
                        <ul className="mt-2.5 space-y-2">
                          {b.passengers.map((p) => (
                            <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-[12px] border border-line bg-white px-3.5 py-2">
                              <span className="text-[.875rem] font-medium text-navy-900">
                                {p.firstName} {p.lastName}
                              </span>
                              <Badge tone="neutral">{p.type}</Badge>
                              <span className="num ml-auto rounded-pill bg-navy-50 px-2 py-0.5 text-[.75rem] font-semibold text-navy-800">{b.services.seats[p.id] ?? p.seat ?? 'assigned at check-in'}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <div className="rounded-[14px] border border-line bg-white p-4">
                          <p className="font-display text-[.875rem] font-semibold text-navy-900">At {out.segments[0].from}</p>
                          <p className="mt-1.5 text-[.8125rem] leading-relaxed text-ink-500">{depAirport?.counters}</p>
                          <p className="mt-2 flex items-center gap-1.5 text-[.8125rem] text-ink-600">
                            <MapPin size={13} className="text-ink-400" /> {depAirport?.transport[0].mode} to the city · {depAirport?.transport[0].time}
                          </p>
                          <Meter value={depAirport?.hub ? 92 : 64} tone="teal" className="mt-3" label="Terminal busyness now" />
                        </div>
                        <div className="rounded-[14px] border border-line bg-white p-4">
                          <p className="font-display text-[.875rem] font-semibold text-navy-900">Services on this ticket</p>
                          <ul className="mt-2 space-y-1.5 text-[.8125rem] text-ink-600">
                            <li className="flex items-center gap-2">
                              <Luggage size={13} className="text-teal-600" /> {fareById(b.fareId).checkedBags ? `${fareById(b.fareId).checkedBags} × ${fareById(b.fareId).bagKg} kg included` : 'No checked bag on this fare'}
                            </li>
                            {b.services.bags.map((x) => (
                              <li key={x.id} className="flex items-center gap-2">
                                <Check size={13} className="text-teal-600" /> {x.label}
                              </li>
                            ))}
                            {b.services.extras.map((x) => (
                              <li key={x.id} className="flex items-center gap-2">
                                <Check size={13} className="text-teal-600" /> {x.label}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="secondary" icon={<CalendarPlus size={14} />} onClick={() => toast({ tone: 'success', title: 'Calendar file created', body: `${b.ref}.ics downloaded` })}>
                            Add to calendar
                          </Button>
                          <Button size="sm" variant="ghost" icon={<Share2 size={14} />} onClick={() => { navigator.clipboard?.writeText(`${location.origin}/manage-booking?ref=${b.ref}`); toast({ tone: 'success', title: 'Trip link copied' }); }}>
                            Share
                          </Button>
                          <Button size="sm" variant="ghost" icon={<Send size={14} />} onClick={() => toast({ tone: 'success', title: 'E-tickets re-sent', body: `Three PDFs to ${b.contact.email}` })}>
                            Resend
                          </Button>
                          <Button size="sm" variant="ghost" icon={<Download size={14} />} onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(b, null, 2)], { type: 'application/json' })); a.download = `${b.ref}.json`; a.click(); }}>
                            Download
                          </Button>
                        </div>
                        {cityOf(out.to) && arrAirport && (
                          <p className="text-[.75rem] text-ink-400">
                            Landing at {arrAirport.name}. Minimum connect on the return: {arrAirport.transitMin} minutes.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        <SectionHeading eyebrow="Make the trip" title="While you are going anyway." className="mb-5 [&_h2]:text-[1.25rem]" />
        <div className="grid gap-4 sm:grid-cols-3">
          {STORIES.slice(0, 3).map((s) => (
            <button key={s.id} onClick={() => nav(`/stories/${s.id}`)} className="group overflow-hidden rounded-card border border-line bg-white text-left transition hover:border-sky-300 hover:shadow-card">
              <Photo src={s.img} alt="" seed={s.id} className="h-24" imgClassName="transition-transform duration-700 group-hover:scale-105" />
              <div className="p-4">
                <p className="text-[.6875rem] uppercase tracking-[0.14em] text-teal-600">{s.eyebrow}</p>
                <p className="mt-1 font-display text-[.9375rem] font-semibold leading-snug text-navy-900">{s.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const TripsTabs = Tabs;
