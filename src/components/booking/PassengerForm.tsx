import { useState } from 'react';
import { Check, ChevronLeft, Plus, Trash2, UserRound } from 'lucide-react';
import { cx, fmtDate, toISODate, ageFrom, DAY } from '../../lib/utils';
import { useEffect } from 'react';
import type { Passenger } from '../../types';
import { Checkbox, Field, Input, Select } from '../ui/Form';
import { Badge, Button, EmptyState } from '../ui/Primitives';
import { useStore } from '../../store/store';
import { COUNTRIES, DOC_TYPES, GENDERS, MEALS, SALUTATIONS } from './forms-helpers';

export function emptyPassenger(i: number, type: Passenger['type'] = 'adult'): Passenger {
  return {
    id: `p${i}`,
    salutation: 'Ms',
    firstName: '',
    lastName: '',
    dob: '',
    gender: type === 'child' ? '—' : '',
    nationality: 'Ghana',
    docType: 'Passport',
    docNumber: '',
    docExpiry: '',
    email: '',
    phone: '',
    type,
    seat: null,
    meal: 'none',
  };
}

export function validatePassenger(p: Passenger) {
  const e: Record<string, string> = {};
  if (!p.firstName.trim()) e.firstName = 'Required';
  if (!p.lastName.trim()) e.lastName = 'Required';
  if (!p.dob) e.dob = 'Required';
  else {
    const age = ageFrom(p.dob);
    if (age < 0) e.dob = 'Date of birth is in the future';
    else if (p.type === 'adult' && age < 18) e.dob = 'Adults must be 18 or over — change the passenger type to child';
    else if (p.type === 'child' && (age < 2 || age > 11)) e.dob = 'Child fares are for ages 2–11';
    else if (p.type === 'infant' && age >= 2) e.dob = 'Infants must be under 2 on the travel date';
  }
  if (!p.docNumber.trim() || p.docNumber.trim().length < 6) e.docNumber = 'Enter the full document number';
  if (!p.docExpiry) e.docExpiry = 'Required';
  else {
    const days = Math.round((new Date(p.docExpiry).getTime() - Date.now()) / DAY);
    if (days < 0) e.docExpiry = 'This document has expired';
    else if (days < 180) e.docExpiry = 'Must be valid for 6 months on most of our routes';
  }
  return e;
}

