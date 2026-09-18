import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cx } from '../../lib/utils';
import { useStore } from '../../store/store';

const TONE = {
  info: { icon: <Info size={18} />, ring: 'border-sky-200', bar: 'bg-sky-500', tint: 'text-sky-700' },
  success: { icon: <CheckCircle2 size={18} />, ring: 'border-teal-300/70', bar: 'bg-teal-500', tint: 'text-teal-700' },
  warn: { icon: <AlertTriangle size={18} />, ring: 'border-gold-400/50', bar: 'bg-gold-500', tint: 'text-gold-600' },
  error: { icon: <XCircle size={18} />, ring: 'border-red-200', bar: 'bg-red-500', tint: 'text-red-600' },
};

export function ToastViewport() {
  const { toasts, dismissToast } = useStore();
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--nav)+16px)] z-[200] flex flex-col items-center gap-2 px-4 sm:bottom-auto sm:right-5 sm:top-[calc(var(--nav)+14px)] sm:left-auto sm:items-end sm:px-0">
      {toasts.map((t) => {
        const tone = TONE[t.tone];
        return (
          <div
            key={t.id}
            className={cx('pointer-events-auto flex w-full max-w-[420px] items-start gap-3 overflow-hidden rounded-[14px] border bg-white/95 p-3.5 pr-2.5 shadow-lift backdrop-blur animate-slide-up', tone.ring)}
            style={{ backdropFilter: 'saturate(160%) blur(12px)' }}
          >
            <span className={cx('mt-[2px] shrink-0', tone.tint)}>{tone.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[.875rem] font-semibold leading-snug text-navy-900">{t.title}</p>
              {t.body && <p className="mt-0.5 text-[.8125rem] leading-snug text-ink-500">{t.body}</p>}
              {t.action && (
                <button
                  onClick={() => {
                    t.action?.onClick?.();
                    dismissToast(t.id);
                  }}
                  className="mt-1.5 text-[.8125rem] font-semibold text-sky-700 underline decoration-sky-300 decoration-1 underline-offset-4 hover:text-navy-800"
                >
                  {t.action.label}
                </button>
              )}
            </div>
            <button onClick={() => dismissToast(t.id)} aria-label="Dismiss notification" className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-400 transition hover:bg-mist-100 hover:text-navy-800">
              <X size={15} />
            </button>
            <span className={cx('absolute bottom-0 left-0 h-[2px] w-full origin-left', tone.bar)} style={{ animation: 'shimmer 5.2s linear forwards' }} aria-hidden />
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
