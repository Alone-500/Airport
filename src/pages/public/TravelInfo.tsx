import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Check, Info, LifeBuoy, Search, ShieldCheck } from 'lucide-react';
import { cx } from '../../lib/utils';
import { TRAVEL_SECTIONS, travelSection } from '../../data/content';
import { Badge, Button, Divider, EmptyState, SectionHeading } from '../../components/ui/Primitives';
import { Breadcrumbs, Modal } from '../../components/ui/Overlay';
import { Checkbox, Field, Input } from '../../components/ui/Form';
import { PageHero } from '../../components/layout/PublicLayout';
import { useStore } from '../../store/store';
import { useHashScroll } from '../../components/ui/RouteSkeleton';

export default function TravelInfo() {
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    if (!q.trim()) return TRAVEL_SECTIONS;
    const t = q.toLowerCase();
    return TRAVEL_SECTIONS.filter((s) => `${s.title} ${s.summary} ${s.kicker} ${s.blocks.map((b) => b.heading + (b.body ?? '')).join(' ')}`.toLowerCase().includes(t));
  }, [q]);

  return (
    <div>
      <PageHero
        tone="white"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Travel information' }]}
        eyebrow="Travel information"
        title="Everything you would otherwise phone us about."
        lead="Fourteen pages of rules, written as rules — including the ones that cost us money to tell you. Each page says when it was last updated, because a policy without a date is a rumour."
        height="sm"
      >
        <div className="mt-6 flex max-w-lg flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: baggage, visa, batteries, minors…" className="h-12 pl-10" aria-label="Search travel information" />
          </div>
          <Button size="lg" variant="secondary" to="/help">
            Help centre
          </Button>
        </div>
      </PageHero>

      <section className="border-t border-line bg-mist-50/60 py-12">
        <div className="shell">
          {list.length === 0 ? (
            <EmptyState title={`Nothing matches “${q}”`} body="Try a shorter word — “bag”, “visa”, “child”. Or ask the help centre, which has 240 answered questions." icon={<Search size={20} />} action={<Button size="sm" onClick={() => setQ('')}>Clear</Button>} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {list.map((s, i) => (
                <Link key={s.id} to={`/travel-information/${s.id}`} className={cx('group flex h-full flex-col rounded-card border border-line bg-white p-5 transition hover:border-sky-300 hover:shadow-card', i % 5 === 2 && 'xl:translate-y-4', i % 7 === 4 && 'xl:-translate-y-3')}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display text-[1.0625rem] font-semibold text-navy-900">{s.title}</p>
                    <Badge tone="neutral">{s.readMin} min</Badge>
                  </div>
                  <p className="mt-1 text-[.75rem] uppercase tracking-[0.1em] text-teal-600">{s.kicker}</p>
                  <p className="mt-2.5 flex-1 text-[.875rem] leading-relaxed text-ink-600">{s.summary}</p>
                  <p className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[.75rem] text-ink-400">
                    Updated {s.updated}
                    <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                  </p>
                </Link>
              ))}
            </div>
          )}

          <Divider className="my-12" label="Still stuck" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: <LifeBuoy size={18} />, t: 'Help centre', b: 'Answers sorted by what people actually search for, with a search box that works.', to: '/help' },
              { icon: <ShieldCheck size={18} />, t: 'Your rights', b: 'Denied boarding, delay duty of care and the two regulations that apply to us.', to: '/help/flights-help' },
              { icon: <Info size={18} />, t: 'Talk to a person', b: 'Reservations in Accra, 24/7, average answer in 90 seconds.', to: '/contact' },
            ].map((c) => (
              <Link key={c.t} to={c.to} className="card flex items-start gap-3 p-5 transition hover:border-sky-300">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-navy-50 text-navy-700">{c.icon}</span>
                <span>
                  <span className="block font-display text-[.9375rem] font-semibold text-navy-900">{c.t}</span>
                  <span className="mt-1 block text-[.8125rem] leading-relaxed text-ink-500">{c.b}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
export function TravelSectionPage() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { toast } = useStore();
  useHashScroll();
  const [ask, setAsk] = useState(false);
  const [askText, setAskText] = useState('');
  const s = travelSection(slug ?? '');

  if (!s)
    return (
      <div className="shell py-24">
        <EmptyState title="That page has moved" body="The travel information hub lists all fourteen topics, and search covers every heading." icon={<Search size={20} />} action={<Button size="sm" onClick={() => nav('/travel-information')}>Travel information</Button>} />
      </div>
    );

  const others = TRAVEL_SECTIONS.filter((x) => x.id !== s.id).slice(0, 4);

  return (
    <div>
      <div className="border-b border-line bg-white pt-[var(--nav)]">
        <div className="shell py-8">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Travel information', to: '/travel-information' }, { label: s.title }]} />
          <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-3xl">
              <p className="eyebrow">{s.kicker}</p>
              <h1 className="h-hero mt-3 text-[clamp(2rem,5.2vw,3.125rem)]">{s.title}</h1>
              <p className="lead mt-3">{s.summary}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-[.75rem] text-ink-400">
                Updated {s.updated} · {s.readMin} minute read
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setAsk(true)}>
                  Ask about my flight
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard?.writeText(location.href); toast({ tone: 'success', title: 'Link copied' }); }}>
                  Copy link
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-mist-50/50 py-10">
        <div className="shell grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className="min-w-0 space-y-8">
            {s.blocks.map((b, i) => (
              <section key={i} id={`b${i}`} className="scroll-mt-[calc(var(--nav)+1rem)]">
                <h2 className="font-display text-[clamp(1.25rem,2.4vw,1.625rem)] font-semibold tracking-[-0.02em] text-navy-900">{b.heading}</h2>
                {b.body && <p className="mt-3 max-w-3xl text-[1rem] leading-[1.75] text-ink-700">{b.body}</p>}
                {b.bullets && (
                  <ul className="mt-4 space-y-2.5">
                    {b.bullets.map((x) => (
                      <li key={x} className="flex gap-3 text-[.9375rem] leading-relaxed text-ink-600">
                        <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                        {x}
                      </li>
                    ))}
                  </ul>
                )}
                {b.table && (
                  <div className="mt-5 overflow-x-auto rounded-card border border-line bg-white">
                    <table className="table-base min-w-[520px]">
                      <thead>
                        <tr>
                          {b.table.head.map((h) => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {b.table.rows.map((r, k) => (
                          <tr key={k}>
                            {r.map((cell, j) => (
                              <td key={j} className={cx(j === 0 && 'font-semibold text-navy-900', j > 0 && 'text-ink-600')}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {b.note && (
                  <p
                    className={cx(
                      'mt-4 flex max-w-3xl items-start gap-3 rounded-[14px] border-l-2 px-4 py-3 text-[.875rem] leading-relaxed',
                      b.note.kind === 'warn' && 'border-gold-500 bg-gold-100/60 text-gold-600',
                      b.note.kind === 'info' && 'border-sky-500 bg-sky-50/70 text-sky-900',
                      b.note.kind === 'good' && 'border-teal-500 bg-teal-50/70 text-teal-900',
                    )}
                  >
                    {b.note.kind === 'warn' ? <AlertTriangle size={16} className="mt-0.5 shrink-0" /> : b.note.kind === 'good' ? <Check size={16} className="mt-0.5 shrink-0" /> : <Info size={16} className="mt-0.5 shrink-0" />}
                    <span>{b.note.text}</span>
                  </p>
                )}
                {i < s.blocks.length - 1 && <Divider className="mt-8" />}
              </section>
            ))}

            <div className="rounded-card border border-line bg-white p-5">
              <SectionHeading eyebrow="Related" title="Read next" className="mb-5 [&_h2]:text-[1.25rem]" />
              <ul className="grid gap-2 sm:grid-cols-2">
                {others.map((o) => (
                  <li key={o.id}>
                    <Link to={`/travel-information/${o.id}`} className="group flex items-center justify-between gap-3 rounded-[12px] border border-line px-3.5 py-2.5 transition hover:border-sky-300 hover:bg-sky-50/40">
                      <span className="text-[.875rem] font-medium text-navy-900">{o.title}</span>
                      <ArrowRight size={14} className="text-ink-300 transition group-hover:translate-x-1 group-hover:text-navy-800" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <aside className="space-y-4 lg:sticky lg:top-[calc(var(--nav)+16px)] lg:self-start">
            <div className="card p-4">
              <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-ink-400">On this page</p>
              <ul className="mt-3 space-y-1.5">
                {s.blocks.map((b, i) => (
                  <li key={i}>
                    <a href={`#b${i}`} className="block truncate text-[.8125rem] text-ink-600 transition hover:text-navy-900 hover:underline">
                      {b.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-card border border-line bg-white p-4">
              <p className="font-display text-[.9375rem] font-semibold text-navy-900">Applies to your trip?</p>
              <p className="mt-1.5 text-[.8125rem] leading-relaxed text-ink-500">Open your booking and we will show the parts of this page that matter for your route, fare and travel documents.</p>
              <Button size="sm" className="mt-3 w-full" to="/manage-booking">
                Check my booking
              </Button>
            </div>
            <div className="rounded-card border border-line bg-white p-4">
              <p className="font-display text-[.9375rem] font-semibold text-navy-900">Was this useful?</p>
              <div className="mt-2.5 flex gap-2">
                {['Yes', 'Not really'].map((x) => (
                  <button key={x} onClick={() => toast({ tone: x === 'Yes' ? 'success' : 'info', title: 'Noted', body: x === 'Yes' ? 'Thank you — this helps the team that writes these.' : 'Tell us what was missing below.' })} className="flex-1 rounded-[10px] border border-line px-3 py-2 text-[.8125rem] font-semibold text-ink-600 transition hover:border-navy-400 hover:text-navy-900">
                    {x}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Modal
        open={ask}
        onClose={() => setAsk(false)}
        title={`Ask about “${s.title}”`}
        subtitle="A real person in Accra answers, usually inside 90 seconds."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAsk(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAsk(false);
                toast({ tone: 'success', title: 'Question received', body: 'We will reply to the email on your booking. Case #SUP-8812.' });
              }}
            >
              Send question
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Your question" required>
            <Input value={askText} onChange={(e) => setAskText(e.target.value)} placeholder="e.g. I have a cello and a 23 kg bag — what do I do?" />
          </Field>
          <Checkbox label="Attach my current booking reference" desc="ANV7X2K · Accra → Lagos, 3 travellers" defaultChecked />
          <Checkbox label="Reply by email rather than in the app" />
        </div>
      </Modal>
    </div>
  );
}
