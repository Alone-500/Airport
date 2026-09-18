import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Compass, Home, PlaneTakeoff, Search, Ticket, User } from 'lucide-react';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { Modal } from '../ui/Overlay';
import { Button, Divider, NovaRule } from '../ui/Primitives';
import { cx } from '../../lib/utils';
import { useStore } from '../../store/store';
import { Breadcrumbs } from '../ui/Overlay';

const MOBILE_LINKS = [
  { label: 'Book a flight', to: '/book', icon: PlaneTakeoff },
  { label: 'Manage booking', to: '/manage-booking', icon: Ticket },
  { label: 'Flight status', to: '/flight-status', icon: Search },
  { label: 'Check in', to: '/check-in', icon: Home },
  { label: 'Destinations', to: '/destinations', icon: Compass },
  { label: 'Offers', to: '/offers', icon: ChevronRight },
];

const MORE_SECTIONS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Fly with us',
    links: [
      { label: 'Experience', to: '/experience' },
      { label: 'Cabins', to: '/cabins/business' },
      { label: 'Fleet', to: '/fleet' },
      { label: 'AeroNova Rewards', to: '/loyalty' },
      { label: 'Lounges', to: '/experience/lounges' },
    ],
  },
  {
    title: 'Travel information',
    links: [
      { label: 'Baggage', to: '/travel-information/baggage' },
      { label: 'Check-in', to: '/travel-information/check-in' },
      { label: 'Travel documents', to: '/travel-information/travel-documents' },
      { label: 'Special assistance', to: '/travel-information/special-assistance' },
      { label: 'Help centre', to: '/help' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Newsroom', to: '/newsroom' },
      { label: 'Careers', to: '/careers' },
      { label: 'Contact', to: '/contact' },
      { label: 'Staff dashboard', to: '/admin' },
    ],
  },
];

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useStore();
  const nav = useNavigate();
  return (
    <Modal open={open} onClose={onClose} title="Menu" size="sm" variant="sheet">
      <div className="-mx-1">
        <button
          onClick={() => {
            nav(user ? '/account' : '/sign-in');
            onClose();
          }}
          className="mb-4 flex w-full items-center gap-3 rounded-card border border-line bg-mist-50 p-3.5 text-left"
        >
          <span className={cx('grid h-11 w-11 place-items-center rounded-full font-display text-[1rem] font-bold', user ? 'bg-navy-800 text-white' : 'bg-white text-navy-800 ring-1 ring-line')}>{user ? user.name.slice(0, 1) : <User size={18} />}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-[.9375rem] font-semibold text-navy-900">{user ? user.name : 'Sign in or join'}</span>
            <span className="block truncate text-[.8125rem] text-ink-500">{user ? `${user.tier} · ${user.points.toLocaleString()} points` : 'Manage trips, seats and points'}</span>
          </span>
          <ChevronRight size={16} className="text-ink-400" />
        </button>

        <ul className="space-y-0.5">
          {MOBILE_LINKS.map((l) => (
            <li key={l.label}>
              <Link to={l.to} onClick={onClose} className="flex items-center gap-3 rounded-[12px] px-2 py-3 text-[1rem] font-medium text-navy-900 transition active:bg-mist-100">
                <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-sky-50 text-navy-700">
                  <l.icon size={17} />
                </span>
                {l.label}
                <ChevronRight size={15} className="ml-auto text-ink-300" />
              </Link>
            </li>
          ))}
        </ul>

        <Divider className="my-4" />

        {MORE_SECTIONS.map((s) => (
          <div key={s.title} className="mb-4">
            <p className="mb-1.5 text-2xs font-semibold uppercase tracking-[0.16em] text-ink-400">{s.title}</p>
            <ul className="grid grid-cols-2 gap-x-3">
              {s.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} onClick={onClose} className="block py-1.5 text-[.875rem] text-ink-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <NovaRule className="mt-5" />
      </div>
    </Modal>
  );
}

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const pages = [
    { t: 'Book a flight', s: '/book', k: 'booking' },
    { t: 'Flight status', s: '/flight-status', k: 'operation' },
    { t: 'Manage booking', s: '/manage-booking', k: 'booking reference' },
    { t: 'Online check-in', s: '/check-in', k: 'boarding pass' },
    { t: 'Destinations', s: '/destinations', k: 'cities' },
    { t: 'Nova Business cabin', s: '/cabins/business', k: 'lie-flat' },
    { t: 'Galaxy Lounges', s: '/experience/lounges', k: 'lounge access' },
    { t: 'AeroNova Rewards', s: '/loyalty', k: 'points tiers' },
    { t: 'Baggage rules', s: '/travel-information/baggage', k: 'weight allowance' },
    { t: 'Dangerous goods', s: '/travel-information/dangerous-goods', k: 'batteries' },
    { t: 'Special assistance', s: '/travel-information/special-assistance', k: 'wheelchair' },
    { t: 'Help centre', s: '/help', k: 'contact support' },
    { t: 'Fleet', s: '/fleet', k: 'aircraft' },
    { t: 'Offers', s: '/offers', k: 'deals' },
    { t: 'Careers', s: '/careers', k: 'jobs' },
  ];
  const hits = q ? pages.filter((p) => `${p.t} ${p.k}`.toLowerCase().includes(q.toLowerCase())).slice(0, 7) : pages.slice(0, 6);
  return (
    <Modal open={open} onClose={onClose} title="Search AeroNova" size="md">
      <div className="-mt-1">
        <label htmlFor="site-search" className="sr-only">
          Search
        </label>
        <div className="relative">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            id="site-search"
            autoFocus
            data-autofocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && hits[0]) {
                nav(hits[0].s);
                onClose();
              }
            }}
            placeholder="Try “baggage”, “check-in”, “Nairobi”…"
            className="h-12 w-full rounded-[12px] border border-line pl-10 pr-3 text-[1rem] outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/12"
          />
        </div>
        <ul className="mt-3 divide-y divide-line">
          {hits.map((p) => (
            <li key={p.s + p.t}>
              <button
                onClick={() => {
                  nav(p.s);
                  onClose();
                }}
                className="flex w-full items-center gap-3 py-2.5 text-left transition hover:text-navy-900"
              >
                <span className="flex-1 font-medium text-ink-700">{p.t}</span>
                <span className="text-[.75rem] uppercase tracking-wide text-ink-300">{p.k}</span>
                <ChevronRight size={14} className="text-ink-300" />
              </button>
            </li>
          ))}
          {!hits.length && (
            <li className="py-6 text-center">
              <p className="text-sm text-ink-500">
                Nothing found for “{q}”.
                <br />
                Try the <Link className="font-semibold text-sky-700 underline" to="/help">help centre</Link>.
              </p>
            </li>
          )}
        </ul>
      </div>
    </Modal>
  );
}

