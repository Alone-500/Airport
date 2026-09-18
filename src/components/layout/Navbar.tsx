import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Globe, Plane, Search, Ticket, User } from 'lucide-react';
import { cx } from '../../lib/utils';
import { Logo, Sunburst } from '../brand/Brand';
import { Button } from '../ui/Primitives';
import { Menu, MenuDivider, MenuItem } from '../ui/Overlay';
import { CURRENCIES, LANGUAGES } from '../../data/offers';
import { DESTINATIONS } from '../../data/destinations';
import { useStore } from '../../store/store';
import { FlightSearchWidget } from '../booking/FlightSearchWidget';

interface NavItem {
  label: string;
  to: string;
  menu?: { title: string; links: { label: string; to: string; desc?: string }[]; feature?: React.ReactNode }[];
  wide?: boolean;
}

const DEST_LINKS = [
  { label: 'All destinations', to: '/destinations', desc: '41 cities, 5 regions' },
  { label: 'Africa', to: '/destinations?region=Africa' },
  { label: 'Europe', to: '/destinations?region=Europe' },
  { label: 'Middle East', to: '/destinations?region=Middle East' },
  { label: 'Asia', to: '/destinations?region=Asia' },
  { label: 'North America', to: '/destinations?region=North America' },
  { label: 'Airport guides', to: '/airports' },
  { label: 'Fleet & aircraft', to: '/fleet' },
];

const EXPERIENCE_LINKS = [
  { label: 'Economy', to: '/cabins/economy' },
  { label: 'Premium Economy', to: '/cabins/premium-economy' },
  { label: 'Nova Business', to: '/cabins/business' },
  { label: 'Airport experience', to: '/experience/airport' },
  { label: 'Galaxy Lounges', to: '/experience/lounges' },
  { label: 'Nova Play entertainment', to: '/experience/entertainment' },
  { label: 'Dining & Nova Table', to: '/experience/dining' },
  { label: 'Nova Connect Wi-Fi', to: '/experience/wifi' },
  { label: 'Comfort & sleep', to: '/experience/comfort' },
];

const INFO_LINKS = [
  { label: 'Baggage', to: '/travel-information/baggage' },
  { label: 'Check-in', to: '/travel-information/check-in' },
  { label: 'Travel documents', to: '/travel-information/travel-documents' },
  { label: 'Visas', to: '/travel-information/visa-information' },
  { label: 'Special assistance', to: '/travel-information/special-assistance' },
  { label: 'Travelling with children', to: '/travel-information/children' },
  { label: 'Dangerous goods', to: '/travel-information/dangerous-goods' },
  { label: 'Help centre', to: '/help' },
];

const NAV: NavItem[] = [
  { label: 'Book', to: '/book' },
  { label: 'Manage Booking', to: '/manage-booking' },
  { label: 'Flight Status', to: '/flight-status' },
  { label: 'Destinations', to: '/destinations', menu: [{ title: 'Browse by region', links: DEST_LINKS }], wide: true },
  { label: 'Experience', to: '/experience', menu: [{ title: 'Cabins', links: EXPERIENCE_LINKS.slice(0, 3) }, { title: 'On the ground & in the air', links: EXPERIENCE_LINKS.slice(3) }], wide: true },
  { label: 'Offers', to: '/offers' },
  { label: 'Loyalty', to: '/loyalty' },
  { label: 'Travel Information', to: '/travel-information', menu: [{ title: 'Before you fly', links: INFO_LINKS.slice(0, 4) }, { title: 'On the day & after', links: INFO_LINKS.slice(4) }], wide: true },
];

