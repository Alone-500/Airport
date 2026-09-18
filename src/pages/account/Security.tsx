import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Check, Copy, Download, Fingerprint, KeyRound, Laptop, Lock, LogOut, Monitor, Shield, Smartphone, Trash2, TriangleAlert, X } from 'lucide-react';
import { cx } from '../../lib/utils';
import { AccountCard, AccountHeader } from './AccountLayout';
import { Badge, Button, Divider, Meter, SectionHeading } from '../../components/ui/Primitives';
import { ConfirmDialog, Modal } from '../../components/ui/Overlay';
import { Checkbox, Field, Input, Select } from '../../components/ui/Form';
import { useStore } from '../../store/store';

const DEVICES = [
  { id: 'dv1', name: 'iPhone 16 · AeroNova app', loc: 'Accra, Ghana', ip: '41.60.218.14', last: 'Now', current: true, kind: 'phone' },
  { id: 'dv2', name: 'MacBook Pro · Chrome 141', loc: 'Accra, Ghana', ip: '41.60.218.14', last: '2 h ago', current: false, kind: 'desktop' },
  { id: 'dv3', name: 'AeroNova kiosk · Galaxy T1', loc: 'Accra, Ghana', ip: '10.22.4.19', last: '3 days ago', current: false, kind: 'kiosk' },
  { id: 'dv4', name: 'Samsung S24 · Android app', loc: 'Nairobi, Kenya', ip: '197.232.88.4', last: '18 days ago', current: false, kind: 'phone' },
  { id: 'dv5', name: 'Unknown · Safari (iPad)', loc: 'Lagos, Nigeria', ip: '102.89.66.211', last: '2 days ago', current: false, kind: 'phone', suspicious: true },
];

