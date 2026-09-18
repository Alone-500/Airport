import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { cx, fmtDate, monthName, parseISODate, startOfDay, toISODate, DAY } from '../../lib/utils';

/* ------------------------------ Field shell ------------------------------ */
export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
  htmlFor,
  right,
  floatLabel,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
  right?: React.ReactNode;
  floatLabel?: boolean;
}) {
  return (
    <div className={cx('min-w-0', className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className={cx('block text-[.75rem] font-semibold uppercase tracking-[0.075em] text-ink-500', floatLabel && 'normal-case tracking-normal text-[.8125rem]', error && 'text-red-600')}>
          {label}
          {required && <span className="ml-1 text-ember-600" aria-hidden> *</span>}
        </label>
        {right}
      </div>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 flex items-start gap-1 text-[.8125rem] font-medium text-red-600">
          <span aria-hidden>⚠</span>
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[.8125rem] leading-snug text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}

const inputBase =
  'w-full rounded-[11px] border bg-white px-3.5 text-[.9375rem] text-navy-900 outline-none transition placeholder:text-ink-300 disabled:bg-mist-100 disabled:text-ink-400 focus:ring-4 focus:ring-sky-500/12';

export function Input({ invalid, className, inputSize = 'md', ...rest }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & { invalid?: boolean; inputSize?: 'sm' | 'md' | 'lg' }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cx(
        inputBase,
        invalid ? 'border-red-400 focus:border-red-500 focus:ring-red-500/12' : 'border-ink-200 hover:border-ink-300 focus:border-sky-500',
        inputSize === 'sm' ? 'h-9' : inputSize === 'lg' ? 'h-[52px] text-[1rem]' : 'h-11',
        className,
      )}
      {...rest}
    />
  );
}

export function TextArea({ invalid, className, rows = 4, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cx(inputBase, 'py-2.5 leading-relaxed', invalid ? 'border-red-400' : 'border-ink-200 hover:border-ink-300 focus:border-sky-500', className)}
      {...rest}
    />
  );
}