export function Navbar({ onOpenSearch, onOpenMobile }: { onOpenSearch: () => void; onOpenMobile: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [showBar, setShowBar] = useState(false);
  const { user, prefs, setPrefs, notifications } = useStore();
  const nav = useNavigate();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setHover(null);
    setShowBar(false);
  }, [location.pathname]);

  const openMenu = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setHover(label);
  };
  const closeMenu = () => {
    closeTimer.current = setTimeout(() => setHover(null), 140);
  };

  return (
    <>
      <header
        className={cx(
          'fixed inset-x-0 top-0 z-[100] transition-all duration-300',
          scrolled ? 'border-b border-line/80 bg-white/85 shadow-[0_1px_0_rgba(255,255,255,.6)_inset] backdrop-blur-xl' : 'bg-transparent',
        )}
        onMouseLeave={closeMenu}
      >
        <div className={cx('hidden text-[.75rem] lg:block', scrolled ? 'bg-navy-900 text-white/70' : 'bg-navy-900/0 text-white/0')}>
          <div className="shell flex h-9 items-center justify-between">
            <p className="flex items-center gap-2">
              <Sunburst size={12} className="text-gold-400" /> Nova Day: double points on every long-haul departure this month.
              <Link to="/offers" className="font-semibold text-white underline-offset-4 hover:underline">
                See offers
              </Link>
            </p>
            <p className="flex items-center gap-4">
              <Link to="/help" className="hover:text-white">
                Help
              </Link>
              <Link to="/about/newsroom" className="hover:text-white">
                Newsroom
              </Link>
              <Link to="/admin" className="hover:text-white">
                Staff login
              </Link>
            </p>
          </div>
        </div>

        <div className="shell flex h-[var(--nav)] items-center gap-3">
          <Logo light={!scrolled && !hover} />

          <nav aria-label="Main" className="ml-1 hidden items-center xl:flex">
            {NAV.map((item) => (
              <div key={item.label} className="relative" onMouseEnter={() => (item.menu ? openMenu(item.label) : setHover(null))}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cx(
                      'relative flex h-[var(--nav)] items-center px-3 font-display text-[.875rem] font-medium transition-colors',
                      scrolled || hover ? 'text-ink-700 hover:text-navy-900' : 'text-white/85 hover:text-white',
                      isActive && (scrolled || hover ? 'text-navy-900' : 'text-white'),
                    )
                  }
                >
                  {item.label}
                  <span className={cx('absolute inset-x-3 bottom-[18px] h-[2px] rounded-full bg-teal-500 transition-transform duration-200', hover === item.label ? 'scale-x-100' : 'scale-x-0')} />
                </NavLink>
              </div>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={onOpenSearch}
              className={cx('grid h-9 w-9 place-items-center rounded-[10px] transition xl:grid', scrolled || hover ? 'text-ink-600 hover:bg-mist-100' : 'text-white/85 hover:bg-white/10')}
              aria-label="Search the site"
            >
              <Search size={18} />
            </button>

            <div className="hidden items-center lg:flex">
              <Menu
                dark={!scrolled && !hover}
                label={() => (
                  <span className="flex items-center gap-1.5">
                    <Globe size={15} />
                    <span className="num">{prefs.currency}</span>
                  </span>
                )}
                widthClass="w-72"
              >
                {(close) => (
                  <>
                    <p className="px-2.5 pb-1 pt-1.5 text-2xs font-semibold uppercase tracking-wider text-ink-400">Currency</p>
                    {CURRENCIES.map((c) => (
                      <MenuItem key={c} active={prefs.currency === c} onClick={() => { setPrefs({ currency: c }); close(); }}>
                        {c}
                      </MenuItem>
                    ))}
                    <MenuDivider />
                    <p className="px-2.5 pb-1 pt-1.5 text-2xs font-semibold uppercase tracking-wider text-ink-400">Language</p>
                    {LANGUAGES.map((l) => (
                      <MenuItem key={l.code} active={prefs.language === l.code} desc={l.note} onClick={() => { setPrefs({ language: l.code }); close(); }}>
                        {l.label}
                      </MenuItem>
                    ))}
                  </>
                )}
              </Menu>
            </div>

            {user ? (
              <Menu dark={!scrolled && !hover} label={() => <span className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-teal-500 font-display text-[.75rem] font-bold text-white">{user.name.slice(0, 1)}</span><span className="hidden max-w-[9rem] truncate text-[.8125rem] sm:inline">{user.name.split(' ')[0]}</span></span>}>
                {(close) => (
                  <>
                    <MenuItem icon={<Bell size={15} />} desc={`${unread} unread`} onClick={() => { nav('/account/notifications'); close(); }}>
                      Notifications
                    </MenuItem>
                    <MenuItem icon={<User size={15} />} onClick={() => { nav('/account'); close(); }}>
                      My account
                    </MenuItem>
                    <MenuItem icon={<Ticket size={15} />} onClick={() => { nav('/account/trips'); close(); }}>
                      Trips & bookings
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem onClick={() => { nav('/admin'); close(); }}>Staff dashboard</MenuItem>
                  </>
                )}
              </Menu>
            ) : (
              <Button size="sm" variant={scrolled || hover ? 'secondary' : 'onDark'} className="hidden sm:inline-flex" icon={<User size={15} />} onClick={() => nav('/sign-in')}>
                Sign in
              </Button>
            )}

            <Button size="sm" className="hidden md:inline-flex" icon={<Plane size={15} />} onClick={() => nav('/book')}>
              Book a Flight
            </Button>

            <button onClick={onOpenMobile} aria-label="Open menu" className={cx('grid h-9 w-9 place-items-center rounded-[10px] transition xl:hidden', scrolled || hover ? 'text-navy-800 hover:bg-mist-100' : 'text-white hover:bg-white/10')}>
              <span className="relative block h-3.5 w-5">
                <span className="absolute inset-x-0 top-0 h-[1.8px] rounded bg-current" />
                <span className="absolute inset-x-0 top-[6px] h-[1.8px] rounded bg-current" />
                <span className="absolute inset-x-1 bottom-0 h-[1.8px] rounded bg-current" />
              </span>
            </button>
          </div>
        </div>

        {/* mega menu */}
        {NAV.filter((n) => n.menu).map((item) =>
          hover === item.label ? (
            <div key={item.label} onMouseEnter={() => openMenu(item.label)} className="absolute inset-x-0 top-full hidden border-t border-line bg-white shadow-lift animate-fade-in lg:block">
              <div className="shell grid gap-8 py-7 lg:grid-cols-[1.4fr_1fr_1fr]">
                {item.menu!.map((col) => (
                  <div key={col.title}>
                    <p className="mb-3 text-2xs font-semibold uppercase tracking-[0.16em] text-ink-400">{col.title}</p>
                    <ul className="grid gap-x-6 sm:grid-cols-2">
                      {col.links.map((l) => (
                        <li key={l.label}>
                          <Link to={l.to} className="group flex items-baseline gap-2 border-b border-transparent py-1.5 text-[.9375rem] font-medium text-ink-700 transition hover:border-line hover:text-navy-900">
                            <span className="h-1 w-1 shrink-0 translate-y-[-2px] rounded-full bg-teal-400 opacity-0 transition group-hover:opacity-100" />
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {item.label === 'Destinations' && (
                  <div className="rounded-card bg-navy-900 p-4 text-white">
                    <p className="text-2xs font-semibold uppercase tracking-[0.18em] text-teal-300">Trending this week</p>
                    <ul className="mt-2.5 space-y-2">
                      {DESTINATIONS.slice(0, 3).map((d) => (
                        <li key={d.slug}>
                          <Link to={`/destinations/${d.slug}`} className="flex items-baseline justify-between gap-3 text-sm">
                            <span className="font-medium">{d.city}</span>
                            <span className="num text-white/60">from ${d.startFare}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Button size="sm" variant="onDark" className="mt-4 w-full" onClick={() => nav('/destinations')}>
                      Explore destinations
                    </Button>
                  </div>
                )}
                {item.label === 'Experience' && (
                  <div className="overflow-hidden rounded-card border border-line">
                    <img src="/img/cabin-business.jpg" alt="" className="h-32 w-full object-cover" loading="lazy" />
                    <div className="p-3">
                      <p className="font-display text-sm font-semibold text-navy-900">Nova Business</p>
                      <p className="mt-1 text-xs leading-snug text-ink-500">Lie-flat suites, closing doors, and à la carte dining at 39,000 ft.</p>
                      <Link to="/cabins/business" className="mt-2 inline-block text-xs font-semibold text-sky-700 hover:underline">
                        Inside the cabin →
                      </Link>
                    </div>
                  </div>
                )}
                {item.label === 'Travel Information' && (
                  <div className="rounded-card border border-line bg-mist-50 p-4">
                    <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-ink-400">Right now at the airport</p>
                    <ul className="mt-2 space-y-2 text-sm text-ink-600">
                      <li className="flex justify-between"><span>ACC security</span><span className="font-semibold text-teal-700">6 min</span></li>
                      <li className="flex justify-between"><span>NBO check-in</span><span className="font-semibold text-gold-600">18 min</span></li>
                      <li className="flex justify-between"><span>JNB ramp</span><span className="font-semibold text-navy-800">Normal ops</span></li>
                    </ul>
                    <Link to="/flight-status" className="mt-3 inline-block text-xs font-semibold text-sky-700 hover:underline">
                      Check live status →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : null,
        )}
      </header>

      {/* compact search bar under nav on scroll */}
      <div
        className={cx(
          'fixed inset-x-0 top-[var(--nav)] z-[99] hidden border-b border-line bg-white/95 backdrop-blur-xl transition-all duration-300 lg:block',
          showBar ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-3 opacity-0',
        )}
      >
        <div className="shell py-3">
          <FlightSearchWidget variant="compact" />
        </div>
      </div>

      {showBar && (
        <button className="fixed right-4 top-[calc(var(--nav)+8px)] z-[101] hidden rounded-pill border border-line bg-white px-3 py-1 text-xs font-semibold text-ink-500 shadow-card lg:block" onClick={() => setShowBar(false)}>
          Hide search bar
        </button>
      )}
      <button
        onClick={() => setShowBar((v) => !v)}
        className={cx('fixed bottom-[76px] right-4 z-[98] flex items-center gap-2 rounded-pill bg-navy-800 px-4 py-2.5 text-sm font-semibold text-white shadow-lift transition-all lg:bottom-6 lg:top-[calc(var(--nav)+10px)] lg:right-auto lg:left-4', showBar ? 'lg:bg-white lg:text-navy-800 lg:shadow-panel' : 'lg:bg-navy-800/0 lg:text-transparent lg:shadow-none lg:hover:bg-navy-800/10 lg:hover:text-white/80')}
      >
        <Search size={15} /> <span className="lg:hidden">Search flights</span>
        <span className="hidden lg:inline">{showBar ? 'Close' : 'Quick search'}</span>
      </button>
    </>
  );
}
