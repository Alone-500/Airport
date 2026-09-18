import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, CalendarDays, CreditCard, Gauge, Heart, LogOut, PlaneTakeoff, Receipt, Search, Settings, Shield, Ticket, Trash2, User, UserRound, Wallet } from 'lucide-react';
import { cx } from '../../lib/utils';
import { Badge, Button, Divider, EmptyState } from '../../components/ui/Primitives';
import { Modal } from '../../components/ui/Overlay';
import { useStore } from '../../store/store';
import { Sunburst } from '../../components/brand/Brand';
import { Input } from '../../components/ui/Form';

export const NAV = [
  { id: 'overview', to: '/account', label: 'Overview', icon: Gauge, end: true },
  { id: 'profile', to: '/account/profile', label: 'Profile', icon: User },
  { id: 'trips', to: '/account/trips', label: 'Trips', icon: PlaneTakeoff },
  { id: 'bookings', to: '/account/bookings', label: 'Bookings', icon: Ticket },
  { id: 'rewards', to: '/account/rewards', label: 'Rewards', icon: Heart },
  { id: 'preferences', to: '/account/preferences', label: 'Preferences', icon: Settings },
  { id: 'documents', to: '/account/documents', label: 'Documents', icon: Receipt },
  { id: 'payment', to: '/account/payment', label: 'Payment methods', icon: CreditCard },
  { id: 'notifications', to: '/account/notifications', label: 'Notifications', icon: Bell },
  { id: 'security', to: '/account/security', label: 'Security', icon: Shield },
];

export function useAccountGuard() {
  const { user } = useStore();
  return user;
}

