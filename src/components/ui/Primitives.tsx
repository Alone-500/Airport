import React from 'react';
import { Link } from 'react-router-dom';
import { cx } from '../../lib/utils';

/* ------------------------------ Button ------------------------------ */
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'onDark' | 'outline' | 'danger' | 'gold';
type BtnSize = 'sm' | 'md' | 'lg';

const V: Record<BtnVariant, string> = {
  primary: 'bg-navy-800 text-white hover:bg-navy-900 active:bg-navy-950 border border-transparent shadow-[0_1px_0_rgba(255,255,255,.14)_inset]',
  secondary: 'bg-white text-navy-800 border border-ink-200 hover:border-navy-400 hover:bg-mist-50',
  outline: 'bg-transparent text-navy-800 border border-navy-300 hover:bg-navy-50',
  ghost: 'bg-transparent text-ink-700 border border-transparent hover:bg-mist-100',
  onDark: 'bg-white text-navy-900 border border-transparent hover:bg-mist-100',
  danger: 'bg-white text-red-700 border border-red-200 hover:bg-red-50',
  gold: 'bg-gold-500 text-navy-950 border border-transparent hover:bg-gold-400',
};
const S: Record<BtnSize, string> = {
  sm: 'h-9 px-3.5 text-[.8125rem] rounded-[10px] gap-1.5',
  md: 'h-11 px-5 text-[.9375rem] rounded-[12px] gap-2',
  lg: 'h-[52px] px-7 text-[1rem] rounded-[13px] gap-2.5',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  to?: string;
  href?: string;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  full?: boolean;
  cut?: boolean;
}

export function Button({ variant = 'primary', size = 'md', className, to, href, loading, icon, iconRight, full, cut, children, disabled, ...rest }: ButtonProps) {
  const cls = cx(
    'group/btn relative inline-flex items-center justify-center font-display font-semibold tracking-[-0.01em] transition-all duration-200 select-none',
    'disabled:opacity-55 disabled:pointer-events-none active:translate-y-[1px]',
    V[variant],
    S[size],
    full && 'w-full',
    cut && 'cut-corner-sm',
    className,
  );
  const inner = (
    <>
      {loading ? <Spinner className="mr-1" /> : icon}
      <span className={cx(loading && 'opacity-80')}>{children}</span>
      {iconRight}
    </>
  );
  if (to)
    return (
      <Link to={to} className={cls} onClick={rest.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}>
        {inner}
      </Link>
    );
  if (href)
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer noopener">
        {inner}
      </a>
    );
  return (
    <button className={cls} disabled={disabled || loading} {...rest}>
      {inner}
    </button>
  );
}

