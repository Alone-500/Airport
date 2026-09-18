import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Building2, Check, CreditCard, Download, Landmark, Plus, Receipt, Smartphone, Ticket, Wallet, X } from 'lucide-react';
import { cx, fmtDate, money, toISODate } from '../../lib/utils';
import { AccountCard, AccountHeader } from './AccountLayout';
import { Badge, Button, Divider, EmptyState } from '../../components/ui/Primitives';
import { ConfirmDialog, Menu, MenuDivider, MenuItem, Modal, Tabs } from '../../components/ui/Overlay';
import { Checkbox, Field, Input, Select } from '../../components/ui/Form';
import { detectBrand, formatCardNumber, formatExpiry } from '../../components/booking/PaymentForm';
import { useStore } from '../../store/store';

interface Method {
  id: string;
  kind: 'card' | 'mobile' | 'bank' | 'wallet' | 'paypal';
  label: string;
  detail: string;
  expiry?: string;
  brand?: string;
  primary: boolean;
  defaultFor: string[];
  status: 'active' | 'expiring' | 'expired' | 'verification';
}

const METHODS: Method[] = [
  { id: 'm1', kind: 'card', label: 'Visa Signature · Nova', detail: '4417', expiry: '09/28', brand: 'visa', primary: true, defaultFor: ['flights', 'baggage', 'lounge'], status: 'active' },
  { id: 'm2', kind: 'card', label: 'Mastercard Corporate', detail: '8802', expiry: '02/27', brand: 'mastercard', primary: false, defaultFor: ['corporate'], status: 'active' },
  { id: 'm3', kind: 'mobile', label: 'MTN MoMo', detail: '+233 24 551 0188', primary: false, defaultFor: ['baggage'], status: 'active' },
  { id: 'm4', kind: 'mobile', label: 'M-Pesa', detail: '+254 712 884 402', primary: false, defaultFor: [], status: 'verification' },
  { id: 'm5', kind: 'card', label: 'Amex Gold', detail: '1004', expiry: '11/26', brand: 'amex', primary: false, defaultFor: [], status: 'expiring' },
  { id: 'm6', kind: 'bank', label: 'Ecobank · current', detail: '1442 0088 71', primary: false, defaultFor: ['invoice'], status: 'active' },
];

