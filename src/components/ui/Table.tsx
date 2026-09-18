import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown, Download, Filter, Search } from 'lucide-react';
import { cx } from '../../lib/utils';
import { Button, EmptyState, Skeleton } from './Primitives';
import { Pagination } from './Overlay';
import { Input } from './Form';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  value?: (row: T) => string | number;
  sort?: boolean;
  width?: string;
  align?: 'left' | 'right' | 'center';
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl';
  primary?: boolean;
}

export function DataTable<T extends object>({
  rows,
  columns,
  pageSize = 10,
  searchable = true,
  searchKeys,
  filters,
  actions,
  onRowClick,
  empty = 'Nothing matches this view',
  emptyBody = 'Try clearing the filters, or widen the date range.',
  loading = false,
  dense,
  initialSort,
  rowKey = (r, i) => String((r as { id?: string }).id ?? i),
  className,
}: {
  rows: T[];
  columns: Column<T>[];
  pageSize?: number;
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  filters?: { id: string; label: string; options: { id: string; label: string }[]; value: string; onChange: (v: string) => void }[];
  actions?: React.ReactNode;
  onRowClick?: (row: T) => void;
  empty?: string;
  emptyBody?: string;
  loading?: boolean;
  dense?: boolean;
  initialSort?: { key: string; dir: 'asc' | 'desc' };
  rowKey?: (row: T, i: number) => string;
  className?: string;
}) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(initialSort ?? null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let out = rows;
    if (q.trim()) {
      const t = q.toLowerCase();
      out = out.filter((r) => {
        const keys = searchKeys ?? (Object.keys(r) as (keyof T)[]);
        return keys.some((k) => String(r[k] ?? '').toLowerCase().includes(t));
      });
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      const get = (r: T) => (col?.value ? col.value(r) : ((r as Record<string, unknown>)[sort.key] as string | number));
      out = [...out].sort((a, b) => {
        const av = get(a);
        const bv = get(b);
        if (typeof av === 'number' && typeof bv === 'number') return sort.dir === 'asc' ? av - bv : bv - av;
        return sort.dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
    }
    return out;
  }, [rows, q, sort, columns, searchKeys]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const view = filtered.slice((Math.min(page, pages) - 1) * pageSize, Math.min(page, pages) * pageSize);
  const hide = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell', xl: 'hidden xl:table-cell' };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-card border border-line">
        <div className="border-b border-line bg-mist-50 p-4">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="divide-y divide-line">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-3.5 flex-1" />
              <Skeleton className="hidden h-3.5 w-24 sm:block" />
              <Skeleton className="h-3.5 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cx('space-y-3', className)}>
      {(searchable || filters?.length || actions) && (
        <div className="flex flex-wrap items-center gap-2">
          {searchable && (
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={15} />
              <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search this table…" className="h-10 pl-9" aria-label="Search table" />
            </div>
          )}
          {filters?.length ? (
            <>
              <Button variant="secondary" size="sm" icon={<Filter size={14} />} onClick={() => setShowFilters((v) => !v)}>
                Filters
                {filters.some((f) => f.value !== 'all') && <span className="ml-1 grid h-4 w-4 place-items-center rounded-full bg-navy-800 text-[.625rem] text-white">{filters.filter((f) => f.value !== 'all').length}</span>}
              </Button>
              {actions}
            </>
          ) : (
            actions
          )}
        </div>
      )}
      {showFilters && filters?.length ? (
        <div className="grid gap-3 rounded-card border border-line bg-mist-50/70 p-3 sm:grid-cols-2 lg:grid-cols-4">
          {filters.map((f) => (
            <label key={f.id} className="block text-[.75rem] font-semibold uppercase tracking-wide text-ink-500">
              {f.label}
              <select value={f.value} onChange={(e) => { f.onChange(e.target.value); setPage(1); }} className="mt-1 h-9 w-full rounded-[9px] border border-line bg-white px-2 text-[.875rem] font-medium normal-case tracking-normal text-navy-900">
                {f.options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState title={empty} body={emptyBody} icon={<Search size={20} />} action={q ? <Button size="sm" variant="secondary" onClick={() => setQ('')}>Clear search</Button> : undefined} />
      ) : (
        <div className="overflow-hidden rounded-card border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  {columns.map((c) => {
                    const active = sort?.key === c.key;
                    return (
                      <th key={c.key} className={cx(c.hideBelow && hide[c.hideBelow], c.align === 'right' && 'text-right', c.align === 'center' && 'text-center', c.width)} aria-sort={active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                        {c.sort === false ? (
                          c.header
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key: c.key, dir: 'asc' }))}
                            className={cx('inline-flex items-center gap-1 uppercase tracking-wider transition hover:text-navy-800', active && 'text-navy-800', c.align === 'right' && 'flex-row-reverse')}
                          >
                            {c.header}
                            {active ? (sort!.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : <ChevronsUpDown size={12} className="opacity-40" />}
                          </button>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {view.map((row, i) => (
                  <tr key={rowKey(row, i)} onClick={onRowClick ? () => onRowClick(row) : undefined} className={cx(onRowClick && 'cursor-pointer')}>
                    {columns.map((c) => (
                      <td key={c.key} className={cx(c.hideBelow && hide[c.hideBelow], c.align === 'right' && 'text-right num', c.align === 'center' && 'text-center', dense ? 'py-2' : '', c.primary && 'font-semibold text-navy-900')}>
                        {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-mist-50/60 px-3 py-2.5">
            <p className="num text-[.8125rem] text-ink-500">
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length.toLocaleString()} rows
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" icon={<Download size={14} />}>
                CSV
              </Button>
              <Pagination page={page} pages={pages} onChange={setPage} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** KPI tile used across dashboards. */
export function KpiCard({
  label,
  value,
  delta,
  tone = 'navy',
  note,
  icon,
  spark,
  className,
}: {
  label: string;
  value: React.ReactNode;
  delta?: number;
  tone?: 'navy' | 'teal' | 'gold' | 'ember' | 'sky' | 'red';
  note?: React.ReactNode;
  icon?: React.ReactNode;
  spark?: number[];
  className?: string;
}) {
  const tint = {
    navy: 'text-navy-700 bg-navy-50',
    teal: 'text-teal-700 bg-teal-50',
    gold: 'text-gold-600 bg-gold-100',
    ember: 'text-ember-700 bg-ember-100',
    sky: 'text-sky-700 bg-sky-100',
    red: 'text-red-700 bg-red-50',
  }[tone];
  const path = spark && spark.length > 1 ? `M ${spark.map((v, i) => `${(i / (spark.length - 1)) * 100},${28 - ((v - Math.min(...spark)) / (Math.max(...spark) - Math.min(...spark) || 1)) * 24}`).join(' L ')}` : '';
  return (
    <div className={cx('card p-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[.75rem] font-semibold uppercase tracking-[0.09em] text-ink-500">{label}</p>
          <p className="num mt-1.5 font-display text-[1.65rem] font-semibold leading-none text-navy-900">{value}</p>
        </div>
        {icon && <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-[10px]', tint)}>{icon}</span>}
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {delta !== undefined && (
            <span className={cx('num inline-flex items-center gap-1 rounded-pill px-1.5 py-0.5 text-[.75rem] font-semibold', delta >= 0 ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-700')}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
            </span>
          )}
          {note && <p className="mt-1 truncate text-[.75rem] text-ink-400">{note}</p>}
        </div>
        {spark && (
          <svg viewBox="0 0 100 30" className="h-8 w-24 shrink-0" preserveAspectRatio="none" aria-hidden>
            <path d={path} fill="none" stroke="#0FA79A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  );
}
