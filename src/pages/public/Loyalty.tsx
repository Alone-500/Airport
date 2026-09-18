import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, CalendarCheck, Check, CreditCard, Gift, Headphones, PlaneTakeoff, Sparkles, Star, Ticket } from 'lucide-react';
import { cx, money } from '../../lib/utils';
import { EARN_TABLE, PARTNERS, REDEEM_TABLE, TIERS } from '../../data/offers';
import { Badge, Button, Divider, Eyebrow, SectionHeading, Tooltip } from '../../components/ui/Primitives';
import { Accordion, Modal, Tabs } from '../../components/ui/Overlay';
import { Checkbox, Field, Input, SegmentedControl, Select } from '../../components/ui/Form';
import { Sunburst } from '../../components/brand/Brand';
import { useStore } from '../../store/store';
import { PageHero } from '../../components/layout/PublicLayout';
import { useHashScroll } from '../../components/ui/RouteSkeleton';

const TONE: Record<string, string> = {
  sky: 'from-sky-900 to-navy-800',
  teal: 'from-teal-900 to-teal-700',
  gold: 'from-gold-600 to-gold-500',
  ember: 'from-ember-700 to-ember-600',
};

export default function Loyalty() {
  useHashScroll();
  const nav = useNavigate();
  const { user, toast, signIn } = useStore();
  const [calc, setCalc] = useState({ trips: 8, spend: 4200, cabin: 'ECONOMY', card: true });
  const [join, setJoin] = useState(false);
  const [form, setForm] = useState({ first: 'Ama', last: 'Mensah', email: 'ama.mensah@example.com', country: 'Ghana', dob: '1988-04-12', tier: 'explorer', agree: true, marketing: false });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<'earn' | 'redeem' | 'partners'>('earn');

  const points = useMemo(() => {
    const mult = calc.cabin === 'BUSINESS' ? 2.25 : calc.cabin === 'PREMIUM' ? 1.5 : 1;
    return Math.round(calc.spend * mult + calc.trips * 1800 + (calc.card ? calc.spend * 2 : 0));
  }, [calc]);

  const value = Math.round(points / 45);
  const nextTier = TIERS.find((t) => points < t.qualifyPoints) ?? TIERS[TIERS.length - 1];

  const submitJoin = () => {
    const e: Record<string, string> = {};
    if (!form.first.trim()) e.first = 'Required';
    if (!form.last.trim()) e.last = 'Required';
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(form.email)) e.email = 'Enter a valid email';
    if (!form.dob) e.dob = 'We need a date of birth for the ticket';
    if (!form.agree) e.agree = 'Please accept the programme terms';
    setErrs(e);
    if (Object.keys(e).length) return;
    setJoin(false);
    signIn(form.email);
    toast({ tone: 'success', title: 'Welcome, Ama — number ANV-4471-9002', body: '4,000 bonus points land when you book your first flight this quarter.' });
  };

  return (
    <div>
      <PageHero
        tone="navy"
        image="/img/lounge.jpg"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'AeroNova Rewards' }]}
        eyebrow="AeroNova Rewards"
        title={
          <>
            Earn on the seat.
            <br />
            Spend on the thing that matters.
          </>
        }
        lead="No elite-status theatre, no points that evaporate on a Tuesday, no award seats held back for people who paid more. Four tiers, one currency, 21 airline partners."
        height="md"
      >
        <div className="mt-7 flex flex-wrap items-center gap-2.5">
          {user ? (
            <>
              <Button variant="onDark" to="/account/rewards" icon={<Award size={16} />}>
                {user.points.toLocaleString()} points · {user.tier}
              </Button>
              <Button variant="ghost" className="border border-white/25 text-white hover:bg-white/10" to="/account/rewards">
                Book an award flight
              </Button>
            </>
          ) : (
            <>
              <Button variant="onDark" onClick={() => setJoin(true)}>
                Join free · 4,000 bonus points
              </Button>
              <Button variant="ghost" className="border border-white/25 text-white hover:bg-white/10" to="/sign-in">
                I already have a number
              </Button>
            </>
          )}
        </div>
      </PageHero>

      {/* tier ladder */}
      <section id="tiers" className="scroll-mt-[calc(var(--nav)+1rem)] bg-mist-50/60 py-14">
        <div className="shell">
          <SectionHeading eyebrow="Tiers" title="Four levels. Everything published." lead="Qualification is points or sectors, whichever gets you there first — and we tell you the date you would land on." action={<Badge tone="neutral">2027 rules, unchanged since 2024</Badge>} />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {TIERS.map((t, i) => (
              <article key={t.id} className={cx('group relative flex flex-col overflow-hidden rounded-card p-5 text-white shadow-card transition hover:-translate-y-1 hover:shadow-lift', `bg-gradient-to-b ${TONE[t.colour]}`)} style={{ marginTop: i === 2 ? 14 : i === 3 ? 28 : 0 }}>
                {t.colour === 'gold' && <span className="absolute right-4 top-4 rounded-pill bg-navy-950/20 px-2 py-0.5 text-[.625rem] font-bold uppercase tracking-wider">Most flown</span>}
                <Sunburst size={26} className={cx(t.colour === 'gold' ? 'text-navy-900' : 'text-white/60')} />
                <h3 className={cx('mt-4 font-display text-[1.5rem] font-semibold', t.colour === 'gold' ? 'text-navy-950' : 'text-white')}>{t.name}</h3>
                <p className={cx('mt-1 text-[.875rem] leading-snug', t.colour === 'gold' ? 'text-navy-900/80' : 'text-white/70')}>{t.tagline}</p>
                <p className={cx('mt-3 rounded-[10px] px-2.5 py-1.5 text-[.75rem] font-semibold', t.colour === 'gold' ? 'bg-navy-950/10 text-navy-950' : 'bg-white/10 text-white/85')}>{t.qualify}</p>
                <ul className={cx('mt-4 flex-1 space-y-2 text-[.8125rem] leading-snug', t.colour === 'gold' ? 'text-navy-900' : 'text-white/78')}>
                  {t.benefits.map((b) => (
                    <li key={b} className="flex gap-2">
                      <Check size={13} className={cx('mt-0.5 shrink-0', t.colour === 'gold' ? 'text-navy-950' : 'text-teal-300')} />
                      {b}
                    </li>
                  ))}
                </ul>
                <Button size="sm" variant={t.colour === 'gold' ? 'primary' : 'onDark'} className="mt-5 w-full" onClick={() => toast({ tone: 'info', title: `${t.name} in detail`, body: t.perks.map((p) => `${p.label}: ${p.detail}`).join(' · ') })}>
                  What you get
                </Button>
              </article>
            ))}
          </div>

          {/* calculator */}
          <div className="mt-10 grid gap-6 rounded-card border border-line bg-white p-5 sm:p-7 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <Eyebrow>Points calculator</Eyebrow>
              <h3 className="text-h2 mt-2 text-[1.5rem]">What would you earn this year?</h3>
              <p className="mt-2 text-[.9375rem] leading-relaxed text-ink-600">Based on published earning rates. Tier bonuses are added at the end of the qualification year, not per flight.</p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="flex items-baseline justify-between text-[.875rem] font-medium text-navy-900">
                    <span>Trips a year</span>
                    <span className="num">{calc.trips}</span>
                  </span>
                  <input type="range" min={0} max={40} value={calc.trips} onChange={(e) => setCalc({ ...calc, trips: Number(e.target.value) })} className="mt-2 h-1.5 w-full appearance-none rounded-full bg-mist-200 accent-navy-700" aria-label="Trips per year" />
                </label>
                <label className="block">
                  <span className="flex items-baseline justify-between text-[.875rem] font-medium text-navy-900">
                    <span>Fare spend</span>
                    <span className="num">{money(calc.spend)}</span>
                  </span>
                  <input type="range" min={0} max={40000} step={200} value={calc.spend} onChange={(e) => setCalc({ ...calc, spend: Number(e.target.value) })} className="mt-2 h-1.5 w-full appearance-none rounded-full bg-mist-200 accent-navy-700" aria-label="Annual fare spend" />
                </label>
                <Field label="Cabin you usually book">
                  <SegmentedControl
                    full
                    size="sm"
                    value={calc.cabin}
                    onChange={(v) => setCalc({ ...calc, cabin: v })}
                    options={[
                      { id: 'ECONOMY', label: 'Economy' },
                      { id: 'PREMIUM', label: 'Premium' },
                      { id: 'BUSINESS', label: 'Business' },
                    ]}
                  />
                </Field>
                <div className="pt-1">
                  <Checkbox label="I hold the Nova Visa Signature card" desc="3 points per dollar on fares, dining and fuel" checked={calc.card} onChange={(v) => setCalc({ ...calc, card: v })} />
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-card bg-navy-900 p-5 text-white">
              <div className="pointer-events-none absolute inset-0 opacity-[0.07] texture-grid" />
              <div className="relative">
                <p className="text-[.6875rem] uppercase tracking-[0.16em] text-teal-300">Estimated annual balance</p>
                <p className="num mt-2 font-display text-[3rem] font-semibold leading-none">{points.toLocaleString()}</p>
                <p className="mt-2 text-[.875rem] text-white/65">
                  points · about <span className="num font-semibold text-white">{money(value)}</span> of travel value
                </p>
                <Divider className="my-4 !bg-white/12" />
                <ul className="space-y-2.5 text-[.8125rem]">
                  {[
                    ['Tier reached', points >= 60000 ? 'Elite' : points >= 30000 ? 'Voyager' : 'Explorer'],
                    ['Next tier', points >= 110000 ? 'Top tier held' : `${nextTier.name} at ${(nextTier.qualifyPoints - points).toLocaleString()} more`],
                    ['Award seats', `${Math.max(1, Math.round(points / 12000))} intra-African`],
                    ['Upgrade certs', points >= 60000 ? `${points >= 110000 ? 6 : 4} per year` : 'Not included at this tier'],
                    ['Expiry', points >= 60000 ? 'Never, while Elite holds' : `${new Date().getFullYear() + 3} · any flight resets it`],
                  ].map(([k, v]) => (
                    <li key={k} className="flex items-baseline justify-between gap-3 border-b border-white/10 pb-2 last:border-0">
                      <span className="text-white/50">{k}</span>
                      <span className="num font-medium text-white">{v}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="onDark" size="sm" className="mt-5 w-full" onClick={() => (user ? nav('/account/rewards') : setJoin(true))}>
                  {user ? 'Open my rewards' : 'Join and start earning'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* earn / redeem / partners */}
      <section className="bg-white py-14">
        <div className="shell">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { id: 'earn', label: 'Earn points' },
              { id: 'redeem', label: 'Redeem points' },
              { id: 'partners', label: 'Partners' },
            ]}
            className="mb-7"
          />

          <div id="earn" hidden={tab !== 'earn'} className="grid gap-4 lg:grid-cols-3">
            {EARN_TABLE.map((e) => (
              <div key={e.action} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-[.9375rem] font-semibold text-navy-900">{e.action}</p>
                  <Badge tone="teal">{e.points}</Badge>
                </div>
                <p className="mt-1.5 text-[.8125rem] leading-relaxed text-ink-500">{e.note}</p>
              </div>
            ))}
            <div className="rounded-card border border-dashed border-navy-200 bg-navy-50/50 p-4">
              <p className="font-display text-[.9375rem] font-semibold text-navy-900">Status runs on sectors too</p>
              <p className="mt-1.5 text-[.875rem] leading-relaxed text-ink-600">
                20 sectors earns Voyager, 45 earns Elite, 80 earns Elite Plus — a short hop counts the same as the North Atlantic, which is deliberate: we want the people who fly us often, not only expensively.
              </p>
              <Button size="sm" variant="secondary" className="mt-3" to="/travel-information/children">
                Family pooling
              </Button>
            </div>
          </div>

          <div id="redeem" hidden={tab !== 'redeem'} className="overflow-hidden rounded-card border border-line">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Route</th>
                  <th className="text-right">Economy award</th>
                  <th className="text-right">Business award</th>
                  <th className="hide-below-md">Notes</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {REDEEM_TABLE.map((r) => (
                  <tr key={r.route}>
                    <td className="font-semibold text-navy-900">{r.route}</td>
                    <td className="num text-right">{r.economy}</td>
                    <td className="num text-right">{r.business}</td>
                    <td className="hidden md:table-cell text-ink-500">{r.note}</td>
                    <td className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => nav('/search')}>
                        Check availability
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-wrap items-center gap-3 border-t border-line bg-mist-50 px-4 py-3 text-[.8125rem] text-ink-500">
              <Sparkles size={14} className="text-teal-600" /> Award seats are held on every flight — 4 economy and 2 business — and Elite Plus members can book them up to 4 hours before departure.
            </div>
          </div>

          <div id="partners" hidden={tab !== 'partners'} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {PARTNERS.map((p) => (
              <article key={p.name} className="card flex flex-col p-5">
                <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-navy-50 text-navy-700">
                  {p.kind === 'Airline' ? <PlaneTakeoff size={16} /> : p.kind === 'Finance' ? <CreditCard size={16} /> : p.kind === 'Hospitality' ? <Headphones size={16} /> : <Gift size={16} />}
                </span>
                <p className="mt-3 font-display text-[1rem] font-semibold text-navy-900">{p.name}</p>
                <p className="mt-1 text-[.75rem] uppercase tracking-wide text-ink-400">{p.kind}</p>
                <p className="mt-2 flex-1 text-[.875rem] leading-relaxed text-ink-600">{p.detail}</p>
                <button className="mt-3 self-start text-[.8125rem] font-semibold text-sky-700 underline-offset-4 hover:underline" onClick={() => toast({ tone: 'info', title: p.name, body: p.detail })}>
                  See the terms
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ + fine print */}
      <section className="bg-mist-50/60 py-14">
        <div className="shell grid gap-8 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <SectionHeading eyebrow="Questions" title="The seven we get asked most." className="mb-0" />
            <Accordion
              className="mt-6"
              single
              items={[
                { id: '1', q: 'Do points really not expire?', a: <p>They expire 36 months after they are earned, unless you fly once in that window — any paid or award AeroNova sector resets the whole balance. Elite and Elite Plus balances never expire. We do not run “use them or lose them” campaigns, and we have never devalued the award chart mid-year.</p> },
                { id: '2', q: 'Can I book for someone else?', a: <p>Yes, with up to five beneficiaries in your Family Pool. They need to be in the pool for 30 days before the first booking, which stops the resale market and costs honest families nothing.</p> },
                { id: '3', q: 'What about a partner flight?', a: <p>Galaxy Alliance partners earn 0.4–1.1 points per dollar depending on the fare class you bought, and you can redeem onto 21 airlines with through-checked bags. Blue Ibis, Sahel Airways and Gulf Meridian are the ones that matter on the continent.</p> },
                { id: '4', q: 'Do I lose status if I fly less one year?', a: <p>Status runs 12 months plus a grace quarter. After that it steps down one level a year rather than collapsing to zero, because losing a contract does not make you a worse customer.</p> },
                { id: '5', q: 'Upgrades on an award ticket?', a: <p>No — award tickets are already discounted, so upgrades and certificates do not apply. Cash fares, including the cheapest Light bucket, can be upgraded from 72 hours before departure.</p> },
                { id: '6', q: 'Is there a fee to join?', a: <p>No, and there never will be. The only cost is giving us an email address and a date of birth.</p> },
                { id: '7', q: 'What happens when a flight is cancelled?', a: <p>Award taxes come back to the card, the seats return to your balance within the hour, and we rebook you on anything that gets you there — partner included. Tier credits for the cancelled sector are still granted.</p> },
              ]}
            />
          </div>
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-card bg-navy-900 p-6 text-white">
              <RouteMotif />
              <p className="eyebrow relative text-gold-400">Nova Visa Signature</p>
              <h3 className="relative mt-2 font-display text-[1.375rem] font-semibold">The card that pays for the bag, not the champagne.</h3>
              <ul className="relative mt-4 space-y-2 text-[.875rem] text-white/75">
                {['3 points per dollar on AeroNova, fuel and restaurants', 'Two free checked bags for the whole family, every flight', 'USD 120 airport transfer credit each year', 'Galaxy Lounge passes: two a year, plus one guest', 'No foreign transaction fee, anywhere we fly'].map((b) => (
                  <li key={b} className="flex gap-2">
                    <Star size={14} className="mt-0.5 shrink-0 text-gold-400" /> {b}
                  </li>
                ))}
              </ul>
              <div className="relative mt-5 flex flex-wrap gap-2">
                <Button variant="onDark" size="sm" onClick={() => toast({ tone: 'info', title: 'Application started', body: 'A soft credit check only — it will not touch your score.' })}>
                  Apply in 4 minutes
                </Button>
                <Tooltip label="19.9% purchase APR · annual fee USD 95 · terms on the card page">
                  <span className="inline-flex items-center rounded-pill border border-white/20 px-3 py-1.5 text-[.75rem] font-semibold text-white/70">
                    Representative example
                  </span>
                </Tooltip>
              </div>
            </div>
            <div className="card p-5">
              <p className="font-display text-[.9375rem] font-semibold text-navy-900">The fine print, in our words</p>
              <p className="mt-2 text-[.875rem] leading-relaxed text-ink-600">
                Points are a goodwill credit, not a currency: they cannot be exchanged for cash, transferred for money, or sold. Fares are per seat, taxes are per passenger, and an award booking still owes the government its share — that is why we always show “plus taxes from USD 68”.
              </p>
              <p className="mt-3 text-[.75rem] text-ink-400">Programme rules v4.2 · effective 1 January 2027 · changed twice in seven years, both times in your favour.</p>
            </div>
          </div>
        </div>
      </section>

      <Modal
        open={join}
        onClose={() => setJoin(false)}
        title="Join AeroNova Rewards"
        subtitle="Free. 4,000 bonus points when you book a first flight by 31 December."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setJoin(false)}>
              Cancel
            </Button>
            <Button onClick={submitJoin}>Create my account</Button>
          </>
        }
      >
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="First name" required error={errs.first}>
            <Input value={form.first} onChange={(e) => setForm({ ...form, first: e.target.value })} invalid={!!errs.first} />
          </Field>
          <Field label="Last name" required error={errs.last}>
            <Input value={form.last} onChange={(e) => setForm({ ...form, last: e.target.value })} invalid={!!errs.last} />
          </Field>
          <Field label="Email" required error={errs.email} className="sm:col-span-2">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} invalid={!!errs.email} />
          </Field>
          <Field label="Date of birth" required error={errs.dob}>
            <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
          </Field>
          <Field label="Country">
            <Select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
              {['Ghana', 'Nigeria', 'Kenya', 'South Africa', 'United Kingdom', 'United States', 'Other'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="I usually fly" className="sm:col-span-2">
            <SegmentedControl
              full
              size="sm"
              value={form.tier}
              onChange={(v) => setForm({ ...form, tier: v })}
              options={[
                { id: 'explorer', label: 'A few times' },
                { id: 'voyager', label: 'Monthly' },
                { id: 'elite', label: 'Weekly' },
                { id: 'elite-plus', label: 'It is my job' },
              ]}
            />
          </Field>
          <div className="sm:col-span-2 space-y-2">
            <Checkbox label={<>I accept the <span className="font-semibold underline underline-offset-2">programme terms</span> and the privacy notice</>} checked={form.agree} onChange={(v) => setForm({ ...form, agree: v })} />
            {errs.agree && <p className="text-[.8125rem] font-medium text-red-600">{errs.agree}</p>}
            <Checkbox label="Email me about double-point weeks" desc="Roughly eight times a year." checked={form.marketing} onChange={(v) => setForm({ ...form, marketing: v })} />
          </div>
          <div className="sm:col-span-2 flex flex-wrap items-center gap-3 rounded-[12px] bg-mist-50 p-3 text-[.8125rem] text-ink-500">
            <Ticket size={15} className="text-teal-600" /> Your membership number looks like <span className="num font-display font-semibold text-navy-900">ANV-4471-9002</span> and works on every Galaxy Alliance carrier.
          </div>
        </div>
      </Modal>
    </div>
  );
}

function RouteMotif() {
  return (
    <svg viewBox="0 0 400 200" className="pointer-events-none absolute -right-10 -top-6 h-40 w-[420px] text-teal-400/25" fill="none" aria-hidden>
      <path d="M10 190 C 120 20, 260 10, 390 130" stroke="currentColor" strokeWidth="2" strokeDasharray="8 10" />
      <circle cx="10" cy="190" r="6" fill="currentColor" />
      <circle cx="390" cy="130" r="6" fill="none" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  );
}

export const CalendarCheckIcon = CalendarCheck;
