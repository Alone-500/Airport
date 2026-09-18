import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, Filter, Newspaper, Rss, Search, Users } from 'lucide-react';
import { cx, fmtDate } from '../../lib/utils';
import { CALENDAR, GALLERY, INVESTOR, NEWS } from '../../data/content';
import { Photo } from '../../components/brand/Brand';
import { Badge, Button, Divider, EmptyState } from '../../components/ui/Primitives';
import { Modal, Tabs } from '../../components/ui/Overlay';
import { Checkbox, Field, Input, Select } from '../../components/ui/Form';
import { PageHero } from '../../components/layout/PublicLayout';
import { useStore } from '../../store/store';
import { useHashScroll } from '../../components/ui/RouteSkeleton';

const KINDS = ['All', 'Press release', 'Announcement', 'Result', 'Feature'] as const;

export default function Newsroom() {
  useHashScroll();
  const { toast } = useStore();
  const [kind, setKind] = useState<(typeof KINDS)[number]>('All');
  const [q, setQ] = useState('');
  const [year, setYear] = useState('2026');
  const [detail, setDetail] = useState<(typeof NEWS)[number] | null>(null);
  const [media, setMedia] = useState(false);

  const list = useMemo(
    () =>
      NEWS.filter((n) => (kind === 'All' || n.kind === kind) && String(new Date(n.date).getFullYear()) === year && `${n.title} ${n.summary} ${n.place}`.toLowerCase().includes(q.toLowerCase())),
    [kind, q, year],
  );

  return (
    <div>
      <PageHero
        tone="navy"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Newsroom' }]}
        eyebrow="Newsroom"
        title="Everything we publish, including the unflattering parts."
        lead="Press releases, results, statements and the occasional long read. Media enquiries are answered inside four hours on working days, and we do not do embargo-only briefing."
        height="sm"
      >
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <Button variant="onDark" size="sm" icon={<Users size={15} />} onClick={() => setMedia(true)}>
            Media enquiries
          </Button>
          <Button size="sm" variant="ghost" className="border border-white/25 text-white hover:bg-white/10" icon={<Download size={14} />} onClick={() => toast({ tone: 'success', title: 'Brand kit downloaded', body: 'Logos, livery colour values, and 12 approved photographs.' })}>
            Brand assets
          </Button>
          <span className="flex items-center gap-1.5 text-[.8125rem] text-white/55">
            <Rss size={14} /> RSS available
          </span>
        </div>
      </PageHero>

      <div className="sticky top-[var(--nav)] z-30 border-b border-line bg-white/95 backdrop-blur-xl">
        <div className="shell flex flex-wrap items-center gap-3 py-2.5">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {KINDS.map((k) => (
              <button key={k} onClick={() => setKind(k)} className={cx('shrink-0 rounded-pill border px-3 py-1.5 text-[.8125rem] font-semibold transition', kind === k ? 'border-navy-800 bg-navy-800 text-white' : 'border-line text-ink-600 hover:border-navy-300')}>
                {k}
                <span className="num ml-1.5 text-[.6875rem] opacity-70">{k === 'All' ? NEWS.length : NEWS.filter((n) => n.kind === k).length}</span>
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search releases" className="h-9 w-[190px] pl-8 text-[.8125rem]" aria-label="Search the newsroom" />
            </div>
            <Select value={year} onChange={(e) => setYear(e.target.value)} className="h-9 w-[104px] text-[.8125rem]" aria-label="Year">
              {['2026', '2025', '2024', '2023'].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <section className="bg-mist-50/60 py-12">
        <div className="shell grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            {list.length === 0 ? (
              <EmptyState title="Nothing in that filter" body="Try another year — the archive goes back to 2011, and we have never deleted a statement." icon={<Newspaper size={20} />} action={<Button size="sm" onClick={() => { setKind('All'); setQ(''); setYear('2026'); }}>Clear</Button>} />
            ) : (
              <ul className="space-y-4">
                {list.map((n, i) => (
                  <li key={n.id}>
                    <article className={cx('group grid gap-4 rounded-card border border-line bg-white p-4 transition hover:border-sky-300 hover:shadow-card sm:grid-cols-[1fr_140px] sm:p-5', i === 0 && 'sm:grid-cols-[1fr_220px]')}>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <Badge tone={n.kind === 'Result' ? 'teal' : n.kind === 'Feature' ? 'gold' : n.kind === 'Announcement' ? 'sky' : 'neutral'}>{n.kind}</Badge>
                          <span className="num text-[.75rem] text-ink-400">{fmtDate(n.date, 'long')} · {n.place}</span>
                        </div>
                        <h2 className="mt-2.5 font-display text-[clamp(1.0625rem,2.2vw,1.375rem)] font-semibold leading-snug text-navy-900 group-hover:text-navy-800">{n.title}</h2>
                        <p className="mt-2 text-[.9375rem] leading-relaxed text-ink-600">{n.summary}</p>
                        <button onClick={() => setDetail(n)} className="mt-3 inline-flex items-center gap-1.5 text-[.8125rem] font-semibold text-sky-700 transition group-hover:gap-2.5">
                          Read the release <ArrowRight size={14} />
                        </button>
                      </div>
                      {i < 3 && (
                        <Photo src={GALLERY[i * 2].src} alt="" seed={n.id} className="hidden h-full min-h-[110px] rounded-[12px] sm:block" imgClassName="object-cover transition-transform duration-700 group-hover:scale-105" />
                      )}
                    </article>
                  </li>
                ))}
              </ul>
            )}

            <Divider className="my-10" label="Archive" />
            <Tabs
              tone="pill"
              value="by-year"
              onChange={() => {}}
              items={[{ id: 'by-year', label: 'By year' }, { id: 'by-topic', label: 'By topic' }]}
              className="mb-4"
            />
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {['2026 · 34 items', '2025 · 51 items', '2024 · 46 items', '2023 · 39 items'].map((y) => (
                <button key={y} onClick={() => toast({ tone: 'info', title: 'Archive', body: `${y.split(' ·')[0]} is available in the live product.` })} className="rounded-[12px] border border-line bg-white px-3.5 py-3 text-left text-[.875rem] font-medium text-navy-900 transition hover:border-navy-400">
                  {y}
                </button>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="card p-4">
              <p className="text-h3 text-[1rem]">Contacts</p>
              <ul className="mt-3 space-y-3">
                {[
                  { n: 'Efua Ansah', r: 'Group Head of Communications', e: 'press@aeronova.aero' },
                  { n: 'Dr. Mopeli Sithole', r: 'Safety & Investigations', e: 'safety@aeronova.aero' },
                  { n: 'Nadia Okonjo', r: 'Investor Relations', e: 'ir@aeronova.aero' },
                ].map((c) => (
                  <li key={c.e} className="border-b border-line pb-2.5 last:border-0">
                    <p className="font-display text-[.875rem] font-semibold text-navy-900">{c.n}</p>
                    <p className="text-[.75rem] text-ink-500">{c.r}</p>
                    <a href={`mailto:${c.e}`} className="text-[.75rem] font-medium text-sky-700 hover:underline">
                      {c.e}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-4">
              <p className="text-h3 text-[1rem]">Next dates</p>
              <ul className="mt-3 space-y-2">
                {CALENDAR.map((c) => (
                  <li key={c.date} className="flex items-start gap-3 border-b border-line pb-2 last:border-0">
                    <Badge tone="neutral">{c.kind}</Badge>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[.8125rem] font-medium leading-snug text-navy-900">{c.label}</span>
                      <span className="num text-[.75rem] text-ink-400">{c.date}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-4">
              <p className="text-h3 text-[1rem]">Latest results</p>
              <ul className="mt-3 space-y-2">
                {INVESTOR.slice(0, 4).map((r) => (
                  <li key={r.label} className="flex items-baseline justify-between gap-3 border-b border-line pb-1.5 text-[.8125rem] last:border-0">
                    <span className="text-ink-500">{r.label}</span>
                    <span className="num font-semibold text-navy-900">
                      {r.value} <span className="text-[.6875rem] font-normal text-teal-700">{r.delta}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <Button size="sm" variant="secondary" className="mt-3 w-full" to="/about#investors">
                Investor page
              </Button>
            </div>
            <Link to="/careers" className="group flex items-center gap-3 rounded-card border border-line bg-white p-4 transition hover:border-sky-300">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-navy-50 text-navy-700">
                <Users size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[.875rem] font-semibold text-navy-900">We are hiring 310 people</span>
                <span className="block text-[.75rem] text-ink-500">Cabin crew intakes, engineers, and a graduate programme</span>
              </span>
              <ArrowRight size={15} className="text-ink-300 transition group-hover:translate-x-1" />
            </Link>
          </aside>
        </div>
      </section>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.title ?? ''}
        subtitle={detail ? `${detail.kind} · ${fmtDate(detail.date, 'long')} · ${detail.place}` : ''}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDetail(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                toast({ tone: 'success', title: 'Release downloaded', body: 'Plain text and PDF versions are available to accredited media.' });
                setDetail(null);
              }}
            >
              Download
            </Button>
          </>
        }
      >
        {detail && (
          <div className="space-y-4">
            <p className="text-[1rem] leading-[1.75] text-ink-700">{detail.summary}</p>
            <p className="text-[.9375rem] leading-relaxed text-ink-600">
              Accra. AeroNova Airways today announced the above. Full operational data, including the station-level punctuality table and the load factors behind it, is attached to this release and published on the investor page at
              the same time — we do not hold back the numbers that make the headline look worse.
            </p>
            <p className="text-[.9375rem] leading-relaxed text-ink-600">
              “The short version is that we would rather have a schedule we can keep than a bigger one we cannot,” said Dr. Ama Kyei-Bonsu, Group Chief Executive. “That is the whole strategy, and the fleet order is what it looks like
              when you actually mean it.”
            </p>
            <Divider className="my-2" label="Notes to editors" />
            <ul className="space-y-2 text-[.875rem] leading-relaxed text-ink-600">
              {[
                'AeroNova Airways operates 46 aircraft to 41 destinations; FY2025 revenue USD 6.31bn.',
                'Punctuality is measured on the industry 15-minute rule and published monthly by station.',
                'Photographs and b-roll are available from press@aeronova.aero without an embargo.',
              ].map((n) => (
                <li key={n} className="flex gap-2.5">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-teal-500" /> {n}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>

      <Modal
        open={media}
        onClose={() => setMedia(false)}
        title="Media enquiry"
        subtitle="Accredited journalists are answered within four working hours."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setMedia(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setMedia(false);
                toast({ tone: 'success', title: 'Enquiry logged · PR-2291', body: 'Efua Ansah has it. If it is a safety matter, the safety desk is copied automatically.' });
              }}
            >
              Send enquiry
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name" required>
              <Input placeholder="Full name" />
            </Field>
            <Field label="Outlet" required>
              <Input placeholder="Publication or broadcaster" />
            </Field>
            <Field label="Work email" required className="sm:col-span-2">
              <Input type="email" placeholder="you@outlet.com" />
            </Field>
          </div>
          <Field label="Deadline" hint="Give us a time and a timezone; it changes who gets the call.">
            <Input type="date" />
          </Field>
          <div className="space-y-2">
            <Checkbox label="Also copy the safety desk" desc="Required for anything about an occurrence" />
            <Checkbox label="Request an interview with a named executive" defaultChecked />
            <Checkbox label="Request b-roll or aircraft access at ACC" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export const NewsFilterIcon = Filter;
