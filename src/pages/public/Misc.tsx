import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Compass, Home, Search } from 'lucide-react';
import { STORIES } from '../../data/content';
import { Photo, WingMark } from '../../components/brand/Brand';
import { Button, Divider, NovaRule, SectionHeading } from '../../components/ui/Primitives';
import { Breadcrumbs } from '../../components/ui/Overlay';
import { StoryCard } from '../../components/airline/Cards';
import { useHashScroll } from '../../components/ui/RouteSkeleton';

/* ------------------------------------------------------------------ */
export default function NotFound() {
  const nav = useNavigate();
  return (
    <section className="relative isolate flex min-h-[80vh] items-center overflow-hidden bg-navy-950 py-20 text-white">
      <img src="/img/fleet.jpg" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 -z-10 bg-navy-950/70" />
      <WingMark className="pointer-events-none absolute -left-8 bottom-8 h-28 w-[520px] text-white/[0.06]" />
      <div className="shell relative">
        <p className="num font-display text-[clamp(4rem,14vw,9rem)] font-bold leading-none tracking-[-0.04em] text-white/15">404</p>
        <div className="mt-4 max-w-xl">
          <p className="eyebrow text-teal-300">Off the published route</p>
          <h1 className="mt-3 font-display text-[clamp(1.75rem,4.6vw,2.75rem)] font-semibold leading-tight">That page is not in the timetable.</h1>
          <p className="mt-3 text-[1rem] leading-relaxed text-white/70">
            Either the link is old, or we moved it during the site rebuild. Both are fixable in about four seconds from here.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Button variant="onDark" onClick={() => nav('/')} icon={<Home size={16} />}>
              Back to the homepage
            </Button>
            <Button variant="ghost" className="border border-white/25 text-white hover:bg-white/10" onClick={() => nav('/search?from=ACC&to=LOS')} icon={<Search size={16} />}>
              Search flights
            </Button>
            <Button variant="ghost" className="border border-white/25 text-white hover:bg-white/10" onClick={() => nav('/destinations')} icon={<Compass size={16} />}>
              Destinations
            </Button>
          </div>
          <Divider className="my-7 !bg-white/12" label="Popular pages" />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Manage a booking', '/manage-booking'],
              ['Flight status', '/flight-status'],
              ['Online check-in', '/check-in'],
              ['Help centre', '/help'],
            ].map(([l, to]) => (
              <button key={l} onClick={() => nav(to)} className="group flex items-center justify-between gap-2 rounded-[12px] border border-white/12 bg-white/[0.04] px-3.5 py-2.5 text-left text-[.875rem] font-medium transition hover:border-teal-400/50 hover:bg-white/[0.08]">
                {l}
                <ArrowRight size={14} className="text-white/40 transition group-hover:translate-x-0.5 group-hover:text-teal-300" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
export function StoryPage() {
  useHashScroll();
  const { id } = useParams();
  const s = STORIES.find((x) => x.id === id) ?? STORIES[0];
  const others = STORIES.filter((x) => x.id !== s.id);

  return (
    <article>
      <header className="relative isolate overflow-hidden bg-navy-950 pb-14 pt-[calc(var(--nav)+3rem)] text-white">
        <Photo src={s.img} alt="" seed={s.id} className="absolute inset-0 -z-10" imgClassName="h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/30" />
        <div className="shell">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Newsroom', to: '/newsroom' }, { label: s.title }]} dark className="mb-6" />
          <div className="max-w-3xl">
            <p className="eyebrow text-teal-300">{s.eyebrow}</p>
            <h1 className="mt-4 font-display text-[clamp(2rem,5.6vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-white">{s.title}</h1>
            <p className="mt-4 text-[1.125rem] leading-relaxed text-white/75">{s.standfirst}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[.8125rem] text-white/55">
              <span className="font-medium text-white/85">{s.author}</span>
              <span>{s.minutes} min read</span>
              <span>{s.city}</span>
              <button onClick={() => navigator.clipboard?.writeText(location.href)} className="ml-auto rounded-pill border border-white/20 px-3 py-1 font-semibold text-white/80 transition hover:border-teal-400 hover:text-white">
                Copy link
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white py-14">
        <div className="shell grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="mx-auto max-w-2xl">
            {s.body.map((p, i) => (
              <div key={i}>
                <p className="text-[1.0625rem] leading-[1.85] text-ink-700">{p}</p>
                {i === 1 && s.pull && (
                  <blockquote className="my-8 border-l-2 border-teal-500 pl-5 font-display text-[1.375rem] font-medium leading-snug tracking-[-0.01em] text-navy-900">“{s.pull}”</blockquote>
                )}
                {i === 2 && (
                  <figure className="my-8">
                    <Photo src={s.img} alt="" seed={s.id + 'fig'} className="aspect-[16/10] rounded-card" imgClassName="object-cover" />
                    <figcaption className="mt-2 text-[.8125rem] text-ink-400">{s.title} · photographed on the {s.city} rotation</figcaption>
                  </figure>
                )}
              </div>
            ))}
            <NovaRule className="mt-10" />
            <p className="mt-4 text-[.875rem] text-ink-500">
              Written by {s.author}. Published {s.date}. AeroNova is a fictional airline created as a design demonstration; the operational detail is invented but written to be plausible.
            </p>
          </div>
          <aside className="lg:sticky lg:top-[calc(var(--nav)+16px)] lg:self-start">
            <div className="card p-4">
              <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-ink-400">More from the logbook</p>
              <ul className="mt-3 space-y-4">
                {others.map((o) => (
                  <li key={o.id}>
                    <StoryCard story={o} layout="wide" />
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <section className="border-t border-line bg-mist-50/60 py-12">
        <div className="shell">
          <SectionHeading eyebrow="Keep reading" title="Three more, from the same desk." className="[&_h2]:text-[1.5rem]" />
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {others.map((o) => (
              <StoryCard key={o.id} story={o} />
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
