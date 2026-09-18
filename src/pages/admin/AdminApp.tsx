import { useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import {
  Activity, Bell, ChevronDown, ChevronLeft, CreditCard, Gift, Globe, LayoutDashboard, LifeBuoy, LogOut, MapPin, Menu as MenuIcon, Package, Plane, PlaneTakeoff,
  Receipt, RefreshCw, Search, Settings, Shield, Star, Ticket, TrendingUp, User, Users, Wrench, X,
} from 'lucide-react';
import { cx, fmtDate, money, toISODate } from '../../lib/utils';
import { Badge, Button, StatusBadge } from '../../components/ui/Primitives';
import { Input } from '../../components/ui/Form';
import { Menu, MenuDivider, MenuItem } from '../../components/ui/Overlay';
import { KpiCard } from '../../components/ui/Table';
import { useStore } from '../../store/store';
import { Sunburst } from '../../components/brand/Brand';
import { ADMIN_BOOKINGS, ADMIN_FLIGHTS, DEMO_LOGIN } from '../../data/admin';
import { statusBoard } from '../../data/flights';
import { OpsPages } from './ops';
import { CommercialPages } from './commercial';
import { FinancePages } from './finance';
import { PlatformPages } from './platform';
import { AdminDashboard } from './dashboard';

export const NAV_GROUPS: { title: string; items: { to: string; label: string; icon: typeof Activity; badge?: string; end?: boolean }[] }[] = [
  {
    title: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Operations',
    items: [
      { to: '/admin/flights', label: 'Flights', icon: Plane, badge: '34' },
      { to: '/admin/bookings', label: 'Bookings', icon: Ticket, badge: '48' },
      { to: '/admin/passengers', label: 'Passengers', icon: Users, badge: '1.2k' },
      { to: '/admin/airports', label: 'Airports', icon: MapPin },
      { to: '/admin/aircraft', label: 'Aircraft', icon: Wrench, badge: '2 AOG' },
      { to: '/admin/destinations', label: 'Destinations', icon: Globe },
    ],
  },
  {
    title: 'Commercial',
    items: [
      { to: '/admin/fares', label: 'Fares', icon: Receipt },
      { to: '/admin/offers', label: 'Offers & promos', icon: Gift },
      { to: '/admin/loyalty', label: 'Loyalty', icon: Star },
      { to: '/admin/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    title: 'Finance & service',
    items: [
      { to: '/admin/payments', label: 'Payments', icon: CreditCard },
      { to: '/admin/refunds', label: 'Refunds', icon: RefreshCw, badge: '6' },
      { to: '/admin/baggage', label: 'Baggage', icon: Package },
      { to: '/admin/support', label: 'Customer support', icon: LifeBuoy, badge: '18' },
    ],
  },
  {
    title: 'Platform',
    items: [
      { to: '/admin/content', label: 'Content', icon: LayoutDashboard },
      { to: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
      { to: '/admin/users', label: 'Users', icon: User },
      { to: '/admin/roles', label: 'Roles', icon: Shield },
      { to: '/admin/audit', label: 'Audit logs', icon: Activity },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function AdminApp() {
  const { user, signIn, signOut } = useStore();
  const nav = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const staff = user?.role === 'staff';

  if (!staff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A1A2E] px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-white/10 text-gold-400 ring-1 ring-white/15">
              <Sunburst size={24} />
            </span>
            <div>
              <p className="font-display text-[1.0625rem] font-bold text-white">AeroNova Operations</p>
              <p className="text-[.75rem] uppercase tracking-[0.16em] text-teal-300/80">Staff console · v14.2</p>
            </div>
          </div>
          <div className="rounded-[18px] bg-white p-6 shadow-lift">
            <h1 className="font-display text-[1.25rem] font-semibold text-navy-900">Sign in to the dashboard</h1>
            <p className="mt-1.5 text-[.875rem] leading-relaxed text-ink-500">
              This console holds live booking, crew and payment data. Access is logged, dual-approved for refunds over USD 5,000, and every read of a passenger record is written to the audit trail.
            </p>
            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-[.75rem] font-semibold uppercase tracking-[0.08em] text-ink-500">Staff email</span>
                <Input defaultValue={DEMO_LOGIN.admin.email} className="h-11" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[.75rem] font-semibold uppercase tracking-[0.08em] text-ink-500">Password</span>
                <Input type="password" defaultValue="ops-console" className="h-11" />
              </label>
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-[.8125rem] text-ink-600">
                  <input type="checkbox" defaultChecked /> Trust this station for 12 h
                </label>
                <span className="text-[.8125rem] font-semibold text-sky-700">SSO / hardware key</span>
              </div>
              <Button
                size="lg"
                full
                onClick={() => {
                  signIn(DEMO_LOGIN.admin.email, DEMO_LOGIN.admin.name);
                  nav('/admin');
                }}
              >
                Sign in as {DEMO_LOGIN.admin.role}
              </Button>
              <p className="text-center text-[.75rem] text-ink-400">Demo build — any credentials work. MFA is simulated after this screen.</p>
            </div>
          </div>
          {user && (
            <button onClick={() => { signIn(DEMO_LOGIN.admin.email, DEMO_LOGIN.admin.name); }} className="mt-4 w-full rounded-[12px] border border-white/15 bg-white/5 py-2.5 text-[.875rem] font-semibold text-white/85 transition hover:bg-white/10">
              Switch {user.email.split('@')[0]} to staff access
            </button>
          )}
          <Link to="/" className="mt-4 block text-center text-[.8125rem] text-white/50 hover:text-white">
            ← Back to the public site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F2F5F9] text-[#1B2733]">
      {/* sidebar */}
      <aside
        className={cx(
          'z-40 hidden shrink-0 flex-col border-r border-[#1E3A5C] bg-[#0B2340] text-white/80 transition-[width] duration-200 lg:flex',
          collapsed ? 'w-[72px]' : 'w-[248px]',
        )}
      >
        <div className={cx('flex h-14 shrink-0 items-center gap-2.5 border-b border-white/10 px-3', collapsed && 'justify-center px-0')}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-white/10 text-gold-400">
            <Sunburst size={17} />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate font-display text-[.875rem] font-bold text-white">AeroNova Ops</span>
              <span className="block text-[.625rem] uppercase tracking-[0.14em] text-teal-300/70">Station: ACC · Galaxy T1</span>
            </span>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Admin sections">
          {NAV_GROUPS.map((g) => (
            <div key={g.title} className="mb-3">
              {!collapsed && <p className="px-2 pb-1.5 text-[.5625rem] font-semibold uppercase tracking-[0.18em] text-white/35">{g.title}</p>}
              <ul className="space-y-0.5">
                {g.items.map((it) => (
                  <li key={it.to}>
                    <NavLink
                      to={it.to}
                      end={it.end}
                      className={({ isActive }) =>
                        cx('group flex items-center gap-2.5 rounded-[9px] px-2 py-[7px] text-[.8125rem] font-medium transition', isActive ? 'bg-white/12 text-white shadow-[inset_2px_0_0_#0FA79A]' : 'hover:bg-white/[0.06] hover:text-white', collapsed && 'justify-center')
                      }
                      title={collapsed ? it.label : undefined}
                    >
                      <it.icon size={15} className="shrink-0 opacity-80" />
                      {!collapsed && <span className="min-w-0 flex-1 truncate">{it.label}</span>}
                      {!collapsed && it.badge && <span className="num shrink-0 rounded-pill bg-white/10 px-1.5 py-0.5 text-[.625rem] font-semibold text-white/70">{it.badge}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="shrink-0 border-t border-white/10 p-2">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex w-full items-center justify-center gap-2 rounded-[9px] py-2 text-[.75rem] font-semibold text-white/55 transition hover:bg-white/[0.06] hover:text-white"
          >
            <ChevronLeft size={14} className={cx('transition-transform', collapsed && 'rotate-180')} />
            {!collapsed && 'Collapse'}
          </button>
          <Link to="/" className="mt-1 flex items-center justify-center gap-2 rounded-[9px] py-2 text-[.75rem] font-semibold text-white/55 transition hover:bg-white/[0.06] hover:text-white">
            <Globe size={14} /> {!collapsed && 'View public site'}
          </Link>
        </div>
      </aside>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-[#071A2E]/60 backdrop-blur-sm" />
          <div className="absolute inset-y-0 left-0 w-[264px] overflow-y-auto bg-[#0B2340] p-3 text-white/80" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-[.9375rem] font-bold text-white">AeroNova Ops</span>
              <button onClick={() => setMobileOpen(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" aria-label="Close menu">
                <X size={16} />
              </button>
            </div>
            {NAV_GROUPS.map((g) => (
              <div key={g.title} className="mb-3">
                <p className="px-2 pb-1 text-[.5625rem] font-semibold uppercase tracking-[0.18em] text-white/35">{g.title}</p>
                <ul className="space-y-0.5">
                  {g.items.map((it) => (
                    <li key={it.to}>
                      <NavLink
                        to={it.to}
                        end={it.end}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) => cx('flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[.875rem] font-medium', isActive ? 'bg-white/12 text-white' : 'text-white/70')}
                      >
                        <it.icon size={15} /> {it.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-[#E1E8F0] bg-white/90 px-3 backdrop-blur-xl sm:px-4">
          <button onClick={() => setMobileOpen(true)} className="grid h-9 w-9 place-items-center rounded-[9px] text-ink-600 hover:bg-mist-100 lg:hidden" aria-label="Open sections">
            <MenuIcon size={17} />
          </button>
          <div className="relative hidden min-w-[180px] flex-1 sm:block md:max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <Input placeholder="Search PNR, ticket, passenger, aircraft reg, case…" className="h-9 pl-9 text-[.875rem]" aria-label="Search the console" />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="hidden items-center gap-1.5 rounded-pill border border-teal-200 bg-teal-50 px-2.5 py-1 text-[.6875rem] font-semibold uppercase tracking-wide text-teal-800 md:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500" /> Ops feed live · {toISODate(new Date())}
            </span>
            <Menu label={(o) => <span className="flex items-center gap-1.5 text-[.8125rem] font-semibold text-ink-700">ACC<ChevronDown size={13} className={cx('transition-transform', o && 'rotate-180')} /></span>} widthClass="w-56">
              {() => (
                <>
                  {['ACC — Accra (Galaxy T1)', 'NBO — Nairobi (Concourse C)', 'JNB — Johannesburg (Terminal A)', 'LOS — Lagos (International)'].map((s) => (
                    <MenuItem key={s} onClick={() => close()}>
                      {s}
                    </MenuItem>
                  ))}
                </>
              )}
            </Menu>
            <Menu label={() => <span className="relative grid h-9 w-9 place-items-center rounded-[9px] text-ink-600 hover:bg-mist-100"><Bell size={16} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-ember-500" /></span>} widthClass="w-80">
              {() => (
                <>
                  <p className="px-2.5 pb-1 pt-1.5 text-2xs font-semibold uppercase tracking-wider text-ink-400">Needs a decision</p>
                  {[
                    ['2 aircraft AOG', '9G-AZD hydraulic · parts ETA 14:20'],
                    ['6 refunds over SLA', 'Oldest is 13 days — R3300 pending docs'],
                    ['18 open support cases', '3 marked urgent, 1 about a damaged cello'],
                    ['Gate change board', 'A12 → C4 for 4 departures, not yet pushed'],
                  ].map(([t, d]) => (
                    <MenuItem key={t} desc={d} onClick={() => close()}>
                      {t}
                    </MenuItem>
                  ))}
                  <MenuDivider />
                  <MenuItem onClick={() => close()}>Open all 31 items</MenuItem>
                </>
              )}
            </Menu>
            <Menu
              label={(o) => (
                <span className="flex items-center gap-2 rounded-[9px] py-1 pl-1 pr-1.5 hover:bg-mist-100">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0B2340] font-display text-[.6875rem] font-bold text-gold-400">AK</span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-[.8125rem] font-semibold leading-none text-navy-900">{user.name}</span>
                    <span className="block text-[.625rem] uppercase tracking-wide text-ink-400">{DEMO_LOGIN.admin.role}</span>
                  </span>
                  <ChevronDown size={13} className={cx('text-ink-400 transition-transform', o && 'rotate-180')} />
                </span>
              )}
              widthClass="w-64"
            >
              {() => (
                <>
                  <MenuItem desc="Logged in from 41.60.x · Galaxy T1" onClick={() => nav('/admin/settings')}>
                    Console preferences
                  </MenuItem>
                  <MenuItem onClick={() => nav('/admin/audit')}>My audit trail</MenuItem>
                  <MenuItem onClick={() => nav('/admin/users')}>Access & roles</MenuItem>
                  <MenuDivider />
                  <MenuItem
                    icon={<LogOut size={15} />}
                    onClick={() => {
                      signOut();
                      nav('/');
                    }}
                  >
                    Sign out
                  </MenuItem>
                </>
              )}
            </Menu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-3 pb-10 pt-4 sm:px-4 lg:px-6">
          <Routes>
            <Route index element={<AdminDashboard />} />
            {OpsPages.map(({ path, el }) => (
              <Route key={path} path={path} element={el} />
            ))}
            {CommercialPages.map(({ path, el }) => (
              <Route key={path} path={path} element={el} />
            ))}
            {FinancePages.map(({ path, el }) => (
              <Route key={path} path={path} element={el} />
            ))}
            {PlatformPages.map(({ path, el }) => (
              <Route key={path} path={path} element={el} />
            ))}
            <Route
              path="*"
              element={
                <div className="py-16 text-center">
                  <p className="font-display text-[1.125rem] font-semibold text-navy-900">That console section is not built</p>
                  <p className="mt-1.5 text-[.875rem] text-ink-500">Twenty-one sections are wired up; check the spelling in the sidebar.</p>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/* ------------------------------ shared admin bits ------------------------------ */
export function AdminPage({ title, lead, actions, children }: { title: string; lead?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-[1.375rem] font-semibold tracking-[-0.02em] text-[#0B2340]">{title}</h1>
          {lead && <p className="mt-1 max-w-3xl text-[.875rem] leading-relaxed text-ink-500">{lead}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function Panel({ title, lead, right, children, className, pad = true }: { title?: React.ReactNode; lead?: string; right?: React.ReactNode; children: React.ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={cx('overflow-hidden rounded-[14px] border border-[#E1E8F0] bg-white shadow-[0_1px_2px_rgba(11,35,64,.04)]', className)}>
      {(title || right) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E1E8F0] px-4 py-3">
          <div className="min-w-0">
            {title && <h2 className="font-display text-[.9375rem] font-semibold text-[#0B2340]">{title}</h2>}
            {lead && <p className="mt-0.5 text-[.75rem] text-ink-400">{lead}</p>}
          </div>
          {right}
        </div>
      )}
      <div className={pad ? 'p-4' : ''}>{children}</div>
    </section>
  );
}

export { KpiCard };

/** small bar list used in several admin panels */
export function BarList({ rows, tone = 'navy', money: isMoney }: { rows: { label: React.ReactNode; value: number; note?: string }[]; tone?: 'navy' | 'teal' | 'gold' | 'ember'; money?: boolean }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  const bar = { navy: 'bg-[#0B2340]', teal: 'bg-teal-500', gold: 'bg-gold-500', ember: 'bg-ember-500' }[tone];
  return (
    <ul className="space-y-2.5">
      {rows.map((r, i) => (
        <li key={i} className="group">
          <div className="flex items-baseline justify-between gap-3 text-[.8125rem]">
            <span className="min-w-0 truncate font-medium text-[#1B2733]">{r.label}</span>
            <span className="num shrink-0 font-semibold text-[#0B2340]">{isMoney ? money2(r.value) : r.value.toLocaleString()}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-mist-200">
            <div className={cx('h-full rounded-full transition-all duration-500 group-hover:opacity-90', bar)} style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          {r.note && <p className="num mt-1 text-[.6875rem] text-ink-400">{r.note}</p>}
        </li>
      ))}
    </ul>
  );
}

const money2 = (n: number) => money(n);

export function StatusPill({ status }: { status: string }) {
  return <StatusBadge status={status} className="!text-[.625rem]" />;
}

export function MiniTable({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-[.8125rem]">
        <thead>
          <tr className="border-b border-[#E1E8F0] text-2xs uppercase tracking-wider text-ink-400">
            {head.map((h, i) => (
              <th key={h + i} className={cx('px-3 py-2 font-semibold', i > 1 && 'text-right')}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EDF1F6]">
          {rows.map((r, i) => (
            <tr key={i} className="transition hover:bg-[#F7FAFC]">
              {r.map((c, j) => (
                <td key={j} className={cx('px-3 py-2', j > 1 && 'num text-right', j === 0 && 'font-semibold text-[#0B2340]')}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const ADMIN_SNAPSHOT = {
  flightsToday: ADMIN_FLIGHTS.length,
  bookings: ADMIN_BOOKINGS.length,
  departures: statusBoard(toISODate(new Date()), 'ACC').slice(0, 6),
  nextDelay: statusBoard(toISODate(new Date())).find((f) => f.status === 'DELAYED'),
  fmtDate,
  PlaneTakeoff,
  Plane,
  Receipt,
  Ticket,
  Users,
  CreditCard,
  TrendingUp,
  Activity,
  X,
  Search,
  Bell,
  LogOut,
  User,
  Shield,
  Settings,
  Gift,
  Star,
  LifeBuoy,
  Package,
  MapPin,
  Wrench,
  RefreshCw,
  Globe,
  LayoutDashboard,
  MenuIcon,
  ChevronDown,
  ChevronLeft,
  Input,
  Badge,
  Button,
  cx,
  fmt: (n: number) => n.toLocaleString(),
};
