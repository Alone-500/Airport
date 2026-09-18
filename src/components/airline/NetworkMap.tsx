import {useMemo, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { cx, hash, rng } from '../../lib/utils';
import { AIRPORTS, cityOf } from '../../data/airports';

/**
 * Stylised network map: equirectangular projection of the airline’s
 * route set, drawn once from airport coordinates. Deliberately minimal
 * rather than geographically literal — it reads as a brand artefact.
 */

const BOX = { west: -24, east: 128, north: 56, south: -42 };
const W = 620;
const H = 340;

const project = (lon: number, lat: number) => ({
  x: ((lon - BOX.west) / (BOX.east - BOX.west)) * W,
  y: ((BOX.north - lat) / (BOX.north - BOX.south)) * H,
});

// a rough coastline of Africa + the immediate neighbourhood, in lon/lat pairs
const LANDMASS =
  'M-17,15 -16,21 -13,27 -9,31 -6,35 -2,36 3,37 10,37 12,34 20,32 25,32 30,31 33,30 35,28 38,22 43,12 48,12 51,12 43,4 41,-2 40,-10 35,-19 33,-26 30,-31 26,-34 20,-35 18,-32 15,-26 12,-18 9,-1 6,4 1,5 -8,4 -13,9 -17,15 Z ' +
  'M-10,51 -6,54 -2,51 -5,48 -10,46 -10,51 Z ' +
  'M26,41 30,41 33,37 30,36 26,38 26,41 Z ' +
  'M46,-20 50,-16 50,-22 46,-25 46,-20 Z ' +
  'M57,-20 61,-18 61,-23 57,-24 57,-20 Z';

export function NetworkMap({
  className,
  interactive = true,
  hubs = ['ACC', 'NBO', 'JNB'],
  focus,
}: {
  className?: string;
  interactive?: boolean;
  hubs?: string[];
  focus?: string;
}) {
  const nav = useNavigate();
  const [hover, setHover] = useState<string | null>(null);

  const points = useMemo(() => {
    return AIRPORTS.map((a) => {
      const lon = COORDS[a.code]?.[0];
      const lat = COORDS[a.code]?.[1];
      if (lon === undefined || lat === undefined) return null;
      const { x, y } = project(lon, lat);
      return { ...a, x, y };
    }).filter(Boolean) as (typeof AIRPORTS[number] & { x: number; y: number })[];
  }, []);

  const arcs = useMemo(() => {
    const r = rng(hash('arcs'));
    const out: { d: string; key: string; from: string; to: string }[] = [];
    hubs.forEach((h) => {
      const hub = points.find((p) => p.code === h);
      if (!hub) return;
      points
        .filter((p) => p.code !== h)
        .forEach((p) => {
          if (r() > 0.55) return;
          const mx = (hub.x + p.x) / 2;
          const my = (hub.y + p.y) / 2 - Math.abs(hub.x - p.x) * 0.16 - 8;
          out.push({ d: `M${hub.x},${hub.y} Q${mx},${my} ${p.x},${p.y}`, key: `${hub.code}${p.code}`, from: hub.code, to: p.code });
        });
    });
    // long-haul spine
    const acc = points.find((p) => p.code === 'ACC');
    const extras = points.filter((p) => ['LHR', 'DXB', 'IST', 'JFK', 'BOM', 'CDG'].includes(p.code));
    if (acc)
      extras.forEach((p) => {
        const mx = (acc.x + p.x) / 2;
        const my = (acc.y + p.y) / 2 - 34;
        out.push({ d: `M${acc.x},${acc.y} Q${mx},${my} ${p.x},${p.y}`, key: `spine${p.code}`, from: 'ACC', to: p.code });
      });
    return out;
  }, [points, hubs]);

  const active = hover ?? focus;

  return (
    <div className={cx('relative', className)}>
      <svg viewBox={`-10 -10 ${W + 20} ${H + 20}`} className="w-full" role="img" aria-label={`AeroNova network map: ${points.length} destinations across Africa, Europe, the Middle East, Asia and North America`}>
        <defs>
          <linearGradient id="land" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#DDEBF5" />
            <stop offset="100%" stopColor="#C9DDEC" />
          </linearGradient>
          <radialGradient id="glow" cx="30%" cy="45%">
            <stop offset="0%" stopColor="#0FA79A" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#0FA79A" stopOpacity="0" />
          </radialGradient>
        </defs>

        <path d={LANDMASS} fill="url(#land)" stroke="#AECCE4" strokeWidth="0.7" />
        <ellipse cx={W * 0.3} cy={H * 0.45} rx={260} ry={190} fill="url(#glow)" />

        {arcs.map((a) => {
          const on = active ? a.from === active || a.to === active : false;
          return (
            <path
              key={a.key}
              d={a.d}
              fill="none"
              stroke={on ? '#0FA79A' : '#215488'}
              strokeOpacity={active ? (on ? 0.9 : 0.1) : 0.28}
              strokeWidth={on ? 1.5 : 0.8}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          );
        })}

        {points.map((p) => {
          const isHub = hubs.includes(p.code);
          const on = active ? p.code === active || arcs.some((a) => (a.from === active && a.to === p.code) || (a.to === active && a.from === p.code)) : true;
          return (
            <g
              key={p.code}
              tabIndex={interactive ? 0 : -1}
              role={interactive ? 'button' : undefined}
              aria-label={interactive ? `${cityOf(p.code)} — ${p.name}` : undefined}
              onMouseEnter={() => interactive && setHover(p.code)}
              onMouseLeave={() => interactive && setHover(null)}
              onFocus={() => interactive && setHover(p.code)}
              onClick={() => interactive && nav(`/search?to=${p.code}&from=${isHub ? p.code : 'ACC'}`)}
              className={cx(interactive && 'cursor-pointer')}
            >
              {isHub && <circle cx={p.x} cy={p.y} r={9} fill="#0FA79A" opacity={0.22} className="animate-pulse-ring" style={{ transformOrigin: `${p.x}px ${p.y}px` }} />}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHub ? 4.2 : 2.4}
                fill={isHub ? '#0B2340' : '#1A7CB4'}
                stroke="#fff"
                strokeWidth={isHub ? 1.6 : 1}
                opacity={on ? 1 : 0.25}
                className="transition-opacity duration-300"
              />
              {(isHub || (active && p.code === active)) && (
                <text x={p.x + (p.x > W - 60 ? -8 : 8)} y={p.y - 7} textAnchor={p.x > W - 60 ? 'end' : 'start'} className="font-display" fontSize="10" fontWeight="700" fill="#0B2340" opacity={0.9}>
                  {isHub ? p.code : active === p.code ? p.code : ''}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover && (
        <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-pill border border-line bg-white/95 px-3 py-1.5 text-[.8125rem] shadow-card backdrop-blur">
          <span className="font-display font-semibold text-navy-900">{cityOf(hover)}</span>
          <span className="ml-2 text-ink-500">{AIRPORTS.find((a) => a.code === hover)?.name}</span>
          <span className="ml-2 text-teal-600">{hubs.includes(hover) ? 'hub · view routes' : 'search flights'}</span>
        </div>
      )}
    </div>
  );
}

// lon, lat — enough to place the network convincingly
const COORDS: Record<string, [number, number]> = {
  ACC: [-0.17, 5.6], NBO: [36.93, -1.32], JNB: [28.24, -26.14], CPT: [18.6, -33.97], LOS: [3.32, 6.58],
  KGL: [30.14, -1.97], EBB: [32.44, 0.04], DSS: [-17.49, 14.74], ABJ: [-3.93, 5.26], DLA: [9.72, 4.01],
  LAD: [13.23, -8.86], MPM: [32.57, -25.92], VFA: [25.86, -17.93], JRO: [37.07, -3.08], ZNZ: [39.23, -6.22],
  MRU: [57.68, -20.0], SEZ: [55.52, -4.67], ADD: [38.8, 8.98], CAI: [31.41, 30.12], CMN: [-7.59, 33.37],
  RAK: [-8.04, 31.61], TUN: [10.23, 36.85], WDH: [17.46, -22.46], HRE: [31.1, -17.92], PHC: [6.95, 5.01],
  LHR: [-0.45, 51.47], CDG: [2.55, 49.01], FRA: [8.56, 50.03], LIS: [-9.14, 38.77], IST: [28.74, 41.26],
  DXB: [55.36, 25.25], DOH: [51.61, 25.27], JED: [39.17, 21.68], BOM: [72.87, 19.09], KUL: [101.71, 2.75],
  CAN: [113.3, 23.39], JFK: [-73.78, 40.64], IAD: [-77.46, 38.94], ATL: [-84.43, 33.64], YYZ: [-79.64, 43.68],
  GIG: [-43.58, -20.52],
};
