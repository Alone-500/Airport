import { Link } from 'react-router-dom';
import { ArrowUpRight, Bed, Briefcase, Clock, Coffee, Droplets, Luggage, MessageSquare, ShieldCheck, Sparkles, Users, Utensils, Video, Wine, Zap } from 'lucide-react';
import { cx } from '../../lib/utils';
import { CABINS, EXPERIENCES } from '../../data/experience';
import { Photo } from '../../components/brand/Brand';
import { Badge, Button, Divider, SectionHeading } from '../../components/ui/Primitives';
import { PageHero } from '../../components/layout/PublicLayout';

export const ICONS: Record<string, React.ReactNode> = {
  counter: <Users size={16} />,
  zap: <Zap size={16} />,
  wallet: <ShieldCheck size={16} />,
  users: <Users size={16} />,
  accessibility: <Users size={16} />,
  luggage: <Luggage size={16} />,
  utensils: <Utensils size={16} />,
  droplets: <Droplets size={16} />,
  bed: <Bed size={16} />,
  briefcase: <Briefcase size={16} />,
  baby: <Sparkles size={16} />,
  wine: <Wine size={16} />,
  video: <Video size={16} />,
  film: <Video size={16} />,
  headphones: <Users size={16} />,
  volume: <Clock size={16} />,
  mic: <Coffee size={16} />,
  coffee: <Coffee size={16} />,
  star: <Sparkles size={16} />,
  'shopping-basket': <Luggage size={16} />,
  heart: <ShieldCheck size={16} />,
  message: <MessageSquare size={16} />,
  clock: <Clock size={16} />,
  activity: <Zap size={16} />,
  wifi: <Zap size={16} />,
  shield: <ShieldCheck size={16} />,
  sunrise: <Sparkles size={16} />,
  sparkles: <Sparkles size={16} />,
  moon: <Bed size={16} />,
};

export default function Experience() {
  return (
    <div>
      <PageHero
        tone="white"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Experience' }]}
        eyebrow="The experience"
        title="What “premium” means when nobody is watching."
        lead="Six pages about the parts of the journey you can choose: the terminal, the lounge, the seat, the food, the internet, and how well you sleep. Written by the people who run them."
        height="sm"
      >
        <div className="mt-6 flex flex-wrap gap-2">
          {EXPERIENCES.map((e) => (
            <Link key={e.slug} to={`/experience/${e.slug}`} className="rounded-pill border border-navy-200 bg-white px-3 py-1.5 text-[.8125rem] font-semibold text-navy-800 transition hover:border-navy-800">
              {e.title}
            </Link>
          ))}
        </div>
      </PageHero>

      {/* cabins first */}
      <section className="bg-white py-14">
        <div className="shell">
          <SectionHeading eyebrow="Three cabins" title="Pick how you want to arrive." lead="Same crews, same bags that arrive, same safety record. What changes is the bed." action={<Button size="sm" variant="secondary" to="/cabins/business">Compare with Business</Button>} />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {CABINS.map((c, i) => (
              <article key={c.slug} className={cx('group relative flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition hover:shadow-lift', i === 1 && 'lg:-translate-y-5')}>
                <div className="relative h-48 overflow-hidden">
                  <Photo src={c.img} alt={c.name} seed={c.slug} className="h-full w-full" imgClassName="transition-transform duration-[1200ms] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
                  <div className="absolute bottom-3 left-4 text-white">
                    <p className="font-display text-[1.25rem] font-semibold">{c.name}</p>
                    <p className="num text-[.75rem] text-white/70">{c.perAircraft.filter((a) => a.seats > 0).length} aircraft types</p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[.9375rem] leading-relaxed text-ink-600">{c.tagline}</p>
                  <p className="mt-3 flex items-center gap-2 text-[.8125rem] font-medium text-navy-900">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                    {c.hero}
                  </p>
                  <ul className="mt-4 flex-1 space-y-1.5">
                    {c.includes.slice(0, 4).map((x) => (
                      <li key={x} className="flex gap-2 text-[.8125rem] leading-snug text-ink-500">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-navy-300" /> {x}
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" variant="secondary" className="mt-5 w-full" to={`/cabins/${c.slug}`}>
                    Inside {c.name}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* experience pages */}
      <section className="border-t border-line bg-mist-50/60 py-14">
        <div className="shell">
          <SectionHeading eyebrow="On the ground and in the air" title="Six things we obsess about." />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {EXPERIENCES.map((e, i) => (
              <Link
                key={e.slug}
                to={`/experience/${e.slug}`}
                className={cx(
                  'group relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-card border border-line bg-white p-5 transition hover:border-sky-300 hover:shadow-card',
                  i === 4 && 'xl:col-span-2',
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="eyebrow">{e.kicker}</p>
                      <h3 className="mt-2 font-display text-[1.25rem] font-semibold text-navy-900">{e.title}</h3>
                    </div>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mist-100 text-navy-700 transition group-hover:bg-navy-800 group-hover:text-white">
                      <ArrowUpRight size={15} />
                    </span>
                  </div>
                  <p className="mt-3 max-w-lg text-[.875rem] leading-relaxed text-ink-600">{e.hero}</p>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {e.pillars.slice(0, 3).map((p) => (
                    <span key={p.title} className="rounded-pill bg-mist-100 px-2.5 py-1 text-[.6875rem] font-medium text-ink-600">
                      {p.stat ?? p.title}
                    </span>
                  ))}
                  <Badge tone="neutral" className="ml-auto">
                    {e.pillars.length} details
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
          <Divider className="my-10" label="Numbers we publish" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['24 min', 'kerb to seat at Accra, median'],
              ['99.2%', 'assistance promise met'],
              ['380 hrs', 'of free entertainment'],
              ['9 African', 'wine bottles on the long-haul list'],
            ].map(([v, l]) => (
              <div key={l} className="rounded-card border border-line bg-white p-5">
                <p className="num font-display text-[1.75rem] font-semibold text-navy-900">{v}</p>
                <p className="mt-1 text-[.8125rem] leading-snug text-ink-500">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
