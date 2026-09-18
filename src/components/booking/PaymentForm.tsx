import { useMemo, useState } from 'react';
import { Check, CreditCard, Info, Lock, Smartphone, Wallet } from 'lucide-react';
import { cx, luhnValid, money } from '../../lib/utils';
import { Badge, Button } from '../ui/Primitives';
import { Field, Input, Select } from '../ui/Form';
import { Modal } from '../ui/Overlay';
import { useStore } from '../../store/store';

const BRANDS: Record<string, { label: string; colour: string; test?: string }> = {
  visa: { label: 'Visa', colour: '#1A1F71', test: '^4' },
  mastercard: { label: 'Mastercard', colour: '#EB001B', test: '^5[1-5]' },
  amex: { label: 'Amex', colour: '#006FCF', test: '^3[47]' },
  discover: { label: 'Discover', colour: '#F76B1C', test: '^6' },
  card: { label: 'Card', colour: '#41505E' },
};

export function detectBrand(num: string) {
  const d = num.replace(/\D/g, '');
  if (/^4/.test(d)) return 'visa';
  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return 'mastercard';
  if (/^3[47]/.test(d)) return 'amex';
  if (/^6/.test(d)) return 'discover';
  return 'card';
}

export const formatCardNumber = (v: string) =>
  v
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();

export const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export interface PaymentState {
  method: 'card' | 'mobile' | 'wallet' | 'paypal' | 'bank';
  name: string;
  number: string;
  exp: string;
  cvc: string;
  brand: string;
  remember: boolean;
  momoProvider: string;
  momoNumber: string;
  walletAmount: number;
  billing: string;
  country: string;
}

export const defaultPayment: PaymentState = {
  method: 'card',
  name: '',
  number: '',
  exp: '',
  cvc: '',
  brand: 'card',
  remember: true,
  momoProvider: 'MTN MoMo (Ghana)',
  momoNumber: '',
  walletAmount: 0,
  billing: '',
  country: 'Ghana',
};

