import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, BellOff, Check, CalendarDays, Filter, Heart, Luggage, Plane, Settings, Shield, Ticket, Trash2, X } from 'lucide-react';
import { cx, fmtDate, relativeDay, toISODate } from '../../lib/utils';
import { AccountCard, AccountHeader } from './AccountLayout';
import { Badge, Button, Divider, EmptyState } from '../../components/ui/Primitives';
import { ConfirmDialog, Menu, MenuDivider, MenuItem, Modal, Tabs } from '../../components/ui/Overlay';
import { Checkbox, Field, Input, RangeSlider, Select, Switch } from '../../components/ui/Form';
import { useStore } from '../../store/store';

type Sub = { id: string; label: string; detail: string; on: boolean; channel: string };

export default function Notifications() {
  const nav = useNavigate();
  const { notifications, markRead, markAllRead, toast, bookings, user } = useStore();
  const [tab, setTab] = useState<'inbox' | 'subscriptions' | 'alerts'>('inbox');
  const [filter, setFilter] = useState<'all' | 'unread' | 'trips' | 'rewards' | 'system'>('all');
  const [mute, setMute] = useState<string | null>(null);
  const [clear, setClear] = useState(false);
  const [quiet, setQuiet] = useState<[number, number]>([22, 7]);
  const [subs, setSubs] = useState<Sub[]>([
    { id: 's1', label: 'Gate, delay and cancellation alerts', detail: 'Push and SMS. Sent the moment the operations desk changes the record — usually before the airport boards do.', on: true, channel: 'Push + SMS' },
    { id: 's2', label: 'Baggage scan updates', detail: 'Four per bag: accepted, loaded, arrival scan, delivered.', on: true, channel: 'Push' },
    { id: 's3', label: 'Check-in opened', detail: 'One per trip, 48 hours before departure, with a deep link straight to the seat map.', on: true, channel: 'Push + Email' },
    { id: 's4', label: 'Boarding pass ready', detail: 'Sent to the phone wallet as well when auto check-in is on.', on: true, channel: 'Push' },
    { id: 's5', label: 'Points, status and tier changes', detail: 'Credited points, tier progress milestones, expiry warnings at 90 and 30 days.', on: true, channel: 'Email' },
    { id: 's6', label: 'Payment confirmations and refunds', detail: 'Every capture, refund and charge-back, with the receipt attached.', on: true, channel: 'Email' },
    { id: 's7', label: 'New routes and fare windows', detail: 'Eight emails a year at most. Written by the network team, not the CRM.', on: false, channel: 'Email' },
    { id: 's8', label: 'Lounge and upgrade offers', detail: 'Fixed price, only when a suite is genuinely open. Never an auction.', on: true, channel: 'Push' },
    { id: 's9', label: 'Travel document expiry reminders', detail: 'At 12 months, 6 months and 6 weeks before any document you store here expires.', on: true, channel: 'Email + Push' },
    { id: 's10', label: 'Security notices', detail: 'New device, new payment method, changed password. Cannot be turned off.', on: true, channel: 'Email + SMS' },
  ]);
  const toggle = (id: string) => setSubs((v) => v.map((x) => (x.id === id ? { ...x, on: !x.on } : x)));

  const inbox = useMemo(() => {
    const map: Record<string, string> = { trip: 'trips', ops: 'trips', rewards: 'rewards', baggage: 'trips', account: 'system' };
    return notifications.filter((n) => (filter === 'all' ? true : filter === 'unread' ? !n.read : map[n.kind] === filter));
  }, [notifications, filter]);

  const iconFor = (kind: string) => (kind === 'baggage' ? <Luggage size={15} /> : kind === 'rewards' ? <Heart size={15} /> : kind === 'account' ? <Shield size={15} /> : kind === 'ops' ? <AlertTriangle size={15} /> : <Plane size={15} />);
  const unread = notifications.filter((n) => !n.read).length;

  if (!user) return null;

  return (
    <div>
      <AccountHeader
        title="Notifications"
        lead="What arrived, what you are signed up to, and which flights you want followed. Unread items stay here for 30 days."
        badge={<Badge tone={unread ? 'gold' : 'teal'}>{unread ? `${unread} unread` : 'All read'}</Badge>}
        action={
          <>
            <Button size="sm" variant="ghost" onClick={() => setClear(true)} disabled={!notifications.length} icon={<Trash2 size={14} />}>
              Clear history
            </Button>
            <Button size="sm" variant="secondary" onClick={markAllRead} disabled={!unread} icon={<Check size={14} />}>
              Mark all read
            </Button>
          </>
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'inbox', label: 'Inbox', count: notifications.length },
          { id: 'subscriptions', label: 'Subscriptions', count: subs.filter((s) => s.on).length },
          { id: 'alerts', label: 'Flight alerts', count: bookings.filter((b) => b.status !== 'CANCELLED').length },
        ]}
        className="mb-4"
      />

      {tab === 'inbox' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <AccountCard
            className="p-0 [&>div:last-child]:p-0"
            title="Inbox"
            action={
              <div className="flex items-center gap-1 rounded-[10px] border border-line bg-mist-50 p-[3px]">
                {(['all', 'unread', 'trips', 'rewards', 'system'] as const).map((f) => (
                  <button key={f} onClick={() => setFilter(f)} className={cx('rounded-[7px] px-2 py-0.5 text-[.6875rem] font-semibold capitalize transition', filter === f ? 'bg-white text-navy-900 shadow-card' : 'text-ink-500 hover:text-navy-800')}>
                    {f}
                  </button>
                ))}
              </div>
            }
          >
            {inbox.length === 0 ? (
              <div className="p-5">
                <EmptyState title={filter === 'unread' ? 'Nothing unread' : 'Inbox is empty'} body="Alerts about your flights, bags, points and payments land here and in the app at the same time." icon={<BellOff size={20} />} />
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {inbox.map((n) => (
                  <li key={n.id} className={cx('group relative flex flex-wrap items-start gap-3 px-4 py-3.5 transition sm:px-5', !n.read && 'bg-sky-50/40')}>
                    {!n.read && <span className="absolute left-1.5 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-sky-500" aria-hidden />}
                    <span className={cx('mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[10px]', n.kind === 'ops' ? 'bg-gold-100 text-gold-600' : n.kind === 'rewards' ? 'bg-teal-50 text-teal-700' : 'bg-navy-50 text-navy-700')}>
                      {iconFor(n.kind)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-[.9375rem] font-semibold text-navy-900">{n.title}</p>
                        {!n.read && <Badge tone="sky">New</Badge>}
                        <Badge tone="neutral">{n.kind}</Badge>
                      </div>
                      <p className="mt-1 text-[.875rem] leading-relaxed text-ink-600">{n.body}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[.75rem] text-ink-400">{n.when}</span>
                        {n.kind === 'trip' && (
                          <Button size="sm" variant="secondary" onClick={() => nav('/check-in?ref=ANV7X2K')}>
                            Check in
                          </Button>
                        )}
                        {n.kind === 'ops' && (
                          <Button size="sm" variant="secondary" onClick={() => nav('/flight-status?flight=AN%20214')}>
                            See flight status
                          </Button>
                        )}
                        {n.kind === 'rewards' && (
                          <Button size="sm" variant="ghost" onClick={() => nav('/account/rewards')}>
                            Rewards
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {!n.read && (
                        <button onClick={() => markRead(n.id)} className="rounded-pill border border-line px-2 py-1 text-[.6875rem] font-semibold text-ink-500 hover:border-navy-400 hover:text-navy-900">
                          Mark read
                        </button>
                      )}
                      <Menu label={() => <span className="grid h-8 w-8 place-items-center rounded-full text-ink-400 opacity-60 transition hover:bg-mist-100 group-hover:opacity-100">⋯</span>} widthClass="w-56">
                        {(close) => (
                          <>
                            <MenuItem onClick={() => { close(); toast({ tone: 'info', title: 'Reminder set', body: 'This will come back tomorrow at 09:00.' }); }}>Snooze 24 h</MenuItem>
                            <MenuItem onClick={() => { close(); setMute(n.id); }}>Mute this topic</MenuItem>
                            <MenuDivider />
                            <MenuItem desc="Removed from this device only" onClick={() => { close(); setClear(true); }}>
                              Delete
                            </MenuItem>
                          </>
                        )}
                      </Menu>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AccountCard>

          <aside className="space-y-4">
            <AccountCard title="Delivery channels">
              <div className="divide-y divide-line">
                <Switch label="Push" desc="App on your phone and watch. The fastest channel we have." checked onChange={() => {}} />
                <Switch label="SMS" desc="Works without data at the gate. Charged to us, not you." checked={cx('').length >= 0} onChange={() => {}} />
                <Switch label="Email" desc="Everything with a document attached: tickets, receipts, invoices." checked onChange={() => {}} />
                <Switch label="WhatsApp" desc="Reply once to confirm; photos both ways for bag claims." checked={false} onChange={() => toast({ tone: 'success', title: 'WhatsApp linked', body: 'We will send the next disruption alert there too.' })} />
              </div>
              <Divider className="my-3" />
              <label className="block">
                <span className="flex items-baseline justify-between text-[.8125rem] font-medium text-navy-900">
                  <span>Quiet hours</span>
                  <span className="num text-ink-500">
                    {quiet[0]}:30 → {quiet[1]}:00
                  </span>
                </span>
                <RangeSlider min={18} max={24} value={[quiet[0], quiet[0]]} onChange={(v) => setQuiet([v[0], quiet[1]])} format={(n) => `${n}`} />
              </label>
              <p className="mt-2 text-[.75rem] leading-relaxed text-ink-400">Disruption alerts break quiet hours on purpose. Everything else waits until 06:30.</p>
            </AccountCard>

            <AccountCard title="Device check">
              <p className="text-[.8125rem] leading-relaxed text-ink-500">
                We send to the two devices signed in and the number on the booking, whichever pings first. If you change phones, the alerts follow the account.
              </p>
              <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => toast({ tone: 'success', title: 'Test alert sent', body: 'Should arrive in about 8 seconds. If it did not, open the app once to refresh the token.' })}>
                Send a test alert
              </Button>
            </AccountCard>
          </aside>
        </div>
      )}

      {tab === 'subscriptions' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <AccountCard
            title="What we send you"
            lead="Ten topics. Security notices cannot be turned off — that is your protection, not ours."
            action={
              <Button size="sm" variant="ghost" onClick={() => { setSubs((v) => v.map((x) => ({ ...x, on: true }))); toast({ tone: 'success', title: 'Everything on', body: 'Useful the week before a big trip.' }); }}>
                Enable all
              </Button>
            }
            className="p-0 [&>div:last-child]:p-0"
          >
            <ul className="divide-y divide-line">
              {subs.map((s) => (
                <li key={s.id} className={cx('flex flex-wrap items-start gap-4 px-4 py-3.5 transition sm:px-5', !s.on && 'bg-mist-50/50')}>
                  <span className={cx('mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[10px]', s.on ? 'bg-teal-50 text-teal-700' : 'bg-mist-100 text-ink-400')}>
                    {s.on ? <Bell size={15} /> : <BellOff size={15} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-display text-[.9375rem] font-semibold text-navy-900">
                      {s.label}
                      {s.id === 's10' && <Badge tone="neutral">Required</Badge>}
                    </p>
                    <p className="mt-1 text-[.875rem] leading-relaxed text-ink-500">{s.detail}</p>
                    <p className="mt-1.5 text-[.75rem] uppercase tracking-[0.08em] text-ink-400">{s.channel}</p>
                  </div>
                  <button
                    disabled={s.id === 's10'}
                    onClick={() => toggle(s.id)}
                    aria-pressed={s.on}
                    aria-label={`${s.on ? 'Mute' : 'Enable'} ${s.label}`}
                    className={cx('relative mt-1 h-6 w-11 shrink-0 rounded-full border transition disabled:opacity-40', s.on ? 'border-teal-600 bg-teal-500' : 'border-ink-200 bg-mist-200')}
                  >
                    <span className={cx('absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all', s.on ? 'left-[22px]' : 'left-[2px]')} />
                  </button>
                </li>
              ))}
            </ul>
          </AccountCard>
          <aside className="space-y-4">
            <AccountCard title="Summary">
              <ul className="space-y-1.5 text-[.8125rem]">
                {[
                  ['On', subs.filter((s) => s.on).length],
                  ['Muted', subs.filter((s) => !s.on).length],
                  ['Emails last 30 days', 6],
                  ['Pushes last 30 days', 21],
                  ['SMS last 30 days', 2],
                ].map(([k, v]) => (
                  <li key={String(k)} className="flex justify-between border-b border-line pb-1 last:border-0">
                    <span className="text-ink-500">{k}</span>
                    <span className="num font-semibold text-navy-900">{v}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[.75rem] leading-relaxed text-ink-400">Too much noise? The weekly digest replaces everything except disruption alerts and receipts.</p>
              <Button size="sm" variant="secondary" className="mt-2.5 w-full" onClick={() => toast({ tone: 'success', title: 'Digest mode on', body: 'One email on Mondays. Flight and bag alerts stay immediate.' })}>
                Switch to weekly digest
              </Button>
            </AccountCard>
            <AccountCard title="Do not disturb">
              <Field label="Pause everything until">
                <Select defaultValue="48h">
                  {[['24h', '24 hours'], ['48h', '48 hours'], ['7d', 'A week'], ['until-trip', 'Until my next trip ends']].map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </Field>
              <Checkbox label="Except safety, cancellation and gate changes" defaultChecked />
              <Button size="sm" className="mt-3 w-full" onClick={() => toast({ tone: 'info', title: 'Paused', body: 'Resuming automatically. Disruption alerts still come through.' })}>
                Pause alerts
              </Button>
            </AccountCard>
          </aside>
        </div>
      )}

      {tab === 'alerts' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <AccountCard title="Flights you are following" lead="Status alerts for any flight number, whether or not you are on it." className="p-0 [&>div:last-child]:p-0">
            {bookings.filter((b) => b.status !== 'CANCELLED').length === 0 ? (
              <div className="p-5">
                <EmptyState title="No flights followed" body="Follow a flight from the status page and we will message you on delay, gate and belt changes." icon={<Plane size={20} />} action={<Button size="sm" onClick={() => nav('/flight-status')}>Flight status</Button>} />
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {bookings
                  .filter((b) => b.status !== 'CANCELLED')
                  .map((b) => {
                    const s = b.itinerary.outbound.segments[0];
                    return (
                      <li key={b.ref} className="flex flex-wrap items-center gap-4 px-4 py-3.5 sm:px-5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-navy-50 text-navy-700">
                          <Plane size={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="num font-display text-[.9375rem] font-semibold text-navy-900">
                            {s.flightNo} · {s.from} → {s.to}
                          </p>
                          <p className="text-[.8125rem] text-ink-500">
                            {fmtDate(s.depDateLabel, 'long')} · booked {relativeDay(b.createdAt)} · {b.ref}
                          </p>
                        </div>
                        <Badge tone="teal" dot>
                          All channels
                        </Badge>
                        <Button size="sm" variant="secondary" onClick={() => nav(`/flight-status?flight=${encodeURIComponent(s.flightNo)}`)}>
                          Status
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => toast({ tone: 'info', title: 'Alerts updated', body: 'You will now also be told about the connecting sector.' })}>
                          Include connections
                        </Button>
                      </li>
                    );
                  })}
              </ul>
            )}
            <div className="border-t border-line p-4 sm:p-5">
              <p className="mb-2 text-2xs font-semibold uppercase tracking-[0.14em] text-ink-400">Follow another flight</p>
              <div className="flex flex-wrap gap-2">
                <Field label="Flight number" className="min-w-[150px] flex-1">
                  <Input placeholder="AN 300" className="num uppercase" />
                </Field>
                <Field label="Date" className="min-w-[150px] flex-1">
                  <Input type="date" defaultValue={toISODate(new Date())} className="num" />
                </Field>
                <Button className="mt-6" onClick={() => toast({ tone: 'success', title: 'Following AN 300', body: 'We will message you about delay, gate and belt changes on that flight.' })}>
                  Follow
                </Button>
              </div>
            </div>
          </AccountCard>

          <aside className="space-y-4">
            <AccountCard title="Recent deliveries">
              <ul className="space-y-2.5 text-[.8125rem]">
                {[
                  ['Push · gate change', 'delivered in 1.2 s', '2 h ago'],
                  ['SMS · check-in open', 'delivered', '2 h ago'],
                  ['Email · e-ticket × 3', 'delivered', relativeDay(new Date().toISOString())],
                  ['Push · bag scan', 'delivered in 0.9 s', '3 days ago'],
                  ['WhatsApp · delay', 'read', '3 days ago'],
                ].map(([a, b, c]) => (
                  <li key={a} className="flex items-start justify-between gap-3 border-b border-line pb-1.5 last:border-0">
                    <span>
                      <span className="block font-medium text-navy-900">{a}</span>
                      <span className="block text-[.75rem] text-teal-700">{b}</span>
                    </span>
                    <span className="text-[.75rem] text-ink-400">{c}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[.75rem] leading-relaxed text-ink-400">Delivery times are measured from the moment our operations desk saves the change, not when we queued it.</p>
            </AccountCard>
            <AccountCard title="Trouble receiving?">
              <ul className="space-y-2 text-[.8125rem] text-ink-600">
                {[
                  'Open the app once — push tokens expire after 30 days unused.',
                  'SMS from 27806 must not be blocked; it is a short code, not a number.',
                  'Add noreply@aeronova.aero to contacts or the ticket lands in promotions.',
                ].map((x) => (
                  <li key={x} className="flex gap-2">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-teal-500" /> {x}
                  </li>
                ))}
              </ul>
              <Button size="sm" variant="secondary" className="mt-3 w-full" icon={<Settings size={14} />} onClick={() => nav('/account/preferences')}>
                Channel settings
              </Button>
            </AccountCard>
          </aside>
        </div>
      )}

      <Modal
        open={!!mute}
        onClose={() => setMute(null)}
        title="Mute this topic"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setMute(null)}>
              Keep it on
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setMute(null);
                toast({ tone: 'info', title: 'Muted for 30 days', body: 'Anything about a disruption to your own flight still comes through.' });
              }}
            >
              Mute for 30 days
            </Button>
          </>
        }
      >
        <p className="text-[.875rem] leading-relaxed text-ink-600">
          We will stop sending this topic for 30 days. Flight safety, cancellation and gate-change alerts cannot be muted, and we do not ask you to try.
        </p>
      </Modal>

      <ConfirmDialog
        open={clear}
        onCancel={() => setClear(false)}
        onConfirm={() => {
          setClear(false);
          toast({ tone: 'info', title: 'Inbox cleared', body: 'Alerts already sent stay in your email and SMS history.' });
        }}
        title="Clear this notification history?"
        confirmLabel="Clear"
        tone="danger"
        body="Removes the messages from this account view. It does not unsubscribe you from anything — use Subscriptions for that."
      />

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-card border border-dashed border-line bg-white p-4">
        <CalendarDays size={16} className="text-ink-400" />
        <p className="flex-1 text-[.875rem] text-ink-600">
          Want a summary instead of a stream? The weekly digest covers points, status and new routes in one Monday email.
        </p>
        <Button size="sm" variant="secondary" icon={<Filter size={14} />} onClick={() => toast({ tone: 'success', title: 'Digest enabled' })}>
          Weekly digest
        </Button>
        <button onClick={() => { setTab('subscriptions'); }} className="text-[.8125rem] font-semibold text-sky-700 underline-offset-4 hover:underline">
          <X size={14} className="inline" /> no thanks
        </button>
        <span className="hidden sm:block">
          <Badge tone="neutral">
            <Ticket size={11} className="mr-1 inline" />3 alerts sent this month
          </Badge>
        </span>
      </div>
    </div>
  );
}
