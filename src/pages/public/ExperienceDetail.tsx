import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Check, Minus } from 'lucide-react';
import { cx } from '../../lib/utils';
import { expBySlug, EXPERIENCES } from '../../data/experience';
import { ICONS } from './Experience';
import { Photo } from '../../components/brand/Brand';
import { Badge, Button, Divider, EmptyState, NovaRule, SectionHeading } from '../../components/ui/Primitives';
import { Accordion } from '../../components/ui/Overlay';
import { PageHero } from '../../components/layout/PublicLayout';
import { useStore } from '../../store/store';
import { CABINS } from '../../data/experience';

export default function ExperienceDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { toast } = useStore();
  const e = expBySlug(slug ?? '');
  const related = EXPERIENCES.filter((x) => x.slug !== slug).slice(0, 3);

  if (!e)
    return (
      <div className="shell py-24">
        <EmptyState title="We have not written that page yet" body="The experience section covers the airport, the lounges, dining, entertainment, Wi-Fi and comfort." icon={<Check size={20} />} action={<Button size="sm" onClick={() => nav('/experience')}>All experience</Button>} />
      </div>
    );

  return (
    <div>
      <PageHero
        tone="navy"
        image={e.img}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Experience', to: '/experience' }, { label: e.title }]}
        eyebrow={e.kicker}
        title={e.title}
        lead={e.hero}
      >
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="onDark" size="sm" to="/book">
            Book a flight
          </Button>
          <Button size="sm" variant="ghost" className="border border-white/25 text-white hover:bg-white/10" onClick={() => toast({ tone: 'info', title: 'Saved', body: 'This page is now in your trip notes — it will appear in the app.' })}>
            Save for later
          </Button>
        </div>
      </PageHero>

      <section className="bg-white py-14">
        <div className="shell grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-[1.0625rem] leading-[1.75] text-ink-700">{e.intro}</p>
            {e.note && (
              <p className="mt-6 rounded-[14px] border-l-2 border-teal-500 bg-mist-50 p-4 text-[.9375rem] leading-relaxed text-ink-600">{e.note}</p>
            )}
            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {e.pillars.map((p, i) => (
                <article key={p.title} className={cx('group rounded-card border border-line bg-white p-5 transition hover:border-sky-300 hover:shadow-card', i % 3 === 2 && 'sm:col-span-2')}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-navy-50 text-navy-700 transition group-hover:bg-navy-800 group-hover:text-gold-400">{ICONS[p.icon]}</span>
                    {p.stat && <Badge tone="teal">{p.stat}</Badge>}
                  </div>
                  <h3 className="mt-3.5 font-display text-[1.0625rem] font-semibold text-navy-900">{p.title}</h3>
                  <p className="mt-1.5 text-[.9rem] leading-relaxed text-ink-600">{p.body}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-[calc(var(--nav)+16px)] lg:self-start">
            <div className="card p-5">
              <p className="text-h3 text-[1rem]">The detail</p>
              <dl className="mt-4 space-y-2.5">
                {e.facts.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line pb-2 last:border-0">
                    <dt className="text-[.8125rem] text-ink-500">{k}</dt>
                    <dd className="num text-right text-[.875rem] font-medium text-navy-900">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            {e.access && (
              <div className="card p-5">
                <p className="text-h3 text-[1rem]">Who gets in</p>
                <ul className="mt-3 space-y-2.5">
                  {e.access.map((a) => (
                    <li key={a.who} className="border-l-2 border-teal-500 pl-3">
                      <p className="font-display text-[.875rem] font-semibold text-navy-900">{a.who}</p>
                      <p className="mt-0.5 text-[.8125rem] leading-snug text-ink-500">{a.what}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-card border border-line bg-mist-50 p-5">
              <p className="font-display text-[.9375rem] font-semibold text-navy-900">Go deeper</p>
              <ul className="mt-3 space-y-2">
                {CABINS.map((c) => (
                  <li key={c.slug}>
                    <Link to={`/cabins/${c.slug}`} className="group flex items-center justify-between gap-3 text-[.875rem] text-ink-600 transition hover:text-navy-900">
                      {c.name}
                      <ArrowRight size={14} className="text-ink-300 transition group-hover:translate-x-1 group-hover:text-navy-800" />
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/travel-information/baggage" className="group flex items-center justify-between gap-3 text-[.875rem] text-ink-600 hover:text-navy-900">
                    Baggage rules
                    <ArrowRight size={14} className="text-ink-300 transition group-hover:translate-x-1" />
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-line bg-mist-50/60 py-14">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <SectionHeading eyebrow="Questions" title={`About ${e.title.toLowerCase()}.`} lead="Three we answer constantly. If yours is not here, the help centre has 240 more." className="mb-0 lg:sticky lg:top-[calc(var(--nav)+16px)] lg:self-start" />
          <Accordion items={e.faq.map((f, i) => ({ id: `${e.slug}${i}`, q: f.q, a: <p>{f.a}</p> }))} />
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="shell">
          <Divider label="Continue" className="mb-8" />
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} to={`/experience/${r.slug}`} className="group relative flex min-h-[180px] flex-col justify-end overflow-hidden rounded-card border border-line p-5 transition hover:shadow-card">
                <Photo src={r.img} alt="" seed={r.slug} className="absolute inset-0 opacity-15 transition group-hover:opacity-25" imgClassName="object-cover" />
                <p className="relative eyebrow">{r.kicker}</p>
                <p className="relative mt-2 font-display text-[1.125rem] font-semibold text-navy-900">{r.title}</p>
                <p className="relative mt-1.5 text-[.8125rem] leading-snug text-ink-500">{r.hero}</p>
                <span className="relative mt-3 inline-flex items-center gap-1 text-[.8125rem] font-semibold text-sky-700 transition group-hover:gap-2">
                  Read <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
          <NovaRule className="mt-10" />
        </div>
      </section>
    </div>
  );
}

export const MinusIcon = Minus;
export const SectionH = SectionHeading;
