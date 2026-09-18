import { useMemo, useState } from 'react';
import { AlertTriangle, Banknote, Check, CircleDollarSign, Clock, CreditCard, Download, Filter, Luggage, MessageSquare, Phone, Plus, RefreshCw, Search, Send, Shield, Ticket, X } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts';
import { cx, fmtDate, money, toISODate } from '../../lib/utils';
import { ADMIN_BAGGAGE, ADMIN_PAYMENTS, ADMIN_REFUNDS, ADMIN_TICKETS, ANALYTICS_EXTRA } from '../../data/admin';
import { AdminPage, BarList, MiniTable, Panel } from './AdminApp';
import { Badge, Button, Divider, EmptyState, Meter } from '../../components/ui/Primitives';
import { DataTable, KpiCard, type Column } from '../../components/ui/Table';
import { Modal, Tabs } from '../../components/ui/Overlay';
import { Checkbox, Field, Input, SegmentedControl, Select, TextArea } from '../../components/ui/Form';
import { useStore } from '../../store/store';

const AXIS = { fontSize: 11, fill: '#7A8798' } as const;
const tip = { borderRadius: 12, border: '1px solid #E1E8F0', fontSize: 12, fontFamily: 'Inter, sans-serif' };

/* ============================= PAYMENTS ============================= */
function Payments() {
  const { toast } = useStore();
  const [tab, setTab] = useState<'ledger' | 'psp' | 'recon'>('ledger');
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [capture, setCapture] = useState<string | null>(null);

  const rows = useMemo(() => ADMIN_PAYMENTS.filter((p) => (status === 'all' || p.status.split(' ')[0].toLowerCase() === status) && `${p.id} ${p.ref} ${p.method}`.toLowerCase().includes(q.toLowerCase())), [status, q]);
  const captured = ADMIN_PAYMENTS.filter((p) => p.status === 'Captured' || p.status === 'Settled');
  const failed = ADMIN_PAYMENTS.filter((p) => p.status.startsWith('Failed'));
  const authed = ADMIN_PAYMENTS.filter((p) => p.status === 'Authorised');
  const series = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000);
    const base = 2.4 + Math.sin(i / 2.2) * 0.6 + (i % 3) * 0.12;
    return { day: fmtDate(toISODate(d), 'short').slice(0, 5), volume: Math.round(base * 1e6), fees: Math.round(base * 1e6 * 0.014), fails: Math.round(base * 1e6 * 0.021) };
  });

  return (
    <AdminPage
      title="Payment gateway"
      lead="Authorisations, captures, PSP routing and reconciliation. Nothing here refunds on its own — every payout needs a second approver above USD 5,000."
      actions={
        <>
          <Button size="sm" variant="secondary" icon={<Download size={14} />} onClick={() => toast({ tone: 'success', title: 'Settlement file exported', body: 'Adyen + Flutterwave payouts, CSV, ready for the bank reconciliation.' })}>
            Export settlement
          </Button>
          <Button size="sm" icon={<RefreshCw size={14} />} onClick={() => toast({ tone: 'info', title: 'Re-running PSP failover', body: 'NovaPay degraded at 11:42; 22% of traffic moved to Adyen automatically.' })}>
            Reconcile now
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Captured today" value={money(captured.reduce((s, p) => s + p.amount, 0) * 42, 'USD')} tone="teal" delta={5.2} note="1,284 transactions" icon={<CircleDollarSign size={15} />} />
        <KpiCard label="Authorised, not captured" value={money(authed.reduce((s, p) => s + p.amount, 0) * 18, 'USD')} tone="gold" note={`${authed.length * 18} held · auto-release 30 min`} />
        <KpiCard label="Failed" value={String(failed.length * 9)} tone="red" note="2.1% · 51 do-not-honour dominant" icon={<X size={15} />} />
        <KpiCard label="Blended cost" value="1.38%" tone="navy" note="down 4 bps after the PSP rebalance" />
        <KpiCard label="Chargebacks open" value="7" tone="ember" note="evidence filed on 5" icon={<Shield size={15} />} />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'ledger', label: 'Transaction ledger', count: rows.length },
          { id: 'psp', label: 'Providers & routing' },
          { id: 'recon', label: 'Reconciliation' },
        ]}
      />

      {tab === 'ledger' && (
        <Panel pad={false}>
          <div className="flex flex-wrap items-center gap-2 border-b border-[#E1E8F0] px-4 py-2.5">
            <div className="relative min-w-[180px] flex-1 max-w-xs">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Auth code, PNR, card" className="h-9 pl-8 text-[.8125rem]" aria-label="Filter payments" />
            </div>
            {['all', 'Captured', 'Authorised', 'Settled', 'Failed', 'Refunded'].map((s) => (
              <button key={s} onClick={() => setStatus(s.toLowerCase())} className={cx('rounded-pill border px-2.5 py-1 text-[.75rem] font-semibold capitalize transition', status === s.toLowerCase() || (status === 'all' && s === 'all') ? 'border-[#0B2340] bg-[#0B2340] text-white' : 'border-[#E1E8F0] text-ink-500 hover:border-navy-300')}>
                {s}
              </button>
            ))}
          </div>
          {rows.length === 0 ? (
            <div className="p-6">
              <EmptyState title="No transactions match" body="Payment records are kept for 7 years; try the auth code from the receipt." icon={<Search size={20} />} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-[.8125rem]">
                <thead>
                  <tr className="border-b border-[#E1E8F0] bg-[#F7FAFC] text-2xs uppercase tracking-wider text-ink-400">
                    {['Payment', 'Booking', 'Method', 'PSP', 'Amount', 'Fee', 'Status', 'Time', ''].map((h, i) => (
                      <th key={h} className={cx('px-3 py-2 font-semibold', i >= 4 && i <= 6 && 'text-right')}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDF1F6]">
                  {rows.map((p) => (
                    <tr key={p.id} className="transition hover:bg-[#F2F7FB]">
                      <td className="num px-3 py-2 font-semibold text-[#0B2340]">
                        {p.id}
                        <span className="block text-[.6875rem] font-normal text-ink-400">auth {p.auth}</span>
                      </td>
                      <td className="num px-3 py-2">{p.ref}</td>
                      <td className="px-3 py-2">
                        <span className="flex items-center gap-1.5">
                          {p.method.includes('••••') ? <CreditCard size={13} className="text-ink-400" /> : <SmartPhoneIcon />} {p.method}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-ink-500">{p.psp}</td>
                      <td className="num px-3 py-2 text-right font-semibold">
                        {money(p.amount, p.currency as never, { decimals: true })}
                      </td>
                      <td className="num px-3 py-2 text-right text-ink-500">{money(p.fee, 'USD', { decimals: true })}</td>
                      <td className="px-3 py-2 text-right">
                        <Badge tone={p.status === 'Captured' || p.status === 'Settled' ? 'teal' : p.status.startsWith('Failed') ? 'red' : p.status === 'Refunded' ? 'ember' : 'gold'}>{p.status}</Badge>
                      </td>
                      <td className="num px-3 py-2 text-ink-400">
                        {p.time}
                        <span className="block text-[.625rem]">{fmtDate(p.date, 'short')}</span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {p.status === 'Authorised' && (
                          <button onClick={() => setCapture(p.id)} className="rounded-[7px] border border-[#E1E8F0] px-2 py-1 text-[.6875rem] font-semibold text-ink-600 hover:border-navy-400 hover:text-navy-900">
                            Capture
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      {tab === 'psp' && (
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <Panel pad={false} title="Provider performance" lead="Rolling 24 h · routing weights are live">
            <table className="w-full min-w-[720px] text-left text-[.8125rem]">
              <thead>
                <tr className="border-b border-[#E1E8F0] bg-[#F7FAFC] text-2xs uppercase tracking-wider text-ink-400">
                  {['Provider', 'Volume', 'Auth rate', 'Cost', 'Latency', 'State', 'Weight'].map((h, i) => (
                    <th key={h} className={cx('px-3 py-2 font-semibold', i >= 1 && i <= 4 && 'text-right')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF1F6]">
                {[
                  ['NovaPay (own)', '48.2M', '96.4%', '0.92%', '280 ms', 'healthy', 46],
                  ['Flutterwave', '11.6M', '94.1%', '1.34%', '410 ms', 'healthy', 24],
                  ['Adyen', '9.4M', '97.2%', '1.61%', '330 ms', 'degraded', 22],
                  ['Paystack', '3.1M', '93.8%', '1.42%', '460 ms', 'healthy', 8],
                ].map((r) => (
                  <tr key={r[0] as string} className="transition hover:bg-[#F2F7FB]">
                    <td className="px-3 py-2 font-semibold text-[#0B2340]">
                      {r[0]}
                      <span className="num block text-[.6875rem] font-normal text-ink-400">{r[6]}% of traffic</span>
                    </td>
                    <td className="num px-3 py-2 text-right">USD {r[1]}</td>
                    <td className={cx('num px-3 py-2 text-right font-semibold', Number(String(r[2]).slice(0, 2)) < 95 ? 'text-gold-600' : 'text-teal-700')}>{r[2]}</td>
                    <td className="num px-3 py-2 text-right text-ink-500">{r[3]}</td>
                    <td className="num px-3 py-2 text-right text-ink-500">{r[4]}</td>
                    <td className="px-3 py-2 text-right">
                      <Badge tone={r[5] === 'healthy' ? 'teal' : 'gold'}>{r[5]}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      <Meter value={r[6] as number} tone="navy" className="ml-auto w-24" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-wrap items-center gap-2 border-t border-[#E1E8F0] px-4 py-3 text-[.75rem] text-ink-500">
              <AlertTriangle size={14} className="text-gold-600" /> Adyen degraded on 3-D Secure step-up (p95 1.9 s). Failover threshold is 1.2 s — the router already shifted 22% of traffic.
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => toast({ tone: 'success', title: 'Routing saved', body: 'Weights updated live; no queue restart needed.' })}>
                Save weights
              </Button>
            </div>
          </Panel>
          <div className="space-y-4">
            <Panel title="Volume & failure rate" lead="14 days, USD millions">
              <div className="h-[190px]">
                <ResponsiveContainer>
                  <AreaChart data={series} margin={{ top: 6, right: 6, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0B2340" stopOpacity={0.28} />
                        <stop offset="100%" stopColor="#0B2340" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#EDF1F6" vertical={false} />
                    <XAxis dataKey="day" tick={{ ...AXIS, fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis tick={AXIS} axisLine={false} tickLine={false} width={44} tickFormatter={(v: number) => `${(v / 1e6).toFixed(1)}M`} />
                    <RTooltip contentStyle={tip} formatter={(v: number) => money(v)} />
                    <Area type="monotone" dataKey="volume" stroke="#0B2340" strokeWidth={2} fill="url(#vol)" />
                    <Area type="monotone" dataKey="fails" stroke="#DC2626" strokeWidth={1.4} fill="#DC2626" fillOpacity={0.08} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="Method mix" lead="Share of captured volume">
              <BarList
                tone="teal"
                rows={[
                  { label: 'Cards (Visa / MC / Amex)', value: 61, note: 'auth rate 96.1%' },
                  { label: 'Mobile money', value: 19, note: 'MoMo 12% · M-Pesa 5% · other 2%' },
                  { label: 'Travel wallet', value: 9, note: 'no fee, no failure' },
                  { label: 'Corporate invoice', value: 7, note: '30-day terms' },
                  { label: 'Bank transfer', value: 4, note: 'manual match' },
                ]}
              />
            </Panel>
          </div>
        </div>
      )}

      {tab === 'recon' && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Panel pad={false} title="Daily reconciliation" lead="Airline ledger vs PSP settlement, unmatched items first">
            <table className="w-full min-w-[680px] text-left text-[.8125rem]">
              <thead>
                <tr className="border-b border-[#E1E8F0] bg-[#F7FAFC] text-2xs uppercase tracking-wider text-ink-400">
                  {['Date', 'Ledger', 'Settled', 'Variance', 'Unmatched', 'State'].map((h, i) => (
                    <th key={h} className={cx('px-3 py-2 font-semibold', i >= 1 && i <= 4 && 'text-right')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF1F6]">
                {series.slice(-8).reverse().map((s, i) => {
                  const variance = Math.round(s.volume * (i === 0 ? 0.0042 : i === 1 ? 0.0012 : 0.0001));
                  return (
                    <tr key={s.day} className="transition hover:bg-[#F2F7FB]">
                      <td className="num px-3 py-2 font-semibold text-[#0B2340]">{s.day}</td>
                      <td className="num px-3 py-2 text-right">{money(s.volume)}</td>
                      <td className="num px-3 py-2 text-right">{money(s.volume - variance)}</td>
                      <td className={cx('num px-3 py-2 text-right font-semibold', variance > 30000 ? 'text-red-600' : variance > 8000 ? 'text-gold-600' : 'text-teal-700')}>{money(variance)}</td>
                      <td className="num px-3 py-2 text-right">{i === 0 ? 14 : i === 1 ? 3 : 0}</td>
                      <td className="px-3 py-2 text-right">
                        <Badge tone={variance > 30000 ? 'red' : variance > 8000 ? 'gold' : 'teal'}>{variance > 30000 ? 'investigating' : variance > 8000 ? 'open' : 'matched'}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex flex-wrap items-center gap-3 border-t border-[#E1E8F0] px-4 py-3 text-[.75rem] text-ink-500">
              <span className="num">Unmatched today: 14 items · {money(58412)} · mostly mobile-money reversals that settle a day late</span>
              <Button size="sm" variant="secondary" className="ml-auto" onClick={() => toast({ tone: 'success', title: 'Auto-match run queued', body: 'Matches on auth code and amount within ±USD 1. Expected to clear 11 of 14.' })}>
                Run auto-match
              </Button>
            </div>
          </Panel>
          <div className="space-y-4">
            <Panel title="Fees by provider" lead="Blended 1.38% of captured volume">
              <div className="h-[168px]">
                <ResponsiveContainer>
                  <BarChart data={[{ m: 'NovaPay', fee: 0.92, alt: 1.1 }, { m: 'Adyen', fee: 1.61, alt: 1.7 }, { m: 'Flutterwave', fee: 1.34, alt: 1.4 }, { m: 'Paystack', fee: 1.42, alt: 1.5 }]} margin={{ top: 6, right: 6, bottom: 0, left: -24 }}>
                    <CartesianGrid stroke="#EDF1F6" vertical={false} />
                    <XAxis dataKey="m" tick={AXIS} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS} axisLine={false} tickLine={false} width={40} />
                    <RTooltip contentStyle={tip} formatter={(v: number) => `${v}%`} />
                    <Bar dataKey="fee" fill="#0B2340" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="alt" fill="#0FA79A" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-[.75rem] leading-relaxed text-ink-400">Owning the acquiring stack (NovaPay) costs us engineering and saves about {money(4.1e6)} a year on a 3.9bn payment base. The alternative bars are the best counter-offer we have.</p>
            </Panel>
            <Panel title="Chargebacks" lead="7 open · win rate 78%">
              <MiniTable head={['Case', 'Amount', 'Reason', 'Age', 'Stage']} rows={[['CB-88214', money(1240), 'service not as described', '4 d', 'evidence filed'], ['CB-88209', money(386), 'duplicate processing', '6 d', 'represented'], ['CB-88198', money(2890), 'unauthorised', '11 d', 'pre-arbitration']].map((r) => r.map((c, i) => (i === 4 ? <Badge key={i} tone={c === 'evidence filed' ? 'teal' : c === 'pre-arbitration' ? 'gold' : 'neutral'}>{c}</Badge> : <span key={i} className={i === 0 ? 'num font-semibold' : ''}>{c}</span>)))} />
            </Panel>
          </div>
        </div>
      )}

      <Modal
        open={!!capture}
        onClose={() => setCapture(null)}
        title="Capture this authorisation"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCapture(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setCapture(null);
                toast({ tone: 'success', title: `${capture} captured`, body: 'Sent to NovaPay; settlement lands T+1. E-ticket is released automatically.' });
              }}
            >
              Capture
            </Button>
          </>
        }
      >
        <p className="text-[.875rem] leading-relaxed text-ink-600">
          Capturing moves the held funds. If the booking was already cancelled upstream, the capture will fail and the hold falls off in three days — check the PNR first.
        </p>
        <div className="mt-3">
          <Checkbox label="Release the ticket on capture" defaultChecked />
          <Checkbox label="Email the receipt to the passenger" defaultChecked />
        </div>
      </Modal>
    </AdminPage>
  );
}

const SmartPhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="6" y="2.5" width="12" height="19" rx="3" stroke="currentColor" strokeWidth="1.7" />
    <path d="M10.5 18.5h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

/* ============================= REFUNDS ============================= */
function Refunds() {
  const { toast } = useStore();
  const [sel, setSel] = useState<(typeof ADMIN_REFUNDS)[number] | null>(null);
  const [decision, setDecision] = useState<'approve' | 'partial' | 'decline'>('approve');
  const [note, setNote] = useState('');
  const [target, setTarget] = useState<'wallet' | 'card'>('wallet');
  const queue = ADMIN_REFUNDS.filter((r) => r.status.startsWith('Pending'));
  const done = ADMIN_REFUNDS.filter((r) => !r.status.startsWith('Pending'));

  return (
    <AdminPage
      title="Refund processing"
      lead="Queue, decisions and payout rails. Median approval is 1.7 days against a promised 3, and every decision sends the passenger a plain-language explanation."
      actions={
        <>
          <Button size="sm" variant="secondary" icon={<Download size={14} />}>
            Export queue
          </Button>
          <Button size="sm" icon={<Check size={14} />} onClick={() => toast({ tone: 'success', title: 'Bulk approved', body: `${queue.length - 1} low-value refunds paid to wallet; the over-$1,000 one still needs a supervisor.` })}>
            Approve all under $1,000
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Open" value={String(queue.length)} tone="gold" note={`${queue.filter((r) => r.age.includes('d') && Number(r.age.replace('d', '')) > 10).length} past SLA`} icon={<Clock size={15} />} />
        <KpiCard label="Value pending" value={money(queue.reduce((s, r) => s + r.amount, 0) * 24)} note="held against cash" />
        <KpiCard label="Median approval" value="1.7 d" tone="teal" delta={-12.5} note="promise is 3 days" />
        <KpiCard label="Decline rate" value="8.4%" tone="sky" note="down from 12% after the policy rewrite" />
        <KpiCard label="Paid to wallet" value="63%" tone="navy" note="instant, no fee, 12-month life" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel pad={false} title="Queue" lead="Ordered by age × value · click to decide">
          <table className="w-full min-w-[720px] text-left text-[.8125rem]">
            <thead>
              <tr className="border-b border-[#E1E8F0] bg-[#F7FAFC] text-2xs uppercase tracking-wider text-ink-400">
                {['Case', 'Booking', 'Passenger', 'Amount', 'Reason', 'Age', 'SLA', 'Status', ''].map((h, i) => (
                  <th key={h} className={cx('px-3 py-2 font-semibold', i >= 3 && i <= 6 && 'text-right')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1F6]">
              {[...queue, ...done].map((r) => {
                const days = Number(r.age.replace('d', ''));
                return (
                  <tr key={r.id} onClick={() => { setSel(r); setNote(''); }} className="cursor-pointer transition hover:bg-[#F2F7FB]">
                    <td className="num px-3 py-2 font-semibold text-[#0B2340]">{r.id}</td>
                    <td className="num px-3 py-2">{r.ref}</td>
                    <td className="px-3 py-2">{r.passenger}</td>
                    <td className="num px-3 py-2 text-right font-semibold">{money(r.amount)}</td>
                    <td className="max-w-[200px] px-3 py-2">
                      <span className="block truncate text-ink-500">{r.reason}</span>
                    </td>
                    <td className={cx('num px-3 py-2 text-right font-semibold', days > 10 ? 'text-red-600' : days > 5 ? 'text-gold-600' : 'text-ink-500')}>{r.age}</td>
                    <td className="px-3 py-2 text-right">
                      <Meter value={r.sla} tone={r.sla > 85 ? 'teal' : r.sla > 50 ? 'gold' : 'ember'} className="ml-auto w-16" />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Badge tone={r.status === 'Paid' ? 'teal' : r.status === 'Approved' ? 'sky' : r.status === 'Declined' ? 'red' : r.status === 'Partially approved' ? 'gold' : 'neutral'}>{r.status}</Badge>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <ChevronRight />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>

        <div className="space-y-4">
          <Panel title="Why refunds are owed" lead="Last 90 days">
            <BarList
              tone="navy"
              rows={[
                { label: 'Carrier cancelled the flight', value: 4120, note: 'always full refund' },
                { label: 'Schedule change over 6 h', value: 2884, note: 'full refund, any fare' },
                { label: 'Flex fare cancelled', value: 1962, note: 'to wallet' },
                { label: 'Duplicate charge', value: 811, note: 'auto-refunded' },
                { label: 'Visa denial', value: 402, note: 'considered case by case' },
                { label: 'Medical / bereavement', value: 388, note: 'refunded even on Light' },
              ]}
            />
            <p className="mt-3 text-[.75rem] leading-relaxed text-ink-400">Two of these are us, not the passenger. Policy: if we caused it, we never argue about fare rules.</p>
          </Panel>
          <Panel title="Payout rails" lead="What we can push money back through">
            <MiniTable head={['Rail', 'Speed', 'Fee', 'State']} rows={[['Original card', '5–10 d', 'none', 'open'], ['Travel wallet', 'instant', 'none', 'open'], ['Bank transfer', '2 d', money(8), 'open'], ['Mobile money', 'minutes', '0.4%', 'open'], ['Cheque', '21 d', money(14), 'manual only']].map((r) => r.map((c, i) => (i === 3 ? <Badge key={i} tone={c === 'manual only' ? 'gold' : 'teal'}>{c}</Badge> : <span key={i} className={i === 0 ? 'font-semibold' : ''}>{c}</span>)))} />
          </Panel>
          <Panel title="Policy notes" lead="The three rules that decide most cases">
            <ul className="space-y-2 text-[.8125rem] leading-relaxed text-ink-600">
              {[
                'Within 24 hours of booking: always full refund, any fare, if travel is more than 7 days away.',
                'Anything we caused: full refund plus re-protection, regardless of fare rules.',
                'Non-refundable fares: taxes are always returned; the rest becomes credit for 12 months.',
              ].map((x, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="num mt-0.5 h-5 w-5 shrink-0 rounded-full bg-[#0B2340] text-center text-[.6875rem] font-bold leading-5 text-white">{i + 1}</span>
                  {x}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <Modal
        open={!!sel}
        onClose={() => setSel(null)}
        title={sel ? `${sel.id} · ${sel.ref}` : ''}
        subtitle={sel ? `${sel.passenger} · ${money(sel.amount)} · ${sel.reason} · ${sel.age} old` : ''}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSel(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                toast({ tone: decision === 'decline' ? 'warn' : 'success', title: `Refund ${decision === 'approve' ? 'approved' : decision === 'partial' ? 'part-approved' : 'declined'}`, body: target === 'wallet' ? 'Wallet credit issued instantly; passenger emailed with the reasoning.' : 'Queued to the card; expect 5–10 working days.' });
                setSel(null);
              }}
            >
              {decision === 'decline' ? 'Send decline' : 'Pay refund'}
            </Button>
          </>
        }
      >
        {sel && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['Requested', money(sel.amount)],
                ['Ticketed', money(sel.amount * 0.94)],
                ['Fare rules', sel.reason.includes('Flex') ? 'refundable' : 'non-refundable'],
                ['Agent', sel.agent],
                ['Rail', sel.method],
                ['SLA left', `${Math.max(0, 72 - Number(sel.age.replace('d', '')) * 24)} h`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-[10px] border border-[#E1E8F0] p-2.5">
                  <p className="text-[.625rem] uppercase tracking-wide text-ink-400">{k}</p>
                  <p className="num mt-0.5 text-[.875rem] font-semibold text-[#0B2340]">{v}</p>
                </div>
              ))}
            </div>
            <SegmentedControl
              full
              value={decision}
              onChange={setDecision}
              options={[
                { id: 'approve', label: 'Approve in full' },
                { id: 'partial', label: 'Partial' },
                { id: 'decline', label: 'Decline' },
              ]}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Payout rail">
                <Select value={target} onChange={(e) => setTarget(e.target.value as 'wallet' | 'card')}>
                  <option value="wallet">Travel wallet (instant, no fee)</option>
                  <option value="card">Original card (5–10 working days)</option>
                </Select>
              </Field>
              <Field label="Amount to pay">
                <Input defaultValue={String(decision === 'partial' ? Math.round(sel.amount * 0.6) : sel.amount)} className="num" />
              </Field>
            </div>
            <Field label="Message to the passenger" hint="Plain words, no case codes. This is what they read, so write it like a person.">
              <TextArea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={decision === 'decline' ? 'We cannot refund this fare because…' : 'Your flight was cancelled by us, so the full amount is going back…'} />
            </Field>
            <div className="space-y-2">
              <Checkbox label="Waive the fee — we caused this" defaultChecked={sel.reason.toLowerCase().includes('cancel') || sel.reason.toLowerCase().includes('schedule')} />
              <Checkbox label="Copy the station manager" />
              <Checkbox label="Log against the delay cause for the monthly report" defaultChecked />
            </div>
          </div>
        )}
      </Modal>
    </AdminPage>
  );
}

/** small inline chevron used by the queue rows */
function ChevronRight() {
  return <ChevronDot />;
}
function ChevronDot() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ============================= BAGGAGE ============================= */
function Baggage() {
  const { toast } = useStore();
  const [mode, setMode] = useState<'all' | 'tracing' | 'damaged' | 'delivered'>('all');
  const [open, setOpen] = useState<(typeof ADMIN_BAGGAGE)[number] | null>(null);
  const rows = ADMIN_BAGGAGE.filter((b) => mode === 'all' || (mode === 'tracing' ? b.status === 'Tracing' : mode === 'damaged' ? b.kind.includes('Damaged') : b.status.includes('Closed') || b.status === 'Located'));
  const avgHours = 27;

  const cols: Column<(typeof ADMIN_BAGGAGE)[number]>[] = [
    { key: 'id', header: 'Case', primary: true, render: (b) => <span className="num">{b.id}</span> },
    { key: 'tag', header: 'Tag', render: (b) => <span className="num">{b.tag}</span> },
    { key: 'owner', header: 'Owner', render: (b) => <span>{b.owner}<span className="num block text-[.6875rem] font-normal text-ink-400">{b.pnr}</span></span> },
    { key: 'desc', header: 'Description', hideBelow: 'md' },
    { key: 'station', header: 'Station', render: (b) => <span className="num">{b.station}</span> },
    { key: 'kind', header: 'Type', hideBelow: 'lg' },
    { key: 'age', header: 'Age', align: 'right', render: (b) => <span className={cx('num font-semibold', Number(b.age.replace('d', '')) > 12 ? 'text-red-600' : 'text-ink-600')}>{b.age}</span> },
    { key: 'value', header: 'Value', align: 'right', hideBelow: 'sm', render: (b) => <span className="num">{money(b.value)}</span> },
    { key: 'status', header: 'Status', align: 'right', render: (b) => <Badge tone={b.status.startsWith('Closed') ? 'teal' : b.status === 'Tracing' ? 'gold' : b.status === 'Awaiting customs' ? 'ember' : 'sky'}>{b.status}</Badge> },
    { key: 'a', header: '', sort: false, align: 'right', render: (b) => <button onClick={(e) => { e.stopPropagation(); setOpen(b); }} className="rounded-[7px] border border-[#E1E8F0] px-2 py-1 text-[.6875rem] font-semibold text-ink-600 hover:border-navy-400">Trace</button> },
  ];

  return (
    <AdminPage
      title="Baggage management"
      lead="Every delayed, damaged and missing bag on the network, with who owns the case and where the bag physically is."
      actions={
        <>
          <Button size="sm" variant="secondary" icon={<Luggage size={14} />}>
            Unmatched bags
          </Button>
          <Button size="sm" icon={<Plus size={14} />}>Open a case</Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Open cases" value={String(rows.length)} tone="gold" note="97 across all stations" icon={<Luggage size={15} />} />
        <KpiCard label="Delivered < 30 h" value="94%" delta={1.8} tone="teal" note="our published number" />
        <KpiCard label="Average recovery" value={`${avgHours} h`} tone="sky" note="down from 41 h in 2024" />
        <KpiCard label="Interim paid today" value={money(38640)} tone="navy" note="USD 120 same-day, no receipts first" />
        <KpiCard label="Lost & valued" value="18" tone="ember" note="after 21 days · USD 65/kg" />
      </div>

      <Panel pad={false} title="Cases" lead="Four scans per bag; a case with no scan for 12 hours is escalated automatically">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E1E8F0] px-4 py-2.5">
          {(['all', 'tracing', 'damaged', 'delivered'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={cx('rounded-pill border px-2.5 py-1 text-[.75rem] font-semibold capitalize transition', mode === m ? 'border-[#0B2340] bg-[#0B2340] text-white' : 'border-[#E1E8F0] text-ink-500 hover:border-navy-300')}>
              {m === 'delivered' ? 'closed / delivered' : m}
            </button>
          ))}
          <span className="ml-auto flex items-center gap-2">
            <SegmentedControl size="sm" value={'week' as string} onChange={() => {}} options={[{ id: 'week', label: '7 days' }, { id: 'month', label: '30 days' }]} />
          </span>
        </div>
        <DataTable rows={rows} columns={cols} pageSize={10} searchable={false} onRowClick={(b) => setOpen(b)} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="By station" lead="Open cases and average recovery">
          <BarList tone="ember" rows={[{ label: 'LOS — Lagos', value: 31, note: 'avg 38 h · ramp congestion' }, { label: 'ACC — Accra', value: 18, note: 'avg 14 h' }, { label: 'NBO — Nairobi', value: 14, note: 'avg 22 h' }, { label: 'JNB — Johannesburg', value: 9, note: 'avg 19 h' }, { label: 'LHR — London', value: 6, note: 'avg 41 h · re-delivery only' }]} />
        </Panel>
        <Panel title="Courier capacity" lead="Our own drivers, not a third party">
          <div className="space-y-3">
            {[
              { t: 'Accra', v: 14, max: 18, d: '3 vans idle · 12 deliveries left today' },
              { t: 'Nairobi', v: 8, max: 10, d: 'all routed · next slot 17:30' },
              { t: 'Lagos', v: 11, max: 11, d: 'at capacity — bags waiting for the morning run' },
            ].map((x) => (
              <div key={x.t}>
                <p className="flex items-baseline justify-between text-[.8125rem]">
                  <span className="font-medium text-[#0B2340]">{x.t}</span>
                  <span className="num text-ink-500">
                    {x.v}/{x.max} in use
                  </span>
                </p>
                <Meter value={(x.v / x.max) * 100} tone={x.v === x.max ? 'ember' : 'teal'} className="mt-1" />
                <p className="mt-1 text-[.75rem] text-ink-400">{x.d}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Claims to value" lead="After 21 days">
          <ul className="space-y-2.5">
            {[
              { n: 'Ama Mensah', a: 890, d: '3 days left to value · contents list received' },
              { n: 'Tendai Chirwa', a: 1780, d: 'cap reached · approved by supervisor' },
              { n: 'Aisha Bello', a: 420, d: 'waiting for the purchase receipts' },
            ].map((x) => (
              <li key={x.n} className="rounded-[10px] border border-[#E1E8F0] p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[.875rem] font-semibold text-[#0B2340]">{x.n}</p>
                  <p className="num text-[.875rem] font-semibold">{money(x.a)}</p>
                </div>
                <p className="mt-1 text-[.75rem] text-ink-400">{x.d}</p>
                <div className="mt-2 flex gap-1.5">
                  <Button size="sm" variant="secondary" onClick={() => toast({ tone: 'success', title: 'Valuation approved', body: `${money(x.a)} paid to the card on file; passenger emailed with the basis.` })}>
                    Approve
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toast({ tone: 'info', title: 'More evidence requested', body: 'Email sent with a 7-day window and a phone number to call.' })}>
                    Ask for proof
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={open ? `${open.id} · tag ${open.tag}` : ''}
        subtitle={open ? `${open.desc} · ${open.station} · for ${open.owner}` : ''}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(null)}>
              Close
            </Button>
            <Button onClick={() => { toast({ tone: 'success', title: 'Search dispatched', body: 'Two agents at ACC sort and the next three inbound flights flagged for this tag.' }); setOpen(null); }}>
              Dispatch a search
            </Button>
          </>
        }
      >
        {open && (
          <div className="space-y-4">
            <div>
              <p className="text-2xs font-semibold uppercase tracking-wider text-ink-400">Scan history</p>
              <ol className="mt-3 space-y-0">
                {[
                  { t: 'Accepted at check-in · ACC', w: '05:48', ok: true },
                  { t: 'Loaded · AN 214', w: '06:22', ok: true },
                  { t: 'Arrival scan · LOS belt 2', w: '08:04', ok: true },
                  { t: 'Not claimed · short-shipped to LOS-ACC 218', w: '08:31', ok: false },
                  { t: 'In transit back to ACC', w: 'today 11:20', ok: false },
                ].map((s, i, arr) => (
                  <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                    {i < arr.length - 1 && <span className="absolute left-[9px] top-5 h-full w-px bg-[#E1E8F0]" />}
                    <span className={cx('mt-1 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-2', s.ok ? 'border-teal-500 bg-teal-500 text-white' : 'border-gold-500 bg-white')}>
                      {s.ok && <Check size={10} strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[.875rem] font-medium text-[#0B2340]">{s.t}</span>
                      <span className="num block text-[.75rem] text-ink-400">{s.w}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Owner's claim value">
                <Input defaultValue={String(open.value)} className="num" />
              </Field>
              <Field label="Delivery address">
                <Input defaultValue="Kempinski Gold Coast, Airport City" />
              </Field>
            </div>
            <div className="space-y-2">
              <Checkbox label="Pay interim expenses (USD 120) now" defaultChecked />
              <Checkbox label="Deliver by our own driver, not a courier" defaultChecked />
              <Checkbox label="Call the passenger before delivery" />
            </div>
            <p className="rounded-[10px] bg-mist-50 p-3 text-[.8125rem] leading-relaxed text-ink-500">
              Montreal Convention caps liability at about {money(1780)} per bag; we value at USD 65/kg and, on Nova Cover Plus, add contents up to {money(3000)} without a wear-and-tear deduction.
            </p>
          </div>
        )}
      </Modal>
    </AdminPage>
  );
}

/* ============================= SUPPORT ============================= */
function Support() {
  const { toast } = useStore();
  const [tab, setTab] = useState<'queue' | 'convo' | 'macros'>('convo');
  const [sel, setSel] = useState<(typeof ADMIN_TICKETS)[number] | null>(ADMIN_TICKETS[0]);
  const [reply, setReply] = useState('');
  const [assign, setAssign] = useState(false);

  const queue = ADMIN_TICKETS.filter((t) => t.status !== 'Resolved');

  return (
    <AdminPage
      title="Customer support"
      lead="Every channel in one queue: chat, email, phone summaries, airport desk notes and social. Answer-time promises are shown to the agent, not hidden in a dashboard."
      actions={
        <>
          <Button size="sm" variant="secondary" icon={<Filter size={14} />}>
            My queue (6)
          </Button>
          <Button size="sm" icon={<Plus size={14} />}>
            New case
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Open" value={String(queue.length)} note="1,284 across all queues" icon={<MessageSquare size={15} />} />
        <KpiCard label="First reply" value="90 s" tone="teal" delta={-8} note="phone · chat 4 min · email 3 h 12 m" />
        <KpiCard label="SLA met" value="94.2%" tone="teal" note="22 cases at risk in the next hour" />
        <KpiCard label="CSAT" value="4.31" tone="gold" delta={0.06} note="of 5 · 18,402 responses" />
        <KpiCard label="Escalations" value="38" tone="ember" note="7 to the Group Customer Officer" />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'queue', label: 'Queue', count: queue.length },
          { id: 'convo', label: 'Conversation' },
          { id: 'macros', label: 'Macros & policy' },
        ]}
      />

      {tab === 'queue' && (
        <Panel pad={false} title="Queue" lead="Sorted by (SLA left × severity)">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-[.8125rem]">
              <thead>
                <tr className="border-b border-[#E1E8F0] bg-[#F7FAFC] text-2xs uppercase tracking-wider text-ink-400">
                  {['Case', 'Subject', 'Customer', 'Booking', 'Category', 'Priority', 'Channel', 'Age', 'SLA', 'Agent'].map((h, i) => (
                    <th key={h} className={cx('px-3 py-2 font-semibold', i >= 7 && 'text-right')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF1F6]">
                {ADMIN_TICKETS.map((t) => {
                  const ageH = Number(t.age.replace('h', ''));
                  return (
                    <tr key={t.id} onClick={() => { setSel(t); setTab('convo'); }} className="cursor-pointer transition hover:bg-[#F2F7FB]">
                      <td className="num px-3 py-2 font-semibold text-[#0B2340]">{t.id}</td>
                      <td className="max-w-[240px] px-3 py-2">
                        <span className="block truncate">{t.subject}</span>
                        <span className="text-[.6875rem] text-ink-400">{t.ref}</span>
                      </td>
                      <td className="px-3 py-2 text-ink-500">{t.customer}</td>
                      <td className="num px-3 py-2 text-ink-500">{t.ref}</td>
                      <td className="px-3 py-2">
                        <Badge tone="neutral">{t.category}</Badge>
                      </td>
                      <td className="px-3 py-2">
                        <Badge tone={t.priority === 'Urgent' ? 'red' : t.priority === 'High' ? 'ember' : t.priority === 'Normal' ? 'sky' : 'neutral'}>{t.priority}</Badge>
                      </td>
                      <td className="px-3 py-2 text-ink-500">{t.channel}</td>
                      <td className={cx('num px-3 py-2 text-right', ageH > 24 ? 'font-semibold text-red-600' : 'text-ink-500')}>{t.age}</td>
                      <td className="px-3 py-2 text-right">
                        <Meter value={t.sla} tone={t.sla > 70 ? 'teal' : t.sla > 40 ? 'gold' : 'ember'} className="ml-auto w-16" />
                      </td>
                      <td className="px-3 py-2 text-right text-ink-500">{t.agent}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === 'convo' && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Panel pad={false} title={sel ? `${sel.id} · ${sel.subject}` : 'Pick a case'} lead={sel ? `${sel.customer} · ${sel.channel} · ${sel.age} old · ${sel.priority} priority` : ''}>
            {sel ? (
              <>
                <div className="space-y-3 p-4 sm:p-5">
                  {[
                    { who: 'them', t: 'My bag arrived at 21:40 with the wheel snapped off and the handle torn. I had a wedding the next morning and had to buy a suitcase. I want the bag replaced and the suitcase cost back.', when: '4 h ago' },
                    { who: 'you', t: 'I am sorry — that is our fault and I will fix both things. I am approving a replacement bag today and paying the suitcase back without needing the receipt. Can you send one photo of the damage?', when: '3 h 50 m ago' },
                    { who: 'them', t: 'Photo sent. Two receipts are in the envelope too, I posted them from Lagos.', when: '2 h ago' },
                    { who: 'system', t: 'Photo received · damage confirmed by the station supervisor at 14:02', when: '1 h ago' },
                  ].map((m, i) => (
                    <div key={i} className={cx('flex', m.who === 'them' ? '' : 'justify-end')}>
                      <div className={cx('max-w-[85%] rounded-[14px] px-3.5 py-2.5 text-[.875rem] leading-relaxed', m.who === 'them' ? 'bg-[#F2F5F9] text-[#1B2733]' : m.who === 'system' ? 'bg-gold-100/60 text-gold-600' : 'bg-[#0B2340] text-white')}>
                        {m.who === 'system' && <span className="mb-1 block text-[.625rem] font-semibold uppercase tracking-wider opacity-70">System</span>}
                        <p>{m.t}</p>
                        <p className={cx('mt-1.5 text-[.6875rem]', m.who === 'them' || m.who === 'system' ? 'text-ink-400' : 'text-white/50')}>{m.when}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#E1E8F0] p-4 sm:p-5">
                  <TextArea rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply to the passenger…" className="text-[.875rem]" />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button size="sm" onClick={() => { toast({ tone: 'success', title: 'Reply sent', body: 'Case marked Awaiting customer; the SLA clock pauses, not resets.' }); setReply(''); }} icon={<Send size={14} />}>
                      Send reply
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => { toast({ tone: 'success', title: 'Refund issued', body: `${money(240)} replacement bag to wallet plus ${money(96)} suitcase to card. Passenger emailed with the reasoning.` }); }} icon={<Banknote size={14} />}>
                      Pay {money(336)}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setAssign(true)}>
                      Transfer
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toast({ tone: 'info', title: 'Call back scheduled', body: 'Supervisor calls within 40 minutes on the number on the booking.' })} icon={<Phone size={14} />}>
                      Call them
                    </Button>
                    <Select className="ml-auto h-9 w-[168px] text-[.75rem]" defaultValue="resolved" aria-label="Set status">
                      {['open', 'in progress', 'awaiting customer', 'resolved', 'escalated'].map((s) => (
                        <option key={s} value={s}>
                          mark {s}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6">
                <EmptyState title="No case selected" body="Choose one from the queue to read the whole thread, with the booking and the payment history alongside." icon={<MessageSquare size={20} />} />
              </div>
            )}
          </Panel>
          <aside className="space-y-4">
            {sel && (
              <>
                <Panel title="Passenger">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0B2340] font-display text-[.8125rem] font-bold text-gold-400">
                      {sel.customer.split(' ').map((n) => n[0]).join('')}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[.9375rem] font-semibold text-[#0B2340]">{sel.customer}</span>
                      <span className="block text-[.75rem] text-ink-400">Elite · {sel.ref}</span>
                    </span>
                  </div>
                  <Divider className="my-3" />
                  <dl className="space-y-1.5 text-[.8125rem]">
                    {[
                      ['CSAT given', `${sel.csat} / 5`],
                      ['Cases this year', '4'],
                      ['Refunds paid', money(1120)],
                      ['Next flight', 'in 19 days'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-[#EDF1F6] pb-1 last:border-0">
                        <dt className="text-ink-400">{k}</dt>
                        <dd className="num font-medium text-[#0B2340]">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => toast({ tone: 'info', title: 'Elite desk', body: 'One call, no queue — the number for this member is in the record.' })}>
                    Call the Elite desk
                  </Button>
                </Panel>
                <Panel title="Suggested actions" lead="From the category and the words used">
                  <ul className="space-y-2">
                    {[
                      ['Replace the bag (policy: damage by us)', 'approve'],
                      ['Reimburse the interim purchase', 'no receipt needed'],
                      ['Add 2,000 goodwill points', 'optional'],
                      ['Flag station for repeat belt damage', 'ops'],
                    ].map(([a, b]) => (
                      <li key={a} className="flex items-center gap-2 rounded-[10px] border border-[#E1E8F0] p-2.5">
                        <Check size={14} className="shrink-0 text-teal-600" />
                        <span className="min-w-0 flex-1 truncate text-[.8125rem] text-[#0B2340]">{a}</span>
                        <Badge tone="neutral">{b}</Badge>
                      </li>
                    ))}
                  </ul>
                </Panel>
              </>
            )}
          </aside>
        </div>
      )}

      {tab === 'macros' && (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <Panel pad={false} title="Macros" lead="Written by supervisors, editable by any agent, and reviewed monthly">
            <ul className="divide-y divide-[#EDF1F6]">
              {[
                ['Bag damaged by us', 'We replace, we pay the interim, we do not ask for proof of purchase first.'],
                ['Delay over 4 hours', 'Meal voucher immediately; hotel when it crosses the night; no forms.'],
                ['Denied boarding, our fault', 'Rebook on anything, pay the difference, plus 5,000 points.'],
                ['Refund promise', 'Decide in 3 days, pay within 24 h of deciding, and explain in plain words.'],
                ['Seat changed after paying', 'Better seat or refund the difference, automatically, no argument.'],
              ].map(([t, d]) => (
                <li key={t} className="flex items-start gap-3 px-4 py-3">
                  <Ticket size={14} className="mt-0.5 shrink-0 text-ink-400" />
                  <span className="min-w-0">
                    <span className="block text-[.875rem] font-semibold text-[#0B2340]">{t}</span>
                    <span className="block text-[.8125rem] leading-relaxed text-ink-500">{d}</span>
                  </span>
                  <button onClick={() => toast({ tone: 'success', title: `${t} applied`, body: 'Reply drafted from the macro; edit before sending.' })} className="ml-auto shrink-0 text-[.75rem] font-semibold text-sky-700 hover:underline">
                    Use
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Answer-time promise" lead="What we publish and what we hit">
            <div className="space-y-3">
              {[
                ['Phone', '90 s', 92],
                ['In-app chat', '5 min', 88],
                ['Email', '24 h', 96],
                ['Social', '60 min', 74],
                ['Airport desk', '10 min', 81],
              ].map(([c, p, v]) => (
                <div key={c as string}>
                  <p className="flex items-baseline justify-between text-[.8125rem]">
                    <span className="font-medium text-[#0B2340]">{c}</span>
                    <span className="num text-ink-500">
                      promise {p} · met {v}%
                    </span>
                  </p>
                  <Meter value={v as number} tone={(v as number) > 85 ? 'teal' : (v as number) > 78 ? 'gold' : 'ember'} className="mt-1.5" />
                </div>
              ))}
            </div>
            <p className="mt-3 text-[.75rem] leading-relaxed text-ink-400">Social is the miss. We have three people for it and the volume doubled in March; hiring is approved, the adverts are live.</p>
          </Panel>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Top reasons this week" lead="Coded at close, not guessed by a bot">
          <BarList tone="navy" rows={[{ label: 'Baggage', value: 3412 }, { label: 'Refund status', value: 2884 }, { label: 'Seat changes', value: 1962 }, { label: 'Check-in failures', value: 1408 }, { label: 'Document queries', value: 1104 }].map((r) => ({ ...r, note: `${r.value.toLocaleString()} contacts` }))} />
        </Panel>
        <Panel title="Where the pain is" lead="Complaints per 1,000 passengers, by journey stage">
          <div className="h-[176px]">
            <ResponsiveContainer>
              <BarChart data={ANALYTICS_EXTRA.satisfaction.map((s, i) => ({ stage: ['Book', 'Pre-fly', 'Airport', 'On board', 'Arrive', 'After'][i % 6], rate: s.complaints, nps: s.nps }))} margin={{ top: 6, right: 6, bottom: 0, left: -24 }}>
                <CartesianGrid stroke="#EDF1F6" vertical={false} />
                <XAxis dataKey="stage" tick={AXIS} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS} axisLine={false} tickLine={false} width={36} />
                <RTooltip contentStyle={tip} />
                <Bar dataKey="rate" fill="#C99A3B" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Staffing" lead="Right now, across the hubs">
          <MiniTable head={['Team', 'On', 'Waiting', 'State']} rows={[['Reservations', 24, '90 s', 'ok'], ['Baggage', 11, '4 min', 'tight'], ['Refunds', 8, '3 h 12 m', 'ok'], ['Accessibility', 6, 'immediate', 'ok'], ['Social', 3, '22 min', 'short']].map((r) => r.map((c, i) => (i === 3 ? <Badge key={i} tone={c === 'ok' ? 'teal' : c === 'tight' ? 'gold' : 'red'}>{c}</Badge> : <span key={i} className={i === 0 ? 'font-semibold' : 'num'}>{c}</span>)))} />
          <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => toast({ tone: 'success', title: 'Shift added', body: 'Two baggage agents pulled from the 14:00–18:00 window; queue expected to clear by 16:30.' })}>
            Add a shift
          </Button>
        </Panel>
      </div>

      <Modal
        open={assign}
        onClose={() => setAssign(false)}
        title="Transfer case"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAssign(false)}>
              Cancel
            </Button>
            <Button onClick={() => { setAssign(false); toast({ tone: 'success', title: 'Transferred', body: 'Baggage desk in Lagos has it, with the whole thread and both receipts attached.' }); }}>
              Transfer
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Queue">
            <Select defaultValue="Baggage — Lagos">
              {['Baggage — Lagos', 'Refunds — Accra', 'Accessibility desk', 'Elite desk', 'Group Customer Officer'].map((q) => (
                <option key={q}>{q}</option>
              ))}
            </Select>
          </Field>
          <Checkbox label="Attach booking, payment and bag scans" defaultChecked />
          <Checkbox label="Ask for a callback instead of an email reply" />
        </div>
      </Modal>
    </AdminPage>
  );
}

export const FinancePages = [
  { path: 'payments', el: <Payments /> },
  { path: 'refunds', el: <Refunds /> },
  { path: 'baggage', el: <Baggage /> },
  { path: 'support', el: <Support /> },
];

export { Payments, Refunds, Baggage, Support };