export function Select({ invalid, className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={cx(
          inputBase,
          'h-11 appearance-none pr-10',
          invalid ? 'border-red-400' : 'border-ink-200 hover:border-ink-300 focus:border-sky-500',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronRight className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-ink-400" size={16} aria-hidden />
    </div>
  );
}

export function Checkbox({ label, desc, checked, defaultChecked, onChange, disabled, name }: { label: React.ReactNode; desc?: React.ReactNode; checked?: boolean; defaultChecked?: boolean; onChange?: (v: boolean) => void; disabled?: boolean; name?: string }) {
  const [own, setOwn] = useState(defaultChecked ?? false);
  const isOn = checked ?? own;
  const set = (v: boolean) => {
    setOwn(v);
    onChange?.(v);
  };
  return (
    <label className={cx('flex cursor-pointer items-start gap-3 rounded-[12px] border p-3 transition', checked ? 'border-sky-400 bg-sky-50/70' : 'border-line bg-white hover:border-ink-300', disabled && 'cursor-not-allowed opacity-60')}>
      <input type="checkbox" name={name} className="mt-0.5 shrink-0" checked={isOn} disabled={disabled} onChange={(e) => set(e.target.checked)} />
      <span className="min-w-0">
        <span className="block text-[.9375rem] font-medium leading-snug text-navy-900">{label}</span>
        {desc && <span className="mt-0.5 block text-[.8125rem] leading-snug text-ink-500">{desc}</span>}
      </span>
    </label>
  );
}

export function Radio({ options, value, onChange, className, name }: { options: { id: string; label: React.ReactNode; desc?: React.ReactNode }[]; value: string; onChange: (v: string) => void; className?: string; name: string }) {
  return (
    <div className={cx('grid gap-2', className)} role="radiogroup" aria-label={name}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <label key={o.id} className={cx('flex cursor-pointer items-start gap-3 rounded-[12px] border p-3 transition', active ? 'border-navy-800 bg-navy-50/60' : 'border-line bg-white hover:border-ink-300')}>
            <input type="radio" name={name} checked={active} onChange={() => onChange(o.id)} className="mt-0.5" />
            <span>
              <span className="block text-[.9375rem] font-medium text-navy-900">{o.label}</span>
              {o.desc && <span className="mt-0.5 block text-[.8125rem] text-ink-500">{o.desc}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function Switch({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-[.9375rem] font-medium text-navy-900">{label}</span>
        {desc && <span className="mt-0.5 block text-[.8125rem] leading-snug text-ink-500">{desc}</span>}
      </label>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cx('relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors', checked ? 'border-teal-600 bg-teal-500' : 'border-ink-200 bg-mist-200')}
      >
        <span className={cx('absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all duration-200', checked ? 'left-[22px]' : 'left-[2px]')} />
      </button>
    </div>
  );
}

export function SegmentedControl<T extends string>({ options, value, onChange, className, size = 'md', full }: { options: { id: T; label: React.ReactNode }[]; value: T; onChange: (v: T) => void; className?: string; size?: 'sm' | 'md'; full?: boolean }) {
  return (
    <div className={cx('inline-flex rounded-[11px] border border-line bg-mist-100 p-[3px]', full && 'w-full', className)} role="tablist">
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className={cx(
              'flex-1 whitespace-nowrap rounded-[8px] font-display font-semibold transition-all duration-200',
              size === 'sm' ? 'px-2.5 py-1 text-[.75rem]' : 'px-3.5 py-1.5 text-[.875rem]',
              active ? 'bg-white text-navy-900 shadow-card' : 'text-ink-500 hover:text-navy-700',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Counter({ value, onChange, min = 0, max = 9, label, sub, onPrice }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label: string; sub?: string; onPrice?: number }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="min-w-0">
        <p className="truncate text-[.9375rem] font-medium text-navy-900">{label}</p>
        {sub && <p className="truncate text-[.75rem] text-ink-400">{sub}</p>}
      </div>
      <div className="flex items-center gap-1">
        {onPrice !== undefined && onPrice > 0 && <span className="num mr-1 text-[.75rem] text-ink-500">+${onPrice}</span>}
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="grid h-8 w-8 place-items-center rounded-full border border-ink-200 text-ink-600 transition hover:border-navy-500 hover:text-navy-800 disabled:opacity-35 disabled:hover:border-ink-200"
        >
          –
        </button>
        <span className="num w-6 text-center text-[.9375rem] font-semibold">{value}</span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="grid h-8 w-8 place-items-center rounded-full border border-ink-200 text-ink-600 transition hover:border-navy-500 hover:text-navy-800 disabled:opacity-35 disabled:hover:border-ink-200"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ Dual range slider ------------------------------ */
export function RangeSlider({ min, max, value, onChange, format, step = 1 }: { min: number; max: number; value: [number, number]; onChange: (v: [number, number]) => void; format: (n: number) => string; step?: number }) {
  const [lo, hi] = value;
  const pctOf = (n: number) => ((n - min) / (max - min)) * 100;
  return (
    <div className="pt-1">
      <div className="relative h-8">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-mist-200" />
        <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-navy-700" style={{ left: `${pctOf(lo)}%`, width: `${pctOf(hi) - pctOf(lo)}%` }} />
        <input
          type="range"
          aria-label="Minimum"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
          className="pointer-events-none absolute inset-0 h-8 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-navy-800 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-card [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-navy-800 [&::-moz-range-thumb]:bg-white"
        />
        <input
          type="range"
          aria-label="Maximum"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
          className="pointer-events-none absolute inset-0 h-8 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-navy-800 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-card [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-navy-800 [&::-moz-range-thumb]:bg-white"
        />
      </div>
      <div className="num mt-0.5 flex justify-between text-[.8125rem] font-medium text-ink-600">
        <span>{format(lo)}</span>
        <span>{format(hi)}</span>
      </div>
    </div>
  );
}

/* ------------------------------ Calendar ------------------------------ */
export function Calendar({
  value,
  onChange,
  minDate,
  maxDate,
  priceMap,
  rangeEnd,
  onSelectEnd,
  className,
}: {
  value: string;
  onChange: (iso: string) => void;
  minDate?: string;
  maxDate?: string;
  priceMap?: { date: string; price: number }[];
  rangeEnd?: string;
  onSelectEnd?: (iso: string) => void;
  className?: string;
}) {
  const today = startOfDay(new Date());
  const [cursor, setCursor] = useState(() => (value ? new Date(parseISODate(value).getFullYear(), parseISODate(value).getMonth(), 1) : new Date(today.getFullYear(), today.getMonth(), 1)));
  const lo = minDate ? startOfDay(parseISODate(minDate)) : new Date(today.getFullYear() - 1, 0, 1);
  const hi = maxDate ? startOfDay(parseISODate(maxDate)) : new Date(today.getFullYear() + 2, 11, 31);
  const priceOf = useMemo(() => new Map((priceMap ?? []).map((p) => [p.date, p.price])), [priceMap]);
  const cheapest = priceMap?.length ? Math.min(...priceMap.map((p) => p.price)) : 0;

  const grid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startPad = (first.getDay() + 6) % 7; // Monday-first
    const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = Array.from({ length: startPad }, () => null);
    for (let i = 1; i <= days; i++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), i));
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [cursor]);

  const inRange = (d: Date) => {
    const t = startOfDay(d).getTime();
    return t >= lo.getTime() && t <= hi.getTime();
  };

  return (
    <div className={cx('select-none', className)}>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          disabled={cursor <= new Date(lo.getFullYear(), lo.getMonth(), 1)}
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink-600 transition hover:border-navy-400 hover:text-navy-800 disabled:opacity-30"
        >
          <ChevronLeft size={15} />
        </button>
        <p className="font-display text-[.9375rem] font-semibold text-navy-900">
          {monthName(cursor.getMonth())} {cursor.getFullYear()}
        </p>
        <button
          type="button"
          aria-label="Next month"
          disabled={cursor >= new Date(hi.getFullYear(), hi.getMonth(), 1)}
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink-600 transition hover:border-navy-400 hover:text-navy-800 disabled:opacity-30"
        >
          <ChevronRight size={15} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 text-center text-[.6875rem] font-semibold uppercase tracking-wide text-ink-400">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {grid.map((d, i) => {
          if (!d) return <div key={i} />;
          const iso = toISODate(d);
          const active = iso === value;
          const isEnd = iso === rangeEnd;
          const between = value && rangeEnd && startOfDay(parseISODate(iso)) > startOfDay(parseISODate(value)) && startOfDay(parseISODate(iso)) < startOfDay(parseISODate(rangeEnd));
          const enabled = inRange(d);
          const price = priceOf.get(iso);
          const isToday = d.getTime() === today.getTime();
          return (
            <button
              key={i}
              type="button"
              disabled={!enabled}
              onClick={() => (onSelectEnd ? onSelectEnd(iso) : onChange(iso))}
              aria-label={fmtDate(iso, 'long')}
              aria-current={active ? 'date' : undefined}
              className={cx(
                'group/d relative flex h-11 flex-col items-center justify-center rounded-[9px] text-[.8125rem] font-medium transition',
                !enabled && 'cursor-not-allowed text-ink-300',
                enabled && !active && !between && 'text-ink-700 hover:bg-sky-50',
                between && 'bg-sky-50 text-navy-800',
                (active || isEnd) && 'bg-navy-800 text-white shadow-card',
                isToday && !active && !isEnd && 'ring-1 ring-inset ring-sky-300',
              )}
            >
              <span className="num leading-none">{d.getDate()}</span>
              {price !== undefined && (
                <span className={cx('num mt-0.5 text-[.5625rem] leading-none', active || isEnd ? 'text-white/75' : price === cheapest ? 'text-teal-600' : 'text-ink-400')}>${price}</span>
              )}
            </button>
          );
        })}
      </div>
      {priceMap?.length ? (
        <p className="mt-2 flex items-center gap-1.5 text-[.75rem] text-ink-400">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> Lowest fare shown per day · prices are per person, {fmtDate(priceMap[0].date).slice(-4)}–{fmtDate(priceMap[priceMap.length - 1].date).slice(-4)}
        </p>
      ) : null}
    </div>
  );
}

export function DateField({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  required,
  error,
  hint,
  priceMap,
  className,
  quick,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  minDate?: string;
  maxDate?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  priceMap?: { date: string; price: number }[];
  className?: string;
  quick?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const days = value ? Math.round((startOfDay(parseISODate(value)).getTime() - startOfDay(new Date()).getTime()) / DAY) : null;
  return (
    <div ref={wrap} className={cx('relative', className)}>
      <Field label={label} htmlFor={id} required={required} error={error} hint={hint} right={days !== null && days >= 0 && days < 30 ? <span className="text-[.75rem] text-ink-400">{days === 0 ? 'today' : `in ${days}d`}</span> : undefined}>
        <div className="relative">
          <input
            id={id}
            readOnly
            value={value ? fmtDate(value, 'weekday') : ''}
            placeholder="Select a date"
            onClick={() => setOpen((v) => !v)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOpen((v) => !v)}
            aria-invalid={!!error || undefined}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={cx(
              inputBase,
              'h-11 cursor-pointer pr-10',
              !value && 'text-ink-300',
              error ? 'border-red-400' : 'border-ink-200 hover:border-ink-300 focus:border-sky-500',
            )}
          />
          <CalendarDays className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" size={16} aria-hidden />
        </div>
      </Field>
      {open && (
        <div className="absolute left-0 top-full z-[70] mt-2 w-[320px] max-w-[92vw] rounded-card border border-line bg-white p-3 shadow-lift animate-scale-in" role="dialog" aria-label={`Choose ${label.toLowerCase()}`}>
          {quick && (
            <div className="mb-2 flex flex-wrap gap-1.5 border-b border-line pb-2">
              {[
                { l: 'Today', d: 0 },
                { l: 'Tomorrow', d: 1 },
                { l: '+1 week', d: 7 },
                { l: '+1 month', d: 30 },
              ].map((q) => (
                <button key={q.l} type="button" onClick={() => { onChange(toISODate(new Date(Date.now() + q.d * DAY))); setOpen(false); }} className="rounded-pill border border-line px-2.5 py-1 text-[.75rem] font-medium text-ink-600 transition hover:border-sky-400 hover:text-navy-800">
                  {q.l}
                </button>
              ))}
            </div>
          )}
          <Calendar value={value} onChange={(iso) => { onChange(iso); setOpen(false); }} minDate={minDate} maxDate={maxDate} priceMap={priceMap} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Airport / city autocomplete ------------------------------ */
export interface Suggestion {
  code: string;
  city: string;
  name: string;
  country: string;
  region: string;
  label: string;
  sub: string;
}

export function AirportField({
  label,
  value,
  onChange,
  suggestions,
  exclude,
  required,
  error,
  showCode,
  className,
  compact,
}: {
  label: string;
  value: string;
  onChange: (code: string) => void;
  suggestions: Suggestion[];
  exclude?: string;
  required?: boolean;
  error?: string;
  showCode?: string;
  className?: string;
  compact?: boolean;
}) {
  const picked = suggestions.find((s) => s.code === value.toUpperCase());
  const [text, setText] = useState(picked ? `${picked.city}` : value);
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  useEffect(() => {
    setText(picked ? picked.city : value);
  }, [picked, value]);

  const results = useMemo(() => {
    const t = text.trim().toLowerCase();
    const pool = suggestions.filter((s) => s.code !== exclude?.toUpperCase());
    if (!t) return pool.slice(0, 7);
    return pool
      .map((s) => {
        const hay = `${s.city} ${s.code} ${s.name} ${s.country} ${s.region}`.toLowerCase();
        const score = hay.includes(t) ? (s.code === t.toUpperCase() ? 100 : s.city.toLowerCase().startsWith(t) ? 60 : s.city.includes(t) ? 40 : 20) : 0;
        return { s, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.s);
  }, [text, suggestions, exclude]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const commit = (code: string) => {
    onChange(code.toUpperCase());
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={wrap} className={cx('relative min-w-0', className)}>
      <Field label={label} htmlFor={id} required={required} error={error}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={15} aria-hidden />
          <input
            id={id}
            ref={inputRef}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-list`}
            aria-invalid={!!error || undefined}
            value={text}
            placeholder="City or airport"
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setText(e.target.value);
              setOpen(true);
              setHi(0);
              if (!e.target.value) onChange('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHi((h) => Math.min(results.length - 1, h + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHi((h) => Math.max(0, h - 1));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                if (results[hi]) commit(results[hi].code);
                else if (text.trim().length === 3) commit(text.trim());
              } else if (e.key === 'Escape') setOpen(false);
            }}
            className={cx(
              inputBase,
              'h-11 pl-9 pr-14 font-medium',
              compact && 'h-11 text-[.875rem] pr-9',
              error ? 'border-red-400' : 'border-ink-200 hover:border-ink-300 focus:border-sky-500',
            )}
          />
          {value && (
            <button type="button" onClick={() => { onChange(''); setText(''); inputRef.current?.focus(); }} aria-label={`Clear ${label}`} className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink-400 hover:bg-mist-100 hover:text-ink-700">
              <X size={13} />
            </button>
          )}
          {showCode && (
            <span className="num pointer-events-none absolute right-9 top-1/2 -translate-y-1/2 rounded-[6px] bg-navy-50 px-1.5 py-0.5 font-display text-[.75rem] font-bold text-navy-800">{showCode}</span>
          )}
        </div>
      </Field>
      {open && (
        <ul id={`${id}-list`} role="listbox" className="absolute left-0 top-full z-[72] mt-2 w-[min(380px,92vw)] overflow-hidden rounded-card border border-line bg-white p-1.5 text-left shadow-lift animate-scale-in">
          {results.length === 0 && <li className="px-3 py-4 text-sm text-ink-500">No airport matches “{text}”. AeroNova serves 41 destinations.</li>}
          {results.map((s, i) => (
            <li key={s.code} role="option" aria-selected={i === hi}>
              <button
                type="button"
                onMouseEnter={() => setHi(i)}
                onClick={() => commit(s.code)}
                className={cx('flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2 text-left transition', i === hi ? 'bg-sky-50' : 'hover:bg-mist-50')}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-navy-800 font-display text-[.75rem] font-bold text-white">{s.code}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[.875rem] font-semibold text-navy-900">
                    {s.city} <span className="font-normal text-ink-400">({s.code})</span>
                  </span>
                  <span className="block truncate text-[.75rem] text-ink-500">{s.sub}</span>
                </span>
                {s.region !== 'Africa' && <span className="shrink-0 text-[.6875rem] font-medium uppercase tracking-wide text-ink-400">{s.region}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Autocomplete({ label, placeholder, options, onPick, className }: { label: string; placeholder?: string; options: { value: string; hint?: string }[]; onPick: (v: string) => void; className?: string }) {
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const list = options.filter((o) => o.value.toLowerCase().includes(text.toLowerCase())).slice(0, 8);
  return (
    <div className={cx('relative', className)}>
      <Field label={label}>
        <Input value={text} placeholder={placeholder} onChange={(e) => { setText(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 120)} />
      </Field>
      {open && text && list.length > 0 && (
        <ul className="absolute z-[70] mt-1 w-full overflow-hidden rounded-card border border-line bg-white p-1 shadow-lift">
          {list.map((o) => (
            <li key={o.value}>
              <button type="button" onMouseDown={() => { onPick(o.value); setText(o.value); setOpen(false); }} className="flex w-full items-center justify-between gap-3 rounded-[8px] px-2.5 py-2 text-left text-sm hover:bg-sky-50">
                <span className="font-medium text-navy-900">{o.value}</span>
                {o.hint && <span className="text-xs text-ink-400">{o.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Checkmark({ className }: { className?: string }) {
  return <Check className={className} size={14} strokeWidth={3} aria-hidden />;
}
