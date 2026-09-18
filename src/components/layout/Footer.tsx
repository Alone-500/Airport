import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Logo, WingMark } from '../brand/Brand';
import { Button, NovaRule } from '../ui/Primitives';
import { cx } from '../../lib/utils';
import { useStore } from '../../store/store';

const GROUPS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Book & manage',
    links: [
      { label: 'Book a flight', to: '/book' },
      { label: 'Manage booking', to: '/manage-booking' },
      { label: 'Online check-in', to: '/check-in' },
      { label: 'Flight status', to: '/flight-status' },
      { label: 'Refund request', to: '/travel-information/delayed-baggage' },
      { label: 'Add baggage', to: '/travel-information/baggage' },
    ],
  },
  {
    title: 'Plan your trip',
    links: [
      { label: 'Destinations', to: '/destinations' },
      { label: 'Offers & deals', to: '/offers' },
      { label: 'Our fleet', to: '/fleet' },
      { label: 'Airport guides', to: '/airports' },
      { label: 'Travel information', to: '/travel-information' },
      { label: 'Visa information', to: '/travel-information/visa-information' },
    ],
  },
  {
    title: 'Experience',
    links: [
      { label: 'Economy', to: '/cabins/economy' },
      { label: 'Premium Economy', to: '/cabins/premium-economy' },
      { label: 'Nova Business', to: '/cabins/business' },
      { label: 'Galaxy Lounges', to: '/experience/lounges' },
      { label: 'Nova Play entertainment', to: '/experience/entertainment' },
      { label: 'Dining', to: '/experience/dining' },
    ],
  },
  {
    title: 'AeroNova Rewards',
    links: [
      { label: 'Program overview', to: '/loyalty' },
      { label: 'Membership tiers', to: '/loyalty#tiers' },
      { label: 'Earn points', to: '/loyalty#earn' },
      { label: 'Redeem points', to: '/loyalty#redeem' },
      { label: 'Partners', to: '/loyalty#partners' },
      { label: 'My rewards dashboard', to: '/account/rewards' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About AeroNova', to: '/about' },
      { label: 'Fleet & operations', to: '/fleet' },
      { label: 'Sustainability', to: '/about#sustainability' },
      { label: 'Safety', to: '/about#safety' },
      { label: 'Newsroom', to: '/newsroom' },
      { label: 'Careers', to: '/careers' },
      { label: 'Investors', to: '/newsroom#investors' },
      { label: 'Contact', to: '/contact' },
    ],
  },
];

