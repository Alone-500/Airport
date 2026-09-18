import {useEffect, useMemo, useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, Clock, Headphones, Luggage, Utensils, Plane, PlaneTakeoff,
  ShieldCheck, Sparkles, Star, Ticket, TrainFront, Users, Wifi,
} from 'lucide-react';
import { cx, durationLabel, money, toISODate, DAY, parseISODate } from '../../lib/utils';
import { Button, Badge, Eyebrow, SectionHeading, NovaRule, Meter } from '../../components/ui/Primitives';
import { Section } from '../../components/ui/Primitives';
import { SegmentedControl } from '../../components/ui/Form';
import { FlightSearchWidget } from '../../components/booking/FlightSearchWidget';
import { DestinationCard, OfferCard, StoryCard } from '../../components/airline/Cards';
import { FlightCard } from '../../components/booking/FlightCard';
import { NetworkMap } from '../../components/airline/NetworkMap';
import { Photo, RouteArc, Sunburst, WingMark } from '../../components/brand/Brand';
import { DESTINATIONS } from '../../data/destinations';
import { OFFERS } from '../../data/offers';
import { STORIES, TRAVEL_SECTIONS } from '../../data/content';
import type { SearchQuery } from '../../types';
import { FLEET } from '../../data/fleet';
import { statusBoard } from '../../data/flights';
import { useStore } from '../../store/store';

