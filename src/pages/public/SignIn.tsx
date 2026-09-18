import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Eye, EyeOff, KeyRound, Lock, Mail, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { cx } from '../../lib/utils';
import { Badge, Button, Divider, NovaRule } from '../../components/ui/Primitives';
import { Checkbox, Field, Input, Select } from '../../components/ui/Form';
import { Photo, Sunburst } from '../../components/brand/Brand';
import { useStore } from '../../store/store';
import { DEMO_LOGIN } from '../../data/admin';
import { TIERS } from '../../data/offers';

export default function SignIn() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { signIn, toast, user } = useStore();
  const [mode, setMode] = useState<'in' | 'up'>(params.get('mode') === 'up' ? 'up' : 'in');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const [f, setF] = useState({ email: DEMO_LOGIN.customer.email, password: 'beyond-horizons', remember: true, two: '', first: 'Ama', last: 'Mensah', country: 'Ghana', dob: '1988-04-12', terms: true, news: false, num: '' });

  const go = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      signIn(f.email, `${f.first} ${f.last}`.trim() || DEMO_LOGIN.customer.name);
      toast({ tone: 'success', title: mode === 'in' ? 'Signed in' : `Welcome, ${f.first} — number ANV-4471-9002`, body: params.get('next') ? 'Back to where you were.' : 'Your trips are loaded.' });
      nav(params.get('next') ?? '/account');
    }, 850);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(f.email)) er.email = 'Enter the email on your booking';
    if (f.password.length < 6) er.password = 'At least 6 characters';
    if (mode === 'up') {
      if (!f.first.trim()) er.first = 'Required';
      if (!f.last.trim()) er.last = 'Required';
      if (!f.terms) er.terms = 'You need to accept the terms to join';
      if (f.num && !/^ANV-\d{4}-\d{4}$/.test(f.num.trim().toUpperCase())) er.num = 'Membership numbers look like ANV-1234-5678';
    }
    setErr(er);
    if (Object.keys(er).length) return;
    go();
  };

  return (
    <div className="grid min-h-screen bg-mist-50/60 lg:grid-cols-[1.05fr_minmax(0,520px)]">
      {/* form side */}
      <div className="flex flex-col justify-between px-gutter py-10 lg:py-14">
        <div>
          <Link to="/" className="inline-flex items-center gap-2.5 font-display text-navy-900">
            <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-navy-800 text-gold-500">
              <Sunburst size={20} />
            </span>
            <span className="text-[1.0625rem] font-bold tracking-[-0.02em]">AeroNova</span>
          </Link>

          <div className="mt-10 max-w-md lg:mt-14">
            <p className="eyebrow">{mode === 'in' ? 'Sign in' : 'Create your account'}</p>
            <h1 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-navy-900">
              {mode === 'in' ? 'Your trips, points and passes, in one place.' : 'Join AeroNova Rewards. Free, and it takes a minute.'}
            </h1>
            <p className="mt-3 text-[.9375rem] leading-relaxed text-ink-600">
              {mode === 'in' ? 'Booking references work without an account, but an account keeps your travellers, your documents and your wallet.' : 'You earn from the first seat, and 4,000 bonus points land when you book a flight this quarter.'}
            </p>

            <form onSubmit={submit} className="mt-7 space-y-3.5" noValidate>
              {mode === 'up' && (
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <Field label="First name" required error={err.first}>
                    <Input value={f.first} onChange={(e) => setF({ ...f, first: e.target.value })} invalid={!!err.first} autoComplete="given-name" />
                  </Field>
                  <Field label="Last name" required error={err.last}>
                    <Input value={f.last} onChange={(e) => setF({ ...f, last: e.target.value })} invalid={!!err.last} autoComplete="family-name" />
                  </Field>
                </div>
              )}
              <Field label="Email address" required error={err.email}>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  <Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} invalid={!!err.email} className="pl-10" autoComplete="email" placeholder="you@company.com" />
                </div>
              </Field>
              <Field
                label="Password"
                required
                error={err.password}
                right={
                  mode === 'in' ? (
                    <button type="button" onClick={() => toast({ tone: 'info', title: 'Reset link sent', body: 'Check your inbox — the link works for 30 minutes.' })} className="text-[.75rem] font-semibold text-sky-700 hover:underline">
                      Forgot?
                    </button>
                  ) : undefined
                }
              >
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  <Input type={show ? 'text' : 'password'} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} invalid={!!err.password} className="pl-10 pr-11" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} placeholder="••••••••••" />
                  <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-navy-800">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              {mode === 'up' && (
                <>
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <Field label="Date of birth" required>
                      <Input type="date" value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} />
                    </Field>
                    <Field label="Country">
                      <Select value={f.country} onChange={(e) => setF({ ...f, country: e.target.value })}>
                        {['Ghana', 'Nigeria', 'Kenya', 'South Africa', 'United Kingdom', 'United States', 'Other'].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <Field label="Existing membership number" error={err.num} hint="Optional — link an AeroNova or partner card so nothing is lost">
                    <Input value={f.num} onChange={(e) => setF({ ...f, num: e.target.value.toUpperCase() })} placeholder="ANV-0000-0000" invalid={!!err.num} className="num uppercase tracking-[0.12em]" />
                  </Field>
                  <div className="space-y-2">
                    <Checkbox label={<>I accept the <span className="font-semibold underline underline-offset-2">programme terms</span> and privacy notice</>} checked={f.terms} onChange={(v) => setF({ ...f, terms: v })} />
                    {err.terms && <p className="text-[.8125rem] font-medium text-red-600">{err.terms}</p>}
                    <Checkbox label="Email me double-point weeks and new routes" desc="About eight a year." checked={f.news} onChange={(v) => setF({ ...f, news: v })} />
                  </div>
                </>
              )}

              {mode === 'in' && (
                <>
                  <Checkbox label="Keep me signed in on this device" checked={f.remember} onChange={(v) => setF({ ...f, remember: v })} />
                  <div className="rounded-[12px] border border-line bg-white p-3">
                    <p className="flex items-center gap-2 text-[.8125rem] font-medium text-navy-900">
                      <KeyRound size={14} className="text-teal-600" /> Two-step verification
                    </p>
                    <p className="mt-1 text-[.75rem] leading-snug text-ink-500">Your account has 2FA on. Enter the six digits from your app — in this demo, any six digits work.</p>
                    <div className="mt-2 flex gap-1.5">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <input
                          key={i}
                          value={f.two[i] ?? ''}
                          onChange={(e) => setF({ ...f, two: e.target.value.replace(/\D/g, '').slice(0, 6) + (e.target.value[i] ?? '') })}
                          inputMode="numeric"
                          aria-label={`Digit ${i + 1}`}
                          className="num h-11 w-9 rounded-[9px] border border-line bg-mist-50 text-center font-display text-[1rem] font-semibold text-navy-900 outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/12"
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Button type="submit" size="lg" full loading={busy} iconRight={busy ? undefined : <ArrowRight size={17} />}>
                {mode === 'in' ? 'Sign in' : 'Create my account'}
              </Button>
            </form>

            <Divider className="my-6" label="or" />
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="secondary" onClick={() => { setF({ ...f, email: DEMO_LOGIN.customer.email }); setBusy(true); setTimeout(() => { setBusy(false); signIn(DEMO_LOGIN.customer.email); toast({ tone: 'success', title: 'Signed in with Apple', body: 'Demo identity accepted.' }); nav('/account'); }, 600); }}>
                Continue with Apple
              </Button>
              <Button variant="secondary" onClick={() => { setBusy(true); setTimeout(() => { setBusy(false); signIn('ops@aeronova.aero', DEMO_LOGIN.admin.name); toast({ tone: 'success', title: 'Staff identity used', body: 'You can open the operations dashboard at /admin.' }); nav('/admin'); }, 600); }}>
                Continue as staff
              </Button>
            </div>

            <p className="mt-6 text-[.875rem] text-ink-500">
              {mode === 'in' ? 'No account yet?' : 'Already a member?'}{' '}
              <button
                onClick={() => {
                  setMode(mode === 'in' ? 'up' : 'in');
                  setErr({});
                }}
                className="font-display font-semibold text-navy-900 underline decoration-teal-400 decoration-2 underline-offset-4 hover:text-sky-700"
              >
                {mode === 'in' ? 'Join AeroNova Rewards' : 'Sign in instead'}
              </button>
            </p>
            {user && (
              <p className="mt-3 flex items-center gap-2 text-[.8125rem] text-teal-700">
                <Check size={14} /> Signed in as {user.email} — <Link className="font-semibold underline" to="/account">go to my account</Link>
              </p>
            )}
          </div>
        </div>

        <NovaRule className="mt-12" />
      </div>

      {/* art side */}
      <div className="relative hidden overflow-hidden bg-navy-950 lg:block">
        <Photo src="/img/cabin-premium.jpg" alt="" seed="signin" className="absolute inset-0" imgClassName="h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 via-navy-950/40 to-navy-950" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <div>
            <p className="eyebrow text-teal-300">AeroNova Rewards</p>
            <h2 className="mt-3 max-w-sm font-display text-[1.75rem] font-semibold leading-snug">Four tiers, and none of them are a cliff.</h2>
          </div>
          <ul className="space-y-3">
            {TIERS.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-[14px] border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-sm transition hover:bg-white/[0.08]">
                <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-[10px]', t.colour === 'gold' ? 'bg-gold-500 text-navy-950' : 'bg-white/10 text-teal-300')}>
                  <Sparkles size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[.9375rem] font-semibold">{t.name}</span>
                  <span className="block text-[.75rem] text-white/55">{t.qualify}</span>
                </span>
                <Badge tone={t.earnBonus ? 'teal' : 'neutral'}>+{t.earnBonus}%</Badge>
              </li>
            ))}
          </ul>
          <p className="flex items-center gap-2 text-[.8125rem] text-white/50">
            <ShieldCheck size={15} className="text-teal-300" /> We never sell your data, and you can delete the account in one click.
          </p>
        </div>
      </div>
    </div>
  );
}

export const SignUpIcon = UserPlus;