export function PaymentForm({
  value,
  onChange,
  totalUSD,
  onPay,
  paying,
  errors,
}: {
  value: PaymentState;
  onChange: (p: Partial<PaymentState>) => void;
  totalUSD: number;
  onPay: () => void;
  paying: boolean;
  errors: Record<string, string>;
}) {
  const { prefs, wallet } = useStore();
  const [auth, setAuth] = useState(false);
  const brand = BRANDS[value.brand] ?? BRANDS.card;
  const walletTotal = wallet.reduce((s, w) => s + w.amount, 0);
  const methods = [
    { id: 'card', label: 'Card', icon: <CreditCard size={16} /> },
    { id: 'mobile', label: 'Mobile money', icon: <Smartphone size={16} /> },
    { id: 'wallet', label: 'Travel wallet', icon: <Wallet size={16} /> },
    { id: 'bank', label: 'Bank / invoice', icon: <Info size={16} /> },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange({ method: m.id })}
            className={cx('flex items-center gap-2 rounded-[12px] border px-3 py-2.5 text-[.875rem] font-semibold transition', value.method === m.id ? 'border-navy-800 bg-navy-800 text-white shadow-card' : 'border-line bg-white text-ink-600 hover:border-sky-400')}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      {value.method === 'card' && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="grid gap-3.5 sm:grid-cols-6">
            <Field label="Card number" required error={errors.number} className="sm:col-span-4">
              <div className="relative">
                <Input
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={value.number}
                  onChange={(e) => {
                    const n = formatCardNumber(e.target.value);
                    onChange({ number: n, brand: detectBrand(n) });
                  }}
                  invalid={!!errors.number}
                  placeholder="4242 4242 4242 4242"
                  className="num pr-24 tracking-[0.08em]"
                />
                <span className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
                  <span className="num rounded-[5px] px-1.5 py-0.5 text-[.625rem] font-bold uppercase text-white" style={{ background: brand.colour }}>
                    {brand.label}
                  </span>
                </span>
              </div>
            </Field>
            <Field label="Name on card" required error={errors.name} className="sm:col-span-2">
              <Input value={value.name} onChange={(e) => onChange({ name: e.target.value })} invalid={!!errors.name} placeholder="A MA MENSAH" autoComplete="cc-name" />
            </Field>
            <Field label="Expiry" required error={errors.exp} className="sm:col-span-2">
              <Input
                inputMode="numeric"
                autoComplete="cc-exp"
                value={value.exp}
                onChange={(e) => onChange({ exp: formatExpiry(e.target.value) })}
                invalid={!!errors.exp}
                placeholder="09/28"
                className="num tracking-[0.08em]"
              />
            </Field>
            <Field label="Security code" required error={errors.cvc} className="sm:col-span-2">
              <Input inputMode="numeric" autoComplete="cc-csc" value={value.cvc} onChange={(e) => onChange({ cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} invalid={!!errors.cvc} placeholder="•••" className="num tracking-[0.2em]" />
            </Field>
            <Field label="Billing country" className="sm:col-span-2">
              <Select value={value.country} onChange={(e) => onChange({ country: e.target.value })}>
                {['Ghana', 'Nigeria', 'Kenya', 'South Africa', 'United Kingdom', 'United States', 'United Arab Emirates', 'Other'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Billing address" hint="Used for the address-verification check only" className="sm:col-span-6">
              <Input value={value.billing} onChange={(e) => onChange({ billing: e.target.value })} placeholder="12 Ring Road East, Airport City, Accra" autoComplete="street-address" />
            </Field>
          </div>

          {/* card preview */}
          <div>
            <div className="relative aspect-[1.586] w-full overflow-hidden rounded-[16px] bg-[linear-gradient(145deg,#0B2340_0%,#103054_58%,#053B39_100%)] p-5 text-white shadow-lift">
              <div className="pointer-events-none absolute inset-0 opacity-[0.10] texture-grid" />
              <div className="flex items-start justify-between">
                <span className="h-7 w-10 rounded-[5px] bg-[linear-gradient(140deg,#DEB564,#C99A3B)]" />
                <span className="font-display text-[.6875rem] uppercase tracking-[0.22em] text-white/60">AeroNova</span>
              </div>
              <p className="num mt-7 font-display text-[1.125rem] tracking-[0.18em]">{value.number || '•••• •••• •••• ••••'}</p>
              <div className="mt-4 flex items-end justify-between text-[.6875rem] uppercase tracking-[0.12em] text-white/60">
                <span className="truncate">
                  <span className="block text-[.5625rem] text-white/40">Card holder</span>
                  <span className="num text-white/90">{value.name || 'YOUR NAME'}</span>
                </span>
                <span>
                  <span className="block text-[.5625rem] text-white/40">Expires</span>
                  <span className="num text-white/90">{value.exp || '••/••'}</span>
                </span>
              </div>
              <span className="absolute bottom-4 right-5 font-display text-[.75rem] font-bold italic text-white/70">{brand.label}</span>
            </div>
            <p className="mt-3 flex items-start gap-2 text-[.75rem] leading-relaxed text-ink-500">
              <Lock size={14} className="mt-0.5 shrink-0 text-teal-600" /> 3-D Secure 2.0 is used where your bank requires it. We never store the full card number — a token and the last four digits only.
            </p>
          </div>
        </div>
      )}

      {value.method === 'mobile' && (
        <div className="grid gap-3.5 sm:grid-cols-3">
          <Field label="Provider" className="sm:col-span-1">
            <Select value={value.momoProvider} onChange={(e) => onChange({ momoProvider: e.target.value })}>
              {['MTN MoMo (Ghana)', 'AirtelTigo Money (Ghana)', 'Airtel Money (Nigeria)', 'M-Pesa (Kenya)', 'Orange Money (Senegal)', 'EcoCash (Zimbabwe)'].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </Field>
          <Field label="Registered number" required error={errors.momoNumber} className="sm:col-span-2" hint="You will get a prompt on the phone to approve the payment.">
            <Input value={value.momoNumber} onChange={(e) => onChange({ momoNumber: e.target.value })} placeholder="+233 24 000 0000" invalid={!!errors.momoNumber} className="num" />
          </Field>
        </div>
      )}

      {value.method === 'wallet' && (
        <div className="rounded-card border border-line bg-mist-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-[.9375rem] font-semibold text-navy-900">Travel wallet balance</p>
              <p className="num mt-0.5 text-[1.375rem] font-semibold text-teal-700">{money(walletTotal, prefs.currency, { decimals: true })}</p>
            </div>
            <Badge tone={walletTotal >= totalUSD ? 'teal' : 'gold'}>{walletTotal >= totalUSD ? 'Covers this fare' : `Short by ${money(totalUSD - walletTotal, prefs.currency, { decimals: true })}`}</Badge>
          </div>
          <ul className="mt-3 space-y-2">
            {wallet.map((w) => (
              <li key={w.id} className="flex items-center justify-between gap-3 rounded-[10px] border border-line bg-white px-3 py-2 text-[.8125rem]">
                <span>
                  <span className="block font-medium text-navy-900">{w.label}</span>
                  <span className="text-ink-400">{w.kind} · expires {w.expires}</span>
                </span>
                <span className="num font-semibold">{money(w.amount, prefs.currency, { decimals: true })}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[.8125rem] text-ink-500">Wallet credit is spent oldest-first. Anything left over stays valid until its expiry date, and can be shared with a Family Pool member.</p>
        </div>
      )}

      {value.method === 'bank' && (
        <div className="rounded-card border border-line bg-white p-4 text-[.875rem] leading-relaxed text-ink-600">
          <p className="font-display text-[.9375rem] font-semibold text-navy-900">Corporate invoice or bank transfer</p>
          <p className="mt-2">Selecting this holds the fare for 24 hours and emails a pro-forma invoice. AeroNova Business accounts with a credit line are billed monthly with cost-centre codes.</p>
          <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {[
              ['Bank', 'Ecobank Ghana, Airport City'],
              ['Account', 'AeroNova Airways Ltd · 1442008871'],
              ['Swift', 'EUGHGHAX'],
              ['Reference', 'Your booking reference (we will email it)'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-line pb-1.5">
                <dt className="text-ink-400">{k}</dt>
                <dd className="num text-right font-medium text-navy-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <label className="flex cursor-pointer items-center gap-2.5 rounded-[12px] border border-line bg-white p-3">
        <input type="checkbox" checked={value.remember} onChange={(e) => onChange({ remember: e.target.checked })} />
        <span className="text-[.875rem] text-ink-700">
          Save this payment method to my account <span className="text-ink-400">· tokenised, delete any time in Account → Payment methods</span>
        </span>
      </label>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-navy-900 p-4 text-white">
        <div>
          <p className="text-[.6875rem] uppercase tracking-[0.16em] text-white/50">Total to pay now</p>
          <p className="num font-display text-[1.75rem] font-semibold leading-tight">{money(totalUSD, prefs.currency, { decimals: true })}</p>
          <p className="text-[.75rem] text-white/55">Charged in {prefs.currency} · captured at ticketing, usually within 30 minutes</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button variant="onDark" size="lg" loading={paying} icon={<Lock size={16} />} onClick={() => setAuth(true)}>
            Pay {money(totalUSD, prefs.currency)}
          </Button>
          <p className="text-[.6875rem] text-white/45">By paying you accept the Contract of Carriage</p>
        </div>
      </div>

      <Modal
        open={auth}
        onClose={() => setAuth(false)}
        title="Bank verification"
        subtitle={`${brand.label} ending ${value.number.replace(/\D/g, '').slice(-4) || '0000'} · ${money(totalUSD, prefs.currency)}`}
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sky-50 text-navy-800">
            <Lock size={22} />
          </div>
          <p className="mt-4 text-[.9375rem] font-medium text-navy-900">Enter the one-time code your bank sent you</p>
          <p className="mt-1 text-[.8125rem] text-ink-500">Demo: any six digits will be accepted.</p>
          <div className="mt-5 flex justify-center gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                defaultValue={String((i * 7 + 3) % 10)}
                readOnly
                aria-label={`Digit ${i + 1}`}
                className="num h-12 w-10 rounded-[10px] border border-line bg-mist-50 text-center font-display text-[1.25rem] font-semibold text-navy-900"
              />
            ))}
          </div>
          <Button
            className="mt-6 w-full"
            size="lg"
            loading={paying}
            onClick={() => {
              setAuth(false);
              onPay();
            }}
          >
            Confirm payment
          </Button>
          <button className="mt-3 text-[.8125rem] font-semibold text-ink-500 underline-offset-4 hover:underline" onClick={() => setAuth(false)}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}

export function usePaymentErrors(p: PaymentState, method: PaymentState['method']) {
  return useMemo(() => {
    const e: Record<string, string> = {};
    if (method === 'card') {
      if (!p.number.replace(/\D/g, '')) e.number = 'Enter your card number';
      else if (!luhnValid(p.number)) e.number = 'That number fails the checksum — check for a typo';
      if (!/^\d{2}\/\d{2}$/.test(p.exp)) e.exp = 'Use MM/YY';
      else {
        const [mm, yy] = p.exp.split('/').map(Number);
        const exp = new Date(2000 + yy, mm, 0, 23, 59);
        if (exp < new Date()) e.exp = 'This card has expired';
      }
      if (p.cvc.length < 3) e.cvc = '3 or 4 digits';
      if (!p.name.trim() || p.name.trim().length < 3) e.name = 'Name as printed on the card';
    }
    if (method === 'mobile' && p.momoNumber.replace(/\D/g, '').length < 9) e.momoNumber = 'Enter the number registered with the wallet';
    return e;
  }, [p, method]);
}

export const PaidMark = () => (
  <span className="inline-flex items-center gap-1 text-[.75rem] font-semibold text-teal-700">
    <Check size={13} /> Paid
  </span>
);