function MobileTabBar() {
  const items = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/book', label: 'Book', icon: PlaneTakeoff },
    { to: '/flight-status', label: 'Status', icon: Search },
    { to: '/manage-booking', label: 'Trips', icon: Ticket },
    { to: '/account', label: 'Account', icon: User },
  ];
  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-[95] border-t border-line/80 bg-white/85 backdrop-blur-xl safe-b md:hidden">
      <ul className="flex">
        {items.map((i) => (
          <li key={i.to} className="flex-1">
            <NavLink
              to={i.to}
              className={({ isActive }) => cx('flex flex-col items-center gap-0.5 py-2 text-[.625rem] font-semibold uppercase tracking-wide transition', isActive ? 'text-navy-900' : 'text-ink-400')}
            >
              {({ isActive }) => (
                <>
                  <span className={cx('grid h-7 w-11 place-items-center rounded-full transition', isActive && 'bg-sky-100')}>
                    <i.icon size={17} />
                  </span>
                  {i.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-[10px] focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white">
        Skip to main content
      </a>
      <Navbar onOpenSearch={() => setSearchOpen(true)} onOpenMobile={() => setMobileOpen(true)} />
      <main id="main" className="flex-1 pb-[68px] md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <MobileTabBar />
    </div>
  );
}

/* --------------------------- shared page furniture --------------------------- */
export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  crumbs,
  align = 'left',
  children,
  tone = 'navy',
  height = 'md',
  overlay = true,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lead?: React.ReactNode;
  image?: string;
  crumbs?: { label: string; to?: string }[];
  align?: 'left' | 'center';
  children?: React.ReactNode;
  tone?: 'navy' | 'mist' | 'white';
  height?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
}) {
  return (
    <section
      className={cx(
        'relative isolate overflow-hidden',
        tone === 'navy' && 'bg-navy-900 text-white',
        tone === 'mist' && 'bg-mist-50',
        tone === 'white' && 'bg-white',
        height === 'sm' ? 'pt-[calc(var(--nav)+2.5rem)] pb-10' : height === 'lg' ? 'pt-[calc(var(--nav)+4.5rem)] pb-16' : 'pt-[calc(var(--nav)+3.5rem)] pb-14',
      )}
    >
      {image && (
        <>
          <img src={image} alt="" className={cx('absolute inset-0 h-full w-full object-cover', overlay ? 'opacity-55' : '')} aria-hidden />
          {overlay && <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/72 to-navy-900/45" aria-hidden />}
        </>
      )}
      <div className={cx('relative shell', align === 'center' && 'text-center')}>
        {crumbs && <Breadcrumbs items={crumbs} dark={tone === 'navy'} className="mb-5" />}
        <div className={cx('max-w-3xl', align === 'center' && 'mx-auto')}>
          {eyebrow && <p className={cx('eyebrow mb-3', tone === 'navy' && 'text-teal-300')}>{eyebrow}</p>}
          <h1 className={cx('h-hero', tone === 'navy' && 'text-white')}>{title}</h1>
          {lead && <p className={cx('lead mt-4 max-w-2xl text-pretty', tone === 'navy' ? 'text-white/75' : 'text-ink-600', align === 'center' && 'mx-auto')}>{lead}</p>}
          {children}
        </div>
      </div>
      {tone === 'navy' && !image && <div className="pointer-events-none absolute inset-0 opacity-[0.07] texture-dots" aria-hidden />}
    </section>
  );
}

export function StickyBookBar({ price, label = 'Continue booking', onBook, meta }: { price?: string; label?: string; onBook: () => void; meta?: React.ReactNode }) {
  const { pathname } = useLocation();
  const nav = useNavigate();
  if (pathname === '/book') return null;
  return (
    <div className="fixed inset-x-0 bottom-[68px] z-[94] border-t border-line bg-white/95 p-3 backdrop-blur-xl safe-b md:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[.75rem] uppercase tracking-wide text-ink-400">{meta ?? 'AeroNova Airways'}</p>
          <p className="num truncate font-display text-[1.0625rem] font-semibold text-navy-900">{price ?? 'Fares from $179'}</p>
        </div>
        <Button onClick={price ? onBook : () => nav('/book')} className="shrink-0">
          {label}
        </Button>
      </div>
    </div>
  );
}