export function PassengerDetails({
  passengers,
  onChange,
  contact,
  onContact,
  emailOptIn,
  onEmailOptIn,
}: {
  passengers: Passenger[];
  onChange: (p: Passenger[]) => void;
  contact: { email: string; phone: string; country: string };
  onContact: (c: { email: string; phone: string; country: string }) => void;
  emailOptIn?: boolean;
  onEmailOptIn?: (v: boolean) => void;
}) {
  const { savedPassengers, savePassenger } = useStore();
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const [open, setOpen] = useState<Record<string, boolean>>(Object.fromEntries(passengers.map((p, i) => [p.id, i === 0])));
  const [saved, setSaved] = useState<string[]>([]);

  const update = (id: string, patch: Partial<Passenger>) => {
    onChange(passengers.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    if (errors[id]) setErrors((e) => ({ ...e, [id]: Object.fromEntries(Object.keys(e[id]).filter((k) => !(k in patch)).map((k) => [k, e[id][k]])) }));
  };

  const validateAll = () => {
    const next: Record<string, Record<string, string>> = {};
    passengers.forEach((p) => {
      const e = validatePassenger(p);
      if (Object.keys(e).length) next[p.id] = e;
    });
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(contact.email)) next.__contact = { email: 'Enter a valid email — your ticket is sent here' };
    if (contact.phone.replace(/\D/g, '').length < 8) next.__contact = { ...next.__contact, phone: 'Include your country code' };
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const [allValid, setAllValid] = useState(true);
  useEffect(() => {
    setAllValid(Object.keys(passengers.reduce((a, p) => ({ ...a, ...validatePassenger(p) }), {})).length === 0);
  }, [passengers]);

  const addPax = (type: Passenger['type']) => {
    if (passengers.length >= 9) return;
    const p = emptyPassenger(passengers.length + 1, type);
    onChange([...passengers, p]);
    setOpen((o) => ({ ...o, [p.id]: true }));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-mist-50 p-4">
        <p className="max-w-md text-[.875rem] leading-relaxed text-ink-600">
          Names must match the travel document exactly, in the order printed. A mismatch of more than three characters means you will not board.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={() => addPax('adult')}>
            Add adult
          </Button>
          <Button size="sm" variant="ghost" icon={<Plus size={14} />} onClick={() => addPax('child')}>
            Child
          </Button>
          <Button size="sm" variant="ghost" icon={<Plus size={14} />} onClick={() => addPax('infant')}>
            Infant
          </Button>
        </div>
      </div>

      {savedPassengers.length > 0 && (
        <div className="rounded-card border border-line bg-white p-4">
          <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-400">Saved travellers · tap to add</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {savedPassengers.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  const p = { ...s, id: `p${Date.now() % 10000}` };
                  onChange([...passengers, p]);
                  setOpen((o) => ({ ...o, [p.id]: true }));
                }}
                className="group flex items-center gap-2 rounded-pill border border-line py-1 pl-1 pr-3 text-[.8125rem] font-medium text-ink-700 transition hover:border-sky-400 hover:bg-sky-50"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-navy-800 text-[.625rem] font-bold text-white">{s.firstName.slice(0, 1)}</span>
                {s.firstName} {s.lastName}
                <span className="text-ink-300 group-hover:text-sky-600">+ add</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {passengers.length === 0 && <EmptyState title="No travellers yet" body="Add the people who will be on this flight. Infants on a lap count as a traveller." icon={<UserRound size={20} />} action={<Button size="sm" onClick={() => addPax('adult')}>Add first traveller</Button>} />}

      {passengers.map((p, i) => {
        const err = errors[p.id] ?? {};
        const isOpen = open[p.id];
        const age = p.dob ? ageFrom(p.dob) : null;
        return (
          <section key={p.id} className={cx('overflow-hidden rounded-card border bg-white transition', Object.keys(err).length ? 'border-red-300' : 'border-line')}>
            <button
              onClick={() => setOpen((o) => ({ ...o, [p.id]: !o[p.id] }))}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-mist-50"
              aria-expanded={isOpen}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-50 font-display text-[.8125rem] font-bold text-navy-800">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[.9375rem] font-semibold text-navy-900">
                  {p.firstName || p.lastName ? `${p.salutation} ${p.firstName} ${p.lastName}`.trim() : `Traveller ${i + 1} — details needed`}
                </span>
                <span className="mt-0.5 block truncate text-[.75rem] text-ink-500">
                  {p.type === 'adult' ? 'Adult' : p.type === 'child' ? 'Child' : 'Infant'}
                  {age !== null && ` · ${age} yr`}
                  {p.nationality && ` · ${p.nationality}`}
                  {p.docNumber && ` · ${p.docType} ${p.docNumber.slice(-4).padStart(p.docNumber.length, '•')}`}
                </span>
              </span>
              {Object.keys(err).length === 0 && p.firstName && <Badge tone="teal" icon={<Check size={12} />}>Ready</Badge>}
              {Object.keys(err).length > 0 && <Badge tone="red">{Object.keys(err).length} to fix</Badge>}
              <span className={cx('text-ink-400 transition-transform', isOpen && 'rotate-90')}>
                <ChevronLeft size={16} className="rotate-180" />
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-line p-4 sm:p-5">
                <div className="grid gap-3.5 sm:grid-cols-6">
                  <Field label="Title" className="sm:col-span-1">
                    <Select value={p.salutation} onChange={(e) => update(p.id, { salutation: e.target.value })}>
                      {SALUTATIONS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="First / given name" required error={err.firstName} className="sm:col-span-2">
                    <Input value={p.firstName} onChange={(e) => update(p.id, { firstName: e.target.value })} invalid={!!err.firstName} placeholder="Ama" autoComplete="given-name" />
                  </Field>
                  <Field label="Last / family name" required error={err.lastName} className="sm:col-span-2">
                    <Input value={p.lastName} onChange={(e) => update(p.id, { lastName: e.target.value })} invalid={!!err.lastName} placeholder="Mensah" autoComplete="family-name" />
                  </Field>
                  <Field label="Passenger type" className="sm:col-span-1">
                    <Select value={p.type} onChange={(e) => update(p.id, { type: e.target.value as Passenger['type'] })}>
                      <option value="adult">Adult</option>
                      <option value="child">Child 2–11</option>
                      <option value="infant">Infant &lt;2</option>
                    </Select>
                  </Field>

                  <DateLike label="Date of birth" required error={err.dob} value={p.dob} onChange={(v) => update(p.id, { dob: v })} className="sm:col-span-2" />
                  <Field label="Gender" className="sm:col-span-2">
                    <Select value={p.gender} onChange={(e) => update(p.id, { gender: e.target.value })}>
                      {GENDERS.map((g) => (
                        <option key={g}>{g}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Nationality" className="sm:col-span-2">
                    <Select value={p.nationality} onChange={(e) => update(p.id, { nationality: e.target.value })}>
                      {COUNTRIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Document type" className="sm:col-span-2">
                    <Select value={p.docType} onChange={(e) => update(p.id, { docType: e.target.value })}>
                      {DOC_TYPES.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Document number" required error={err.docNumber} className="sm:col-span-2">
                    <Input value={p.docNumber} onChange={(e) => update(p.id, { docNumber: e.target.value.toUpperCase() })} invalid={!!err.docNumber} placeholder="G02948811" />
                  </Field>
                  <DateLike label="Document expiry" required error={err.docExpiry} value={p.docExpiry} onChange={(v) => update(p.id, { docExpiry: v })} className="sm:col-span-2" />

                  <Field label="Meal preference" className="sm:col-span-3">
                    <Select value={p.meal ?? 'none'} onChange={(e) => update(p.id, { meal: e.target.value })}>
                      {MEALS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Loyalty number (optional)" hint="AeroNova Rewards or a Galaxy Alliance partner card" className="sm:col-span-3">
                    <Input value={p.ffp ?? ''} onChange={(e) => update(p.id, { ffp: e.target.value.toUpperCase() })} placeholder="ANV-0000-0000" />
                  </Field>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                  <label className="flex cursor-pointer items-center gap-2 text-[.8125rem] text-ink-600">
                    <input type="checkbox" checked={saved.includes(p.id)} onChange={(e) => { setSaved((v) => (e.target.checked ? [...v, p.id] : v.filter((x) => x !== p.id))); if (e.target.checked) savePassenger(p); }} />
                    {saved.includes(p.id) ? 'Saved to your account' : 'Save this traveller to my account'}
                  </label>
                  <button
                    onClick={() => {
                      onChange(passengers.filter((x) => x.id !== p.id));
                      setErrors((er) => {
                        const n = { ...er };
                        delete n[p.id];
                        return n;
                      });
                    }}
                    disabled={passengers.length === 1}
                    className="inline-flex items-center gap-1.5 text-[.8125rem] font-semibold text-ink-500 transition hover:text-red-600 disabled:opacity-40"
                  >
                    <Trash2 size={14} /> Remove traveller
                  </button>
                </div>
              </div>
            )}
          </section>
        );
      })}

      <div className="rounded-card border border-line bg-white p-4 sm:p-5">
        <h3 className="text-h3">Contact details</h3>
        <p className="mt-1 text-[.8125rem] text-ink-500">We use these for gate changes, bag updates and your e-ticket. SMS is only used if a flight is disrupted.</p>
        <div className="mt-4 grid gap-3.5 sm:grid-cols-3">
          <Field label="Email address" required error={errors.__contact?.email} className="sm:col-span-2">
            <Input type="email" value={contact.email} onChange={(e) => onContact({ ...contact, email: e.target.value })} invalid={!!errors.__contact?.email} placeholder="you@company.com" autoComplete="email" />
          </Field>
          <Field label="Country">
            <Select value={contact.country} onChange={(e) => onContact({ ...contact, country: e.target.value })}>
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Mobile number" required error={errors.__contact?.phone} hint="Include the country code" className="sm:col-span-2">
            <Input value={contact.phone} onChange={(e) => onContact({ ...contact, phone: e.target.value })} invalid={!!errors.__contact?.phone} placeholder="+233 24 000 0000" autoComplete="tel" />
          </Field>
        </div>
        <div className="mt-4 space-y-2">
          <Checkbox label="Email me itinerary updates and fare news" desc="One email a week at most. Unsubscribe in a click." checked={!!emailOptIn} onChange={(v) => onEmailOptIn?.(v)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-navy-50/70 p-4">
        <p className="text-[.8125rem] text-ink-600">
          {allValid || Object.keys(errors).length === 0 ? (
            <span className="flex items-center gap-2 font-medium text-teal-700">
              <Check size={15} /> {passengers.length} traveller{passengers.length === 1 ? '' : 's'} look good — continue when ready
            </span>
          ) : (
            <span className="font-medium text-red-700">Some details still need attention before we can ticket.</span>
          )}
        </p>
        <Button
          onClick={() => {
            if (!validateAll()) {
              document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
          variant="secondary"
          size="sm"
        >
          Re-check everything
        </Button>
      </div>
    </div>
  );
}

/* date input with a compact native picker + validation helper */
function DateLike({ label, value, onChange, error, required, className }: { label: string; value: string; onChange: (v: string) => void; error?: string; required?: boolean; className?: string }) {
  return (
    <Field label={label} required={required} error={error} className={className} hint={!error && value ? `Shown as ${fmtDate(value, 'long')}` : undefined}>
      <input
        type="date"
        value={value}
        max={toISODate(new Date(Date.now() + 365 * 1000 * 60 * 60 * 24 * 12))}
        onChange={(e) => onChange(e.target.value)}
        className={cx('h-11 w-full rounded-[11px] border bg-white px-3.5 text-[.9375rem] text-navy-900 outline-none transition focus:ring-4 focus:ring-sky-500/12', error ? 'border-red-400' : 'border-ink-200 hover:border-ink-300 focus:border-sky-500')}
      />
    </Field>
  );
}

