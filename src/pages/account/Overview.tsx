import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, CalendarDays, Check, ChevronRight, CreditCard, Heart, Luggage, PlaneTakeoff, RotateCcw, Send, Sparkles, Ticket, Wallet } from 'lucide-react';
import { cx, durationLabel, fmtDate, money, relativeDay } from '../../lib/utils';
import { AccountCard, AccountHeader, Row, StatTile } from './AccountLayout';
import { Badge, Button, Divider, EmptyState, StatusBadge } from '../../components/ui/Primitives';
import { BoardingPass } from '../../components/booking/BoardingPass';
import { OfferCard } from '../../components/airline/Cards';
import { OFFERS } from '../../data/offers';
import { fareById } from '../../data/fares';
import { cityOf } from '../../data/airports';
import { useStore } from '../../store/store';
import { TIERS } from '../../data/offers';

export default function Overview() {
  const { user, bookings, prefs, notifications, wallet, toast, markRead } = useStore();
  const nav = useNavigate();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [pass, setPass] = useState(false);

  const now = Date.now();
  const sorted = [...bookings].sort((a, b) => new Date(a.itinerary.outbound.segments[0].dep).getTime() - new Date(b.itinerary.outbound.segments[0].dep).getTime());
  const upcoming = sorted.filter((b) => new Date(b.itinerary.outbound.segments[0].dep).getTime() > now && b.status !== 'CANCELLED');
  const past = sorted.filter((b) => new Date(b.itinerary.outbound.segments[0].dep).getTime() <= now || b.status === 'CANCELLED').reverse();
  const next = tab === 'upcoming' ? upcoming[0] : past[0];
  const tier = TIERS.find((t) => t.name === (user?.tier ?? 'Explorer')) ?? TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(tier) + 1];
  const progress = nextTier ? Math.min(100, ((user?.points ?? 0) / nextTier.qualifyPoints) * 100) : 100;

  const activity = [
    ...bookings.slice(0, 2).map((b) => ({ icon: <Ticket size={15} />, t: `Booking ${b.ref} ${b.status === 'CANCELLED' ? 'cancelled' : 'ticketed'}`, w: relativeDay(b.createdAt), to: `/manage-booking?ref=${b.ref}` })),
    { icon: <Heart size={15} />, t: '5,400 points credited · AN 200 Business', w: 'yesterday', to: '/account/rewards' },
    { icon: <Luggage size={15} />, t: 'Delayed bag located in Lagos', w: '3 days ago', to: '/manage-booking' },
    { icon: <Wallet size={15} />, t: `${money(wallet.reduce((s, w) => s + w.amount, 0), prefs.currency, { decimals: true })} in travel wallet`, w: 'this week', to: '/account/payment' },
    { icon: <CreditCard size={15} />, t: 'Visa •••• 4417 renewed · exp 09/28', w: 'last month', to: '/account/payment' },
  ];

  if (!user) return null;

  return (
    <div className="space-y-5">
      <AccountHeader
        title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${user.name.split(' ')[0]}`}
        lead={`${upcoming.length} upcoming ${upcoming.length === 1 ? 'trip' : 'trips'} · ${user.points.toLocaleString()} points · ${money(wallet.reduce((s, w) => s + w.amount, 0), prefs.currency, { decimals: true })} of wallet credit`}
        badge={<Badge tone="gold">{tier.name}</Badge>}
        action={
          <>
            <Button size="sm" variant="secondary" onClick={() => nav('/check-in')}>
              Check in
            </Button>
            <Button size="sm" onClick={() => nav('/book')} icon={<PlaneTakeoff size={15} />}>
              Book a flight
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Points balance" value={user.points.toLocaleString()} tone="teal" icon={<Heart size={15} />} sub={<span>{nextTier ? `${(nextTier.qualifyPoints - user.points).toLocaleString()} to ${nextTier.name}` : 'Top tier held'}</span>} />
        <StatTile label="Travel wallet" value={money(wallet.reduce((s, w) => s + w.amount, 0), prefs.currency, { decimals: true })} tone="gold" icon={<Wallet size={15} />} sub={`${wallet.length} credits · oldest expires ${wallet[0].expires}`} />
        <StatTile label="Sectors this year" value={user.segments} tone="navy" icon={<PlaneTakeoff size={15} />} sub={`${(user.yqp ?? 0).toLocaleString()} qualifying points · 4 upgrade certs left`} />
        <StatTile label="Notifications" value={notifications.filter((n) => !n.read).length} tone="ember" icon={<Bell size={15} />} sub={notifications[0].title} />
      </div>

      {/* next trip */}
      {next ? (
        <AccountCard
          tone="navy"
          title={tab === 'upcoming' ? 'Next trip' : 'Most recent trip'}
          lead={`${next.ref} · ${fareById(next.fareId).name} · booked ${relativeDay(next.createdAt)}`}
          action={
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="border border-white/20 text-white/85 hover:bg-white/10" onClick={() => setTab(tab === 'upcoming' ? 'past' : 'upcoming')}>
                {tab === 'upcoming' ? 'See past trips' : 'See upcoming'}
              </Button>
              <Button size="sm" variant="onDark" onClick={() => nav(`/manage-booking?ref=${next.ref}`)}>
                Manage
              </Button>
            </div>
          }
        >
          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <Badge tone={next.status === 'CANCELLED' ? 'red' : next.checkedIn ? 'teal' : 'gold'}>{next.checkedIn ? 'Checked in' : next.status.replace('_', ' ')}</Badge>
                <span className="text-[.8125rem] text-white/60">{cityOf(next.itinerary.outbound.from)} → {cityOf(next.itinerary.outbound.to)}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-4">
                {[next.itinerary.outbound, next.itinerary.return].filter(Boolean).map((it, i) => (
                  <div key={i} className="min-w-[190px] flex-1">
                    <p className="text-[.625rem] uppercase tracking-[0.16em] text-teal-300">{i === 0 ? 'Outbound' : 'Return'} · {it!.segments[0].flightNo}</p>
                    <div className="mt-1.5 flex items-end gap-3">
                      <p className="num font-display text-[1.75rem] font-semibold leading-none">
                        {new Date(it!.segments[0].dep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <span className="text-[.8125rem] text-white/60">{it!.segments[0].from}</span>
                      <span className="mx-1 h-px flex-1 border-t border-dashed border-white/25" />
                      <p className="num font-display text-[1.75rem] font-semibold leading-none">{new Date(it!.segments.at(-1)!.arr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                      <span className="text-[.8125rem] text-white/60">{it!.to}</span>
                    </div>
                    <p className="mt-1.5 text-[.8125rem] text-white/55">
                      {fmtDate(it!.segments[0].depDateLabel, 'long')} · {durationLabel(it!.totalMin)} · {it!.segments[0].aircraft} · gate {it!.segments[0].gate}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {!next.checkedIn ? (
                  <Button size="sm" variant="onDark" onClick={() => nav(`/check-in?ref=${next.ref}`)}>
                    Check in & pick seats
                  </Button>
                ) : (
                  <Button size="sm" variant="onDark" onClick={() => setPass(true)}>
                    View boarding pass
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="border border-white/20 text-white/85 hover:bg-white/10" onClick={() => nav(`/flight-status?flight=${next.itinerary.outbound.segments[0].flightNo}`)} icon={<CalendarDays size={14} />}>
                  Flight status
                </Button>
                <Button size="sm" variant="ghost" className="border border-white/20 text-white/85 hover:bg-white/10" onClick={() => nav(`/manage-booking?ref=${next.ref}`)} icon={<Luggage size={14} />}>
                  Add a bag
                </Button>
                <Button size="sm" variant="ghost" className="border border-white/20 text-white/85 hover:bg-white/10" onClick={() => toast({ tone: 'success', title: 'Sent to the group', body: 'Kwabena and Naa got the itinerary and the meet-at-door-4 note.' })} icon={<Send size={14} />}>
                  Share
                </Button>
              </div>
            </div>

            <div className="rounded-[14px] border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[.625rem] uppercase tracking-[0.16em] text-white/45">Travellers</p>
              <ul className="mt-2.5 space-y-2">
                {next.passengers.map((p) => (
                  <li key={p.id} className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-[.6875rem] font-bold text-white">{p.firstName.slice(0, 1)}</span>
                    <span className="min-w-0 flex-1 truncate text-[.875rem] text-white/85">
                      {p.firstName} {p.lastName}
                    </span>
                    <span className="num rounded-pill bg-white/10 px-2 py-0.5 text-[.6875rem] font-semibold text-white/80">{next.services.seats[p.id] ?? p.seat ?? 'TBA'}</span>
                  </li>
                ))}
              </ul>
              <Divider className="my-3 !bg-white/10" />
              <dl className="space-y-1.5 text-[.8125rem]">
                {[
                  ['Check-in', next.checkedIn ? 'Complete' : 'Opens 48 h before'],
                  ['Baggage', `${next.services.bags.length + (fareById(next.fareId).checkedBags || 0)} piece(s) paid`],
                  ['Total paid', money(next.totals.total, prefs.currency, { decimals: true })],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-white/45">{k}</dt>
                    <dd className="num font-medium text-white">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* tier progress */}
          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[.625rem] uppercase tracking-[0.16em] text-teal-300">Status</p>
                <p className="mt-1 font-display text-[1.125rem] font-semibold">
                  {tier.name}
                  {nextTier && <span className="text-white/50"> · {(nextTier.qualifyPoints - user.points).toLocaleString()} points to {nextTier.name}</span>}
                </p>
              </div>
              <p className="num text-[.8125rem] text-white/55">
                {user.points.toLocaleString()} / {(nextTier?.qualifyPoints ?? user.points).toLocaleString()} · {user.segments} sectors
              </p>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-gold-400" style={{ width: `${progress}%` }} />
            </div>
            {nextTier && (
              <p className="mt-2 text-[.75rem] text-white/50">
                Next unlock: {nextTier.benefits[0]} · earned on {nextTier.qualify.toLowerCase()}
              </p>
            )}
          </div>
        </AccountCard>
      ) : (
        <AccountCard>
          <EmptyState title="No trips booked yet" body="When you book, this is where check-in, seats and your boarding pass live." icon={<PlaneTakeoff size={20} />} action={<Button size="sm" onClick={() => nav('/book')}>Search flights</Button>} />
        </AccountCard>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        {/* trips list */}
        <AccountCard
          title="Your bookings"
          lead={`${upcoming.length} upcoming · ${past.length} past`}
          action={
            <div className="flex items-center gap-1 rounded-[10px] border border-line bg-mist-50 p-[3px]">
              {(['upcoming', 'past'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={cx('rounded-[7px] px-2.5 py-1 text-[.75rem] font-semibold capitalize transition', tab === t ? 'bg-white text-navy-900 shadow-card' : 'text-ink-500')}>
                  {t}
                </button>
              ))}
            </div>
          }
          className="p-0 [&>div:last-child]:p-0"
        >
          {(tab === 'upcoming' ? upcoming : past).length === 0 ? (
            <div className="p-5">
              <EmptyState title={tab === 'upcoming' ? 'Nothing coming up' : 'No past trips on this device'} body="Bookings you make in this demo are stored in your browser only." icon={<CalendarDays size={20} />} />
            </div>
          ) : (
            <ul>
              {(tab === 'upcoming' ? upcoming : past).slice(0, 5).map((b) => (
                <li key={b.ref}>
                  <Row
                    icon={<PlaneTakeoff size={15} />}
                    title={
                      <span className="flex flex-wrap items-center gap-2">
                        {b.itinerary.outbound.from} → {b.itinerary.outbound.to}
                        <span className="num text-[.75rem] font-normal text-ink-400">{b.ref}</span>
                      </span>
                    }
                    meta={`${fmtDate(b.itinerary.outbound.segments[0].depDateLabel, 'long')} · ${b.passengers.length} traveller${b.passengers.length > 1 ? 's' : ''} · ${fareById(b.fareId).name}`}
                    badge={<StatusBadge status={b.status === 'TICKETED' ? 'ON_TIME' : b.status === 'CANCELLED' ? 'CANCELLED' : b.status === 'PENDING_PAYMENT' ? 'DELAYED' : 'BOARDING'} />}
                    onClick={() => nav(`/manage-booking?ref=${b.ref}`)}
                  >
                    <ChevronRight size={15} className="shrink-0 text-ink-300" />
                  </Row>
                </li>
              ))}
            </ul>
          )}
        </AccountCard>

        {/* activity */}
        <AccountCard title="Recent activity" lead="Points, bags, documents and payments" action={<Button size="sm" variant="ghost" onClick={() => nav('/account/notifications')}>All notifications</Button>} className="p-0 [&>div:last-child]:p-0">
          <ul>
            {activity.map((a, i) => (
              <li key={i}>
                <Row icon={a.icon} title={a.t} meta={a.w} onClick={() => nav(a.to)}>
                  <ArrowRight size={14} className="shrink-0 text-ink-300" />
                </Row>
              </li>
            ))}
          </ul>
        </AccountCard>
      </div>

      {/* quick actions + recommendations */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1.15fr]">
        <AccountCard title="Quick actions">
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: <Ticket size={16} />, l: 'Check in', to: '/check-in' },
              { icon: <Luggage size={16} />, l: 'Add baggage', to: '/manage-booking' },
              { icon: <RotateCcw size={16} />, l: 'Request refund', to: '/manage-booking' },
              { icon: <Sparkles size={16} />, l: 'Use points', to: '/account/rewards' },
              { icon: <Send size={16} />, l: 'Share trip', to: '/account/trips' },
              { icon: <Check size={16} />, l: 'Mark alerts read', to: '', act: () => notifications.forEach((n) => markRead(n.id)) },
            ].map((a) => (
              <button key={a.l} onClick={() => (a.act ? a.act() : nav(a.to))} className="group flex items-center gap-2.5 rounded-[12px] border border-line px-3 py-2.5 text-left transition hover:border-navy-400 hover:bg-mist-50">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-navy-50 text-navy-700 transition group-hover:bg-navy-800 group-hover:text-white">{a.icon}</span>
                <span className="text-[.8125rem] font-medium text-navy-900">{a.l}</span>
              </button>
            ))}
          </div>
          <Divider className="my-4" />
          <p className="text-[.8125rem] leading-relaxed text-ink-500">
            {user.tier === 'Elite' || user.tier === 'Elite Plus' ? 'You have 4 upgrade certificates and 2 lounge guest passes to use before 31 December.' : 'Reach Voyager for two free lounge passes — 12,580 points away.'}
          </p>
        </AccountCard>

        <AccountCard title="Offers for your saved routes" lead="Accra ⇄ Lagos and Accra ⇄ London appear in your history">
          <div className="space-y-2.5">
            {OFFERS.slice(0, 3).map((o) => (
              <OfferCard key={o.id} o={o} compact />
            ))}
          </div>
          <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => nav('/offers')}>
            All offers
          </Button>
        </AccountCard>
      </div>

      <div className="pb-2 text-[.75rem] text-ink-400">
        Account data lives in this browser only. <button onClick={() => nav('/account/security')} className="font-semibold text-sky-700 hover:underline">
          Export or delete it
        </button>{' '}
        at any time.
      </div>

      {pass && next && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-navy-950/70 p-4 backdrop-blur-sm" onClick={() => setPass(false)}>
          <div className="w-full max-w-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            {next.passengers.slice(0, 2).map((p, i) => (
              <BoardingPass key={p.id} booking={next} paxIndex={i} />
            ))}
            <div className="flex justify-end gap-2">
              <Button variant="onDark" onClick={() => setPass(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
