import { createServer } from 'vite';

const routes = [
  '/', '/book', '/search?from=ACC&to=LOS&dep=2026-09-27&ret=2026-10-04&pax=1,0,0&cabin=ECONOMY&trip=round',
  '/search?from=ACC&to=LHR&dep=2026-10-11&trip=oneway&pax=2,1,0&cabin=BUSINESS',
  '/flight-details?from=ACC&to=LOS&dep=2026-09-27&cabin=ECONOMY',
  '/booking?from=ACC&to=LOS&dep=2026-09-27&ret=2026-10-04&pax=2,1,0&fare=CLASSIC&cabin=ECONOMY&out=x',
  '/manage-booking', '/manage-booking?ref=ANV7X2K', '/check-in', '/check-in?ref=ANV7X2K&name=Mensah',
  '/flight-status', '/flight-status?flight=AN%20214', '/destinations', '/destinations/accra', '/destinations/london',
  '/destinations/victoria-falls', '/offers', '/loyalty', '/experience', '/experience/lounges', '/experience/dining',
  '/experience/comfort', '/cabins/economy', '/cabins/premium-economy', '/cabins/business', '/travel-information',
  '/travel-information/baggage', '/travel-information/dangerous-goods', '/travel-information/unaccompanied-minors',
  '/airports', '/airports/ACC', '/airports/NBO', '/help', '/help/booking', '/help/refunds', '/about', '/fleet',
  '/fleet/B789', '/fleet/A339', '/newsroom', '/careers', '/contact', '/stories/the-table', '/sign-in', '/nope-404',
  '/account', '/account/profile', '/account/trips', '/account/bookings', '/account/rewards', '/account/preferences',
  '/account/documents', '/account/payment', '/account/notifications', '/account/security',
  '/admin', '/admin/flights', '/admin/bookings', '/admin/passengers', '/admin/airports', '/admin/aircraft',
  '/admin/destinations', '/admin/fares', '/admin/offers', '/admin/loyalty', '/admin/customers', '/admin/payments',
  '/admin/refunds', '/admin/baggage', '/admin/support', '/admin/content', '/admin/analytics', '/admin/users',
  '/admin/roles', '/admin/audit', '/admin/settings',
];

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const pass = process.argv[2] ?? 'public';
if (pass === 'account') globalThis.__AN_DEMO_USER__ = 'customer';
if (pass === 'admin') globalThis.__AN_DEMO_USER__ = 'staff';
const routesFor = { public: routes.filter((r) => !r.startsWith('/account') && !r.startsWith('/admin')), account: routes.filter((r) => r.startsWith('/account')), admin: routes.filter((r) => r.startsWith('/admin')) }[pass] ?? routes;
const mod = await server.ssrLoadModule('/src/entry-server.tsx');
let fails = 0;
const out = [];
for (const r of routesFor) {
  try {
    const html = mod.render(r);
    const len = html.length;
    if (len < 2500) { out.push(['WARN', r, len, 'suspiciously small render']); fails++; }
    else out.push(['ok', r, len, '']);
  } catch (e) {
    fails++;
    out.push(['FAIL', r, 0, (e && e.stack ? String(e.stack).split('\n').slice(0, 4).join(' | ') : String(e))]);
  }
}
for (const [s, r, len, msg] of out) console.log(`${s.padEnd(4)} ${String(len).padStart(7)}  ${r}${msg ? '  ← ' + msg : ''}`);
console.log(`\n[${pass}] ${routesFor.length - fails}/${routesFor.length} routes rendered clean`);
await server.close();
process.exit(fails ? 1 : 0);