export function IconButton({ label, className, children, variant = 'ghost', size = 'md', ...rest }: ButtonProps & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cx(
        'inline-grid place-items-center rounded-[11px] transition-colors',
        size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10',
        variant === 'onDark' ? 'text-white/80 hover:bg-white/10 hover:text-white' : V[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Spinner({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg className={cx('animate-spin', className)} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" opacity=".24" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------ Badges ------------------------------ */
export type Tone = 'navy' | 'sky' | 'teal' | 'ember' | 'gold' | 'red' | 'green' | 'neutral';
const TONES: Record<Tone, string> = {
  navy: 'bg-navy-50 text-navy-800 border-navy-100',
  sky: 'bg-sky-100 text-sky-900 border-sky-200',
  teal: 'bg-teal-100 text-teal-900 border-teal-300/60',
  ember: 'bg-ember-100 text-ember-700 border-ember-300/60',
  gold: 'bg-gold-100 text-gold-600 border-gold-400/40',
  red: 'bg-red-50 text-red-700 border-red-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  neutral: 'bg-mist-100 text-ink-600 border-ink-200',
};

export function Badge({ tone = 'neutral', className, children, dot, icon }: { tone?: Tone; className?: string; children: React.ReactNode; dot?: boolean; icon?: React.ReactNode }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-[3px] text-[.75rem] font-semibold leading-5 tracking-[.01em]', TONES[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {icon}
      {children}
    </span>
  );
}

export type FlightStatus = 'ON_TIME' | 'BOARDING' | 'DELAYED' | 'DEPARTED' | 'LANDED' | 'CANCELLED' | 'DIVERTED' | 'SCHEDULED' | 'IN AIR' | 'GATE CHANGE';

const STATUS_MAP: Record<string, { label: string; tone: Tone }> = {
  ON_TIME: { label: 'On time', tone: 'green' },
  SCHEDULED: { label: 'Scheduled', tone: 'neutral' },
  BOARDING: { label: 'Boarding', tone: 'sky' },
  DELAYED: { label: 'Delayed', tone: 'gold' },
  DEPARTED: { label: 'Departed', tone: 'navy' },
  IN_AIR: { label: 'In air', tone: 'navy' },
  LANDED: { label: 'Landed', tone: 'teal' },
  CANCELLED: { label: 'Cancelled', tone: 'red' },
  DIVERTED: { label: 'Diverted', tone: 'ember' },
  GATE_CHANGE: { label: 'Gate change', tone: 'gold' },
};

export function StatusBadge({ status, className, showIcon = true }: { status: FlightStatus | string; className?: string; showIcon?: boolean }) {
  const key = status.replace(' ', '_').toUpperCase();
  const meta = STATUS_MAP[key] ?? { label: status, tone: 'neutral' as Tone };
  return (
    <Badge tone={meta.tone} className={cx('uppercase tracking-[.08em] text-[.6875rem]', className)} dot>
      {showIcon && key === 'BOARDING' && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M2 12h16M13 6l5 6-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {meta.label}
    </Badge>
  );
}

/* ------------------------------ Text bits ------------------------------ */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx('eyebrow flex items-center gap-2', className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  action,
  align = 'left',
  className,
  id,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lead?: React.ReactNode;
  action?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
  id?: string;
}) {
  return (
    <div className={cx('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', align === 'center' && 'md:flex-col md:items-center', className)}>
      <div className={cx('max-w-2xl', align === 'center' && 'text-center mx-auto')}>
        {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
        <h2 id={id} className="h-1 text-balance">
          {title}
        </h2>
        {lead && <p className={cx('lead mt-3 text-pretty', align === 'center' && 'mx-auto')}>{lead}</p>}
      </div>
      {action && <div className="shrink-0 pb-1">{action}</div>}
    </div>
  );
}

/* ------------------------------ Tooltip ------------------------------ */
export function Tooltip({ label, children, side = 'top', className }: { label: React.ReactNode; children: React.ReactNode; side?: 'top' | 'bottom' | 'right'; className?: string }) {
  return (
    <span className={cx('group/tt relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cx(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-navy-900 px-2.5 py-1.5 text-[.75rem] font-medium text-white opacity-0 shadow-lift transition-all duration-150 group-hover/tt:opacity-100 group-focus-within/tt:opacity-100',
          side === 'top' && 'bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2',
          side === 'bottom' && 'top-[calc(100%+8px)] left-1/2 -translate-x-1/2',
          side === 'right' && 'left-[calc(100%+8px)] top-1/2 -translate-y-1/2',
        )}
      >
        {label}
      </span>
    </span>
  );
}

export function InfoDot({ label }: { label: React.ReactNode }) {
  return (
    <Tooltip label={label}>
      <button type="button" className="grid h-4 w-4 place-items-center rounded-full border border-ink-300 text-[.6rem] font-bold text-ink-500 hover:border-navy-400 hover:text-navy-700" aria-label="More information">
        i
      </button>
    </Tooltip>
  );
}

/* ------------------------------ Skeletons / states ------------------------------ */
export const Skeleton = ({ className }: { className?: string }) => <div className={cx('skeleton', className)} aria-hidden />;

export function FlightSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card p-5">
          <div className="flex items-center gap-6">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="hidden h-3 w-28 md:block" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('flex flex-col items-center rounded-card border border-dashed border-ink-200 bg-mist-50/60 px-6 py-14 text-center', className)}>
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-white text-navy-400 shadow-card">{icon ?? '✈'}</div>
      <h3 className="h-3">{title}</h3>
      {body && <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-500">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', body, action }: { title?: string; body?: string; action?: React.ReactNode }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-card border border-red-200 bg-red-50/70 p-5 sm:flex-row sm:items-center">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-red-600 shadow-sm">!</div>
      <div className="flex-1">
        <p className="font-display text-[.9375rem] font-semibold text-red-800">{title}</p>
        {body && <p className="mt-0.5 text-sm text-red-700/90">{body}</p>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------ Layout helpers ------------------------------ */
export function Section({
  children,
  className,
  tone = 'white',
  id,
  pad = 'lg',
}: {
  children: React.ReactNode;
  className?: string;
  tone?: 'white' | 'mist' | 'navy' | 'line';
  id?: string;
  pad?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
}) {
  return (
    <section
      id={id}
      className={cx(
        pad === 'none' ? '' : pad === 'sm' ? 'py-8 md:py-10' : pad === 'md' ? 'py-12 md:py-16' : pad === 'lg' ? 'py-16 md:py-24' : 'py-24 md:py-32',
        tone === 'mist' && 'bg-mist-50',
        tone === 'line' && 'bg-[#F4F7FA] border-y border-line',
        tone === 'navy' && 'bg-navy-900 text-white',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Divider({ className, label }: { className?: string; label?: string }) {
  if (label)
    return (
      <div className={cx('flex items-center gap-4', className)}>
        <span className="h-px flex-1 bg-line" />
        <span className="text-2xs font-semibold uppercase tracking-[0.16em] text-ink-400">{label}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
    );
  return <div className={cx('h-px w-full bg-line', className)} />;
}

/** The airline’s tricolour hairline — used as a signature rule. */
export function NovaRule({ className }: { className?: string }) {
  return (
    <div className={cx('flex items-center gap-[3px] overflow-hidden', className)} aria-hidden>
      <span className="h-[3px] w-14 rounded-full bg-navy-800" />
      <span className="h-[3px] w-8 rounded-full bg-teal-500" />
      <span className="h-[3px] w-4 rounded-full bg-gold-500" />
    </div>
  );
}

export function Meter({ value, tone = 'teal', className, label }: { value: number; tone?: 'teal' | 'navy' | 'gold' | 'ember' | 'sky'; className?: string; label?: string }) {
  const bar = { teal: 'bg-teal-500', navy: 'bg-navy-700', gold: 'bg-gold-500', ember: 'bg-ember-500', sky: 'bg-sky-500' }[tone];
  return (
    <div className={className}>
      {label && (
        <div className="mb-1.5 flex items-baseline justify-between text-[.75rem] text-ink-500">
          <span>{label}</span>
          <span className="num font-semibold text-ink-700">{Math.round(value)}%</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-mist-200">
        <div className={cx('h-full rounded-full transition-[width] duration-500', bar)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}
