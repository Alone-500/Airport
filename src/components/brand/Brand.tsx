import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { cx, hash, rng } from '../../lib/utils';

/** The gold sunburst from the tail — used as the mark. */
export function Sunburst({ size = 28, className, spin }: { size?: number; className?: string; spin?: boolean }) {
  const rays = Array.from({ length: 14 }, (_, i) => i);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={cx(spin && 'animate-[spin_18s_linear_infinite]', className)} aria-hidden>
      <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" opacity=".95">
        {rays.map((i) => {
          const a = (i / rays.length) * Math.PI * 2;
          const r1 = 8.5;
          const r2 = i % 2 ? 20 : 15;
          return <line key={i} x1={24 + Math.cos(a) * r1} y1={24 + Math.sin(a) * r1} x2={24 + Math.cos(a) * r2} y2={24 + Math.sin(a) * r2} />;
        })}
      </g>
      <circle cx="24" cy="24" r="5.4" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ light, className, compact }: { light?: boolean; className?: string; compact?: boolean }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-[11px]', light ? 'bg-white/10 text-gold-400' : 'bg-navy-800 text-gold-500')}>
        <Sunburst size={22} />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className={cx('block font-display text-[1.0625rem] font-bold tracking-[-0.02em]', light ? 'text-white' : 'text-navy-900')}>
            AeroNova
          </span>
          <span className={cx('mt-[3px] block font-display text-[.5625rem] font-semibold uppercase tracking-[0.3em]', light ? 'text-white/55' : 'text-ink-400')}>Airways</span>
        </span>
      )}
    </span>
  );
}

export function Logo({ light, href = '/', className, compact }: { light?: boolean; href?: string; className?: string; compact?: boolean }) {
  return (
    <Link to={href} aria-label="AeroNova Airways — home" className={cx('inline-flex shrink-0 items-center rounded-[12px] p-0.5 transition hover:opacity-92', className)}>
      <Wordmark light={light} compact={compact} />
    </Link>
  );
}

/** Wing-shaped brand flourish, used in footers and section corners. */
export function WingMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 60" className={className} aria-hidden fill="none">
      <path d="M2 52 C 70 46 138 30 238 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity=".9" />
      <path d="M2 58 C 78 52 150 38 238 18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".35" />
      <path d="M2 46 C 66 40 128 24 214 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".35" />
    </svg>
  );
}

/** A stylised route arc between two points. */
export function RouteArc({ className, dashes = true }: { className?: string; dashes?: boolean }) {
  return (
    <svg viewBox="0 0 420 160" className={className} fill="none" aria-hidden>
      <path d="M14 142 C 120 10 300 8 406 120" stroke="currentColor" strokeWidth="2" strokeDasharray={dashes ? '7 9' : undefined} strokeLinecap="round" opacity=".55" />
      <circle cx="14" cy="142" r="5.5" fill="currentColor" />
      <circle cx="406" cy="120" r="5.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <g transform="translate(208 30) rotate(16)">
        <path d="M0 0 L22 6 L0 12 L5 6 Z" fill="currentColor" />
      </g>
    </svg>
  );
}

/** Aircraft side profile, abstract — used as a watermark. */
export function PlaneGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 80" className={className} aria-hidden fill="currentColor">
      <path d="M6 47 c0-2 2-3 6-4l54-8 42-25c3-2 7-2 9 1 1 2 1 4-1 6L84 40l64-9 26-18c3-2 7-2 8 1 1 2 0 4-2 6l-18 15 44-7c5-1 9 1 11 4 1 3-1 6-6 7l-92 21-38 22c-3 2-7 1-8-2 0-2 1-4 3-5l22-14-52 10-16 10c-3 2-7 1-8-2z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Photo with a designed fallback (works offline / if a file is absent)
 * ------------------------------------------------------------------ */
const PALETTES: [string, string][] = [
  ['#0B2340', '#215488'],
  ['#053B39', '#0FA79A'],
  ['#103054', '#4FB1E8'],
  ['#8C4526', '#DEB564'],
  ['#071A2E', '#1A7CB4'],
  ['#29343F', '#7BD8CD'],
];

export function SkylineTile({ seed, className, label, ratio = '16/10' }: { seed: string; className?: string; label?: string; ratio?: string }) {
  const { bars, pal, sun, stars } = useMemo(() => {
    const r = rng(hash(seed));
    const pal = PALETTES[Math.floor(r() * PALETTES.length)];
    const bars = Array.from({ length: 22 }, () => ({ x: 0, w: 8 + r() * 26, h: 12 + r() * 62, o: 0.28 + r() * 0.6 }));
    let x = 0;
    bars.forEach((b) => {
      b.x = x;
      x += b.w + 2 + r() * 6;
    });
    const sun = { cx: 40 + r() * 220, cy: 30 + r() * 40, rr: 16 + r() * 22 };
    const stars = Array.from({ length: 26 }, () => ({ x: r() * 300, y: r() * 90, o: 0.2 + r() * 0.6 }));
    return { bars, pal, sun, stars };
  }, [seed]);
  const width = bars.reduce((s, b) => Math.max(s, b.x + b.w), 300);
  return (
    <div className={cx('relative overflow-hidden', className)} style={{ aspectRatio: ratio, background: `linear-gradient(178deg, ${pal[0]}, ${pal[1]})` }} role="img" aria-label={label ? `${label} — illustrated` : 'Illustrated destination artwork'}>
      <svg viewBox={`0 0 ${width} 120`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <circle cx={sun.cx} cy={sun.cy} r={sun.rr} fill="#F6E3B8" opacity=".85" />
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r=".7" fill="#fff" opacity={s.o} />
        ))}
        {bars.map((b, i) => (
          <rect key={i} x={b.x} y={120 - b.h} width={b.w} height={b.h} fill="#02101C" opacity={b.o} />
        ))}
        {bars.map((b, i) =>
          Array.from({ length: Math.floor(b.h / 9) }, (_, k) => (
            <rect key={`w${i}-${k}`} x={b.x + 3 + ((k * 7) % Math.max(4, b.w - 6))} y={120 - b.h + 5 + k * 8} width="2.2" height="2.6" fill="#FBE9B8" opacity={((i + k) % 3) * 0.16 + 0.14} />
          )),
        )}
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#02101c]/60 to-transparent" />
      {label && (
        <span className="absolute bottom-3 left-4 font-display text-[.6875rem] font-semibold uppercase tracking-[0.22em] text-white/85">{label}</span>
      )}
    </div>
  );
}

export function Photo({
  src,
  alt,
  className,
  imgClassName,
  seed,
  ratio,
  label,
  priority,
  fallbackTone,
}: {
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  seed?: string;
  ratio?: string;
  label?: string;
  priority?: boolean;
  fallbackTone?: string;
}) {
  const [failed, setFailed] = useState(!src);
  React.useEffect(() => setFailed(!src), [src]);
  if (failed)
    return (
      <div className={cx('relative', className)} style={ratio ? { aspectRatio: ratio, background: fallbackTone } : { background: fallbackTone }}>
        <SkylineTile seed={seed ?? alt} label={label} ratio={ratio ?? 'auto'} className="h-full w-full" />
      </div>
    );
  return (
    <div className={cx('relative overflow-hidden bg-mist-200', className)} style={ratio ? { aspectRatio: ratio } : undefined}>
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setFailed(true)}
        className={cx('h-full w-full object-cover', imgClassName)}
      />
    </div>
  );
}
