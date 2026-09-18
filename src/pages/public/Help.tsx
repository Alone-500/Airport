import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarCheck, Check, ChevronRight, Hourglass, LifeBuoy, Luggage, Mail, MessageSquare, Phone, Search, Send, ShieldCheck, Ticket, UserRound } from 'lucide-react';
import { cx } from '../../lib/utils';
import { HELP_CATEGORIES, helpSearch } from '../../data/content';
import { Badge, Button, Divider, EmptyState, SectionHeading } from '../../components/ui/Primitives';
import { Accordion, Modal } from '../../components/ui/Overlay';
import { Checkbox, Field, Input, SegmentedControl, Select, TextArea } from '../../components/ui/Form';
import { useStore } from '../../store/store';
import { PageHero } from '../../components/layout/PublicLayout';

const CAT_ICON: Record<string, React.ReactNode> = {
  ticket: <Ticket size={18} />,
  'credit-card': <Luggage size={18} />,
  luggage: <Luggage size={18} />,
  scan: <CalendarCheck size={18} />,
  plane: <ArrowRight size={18} />,
  rotate: <Hourglass size={18} />,
  star: <ShieldCheck size={18} />,
  passport: <UserRound size={18} />,
  accessibility: <LifeBuoy size={18} />,
};

export default function Help() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { toast } = useStore();
  const [q, setQ] = useState('');
  const [openTicket, setOpenTicket] = useState(false);
  const [ticket, setTicket] = useState({ cat: slug && HELP_CATEGORIES.some((c) => c.id === slug) ? slug : 'booking', subject: '', message: '', ref: '', urgency: 'normal', attach: true });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<string | null>(null);

  const hits = useMemo(() => helpSearch(q), [q]);
  const activeCat = slug && HELP_CATEGORIES.find((c) => c.id === slug);

  const submitTicket = () => {
    const e: Record<string, string> = {};
    if (ticket.subject.trim().length < 8) e.subject = 'A few more words, please — it routes your case';
    if (ticket.message.trim().length < 20) e.message = 'Tell us what happened (20+ characters)';
    setErrs(e);
    if (Object.keys(e).length) return;
    const id = `SUP-${Math.floor(1000 + Math.random() * 8999)}`;
    setSent(id);
    setOpenTicket(false);
    toast({ tone: 'success', title: `Case ${id} created`, body: 'Median first reply: 4 minutes in-app, 90 seconds on the phone.' });
  };

  return (
    <div>
      <PageHero
        tone="white"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Help centre' }]}
        eyebrow="Help centre"
        title="Ask, or read. Whichever is faster."
        lead="240 answered questions, a search that actually searches, and a support desk in Accra that answers in 90 seconds. No chatbot pretending to be Dr. Mensah."
        height="sm"
      >
        <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the help centre — “wheelchair”, “duplicate charge”, “cello”" className="h-14 pl-11 text-[1rem]" aria-label="Search help centre" />
            {q && hits.length === 0 && <p className="mt-2 text-[.8125rem] text-ink-400">Nothing matches that here — open a case below and we will answer properly.</p>}
          </div>
          <Button size="lg" variant="secondary" onClick={() => setOpenTicket(true)} icon={<Send size={16} />}>
            Contact us
          </Button>
          <Button size="lg" icon={<Phone size={16} />} href="tel:+233302200100">
            +233 302 200 100
          </Button>
        </div>

        {q && hits.length > 0 && (
          <div className="mt-4 max-w-3xl overflow-hidden rounded-card border border-line bg-white shadow-card">
            <p className="border-b border-line bg-mist-50 px-4 py-2 text-[.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-400">{hits.length} answers found</p>
            <ul className="divide-y divide-line">
              {hits.slice(0, 5).map((h, i) => (
                <li key={i}>
                  <button onClick={() => { setQ(''); nav(`/help/${h.cat.id}`); setTimeout(() => document.getElementById(`q-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120); }} className="w-full px-4 py-3 text-left transition hover:bg-sky-50/60">
                    <p className="font-display text-[.9375rem] font-semibold text-navy-900">{h.item.q}</p>
                    <p className="mt-0.5 line-clamp-2 text-[.8125rem] text-ink-500">{h.item.a}</p>
                    <span className="mt-1 inline-block text-[.6875rem] uppercase tracking-wide text-teal-600">{h.cat.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PageHero>

      {/* categories */}
      <section className="border-t border-line bg-mist-50/60 py-12">
        <div className="shell">
          {activeCat ? (
            <>
              <nav className="mb-5 flex flex-wrap items-center gap-2 text-[.8125rem]">
                <Link to="/help" className="text-ink-500 hover:text-navy-900">
                  All topics
                </Link>
                <ChevronRight size={13} className="text-ink-300" />
                <span className="font-semibold text-navy-900">{activeCat.title}</span>
              </nav>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div>
                  <SectionHeading eyebrow={activeCat.title} title={activeCat.blurb} className="mb-6 [&_h2]:text-[1.5rem]" />
                  <Accordion
                    className="mt-2"
                    single={false}
                    items={activeCat.items.map((it, i) => ({
                      id: `${i}`,
                      q: <span id={i === 0 ? 'q-0' : undefined}>{it.q}</span>,
                      a: (
                        <div>
                          <p>{it.a}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <span className="flex gap-1.5">
                              {it.tags.map((t) => (
                                <span key={t} className="rounded-pill bg-mist-100 px-2 py-0.5 text-[.6875rem] text-ink-500">
                                  {t}
                                </span>
                              ))}
                            </span>
                            <button onClick={() => toast({ tone: 'success', title: 'Thanks for the feedback' })} className="text-[.75rem] font-semibold text-ink-400 underline-offset-4 hover:underline">
                              Was this useful?
                            </button>
                          </div>
                        </div>
                      ),
                    }))}
                  />
                  <div className="mt-6 flex flex-wrap gap-2">
                    {HELP_CATEGORIES.filter((c) => c.id !== activeCat.id).slice(0, 5).map((c) => (
                      <Link key={c.id} to={`/help/${c.id}`} className="rounded-pill border border-line bg-white px-3 py-1.5 text-[.8125rem] font-medium text-ink-600 transition hover:border-navy-400 hover:text-navy-900">
                        {c.title}
                      </Link>
                    ))}
                  </div>
                </div>
                <aside className="space-y-4">
                  <div className="card p-4">
                    <p className="font-display text-[.9375rem] font-semibold text-navy-900">Do this in the app instead</p>
                    <ul className="mt-2.5 space-y-2 text-[.8125rem] text-ink-600">
                      {[
                        ['Check in & pick seats', '/check-in'],
                        ['Add a bag', '/manage-booking'],
                        ['Request a refund', '/manage-booking'],
                        ['Track a delayed bag', '/manage-booking'],
                        ['Change a flight', '/manage-booking'],
                      ].map(([l, to]) => (
                        <li key={l}>
                          <Link to={to} className="flex items-center justify-between gap-2 hover:text-navy-900">
                            {l} <ArrowRight size={13} className="text-ink-300" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-card border border-line bg-white p-4">
                    <p className="font-display text-[.9375rem] font-semibold text-navy-900">Answer times, this week</p>
                    <ul className="mt-2.5 space-y-2 text-[.8125rem]">
                      {[
                        ['In-app chat', '4 min'],
                        ['Phone', '90 sec'],
                        ['Email', '3 h 12 min'],
                        ['Social', '22 min'],
                        ['Airport desk', '6 min'],
                      ].map(([k, v]) => (
                        <li key={k} className="flex justify-between border-b border-line pb-1.5 last:border-0">
                          <span className="text-ink-500">{k}</span>
                          <span className="num font-semibold text-teal-700">{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              </div>
            </>
          ) : (
            <>
              <SectionHeading eyebrow="Browse by topic" title="Pick the one that sounds like yours." action={<Badge tone="neutral">{HELP_CATEGORIES.reduce((n, c) => n + c.items.length, 0)} answers</Badge>} />
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {HELP_CATEGORIES.map((c, i) => (
                  <Link key={c.id} to={`/help/${c.id}`} className={cx('group flex flex-col rounded-card border border-line bg-white p-5 transition hover:border-sky-300 hover:shadow-card', i % 5 === 1 && 'xl:translate-y-4', i % 7 === 3 && 'xl:-translate-y-3')}>
                    <span className="grid h-10 w-10 place-items-center rounded-[11px] bg-navy-50 text-navy-700 transition group-hover:bg-navy-800 group-hover:text-gold-400">{CAT_ICON[c.icon]}</span>
                    <p className="mt-3.5 font-display text-[1.0625rem] font-semibold text-navy-900">{c.title}</p>
                    <p className="mt-1.5 flex-1 text-[.875rem] leading-relaxed text-ink-500">{c.blurb}</p>
                    <p className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[.8125rem] text-ink-400">
                      {c.items.length} questions
                      <span className="flex items-center gap-1 font-semibold text-sky-700 transition group-hover:gap-2">
                        Open <ArrowRight size={13} />
                      </span>
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* self service + contact */}
      <section className="bg-white py-14">
        <div className="shell grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <SectionHeading eyebrow="Self service" title="Most things do not need a human." className="mb-0" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { icon: <Ticket size={16} />, t: 'Manage a booking', b: 'Change, cancel, refund, add bags, upload documents.', to: '/manage-booking' },
                { icon: <CalendarCheck size={16} />, t: 'Check in', b: 'Seats, passes, and bag numbers — 48 hours out.', to: '/check-in' },
                { icon: <Luggage size={16} />, t: 'Report a bag', b: 'Delayed or damaged. Interim expenses paid same day.', to: '/travel-information/lost-baggage' },
                { icon: <ShieldCheck size={16} />, t: 'Complaint & escalation', b: 'If our answer was not good enough, this goes to a supervisor.', to: '/contact' },
              ].map((x) => (
                <Link key={x.t} to={x.to} className="group flex items-start gap-3 rounded-card border border-line p-4 transition hover:border-sky-300 hover:bg-sky-50/40">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-navy-50 text-navy-700">{x.icon}</span>
                  <span>
                    <span className="block font-display text-[.9375rem] font-semibold text-navy-900">{x.t}</span>
                    <span className="mt-0.5 block text-[.8125rem] leading-snug text-ink-500">{x.b}</span>
                  </span>
                </Link>
              ))}
            </div>
            <Divider className="my-8" />
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={() => setOpenTicket(true)} icon={<Mail size={15} />}>
                Write to us instead
              </Button>
              <span className="flex items-center gap-1.5 text-[.8125rem] text-ink-500">
                <BookOpen size={14} className="text-ink-400" /> Median reply, this week: 3 h 12 min
              </span>
            </div>
            {sent && (
              <p className="mt-4 flex items-start gap-2.5 rounded-[12px] border border-teal-200 bg-teal-50 p-3.5 text-[.875rem] leading-relaxed text-teal-900">
                <Check size={16} className="mt-0.5 shrink-0" />
                <span>
                  Case <span className="num font-semibold">{sent}</span> is open and assigned. We will reply to the email on the booking; if you need an answer sooner, the phone line is faster than the queue.
                </span>
              </p>
            )}
          </div>

          <div className="relative overflow-hidden rounded-card bg-navy-900 p-6 text-white sm:p-8">
            <div className="pointer-events-none absolute inset-0 opacity-[0.07] texture-dots" />
            <div className="relative">
              <p className="eyebrow text-teal-300">Talk to a person</p>
              <h3 className="mt-2 font-display text-[1.5rem] font-semibold leading-snug">Reservations & support, Accra</h3>
              <ul className="mt-5 space-y-3.5 text-[.9375rem]">
                {[
                  ['General & bookings', '+233 302 200 100', '24/7 · English, French, Twi'],
                  ['Accessibility desk', '+233 302 200 200', '24/7 · we never ask you to explain twice'],
                  ['Baggage tracing', '+233 302 200 300', '04:00–01:00 GMT'],
                  ['Corporate & Nova for Business', '+233 302 200 400', 'Mon–Fri 07:00–19:00'],
                  ['WhatsApp', '+233 302 200 111', 'Best for photos of a damaged bag'],
                ].map(([k, v, n]) => (
                  <li key={k} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-white/10 pb-2.5">
                    <span className="text-white/60">{k}</span>
                    <span className="num font-display font-semibold text-white">{v}</span>
                    <span className="w-full text-[.75rem] text-white/40">{n}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 flex items-center gap-2 text-[.8125rem] text-teal-300">
                <MessageSquare size={14} /> Average answer time this week: 90 seconds
              </p>
            </div>
          </div>
        </div>
      </section>

      <Modal
        open={openTicket}
        onClose={() => setOpenTicket(false)}
        title="Write to the support desk"
        subtitle="Anything you attach speeds it up. Case numbers are useful for follow-ups."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpenTicket(false)}>
              Cancel
            </Button>
            <Button onClick={submitTicket}>Send message</Button>
          </>
        }
      >
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Topic" className="sm:col-span-1">
            <Select value={ticket.cat} onChange={(e) => setTicket({ ...ticket, cat: e.target.value })}>
              {HELP_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Urgency" className="sm:col-span-1">
            <SegmentedControl
              full
              size="sm"
              value={ticket.urgency}
              onChange={(v: string) => setTicket({ ...ticket, urgency: v })}
              options={[
                { id: 'normal', label: 'Normal' },
                { id: 'travel-today', label: 'Travelling today' },
                { id: 'accessibility', label: 'Accessibility' },
              ]}
            />
          </Field>
          <Field label="Subject" required error={errs.subject} className="sm:col-span-2">
            <Input value={ticket.subject} onChange={(e) => setTicket({ ...ticket, subject: e.target.value })} placeholder="Damaged cabin bag on AN 512" invalid={!!errs.subject} />
          </Field>
          <Field label="Booking reference" hint="Optional — it lets us see the tickets without asking" className="sm:col-span-1">
            <Input value={ticket.ref} onChange={(e) => setTicket({ ...ticket, ref: e.target.value.toUpperCase() })} placeholder="ANV7X2K" className="num uppercase tracking-[0.12em]" />
          </Field>
          <Field label="Reply to" className="sm:col-span-1">
            <Input defaultValue="ama.mensah@example.com" />
          </Field>
          <Field label="What happened?" required error={errs.message} className="sm:col-span-2">
            <TextArea rows={5} value={ticket.message} onChange={(e) => setTicket({ ...ticket, message: e.target.value })} placeholder="Tell us in your own words. Dates, flight numbers and names help." />
          </Field>
          <div className="sm:col-span-2 space-y-2">
            <Checkbox label="Attach photos of the bag" checked={ticket.attach} onChange={(v) => setTicket({ ...ticket, attach: v })} desc="Up to 10 images · 25 MB each" />
            <Checkbox label="Also send me an SMS when the case moves" />
          </div>
          <p className="sm:col-span-2 flex items-center gap-2 text-[.75rem] text-ink-400">
            <MessageSquare size={13} /> We answer in the language you write in. French and Portuguese desks sit next to the English one.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export const EmptyHelp = EmptyState;
