import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';
import { cx } from '../../lib/utils';
import { Button } from './Primitives';

/* ------------------------------ Modal ------------------------------ */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  variant = 'center',
  closeLabel = 'Close',
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'center' | 'sheet';
  closeLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const labelId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && ref.current) {
        const nodes = ref.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const noel = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const t = setTimeout(() => ref.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus() ?? ref.current?.focus(), 40);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = noel;
      clearTimeout(t);
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  const width = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size];

  return createPortal(
    <div className={cx('fixed inset-0 z-[120] flex', variant === 'sheet' ? 'items-end sm:items-center sm:justify-center' : 'items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6')}>
      <button aria-label="Close overlay" onClick={onClose} className="absolute inset-0 cursor-default bg-navy-950/55 backdrop-blur-[2px] animate-fade-in" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        className={cx(
          'relative w-full bg-white shadow-lift outline-none',
          width,
          variant === 'sheet'
            ? 'animate-slide-up rounded-t-[22px] sm:animate-scale-in sm:rounded-card'
            : 'animate-scale-in rounded-card',
        )}
      >
        <div className="flex items-start gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <h2 id={labelId} className="text-h3 text-[1.0625rem] sm:text-[1.125rem]">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label={closeLabel} className="-mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-500 transition hover:bg-mist-100 hover:text-navy-800">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-mist-50/70 px-5 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  body,
  confirmLabel = 'Confirm',
  tone = 'primary',
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  body: React.ReactNode;
  confirmLabel?: string;
  tone?: 'primary' | 'danger';
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            Keep it
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} data-autofocus>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm leading-relaxed text-ink-600">{body}</div>
    </Modal>
  );
}

