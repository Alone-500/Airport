import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Briefcase, Check, GraduationCap, HeartHandshake, MapPin, Search, Send, Sparkles, Users, Wallet } from 'lucide-react';
import { cx, fmtDate } from '../../lib/utils';
import { CAREER_STAGES, DEPARTMENTS, JOBS, LIFE_AT_AERONOVA, type Job } from '../../data/content';
import { Photo } from '../../components/brand/Brand';
import { Badge, Button, Divider, EmptyState, SectionHeading } from '../../components/ui/Primitives';
import { Accordion, Modal, Tabs } from '../../components/ui/Overlay';
import { Checkbox, Field, Input, Select, TextArea } from '../../components/ui/Form';
import { PageHero } from '../../components/layout/PublicLayout';
import { useStore } from '../../store/store';

export default function Careers() {
  const { dept } = useParams();
  const nav = useNavigate();
  const { toast } = useStore();
  const [q, setQ] = useState('');
  const [loc, setLoc] = useState('All locations');
  const [kind, setKind] = useState<string>(dept ?? 'all');
  const [job, setJob] = useState<Job | null>(null);
  const [apply, setApply] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', link: '', why: '', work: true, visa: false });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string[]>([]);

  const locations = ['All locations', 'Accra (ACC)', 'Nairobi (NBO)', 'Johannesburg (JNB)', 'Lagos (LOS)', 'Remote (Africa)'];

  const list = useMemo(
    () =>
      JOBS.filter(
        (j) =>
          (kind === 'all' || j.dept === kind || (kind === 'cabin' && j.dept === 'Cabin Crew')) &&
          (loc === 'All locations' || j.location.includes(loc.split(' ')[0])) &&
          `${j.title} ${j.dept} ${j.location} ${j.blurb}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, loc, kind],
  );

  const submit = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = 'Your full name';
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(form.email)) e.email = 'A working email, please';
    if (form.why.trim().length < 40) e.why = 'Say a bit more — 40 characters minimum, no cover letter needed';
    setErrs(e);
    if (Object.keys(e).length) return;
    setApply(false);
    toast({ tone: 'success', title: 'Application received', body: 'A human reads it within 14 days. You will get an answer either way — that is the promise.' });
  };

  return (
    <div>
      <PageHero
        tone="navy"
        image="/img/cabin-crew.jpg"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Careers' }]}
        eyebrow="Careers at AeroNova"
        title="Come and build an airline on the continent."
        lead="11,400 people, 94% of them on the ground or in the air in Africa. We pay properly, we publish the numbers, and we do not bond our graduates."
        height="md"
      >
        <div className="mt-7 grid gap-3 sm:grid-cols-4">
          {[
            ['11,400', 'employees'],
            ['310', 'roles open now'],
            ['14 days', 'to a human answer'],
            ['91%', 'born on the continent'],
          ].map(([v, l]) => (
            <div key={l} className="rounded-[14px] border border-white/12 bg-white/[0.06] px-4 py-3 backdrop-blur">
              <p className="num font-display text-[1.375rem] font-semibold text-white">{v}</p>
              <p className="text-[.6875rem] uppercase tracking-[0.14em] text-white/50">{l}</p>
            </div>
          ))}
        </div>
      </PageHero>

      {/* search + list */}
      <section className="bg-mist-50/60 py-12">
        <div className="shell grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-4 lg:sticky lg:top-[calc(var(--nav)+16px)] lg:self-start">
            <div className="card p-4">
              <p className="mb-2.5 flex items-center gap-2 font-display text-[.9375rem] font-semibold text-navy-900">
                <Search size={15} className="text-ink-400" /> Find your role
              </p>
              <Field label="Keyword">
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="engineer, crew, analyst…" className="h-10" />
              </Field>
              <div className="mt-3">
                <Field label="Location">
                  <Select value={loc} onChange={(e) => setLoc(e.target.value)} className="h-10">
                    {locations.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="mt-3">
                <p className="mb-1.5 text-[.75rem] font-semibold uppercase tracking-[0.08em] text-ink-500">Department</p>
                <ul className="space-y-1">
                  <li>
                    <button onClick={() => { setKind('all'); nav('/careers'); }} className={cx('w-full rounded-[9px] px-2.5 py-1.5 text-left text-[.8125rem] font-medium transition', kind === 'all' ? 'bg-navy-800 text-white' : 'text-ink-600 hover:bg-mist-100')}>
                      All departments <span className="num opacity-70">{JOBS.length}</span>
                    </button>
                  </li>
                  {DEPARTMENTS.map((d) => {
                    const n = JOBS.filter((j) => j.dept === d.name).length;
                    return (
                      <li key={d.id}>
                        <button
                          disabled={!n && d.name !== 'Graduate Programme'}
                          onClick={() => {
                            setKind(d.name);
                            nav(`/careers/${d.id}`);
                          }}
                          className={cx('flex w-full items-center justify-between gap-2 rounded-[9px] px-2.5 py-1.5 text-left text-[.8125rem] font-medium transition disabled:opacity-40', kind === d.name ? 'bg-navy-800 text-white' : 'text-ink-600 hover:bg-mist-100')}
                        >
                          {d.name}
                          <span className="num text-[.6875rem] opacity-70">{n || d.open}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <Divider className="my-3" />
              <p className="text-[.8125rem] leading-relaxed text-ink-500">
                Nothing here fits? We hire for aptitude twice a year through the open pool — send a profile and we will keep it for 12 months.
              </p>
              <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => toast({ tone: 'info', title: 'Open pool', body: 'Upload a CV and we will match you when a role opens.' })}>
                Join the open pool
              </Button>
            </div>
            <div className="rounded-card border border-line bg-white p-4">
              <p className="flex items-center gap-2 font-display text-[.9375rem] font-semibold text-navy-900">
                <GraduationCap size={15} className="text-teal-600" /> Graduate programme 2027
              </p>
              <p className="mt-1.5 text-[.8125rem] leading-relaxed text-ink-500">Twelve places, two years, eight rotations. Housing support, a wage from day one, and no bond.</p>
              <Button size="sm" className="mt-3 w-full" onClick={() => { const g = JOBS.find((j) => j.id === 'j7')!; setJob(g); setApply(true); }}>
                Apply for 2027
              </Button>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-[1.25rem] font-semibold text-navy-900">
                {list.length} role{list.length === 1 ? '' : 's'} {kind !== 'all' && `in ${kind}`}
              </h2>
              <Tabs
                tone="pill"
                size="sm"
                value="roles"
                onChange={() => {}}
                items={[
                  { id: 'roles', label: 'Roles' },
                  { id: 'life', label: 'Life here' },
                ]}
              />
            </div>

            {list.length === 0 ? (
              <EmptyState title="No roles match" body="We post new ones on Mondays at 07:00 GMT. Clear the filters or join the open pool." icon={<Briefcase size={20} />} action={<Button size="sm" onClick={() => { setQ(''); setLoc('All locations'); setKind('all'); nav('/careers'); }}>Clear filters</Button>} />
            ) : (
              <ul className="space-y-3">
                {list.map((j, i) => (
                  <li key={j.id}>
                    <article className={cx('group card p-4 transition hover:border-sky-300 hover:shadow-card sm:p-5', i === 1 && 'lg:translate-x-3')}>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge tone="navy">{j.dept}</Badge>
                            <Badge tone="neutral">{j.level}</Badge>
                            <Badge tone="neutral">{j.type}</Badge>
                          </div>
                          <h3 className="mt-2.5 font-display text-[1.125rem] font-semibold leading-snug text-navy-900">{j.title}</h3>
                          <p className="mt-1.5 text-[.9375rem] leading-relaxed text-ink-600">{j.blurb}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[.8125rem] text-ink-500">
                            <span className="flex items-center gap-1.5">
                              <MapPin size={13} className="text-ink-400" /> {j.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Wallet size={13} className="text-ink-400" /> {j.salary}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Sparkles size={13} className="text-teal-500" /> Posted {fmtDate(j.posted, 'short')}
                            </span>
                          </div>
                        </div>
                        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
                          <Button size="sm" onClick={() => { setJob(j); setApply(true); }}>
                            Apply now
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setJob(j)}>
                            Full description
                          </Button>
                          <button onClick={() => setSaved((v) => (v.includes(j.id) ? v.filter((x) => x !== j.id) : [...v, j.id]))} className="text-[.75rem] font-semibold text-ink-400 underline-offset-4 hover:text-navy-800 hover:underline">
                            {saved.includes(j.id) ? 'Saved to your list' : 'Save this role'}
                          </button>
                        </div>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
            )}

            <Divider className="my-10" label="How hiring works" />
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {CAREER_STAGES.map((s, i) => (
                <li key={s.title} className="relative rounded-card border border-line bg-white p-4">
                  <span className="num font-display text-[1.5rem] font-semibold text-mist-300">0{i + 1}</span>
                  <p className="mt-1 font-display text-[.9375rem] font-semibold text-navy-900">{s.title}</p>
                  <p className="mt-1.5 text-[.8125rem] leading-relaxed text-ink-500">{s.body}</p>
                </li>
              ))}
            </ol>

            <Divider className="my-10" label="Life at AeroNova" />
            <div className="grid gap-4 sm:grid-cols-2">
              {LIFE_AT_AERONOVA.map((l, i) => (
                <article key={l.title} className="card overflow-hidden p-0">
                  {i === 0 && <Photo src="/img/crew.jpg" alt="" seed="crew" className="h-36" imgClassName="object-cover" />}
                  <div className="p-5">
                    <h3 className="font-display text-[1.0625rem] font-semibold text-navy-900">{l.title}</h3>
                    <p className="mt-2 text-[.9375rem] leading-relaxed text-ink-600">{l.body}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 rounded-card border border-line bg-white p-5 sm:p-6">
              <SectionHeading eyebrow="Benefits, in full" title="What you actually get, not what looks good in a brochure." className="mb-6 [&_h2]:text-[1.375rem]" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ['Pay', 'Sector top quartile, reviewed twice a year, published bands at every level'],
                  ['Roster', 'Bid lines published 9 weeks ahead; 78% of crew fly their bid'],
                  ['Destination nights', 'Four per year, your choice, no justification needed'],
                  ['Health', 'Medical + dental + optical for you and two dependants, no premium'],
                  ['Pension', '9% employer contribution from month one, portable'],
                  ['Travel', 'ID90 for you and family; 12 standby seats a year for friends'],
                  ['Training', 'Licences and type ratings paid, kept by you, never bonded'],
                  ['Childcare', 'On-site crèche at ACC and NBO, plus USD 90/month allowance'],
                  ['Study', 'USD 2,400 a year for anything you want to learn, approved by your manager'],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-[12px] border border-line p-3.5">
                    <p className="flex items-center gap-2 font-display text-[.875rem] font-semibold text-navy-900">
                      <Check size={14} className="text-teal-600" /> {k}
                    </p>
                    <p className="mt-1.5 text-[.8125rem] leading-snug text-ink-500">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
              <SectionHeading eyebrow="Questions" title="Before you apply." className="mb-0 lg:sticky lg:top-[calc(var(--nav)+16px)] lg:self-start" />
              <Accordion
                items={[
                  { id: '1', q: 'Do I need aviation experience?', a: <p>For two thirds of our roles, no. We hire cabin crew, coordinators, analysts and graduates on aptitude and train them. Engineers and pilots need licences, obviously.</p> },
                  { id: '2', q: 'Is there a height or tattoo rule?', a: <p>You must reach 212 cm to touch — that is an equipment requirement, not an aesthetic one. Visible tattoos are fine below the elbow; face and neck are the only exclusions.</p> },
                  { id: '3', q: 'Do you sponsor visas?', a: <p>For licensed engineers, commanders and a small number of specialist roles, yes — we have a fast lane with the Ghanaian and Kenyan authorities. For most roles we hire locally, deliberately.</p> },
                  { id: '4', q: 'Why is the answer time 14 days?', a: <p>Because silence is the thing candidates tell us they hate most. Every application gets a decision or a real update within 14 days, including rejections, written by a person.</p> },
                  { id: '5', q: 'Can I apply to two roles at once?', a: <p>Yes, and say which is your first choice in the free text. Two applications do not slow each other down.</p> },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* departments strip */}
      <section className="border-y border-line bg-white py-12">
        <div className="shell">
          <SectionHeading eyebrow="Where people work" title="Eight teams, one operation." action={<Button size="sm" variant="secondary" to="/about">The company</Button>} />
          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {DEPARTMENTS.map((d) => (
              <button key={d.id} onClick={() => { setKind(d.name); window.scrollTo({ top: 400, behavior: 'smooth' }); }} className="group rounded-card border border-line p-4 text-left transition hover:border-navy-400 hover:bg-mist-50">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-[1rem] font-semibold text-navy-900">{d.name}</p>
                  <Badge tone={d.open > 30 ? 'teal' : 'neutral'}>{d.open} open</Badge>
                </div>
                <p className="mt-1 text-[.8125rem] text-ink-500">{d.note}</p>
                <p className="num mt-3 flex items-center gap-2 border-t border-line pt-2.5 text-[.75rem] text-ink-400">
                  <Users size={13} /> {d.people.toLocaleString()} people
                  <ArrowRight size={13} className="ml-auto transition group-hover:translate-x-1" />
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* job modal */}
      <Modal
        open={!!job && !apply}
        onClose={() => setJob(null)}
        title={job?.title ?? ''}
        subtitle={job ? `${job.dept} · ${job.location} · ${job.type}` : ''}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setJob(null)}>
              Close
            </Button>
            <Button onClick={() => setApply(true)}>Apply for this role</Button>
          </>
        }
      >
        {job && (
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-[.9375rem] leading-relaxed text-ink-600">{job.blurb}</p>
              <p className="mt-4 text-2xs font-semibold uppercase tracking-[0.16em] text-ink-400">What you will do</p>
              <ul className="mt-2 space-y-2">
                {job.responsibilities.map((r) => (
                  <li key={r} className="flex gap-2.5 text-[.875rem] leading-relaxed text-ink-600">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-teal-500" /> {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-ink-400">What we need</p>
              <ul className="mt-2 space-y-2">
                {job.requirements.map((r) => (
                  <li key={r} className="flex gap-2.5 text-[.875rem] leading-relaxed text-ink-600">
                    <Check size={14} className="mt-1 shrink-0 text-teal-600" /> {r}
                  </li>
                ))}
              </ul>
              <dl className="mt-4 rounded-[12px] bg-mist-50 p-3.5 text-[.8125rem]">
                {[
                  ['Salary', job.salary],
                  ['Level', job.level],
                  ['Posted', fmtDate(job.posted, 'long')],
                  ['Reference', job.id.toUpperCase()],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-line py-1.5 last:border-0">
                    <dt className="text-ink-400">{k}</dt>
                    <dd className="text-right font-medium text-navy-900">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 flex items-start gap-2 text-[.75rem] leading-relaxed text-ink-400">
                <HeartHandshake size={14} className="mt-0.5 shrink-0 text-teal-600" /> We will not ask your salary history, and we will not call your current employer without written permission.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* apply modal */}
      <Modal
        open={apply}
        onClose={() => setApply(false)}
        title={job ? `Apply · ${job.title}` : 'Apply'}
        subtitle="Twelve minutes, no cover letter. You can save and finish later."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setApply(false)}>
              Save for later
            </Button>
            <Button onClick={submit} icon={<Send size={15} />}>
              Submit application
            </Button>
          </>
        }
      >
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Full name" required error={errs.name}>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} invalid={!!errs.name} />
          </Field>
          <Field label="Email" required error={errs.email}>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} invalid={!!errs.email} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+233 …" />
          </Field>
          <Field label="Portfolio / LinkedIn">
            <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="Optional" />
          </Field>
          <Field label="Why this role, in your words" required error={errs.why} className="sm:col-span-2" hint="We read every one. A paragraph is plenty — no letter format needed.">
            <TextArea rows={5} value={form.why} onChange={(e) => setForm({ ...form, why: e.target.value })} />
          </Field>
          <Field label="Right to work" className="sm:col-span-2">
            <Select value={form.visa ? 'needs' : 'has'} onChange={(e) => setForm({ ...form, visa: e.target.value === 'needs' })}>
              <option value="has">I already have the right to work here</option>
              <option value="needs">I would need visa sponsorship</option>
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Checkbox label="Attach my saved CV (2026-04, 214 kB)" desc="You can upload a different one after submitting." checked={form.work} onChange={(v) => setForm({ ...form, work: v })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