export default function AccountLayout() {
  const { user, signOut, bookings, notifications } = useStore();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [needSignIn, setNeedSignIn] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  const upcoming = bookings.filter((b) => new Date(b.itinerary.outbound.segments[0].dep).getTime() > Date.now() && b.status !== 'CANCELLED').length;

  if (!user) {
    return (
      <div className="bg-mist-50/60 pt-[calc(var(--nav)+3rem)] pb-20">
        <div className="shell-narrow">
          <EmptyState
            icon={<UserRound size={22} />}
            title="Sign in to see your account"
            body="Your bookings from this browser are already here — signing in links them to trips, points and saved travellers."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={() => nav('/sign-in?next=/account')}>Sign in</Button>
                <Button variant="secondary" onClick={() => setNeedSignIn(true)}>
                  Quick demo sign-in
                </Button>
                <Button variant="ghost" onClick={() => nav('/')}>
                  Back to site
                </Button>
              </div>
            }
          />
        </div>
        <Modal
          open={needSignIn}
          onClose={() => setNeedSignIn(false)}
          title="Sign in to the demo account"
          size="sm"
          footer={
            <>
              <Button variant="ghost" onClick={() => setNeedSignIn(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  nav('/sign-in?next=/account');
                }}
              >
                Take me there
              </Button>
            </>
          }
        >
          <p className="text-[.875rem] leading-relaxed text-ink-600">One tap on the sign-in page and the demo identity — Ama Mensah, Elite, 78,420 points, three bookings — is loaded for you.</p>
        </Modal>
      </div>
    );
  }

  return (
    <div className="bg-mist-50/60 pt-[var(--nav)]">
      {/* account header */}
      <div className="relative overflow-hidden border-b border-line bg-navy-900 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] texture-grid" />
        <div className="shell relative flex flex-wrap items-center gap-4 py-6">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[16px] bg-white/10 font-display text-[1.375rem] font-bold text-gold-400 ring-1 ring-white/15">
            {user.name
              .split(' ')
              .slice(0, 2)
              .map((x) => x[0])
              .join('')}
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-teal-300">My account</p>
            <h1 className="mt-1.5 font-display text-[1.375rem] font-semibold tracking-[-0.02em] text-white sm:text-[1.625rem]">{user.name}</h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[.8125rem] text-white/60">
              <span className="num">{user.email}</span>
              <span className="flex items-center gap-1.5">
                <Sunburst size={12} className="text-gold-400" /> {user.tier}
              </span>
              <span className="num">{user.segments} sectors this year</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-[12px] border border-white/12 bg-white/[0.06] px-3.5 py-2 text-center backdrop-blur">
              <p className="num font-display text-[1.125rem] font-semibold leading-none">{user.points.toLocaleString()}</p>
              <p className="mt-1 text-[.625rem] uppercase tracking-[0.14em] text-white/50">points</p>
            </div>
            <div className="rounded-[12px] border border-white/12 bg-white/[0.06] px-3.5 py-2 text-center backdrop-blur">
              <p className="num font-display text-[1.125rem] font-semibold leading-none">{upcoming}</p>
              <p className="mt-1 text-[.625rem] uppercase tracking-[0.14em] text-white/50">upcoming trips</p>
            </div>
            <Button size="sm" variant="onDark" onClick={() => nav('/book')}>
              Book a flight
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="border border-white/20 text-white/85 hover:bg-white/10"
              icon={<LogOut size={14} />}
              onClick={() => {
                signOut();
                nav('/');
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="shell grid gap-6 py-6 lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside>
          <div className="lg:sticky lg:top-[calc(var(--nav)+16px)]">
            <label htmlFor="acct-search" className="sr-only">
              Filter account sections
            </label>
            <div className="relative mb-3 hidden lg:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <Input id="acct-search" placeholder="Jump to…" className="h-9 pl-8 text-[.8125rem]" />
            </div>
            <nav aria-label="Account" className="-mx-gutter overflow-x-auto no-scrollbar px-gutter lg:mx-0 lg:px-0">
              <ul className="flex min-w-max gap-1.5 lg:min-w-0 lg:flex-col lg:gap-0.5">
                {NAV.map((n) => {
                  const active = n.end ? pathname === n.to : pathname.startsWith(n.to);
                  const count = n.id === 'trips' ? upcoming : n.id === 'notifications' ? unread : n.id === 'bookings' ? bookings.length : 0;
                  return (
                    <li key={n.id} className="shrink-0">
                      <NavLink
                        to={n.to}
                        end={n.end}
                        className={cx(
                          'flex items-center gap-2.5 rounded-[11px] px-3 py-2 text-[.875rem] font-medium transition lg:rounded-[10px]',
                          active ? 'bg-navy-800 text-white shadow-card' : 'border border-line bg-white text-ink-600 hover:border-navy-300 hover:text-navy-900 lg:border-transparent lg:bg-transparent lg:py-2',
                        )}
                      >
                        <n.icon size={16} className={active ? 'text-gold-400' : 'text-ink-400'} />
                        <span className="whitespace-nowrap">{n.label}</span>
                        {count > 0 && <span className={cx('num ml-auto rounded-pill px-1.5 py-0.5 text-[.625rem] font-bold', active ? 'bg-white/20 text-white' : 'bg-mist-100 text-ink-500')}>{count}</span>}
                      </NavLink>
                    </li>
                  );
                })}
                <li className="shrink-0 lg:mt-3 lg:border-t lg:border-line lg:pt-3">
                  <button onClick={() => nav('/admin')} className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-[.875rem] font-medium text-ink-500 transition hover:bg-mist-100 hover:text-navy-900">
                    <Settings size={16} className="text-ink-400" /> Staff dashboard
                  </button>
                </li>
              </ul>
            </nav>

            <div className="mt-4 hidden rounded-card border border-line bg-white p-4 lg:block">
              <p className="flex items-center gap-2 font-display text-[.875rem] font-semibold text-navy-900">
                <CalendarDays size={15} className="text-teal-600" /> Elite status
              </p>
              <p className="mt-2 text-[.75rem] leading-relaxed text-ink-500">5,820 points from Elite Plus. Two qualifying sectors left this year.</p>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-mist-200">
                <div className="h-full rounded-full bg-teal-500" style={{ width: '94%' }} />
              </div>
              <Divider className="my-3" />
              <button onClick={() => nav('/account/rewards')} className="text-[.8125rem] font-semibold text-sky-700 hover:underline">
                See rewards detail →
              </button>
            </div>

            <div className="mt-4 hidden rounded-card border border-dashed border-red-200 bg-red-50/50 p-4 lg:block">
              <p className="font-display text-[.8125rem] font-semibold text-red-800">Close this account</p>
              <p className="mt-1 text-[.75rem] leading-relaxed text-red-700/90">Deletes trips, saved travellers and wallet credit after 30 days.</p>
              <Button size="sm" variant="danger" className="mt-2.5 w-full" icon={<Trash2 size={13} />} onClick={() => nav('/account/security?danger=1')}>
                Manage
              </Button>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ---------------------------- shared bits ---------------------------- */
export function AccountHeader({ title, lead, action, badge }: { title: string; lead?: string; action?: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-display text-[clamp(1.375rem,3vw,1.875rem)] font-semibold tracking-[-0.025em] text-navy-900">{title}</h1>
          {badge}
        </div>
        {lead && <p className="mt-1.5 max-w-2xl text-[.9375rem] leading-relaxed text-ink-500">{lead}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

export function AccountCard({ title, lead, children, action, tone = 'white', className }: { title?: string; lead?: string; children: React.ReactNode; action?: React.ReactNode; tone?: 'white' | 'navy' | 'mist'; className?: string }) {
  return (
    <section className={cx('overflow-hidden rounded-card', tone === 'navy' ? 'bg-navy-900 text-white' : tone === 'mist' ? 'border border-line bg-mist-50' : 'border border-line bg-white', className)}>
      {(title || action) && (
        <div className={cx('flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5', tone === 'navy' ? 'border-b border-white/10' : 'border-b border-line')}>
          <div className="min-w-0">
            {title && <h2 className={cx('font-display text-[1rem] font-semibold', tone === 'navy' ? 'text-white' : 'text-navy-900')}>{title}</h2>}
            {lead && <p className={cx('mt-0.5 text-[.8125rem]', tone === 'navy' ? 'text-white/60' : 'text-ink-500')}>{lead}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cx('px-4 py-4 sm:px-5', tone === 'navy' && 'text-white')}>{children}</div>
    </section>
  );
}

export function StatTile({ label, value, sub, tone = 'navy', icon }: { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: 'navy' | 'teal' | 'gold' | 'ember'; icon?: React.ReactNode }) {
  const tint = { navy: 'bg-navy-50 text-navy-700', teal: 'bg-teal-50 text-teal-700', gold: 'bg-gold-100 text-gold-600', ember: 'bg-ember-100 text-ember-700' }[tone];
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-400">{label}</p>
          <p className="num mt-1.5 font-display text-[1.5rem] font-semibold leading-none text-navy-900">{value}</p>
        </div>
        {icon && <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-[10px]', tint)}>{icon}</span>}
      </div>
      {sub && <p className="mt-2 text-[.75rem] leading-snug text-ink-500">{sub}</p>}
    </div>
  );
}

export function Row({ icon, title, meta, children, onClick, badge }: { icon?: React.ReactNode; title: React.ReactNode; meta?: React.ReactNode; children?: React.ReactNode; onClick?: () => void; badge?: React.ReactNode }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp onClick={onClick} className={cx('flex w-full flex-wrap items-center gap-3 border-b border-line px-4 py-3 text-left last:border-0 sm:px-5', onClick && 'transition hover:bg-mist-50')}>
      {icon && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-mist-100 text-navy-700">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[.9375rem] font-medium text-navy-900">{title}</span>
        {meta && <span className="mt-0.5 block truncate text-[.8125rem] text-ink-500">{meta}</span>}
      </span>
      {badge}
      {children}
    </Comp>
  );
}

export const AccountBadge = Badge;
export const WalletIcon = Wallet;