/* ------------------------------ Drawer ------------------------------ */
export function Drawer({ open, onClose, title, children, footer, side = 'right', width = 'max-w-md' }: { open: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; side?: 'right' | 'left'; width?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[125]">
      <button aria-label="Close panel" onClick={onClose} className="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px] animate-fade-in" />
      <div
        role="dialog"
        aria-modal="true"
        className={cx('absolute inset-y-0 flex w-full flex-col bg-white shadow-lift', width, side === 'right' ? 'right-0 animate-[slide-left_.3s_cubic-bezier(.2,.7,.3,1)_reverse]' : 'left-0')}
        style={{ animation: 'fade-up .28s cubic-bezier(.2,.7,.3,1) both' }}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-h3">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-mist-100">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="border-t border-line bg-mist-50/70 px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------ Dropdown menu ------------------------------ */
export function Menu({
  label,
  children,
  align = 'end',
  className,
  dark,
  widthClass = 'w-64',
}: {
  label: (open: boolean) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: 'start' | 'end';
  className?: string;
  dark?: boolean;
  widthClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div ref={wrap} className={cx('relative', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={cx('inline-flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-sm font-medium transition', dark ? 'text-white/85 hover:bg-white/10' : 'text-ink-700 hover:bg-mist-100')}
      >
        {label(open)}
        <ChevronDown size={14} className={cx('transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div
          role="menu"
          className={cx(
            'absolute z-[80] mt-2 origin-top overflow-hidden rounded-[14px] border border-line bg-white p-1.5 shadow-lift animate-scale-in',
            align === 'end' ? 'right-0' : 'left-0',
            widthClass,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function MenuItem({ children, onClick, active, icon, href, desc }: { children: React.ReactNode; onClick?: () => void; active?: boolean; icon?: React.ReactNode; href?: string; desc?: string }) {
  const cls = cx('flex w-full items-start gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-sm transition', active ? 'bg-sky-50 text-navy-900' : 'text-ink-700 hover:bg-mist-100');
  const inner = (
    <>
      {icon && <span className="mt-[1px] text-ink-400">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{children}</span>
        {desc && <span className="mt-0.5 block text-xs leading-snug text-ink-400">{desc}</span>}
      </span>
    </>
  );
  if (href)
    return (
      <a role="menuitem" href={href} className={cls}>
        {inner}
      </a>
    );
  return (
    <button role="menuitem" type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

export function MenuDivider() {
  return <div className="my-1 h-px bg-line" />;
}

/* ------------------------------ Tabs ------------------------------ */
export function Tabs<T extends string>({ value, onChange, items, size = 'md', className, tone = 'underline' }: { value: T; onChange: (v: T) => void; items: { id: T; label: React.ReactNode; count?: number }[]; size?: 'sm' | 'md'; className?: string; tone?: 'underline' | 'pill' | 'dark' }) {
  return (
    <div role="tablist" className={cx('flex items-center gap-1 overflow-x-auto no-scrollbar', tone === 'underline' && 'border-b border-line', className)}>
      {items.map((it) => {
        const active = it.id === value;
        return (
          <button
            key={it.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.id)}
            className={cx(
              'relative shrink-0 whitespace-nowrap font-display font-semibold transition-colors',
              size === 'sm' ? 'px-3 py-2 text-[.8125rem]' : 'px-4 py-2.5 text-[.9375rem]',
              tone === 'underline' && (active ? 'text-navy-900' : 'text-ink-500 hover:text-navy-700'),
              tone === 'pill' && (active ? 'bg-navy-800 text-white' : 'text-ink-600 hover:bg-mist-100'),
              tone === 'dark' && (active ? 'bg-white/12 text-white' : 'text-white/65 hover:text-white'),
              tone === 'pill' && 'rounded-[10px]',
            )}
          >
            {it.label}
            {typeof it.count === 'number' && (
              <span className={cx('ml-1.5 num rounded-pill px-1.5 py-0.5 text-[.6875rem]', active ? (tone === 'underline' ? 'bg-sky-100 text-navy-800' : 'bg-white/20') : 'bg-mist-200 text-ink-500')}>{it.count}</span>
            )}
            {tone === 'underline' && <span className={cx('absolute inset-x-2 -bottom-px h-[2.5px] rounded-full transition-all', active ? 'bg-navy-800' : 'bg-transparent')} />}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------ Accordion ------------------------------ */
export function Accordion({ items, single = true, className }: { items: { id: string; q: React.ReactNode; a: React.ReactNode }[]; single?: boolean; className?: string }) {
  const [open, setOpen] = useState<string[]>(single ? [items[0]?.id].filter(Boolean) : []);
  const toggle = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : single ? [id] : [...o, id]));
  return (
    <div className={cx('divide-y divide-line overflow-hidden rounded-card border border-line bg-white', className)}>
      {items.map((it) => {
        const isOpen = open.includes(it.id);
        return (
          <div key={it.id}>
            <h3>
              <button
                onClick={() => toggle(it.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-mist-50 sm:px-5"
              >
                <span className={cx('flex-1 font-display text-[.9375rem] font-semibold sm:text-[1rem]', isOpen ? 'text-navy-900' : 'text-ink-800')}>{it.q}</span>
                <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300', isOpen ? 'rotate-180 border-navy-800 bg-navy-800 text-white' : 'border-ink-200 text-ink-500')}>
                  <ChevronDown size={15} />
                </span>
              </button>
            </h3>
            <div className={cx('grid transition-all duration-300', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
              <div className="overflow-hidden">
                <div className="px-4 pb-5 pr-10 text-[.9375rem] leading-relaxed text-ink-600 sm:px-5">{it.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------ Pagination ------------------------------ */
export function Pagination({ page, pages, onChange, className }: { page: number; pages: number; onChange: (p: number) => void; className?: string }) {
  if (pages <= 1) return null;
  const nums: (number | '…')[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }
  return (
    <nav aria-label="Pagination" className={cx('flex items-center justify-between gap-3', className)}>
      <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <ol className="flex items-center gap-1">
        {nums.map((n, i) =>
          n === '…' ? (
            <li key={`e${i}`} className="px-1 text-ink-400">
              …
            </li>
          ) : (
            <li key={n}>
              <button
                aria-current={n === page ? 'page' : undefined}
                onClick={() => onChange(n)}
                className={cx('num h-8 min-w-8 rounded-[9px] px-2 text-sm font-semibold transition', n === page ? 'bg-navy-800 text-white' : 'text-ink-600 hover:bg-mist-100')}
              >
                {n}
              </button>
            </li>
          ),
        )}
      </ol>
      <Button size="sm" variant="secondary" disabled={page === pages} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </nav>
  );
}

/* ------------------------------ Breadcrumbs ------------------------------ */
export function Breadcrumbs({ items, dark, className }: { items: { label: string; to?: string }[]; dark?: boolean; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-[.8125rem]">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-1.5">
            {i > 0 && <span className={cx('text-ink-300', dark && 'text-white/30')}>/</span>}
            {it.to && i < items.length - 1 ? (
              <a href={it.to} className={cx('transition hover:underline', dark ? 'text-white/70 hover:text-white' : 'text-ink-500 hover:text-navy-800')}>
                {it.label}
              </a>
            ) : (
              <span className={cx('font-medium', dark ? 'text-white' : 'text-navy-900')} aria-current="page">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
