import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CreditCard, Globe, Languages, Moon, Plane, Shield, Ticket, Volume2 } from 'lucide-react';
import { cx } from '../../lib/utils';
import { AccountCard, AccountHeader } from './AccountLayout';
import { Badge, Button, Divider } from '../../components/ui/Primitives';
import { Checkbox, Field, Radio, SegmentedControl, Select, Switch } from '../../components/ui/Form';
import { CURRENCIES, LANGUAGES } from '../../data/offers';
import { MEALS } from '../../components/booking/forms-helpers';
import { useStore } from '../../store/store';

export default function Preferences() {
  const { prefs, setPrefs, toast, user } = useStore();
  const nav = useNavigate();
  const [seat, setSeat] = useState(prefs.seatPref);
  const [meal, setMeal] = useState(prefs.mealPref);
  const [assist, setAssist] = useState(prefs.assistProfile);
  const [toggles, setToggles] = useState({
    sms: prefs.sms,
    marketing: prefs.marketing,
    sharing: prefs.sharing,
    silentByDefault: false,
    autoCheckin: true,
    seatReminders: true,
    bagUpdates: true,
    quietHours: true,
    adaptiveMotion: false,
    reduceTransparency: false,
  });
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const set = (k: keyof typeof toggles, v: boolean) => {
    setToggles((t) => ({ ...t, [k]: v }));
    setSaved(false);
    toast({ tone: 'info', title: 'Preference updated', body: 'Applies from your next booking.' });
  };

  return (
    <div>
      <AccountHeader
        title="Preferences"
        lead="How we fill in your booking, what we send you, and how the site behaves. Everything here is a default you can override per trip."
        action={
          <>
            <Button size="sm" variant="ghost" onClick={() => nav('/account/notifications')}>
              Notification centre
            </Button>
            <Button
              size="sm"
              icon={<Check size={15} />}
              onClick={() => {
                setPrefs({ seatPref: seat, mealPref: meal, assistProfile: assist, sms: toggles.sms, marketing: toggles.marketing, sharing: toggles.sharing });
                setSaved(true);
                toast({ tone: 'success', title: 'Preferences saved', body: 'Applied to this account and the app on your devices.' });
              }}
            >
              {saved ? 'Saved' : 'Save changes'}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <AccountCard title="Flying preferences" lead="Used to prefill every booking you start">
          <Field label="Preferred seat">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'window', l: 'Window', d: 'Aisle two rows back if window is gone' },
                { id: 'aisle', l: 'Aisle', d: 'Forward of the wing' },
                { id: 'either', l: 'No preference', d: 'Assign at check-in' },
              ].map((o) => (
                <button key={o.id} onClick={() => { setSeat(o.id); setSaved(false); }} className={cx('rounded-[12px] border p-3 text-left transition', seat === o.id ? 'border-navy-800 bg-navy-50/60 shadow-card' : 'border-line hover:border-sky-300')}>
                  <span className="flex items-center justify-between">
                    <span className="font-display text-[.875rem] font-semibold text-navy-900">{o.l}</span>
                    {seat === o.id && <Check size={14} className="text-teal-600" />}
                  </span>
                  <span className="mt-1 block text-[.75rem] leading-snug text-ink-500">{o.d}</span>
                </button>
              ))}
            </div>
          </Field>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Default meal">
              <Select value={meal} onChange={(e) => { setMeal(e.target.value); setSaved(false); }}>
                {MEALS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Assistance profile" hint="Attached automatically to every booking, including third-party ones">
              <Select value={assist} onChange={(e) => { setAssist(e.target.value); setSaved(false); }}>
                {['', 'Wheelchair · ramp (WCHR)', 'Wheelchair · aisle (WCHS)', 'Wheelchair · to seat (WCHC)', 'Sunflower lanyard · hidden condition', 'Deaf / hard of hearing briefing', 'Blind / low vision briefing', 'Assistance dog in cabin', 'Medical oxygen (approved)', 'Travelling with an infant'].map((x) => (
                  <option key={x} value={x}>
                    {x || 'None'}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Divider className="my-4" />
          <div className="divide-y divide-line">
            <Switch label="Automatic check-in at 48 hours" desc="We take the assigned seat, pay nothing extra, and send the pass. Cancel any time before." checked={toggles.autoCheckin} onChange={(v) => set('autoCheckin', v)} />
            <Switch label="Seat upgrade offers before departure" desc="Fixed price, never an auction, only when a suite is genuinely open." checked={toggles.seatReminders} onChange={(v) => set('seatReminders', v)} />
            <Switch label="Bag scan updates" desc="Four pings per bag: accepted, loaded, arrival scan, delivered." checked={toggles.bagUpdates} onChange={(v) => set('bagUpdates', v)} />
            <Switch label="Try the quiet cabin by default" desc="On long-haul when seats allow: no announcements at your row, dimmed lighting, no trolley after 22:00." checked={toggles.silentByDefault} onChange={(v) => set('silentByDefault', v)} />
          </div>
        </AccountCard>

        <div className="space-y-4">
          <AccountCard title="Language, currency & units">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Currency" hint="Applies across the whole site immediately">
                <Select value={prefs.currency} onChange={(e) => setPrefs({ currency: e.target.value as typeof prefs.currency })}>
                  {CURRENCIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Language">
                <Select value={prefs.language} onChange={(e) => setPrefs({ language: e.target.value })}>
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label} — {l.note}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Units">
                <SegmentedControl
                  full
                  size="sm"
                  value={prefs.units}
                  onChange={(v) => setPrefs({ units: v })}
                  options={[
                    { id: 'metric', label: 'Metric · km, °C, kg' },
                    { id: 'imperial', label: 'Imperial · mi, °F, lb' },
                  ]}
                />
              </Field>
              <Field label="Time display">
                <SegmentedControl
                  full
                  size="sm"
                  value={'local' as const}
                  onChange={() => {}}
                  options={[
                    { id: 'local', label: 'Airport local time' },
                    { id: 'home', label: 'My home timezone' },
                  ]}
                />
              </Field>
            </div>
            <p className="mt-3 flex items-start gap-2 rounded-[10px] bg-mist-50 p-3 text-[.75rem] leading-relaxed text-ink-500">
              <Globe size={14} className="mt-0.5 shrink-0 text-ink-400" />
              Flight times are always shown in airport local time, with a “+1” marker when you land the next day. Your home timezone appears in brackets on long connections.
            </p>
          </AccountCard>

          <AccountCard title="What we send, and how" lead="Four channels, and you decide per topic">
            <div className="overflow-hidden rounded-[12px] border border-line">
              <table className="w-full text-left text-[.8125rem]">
                <thead className="bg-mist-50">
                  <tr className="text-2xs uppercase tracking-wider text-ink-400">
                    <th className="px-3 py-2 font-semibold">Topic</th>
                    <th className="px-2 py-2 text-center font-semibold">Email</th>
                    <th className="px-2 py-2 text-center font-semibold">SMS</th>
                    <th className="px-2 py-2 text-center font-semibold">Push</th>
                    <th className="px-3 py-2 text-center font-semibold">WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {[
                    ['Gate & delay changes', true, true, true, true],
                    ['Baggage updates', true, false, true, true],
                    ['Check-in reminders', true, true, true, false],
                    ['Payment receipts', true, false, false, false],
                    ['Points & status', true, false, true, false],
                    ['Fares and offers', false, false, false, false],
                  ].map(([label, ...vals]) => (
                    <tr key={label as string}>
                      <td className="px-3 py-2 font-medium text-navy-900">{label}</td>
                      {vals.map((v, i) => (
                        <td key={i} className="px-2 py-2 text-center">
                          <button
                            onClick={() => toast({ tone: v ? 'info' : 'success', title: `${v ? 'Turned off' : 'Turned on'}: ${label}`, body: i === 0 ? 'Email' : i === 1 ? 'SMS' : i === 2 ? 'Push' : 'WhatsApp' })}
                            className={cx('grid h-6 w-6 place-items-center rounded-[7px] border transition', v ? 'border-teal-500 bg-teal-500 text-white' : 'border-ink-200 text-transparent hover:border-navy-400')}
                            aria-label={`${v ? 'Disable' : 'Enable'} ${label} via ${i === 0 ? 'email' : i === 1 ? 'SMS' : i === 2 ? 'push' : 'WhatsApp'}`}
                          >
                            <Check size={12} strokeWidth={3} />
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 divide-y divide-line">
              <Switch label="Quiet hours" desc="Nothing non-essential between 22:30 and 06:30 unless your flight is affected." checked={toggles.quietHours} onChange={(v) => set('quietHours', v)} />
              <Switch label="Send me a weekly digest instead of individual emails" desc="Monday 07:00, one email, everything from the week." checked={false} onChange={() => toast({ tone: 'success', title: 'Digest on', body: 'First digest arrives Monday at 07:00.' })} />
            </div>
          </AccountCard>

          <AccountCard title="Accessibility & motion">
            <div className="divide-y divide-line">
              <Switch label="Reduce transparency" desc="Turns off the frosted panels on the floating navigation." checked={toggles.reduceTransparency} onChange={(v) => set('reduceTransparency', v)} />
              <Switch label="Reduce animation" desc="Also honoured automatically if your device asks for it." checked={toggles.adaptiveMotion} onChange={(v) => set('adaptiveMotion', v)} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Text size">
                <Radio
                  name="textsize"
                  value="md"
                  onChange={() => {}}
                  options={[
                    { id: 'sm', label: 'Compact' },
                    { id: 'md', label: 'Regular' },
                    { id: 'lg', label: 'Large' },
                  ]}
                  className="grid-cols-3"
                />
              </Field>
              <Field label="Focus style" hint="Keyboard focus ring colour">
                <Select defaultValue="teal">
                  <option value="teal">Teal (default)</option>
                  <option value="navy">High-contrast navy</option>
                  <option value="gold">Gold</option>
                </Select>
              </Field>
            </div>
            <p className="mt-3 text-[.75rem] leading-relaxed text-ink-400">
              Every form on this site works with a keyboard alone, and the seat map is navigable with arrow keys. If something does not, tell the Accessibility Desk and we fix it — that is a standing commitment, not a support ticket.
            </p>
          </AccountCard>

          <AccountCard title="Privacy & data">
            <div className="space-y-2.5">
              <Checkbox label="Share trip data with transfer and hotel partners" desc="Only the arrival time and the number of bags. Never your document number." checked={toggles.sharing} onChange={(v) => set('sharing', v)} />
              <Checkbox label="Include me in anonymous network statistics" desc="Load factors and delay causes by route, published monthly." checked onChange={() => {}} />
              <Checkbox label="Marketing email" desc="Eight a year at most. Off by default, and it never affects your fare." checked={toggles.marketing} onChange={(v) => set('marketing', v)} />
            </div>
            <Divider className="my-4" />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" icon={<Shield size={14} />} onClick={() => nav('/account/security')}>
                Security settings
              </Button>
              <Button size="sm" variant="ghost" icon={<Languages size={14} />} onClick={() => toast({ tone: 'info', title: 'Language pack', body: 'French, Portuguese, Kiswahili and Arabic interfaces are complete; Twi is 84% and used for SMS.' })}>
                Language packs
              </Button>
              <Button size="sm" variant="ghost" icon={<Volume2 size={14} />} onClick={() => toast({ tone: 'success', title: 'Test push sent', body: 'Check your device — if it did not arrive, we will tell you why.' })}>
                Send me a test alert
              </Button>
            </div>
          </AccountCard>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: <Bell size={15} />, t: 'SMS is best for disruption', d: 'Push needs the app open on data. SMS reaches a basic phone at the gate.' },
          { icon: <Ticket size={15} />, t: 'Bags: turn on all four pings', d: 'The arrival-scan ping is the one that tells you whether to wait at the belt or go.' },
          { icon: <Plane size={15} />, t: 'Auto check-in is not a seat gamble', d: 'We never charge for a seat you did not choose, and you can swap free afterwards.' },
          { icon: <CreditCard size={15} />, t: 'Wallet spends before cards', d: 'Credit is applied automatically at the payment step, oldest expiry first.' },
          { icon: <Moon size={15} />, t: 'Quiet hours save your night', d: 'A 3 a.m. gate change still comes through; a 3 a.m. voucher offer does not.' },
        ].map((c) => (
          <div key={c.t} className="rounded-card border border-line bg-white p-4">
            <span className="grid h-8 w-8 place-items-center rounded-[9px] bg-mist-100 text-navy-700">{c.icon}</span>
            <p className="mt-2.5 font-display text-[.875rem] font-semibold text-navy-900">{c.t}</p>
            <p className="mt-1 text-[.8125rem] leading-relaxed text-ink-500">{c.d}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 flex items-center gap-2 text-[.75rem] text-ink-400">
        <Badge tone="teal">Synced</Badge> These preferences are already applied on your phone, tablet and the two airport kiosks you used this year.
      </p>
    </div>
  );
}