export default function Security() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { toast, user, signOut } = useStore();
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwErr, setPwErr] = useState<Record<string, string>>({});
  const [twoTab, setTwoTab] = useState<'app' | 'sms' | 'key'>('app');
  const [twoOpen, setTwoOpen] = useState(false);
  const [code, setCode] = useState('');
  const [devices, setDevices] = useState(DEVICES);
  const [revoke, setRevoke] = useState<string | null>(null);
  const [danger, setDanger] = useState(params.get('danger') === '1');
  const [dangerText, setDangerText] = useState('');
  const [sessions, setSessions] = useState(3);
  const [breach, setBreach] = useState(false);

  if (!user) return null;

  const strength = (s: string) => {
    let n = 0;
    if (s.length >= 12) n += 40;
    else if (s.length >= 8) n += 20;
    if (/[A-Z]/.test(s) && /[a-z]/.test(s)) n += 20;
    if (/\d/.test(s)) n += 15;
    if (/[^\w\s]/.test(s)) n += 15;
    if (/(.)\1{2}/.test(s) || /1234|password|aeronova/i.test(s)) n = Math.max(0, n - 35);
    return Math.min(100, n);
  };
  const score = strength(pw.next);

  const changePw = () => {
    const e: Record<string, string> = {};
    if (!pw.current) e.current = 'Enter your current password';
    if (score < 60) e.next = 'Too weak — use 12 characters or a short phrase';
    if (pw.next !== pw.confirm) e.confirm = 'The two do not match';
    setPwErr(e);
    if (Object.keys(e).length) return;
    setPw({ current: '', next: '', confirm: '' });
    toast({ tone: 'success', title: 'Password changed', body: 'Other sessions were signed out. You are the only one still signed in.' });
    setSessions(1);
  };

  const log = [
    { t: 'Password changed', w: '2026-08-14 07:12', ip: '41.60.218.14 · Accra, GH', ok: true },
    { t: 'Passkey registered on iPhone', w: '2026-08-14 07:15', ip: '41.60.218.14 · Accra, GH', ok: true },
    { t: 'New payment method added', w: '2026-08-02 19:44', ip: '41.60.218.14 · Accra, GH', ok: true },
    { t: 'Failed sign-in × 3', w: '2026-07-28 02:11', ip: '102.89.66.211 · Lagos, NG', ok: false },
    { t: 'Document vault unlocked', w: '2026-07-21 11:02', ip: '41.60.218.14 · Accra, GH', ok: true },
    { t: 'Booking ANK4P71 changed', w: '2026-07-02 08:41', ip: '41.60.218.14 · Accra, GH', ok: true },
  ];

  return (
    <div>
      <AccountHeader
        title="Security"
        lead="Password, second factors, the devices signed in as you, and the record of what changed."
        badge={
          <Badge tone={breach || devices.some((d) => (d as { suspicious?: boolean }).suspicious) ? 'gold' : 'teal'} dot>
            {devices.some((d) => (d as { suspicious?: boolean }).suspicious) ? 'Unrecognised device seen' : 'No issues'}
          </Badge>
        }
        action={
          <Button size="sm" variant="secondary" icon={<Download size={14} />} onClick={() => toast({ tone: 'success', title: 'Security log exported', body: 'Sign-ins, changes and document access, 90 days.' })}>
            Export log
          </Button>
        }
      />

      {devices.some((d) => (d as { suspicious?: boolean }).suspicious) && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-card border border-gold-400/50 bg-gold-100/60 p-4">
          <TriangleAlert size={18} className="shrink-0 text-gold-600" />
          <p className="min-w-0 flex-1 text-[.875rem] leading-relaxed text-gold-600">
            <span className="font-semibold">A Safari session from Lagos signed in 2 days ago.</span> It failed three earlier attempts from the same IP. If that was not you, revoke it now — nothing was changed on the account.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setRevoke('dv5')}>
              Revoke it
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setBreach(true)}>
              Lock everything
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.05fr_1fr]">
        <div className="space-y-4">
          <AccountCard title="Password" lead="Minimum 12 characters. We check it against breached lists on every change.">
            <div className="space-y-3.5">
              <Field label="Current password" required error={pwErr.current}>
                <Input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} invalid={!!pwErr.current} autoComplete="current-password" />
              </Field>
              <Field label="New password" required error={pwErr.next}>
                <Input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} invalid={!!pwErr.next} autoComplete="new-password" placeholder="eight words beat eight characters" />
              </Field>
              <div>
                <Meter value={score} tone={score > 70 ? 'teal' : score > 45 ? 'gold' : 'ember'} label={score > 70 ? 'Strong' : score > 45 ? 'Acceptable' : 'Weak'} />
                <p className="mt-1.5 text-[.75rem] leading-relaxed text-ink-400">{pw.next ? (score > 70 ? 'Good. This one would take a very long time.' : 'Add a word, or swap a letter for a symbol.') : 'A phrase of four unrelated words is easier to remember and much harder to guess.'}</p>
              </div>
              <Field label="Confirm new password" required error={pwErr.confirm}>
                <Input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} invalid={!!pwErr.confirm} autoComplete="new-password" />
              </Field>
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={changePw} icon={<Lock size={15} />}>
                  Change password
                </Button>
                <span className={cx('num text-[.75rem] font-medium', !pwErr.current && !pwErr.next && !pwErr.confirm ? 'text-teal-700' : 'text-ink-400')}>
                  {Object.keys(pwErr).length ? `${Object.keys(pwErr).length} to fix` : 'Signing out other devices is automatic'}
                </span>
              </div>
            </div>
          </AccountCard>

          <AccountCard
            title="Two-step verification"
            lead="On. Required for payment changes, document vault access and refunds over USD 250."
            action={<Button size="sm" variant="secondary" onClick={() => setTwoOpen(true)}>Manage</Button>}
          >
            <ul className="space-y-2.5">
              {[
                { k: 'Authenticator app', d: 'TOTP · 6 digits, 30-second window', on: true, icon: <Smartphone size={15} /> },
                { k: 'Passkey on iPhone 16', d: 'Biometric · the best option we have', on: true, icon: <Fingerprint size={15} /> },
                { k: 'SMS to +233 24 ••• 0188', d: 'Fallback. Works without data at the gate.', on: true, icon: <KeyRound size={15} /> },
                { k: 'Recovery codes', d: '10 single-use codes · downloaded once, never stored by us', on: false, icon: <Copy size={15} /> },
              ].map((m) => (
                <li key={m.k} className="flex items-center gap-3 rounded-[12px] border border-line p-3">
                  <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-[10px]', m.on ? 'bg-teal-50 text-teal-700' : 'bg-mist-100 text-ink-400')}>{m.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[.875rem] font-medium text-navy-900">{m.k}</span>
                    <span className="block text-[.75rem] leading-snug text-ink-500">{m.d}</span>
                  </span>
                  <Badge tone={m.on ? 'teal' : 'neutral'}>{m.on ? 'Active' : 'Not set up'}</Badge>
                </li>
              ))}
            </ul>
            <Divider className="my-4" />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => toast({ tone: 'success', title: 'Recovery codes downloaded', body: 'aeronova-recovery-codes.txt — print them or put them in your password manager.' })}>
                Download recovery codes
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toast({ tone: 'info', title: 'Trusted devices', body: '3 devices skip the second step for 30 days. Revoking them all is in the sessions list.' })}>
                Trusted devices: 3
              </Button>
            </div>
          </AccountCard>

          <AccountCard title="Login history" lead="Last 90 days · every sign-in, not just the recent ones">
            <ul className="divide-y divide-line">
              {log.map((l, i) => (
                <li key={i} className="flex flex-wrap items-center gap-3 py-2.5">
                  <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-full', l.ok ? 'bg-mist-100 text-ink-500' : 'bg-red-50 text-red-600')}>{l.ok ? <Check size={13} /> : <X size={13} />}</span>
                  <span className="min-w-0 flex-1 text-[.875rem] text-navy-900">{l.t}</span>
                  <span className="num text-[.75rem] text-ink-400">{l.w}</span>
                  <span className="num w-full text-[.7rem] text-ink-400 sm:w-auto">{l.ip}</span>
                </li>
              ))}
            </ul>
          </AccountCard>
        </div>

        <div className="space-y-4">
          <AccountCard title="Devices & sessions" lead={`${sessions} active session${sessions > 1 ? 's' : ''}`}>
            <ul className="space-y-2.5">
              {devices.map((d) => {
                const susp = (d as { suspicious?: boolean }).suspicious;
                return (
                  <li key={d.id} className={cx('flex flex-wrap items-center gap-3 rounded-[12px] border p-3', susp ? 'border-red-200 bg-red-50/60' : 'border-line')}>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-white text-navy-700 ring-1 ring-line">
                      {d.kind === 'phone' ? <Smartphone size={15} /> : d.kind === 'kiosk' ? <Monitor size={15} /> : <Laptop size={15} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[.875rem] font-medium text-navy-900">{d.name}</span>
                      <span className="num block text-[.75rem] text-ink-500">
                        {d.loc} · {d.ip} · {d.last}
                      </span>
                    </span>
                    {d.current ? (
                      <Badge tone="teal" dot>
                        This device
                      </Badge>
                    ) : (
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="ghost" onClick={() => setRevoke(d.id)}>
                          Revoke
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="danger" icon={<LogOut size={14} />} onClick={() => { setDevices((v) => v.filter((x) => x.current)); setSessions(1); toast({ tone: 'info', title: 'Signed out everywhere else', body: 'Two sessions ended. If you did not start them, change your password now.' }); }}>
                Sign out other devices
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toast({ tone: 'success', title: 'This device trusted', body: 'No second step here for 30 days.' })}>
                Trust this device
              </Button>
            </div>
          </AccountCard>

          <AccountCard title="Account health" lead="Five things, checked now">
            <ul className="space-y-2.5">
              {[
                { l: 'Two-step verification', v: 'On', ok: true, d: 100 },
                { l: 'Password strength', v: score ? (score > 70 ? 'Strong' : 'Fair') : 'Good (last tested 8 days ago)', ok: true, d: 84 },
                { l: 'Recovery codes stored', v: 'Not downloaded', ok: false, d: 20 },
                { l: 'Email confirmed', v: 'Confirmed', ok: true, d: 100 },
                { l: 'Documents current', v: '2 need renewal', ok: false, d: 62 },
              ].map((x) => (
                <li key={x.l}>
                  <div className="flex items-center justify-between gap-3 text-[.875rem]">
                    <span className="flex items-center gap-2 font-medium text-navy-900">
                      <span className={cx('grid h-5 w-5 place-items-center rounded-full', x.ok ? 'bg-teal-500 text-white' : 'bg-gold-500 text-white')}>{x.ok ? <Check size={11} strokeWidth={3} /> : <AlertTriangle size={11} />}</span>
                      {x.l}
                    </span>
                    <span className={cx('text-[.8125rem]', x.ok ? 'text-ink-500' : 'text-gold-600')}>{x.v}</span>
                  </div>
                  <Meter value={x.d} tone={x.ok ? 'teal' : 'gold'} className="mt-1.5" />
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-[10px] bg-mist-50 p-3 text-[.8125rem] leading-relaxed text-ink-500">
              Overall score <span className="num font-display font-semibold text-navy-900">73 / 100</span>. Downloading recovery codes and renewing the two documents takes it to 100 — both take under five minutes.
            </p>
          </AccountCard>

          <AccountCard title="Privacy & data controls">
            <div className="space-y-2.5">
              {[
                ['Personalised fares', 'We use your route history to choose which offers to show. Off means random order, same prices.'],
                ['Share trip with airport partners', 'Transfer and hotel partners see arrival time and bag count only.'],
                ['Product analytics', 'Which screens you use, aggregated, never tied to your name.'],
                ['Marketing on social platforms', 'Off. We do not upload customer lists anywhere, ever.'],
              ].map(([k, v], i) => (
                <Checkbox key={k} label={k} desc={v} checked={i !== 3} onChange={() => toast({ tone: 'info', title: `${k} updated` })} />
              ))}
            </div>
            <Divider className="my-4" />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" icon={<Download size={14} />} onClick={() => toast({ tone: 'success', title: 'Data export requested', body: 'A JSON archive of everything we hold will be emailed within 24 hours (law says 30 days; we do it same-day).' })}>
                Export everything
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDanger(true)}>
                Close account
              </Button>
            </div>
          </AccountCard>

          <div className="rounded-card border border-line bg-white p-4">
            <p className="flex items-center gap-2 font-display text-[.9375rem] font-semibold text-navy-900">
              <Shield size={15} className="text-teal-600" /> Something wrong?
            </p>
            <p className="mt-1.5 text-[.8125rem] leading-relaxed text-ink-500">
              If you think someone else has your password, lock the account first and call us second. The line is answered by a person in Accra, 24 hours, and they can freeze the wallet and cancel every ticket in one call.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="danger" onClick={() => setBreach(true)}>
                Lock my account
              </Button>
              <Button size="sm" variant="secondary" href="tel:+233302200100">
                +233 302 200 100
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <SectionHeading eyebrow="Danger zone" title="Closing the account is easy, and reversible for 30 days." className="[&_h2]:text-[1.25rem]" />
        <div className="mt-4 rounded-card border border-red-200 bg-red-50/60 p-5">
          <p className="text-[.875rem] leading-relaxed text-red-800">
            Closing deletes your profile, saved travellers, document vault and preferences after a 30-day grace period. Points and wallet credit above zero are paid out to your card first — we cannot confiscate them. Live bookings are not cancelled by closing the account; those need cancelling one by one.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Type CLOSE to confirm" error={danger && dangerText !== 'CLOSE' && dangerText ? 'Must be exactly CLOSE' : undefined}>
              <Input value={dangerText} onChange={(e) => setDangerText(e.target.value.toUpperCase())} placeholder="CLOSE" className="num uppercase tracking-[0.2em]" />
            </Field>
            <div className="flex items-end">
              <Button
                variant="danger"
                disabled={dangerText !== 'CLOSE'}
                onClick={() => {
                  toast({ tone: 'warn', title: 'Closure scheduled', body: 'In 30 days, unless you sign in and cancel it. Confirmation email sent.' });
                  signOut();
                  nav('/');
                }}
              >
                <Trash2 size={15} /> Schedule closure
              </Button>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-2 text-[.75rem] text-red-700/80">
            <Copy size={12} /> Reference ANV-4471-8802 · you can cite it in any later correspondence.
          </p>
        </div>
      </div>

      <Modal
        open={twoOpen}
        onClose={() => setTwoOpen(false)}
        title="Two-step verification"
        subtitle="Choose at least one method that is not SMS. Passkeys are the strongest and the least annoying."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setTwoOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (twoTab === 'app' && !/^\d{6}$/.test(code)) {
                  toast({ tone: 'error', title: 'Enter the six digits', body: 'In the demo, any six digits work.' });
                  return;
                }
                setTwoOpen(false);
                toast({ tone: 'success', title: twoTab === 'key' ? 'Passkey added to this device' : 'Method updated', body: 'Recovery codes were regenerated — download them again.' });
              }}
            >
              Confirm
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <Select value={twoTab} onChange={(e) => setTwoTab(e.target.value as typeof twoTab)} aria-label="Method">
            <option value="app">Authenticator app (TOTP)</option>
            <option value="sms">SMS to +233 24 ••• 0188</option>
            <option value="key">Passkey on this device</option>
          </Select>
          {twoTab === 'app' && (
            <>
              <div className="rounded-[12px] bg-mist-50 p-4 text-center">
                <p className="num text-[.8125rem] font-semibold tracking-[0.2em] text-navy-900">JBSW Y3DP EHPK 3PXP</p>
                <p className="mt-1 text-[.75rem] text-ink-400">Or scan the QR code shown in your app — it is the same secret.</p>
              </div>
              <Field label="Six-digit code">
                <Input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="num text-center text-[1.125rem] tracking-[0.4em]" />
              </Field>
            </>
          )}
          {twoTab === 'sms' && (
            <>
              <Field label="Mobile number">
                <Input defaultValue="+233 24 551 0188" className="num" />
              </Field>
              <p className="rounded-[10px] bg-mist-50 p-3 text-[.8125rem] leading-relaxed text-ink-500">SMS is a fallback, not the primary: SIM-swap attacks are real, and at an airport you are exactly the kind of target. Keep the passkey as your first choice.</p>
            </>
          )}
          {twoTab === 'key' && (
            <div className="rounded-[12px] border border-dashed border-navy-300 bg-navy-50/50 p-5 text-center">
              <Fingerprint size={28} className="mx-auto text-navy-700" />
              <p className="mt-2 text-[.9375rem] font-semibold text-navy-900">Use Face ID to create a passkey</p>
              <p className="mt-1 text-[.8125rem] text-ink-500">It never leaves this device, and there is nothing to type at the gate.</p>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!revoke}
        onCancel={() => setRevoke(null)}
        onConfirm={() => {
          setDevices((v) => v.filter((x) => x.id !== revoke));
          setSessions((s) => Math.max(1, s - 1));
          setRevoke(null);
          toast({ tone: 'success', title: 'Session ended', body: 'That device is signed out and must authenticate again.' });
        }}
        title="Revoke this session?"
        confirmLabel="Revoke"
        body="The device is signed out immediately and will need a password plus a second factor to get back in."
      />

      <Modal
        open={breach}
        onClose={() => setBreach(false)}
        title="Lock the account"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setBreach(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setBreach(false);
                setSessions(1);
                toast({ tone: 'warn', title: 'Account locked', body: 'All other sessions ended. Wallet frozen. Call +233 302 200 100 to unlock with a supervisor.' });
              }}
            >
              Lock it now
            </Button>
          </>
        }
      >
        <p className="text-[.875rem] leading-relaxed text-ink-600">
          Locking stops anyone — including you, on a new device — from booking, spending wallet credit or changing documents. Existing tickets keep flying. Unlocking needs a supervisor and a document check.
        </p>
        <div className="mt-3 space-y-2">
          <Checkbox label="Also freeze my travel wallet" defaultChecked />
          <Checkbox label="Email my emergency contact that the account is locked" />
        </div>
      </Modal>
    </div>
  );
}
