# AeroNova Airways — full airline platform

A complete, production-quality website for **AeroNova Airways** (fictional premium African airline,
tagline *Beyond Every Horizon*): public marketing site, a working booking engine, online check-in
with boarding passes, a customer account area, and a separate 21-section staff console.

```bash
npm install
npm run dev        # http://localhost:5173  (already bound to 0.0.0.0)
npm run verify     # SSR-renders every route in 3 auth states (public / account / admin)
npm run build      # tsc --noEmit && vite build
```

## What is here

**Public site** — Home, Flight search results, Flight details, 8-step booking flow → confirmation,
Manage Booking, Online check-in + boarding pass (print CSS), Flight status, Destinations index +
14 destination guides, Experience hub + 6 experience pages, 3 cabin pages, Loyalty, Offers,
Travel information hub + 14 policy pages, Airports index + station guides, Help centre (10 topics,
240-style answer set), About, Fleet + 4 aircraft pages, Newsroom, Careers with job detail + apply,
Contact, story long-reads, sign-in/join, 404.

**Customer account** (`/account`, demo sign-in on the sign-in page) — Overview, Profile,
Trips, Bookings, Rewards, Preferences, Documents, Payment methods, Notifications, Security.
Bookings persist to `localStorage`, so a booking created in the flow is immediately usable in
Manage Booking, Check-in and the account area.

**Staff console** (`/admin`, sign in with `ops@aeronova.aero` — one click on the login card) —
Dashboard, Flights, Bookings, Passengers, Airports, Aircraft, Destinations, Fares, Offers,
Loyalty, Customers, Payments, Refunds, Baggage, Support, Content, Analytics, Users, Roles,
Audit logs, Settings. Sidebar grouped in five sections; tables with search/filter/sort/pagination,
KPI tiles, Recharts visualisations, drawers, confirm dialogs and status editors.

## Flight data is real-ish, not random

`src/data/flights.ts` implements a deterministic search engine: great-circle distance from airport
coordinates drives block time, aircraft type, fare floor and taxes; demand factors come from
weekday, season and days-until-departure. The same route + date always returns the same schedule and
prices, so the interface behaves like a GDS-backed product (filters, sort, fare calendar, price
tracking, seat inventory and one-stop routings all read from it).

Seat maps (`src/data/seats.ts`) are generated per aircraft and per flight number, so inventory is
stable while you select. Boarding passes draw a deterministic scan pattern from the PNR.

## Design system

Deep navy + sky + teal with sparing warm accents, white/`mist` surfaces, no gradient buttons,
subtle glass only on the floating nav, mixed layout grammar (bento, editorial asymmetry, layered
overlapping cards, organic shapes, cut-corner aircraft geometry), large photography, and
deterministic SVG "artwork" tiles that stand in for any image not present on disk.

Tailwind theme in `tailwind.config.cjs`; component-level CSS (utilities, print rules,
reduced-motion) in `src/index.css`. Accessibility: semantic landmarks, skip link, labelled
controls, keyboard-operable menus/date picker/seat map/tables, visible focus rings, WCAG-conscious
contrast, 44px touch targets, `aria-live` toasts.

## Layout

```
src/
  components/
    brand/      logo, sunburst, wing mark, route arc, Photo with SVG fallback, skyline tiles
    ui/         Button/Badge/StatusBadge/Tooltip/Skeleton/EmptyState, Modal/Drawer/Menu/Tabs/
                Accordion/Pagination, Field/Input/Select/Checkbox/Switch/DateField/Calendar/
                AirportField autocomplete/RangeSlider, DataTable + KpiCard, Toaster
    layout/     Navbar (mega menus, currency & language), Footer, PublicLayout, PageHero
    booking/    FlightSearchWidget, FlightCard, FilterPanel, SeatMap, PassengerForm,
                PaymentForm (Luhn + 3DS), BoardingPass, ManageParts
    airline/    DestinationCard, OfferCard, StoryCard, NetworkMap, amenity bits
  data/         airports, destinations, fleet, fares, flights (engine), seats, offers/loyalty,
                content (travel info, help, about, newsroom, careers), admin, demo bookings
  store/        preferences, auth, bookings, toasts, query state (single context, persisted)
  pages/public, pages/account, pages/admin
scripts-ssr-check.mjs + src/entry-server.tsx   → `npm run verify`
```

Fictional airline built as a design demonstration; all data is invented but written to be plausible.
