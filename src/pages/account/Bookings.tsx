import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Check, Download, Filter, Luggage, MoreHorizontal, RotateCcw, Ticket } from 'lucide-react';
import { cx, fmtDate, money, relativeDay } from '../../lib/utils';
import { AccountCard, AccountHeader } from './AccountLayout';
import { Badge, Button, EmptyState, StatusBadge } from '../../components/ui/Primitives';
import { ConfirmDialog, Menu, MenuDivider, MenuItem, Modal } from '../../components/ui/Overlay';
import { Pagination } from '../../components/ui/Overlay';
import { Checkbox, Field, Input, SegmentedControl, Select, TextArea } from '../../components/ui/Form';
import { fareById } from '../../data/fares';
import { useStore } from '../../store/store';
import type { Booking } from '../../types';

const PAGE = 8;

export default function Bookings() {
  const { bookings, prefs, toast, updateBooking } = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | 'upcoming' | 'completed' | 'cancelled' | 'pending'>('all');
  const [sort, setSort] = useState<'date' | 'total' | 'created'>('date');
  const [page, setPage] = useState(1);
  const [refund, setRefund] = useState<Booking | null>(null);
  const [reason, setReason] = useState('change-of-mind');
  const [note, setNote] = useState('');
  const [confirm, setConfirm] = useState<string | null>(null);
  const [bagClaim, setBagClaim] = useState<Booking | null>(null);

  const rows = useMemo(() => {
    const now = Date.now();
    let out = bookings.filter((b) => `${b.ref} ${b.passengers.map((p) => `${p.firstName} ${p.lastName}`).join(' ')} ${b.itinerary.outbound.from}${b.itinerary.outbound.to}`.toLowerCase().includes(q.toLowerCase()));
    if (status === 'upcoming') out = out.filter((b) => new Date(b.itinerary.outbound.segments[0].dep).getTime() > now && b.status !== 'CANCELLED');
    if (status === 'completed') out = out.filter((b) => new Date(b.itinerary.outbound.segments[0].dep).getTime() <= now && b.status !== 'CANCELLED');
    if (status === 'cancelled') out = out.filter((b) => b.status === 'CANCELLED');
    if (status === 'pending') out = out.filter((b) => b.status === 'PENDING_PAYMENT' || b.status === 'REFUND_REQUESTED');
    const key = (b: Booking) => (sort === 'total' ? b.totals.total : sort === 'created' ? new Date(b.createdAt).getTime() : new Date(b.itinerary.outbound.segments[0].dep).getTime());
    return [...out].sort((a, b) => (sort === 'total' ? key(b) - key(a) : key(a) - key(b)));
  }, [bookings, q, status, sort]);

  const paged = rows.slice((page - 1) * PAGE, page * PAGE);
  const spend = rows.reduce((s, b) => s + b.totals.total, 0);

  return (
    <div>
      <AccountHeader
        title="Bookings"
        lead="Every ticket issued on this account, with refund state, bag claims and invoices attached."
        badge={<Badge tone="neutral">{rows.length} shown</Badge>}
        action={
          <>
            <Button size="sm" variant="secondary" icon={<Download size={14} />} onClick={() => toast({ tone: 'success', title: 'Statement downloaded', body: 'All bookings as CSV, with invoice numbers.' })}>
              Export CSV
            </Button>
            <Button size="sm" onClick={() => nav('/book')}>
              New booking
            </Button>
          </>
        }
      />

      <AccountCard className="mb-4 p-0 [&>div]:border-0 [&>div]:p-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <div className="relative min-w-[200px] flex-1">
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search reference, passenger, route…" className="h-10 pl-3" aria-label="Search bookings" />
          </div>
          <SegmentedControl
            size="sm"
            value={status}
            onChange={(v) => { setStatus(v); setPage(1); }}
            options={[
              { id: 'all', label: 'All' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' },
              { id: 'pending', label: 'Pending' },
              { id: 'cancelled', label: 'Cancelled' },
            ]}
          />
          <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-9 w-[146px] text-[.8125rem]" aria-label="Sort bookings">
            <option value="date">Departure date</option>
            <option value="created">Booked recently</option>
            <option value="total">Highest value</option>
          </Select>
          <Button size="sm" variant="ghost" icon={<Filter size={14} />}>
            More
          </Button>
        </div>

        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No bookings match" body="Clear the search, or add a booking by reference from another device." icon={<Ticket size={20} />} action={<Button size="sm" variant="secondary" onClick={() => { setQ(''); setStatus('all'); }}>Clear filters</Button>} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="table-base min-w-[720px]">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Route</th>
                    <th className="hide-below-md">Departs</th>
                    <th className="hide-below-lg">Fare</th>
                    <th className="text-right">Total</th>
                    <th className="text-right">Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {paged.map((b) => (
                    <tr key={b.ref}>
                      <td>
                        <button onClick={() => nav(`/manage-booking?ref=${b.ref}`)} className="num font-display text-[.9375rem] font-semibold text-navy-900 underline-offset-4 hover:underline">
                          {b.ref}
                        </button>
                        <p className="text-[.6875rem] text-ink-400">{relativeDay(b.createdAt)}</p>
                      </td>
                      <td>
                        <span className="num font-medium text-navy-900">
                          {b.itinerary.outbound.from} → {b.itinerary.outbound.to}
                        </span>
                        <p className="text-[.75rem] text-ink-500">
                          {b.passengers.length} pax · {b.passengers[0]?.lastName}
                        </p>
                      </td>
                      <td className="num hidden md:table-cell text-[.8125rem] text-ink-600">{fmtDate(b.itinerary.outbound.segments[0].depDateLabel, 'short')}</td>
                      <td className="hidden lg:table-cell text-[.8125rem] text-ink-600">{fareById(b.fareId).name}</td>
                      <td className="num text-right font-medium">{money(b.totals.total, prefs.currency, { decimals: true })}</td>
                      <td className="text-right">
                        <StatusBadge status={b.status === 'TICKETED' ? 'ON_TIME' : b.status === 'CANCELLED' ? 'CANCELLED' : b.status === 'PENDING_PAYMENT' ? 'DELAYED' : b.status === 'REFUND_REQUESTED' ? 'DIVERTED' : 'BOARDING'} />
                      </td>
                      <td className="text-right">
                        <Menu label={() => <MoreHorizontal size={16} className="text-ink-500" />} widthClass="w-60">
                          {(close) => (
                            <>
                              <MenuItem onClick={() => { nav(`/manage-booking?ref=${b.ref}`); close(); }}>Manage booking</MenuItem>
                              <MenuItem onClick={() => { nav(`/check-in?ref=${b.ref}`); close(); }}>Check in</MenuItem>
                              <MenuItem desc={fareById(b.fareId).refundable ? 'Refundable to travel wallet' : `Not refundable · taxes only`} onClick={() => { setRefund(b); close(); }}>
                                Request refund
                              </MenuItem>
                              <MenuItem onClick={() => { setBagClaim(b); close(); }} desc="Delayed, damaged or missing">
                                Baggage case
                              </MenuItem>
                              <MenuDivider />
                              <MenuItem onClick={() => { setConfirm(b.ref); close(); }} desc="Only for bookings with no travel left">
                                Remove from this device
                              </MenuItem>
                            </>
                          )}
                        </Menu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-3 py-2.5">
              <p className="num text-[.8125rem] text-ink-500">
                {rows.length} booking{rows.length === 1 ? '' : 's'} · {money(spend, prefs.currency, { decimals: true })} lifetime spend
              </p>
              <Pagination page={page} pages={Math.max(1, Math.ceil(rows.length / PAGE))} onChange={setPage} />
            </div>
          </>
        )}
      </AccountCard>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { icon: <RotateCcw size={16} />, t: 'Refunds we owe you', v: '1 in progress', d: 'USD 96 for the seat that never existed, back on your card by Friday.' },
          { icon: <Luggage size={16} />, t: 'Open baggage cases', v: 'Closed', d: 'Bag 221904 was delivered and signed for at Lagos on 12 Aug.' },
          { icon: <Download size={16} />, t: 'Invoices for expenses', v: `${bookings.length} available`, d: 'Tax invoices with your VAT reference, one click each.' },
        ].map((c) => (
          <div key={c.t} className="card p-4">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-navy-50 text-navy-700">{c.icon}</span>
            <p className="mt-3 text-[.75rem] font-semibold uppercase tracking-[0.1em] text-ink-400">{c.t}</p>
            <p className="num mt-1 font-display text-[1.125rem] font-semibold text-navy-900">{c.v}</p>
            <p className="mt-1.5 text-[.8125rem] leading-relaxed text-ink-500">{c.d}</p>
          </div>
        ))}
      </div>

      {/* refund */}
      <Modal
        open={!!refund}
        onClose={() => setRefund(null)}
        title="Request a refund"
        subtitle={refund ? `${refund.ref} · ${fareById(refund.fareId).name}` : ''}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRefund(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (refund) updateBooking(refund.ref, { status: 'REFUND_REQUESTED' });
                setRefund(null);
                toast({ tone: 'success', title: 'Refund requested', body: 'Decision within 24 hours. Wallet credit is instant once approved.' });
              }}
            >
              Submit request
            </Button>
          </>
        }
      >
        {refund && (
          <div className="space-y-4">
            <div className={cx('flex items-start gap-3 rounded-[12px] border-l-2 p-3.5', fareById(refund.fareId).refundable ? 'border-teal-500 bg-teal-50/70' : 'border-gold-500 bg-gold-100/50')}>
              {fareById(refund.fareId).refundable ? <Check size={16} className="mt-0.5 shrink-0 text-teal-700" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0 text-gold-600" />}
              <p className="text-[.875rem] leading-relaxed text-ink-700">
                {fareById(refund.fareId).refundable
                  ? `Your ${fareById(refund.fareId).name} fare is refundable. We return ${money(refund.totals.total, prefs.currency, { decimals: true })} to your travel wallet instantly, or to Visa •••• ${refund.payment?.last4} with a 10% admin charge.`
                  : `${fareById(refund.fareId).name} is not refundable as cash. If you cancel we hold ${money(Math.round(refund.totals.total * 0.6), prefs.currency)} as travel credit for 12 months, and all taxes are returned.`}
              </p>
            </div>
            <Field label="Reason">
              <Select value={reason} onChange={(e) => setReason(e.target.value)}>
                {[
                  ['change-of-mind', 'Plan changed'],
                  ['medical', 'Medical — certificate attached'],
                  ['visa', 'Visa refused'],
                  ['carrier', 'AeroNova changed or cancelled the flight'],
                  ['bereavement', 'Bereavement in the family'],
                  ['duplicate', 'Booked twice by mistake'],
                ].map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Anything we should know" hint="Medical and bereavement cases get a human within 4 hours, and we do consider them even on non-refundable fares.">
              <TextArea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Checkbox label="Attach a document" defaultChecked />
              <Checkbox label="Prefer travel wallet (instant)" defaultChecked={fareById(refund.fareId).refundable} />
            </div>
          </div>
        )}
      </Modal>

      {/* bag claim */}
      <Modal
        open={!!bagClaim}
        onClose={() => setBagClaim(null)}
        title="Open a baggage case"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setBagClaim(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setBagClaim(null);
                toast({ tone: 'success', title: 'Case BAG-10477 opened', body: 'Interim expenses of USD 120 paid to your card now.' });
              }}
            >
              Open case
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="What happened">
            <Select>
              {['Bag did not arrive', 'Bag arrived damaged', 'Contents missing', 'Bag arrived late (over 24 h)', 'Sports equipment damaged'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </Select>
          </Field>
          <Field label="Bag tag number" hint="Six digits from the sticker on your boarding pass">
            <Input placeholder="221904" className="num" />
          </Field>
          <p className="rounded-[10px] bg-mist-50 p-3 text-[.8125rem] leading-relaxed text-ink-500">
            Reporting before you leave the arrivals hall is faster — but you have 21 days, and we pay interim expenses the same day either way.
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null);
          toast({ tone: 'info', title: 'Removed from this device', body: 'It is still on the airline record; use the reference to add it back.' });
        }}
        title="Remove this booking?"
        confirmLabel="Remove"
        tone="danger"
        body="This only removes the local copy in this browser. Nothing is cancelled with the airline, and your wallet credit and points stay."
      />
    </div>
  );
}
