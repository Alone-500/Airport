import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Route-level skeleton shown while a lazy page loads, and on every navigation to top. */
export function RouteSkeleton() {
  return (
    <div className="min-h-screen bg-mist-50/60 pt-[var(--nav)]">
      <div className="shell py-10">
        <div className="skeleton h-6 w-40 rounded" />
        <div className="skeleton mt-4 h-12 w-2/3 rounded" />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-32 w-full rounded-xl" />
              <div className="skeleton mt-4 h-4 w-3/4 rounded" />
              <div className="skeleton mt-2 h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Scrolls to a #hash target after the page paints. */
export function useHashScroll() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 90);
    return () => clearTimeout(t);
  }, [hash, pathname]);
}