export default function Payment() {
  const nav = useNavigate();
  const { prefs, wallet, toast, user } = useStore();
  const [tab, setTab] = useState<'methods' | 'wallet' | 'invoices'>('methods');
  const [methods, setMethods] = useState(METHODS);
  const [add, setAdd] = useState(false);
  const [kind, setKind] = useState<Method['kind']>('card');
  const [card, setCard] = useState({ number: '', name: '', exp: '', cvc: '', nickname: '', primary: false, invoice: false });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [remove, setRemove] = useState<string | null>(null);
  const [split, setSplit] = useState({ wallet: true, points: false, card: 'Visa Signature · Nova ···· 4417', corporate: 'CocoaLink Ltd · 30-day invoice' });

  if (!user) return null;

  const invoices = [
    { id: 'INV-2026-88214', ref: 'ANV7X2K', date: '2026-09-02', amount: 1988.4, status: 'Paid', method: 'Visa ···· 4417', vat: true },
    { id: 'INV-2026-77120', ref: 'ANK4P71', date: '2026-07-02', amount: 1420.0, status: 'Paid', method: 'Visa ···· 4417', vat: true },
    { id: 'INV-2026-66004', ref: 'NFB-2291-ACC', date: '2026-06-30', amount: 8421.6, status: 'Settled', method: 'Bank transfer', vat: true },
    { id: 'INV-2026-55010', ref: 'ANQ9L4M', date: '2026-04-18', amount: 642.2, status: 'Paid', method: 'Mastercard ···· 8802', vat: false },
    { id: 'CN-2026-44120', ref: 'ANV7X2K', date: '2026-09-03', amount: -96.0, status: 'Credited', method: 'Visa ···· 4417', vat: true },
    { id: 'INV-2025-10988', ref: 'ANB2T8S', date: '2025-11-11', amount: 3120.0, status: 'Paid', method: 'Amex ···· 1004', vat: true },
  ];

  const save = () => {
    const e: Record<string, string> = {};
    if (kind === 'card') {
      const d = card.number.replace(/\D/g, '');
      if (d.length < 15) e.number = 'Enter the full card number';
      if (!card.name.trim()) e.name = 'Name as printed on the card';
      if (!/^\d{2}\/\d{2}$/.test(card.exp)) e.exp = 'MM/YY';
      else if (new Date(2000 + Number(card.exp.slice(3, 5)), Number(card.exp.slice(0, 2)), 0) < new Date()) e.exp = 'This card has expired';
      if (card.cvc.length < 3) e.cvc = '3 digits';
    }
    if (kind === 'mobile' && !/^\+?\d[\d ]{7,}$/.test(card.number.trim())) e.number = 'Wallet phone number, with country code';
    if (kind === 'bank' && card.number.replace(/\D/g, '').length < 10) e.number = 'Account number';
    setErrs(e);
    if (Object.keys(e).length) return;
    const label = kind === 'card' ? `${{ visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex', discover: 'Discover', card: 'Card' }[detectBrand(card.number)]} ···· ${card.number.replace(/\D/g, '').slice(-4)}` : kind === 'mobile' ? card.nickname || 'Mobile money' : kind === 'bank' ? 'Bank transfer' : 'PayPal';
    setMethods((m) => [
      { id: `m${Date.now()}`, kind, label, detail: kind === 'card' ? card.number.replace(/\D/g, '').slice(-4) : card.number, expiry: card.exp || undefined, brand: kind === 'card' ? detectBrand(card.number) : undefined, primary: card.primary || m.length === 0, defaultFor: card.invoice ? ['invoice'] : [], status: 'active' },
      ...m,
    ]);
    setAdd(false);
    setCard({ number: '', name: '', exp: '', cvc: '', nickname: '', primary: false, invoice: false });
    toast({ tone: 'success', title: 'Payment method added', body: 'Tokenised — we hold a token and the last four digits, never the number.' });
  };

  const total = methods.filter((m) => m.status !== 'expired').length;

  return (
    <div>
      <AccountHeader
        title="Payment & billing"
        lead="Cards, mobile money, wallet credit, invoices and the corporate account. Split rules decide what gets charged first."
        badge={<Badge tone="neutral">{total} methods</Badge>}
        action={
          <Button size="sm" icon={<Plus size={14} />} onClick={() => { setAdd(true); setErrs({}); }}>
            Add payment method
          </Button>
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'methods', label: 'Payment methods', count: methods.length },
          { id: 'wallet', label: 'Wallet & points', count: wallet.length },
          { id: 'invoices', label: 'Invoices', count: invoices.length },
        ]}
        className="mb-4"
      />

      {tab === 'methods' && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-3">
            {methods.map((m) => {
              const brand = m.brand ?? 'card';
              const colour = { visa: '#1A1F71', mastercard: '#EB001B', amex: '#006FCF', discover: '#F76B1C', card: '#41505E' }[brand];
              return (
                <article key={m.id} className={cx('card overflow-hidden', m.primary && 'ring-1 ring-navy-800')}>
                  <div className="flex flex-wrap items-start gap-4 p-4 sm:p-5">
                    {m.kind === 'card' ? (
                      <span className="relative flex h-16 w-24 shrink-0 flex-col justify-between overflow-hidden rounded-[9px] bg-[linear-gradient(150deg,#0B2340,#103054_60%,#053B39)] p-2 text-white">
                        <span className="h-3 w-5 rounded-[3px] bg-gold-400/80" />
                        <span className="text-[.5625rem] font-bold uppercase tracking-[0.1em]" style={{ color: brand === 'card' ? '#fff' : '#fff' }}>
                          {m.label.split(' ·')[0]}
                        </span>
                        <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full" style={{ background: colour }} />
                      </span>
                    ) : (
                      <span className="grid h-16 w-24 shrink-0 place-items-center rounded-[9px] border border-line bg-mist-50 text-navy-700">
                        {m.kind === 'mobile' ? <Smartphone size={22} /> : m.kind === 'wallet' ? <Wallet size={22} /> : <Landmark size={22} />}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-[1rem] font-semibold text-navy-900">{m.label}</p>
                        {m.primary && <Badge tone="navy">Primary</Badge>}
                        {m.status === 'expiring' && <Badge tone="gold">Expires {m.expiry}</Badge>}
                        {m.status === 'verification' && <Badge tone="sky">Verify to use</Badge>}
                        {m.status === 'expired' && <Badge tone="red">Expired</Badge>}
                      </div>
                      <p className="mt-1 text-[.8125rem] text-ink-500">
                        {m.kind === 'card' ? `···· ${m.detail} · exp ${m.expiry} · ${m.label.includes('Nova') ? 'Nova Visa Signature · 3 pts per USD' : 'Corporate card'}` : m.detail}
                      </p>
                      <p className="mt-2 flex flex-wrap gap-1.5">
                        {m.defaultFor.length ? (
                          m.defaultFor.map((d) => (
                            <span key={d} className="rounded-pill bg-teal-50 px-2 py-0.5 text-[.6875rem] font-medium capitalize text-teal-800">
                              default · {d}
                            </span>
                          ))
                        ) : (
                          <span className="text-[.75rem] text-ink-400">Not a default anywhere</span>
                        )}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {!m.primary && (
                        <Button size="sm" variant="secondary" onClick={() => { setMethods((v) => v.map((x) => ({ ...x, primary: x.id === m.id }))); toast({ tone: 'success', title: 'Primary method changed', body: `${m.label} is used for new bookings and refunds.` }); }}>
                          Make primary
                        </Button>
                      )}
                      <Menu label={() => <span className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-500 hover:text-navy-900">⋯</span>} widthClass="w-64">
                        {(close) => (
                          <>
                            <MenuItem onClick={() => { close(); toast({ tone: 'info', title: 'Card updated from issuer', body: 'New expiry 09/32 · same token, all subscriptions moved across.' }); }}>
                              Refresh from issuer
                            </MenuItem>
                            <MenuItem onClick={() => { setMethods((v) => v.map((x) => (x.id === m.id ? { ...x, defaultFor: x.defaultFor.includes('flights') ? x.defaultFor.filter((d) => d !== 'flights') : [...x.defaultFor, 'flights'] } : x))); close(); }}>
                              Toggle default for flights
                            </MenuItem>
                            <MenuItem onClick={() => { close(); toast({ tone: 'success', title: 'Verification sent', body: 'A small-hold authorisation of USD 1 will fall off in 3 days.' }); }}>
                              Verify this method
                            </MenuItem>
                            <MenuDivider />
                            <MenuItem desc="Refunds and subscriptions move to the primary card" onClick={() => { close(); setRemove(m.id); }}>
                              Remove method
                            </MenuItem>
                          </>
                        )}
                      </Menu>
                    </div>
                  </div>
                  {m.status === 'verification' && (
                    <div className="flex flex-wrap items-center gap-3 border-t border-line bg-sky-50/60 px-4 py-2.5 sm:px-5">
                      <AlertTriangle size={14} className="text-sky-700" />
                      <p className="flex-1 text-[.8125rem] text-sky-900">M-Pesa needs a one-time approval on the phone before it can hold a fare.</p>
                      <Button size="sm" onClick={() => toast({ tone: 'success', title: 'Push sent to +254 712 …', body: 'Approve it on the phone and this method goes active immediately.' })}>
                        Send request
                      </Button>
                    </div>
                  )}
                </article>
              );
            })}

            <div className="card p-4 sm:p-5">
              <p className="h-3 text-[1rem]">Split & fallback rules</p>
              <p className="mt-1 text-[.875rem] text-ink-500">When you pay, we apply these in order. Points and wallet credit always come first because they expire; the card picks up the rest.</p>
              <div className="mt-4 space-y-2.5">
                <Checkbox label="Spend travel wallet credit before any card" desc={`USD ${wallet.reduce((s, w) => s + w.amount, 0).toFixed(2)} available · oldest expiry first`} checked={split.wallet} onChange={(v) => setSplit({ ...split, wallet: v })} />
                <Checkbox label="Ask about paying part of a fare with points" desc="Shown at the payment step when it is better value than cash" checked={split.points} onChange={(v) => setSplit({ ...split, points: v })} />
                <Field label="Fallback card when the primary is declined">
                  <Select value={split.card} onChange={(e) => setSplit({ ...split, card: e.target.value })}>
                    {methods.filter((m) => m.kind === 'card').map((m) => (
                      <option key={m.id}>
                        {m.label} ···· {m.detail}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Corporate bookings bill to">
                  <Select value={split.corporate} onChange={(e) => setSplit({ ...split, corporate: e.target.value })}>
                    {['CocoaLink Ltd · 30-day invoice', 'My primary card', 'Ask me each time'].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </Select>
                </Field>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <AccountCard title="Security" lead="What we hold, and what we never see">
              <ul className="space-y-2.5 text-[.8125rem] leading-relaxed text-ink-600">
                {[
                  ['Tokenised cards', 'The 16-digit number never touches our servers — a network token and the last four only.'],
                  ['3-D Secure 2.0', 'Mandatory on every fare above USD 50, and for anything on a new device.'],
                  ['CVV never stored', 'Asked once per card, then forgotten.'],
                  ['Card alerts', 'Every capture and refund is pushed to you within 60 seconds.'],
                ].map(([k, v]) => (
                  <li key={k} className="flex gap-2.5">
                    <Check size={14} className="mt-0.5 shrink-0 text-teal-600" />
                    <span>
                      <span className="block font-medium text-navy-900">{k}</span>
                      <span className="block text-ink-500">{v}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </AccountCard>

            <AccountCard title="Nova for Business">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-navy-50 text-navy-700">
                <Building2 size={16} />
              </span>
              <p className="mt-2.5 text-[.875rem] leading-relaxed text-ink-600">
                CocoaLink Ltd · account NFB-2291-ACC. Credit limit USD 60,000, monthly consolidated invoice on the 5th, cost-centre codes on every ticket.
              </p>
              <dl className="mt-3 space-y-1.5 text-[.8125rem]">
                {[
                  ['Outstanding', money(4821.4, prefs.currency, { decimals: true })],
                  ['Available', money(55178.6, prefs.currency, { decimals: true })],
                  ['Next invoice', toISODate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5))],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-line pb-1 last:border-0">
                    <dt className="text-ink-400">{k}</dt>
                    <dd className="num font-medium text-navy-900">{v}</dd>
                  </div>
                ))}
              </dl>
              <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => toast({ tone: 'info', title: 'Travel manager invited', body: 'They can issue and cancel on behalf of the account, with a USD 500 self-serve cap.' })}>
                Invite travel manager
              </Button>
            </AccountCard>

            <AccountCard title="Currency & FX">
              <p className="text-[.8125rem] leading-relaxed text-ink-500">
                You are shown prices in <span className="font-semibold text-navy-900">{prefs.currency}</span>. Paying in the card&rsquo;s own currency avoids the issuer&rsquo;s non-USD markup — usually 2.9%.
              </p>
              <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => nav('/account/preferences')}>
                Change display currency
              </Button>
            </AccountCard>
          </aside>
        </div>
      )}

      {tab === 'wallet' && (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <AccountCard title="Travel wallet" lead="Credit, vouchers and delay payouts. Spent oldest-first at the payment step.">
            <ul className="space-y-2.5">
              {wallet.map((w) => (
                <li key={w.id} className="flex flex-wrap items-center gap-3 rounded-[12px] border border-line p-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-teal-50 text-teal-700">
                    <Wallet size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[.9375rem] font-medium text-navy-900">{w.label}</span>
                    <span className="block text-[.75rem] text-ink-500">
                      {w.kind} · valid to {fmtDate(w.expires, 'long')}
                    </span>
                  </span>
                  <span className="num font-display text-[1.125rem] font-semibold text-navy-900">{money(w.amount, prefs.currency, { decimals: true })}</span>
                </li>
              ))}
            </ul>
            <Divider className="my-4" />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" icon={<GiftIcon />} onClick={() => toast({ tone: 'success', title: 'Sent to Naa', body: 'USD 50 of credit moved to a household member, and the receipt is in both accounts.' })}>
                Gift credit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toast({ tone: 'info', title: 'Wallet terms', body: 'No fee, no expiry while you keep flying. Cash payout within 30 days if you ask.' })}>
                Terms
              </Button>
            </div>
          </AccountCard>

          <div className="space-y-4">
            <AccountCard title="Points balance">
              <p className="num font-display text-[2rem] font-semibold text-navy-900">{user.points.toLocaleString()}</p>
              <p className="mt-1 text-[.8125rem] text-ink-500">points · about {money(Math.round(user.points / 45), prefs.currency)} of travel value</p>
              <Divider className="my-3" />
              <ul className="space-y-2 text-[.8125rem]">
                {[
                  ['Award seat ACC → LOS', '12,000'],
                  ['Extra bag, long-haul', '3,500'],
                  ['Nova Connect, full flight', '1,800'],
                  ['Galaxy Lounge day pass', '4,600'],
                ].map(([k, v]) => (
                  <li key={k} className="flex justify-between border-b border-line pb-1.5 last:border-0">
                    <span className="text-ink-500">{k}</span>
                    <span className="num font-medium text-navy-900">{v} pts</span>
                  </li>
                ))}
              </ul>
              <Button size="sm" className="mt-3 w-full" onClick={() => nav('/account/rewards')}>
                Rewards dashboard
              </Button>
            </AccountCard>

            <AccountCard title="Recent credit activity">
              <ul className="space-y-2.5">
                {[
                  { t: 'Delay payout · AN 512', a: 90, d: '2026-08-14', tone: 'in' as const },
                  { t: 'Refund · seat fee, equipment change', a: -34, d: '2026-07-30', tone: 'out' as const },
                  { t: 'Cancelled Flex fare → wallet', a: 612.4, d: '2026-06-02', tone: 'in' as const },
                  { t: 'Applied to ANV7X2K', a: -180, d: '2026-05-28', tone: 'out' as const },
                ].map((x) => (
                  <li key={x.t} className="flex items-center gap-3">
                    <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-full', x.tone === 'in' ? 'bg-teal-50 text-teal-700' : 'bg-mist-100 text-ink-500')}>{x.tone === 'in' ? '+' : <X size={12} />}</span>
                    <span className="min-w-0 flex-1 truncate text-[.875rem] text-navy-900">{x.t}</span>
                    <span className="num text-[.75rem] text-ink-400">{fmtDate(x.d, 'short')}</span>
                    <span className={cx('num w-[88px] text-right text-[.875rem] font-semibold', x.tone === 'in' ? 'text-teal-700' : 'text-ink-500')}>
                      {money(Math.abs(x.a), prefs.currency, { decimals: true })}
                    </span>
                  </li>
                ))}
              </ul>
            </AccountCard>
          </div>
        </div>
      )}

      {tab === 'invoices' && (
        <AccountCard
          title="Invoices & receipts"
          lead="Every ticket, bag fee and lounge pass. VAT references are on the ones where it matters."
          action={
            <Button size="sm" variant="secondary" icon={<Download size={14} />} onClick={() => toast({ tone: 'success', title: 'Year packed', body: 'All invoices for 2026 downloaded as a single PDF bundle.' })}>
              Download all
            </Button>
          }
          className="p-0 [&>div:last-child]:p-0"
        >
          <div className="overflow-x-auto">
            <table className="table-base min-w-[640px]">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th className="hide-below-md">Reference</th>
                  <th>Issued</th>
                  <th className="hide-below-sm">Method</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <span className="num font-semibold text-navy-900">{i.id}</span>
                      <p className="flex items-center gap-1.5 text-[.6875rem] text-ink-400">
                        <Receipt size={11} /> {i.vat ? 'VAT invoice' : 'Consumer receipt'}
                      </p>
                    </td>
                    <td className="num hidden md:table-cell">{i.ref}</td>
                    <td className="num text-[.8125rem] text-ink-500">{fmtDate(i.date, 'short')}</td>
                    <td className="hidden text-[.8125rem] text-ink-500 sm:table-cell">{i.method}</td>
                    <td className={cx('num text-right font-medium', i.amount < 0 && 'text-teal-700')}>{money(i.amount, prefs.currency, { decimals: true })}</td>
                    <td className="text-right">
                      <Badge tone={i.status === 'Paid' || i.status === 'Settled' ? 'teal' : i.status === 'Credited' ? 'sky' : 'neutral'}>{i.status}</Badge>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="ghost" icon={<Download size={13} />} onClick={() => toast({ tone: 'success', title: `${i.id} downloaded`, body: 'PDF with the VAT line and the payment reference.' })}>
                          PDF
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => toast({ tone: 'info', title: 'Sent to accounting', body: 'Filed against cost centre CLL-TRV-ACC.' })}>
                          Expense
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-mist-50/60 px-4 py-3">
            <p className="num text-[.8125rem] text-ink-500">
              Total paid this year · <span className="font-semibold text-navy-900">{money(invoices.reduce((s, i) => s + Math.abs(i.amount), 0), prefs.currency, { decimals: true })}</span>
            </p>
            <Button size="sm" variant="ghost" icon={<Ticket size={13} />} onClick={() => nav('/manage-booking')}>
              Add a booking by reference
            </Button>
          </div>
        </AccountCard>
      )}

      {methods.length === 0 && tab === 'methods' && (
        <div className="mt-4">
          <EmptyState title="No payment methods saved" body="Add one and it is tokenised — we never store the full number." icon={<CreditCard size={20} />} action={<Button size="sm" onClick={() => setAdd(true)}>Add a card</Button>} />
        </div>
      )}

      <Modal
        open={add}
        onClose={() => setAdd(false)}
        title="Add a payment method"
        subtitle="Nothing is charged. We authorise USD 1 to prove the card, and it falls off in three days."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAdd(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save method</Button>
          </>
        }
      >
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              ['card', 'Card', <CreditCard size={15} key="a" />],
              ['mobile', 'Mobile money', <Smartphone size={15} key="b" />],
              ['bank', 'Bank transfer', <Landmark size={15} key="c" />],
              ['wallet', 'Wallet', <Wallet size={15} key="d" />],
            ] as const
          ).map(([id, l, icon]) => (
            <button key={id} onClick={() => setKind(id)} className={cx('flex items-center gap-2 rounded-[11px] border px-3 py-2 text-[.875rem] font-semibold transition', kind === id ? 'border-navy-800 bg-navy-800 text-white' : 'border-line text-ink-600 hover:border-sky-400')}>
              {icon} {l}
            </button>
          ))}
        </div>

        {kind === 'card' ? (
          <div className="grid gap-3.5 sm:grid-cols-6">
            <Field label="Card number" required error={errs.number} className="sm:col-span-4">
              <Input value={card.number} onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })} placeholder="4242 4242 4242 4242" className="num tracking-[0.08em]" invalid={!!errs.number} inputMode="numeric" />
            </Field>
            <Field label="Expiry" required error={errs.exp} className="sm:col-span-2">
              <Input value={card.exp} onChange={(e) => setCard({ ...card, exp: formatExpiry(e.target.value) })} placeholder="09/28" className="num" invalid={!!errs.exp} />
            </Field>
            <Field label="Name on card" required error={errs.name} className="sm:col-span-4">
              <Input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })} placeholder="A MA MENSAH" invalid={!!errs.name} />
            </Field>
            <Field label="CVC" required error={errs.cvc} className="sm:col-span-2">
              <Input value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="•••" className="num tracking-[0.2em]" invalid={!!errs.cvc} />
            </Field>
            <Field label="Nickname" hint="e.g. “Personal Visa” — only you see this" className="sm:col-span-4">
              <Input value={card.nickname} onChange={(e) => setCard({ ...card, nickname: e.target.value })} />
            </Field>
            <Field label="Billing country" className="sm:col-span-2">
              <Select defaultValue="Ghana">
                {['Ghana', 'Nigeria', 'Kenya', 'South Africa', 'United Kingdom', 'United States', 'Other'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <div className="sm:col-span-6 space-y-2">
              <Checkbox label="Make this my primary method" checked={card.primary} onChange={(v) => setCard({ ...card, primary: v })} />
              <Checkbox label="Use for corporate bookings and invoice to the company" checked={card.invoice} onChange={(v) => setCard({ ...card, invoice: v })} />
            </div>
          </div>
        ) : kind === 'mobile' ? (
          <div className="space-y-3.5">
            <Field label="Provider">
              <Select>
                {['MTN MoMo (Ghana)', 'AirtelTigo Money (Ghana)', 'Airtel Money (Nigeria)', 'M-Pesa (Kenya)', 'Orange Money (Senegal)', 'EcoCash (Zimbabwe)'].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
            </Field>
            <Field label="Wallet number" required error={errs.number}>
              <Input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} placeholder="+233 24 551 0188" className="num" invalid={!!errs.number} />
            </Field>
            <Field label="Nickname">
              <Input value={card.nickname} onChange={(e) => setCard({ ...card, nickname: e.target.value })} placeholder="Momo line" />
            </Field>
            <p className="rounded-[10px] bg-mist-50 p-3 text-[.8125rem] leading-relaxed text-ink-500">We store the number, not a token — every payment needs your approval on the phone, which is the whole point.</p>
          </div>
        ) : kind === 'bank' ? (
          <div className="space-y-3.5">
            <Field label="Bank">
              <Select>
                {['Ecobank Ghana', 'Absa Ghana', 'KCB Kenya', 'Standard Bank SA', 'First Bank Nigeria', 'Other'].map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </Select>
            </Field>
            <Field label="Account number" required error={errs.number} hint="Used for refunds only. We never debit a bank account without a signed mandate.">
              <Input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} className="num tracking-[0.1em]" invalid={!!errs.number} />
            </Field>
          </div>
        ) : (
          <div className="space-y-3.5">
            <Field label="PayPal email">
              <Input placeholder="you@company.com" />
            </Field>
            <Checkbox label="Balance in USD" defaultChecked />
            <p className="text-[.8125rem] text-ink-500">PayPal works for bookings but not for refunds of ancillaries bought at the airport — those go to a card.</p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!remove}
        onCancel={() => setRemove(null)}
        onConfirm={() => {
          setMethods((v) => v.filter((x) => x.id !== remove));
          setRemove(null);
          toast({ tone: 'info', title: 'Method removed', body: 'Any open authorisation on it is voided; refunds already queued still land.' });
        }}
        title="Remove this payment method?"
        confirmLabel="Remove"
        tone="danger"
        body="If a refund is due on a booking paid with it, we will pay that refund to your travel wallet instead and tell you first."
      />
    </div>
  );
}

const GiftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7S9.5 3 7.5 4.5 9 7 12 7Zm0 0s2.5-4 4.5-2.5S15 7 12 7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);