const IG = (p: { size?: number }) => (
  <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5.4" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="17.2" cy="6.9" r="1.15" fill="currentColor" />
  </svg>
);
const FB = (p: { size?: number }) => (
  <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M13.6 21v-7.4h2.5l.4-2.9h-2.9V9c0-.85.24-1.42 1.45-1.42H16.6V5.05A19 19 0 0 0 14.5 4.9c-2.3 0-3.9 1.4-3.9 4v2.2H8.1v2.9h2.5V21" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);
const LI = (p: { size?: number }) => (
  <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.7" />
    <path d="M7.4 10.4V17M7.4 7.6v.1M11.4 17v-3.6a2.1 2.1 0 0 1 4.2 0V17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
const YT = (p: { size?: number }) => (
  <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="2.5" y="5.5" width="19" height="13" rx="4" stroke="currentColor" strokeWidth="1.7" />
    <path d="M10.4 9.6 14.8 12l-4.4 2.4z" fill="currentColor" />
  </svg>
);

const SOCIALS = [
  { icon: IG, label: 'Instagram', href: 'https://instagram.com' },
  { icon: FB, label: 'Facebook', href: 'https://facebook.com' },
  { icon: LI, label: 'LinkedIn', href: 'https://linkedin.com' },
  { icon: YT, label: 'YouTube', href: 'https://youtube.com' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const { toast } = useStore();

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) {
      setState('error');
      return;
    }
    setState('busy');
    setTimeout(() => {
      setState('done');
      toast({ tone: 'success', title: 'You are on the list', body: 'Horizons, our weekly dispatch, lands Thursdays at 06:00 GMT.' });
    }, 800);
  };

  return (
    <footer className="relative overflow-hidden bg-navy-950 text-white/75">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] texture-grid" aria-hidden />
      <WingMark className="pointer-events-none absolute -right-10 top-8 h-24 w-[420px] text-teal-400/25" />

      {/* newsletter */}
      <div className="relative border-b border-white/10">
        <div className="shell grid items-center gap-8 py-12 lg:grid-cols-[1.1fr_1fr] lg:py-14">
          <div>
            <p className="eyebrow text-teal-300">Horizons — the AeroNova dispatch</p>
            <h2 className="h-2 mt-3 text-white">Route news, fare windows and the things worth doing when you land.</h2>
            <p className="mt-3 max-w-xl text-[.9375rem] leading-relaxed text-white/60">
              One email a week, written by the people who build the schedule. No flash sales pretending to expire, no hotel upsells, and you can change your regions in one click.
            </p>
          </div>
          <form onSubmit={subscribe} className="w-full" noValidate>
            <label htmlFor="nl" className="sr-only">
              Email address
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="nl"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setState('idle');
                }}
                placeholder="you@company.com"
                aria-invalid={state === 'error'}
                className={cx('h-12 w-full rounded-[12px] border bg-white/5 px-4 text-white outline-none transition placeholder:text-white/35 focus:ring-4 focus:ring-teal-400/20', state === 'error' ? 'border-red-400' : 'border-white/15 focus:border-teal-400')}
              />
              <Button type="submit" variant="onDark" size="lg" className="shrink-0" loading={state === 'busy'} iconRight={state === 'done' ? undefined : <ArrowRight size={16} />}>
                {state === 'done' ? 'Subscribed' : 'Subscribe'}
              </Button>
            </div>
            <p className={cx('mt-2 text-[.8125rem]', state === 'error' ? 'text-red-300' : 'text-white/45')}>
              {state === 'error' ? 'That address does not look right — check for a typo.' : state === 'done' ? 'Confirmation sent. Check the promotions folder if it hides.' : 'We keep your address for the newsletter only. Unsubscribe in one click.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Fares & windows', 'Route launches', 'Airport guides', 'Safari & beaches', 'Business travel'].map((t, i) => (
                <button key={t} type="button" onClick={() => toast({ tone: 'info', title: `Added: ${t}`, body: 'Your newsletter topics were saved to your profile.' })} className={cx('rounded-pill border px-3 py-1 text-[.75rem] font-medium transition', i % 2 ? 'border-white/15 text-white/60 hover:border-teal-400 hover:text-white' : 'border-teal-400/50 bg-teal-400/10 text-teal-200')}>
                  {t}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>

      {/* app + links */}
      <div className="shell grid gap-10 py-14 lg:grid-cols-[1fr_2.6fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-[.875rem] leading-relaxed text-white/55">
            Premium African aviation since 2009. 46 aircraft, 41 destinations, and a promise we publish monthly: that you will get where you are going.
          </p>
          <NovaRule className="mt-5" />
          <div className="mt-5 flex items-center gap-2">
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer noopener" aria-label={s.label} className="grid h-9 w-9 place-items-center rounded-full border border-white/12 text-white/60 transition hover:border-teal-400/60 hover:text-white">
                <s.icon size={16} />
              </a>
            ))}
          </div>
          <div className="mt-6 rounded-card border border-white/10 bg-white/[0.04] p-4">
            <p className="font-display text-[.9375rem] font-semibold text-white">The airline in your pocket</p>
            <p className="mt-1 text-[.8125rem] leading-relaxed text-white/55">Boarding passes, bag tracking, gate changes before the airport announces them.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="onDark">App Store</Button>
              <Button size="sm" variant="ghost" className="border border-white/15 text-white hover:bg-white/10">
                Google Play
              </Button>
            </div>
          </div>
        </div>

        <nav aria-label="Footer" className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="mb-3 font-display text-[.8125rem] font-semibold uppercase tracking-[0.12em] text-white">{g.title}</p>
              <ul className="space-y-2">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-[.875rem] text-white/60 transition hover:text-white hover:underline hover:decoration-teal-400/60 hover:underline-offset-4">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* trust bar */}
      <div className="border-t border-white/10">
        <div className="shell flex flex-wrap items-center gap-x-8 gap-y-3 py-6 text-[.75rem] text-white/45">
          {[
            ['IOSA registered since 2015', 'Safety'],
            ['ICAO Category 1 — Ghana', 'Oversight'],
            ['NPS 46 · rolling 12 months', 'Customer'],
            ['14% SAF blended uplift', 'Sustainability'],
            ['Airline of the Year, ABA 2025', 'Recognition'],
          ].map(([a, b]) => (
            <span key={a} className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-teal-400" />
              <span className="uppercase tracking-[0.14em] text-white/35">{b}</span> {a}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-4 py-6 text-[.75rem] text-white/45 lg:flex-row lg:items-center lg:justify-between">
          <p>© {new Date().getFullYear()} AeroNova Airways Ltd (Ghana) · Licence HA-2009/04 · A fictional airline built as a design demonstration.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {['Terms of carriage', 'Privacy', 'Cookies', 'Accessibility statement', 'Modern slavery', 'Baggage policy', 'Sitemap'].map((l) => (
              <Link key={l} to={l === 'Sitemap' ? '/about' : l === 'Accessibility statement' ? '/travel-information/accessibility' : l === 'Baggage policy' ? '/travel-information/baggage' : '/about'} className="transition hover:text-white">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
