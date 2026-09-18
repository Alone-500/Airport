import { useState } from 'react';

import { AlertTriangle, CalendarClock, Check, Download, FileText, HeartPulse, IdCard, Plus, ShieldCheck, Stethoscope, Ticket, Upload, User } from 'lucide-react';
import { cx, fmtDate, parseISODate, DAY } from '../../lib/utils';
import { AccountCard, AccountHeader } from './AccountLayout';
import { Badge, Button, Divider, EmptyState, Meter } from '../../components/ui/Primitives';
import { ConfirmDialog, Modal, Tabs } from '../../components/ui/Overlay';
import { Checkbox, DateField, Field, Input, Select } from '../../components/ui/Form';
import { useStore } from '../../store/store';

type Doc = { id: string; kind: string; label: string; number: string; issued: string; expiry: string; country: string; holder: string; status: 'valid' | 'expiring' | 'expired' | 'pending'; size: string; shared: boolean };

const DAY_MS = DAY;

export default function Documents() {
  const { toast, savedPassengers } = useStore();
  const [tab, setTab] = useState<'travel' | 'health' | 'other'>('travel');
  const [docs, setDocs] = useState<Doc[]>([
    { id: 'd1', kind: 'Passport', label: 'Ghanaian passport', number: 'G02948811', issued: '2020-11-03', expiry: '2030-11-02', country: 'Ghana', holder: 'Ama Mensah', status: 'valid', size: '2.1 MB', shared: true },
    { id: 'd2', kind: 'Passport', label: 'Ghanaian passport', number: 'G01884022', issued: '2019-06-19', expiry: '2029-06-18', country: 'Ghana', holder: 'Kwabena Mensah', status: 'valid', size: '1.8 MB', shared: true },
    { id: 'd3', kind: 'Passport', label: 'Child passport', number: 'G22110489', issued: '2022-01-10', expiry: '2028-01-09', country: 'Ghana', holder: 'Naa Mensah', status: 'valid', size: '1.4 MB', shared: false },
    { id: 'd4', kind: 'Visa', label: 'US B1/B2 visa', number: 'V27449821', issued: '2023-02-15', expiry: '2033-02-14', country: 'United States', holder: 'Ama Mensah', status: 'valid', size: '860 kB', shared: true },
    { id: 'd5', kind: 'Visa', label: 'East Africa Tourist Visa', number: 'EATV-88210', issued: '2026-01-08', expiry: '2027-01-08', country: 'Kenya · Uganda · Rwanda', holder: 'Ama Mensah', status: 'expiring', size: '540 kB', shared: false },
    { id: 'd6', kind: 'Health', label: 'Yellow fever certificate', number: 'GH-ACC-118224', issued: '2018-04-02', expiry: '2099-01-01', country: 'Ghana', holder: 'Ama Mensah', status: 'valid', size: '320 kB', shared: true },
    { id: 'd7', kind: 'Health', label: 'Polio booster record', number: 'GH-ACC-99112', issued: '2021-10-11', expiry: '2026-10-11', country: 'Ghana', holder: 'Ama Mensah', status: 'expiring', size: '290 kB', shared: false },
    { id: 'd8', kind: 'Identity', label: 'Ghana Card (national ID)', number: 'GHA-114-8822-1', issued: '2021-03-03', expiry: '2028-03-02', country: 'Ghana', holder: 'Ama Mensah', status: 'valid', size: '1.1 MB', shared: false },
    { id: 'd9', kind: 'Travel', label: 'Nigerian e-visa (rejected)', number: 'NG-EV-2298114', issued: '2026-05-14', expiry: '2026-06-14', country: 'Nigeria', holder: 'Kwabena Mensah', status: 'expired', size: '410 kB', shared: false },
    { id: 'd10', kind: 'Other', label: 'Diplomatic note — conference', number: 'CLL-2026-118', issued: '2026-08-01', expiry: '2026-12-31', country: 'Senegal', holder: 'Ama Mensah', status: 'pending', size: '220 kB', shared: false },
  ]);
  const [add, setAdd] = useState(false);
  const [draft, setDraft] = useState<Doc>({ id: '', kind: 'Passport', label: '', number: '', issued: '', expiry: '', country: 'Ghana', holder: 'Ama Mensah', status: 'valid', size: '1.2 MB', shared: false });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [remove, setRemove] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'mine' | 'family'>('all');

  const daysTo = (iso: string) => Math.round((parseISODate(iso).getTime() - Date.now()) / DAY_MS);
  const list = docs
    .filter((d) => (tab === 'travel' ? ['Passport', 'Visa', 'Travel'].includes(d.kind) : tab === 'health' ? d.kind === 'Health' : ['Identity', 'Other'].includes(d.kind)))
    .filter((d) => (filter === 'all' ? true : filter === 'mine' ? d.holder === 'Ama Mensah' : d.holder !== 'Ama Mensah'));
  const expiring = docs.filter((d) => d.status !== 'expired' && daysTo(d.expiry) < 240 && daysTo(d.expiry) > 0);
  const coverage = Math.round((docs.filter((d) => d.status === 'valid').length / docs.length) * 100);

  const save = () => {
    const e: Record<string, string> = {};
    if (!draft.label.trim()) e.label = 'Give it a name you will recognise';
    if (!draft.number.trim()) e.number = 'Required';
    if (!draft.expiry) e.expiry = 'We need the expiry to warn you in time';
    setErrs(e);
    if (Object.keys(e).length) return;
    setDocs((v) => [{ ...draft, id: `d${Date.now()}`, status: daysTo(draft.expiry) < 0 ? 'expired' : daysTo(draft.expiry) < 240 ? 'expiring' : 'valid' }, ...v]);
    setAdd(false);
    toast({ tone: 'success', title: 'Document stored', body: 'Encrypted at rest. It is only sent to the airline systems when you choose to share it with a booking.' });
  };

  return (
    <div>
      <AccountHeader
        title="Documents"
        lead="Passports, visas and health certificates for everyone you travel with, with the expiry warnings that actually matter for the routes you fly."
        badge={<Badge tone={expiring.length ? 'gold' : 'teal'}>{expiring.length ? `${expiring.length} need attention` : 'All current'}</Badge>}
        action={
          <>
            <Button size="sm" variant="secondary" icon={<Download size={14} />} onClick={() => toast({ tone: 'success', title: 'Document pack downloaded', body: 'Ten files as a zip, watermarked with your name.' })}>
              Download pack
            </Button>
            <Button size="sm" icon={<Plus size={14} />} onClick={() => { setDraft({ ...draft, id: '', label: '', number: '', issued: '', expiry: '' }); setErrs({}); setAdd(true); }}>
              Add document
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { id: 'travel', label: 'Travel documents', count: docs.filter((d) => ['Passport', 'Visa', 'Travel'].includes(d.kind)).length },
              { id: 'health', label: 'Health', count: docs.filter((d) => d.kind === 'Health').length },
              { id: 'other', label: 'Identity & other', count: docs.filter((d) => ['Identity', 'Other'].includes(d.kind)).length },
            ]}
            className="mb-1"
          />
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-[10px] border border-line bg-white p-[3px]">
              {(['all', 'mine', 'family'] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={cx('rounded-[7px] px-2.5 py-1 text-[.75rem] font-semibold capitalize transition', filter === f ? 'bg-navy-800 text-white' : 'text-ink-500 hover:text-navy-800')}>
                  {f === 'mine' ? 'Mine' : f === 'family' ? 'Family' : 'Everyone'}
                </button>
              ))}
            </div>
            <p className="num ml-auto text-[.8125rem] text-ink-500">{list.length} shown · {docs.length} stored</p>
          </div>

          {list.length === 0 ? (
            <EmptyState title="Nothing stored in this category" body="Add a document, or upload it from the app while you are at the airport — the camera works better than a scanner." icon={<FileText size={20} />} action={<Button size="sm" onClick={() => setAdd(true)}>Add document</Button>} />
          ) : (
            <ul className="space-y-3">
              {list.map((d) => {
                const days = daysTo(d.expiry);
                return (
                  <li key={d.id}>
                    <article className={cx('card p-4 transition', d.status === 'expired' ? 'border-red-200' : d.status === 'expiring' ? 'border-gold-300' : '')}>
                      <div className="flex flex-wrap items-start gap-4">
                        <span className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-[12px]', d.status === 'expired' ? 'bg-red-50 text-red-600' : d.status === 'expiring' ? 'bg-gold-100 text-gold-600' : d.kind === 'Health' ? 'bg-teal-50 text-teal-700' : 'bg-navy-50 text-navy-700')}>
                          {d.kind === 'Health' ? <Stethoscope size={18} /> : d.kind === 'Visa' || d.kind === 'Travel' ? <Ticket size={18} /> : d.kind === 'Identity' ? <IdCard size={18} /> : <ShieldCheck size={18} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-display text-[1rem] font-semibold text-navy-900">{d.label}</p>
                            <Badge tone={d.status === 'expired' ? 'red' : d.status === 'expiring' ? 'gold' : d.status === 'pending' ? 'neutral' : 'teal'}>
                              {d.status === 'expired' ? 'Expired' : d.status === 'expiring' ? `${days} days left` : d.status === 'pending' ? 'Awaiting check' : 'Valid'}
                            </Badge>
                            {d.shared && <Badge tone="sky">On file for ANV7X2K</Badge>}
                          </div>
                          <dl className="mt-2 grid gap-x-6 gap-y-1.5 text-[.8125rem] sm:grid-cols-4">
                            {[
                              ['Holder', d.holder],
                              ['Number', d.number],
                              ['Issued', fmtDate(d.issued, 'short')],
                              ['Expiry', d.expiry === '2099-01-01' ? 'Lifetime' : fmtDate(d.expiry, 'short')],
                            ].map(([k, v]) => (
                              <div key={k}>
                                <dt className="text-[.6875rem] uppercase tracking-[0.1em] text-ink-400">{k}</dt>
                                <dd className="num font-medium text-navy-900">{v}</dd>
                              </div>
                            ))}
                          </dl>
                          <p className="mt-2 text-[.8125rem] text-ink-500">
                            {d.country} · scanned page, {d.size} · uploaded {fmtDate(d.issued, 'short')}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-1.5">
                          <Button size="sm" variant="secondary" onClick={() => toast({ tone: 'info', title: 'Preview', body: 'Full-size scan opens in the viewer. Screenshotting is blocked while the mask is on.' })}>
                            View
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setDocs((v) => v.map((x) => (x.id === d.id ? { ...x, shared: !x.shared } : x))); toast({ tone: 'success', title: d.shared ? 'Removed from the booking' : 'Attached to ANV7X2K', body: d.shared ? 'It will not be sent to the carrier system.' : 'Your airline record now has the current copy.' }); }}>
                            {d.shared ? 'Unshare' : 'Share'}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setRemove(d.id)} aria-label={`Remove ${d.label}`}>
                            Remove
                          </Button>
                        </div>
                      </div>
                      {(d.status === 'expiring' || d.status === 'expired') && (
                        <p className={cx('mt-3 flex items-start gap-2 rounded-[10px] px-3 py-2 text-[.8125rem] leading-relaxed', d.status === 'expired' ? 'bg-red-50 text-red-700' : 'bg-gold-100/60 text-gold-600')}>
                          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                          {d.status === 'expired'
                            ? 'This document has expired. We cannot carry you on an international sector with it — most countries also require six months of validity beyond your return.'
                            : `Under eight months left. Six months beyond your return date is the rule on 33 of the 41 destinations we serve, so renew before you book anything after ${fmtDate(new Date(Date.now() + 120 * DAY_MS).toISOString().slice(0, 10), 'short')}.`}
                        </p>
                      )}
                    </article>
                  </li>
                );
              })}
            </ul>
          )}

          <AccountCard title="Known traveller & government programmes">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { n: 'US APID (known traveller)', v: 'XY4K9B2Q1', note: 'Expires 2028-04-30 · used on JFK and IAD arrivals' },
                { n: 'UK Registered Traveller', v: 'RT-8821993', note: 'Expires 2027-09-14 · e-passport gate at LHR T2' },
                { n: 'Ghana e-Visa account', v: 'EV-GH-118224', note: 'Linked for arrivals by air only' },
                { n: 'EU Entry/Exit (EES)', v: 'automatic', note: 'Biometric enrolment at first Schengen entry' },
              ].map((x) => (
                <div key={x.n} className="rounded-[12px] border border-line p-3.5">
                  <p className="text-[.875rem] font-semibold text-navy-900">{x.n}</p>
                  <p className="num mt-1 text-[.8125rem] text-ink-600">{x.v}</p>
                  <p className="mt-1 text-[.75rem] leading-snug text-ink-400">{x.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[.8125rem] leading-relaxed text-ink-500">
              We send APID and API data to governments because the law requires it, for every international flight, and the record of exactly what was sent is in your export.
            </p>
          </AccountCard>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[calc(var(--nav)+16px)] lg:self-start">
          <AccountCard title="Document health">
            <Meter value={coverage} tone={coverage > 80 ? 'teal' : 'gold'} label="Valid coverage across your household" />
            <ul className="mt-3 space-y-2 text-[.8125rem]">
              {[
                ['Passports', '3 of 3 valid'],
                ['Visas', '2 valid · 1 expiring · 1 expired'],
                ['Health certificates', '2 valid · 1 booster due'],
                ['Needs action', `${expiring.length + docs.filter((d) => d.status === 'expired').length}`],
              ].map(([k, v]) => (
                <li key={k} className="flex justify-between gap-3 border-b border-line pb-1.5 last:border-0">
                  <span className="text-ink-500">{k}</span>
                  <span className="num font-medium text-navy-900">{v}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" className="flex-1" icon={<CalendarClock size={14} />} onClick={() => toast({ tone: 'success', title: 'Renewal reminders on', body: 'We email at 12 months, 6 months and 6 weeks before expiry — 10 documents covered.' })}>
                Remind me to renew
              </Button>
            </div>
          </AccountCard>

          <AccountCard title="Why we ask for these">
            <ul className="space-y-2.5 text-[.8125rem] leading-relaxed text-ink-600">
              {[
                'Checked at booking so you are not refused at the gate — 4,120 people a year lose their trip to an expired passport.',
                'Encrypted with a key derived from your password: we cannot read the images unless you unlock the vault.',
                'Deleted 30 days after your last flight unless you turn on the vault. Turning it off deletes within the hour.',
                'Never used for marketing, never sold, never sent to a hotel or car partner.',
              ].map((x) => (
                <li key={x} className="flex gap-2">
                  <Check size={14} className="mt-0.5 shrink-0 text-teal-600" /> {x}
                </li>
              ))}
            </ul>
            <Divider className="my-3" />
            <Checkbox label="Auto-fill document details when I book" desc="You confirm once, at the review step." defaultChecked onChange={() => {}} />
          </AccountCard>

          <AccountCard title="For the family">
            <ul className="space-y-2">
              {savedPassengers.map((p) => {
                const d = docs.find((x) => x.holder === `${p.firstName} ${p.lastName}`);
                return (
                  <li key={p.id} className="flex items-center gap-3 rounded-[12px] border border-line p-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist-100 text-navy-700">
                      <User size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[.875rem] font-medium text-navy-900">
                        {p.firstName} {p.lastName}
                      </span>
                      <span className="block text-[.75rem] text-ink-500">{d ? `${d.kind} on file · expires ${fmtDate(d.expiry, 'short')}` : 'No document stored'}</span>
                    </span>
                    {!d && (
                      <Button size="sm" variant="ghost" onClick={() => { setDraft({ ...draft, holder: `${p.firstName} ${p.lastName}` }); setAdd(true); }}>
                        Add
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </AccountCard>

          <div className="rounded-card border border-line bg-white p-4">
            <p className="flex items-center gap-2 font-display text-[.875rem] font-semibold text-navy-900">
              <HeartPulse size={15} className="text-teal-600" /> Medical declarations
            </p>
            <p className="mt-1.5 text-[.8125rem] leading-relaxed text-ink-500">In-flight medical needs, stretchers, oxygen and mobility equipment are handled by the Accessibility Desk, not here — but the certificates live in this folder once approved.</p>
            <Button size="sm" variant="secondary" className="mt-3 w-full" to="/travel-information/special-assistance">
              Assistance & medical
            </Button>
          </div>
        </aside>
      </div>

      <Modal
        open={add}
        onClose={() => setAdd(false)}
        title="Add a document"
        subtitle="A photo from your phone is fine. We crop, deskew and read the machine-readable zone for you."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAdd(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save document</Button>
          </>
        }
      >
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Type">
            <Select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })}>
              {['Passport', 'Visa', 'Travel', 'Health', 'Identity', 'Other'].map((k) => (
                <option key={k}>{k}</option>
              ))}
            </Select>
          </Field>
          <Field label="Holder">
            <Select value={draft.holder} onChange={(e) => setDraft({ ...draft, holder: e.target.value })}>
              {['Ama Mensah', 'Kwabena Mensah', 'Naa Mensah'].map((h) => (
                <option key={h}>{h}</option>
              ))}
            </Select>
          </Field>
          <Field label="Name this document" required error={errs.label} className="sm:col-span-2">
            <Input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="Ghanaian passport (renewed 2026)" invalid={!!errs.label} />
          </Field>
          <Field label="Document number" required error={errs.number}>
            <Input value={draft.number} onChange={(e) => setDraft({ ...draft, number: e.target.value.toUpperCase() })} className="num" invalid={!!errs.number} />
          </Field>
          <Field label="Country / authority">
            <Input value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value })} />
          </Field>
          <DateField label="Issued" value={draft.issued} onChange={(v) => setDraft({ ...draft, issued: v })} maxDate={new Date().toISOString().slice(0, 10)} className="sm:col-span-1" />
          <DateField label="Expiry" required value={draft.expiry} onChange={(v) => setDraft({ ...draft, expiry: v })} error={errs.expiry} className="sm:col-span-1" />
          <div className="sm:col-span-2">
            <div className="flex flex-col items-center gap-2 rounded-[14px] border border-dashed border-ink-300 bg-mist-50/70 p-6 text-center">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-navy-700 shadow-card">
                <Upload size={18} />
              </span>
              <p className="text-[.875rem] font-medium text-navy-900">Drop the scan here, or take a photo</p>
              <p className="text-[.75rem] text-ink-400">JPG, PNG or PDF · up to 25 MB · encrypted on your device before upload</p>
              <Button size="sm" variant="secondary" onClick={() => toast({ tone: 'success', title: 'File attached', body: 'mrz-line-2.jpg read · expiry detected automatically.' })}>
                Choose file
              </Button>
            </div>
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Checkbox label="Attach to my next booking automatically" checked={draft.shared} onChange={(v) => setDraft({ ...draft, shared: v })} />
            <Checkbox label="Send me a renewal reminder at 12, 6 and 1.5 months" defaultChecked />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!remove}
        onCancel={() => setRemove(null)}
        onConfirm={() => {
          setDocs((v) => v.filter((x) => x.id !== remove));
          setRemove(null);
          toast({ tone: 'info', title: 'Document deleted', body: 'Gone from our servers within the hour. Bookings already ticketed keep the number the government was sent.' });
        }}
        title="Delete this document?"
        confirmLabel="Delete it"
        tone="danger"
        body="You will have to upload it again before your next international flight. Anything already sent to a government as API data cannot be recalled — that is the law, not us."
      />
    </div>
  );
}
