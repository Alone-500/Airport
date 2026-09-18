import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Gauge, Leaf, Quote, ShieldCheck, Target, TrendingUp, Users, Wallet } from 'lucide-react';
import { ABOUT, GALLERY, INVESTOR, CALENDAR } from '../../data/content';
import { FLEET } from '../../data/fleet';
import { Photo, Sunburst, WingMark } from '../../components/brand/Brand';
import { Badge, Button, Divider, Meter, NovaRule, SectionHeading } from '../../components/ui/Primitives';
import { PageHero } from '../../components/layout/PublicLayout';
import { useHashScroll } from '../../components/ui/RouteSkeleton';
import { cx } from '../../lib/utils';

export default function About() {
  useHashScroll();
  return (
    <div>
      <PageHero
        tone="navy"
        image="/img/fleet.jpg"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
        eyebrow="Founded in Kumasi, 2009"
        title={
          <>
            An airline built
            <br />
            because it was needed.
          </>
        }
        lead="AeroNova exists because fifteen years ago, getting from Accra to Nairobi took a day and a European capital. We fixed that, and kept going."
        height="lg"
      />

      {/* story */}
      <section className="bg-white py-16">
        <div className="shell grid gap-12 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <SectionHeading eyebrow="Our story" title="It started as a grievance." className="mb-0" />
            <div className="mt-6 space-y-5">
              {ABOUT.story.map((p, i) => (
                <p key={i} className={cx('leading-[1.8] text-ink-700', i === 0 ? 'text-[1.0625rem]' : 'text-[.9375rem] text-ink-600')}>
                  {p}
                </p>
              ))}
            </div>
            <NovaRule className="mt-8" />
          </div>
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-card cut-tr">
              <Photo src="/img/hero.jpg" alt="The first livery" seed="about-1" className="h-64 w-full" imgClassName="object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/90 to-transparent p-4 text-white">
                <p className="text-[.75rem] uppercase tracking-[0.16em] text-teal-300">2010 · the first A319</p>
                <p className="mt-1 text-[.9375rem]">24 Business seats where the flat beds were not flat.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {ABOUT.stats.map((s) => (
                <div key={s.label} className="rounded-[14px] border border-line p-4">
                  <p className="num font-display text-[1.5rem] font-semibold text-navy-900">{s.value}</p>
                  <p className="mt-0.5 text-[.75rem] font-semibold uppercase tracking-[0.08em] text-ink-500">{s.label}</p>
                  <p className="mt-1 text-[.75rem] text-ink-400">{s.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* mission / vision */}
      <section className="border-y border-line bg-mist-50/60 py-14">
        <div className="shell grid gap-6 lg:grid-cols-2">
          {[
            { icon: <Target size={18} />, k: 'Mission', v: ABOUT.mission },
            { icon: <TrendingUp size={18} />, k: 'Vision 2035', v: ABOUT.vision },
          ].map((x) => (
            <div key={x.k} className="relative overflow-hidden rounded-card bg-navy-900 p-7 text-white">
              <WingMark className="pointer-events-none absolute -right-8 -top-2 h-20 w-72 text-white/[0.07]" />
              <span className="relative grid h-10 w-10 place-items-center rounded-[11px] bg-teal-400/12 text-teal-300">{x.icon}</span>
              <h2 className="relative mt-4 font-display text-[1.25rem] font-semibold">{x.k}</h2>
              <p className="relative mt-2.5 max-w-xl text-[1.0625rem] leading-[1.7] text-white/75">{x.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* values */}
      <section className="bg-white py-16">
        <div className="shell">
          <SectionHeading eyebrow="What we hold to" title="Four values, and the behaviour each one costs us money on." lead="If a value never costs anything, it is a decoration." />
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {ABOUT.values.map((v, i) => (
              <article key={v.title} className={cx('group relative rounded-card border border-line p-6 transition hover:border-sky-300 hover:shadow-card', i % 3 === 1 && 'md:translate-y-6')}>
                <span className="font-display text-[2.5rem] font-semibold leading-none text-mist-200">0{i + 1}</span>
                <h3 className="mt-2 font-display text-[1.125rem] font-semibold text-navy-900">{v.title}</h3>
                <p className="mt-2 text-[.9375rem] leading-relaxed text-ink-600">{v.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* leadership */}
      <section className="border-t border-line bg-mist-50/60 py-16">
        <div className="shell">
          <SectionHeading eyebrow="Leadership" title="Nine people, most of whom you will meet at the gate eventually." action={<Button size="sm" variant="secondary" to="/careers">Work with them</Button>} />
          <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ABOUT.leadership.map((l, i) => (
              <article key={l.name} className="card flex flex-col overflow-hidden p-0">
                <div className="relative flex h-32 items-center justify-between gap-3 overflow-hidden bg-[linear-gradient(135deg,#0B2340_0%,#123A63_58%,#053B39_100%)] px-5">
                  <span className="font-display text-[2.25rem] font-bold leading-none tracking-[-0.03em] text-white/92">
                    {l.name.replace(/^Dr\.\s+/, '').split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </span>
                  <Sunburst size={44} className="text-gold-400/70 transition-transform duration-700 group-hover:rotate-45" />
                  <span className="absolute bottom-2.5 left-5 text-[.625rem] uppercase tracking-[0.18em] text-white/45">Since {l.since}</span>
                </div>
                <div className={cx('flex flex-1 flex-col p-5', i % 4 === 2 && 'xl:bg-white')}>
                  <h3 className="font-display text-[1.0625rem] font-semibold text-navy-900">{l.name}</h3>
                  <p className="mt-0.5 text-[.8125rem] font-medium text-teal-700">{l.role}</p>
                  <p className="mt-2.5 flex-1 text-[.875rem] leading-relaxed text-ink-600">{l.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* sustainability */}
      <section id="sustainability" className="scroll-mt-[calc(var(--nav)+1rem)] bg-white py-16">
        <div className="shell grid gap-10 lg:grid-cols-[minmax(0,.9fr)_1.1fr]">
          <div>
            <span className="grid h-10 w-10 place-items-center rounded-[11px] bg-teal-50 text-teal-700">
              <Leaf size={18} />
            </span>
            <h2 className="mt-4 font-display text-[clamp(1.625rem,3.4vw,2.375rem)] font-semibold leading-tight tracking-[-0.025em] text-navy-900">{ABOUT.sustainability.headline}</h2>
            <p className="mt-4 text-[1rem] leading-relaxed text-ink-600">{ABOUT.sustainability.note}</p>
            <div className="mt-6 rounded-card border border-line bg-mist-50 p-4">
              <p className="text-[.8125rem] font-semibold uppercase tracking-[0.1em] text-ink-400">Verified by</p>
              <p className="mt-1.5 text-[.875rem] leading-relaxed text-ink-600">
                IATA Environmental Assessment (level 3), ISO 14001 across all three maintenance bases, and an annual external audit of the conservation levy, published with the accounts.
              </p>
            </div>
            <Button variant="secondary" className="mt-6" to="/newsroom">
              Read the 2026 report
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {ABOUT.sustainability.points.map((p) => (
              <div key={p.label} className="card p-5">
                <p className="num font-display text-[1.75rem] font-semibold leading-none text-navy-900">{p.value}</p>
                <p className="mt-2 text-[.8125rem] font-semibold uppercase tracking-[0.08em] text-ink-500">{p.label}</p>
                <p className="mt-1.5 text-[.8125rem] leading-relaxed text-ink-500">{p.note}</p>
              </div>
            ))}
            <div className="rounded-card border border-line bg-white p-5 sm:col-span-2">
              <p className="text-[.8125rem] font-semibold uppercase tracking-[0.1em] text-ink-400">Progress to the 2030 target</p>
              <div className="mt-3 space-y-2.5">
                <Meter value={58} label="Absolute emissions reduction (target 32%)" tone="teal" />
                <Meter value={78} label="SAF offtake contracted for 2030 (target 100% of long-haul)" tone="navy" />
                <Meter value={91} label="Continent-based spend (target 95%)" tone="sky" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* safety */}
      <section id="safety" className="scroll-mt-[calc(var(--nav)+1rem)] border-y border-line bg-navy-900 py-16 text-white">
        <div className="shell grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <span className="grid h-10 w-10 place-items-center rounded-[11px] bg-white/8 text-teal-300">
              <ShieldCheck size={18} />
            </span>
            <h2 className="mt-4 font-display text-[clamp(1.625rem,3.4vw,2.375rem)] font-semibold leading-tight tracking-[-0.025em] text-white">{ABOUT.safety.headline}</h2>
            <div className="mt-5 space-y-4">
              {ABOUT.safety.body.map((p, i) => (
                <p key={i} className="text-[.9375rem] leading-[1.75] text-white/70">
                  {p}
                </p>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {ABOUT.safety.metrics.map((m) => (
              <div key={m.label} className="rounded-card border border-white/10 bg-white/[0.04] p-5">
                <p className="num font-display text-[1.375rem] font-semibold text-white">{m.value}</p>
                <p className="mt-1.5 text-[.8125rem] leading-snug text-white/55">{m.label}</p>
              </div>
            ))}
            <div className="rounded-card border border-teal-400/25 bg-teal-400/[0.07] p-5 sm:col-span-2">
              <Quote size={16} className="text-teal-300" />
              <p className="mt-2.5 text-[.9375rem] leading-relaxed text-white/85">
                “The captain may decline any schedule pressure without giving a reason. That sentence is in the operations manual, and it has been used 61 times this year — which we count as a good year.”
              </p>
              <p className="mt-3 text-[.75rem] uppercase tracking-[0.14em] text-teal-300">Zanele Mthembu · Chief Operating Officer</p>
            </div>
          </div>
        </div>
      </section>

      {/* responsibility */}
      <section className="bg-white py-16">
        <div className="shell">
          <SectionHeading eyebrow="On the continent" title="What we build here, not what we send." />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {ABOUT.responsibility.map((r, i) => (
              <article key={r.title} className="card flex flex-col p-5">
                <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-navy-50 text-navy-700">{[<Users size={16} />, <Building2 size={16} />, <Leaf size={16} />, <Wallet size={16} />][i]}</span>
                <h3 className="mt-3.5 font-display text-[1rem] font-semibold text-navy-900">{r.title}</h3>
                <p className="mt-2 flex-1 text-[.875rem] leading-relaxed text-ink-600">{r.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* fleet snapshot + investors */}
      <section className="border-t border-line bg-mist-50/60 py-16">
        <div className="shell grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <SectionHeading eyebrow="The fleet" title="46 aircraft, four types, one standard." action={<Button size="sm" variant="secondary" to="/fleet">Fleet page</Button>} className="[&_h2]:text-[1.5rem]" />
            <ul className="mt-6 space-y-3">
              {FLEET.map((f) => (
                <li key={f.id}>
                  <Link to={`/fleet/${f.id}`} className="group flex items-center gap-4 rounded-card border border-line bg-white p-3 transition hover:border-sky-300 hover:shadow-card">
                    <Photo src={f.img} alt={f.name} seed={f.id} className="h-16 w-24 shrink-0 rounded-[10px]" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[.9375rem] font-semibold text-navy-900">{f.name}</span>
                      <span className="num block text-[.8125rem] text-ink-500">
                        {f.delivered} in fleet · {f.capacity} seats · on-time {f.onTime}%
                      </span>
                    </span>
                    <ArrowRight size={16} className="shrink-0 text-ink-300 transition group-hover:translate-x-1 group-hover:text-navy-800" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div id="investors" className="scroll-mt-[calc(var(--nav)+1rem)]">
            <SectionHeading eyebrow="Investors" title="The numbers, quarterly." className="[&_h2]:text-[1.5rem]" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {INVESTOR.map((r) => (
                <div key={r.label} className="card p-4">
                  <p className="text-[.75rem] uppercase tracking-[0.1em] text-ink-400">{r.label}</p>
                  <p className="num mt-1 font-display text-[1.375rem] font-semibold text-navy-900">{r.value}</p>
                  <p className={cx('num mt-1 text-[.75rem] font-semibold', r.delta.startsWith('−') || r.delta.startsWith('-') ? 'text-red-600' : 'text-teal-700')}>{r.delta} year on year</p>
                </div>
              ))}
            </div>
            <Divider className="my-6" label="Calendar" />
            <ul className="space-y-2">
              {CALENDAR.map((c) => (
                <li key={c.date} className="flex items-center gap-3 rounded-[12px] border border-line bg-white px-3.5 py-2.5">
                  <Badge tone="neutral">{c.kind}</Badge>
                  <span className="text-[.875rem] font-medium text-navy-900">{c.label}</span>
                  <span className="num ml-auto text-[.75rem] text-ink-400">{c.date}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary">
                Results hub
              </Button>
              <Button size="sm" variant="ghost" icon={<Gauge size={14} />}>
                Monthly operations data
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* gallery */}
      <section className="bg-white py-16">
        <div className="shell">
          <SectionHeading eyebrow="Gallery" title="Nine pictures of a fourteen-year project." action={<Button size="sm" variant="secondary" to="/newsroom">Newsroom</Button>} />
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {GALLERY.map((g, i) => (
              <figure key={g.src + i} className={cx('group relative overflow-hidden rounded-[14px]', i === 0 && 'col-span-2 row-span-2')}>
                <Photo src={g.src} alt={g.caption} seed={g.src} className={cx('w-full', i === 0 ? 'h-full min-h-[260px]' : 'h-32 md:h-40')} imgClassName="object-cover transition-transform duration-[1200ms] group-hover:scale-110" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/90 to-transparent p-2.5 text-[.6875rem] leading-snug text-white opacity-0 transition group-hover:opacity-100">{g.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
