import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Clock, MapPin, Plane } from 'lucide-react';
import { cx, durationLabel, fmtDate, money } from '../../lib/utils';
import type { Destination } from '../../types';
import type { Offer } from '../../data/offers';
import { Photo } from '../brand/Brand';
import { Badge, Button, Meter } from '../ui/Primitives';
import { useStore } from '../../store/store';

/* ------------------------------ destination card ------------------------------ */
export function DestinationCard({ d, size = 'md', showPrice = true, className }: { d: Destination; size?: 'sm' | 'md' | 'lg'; showPrice?: boolean; className?: string }) {
  const { prefs } = useStore();
  const big = size === 'lg';
  return (
    <article className={cx('group relative flex h-full flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition-all duration-300 hover:shadow-lift', big && 'min-h-[420px]', className)}>
      <div className={cx('relative overflow-hidden', big ? 'h-[62%]' : 'h-44')}>
        <Photo src={d.img} alt={`${d.city}, ${d.country}`} seed={d.slug} label={d.code} className="h-full w-full" imgClassName="transition-transform duration-[900ms] group-hover:scale-[1.06]" priority={big} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/72 via-navy-950/10 to-transparent" />
        <div className="absolute inset-x-3 bottom-2.5 flex items-end justify-between gap-2 text-white">
          <div className="min-w-0">
            <p className="font-display text-[1.125rem] font-semibold leading-tight drop-shadow-sm">{d.city}</p>
            <p className="text-[.75rem] text-white/75">
              {d.country} · {d.code}
            </p>
          </div>
          <span className="num shrink-0 rounded-pill bg-white/15 px-2 py-1 text-[.6875rem] font-semibold backdrop-blur-md">
            {d.durationMin ? durationLabel(d.durationMin) : 'Hub'}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className={cx('text-ink-600', big ? 'text-[.9375rem] leading-relaxed' : 'line-clamp-2 text-[.8125rem] leading-relaxed')}>{d.blurb}</p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {d.tags.slice(0, big ? 3 : 2).map((t) => (
            <span key={t} className="rounded-pill bg-mist-100 px-2 py-0.5 text-[.6875rem] font-medium capitalize text-ink-500">
              {String(t ?? '').replace(/-/g, ' ')}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          {showPrice ? (
            <p className="leading-none">
              <span className="block text-[.6875rem] uppercase tracking-[0.1em] text-ink-400">from</span>
              <span className="num font-display text-[1.25rem] font-semibold text-navy-900">{money(d.startFare, prefs.currency)}</span>
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-[.8125rem] text-ink-500">
              <Plane size={14} className="text-teal-600" /> {d.weekly} flights a week
            </p>
          )}
          <Link to={`/destinations/${d.slug}`} className="inline-flex items-center gap-1 font-display text-[.8125rem] font-semibold text-navy-800 transition group-hover:text-sky-700">
            Explore <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------ offer card ------------------------------ */
export function OfferCard({ o, compact }: { o: Offer; compact?: boolean }) {
  const nav = useNavigate();
  const { prefs, toast } = useStore();
  const toneBg = {
    navy: 'from-navy-900 to-navy-800 text-white',
    teal: 'from-teal-900 to-teal-700 text-white',
    ember: 'from-ember-700 to-ember-600 text-white',
    gold: 'from-gold-600 to-gold-500 text-navy-950',
    sky: 'from-sky-900 to-sky-700 text-white',
  }[o.tone];

  if (compact)
    return (
      <article className="group flex items-center gap-4 rounded-[14px] border border-line bg-white p-3 transition hover:border-sky-300 hover:shadow-card">
        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-[10px]">
          <Photo src={o.img} alt={o.city} seed={o.id} className="h-full w-full" imgClassName="transition-transform duration-700 group-hover:scale-110" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[.9375rem] font-semibold text-navy-900">{o.title}</p>
          <p className="truncate text-[.8125rem] text-ink-500">
            {o.from} → {o.code} · {o.cabin}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="num font-display text-[1.0625rem] font-semibold text-navy-900">{money(o.priceUSD, prefs.currency)}</p>
          <p className="text-[.6875rem] text-ink-400">one way</p>
        </div>
      </article>
    );

  return (
    <article className={cx('group relative flex h-full flex-col overflow-hidden rounded-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift', o.tone === 'gold' ? '' : '')}>
      <div className={cx('relative flex flex-col justify-between overflow-hidden p-5', toneBg)} style={{ minHeight: compact ? 0 : 300 }}>
        <div className="pointer-events-none absolute inset-0 opacity-90">
          <Photo src={o.img} alt="" seed={o.id} className="h-full w-full" imgClassName="object-cover opacity-35 transition-transform duration-[1200ms] group-hover:scale-105" />
        </div>
        <div className={cx('pointer-events-none absolute inset-0', o.tone === 'gold' ? 'bg-gradient-to-t from-white/25 to-navy-950/45' : 'bg-gradient-to-t from-navy-950/55 to-transparent')} />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            {o.badge && <span className="rounded-pill bg-white/18 px-2.5 py-1 text-[.6875rem] font-semibold uppercase tracking-wider backdrop-blur-md">{o.badge}</span>}
            <span className="num text-[.75rem] opacity-80">{fmtDate(o.bookBy.split(',')[0], 'short')} deadline</span>
          </div>
          <h3 className="mt-8 max-w-sm font-display text-[1.375rem] font-semibold leading-snug">{o.title}</h3>
          <p className={cx('mt-2 max-w-md text-[.875rem] leading-relaxed', o.tone === 'gold' ? 'text-navy-950/80' : 'text-white/75')}>{o.kicker}</p>
        </div>
        <div className="relative mt-6 flex items-end justify-between gap-4">
          <p className="leading-none">
            <span className={cx('block text-[.6875rem] uppercase tracking-[0.14em]', o.tone === 'gold' ? 'text-navy-950/60' : 'text-white/60')}>from</span>
            <span className="num mt-1 flex items-baseline gap-2 font-display text-[2rem] font-semibold leading-none">
              {money(o.priceUSD, prefs.currency)}
              {o.wasUSD && <span className={cx('text-[.875rem] font-medium line-through opacity-60', o.tone === 'gold' ? 'text-navy-950' : 'text-white')}>{money(o.wasUSD, prefs.currency)}</span>}
            </span>
            <span className={cx('mt-1 block text-[.75rem]', o.tone === 'gold' ? 'text-navy-950/65' : 'text-white/60')}>{o.cabin} · {o.from} → {o.code}</span>
          </p>
          <Button size="sm" variant={o.tone === 'gold' ? 'primary' : 'onDark'} onClick={() => nav('/search')}>
            Book now
          </Button>
        </div>
      </div>
      <div className="bg-white p-5">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[.8125rem]">
          <span className="flex items-center gap-1.5 text-ink-600">
            <Clock size={14} className="text-ink-400" /> Travel {o.travelWindow}
          </span>
          <span className="flex items-center gap-1.5 text-ink-600">
            <MapPin size={14} className="text-ink-400" /> {o.destination}
          </span>
        </div>
        <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
          {o.conditions.slice(0, 3).map((c) => (
            <li key={c} className="flex gap-2 text-[.8125rem] leading-snug text-ink-500">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-teal-500" />
              {c}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between gap-3">
          <button onClick={() => toast({ tone: 'info', title: 'Conditions', body: o.conditions.join(' ') })} className="text-[.8125rem] font-semibold text-sky-700 underline-offset-4 hover:underline">
            Full conditions
          </button>
          <button onClick={() => nav('/search')} className="inline-flex items-center gap-1 text-[.8125rem] font-semibold text-navy-900 hover:text-sky-700">
            Search this route <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------ misc shared ------------------------------ */
export function StoryCard({ story, layout = 'stack' }: { story: { id: string; eyebrow: string; title: string; standfirst: string; author: string; minutes: number; img: string; city: string }; layout?: 'stack' | 'overlay' | 'wide' }) {
  const inner = (
    <>
      <p className="eyebrow">{story.eyebrow}</p>
      <h3 className={cx('mt-2 font-display font-semibold leading-snug text-navy-900', layout === 'overlay' ? 'text-white text-[1.375rem]' : 'text-[1.125rem]')}>{story.title}</h3>
      <p className={cx('mt-2 text-[.875rem] leading-relaxed line-clamp-3', layout === 'overlay' ? 'text-white/80' : 'text-ink-500')}>{story.standfirst}</p>
      <p className={cx('mt-3 flex items-center gap-2 text-[.75rem]', layout === 'overlay' ? 'text-white/60' : 'text-ink-400')}>
        <span className="font-medium">{story.author}</span> · {story.minutes} min read · {story.city}
      </p>
    </>
  );
  if (layout === 'overlay')
    return (
      <Link to={`/stories/${story.id}`} className="group relative flex min-h-[380px] flex-col justify-end overflow-hidden rounded-card p-6 shadow-card transition hover:shadow-lift">
        <Photo src={story.img} alt={story.title} seed={story.id} className="absolute inset-0" imgClassName="transition-transform duration-[1200ms] group-hover:scale-105" />
        <span className="absolute inset-0 bg-gradient-to-t from-navy-950/88 via-navy-950/45 to-transparent" />
        <span className="relative">{inner}</span>
      </Link>
    );
  if (layout === 'wide')
    return (
      <Link to={`/stories/${story.id}`} className="group grid gap-4 rounded-card border border-line bg-white p-3 transition hover:border-sky-300 hover:shadow-card sm:grid-cols-[160px_1fr]">
        <Photo src={story.img} alt="" seed={story.id} className="h-28 rounded-[10px] sm:h-full" />
        <div className="min-w-0 py-1 pr-2">{inner}</div>
      </Link>
    );
  return (
    <Link to={`/stories/${story.id}`} className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition hover:-translate-y-1 hover:shadow-lift">
      <Photo src={story.img} alt="" seed={story.id} className="h-44" imgClassName="transition-transform duration-700 group-hover:scale-105" />
      <div className="flex flex-1 flex-col p-4">{inner}</div>
    </Link>
  );
}

export function LoadFactorPill({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Meter value={value} tone={value > 88 ? 'ember' : value > 75 ? 'teal' : 'sky'} className="w-20" />
      <span className="num text-[.75rem] font-semibold text-ink-600">{Math.round(value)}%</span>
    </span>
  );
}

export function AmenityRow({ items }: { items: { icon: React.ReactNode; label: string; value: string; tone?: 'good' | 'bad' | 'neutral' }[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((i) => (
        <li key={i.label} className="flex items-start gap-2.5">
          <span className={cx('mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-[9px]', i.tone === 'bad' ? 'bg-mist-100 text-ink-400' : 'bg-teal-50 text-teal-700')}>{i.icon}</span>
          <span className="min-w-0">
            <span className="block text-[.6875rem] uppercase tracking-[0.1em] text-ink-400">{i.label}</span>
            <span className="block text-[.875rem] font-medium text-navy-900">{i.value}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function InfoTag({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <Badge tone="neutral" icon={icon}>
      {children}
    </Badge>
  );
}
