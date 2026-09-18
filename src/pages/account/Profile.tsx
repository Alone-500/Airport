import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, Building2, CalendarCheck, Check, Plus, ShieldCheck, Sparkles, Trash2, User } from 'lucide-react';
import { cx, ageFrom, fmtDate, toISODate } from '../../lib/utils';
import type { Passenger } from '../../types';
import { AccountCard, AccountHeader } from './AccountLayout';
import { Badge, Button, Divider, EmptyState } from '../../components/ui/Primitives';
import { ConfirmDialog, Modal } from '../../components/ui/Overlay';
import { Checkbox, DateField, Field, Input, Select } from '../../components/ui/Form';
import { useStore } from '../../store/store';
import { emptyPassenger, validatePassenger } from '../../components/booking/PassengerForm';
import { COUNTRIES, DOC_TYPES, GENDERS, SALUTATIONS } from '../../components/booking/forms-helpers';

export default function Profile() {
  const nav = useNavigate();
  const { user, prefs, setPrefs, savedPassengers, savePassenger, removePassenger, toast, signIn } = useStore();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('+233 24 551 0188');
  const [dob, setDob] = useState('1988-04-12');
  const [country, setCountry] = useState('Ghana');
  const [gender, setGender] = useState('Female');
  const [title, setTitle] = useState('Ms');
  const [company, setCompany] = useState('CocoaLink Ltd');
  const [address, setAddress] = useState('12 Ring Road East, Airport City, Accra, Greater Accra, Ghana');
  const [taxId, setTaxId] = useState('C0012244875');
  const [prefs2, setPrefs2] = useState({ marketing: false, research: true, shareTripData: true, airportPickupSms: true });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [paxOpen, setPaxOpen] = useState(false);
  const [paxDraft, setPaxDraft] = useState<Passenger>(emptyPassenger(99));
  const [paxErr, setPaxErr] = useState<Record<string, string>>({});
  const [removeId, setRemoveId] = useState<string | null>(null);

  if (!user) return null;

  const save = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 3) e.name = 'Enter the name exactly as it appears on your passport';
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) e.email = 'Email address looks wrong';
    if (phone.replace(/\D/g, '').length < 8) e.phone = 'Include the country code';
    if (!dob) e.dob = 'Required for secure flight data';
    setErrs(e);
    if (Object.keys(e).length) {
      toast({ tone: 'error', title: 'Check the highlighted fields' });
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setDirty(false);
      signIn(email, name);
      toast({ tone: 'success', title: 'Profile saved', body: 'Saved travellers and existing bookings keep the old spelling until you update them individually.' });
    }, 700);
  };

  return (
    <div>
      <AccountHeader
        title="Profile"
        lead="What we hold about you, and what goes on the ticket. Everything here is editable; nothing here is sold."
        badge={dirty ? <Badge tone="gold">Unsaved changes</Badge> : <Badge tone="teal">Saved</Badge>}
        action={
          <>
            <Button size="sm" variant="ghost" onClick={() => nav('/account/security')}>
              Security
            </Button>
            <Button size="sm" onClick={save} loading={saving} disabled={!dirty} icon={<Check size={15} />}>
              Save changes
            </Button>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <div className="space-y-5">
          <AccountCard title="Personal details" lead="Matches your travel document, or the airline can refuse to carry you.">
            <div className="grid gap-3.5 sm:grid-cols-3">
              <Field label="Title">
                <Select value={title} onChange={(e) => { setTitle(e.target.value); setDirty(true); }}>
                  {SALUTATIONS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Full name" required error={errs.name} className="sm:col-span-2">
                <Input value={name} onChange={(e) => { setName(e.target.value); setDirty(true); }} invalid={!!errs.name} onBlur={() => setPrefs({ seatPref: prefs.seatPref })} />
              </Field>
              <Field label="Email address" required error={errs.email} className="sm:col-span-2">
                <Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setDirty(true); }} invalid={!!errs.email} />
              </Field>
              <Field label="Mobile" required error={errs.phone}>
                <Input value={phone} onChange={(e) => { setPhone(e.target.value); setDirty(true); }} invalid={!!errs.phone} className="num" />
              </Field>
              <DateField label="Date of birth" value={dob} onChange={(v) => { setDob(v); setDirty(true); }} required error={errs.dob} maxDate={toISODate(new Date())} className="sm:col-span-1" />
              <Field label="Gender" hint="Used only for APD / visa data">
                <Select value={gender} onChange={(e) => { setGender(e.target.value); setDirty(true); }}>
                  {GENDERS.filter((g) => g !== '—').map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Nationality">
                <Select value={country} onChange={(e) => { setCountry(e.target.value); setDirty(true); }}>
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <p className="mt-3 flex items-start gap-2 rounded-[10px] bg-mist-50 p-3 text-[.75rem] leading-relaxed text-ink-500">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-teal-600" />
              Changing your name here does not re-issue existing tickets. Each booking has its own passenger record, and a name change on a ticket may need a document check — we handle that in Manage Booking.
            </p>
          </AccountCard>

          <AccountCard title="Contact & billing address" lead="Where invoices, refund confirmations and hard copies go.">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Company (optional)">
                <Input value={company} onChange={(e) => { setCompany(e.target.value); setDirty(true); }} />
              </Field>
              <Field label="Tax / VAT reference">
                <Input value={taxId} onChange={(e) => { setTaxId(e.target.value); setDirty(true); }} className="num" />
              </Field>
              <Field label="Address" className="sm:col-span-2" hint="Used for the card address-verification check">
                <Input value={address} onChange={(e) => { setAddress(e.target.value); setDirty(true); }} />
              </Field>
            </div>
            <Divider className="my-4" />
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ['marketing', 'Fare news and offers', 'About eight emails a year, never more'],
                  ['research', 'Invitations to user research', 'Paid, usually USD 60 or points'],
                  ['shareTripData', 'Share trip data with partners for transfers', 'Hotel and car partners only'],
                  ['airportPickupSms', 'SMS when a driver is assigned', 'Only if you booked a transfer'],
                ] as const
              ).map(([k, l, d]) => (
                <Checkbox key={k} label={l} desc={d} checked={prefs2[k]} onChange={(v) => { setPrefs2({ ...prefs2, [k]: v }); setDirty(true); }} />
              ))}
            </div>
          </AccountCard>

          <AccountCard
            title="Saved travellers"
            lead="Everyone you book for, with their documents kept current. Never used for marketing."
            action={
              <Button size="sm" icon={<Plus size={14} />} onClick={() => { setPaxDraft(emptyPassenger(Date.now() % 100)); setPaxErr({}); setPaxOpen(true); }}>
                Add traveller
              </Button>
            }
            className="p-0 [&>div:last-child]:p-0"
          >
            {savedPassengers.length === 0 ? (
              <div className="p-5">
                <EmptyState title="No saved travellers" body="Add the people you book for and their details fill in automatically." icon={<User size={20} />} />
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {savedPassengers.map((p) => {
                  const exp = Math.round((new Date(p.docExpiry).getTime() - Date.now()) / 86400000);
                  return (
                    <li key={p.id} className="flex flex-wrap items-center gap-4 px-4 py-3.5 sm:px-5">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy-50 font-display text-[.8125rem] font-bold text-navy-800">
                        {p.firstName.slice(0, 1)}
                        {p.lastName.slice(0, 1)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-[.9375rem] font-semibold text-navy-900">
                          {p.salutation} {p.firstName} {p.lastName}
                          {p.type !== 'adult' && <span className="ml-2 text-[.75rem] font-medium uppercase tracking-wide text-ink-400">{p.type}</span>}
                        </p>
                        <p className="mt-0.5 text-[.8125rem] text-ink-500">
                          {ageFrom(p.dob)} years · {p.nationality} · {p.docType} ••••{p.docNumber.slice(-4)}
                        </p>
                        <p className="mt-1 flex flex-wrap gap-1.5">
                          <Badge tone={exp < 180 ? 'gold' : 'neutral'}>Document expires {fmtDate(p.docExpiry, 'short')}</Badge>
                          {p.ffp && <Badge tone="sky">{p.ffp}</Badge>}
                          {p.meal && p.meal !== 'none' && <Badge tone="teal">Meal {p.meal}</Badge>}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        <Button size="sm" variant="secondary" onClick={() => { setPaxDraft(p); setPaxErr({}); setPaxOpen(true); }}>
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setRemoveId(p.id)} icon={<Trash2 size={14} />}>
                          <span className="sr-only">Remove {p.firstName}</span>
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </AccountCard>
        </div>

        <div className="space-y-5">
          <AccountCard title="Membership" tone="navy">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="num font-display text-[1.125rem] font-semibold">{user.email.endsWith('@aeronova.aero') ? 'ANV-0000-0001' : 'ANV-4471-8802'}</p>
                <p className="mt-1 flex items-center gap-2 text-[.8125rem] text-white/60">
                  <Sparkles size={13} className="text-gold-400" /> {user.tier} · member since {fmtDate(user.since, 'long')}
                </p>
              </div>
              <Button size="sm" variant="onDark" onClick={() => nav('/account/rewards')}>
                Rewards
              </Button>
            </div>
            <Divider className="my-4 !bg-white/10" />
            <ul className="space-y-2 text-[.875rem]">
              {[
                ['Points', user.points.toLocaleString()],
                ['Qualifying points', (user.yqp ?? 0).toLocaleString()],
                ['Sectors this year', String(user.segments)],
                ['Status expires', '31 Dec 2027'],
              ].map(([k, v]) => (
                <li key={k} className="flex justify-between border-b border-white/8 pb-1.5 last:border-0">
                  <span className="text-white/50">{k}</span>
                  <span className="num font-medium">{v}</span>
                </li>
              ))}
            </ul>
          </AccountCard>

          <AccountCard title="Travel document vault" lead="Encrypted at rest. Deleted 30 days after your last flight unless you keep it.">
            <ul className="space-y-2.5">
              {[
                { n: 'Ghanaian passport', v: 'G02948811', e: '2030-11-02', ok: true },
                { n: 'US visa (B1/B2)', v: 'V27449821', e: '2033-02-14', ok: true },
                { n: 'Yellow fever certificate', v: 'GH-ACC-118224', e: 'lifetime', ok: true },
                { n: 'East Africa Tourist Visa', v: 'EATV-88210', e: '2027-01-08', ok: false },
              ].map((d) => (
                <li key={d.n} className="flex items-center gap-3 rounded-[12px] border border-line p-3">
                  <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-[9px]', d.ok ? 'bg-teal-50 text-teal-700' : 'bg-gold-100 text-gold-600')}>
                    <CalendarCheck size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[.875rem] font-medium text-navy-900">{d.n}</span>
                    <span className="num block text-[.75rem] text-ink-500">
                      {d.v} · {d.e === 'lifetime' ? 'valid for life' : `expires ${fmtDate(d.e, 'short')}`}
                    </span>
                  </span>
                  {!d.ok && <Badge tone="gold">Renew soon</Badge>}
                </li>
              ))}
            </ul>
            <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => nav('/account/documents')}>
              Manage documents <ArrowRight size={14} />
            </Button>
          </AccountCard>

          <AccountCard title="Employment & preferences for tickets" lead="Only used when a fare requires it (student, resident, corporate).">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Traveller type">
                <Select defaultValue="corporate">
                  <option value="leisure">Leisure</option>
                  <option value="student">Student (verified)</option>
                  <option value="corporate">Corporate account</option>
                  <option value="resident">Resident fare (domestic)</option>
                </Select>
              </Field>
              <Field label="Corporate account">
                <Input defaultValue="NFB-2291-ACC" className="num" />
              </Field>
              <Field label="Cost centre" className="sm:col-span-2">
                <Input defaultValue="CLL-TRV-ACC" className="num" />
              </Field>
            </div>
            <p className="mt-3 flex items-start gap-2 text-[.75rem] leading-relaxed text-ink-500">
              <Briefcase size={13} className="mt-0.5 shrink-0 text-ink-400" />
              {company} is on Nova for Business with 30-day invoicing. Bookings made on a corporate account bill to the company, not your card.
            </p>
          </AccountCard>

          <AccountCard title="Delete or export my data">
            <p className="text-[.875rem] leading-relaxed text-ink-600">
              Download everything we hold as JSON in one click, or close the account. Closing deletes profile, saved travellers and preferences after a 30-day grace period; wallet credit is paid out first.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => toast({ tone: 'success', title: 'Export prepared', body: 'aeronova-profile.json downloaded (14 kB).' })}>
                Export my data
              </Button>
              <Button size="sm" variant="ghost" className="text-ink-500" onClick={() => nav('/account/security?danger=1')}>
                Close account
              </Button>
            </div>
          </AccountCard>
        </div>
      </div>

      {/* add / edit traveller */}
      <Modal
        open={paxOpen}
        onClose={() => setPaxOpen(false)}
        title={savedPassengers.some((p) => p.id === paxDraft.id) ? 'Edit traveller' : 'Add a saved traveller'}
        subtitle="Used to fill bookings faster. Never shared with anyone."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPaxOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const e = validatePassenger(paxDraft);
                setPaxErr(e);
                if (Object.keys(e).length) return;
                savePassenger(paxDraft);
                setPaxOpen(false);
                toast({ tone: 'success', title: 'Traveller saved', body: `${paxDraft.firstName} ${paxDraft.lastName} will now autofill in bookings.` });
              }}
            >
              Save traveller
            </Button>
          </>
        }
      >
        <div className="grid gap-3.5 sm:grid-cols-4">
          <Field label="Title">
            <Select value={paxDraft.salutation} onChange={(e) => setPaxDraft({ ...paxDraft, salutation: e.target.value })}>
              {SALUTATIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="First name" required error={paxErr.firstName} className="sm:col-span-1">
            <Input value={paxDraft.firstName} onChange={(e) => setPaxDraft({ ...paxDraft, firstName: e.target.value })} invalid={!!paxErr.firstName} />
          </Field>
          <Field label="Last name" required error={paxErr.lastName} className="sm:col-span-2">
            <Input value={paxDraft.lastName} onChange={(e) => setPaxDraft({ ...paxDraft, lastName: e.target.value })} invalid={!!paxErr.lastName} />
          </Field>
          <DateField label="Date of birth" required value={paxDraft.dob} onChange={(v) => setPaxDraft({ ...paxDraft, dob: v })} maxDate={toISODate(new Date())} className="sm:col-span-2" />
          <Field label="Gender" className="sm:col-span-2">
            <Select value={paxDraft.gender} onChange={(e) => setPaxDraft({ ...paxDraft, gender: e.target.value })}>
              {GENDERS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </Select>
          </Field>
          <Field label="Nationality" className="sm:col-span-2">
            <Select value={paxDraft.nationality} onChange={(e) => setPaxDraft({ ...paxDraft, nationality: e.target.value })}>
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Document type" className="sm:col-span-2">
            <Select value={paxDraft.docType} onChange={(e) => setPaxDraft({ ...paxDraft, docType: e.target.value })}>
              {DOC_TYPES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
          </Field>
          <Field label="Document number" required error={paxErr.docNumber} className="sm:col-span-2">
            <Input value={paxDraft.docNumber} onChange={(e) => setPaxDraft({ ...paxDraft, docNumber: e.target.value.toUpperCase() })} invalid={!!paxErr.docNumber} className="num" />
          </Field>
          <DateField label="Expiry" required value={paxDraft.docExpiry} onChange={(v) => setPaxDraft({ ...paxDraft, docExpiry: v })} className="sm:col-span-2" />
          <Field label="Passenger type" className="sm:col-span-2">
            <Select value={paxDraft.type} onChange={(e) => setPaxDraft({ ...paxDraft, type: e.target.value as Passenger['type'] })}>
              <option value="adult">Adult</option>
              <option value="child">Child 2–11</option>
              <option value="infant">Infant under 2</option>
            </Select>
          </Field>
          <Field label="Loyalty number" className="sm:col-span-2">
            <Input value={paxDraft.ffp ?? ''} onChange={(e) => setPaxDraft({ ...paxDraft, ffp: e.target.value.toUpperCase() })} className="num uppercase" placeholder="ANV-0000-0000" />
          </Field>
          <Field label="Email" className="sm:col-span-2" hint="Only needed if they travel separately sometimes">
            <Input type="email" value={paxDraft.email} onChange={(e) => setPaxDraft({ ...paxDraft, email: e.target.value })} />
          </Field>
          <div className="sm:col-span-4">
            <Checkbox label="Share my contact details for this traveller’s flight updates" desc="Otherwise their own number is used." checked onChange={() => {}} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!removeId}
        onCancel={() => setRemoveId(null)}
        onConfirm={() => {
          if (removeId) removePassenger(removeId);
          setRemoveId(null);
          toast({ tone: 'info', title: 'Traveller removed', body: 'Existing tickets are unaffected.' });
        }}
        title="Remove this traveller?"
        confirmLabel="Remove"
        tone="danger"
        body="They will stop autofilling in bookings. Any live ticket already issued to them is untouched."
      />

      <Building2 className="hidden" />
    </div>
  );
}