/* ------------------------------------------------------------------ */
function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);
  const { prefs } = useStore();

  return (
    <section className="relative isolate overflow-hidden bg-navy-950 pb-28 pt-[calc(var(--nav)+2.5rem)] sm:pb-32 lg:pb-40 lg:pt-[calc(var(--nav)+5rem)]">
      <div className="absolute inset-0">
        <img src="/img/hero.jpg" alt="AeroNova A330neo parked at the Galaxy terminal at first light" className={cx('h-full w-full object-cover object-[60%_65%] transition-all duration-[1400ms]', loaded ? 'scale-100 opacity-100' : 'scale-[1.06] opacity-0')} />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(4,16,31,.94)_0%,rgba(4,16,31,.8)_38%,rgba(4,16,31,.25)_72%,rgba(4,16,31,.45)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-950 to-transparent" />
      </div>

      <div className="relative shell">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)] lg:gap-16">
          <div className={cx('transition-all duration-700', loaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0')}>
            <div className="flex items-center gap-3">
              <Sunburst size={26} className="text-gold-400" />
              <p className="font-display text-[.6875rem] font-semibold uppercase tracking-[0.28em] text-white/70">AeroNova Airways · Est. 2009 · Accra</p>
            </div>
            <h1 className="mt-5 text-[clamp(2.7rem,7.2vw,5.6rem)] font-semibold leading-[0.94] tracking-[-0.035em] text-white">
              Beyond
              <br />
              Every
              <span className="relative ml-3 inline-block">
                Horizon
                <svg viewBox="0 0 300 24" className="absolute -bottom-2 left-0 h-3 w-full text-teal-400" preserveAspectRatio="none" aria-hidden>
                  <path d="M2 18 C 80 4, 210 4, 298 14" stroke="currentColor" strokeWidth="3.4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-white/72 sm:text-[1.125rem]">
              Forty-one destinations across Africa, Europe, the Middle East, Asia and North America — on African steel, African crews, and a punctuality record we publish every month.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" variant="onDark" onClick={() => document.getElementById('book')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                Search flights
              </Button>
              <Link to="/destinations" className="group inline-flex items-center gap-2 text-[.9375rem] font-semibold text-white/85 underline decoration-white/25 decoration-1 underline-offset-[6px] transition hover:text-white hover:decoration-teal-400">
                Explore the network
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-2 gap-x-6 gap-y-4 border-t border-white/12 pt-6 sm:grid-cols-4">
              {[
                ['87.9%', 'on-time, 15-min'],
                ['4.7 yrs', 'average fleet age'],
                ['41', 'destinations'],
                ['46', 'aircraft'],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="num font-display text-[1.375rem] font-semibold text-white">{v}</dt>
                  <dd className="mt-0.5 text-[.75rem] uppercase tracking-[0.08em] text-white/45">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* floating side card */}
          <div className={cx('hidden transition-all delay-150 duration-700 lg:block', loaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0')}>
            <div className="relative ml-auto w-full max-w-[352px]">
              <div className="absolute -inset-3 rounded-[26px] bg-white/5 backdrop-blur-[2px]" aria-hidden />
              <div className="relative overflow-hidden rounded-[22px] border border-white/12 bg-navy-900/60 p-5 text-white backdrop-blur-xl">
                <p className="eyebrow flex items-center justify-between !text-teal-300">
                  Live from Kotoka <span className="flex items-center gap-1.5 text-white/60"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />now</span>
                </p>
                <p className="mt-3 font-display text-[1.0625rem] font-semibold leading-snug">Next 4 departures</p>
                <ul className="mt-3 space-y-2.5">
                  {statusBoard(toISODate(new Date()), 'ACC')
                    .slice(0, 4)
                    .map((f) => (
                      <li key={f.flightNo} className="flex items-center gap-3 rounded-[12px] border border-white/8 bg-white/[0.04] px-3 py-2">
                        <span className="num font-display text-[.8125rem] font-semibold">{f.flightNo}</span>
                        <span className="text-[.8125rem] text-white/70">{f.destination}</span>
                        <span className="num ml-auto text-[.8125rem] font-medium">{new Date(f.schedDep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className={cx('rounded-pill px-2 py-0.5 text-[.625rem] font-semibold uppercase tracking-wide', f.status === 'ON_TIME' ? 'bg-teal-400/18 text-teal-200' : f.status === 'DELAYED' ? 'bg-gold-400/20 text-gold-300' : 'bg-white/10 text-white/70')}>
                          {f.status.replace('_', ' ')}
                        </span>
                      </li>
                    ))}
                </ul>
                <Link to="/flight-status" className="mt-4 flex items-center justify-between rounded-[12px] bg-white/8 px-3 py-2.5 text-[.8125rem] font-semibold transition hover:bg-white/14">
                  Track any flight <ArrowRight size={15} />
                </Link>
                <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 text-[.75rem] text-white/50">
                  <ShieldCheck size={14} className="text-teal-300" />
                  Free rebooking on any disruption over 4 hours
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a href="#book" className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-white/45 transition hover:text-white md:flex" aria-label="Scroll to flight search">
        <span className="text-[.625rem] uppercase tracking-[0.3em]">Search</span>
        <span className="relative h-8 w-px bg-gradient-to-b from-white/50 to-transparent" />
      </a>

      {/* currency note */}
      <p className="relative mt-6 text-center text-[.6875rem] uppercase tracking-[0.2em] text-white/30 lg:hidden">Prices shown in {prefs.currency}</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
function BookingBlock() {
  return (
    <div id="book" className="relative z-10 -mt-[104px] px-gutter sm:-mt-[132px] lg:-mt-[148px]">
      <div className="mx-auto w-full max-w-shell">
        <FlightSearchWidget variant="hero" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function Ticker() {
  const items = [
    { icon: <Ticket size={14} />, label: 'Accra → Lagos', value: 'from ' + money(179), to: '/search' },
    { icon: <Plane size={14} />, label: 'Accra → London', value: 'from ' + money(649), to: '/search' },
    { icon: <Sparkles size={14} />, label: 'Business to Dubai', value: '40% off', to: '/offers' },
    { icon: <Clock size={14} />, label: 'Check-in opens', value: '48 h before', to: '/check-in' },
    { icon: <Luggage size={14} />, label: 'Pre-paid bags', value: '35% less', to: '/travel-information/baggage' },
    { icon: <Star size={14} />, label: 'Double points', value: 'long-haul Mon–Thu', to: '/loyalty' },
  ];
  return (
    <div className="border-y border-line bg-mist-50">
      <div className="shell flex items-center gap-6 overflow-x-auto py-3 no-scrollbar">
        {items.map((i) => (
          <Link key={i.label} to={i.to} className="group flex shrink-0 items-center gap-2 text-[.8125rem] text-ink-600 transition hover:text-navy-900">
            <span className="text-teal-600">{i.icon}</span>
            <span className="font-medium">{i.label}</span>
            <span className="num font-display font-semibold text-navy-900">{i.value}</span>
            <ArrowRight size={13} className="opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function DestinationsBento() {
  const [region, setRegion] = useState<'Africa' | 'Europe' | 'Middle East' | 'Asia' | 'North America' | 'All'>('Africa');
  const list = useMemo(() => (region === 'All' ? DESTINATIONS : DESTINATIONS.filter((d) => d.region === region)), [region]);
  const hero = list[0];
  const rest = list.slice(1, 6);
  const { prefs } = useStore();

  return (
    <Section tone="white" id="destinations">
      <div className="shell">
        <SectionHeading
          eyebrow="Where we fly"
          title={
            <>
              Forty-one cities.
              <br className="hidden sm:block" /> One airline that knows them.
            </>
          }
          lead="Every destination on this page is served by our own aircraft and our own crews — no codeshare roulette, no overnight in a third country."
          action={
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <SegmentedControl
                size="sm"
                value={region}
                onChange={setRegion}
                options={[
                  { id: 'Africa', label: 'Africa' },
                  { id: 'Europe', label: 'Europe' },
                  { id: 'Middle East', label: 'Middle East' },
                  { id: 'Asia', label: 'Asia' },
                  { id: 'North America', label: 'N. America' },
                  { id: 'All', label: 'All' },
                ]}
              />
              <Link to="/destinations" className="group inline-flex items-center gap-1.5 text-[.875rem] font-semibold text-navy-800">
                All destinations <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          }
        />

        {hero && (
          <div className="mt-10 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            {/* hero destination — layered, asymmetric */}
            <div className="group relative min-h-[440px] overflow-hidden rounded-card cut-tr">
              <Photo src={hero.img} alt={`${hero.city}`} seed={hero.slug} className="absolute inset-0 h-full w-full" imgClassName="transition-transform duration-[1400ms] group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/92 via-navy-950/30 to-navy-950/10" />
              <div className="relative flex h-full flex-col justify-end p-6 text-white sm:p-8">
                <p className="eyebrow text-teal-300">{hero.region} · {hero.code}</p>
                <h3 className="mt-3 font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-semibold leading-[1.02]">{hero.city}</h3>
                <p className="mt-1 text-[.9375rem] text-white/65">{hero.tagline}</p>
                <p className="mt-4 max-w-md text-[.9375rem] leading-relaxed text-white/75">{hero.blurb}</p>
                <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                  <div className="flex gap-6">
                    <p>
                      <span className="block text-[.6875rem] uppercase tracking-[0.14em] text-white/45">from</span>
                      <span className="num font-display text-[1.5rem] font-semibold">{money(hero.startFare, prefs.currency)}</span>
                    </p>
                    <p>
                      <span className="block text-[.6875rem] uppercase tracking-[0.14em] text-white/45">flight time</span>
                      <span className="num font-display text-[1.5rem] font-semibold">{hero.durationMin ? durationLabel(hero.durationMin) : '—'}</span>
                    </p>
                    <p className="hidden sm:block">
                      <span className="block text-[.6875rem] uppercase tracking-[0.14em] text-white/45">weekly</span>
                      <span className="num font-display text-[1.5rem] font-semibold">{hero.weekly}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="onDark" onClick={() => (window.location.href = `/search?to=${hero.code}&from=ACC`)}>
                      Search flights
                    </Button>
                    <Button size="sm" variant="ghost" className="border border-white/25 text-white hover:bg-white/10" to={`/destinations/${hero.slug}`}>
                      Guide
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {rest.slice(0, 4).map((d, i) => (
                <DestinationCard key={d.slug} d={d} className={cx(i === 1 && 'lg:translate-y-6', i === 3 && 'lg:-translate-y-2')} />
              ))}
            </div>
          </div>
        )}

        {/* network map */}
        <div className="relative mt-12 overflow-hidden rounded-card border border-line bg-[#F4F8FC] p-5 sm:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-[0.35] texture-dots" aria-hidden />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-center">
            <div>
              <Eyebrow>The network</Eyebrow>
              <h3 className="h-2 mt-3">Three hubs, one clock.</h3>
              <p className="lead mt-3 text-[.9375rem]">
                Accra for the West, Nairobi for the East, Johannesburg for the south. Long-haul departs in the evening banks so you land at the start of a working day, not the end of one.
              </p>
              <ul className="mt-5 space-y-2.5 text-[.875rem]">
                {[
                  ['ACC', 'Kotoka Intl', '22 routes · 46 daily'],
                  ['NBO', 'Jomo Kenyatta', '14 routes · 34 daily'],
                  ['JNB', 'O.R. Tambo', '9 routes · 19 daily'],
                ].map(([c, n, s]) => (
                  <li key={c} className="flex items-center gap-3 border-b border-line/80 pb-2.5">
                    <span className="num grid h-8 w-11 place-items-center rounded-[9px] bg-navy-800 font-display text-[.75rem] font-bold text-gold-400">{c}</span>
                    <span className="font-medium text-navy-900">{n}</span>
                    <span className="num ml-auto text-ink-500">{s}</span>
                  </li>
                ))}
              </ul>
              <Button size="sm" variant="secondary" className="mt-5" to="/destinations" iconRight={<ArrowRight size={15} />}>
                Open the full route map
              </Button>
            </div>
            <NetworkMap className="w-full" />
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
function Deals() {
  const [filter, setFilter] = useState<'all' | 'flight' | 'business' | 'family'>('all');
  const list = OFFERS.filter((o) => filter === 'all' || o.kind === filter);
  return (
    <Section tone="mist" id="deals">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:items-end">
          <SectionHeading
            eyebrow="Featured fares"
            title="Real prices, with the small print up front."
            lead="Every fare below is loaded into the search engine. Book it and it will still cost what the card says — including the bag, or the honest absence of one."
            className="mb-0"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
            <SegmentedControl
              size="sm"
              value={filter}
              onChange={setFilter}
              options={[
                { id: 'all', label: 'All' },
                { id: 'flight', label: 'Flight deals' },
                { id: 'business', label: 'Business' },
                { id: 'family', label: 'Family' },
              ]}
            />
            <Button size="sm" variant="secondary" to="/offers" iconRight={<ArrowUpRight size={15} />}>
              All 8 offers
            </Button>
          </div>
        </div>

        <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((o, i) => (
            <div key={o.id} className={cx(i === 1 && 'xl:translate-y-7', i === 2 && 'xl:-translate-y-3')}>
              <OfferCard o={o} />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
function WhyFly() {
  const nav = useNavigate();
  const reasons = [
    { icon: <Clock size={18} />, k: '87.9%', t: 'On time, by the 15-minute rule', b: 'Published monthly, per station. When we miss it, the app tells you before the airport does — and pays the hotel.' },
    { icon: <Luggage size={18} />, k: '94%', t: 'Bags that arrive on the first flight', b: 'Every bag is scanned four times. If a bag misses you, an agent owns it by name and interim expenses are same-day.' },
    { icon: <PlaneTakeoff size={18} />, k: '4.7 yrs', t: 'Fleet age, and 46 of them', b: 'The youngest widebody fleet on the continent, all with seatback or stream entertainment and power at every seat.' },
    { icon: <ShieldCheck size={18} />, k: '0', t: 'Serious incidents in ten years', b: 'Five clean IOSA renewals, 8,412 voluntary crew reports last year, and nobody ever disciplined for filing one.' },
    { icon: <Users size={18} />, k: '94%', t: 'Crew born on the continent', b: 'Trained in Accra, hired locally, and paid the same as their European counterparts — which is why the cabin feels different.' },
  ];
  return (
    <Section tone="navy" className="relative overflow-hidden !bg-navy-900">
      <WingMark className="pointer-events-none absolute -left-16 top-6 h-32 w-[520px] text-white/[0.06]" />
      <div className="shell relative grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
        <div>
          <p className="eyebrow text-teal-300">Why fly with AeroNova</p>
          <h2 className="h-1 mt-4 text-white">
            We publish the numbers
            <br />
            other airlines hide.
          </h2>
          <p className="mt-5 max-w-lg text-[1.0625rem] leading-relaxed text-white/70">
            A premium airline is not marble floors and a longer bread roll. It is a bag that arrives, a gate that is close, a delay that is answered by a human within 90 seconds.
          </p>
          <div className="mt-8 overflow-hidden rounded-[18px] border border-white/10">
            <Photo src="/img/fleet.jpg" alt="Wing and engine above the clouds at sunrise" seed="fleet" className="h-52 w-full" imgClassName="object-cover" />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="onDark" onClick={() => nav('/about')}>
              Our story
            </Button>
            <Button variant="ghost" className="border border-white/20 text-white hover:bg-white/10" to="/about#safety">
              Safety record
            </Button>
          </div>
        </div>

        <ul className="space-y-3">
          {reasons.map((r, i) => (
            <li key={r.t} className="group relative overflow-hidden rounded-card border border-white/10 bg-white/[0.035] p-5 transition-colors hover:bg-white/[0.07]" style={{ marginLeft: `${(i % 2) * 18}px` }}>
              <div className="flex items-start gap-4">
                <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-teal-400/12 text-teal-300">{r.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="num font-display text-[1.5rem] font-semibold leading-none text-white">{r.k}</p>
                  <h3 className="mt-2 font-display text-[1rem] font-semibold text-white">{r.t}</h3>
                  <p className="mt-1.5 text-[.875rem] leading-relaxed text-white/60">{r.b}</p>
                </div>
                <span className="hidden shrink-0 self-center font-display text-[.6875rem] uppercase tracking-[0.2em] text-white/25 sm:block">0{i + 1}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
function Cabins() {
  const [tab, setTab] = useState<'ECONOMY' | 'PREMIUM' | 'BUSINESS'>('ECONOMY');
  const data = {
    ECONOMY: {
      name: 'Economy',
      img: '/img/cabin-economy.jpg',
      slug: 'economy',
      lead: 'Slimline seats, 32" pitch on widebodies, and a hot meal that is actually hot. The buy-on-board menu is short and good.',
      specs: [['Pitch', '31–32"'], ['Seat width', '18"'], ['Baggage', 'up to 2 × 23 kg'], ['Screen', '4K seatback or stream'], ['Power', 'USB-C 45–61 W']],
      perks: ['Nova Play: 380+ hours', 'Barista coffee on all long-haul', 'Kids’ meal & bassinet rows'],
    },
    PREMIUM: {
      name: 'Premium Economy',
      img: '/img/cabin-premium.jpg',
      slug: 'premium-economy',
      lead: 'The row you actually want. Six-way recline, a calf rest, and an aisle you do not have to climb over.',
      specs: [['Pitch', '37–38"'], ['Recline', '6" · 6-way'], ['Baggage', '2 × 23 kg'], ['Dining', 'Two courses on chinaware'], ['Boarding', 'Group 1']],
      perks: ['Dedicated check-in row', 'Amenity kit + memory-foam pillow', 'Priority baggage tags'],
    },
    BUSINESS: {
      name: 'Nova Business',
      img: '/img/cabin-business.jpg',
      slug: 'business',
      lead: 'Lie-flat suites with closing doors, dine-anytime service, shower suites at the hub, and a car to your door.',
      specs: [['Bed', '80" flat'], ['Access', '1-2-1 every seat aisle'], ['Baggage', '3 × 32 kg'], ['Dining', 'À la carte, any hour'], ['Wi-Fi', 'Unlimited Pro']],
      perks: ['Galaxy Lounge + showers', 'Fast track at both ends', 'Chauffeured hub transfer'],
    },
  }[tab];

  return (
    <Section tone="white">
      <div className="shell">
        <SectionHeading
          eyebrow="The cabins"
          title="Three ways to cross a continent."
          lead="Same crews, same safety standards, same bags that arrive. What changes is how you sleep."
          action={
            <div className="flex flex-wrap gap-2">
              {(['ECONOMY', 'PREMIUM', 'BUSINESS'] as const).map((c) => (
                <button key={c} onClick={() => setTab(c)} className={cx('rounded-pill border px-4 py-2 font-display text-[.8125rem] font-semibold transition', tab === c ? 'border-navy-800 bg-navy-800 text-white' : 'border-line text-ink-600 hover:border-navy-300')}>
                  {data && { ECONOMY: 'Economy', PREMIUM: 'Premium Economy', BUSINESS: 'Nova Business' }[c]}
                </button>
              ))}
            </div>
          }
        />

        <div className="relative mt-10 grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-stretch">
          <div className="relative overflow-hidden rounded-card cut-bl shadow-card">
            <Photo src={data.img} alt={`${data.name} cabin`} seed={data.slug} className="h-full min-h-[300px] w-full" imgClassName="object-cover transition-transform duration-[1200ms] hover:scale-[1.03]" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/90 to-transparent p-6 pt-16">
              <p className="eyebrow text-teal-300">{data.name}</p>
              <p className="mt-2 max-w-lg text-[1.0625rem] leading-relaxed text-white/85">{data.lead}</p>
            </div>
          </div>

          <div className="relative">
            <div className="card p-6">
              <h3 className="h-3">Inside {data.name}</h3>
              <dl className="mt-4 space-y-3">
                {data.specs.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line pb-2.5">
                    <dt className="text-[.8125rem] uppercase tracking-[0.08em] text-ink-400">{k}</dt>
                    <dd className="num text-right font-display text-[.9375rem] font-semibold text-navy-900">{v}</dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-5 space-y-2">
                {data.perks.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-[.875rem] text-ink-600">
                    <BadgeCheck size={16} className="mt-0.5 shrink-0 text-teal-600" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <Button size="sm" to={`/cabins/${data.slug}`}>
                  Full cabin page
                </Button>
                <Button size="sm" variant="secondary" to="/search">
                  See fares
                </Button>
              </div>
            </div>
            {/* overlapping amenity chip card */}
            <div className="absolute -bottom-6 -left-4 hidden w-[220px] rounded-[16px] border border-line bg-white p-4 shadow-lift sm:block">
              <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-ink-400">Included on every flight</p>
              <div className="mt-3 space-y-2.5 text-[.8125rem] text-ink-600">
                <p className="flex items-center gap-2"><Headphones size={15} className="text-navy-700" /> Nova Play entertainment</p>
                <p className="flex items-center gap-2"><Utensils size={15} className="text-navy-700" /> Free meal from Classic</p>
                <p className="flex items-center gap-2"><Wifi size={15} className="text-navy-700" /> Wi-Fi from $9</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
function Loyalty() {
  const [spend, setSpend] = useState(2400);
  const [routes, setRoutes] = useState(6);
  const pts = Math.round(spend * 1.0 + routes * 2000 + (routes >= 4 ? 4000 : 0));
  const { user } = useStore();
  return (
    <Section tone="white" className="relative overflow-hidden">
      <div className="shell">
        <div className="relative overflow-hidden rounded-[24px] bg-navy-900 text-white">
          <div className="pointer-events-none absolute inset-0 opacity-[0.09] texture-grid" />
          <RouteArc className="pointer-events-none absolute -right-6 -top-4 h-40 w-[420px] text-teal-400/40" />
          <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.05fr_1fr] lg:p-12">
            <div>
              <p className="eyebrow text-gold-400">AeroNova Rewards</p>
              <h2 className="h-1 mt-3 text-white">
                Points that do not
                <br />
                expire out of spite.
              </h2>
              <p className="mt-4 max-w-lg text-[1rem] leading-relaxed text-white/70">
                One point per dollar, a 36-month clock that resets on any flight, and a Family Pool of five. No Medallion-style cliff, no blackout dates above Elite.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  ['Explorer', 'Join free, earn from the first seat'],
                  ['Voyager', '30,000 pts · +15% bonus'],
                  ['Elite', '60,000 pts · fast track + lounge'],
                  ['Elite Plus', '110,000 pts · upgrades for guests'],
                ].map(([t, d], i) => (
                  <div key={t} className={cx('rounded-[14px] border p-3.5 transition hover:bg-white/[0.06]', i % 2 ? 'border-white/8 bg-white/[0.03]' : 'border-teal-400/25 bg-teal-400/[0.06]')}>
                    <p className="flex items-center gap-2 font-display text-[.9375rem] font-semibold">
                      <Sunburst size={14} className={i >= 2 ? 'text-gold-400' : 'text-teal-300'} /> {t}
                    </p>
                    <p className="mt-1 text-[.8125rem] text-white/60">{d}</p>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button variant="onDark" to="/loyalty">
                  Programme overview
                </Button>
                <Button variant="ghost" className="border border-white/20 text-white hover:bg-white/10" to={user ? '/account/rewards' : '/sign-in'}>
                  {user ? 'My balance' : 'Join — it takes a minute'}
                </Button>
              </div>
            </div>

            <div className="rounded-[20px] border border-white/12 bg-white/[0.05] p-5 backdrop-blur-sm sm:p-7">
              <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-teal-300">Points calculator</p>
              <p className="mt-2 text-[.875rem] text-white/60">Drag your year. The number is what you would actually bank, tier bonus included.</p>
              <div className="mt-6 space-y-6">
                <label className="block">
                  <span className="flex items-baseline justify-between text-[.875rem] font-medium">
                    <span>Spent on AeroNova fares</span>
                    <span className="num font-display text-[1rem] text-white">{money(spend)}</span>
                  </span>
                  <input type="range" min={400} max={20000} step={200} value={spend} onChange={(e) => setSpend(Number(e.target.value))} className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-teal-400" aria-label="Annual spend" />
                </label>
                <label className="block">
                  <span className="flex items-baseline justify-between text-[.875rem] font-medium">
                    <span>Sectors flown</span>
                    <span className="num font-display text-[1rem] text-white">{routes}</span>
                  </span>
                  <input type="range" min={1} max={40} value={routes} onChange={(e) => setRoutes(Number(e.target.value))} className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-teal-400" aria-label="Sectors flown" />
                </label>
              </div>
              <div className="mt-7 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
                <div>
                  <p className="text-[.75rem] uppercase tracking-[0.14em] text-white/45">Estimated balance</p>
                  <p className="num font-display text-[2.5rem] font-semibold leading-none text-white">{pts.toLocaleString()}</p>
                  <p className="mt-1 text-[.75rem] text-teal-300">{routes >= 4 ? 'Voyager tier reached' : routes >= 2 ? 'Explorer, close to Voyager' : 'Explorer'} · +{routes >= 4 ? 15 : 0}% bonus</p>
                </div>
                <div className="text-right">
                  <p className="text-[.75rem] uppercase tracking-[0.14em] text-white/45">Worth</p>
                  <p className="num font-display text-[1.25rem] font-semibold text-white">{money(pts / 45)}</p>
                  <p className="text-[.6875rem] text-white/40">≈ {Math.max(1, Math.round(pts / 12000))} award seat(s)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
function Stories() {
  const [a, b, c] = STORIES;
  return (
    <Section tone="mist">
      <div className="shell">
        <SectionHeading eyebrow="The logbook" title="Written by people who work the routes." lead="Long-form from our operations desk, our kitchens and the people who sit in row 12. Published twice a month." action={<Button size="sm" variant="secondary" to="/newsroom" iconRight={<ArrowUpRight size={15} />}>Newsroom</Button>} />
        <div className="mt-10 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <StoryCard story={a} layout="overlay" />
          <div className="grid gap-5">
            <StoryCard story={b} layout="wide" />
            <StoryCard story={c} layout="wide" />
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
function Inspiration() {
  const ideas = [
    { t: 'Two cities, one ticket', b: 'Stopover in Johannesburg or Nairobi for up to 7 days at no fare uplift.', c: 'from $62', to: '/destinations/johannesburg', img: '/img/city-johannesburg.jpg' },
    { t: 'The beach triangle', b: 'Zanzibar, Mauritius and Seychelles in one itinerary — fixed-partner fares.', c: 'from $892', to: '/destinations/mauritius', img: '/img/dest-zanzibar.jpg' },
    { t: 'Safari, from the north', b: 'Kilimanjaro for the climb, Serengeti fly-in from Nairobi on the A321neo.', c: 'from $740', to: '/destinations/kilimanjaro', img: '/img/city-nairobi.jpg' },
    { t: 'Autumn in Europe', b: 'Accra to Lisbon, Paris or London before the shoulder season ends.', c: 'from $611', to: '/destinations/lisbon', img: '/img/city-london.jpg' },
  ];
  return (
    <Section tone="white">
      <div className="shell">
        <SectionHeading eyebrow="Travel inspiration" title="Four ways to use the network you did not know existed." />
        <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {ideas.map((i, k) => (
            <Link key={i.t} to={i.to} className="group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-[18px] p-5 text-white" style={{ marginTop: k % 2 ? 16 : 0 }}>
              <Photo src={i.img} alt="" seed={i.t} className="absolute inset-0" imgClassName="transition-transform duration-[1200ms] group-hover:scale-[1.07]" />
              <span className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/40 to-navy-950/5" />
              <span className="relative">
                <span className="num rounded-pill bg-white/15 px-2 py-0.5 text-[.6875rem] font-semibold backdrop-blur-md">{i.c}</span>
                <span className="mt-3 block font-display text-[1.125rem] font-semibold leading-snug">{i.t}</span>
                <span className="mt-1.5 block text-[.8125rem] leading-relaxed text-white/70">{i.b}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-[.8125rem] font-semibold text-teal-300 transition group-hover:gap-2">
                  Plan it <ArrowRight size={14} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
function AirportInfo() {
  const board = useMemo(() => statusBoard(toISODate(new Date())).slice(0, 6), []);
  return (
    <Section tone="line">
      <div className="shell grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div>
          <Eyebrow>Airport information</Eyebrow>
          <h2 className="h-2 mt-3">Know where to stand before you leave home.</h2>
          <p className="lead mt-3">Counter rows, real security times, the fastest door in each terminal, and the lounge nobody finds on the first visit.</p>
          <ul className="mt-7 space-y-3">
            {[
              { icon: <Clock size={16} />, t: 'Check-in closes 60 min before short-haul · 75 min long-haul', to: '/travel-information/check-in' },
              { icon: <Luggage size={16} />, t: 'Bag drop is a separate 12-minute lane at ACC rows A–D', to: '/travel-information/baggage' },
              { icon: <TrainFront size={16} />, t: 'NovaRail Link runs 22 minutes from the terminal to the city', to: '/airports/ACC' },
              { icon: <Users size={16} />, t: 'Assistance is a 5-minute promise, not a form to fill in', to: '/travel-information/special-assistance' },
            ].map((i) => (
              <li key={i.t}>
                <Link to={i.to} className="group flex items-center gap-3 rounded-[14px] border border-line bg-white p-3.5 transition hover:border-sky-300 hover:shadow-card">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-navy-50 text-navy-700">{i.icon}</span>
                  <span className="text-[.9375rem] text-ink-700">{i.t}</span>
                  <ArrowRight size={15} className="ml-auto shrink-0 text-ink-300 transition group-hover:translate-x-1 group-hover:text-navy-800" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <p className="font-display text-[1rem] font-semibold text-navy-900">Kotoka · Galaxy T1 departures</p>
              <p className="text-[.8125rem] text-ink-500">Updated {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · rolling 30-day on-time 87.9%</p>
            </div>
            <Badge tone="teal" dot>
              Live
            </Badge>
          </div>
          <table className="w-full text-left text-[.875rem]">
            <thead>
              <tr className="border-b border-line bg-mist-50 text-2xs uppercase tracking-wider text-ink-400">
                <th className="px-5 py-2 font-semibold">Flight</th>
                <th className="px-2 py-2 font-semibold">To</th>
                <th className="px-2 py-2 font-semibold">Time</th>
                <th className="hidden px-2 py-2 font-semibold sm:table-cell">Gate</th>
                <th className="px-5 py-2 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {board.map((f) => (
                <tr key={f.flightNo} className="border-b border-line last:border-0 transition hover:bg-sky-50/50">
                  <td className="num px-5 py-3 font-semibold text-navy-900">{f.flightNo}</td>
                  <td className="px-2 py-3">
                    <span className="font-medium">{f.destCity}</span>
                    <span className="ml-1.5 text-ink-400">{f.destination}</span>
                  </td>
                  <td className="num px-2 py-3 text-ink-600">{new Date(f.schedDep).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="num hidden px-2 py-3 text-ink-600 sm:table-cell">{f.gate}</td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={cx(
                        'inline-flex items-center gap-1.5 rounded-pill px-2 py-0.5 text-[.6875rem] font-semibold uppercase tracking-wide',
                        f.status === 'ON_TIME' && 'bg-teal-100 text-teal-900',
                        f.status === 'BOARDING' && 'bg-sky-100 text-sky-900',
                        f.status === 'DELAYED' && 'bg-gold-100 text-gold-600',
                        f.status === 'CANCELLED' && 'bg-red-50 text-red-700',
                        !['ON_TIME', 'BOARDING', 'DELAYED', 'CANCELLED'].includes(f.status) && 'bg-mist-100 text-ink-600',
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" /> {f.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-mist-50/70 px-5 py-3.5">
            <p className="text-[.8125rem] text-ink-500">Security wait now</p>
            <div className="flex items-center gap-4">
              <Meter value={18} tone="teal" className="w-28" />
              <span className="num text-[.8125rem] font-semibold text-teal-700">6 min</span>
              <Button size="sm" variant="secondary" to="/flight-status">
                Full board
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
function AppPromo() {
  const [trip, setTrip] = useState(0);
  const screens = [
    { t: 'Boarding pass at 48 hours', b: 'Check-in, seat, bags and pass in one flow — with a pass that works when the network does not.' },
    { t: 'Gate change before the airport', b: 'We push the new gate an average of 9 minutes before the boards change. Yes, we measured it.' },
    { t: 'Your bag, on the map', b: 'Four scan points per bag, each one timestamped, with a name attached when it is late.' },
  ];
  useEffect(() => {
    const i = setInterval(() => setTrip((t) => (t + 1) % 3), 4200);
    return () => clearInterval(i);
  }, []);
  return (
    <Section tone="white" className="relative overflow-hidden">
      {/* organic shapes */}
      <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-teal-100/70 blur-[2px]" aria-hidden />
      <div className="pointer-events-none absolute -left-10 top-40 h-40 w-40 blob-a bg-sky-100/80" aria-hidden />
      <div className="shell relative grid items-center gap-12 lg:grid-cols-[1fr_minmax(0,420px)]">
        <div>
          <Eyebrow>The AeroNova app</Eyebrow>
          <h2 className="h-1 mt-3">Everything except the turbulence.</h2>
          <p className="lead mt-4 max-w-xl">
            Book, check in, pick a seat, pay for the bag you pretend you will not over-pack, and land without asking anyone for a paper copy of anything.
          </p>
          <ul className="mt-8 max-w-lg space-y-3">
            {screens.map((s, i) => (
              <li key={s.t}>
                <button onClick={() => setTrip(i)} className={cx('w-full rounded-[14px] border p-4 text-left transition', trip === i ? 'border-navy-800 bg-navy-50/50 shadow-card' : 'border-line hover:border-sky-300')}>
                  <p className="font-display text-[.9375rem] font-semibold text-navy-900">{s.t}</p>
                  <p className={cx('mt-1 text-[.875rem] leading-relaxed transition-all', trip === i ? 'text-ink-600' : 'text-ink-400')}>{s.b}</p>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button variant="primary">Download for iOS</Button>
            <Button variant="secondary">Get it on Android</Button>
            <span className="flex items-center gap-1.5 text-[.8125rem] text-ink-500">
              <Star size={14} className="fill-gold-500 text-gold-500" /> 4.8 · 214,006 ratings
            </span>
          </div>
        </div>

        {/* phone mock */}
        <div className="relative mx-auto w-full max-w-[330px]">
          <div className="absolute -inset-6 -z-10 blob-b bg-mist-100" aria-hidden />
          <div className="relative overflow-hidden rounded-[38px] border-[10px] border-navy-900 bg-navy-950 shadow-lift">
            <div className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-navy-950" aria-hidden />
            <div className="aspect-[9/18] w-full overflow-hidden bg-white">
              <div className={cx('flex h-full flex-col transition-all duration-500', `opacity-100`)}>
                <div className="bg-navy-900 px-4 pb-5 pt-9 text-white">
                  <div className="flex items-center justify-between">
                    <p className="text-[.6875rem] uppercase tracking-[0.2em] text-teal-300">{['AeroNova · Trip', 'AeroNova · Live', 'AeroNova · Bags'][trip]}</p>
                    <Sunburst size={16} className="text-gold-400" />
                  </div>
                  <p className="mt-3 font-display text-[1.125rem] font-semibold">{['AN 214 · Accra → Lagos', 'Gate C9 · boarding now', 'Bag 221904 · on belt 3'][trip]}</p>
                  <p className="mt-1 text-[.75rem] text-white/60">{['Seat 12A · 2 bags · meal: vegan', 'Dep 06:15 · on time · fast track at 05:10', 'Scanned 04:38 · delivered 08:12'][trip]}</p>
                </div>
                <div className="flex-1 space-y-3 p-4">
                  {trip === 0 && (
                    <>
                      <div className="rounded-[14px] bg-[#0B2340] p-3 text-white">
                        <div className="flex items-center justify-between text-[.6875rem] uppercase tracking-widest text-white/55">
                          <span>Boarding pass</span>
                          <span>AN 214</span>
                        </div>
                        <p className="mt-2 font-display text-[1.5rem] font-semibold leading-none">12A</p>
                        <div className="mt-3 flex gap-[3px]" aria-hidden>
                          {Array.from({ length: 34 }).map((_, i) => (
                            <span key={i} className="block bg-white" style={{ width: (i * 7) % 5 ? 2 : 4, height: 30 - ((i * 13) % 9) }} />
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['Seat map', 'Add bag', 'Meal', 'Wi-Fi'].map((b) => (
                          <span key={b} className="rounded-[10px] border border-line px-3 py-2 text-[.75rem] font-semibold text-navy-900">
                            {b}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                  {trip === 1 && (
                    <>
                      {[
                        ['05:10', 'Fast-track lane used', 'teal'],
                        ['05:31', 'Scan at gate C9', 'navy'],
                        ['05:52', 'Boarding complete', 'navy'],
                        ['06:02', 'Pushback', 'mist'],
                      ].map(([t, e, c]) => (
                        <div key={t} className="flex items-center gap-3 border-b border-line pb-2.5">
                          <span className="num text-[.75rem] font-semibold text-ink-400">{t}</span>
                          <span className={cx('h-2 w-2 rounded-full', c === 'teal' ? 'bg-teal-500' : c === 'navy' ? 'bg-navy-700' : 'bg-ink-200')} />
                          <span className="text-[.8125rem] font-medium text-navy-900">{e}</span>
                        </div>
                      ))}
                    </>
                  )}
                  {trip === 2 && (
                    <div className="space-y-2.5">
                      {['Dep scan · ACC', 'Transfer · NBO', 'Sort · LOS', 'Belt 3 · delivered'].map((s, i) => (
                        <div key={s} className="flex items-center gap-3">
                          <span className={cx('grid h-7 w-7 place-items-center rounded-full text-[.6875rem] font-bold', i === 3 ? 'bg-teal-500 text-white' : 'bg-mist-100 text-ink-500')}>{i === 3 ? '✓' : i + 1}</span>
                          <span className="flex-1 border-b border-dashed border-line pb-2 text-[.8125rem] font-medium text-navy-900">{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
function QuickDealsRow() {
  const [hovered, setHovered] = useState<number | null>(null);
  const fares = [
    { from: 'ACC', to: 'NBO', price: 239, when: 'Feb', aircraft: 'A321neo' },
    { from: 'ACC', to: 'JNB', price: 319, when: 'Mar', aircraft: 'A330neo' },
    { from: 'LOS', to: 'DXB', price: 486, when: 'Jan', aircraft: 'A330neo' },
    { from: 'NBO', to: 'DXB', price: 342, when: 'Feb', aircraft: 'A321neo' },
    { from: 'JNB', to: 'CPT', price: 98, when: 'Any', aircraft: 'A320neo' },
    { from: 'ACC', to: 'CDG', price: 671, when: 'Apr', aircraft: '787-9' },
  ];
  return (
    <Section tone="white" pad="md">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Live fare drops</Eyebrow>
            <h2 className="h-2 mt-2">Six routes that got cheaper this week.</h2>
          </div>
          <Link to="/offers" className="text-[.875rem] font-semibold text-navy-800 underline decoration-line underline-offset-4 hover:decoration-sky-500">
            All offers
          </Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fares.map((f, i) => (
            <Link
              key={f.from + f.to}
              to={`/search?from=${f.from}&to=${f.to}&dep=${toISODate(new Date(Date.now() + (30 + i * 4) * DAY))}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className={cx('group flex items-center gap-4 rounded-[16px] border p-4 transition-all', hovered === i ? 'border-navy-800 bg-navy-50/40 shadow-card' : 'border-line bg-white')}
            >
              <div className="num flex items-center gap-2 font-display text-[1.0625rem] font-semibold text-navy-900">
                {f.from}
                <RouteArc className="h-4 w-12 text-teal-500" />
                {f.to}
              </div>
              <div className="ml-auto text-right">
                <p className="num font-display text-[1.25rem] font-semibold text-navy-900">{money(f.price)}</p>
                <p className="text-[.6875rem] uppercase tracking-wide text-ink-400">
                  {f.when} · {f.aircraft}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
export default function Home() {
  const nav = useNavigate();
  const q: SearchQuery = { tripType: 'round', legs: [{ from: 'ACC', to: 'LOS', date: toISODate(new Date(Date.now() + 16 * DAY)) }], returnDate: toISODate(new Date(Date.now() + 23 * DAY)), adults: 1, children: 0, infants: 0, cabin: 'ECONOMY', promo: '' };
  const sample = useMemo(() => {
    // two teaser flight rows for the “try it” band
    const board = statusBoard(toISODate(new Date()), 'ACC').slice(0, 2);
    return board.map((f, i) => ({
      id: `t${i}`,
      direction: 'outbound' as const,
      from: f.origin,
      to: f.destination,
      segments: [
        {
          flightNo: f.flightNo,
          carrier: 'AeroNova Airways',
          aircraft: f.aircraft,
          from: f.origin,
          to: f.destination,
          dep: new Date(parseISODate(toISODate(new Date())).getTime() + 8 * 3600000 + i * 5400000).toISOString(),
          arr: new Date(parseISODate(toISODate(new Date())).getTime() + (12 + i * 2) * 3600000).toISOString(),
          depDateLabel: toISODate(new Date()),
          durationMin: 155 + i * 90,
          terminal: 'Galaxy T1',
          gate: f.gate,
          seatMiles: f.distanceKm,
        },
      ],
      stops: 0,
      totalMin: 155 + i * 90,
      cabins: { ECONOMY: { LIGHT: 179 + i * 40, CLASSIC: 239 + i * 40, FLEX: 309 + i * 40 }, PREMIUM: { PREMIUM: 590 + i * 60 }, BUSINESS: { BUSINESS: 1080 + i * 120 } },
      bestPrice: 179 + i * 40,
      seatsLeft: 5 - i,
      wifi: true,
      power: true,
      rating: 4.6 + i * 0.1,
      ratingCount: 800,
      refundable: i === 1,
      bagsIncluded: 1,
      depEpoch: 0,
      arrEpoch: 0,
      isNova: true,
      airlineCode: 'AN',
    }));
  }, []);

  return (
    <>
      <Hero />
      <BookingBlock />
      <Ticker />
      <DestinationsBento />

      {/* try-a-search band, showing real result cards */}
      <Section tone="navy" className="!bg-navy-950 !py-14">
        <div className="shell grid gap-6 lg:grid-cols-[minmax(0,300px)_1fr] lg:items-center">
          <div>
            <p className="eyebrow text-teal-300">Try it now</p>
            <h2 className="h-2 mt-2 text-white">See the results page, without searching.</h2>
            <p className="mt-3 text-[.9375rem] leading-relaxed text-white/65">These are real itineraries from the same engine that powers the search. Select one and the whole booking flow follows.</p>
            <Button variant="onDark" size="sm" className="mt-5" onClick={() => nav(`/search?from=${q.legs[0].from}&to=${q.legs[0].to}&dep=${q.legs[0].date}&pax=1,0,0&cabin=ECONOMY&trip=round`)}>
              Open live results
            </Button>
          </div>
          <div className="space-y-3 [&_.text-navy-900]:!text-navy-900">
            {sample.map((s) => (
              <FlightCard key={s.id} it={s as never} fareId="CLASSIC" cabin="ECONOMY" onSelect={() => nav('/search?from=ACC&to=LOS')} flag={{ label: 'Sample', tone: 'teal' }} />
            ))}
          </div>
        </div>
      </Section>

      <Deals />
      <QuickDealsRow />
      <WhyFly />
      <Cabins />
      <Loyalty />
      <Stories />
      <Inspiration />
      <AppPromo />
      <AirportInfo />

      {/* travel info + fleet quick links */}
      <Section tone="white" pad="md">
        <div className="shell grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Eyebrow>Before you fly</Eyebrow>
            <h2 className="h-2 mt-2">The answers people call us about most.</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {TRAVEL_SECTIONS.slice(0, 6).map((s, i) => (
                <Link key={s.id} to={`/travel-information/${s.id}`} className={cx('group flex items-start gap-3 rounded-[14px] border border-line p-4 transition hover:border-sky-300 hover:bg-sky-50/40', i % 2 === 1 && 'sm:translate-y-3')}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-mist-100 font-display text-[.75rem] font-bold text-navy-700">{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block font-display text-[.9375rem] font-semibold text-navy-900">{s.title}</span>
                    <span className="mt-1 block line-clamp-2 text-[.8125rem] leading-relaxed text-ink-500">{s.summary}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-card bg-mist-50 p-6">
            <Eyebrow>The fleet</Eyebrow>
            <ul className="mt-4 space-y-3">
              {FLEET.map((a) => (
                <li key={a.id}>
                  <Link to={`/fleet/${a.id}`} className="group flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-navy-800 font-display text-[.625rem] font-bold text-gold-400">{a.id}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-[.875rem] font-semibold text-navy-900">{a.name}</span>
                      <span className="num block text-[.75rem] text-ink-500">
                        {a.delivered} in fleet · {a.capacity} seats · {(a.rangeKm / 1000).toFixed(0)}k km
                      </span>
                    </span>
                    <ArrowUpRight size={15} className="text-ink-300 transition group-hover:text-navy-800" />
                  </Link>
                </li>
              ))}
            </ul>
            <NovaRule className="mt-6" />
            <Link to="/fleet" className="mt-4 inline-flex items-center gap-1.5 text-[.875rem] font-semibold text-navy-800 hover:underline">
              Interactive fleet page <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}

