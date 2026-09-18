import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Award, Check, Download, Gift, Heart, Plane, Sparkles, Star, Ticket, Users, Wallet } from 'lucide-react';
import { cx, fmtDate, money } from '../../lib/utils';
import { AccountCard, AccountHeader } from './AccountLayout';
import { Badge, Button, Divider, Meter, SectionHeading } from '../../components/ui/Primitives';
import { Accordion, Modal, Tabs } from '../../components/ui/Overlay';
import { Checkbox, Field, Input, RangeSlider, Select } from '../../components/ui/Form';
import { EARN_TABLE, PARTNERS, REDEEM_TABLE, TIERS } from '../../data/offers';
import { useStore } from '../../store/store';

const ACTIVITY = [
  { t: 'Flight AN 200 · Accra → London', d: '2026-09-01', pts: 7540, kind: 'Fly', note: 'Business · double points Mon–Thu' },
  { t: 'Flight AN 201 · London → Accra', d: '2026-08-30', pts: 6980, kind: 'Fly', note: 'Business' },
  { t: 'Nova Visa Signature · monthly', d: '2026-08-28', pts: 3120, kind: 'Card', note: '3 pts per USD on fares and dining' },
  { t: 'Award booking · AN 300 economy', d: '2026-08-14', pts: -22500, kind: 'Redeem', note: 'Accra → Nairobi, taxes paid separately' },
  { t: 'Serene Hotels Nairobi · 3 nights', d: '2026-08-12', pts: 1500, kind: 'Partner', note: '500 per night' },
  { t: 'Elite tier bonus', d: '2026-08-12', pts: 1880, kind: 'Bonus', note: '25% on qualifying sectors' },
  { t: 'Anniversary credit', d: '2026-07-18', pts: 500, kind: 'Bonus', note: 'Seven years' },
  { t: 'Bag fee waiver · family', d: '2026-07-02', pts: -0, kind: 'Adjustment', note: 'Elite bag entitlement' },
];

export default function Rewards() {
  const nav = useNavigate();
  const { user, prefs, toast, wallet } = useStore();
  const [tab, setTab] = useState<'activity' | 'earn' | 'rewards'>('activity');
  const [spend, setSpend] = useState(3200);
  const [share, setShare] = useState(false);
  const [usePts, setUsePts] = useState(false);
  const [route, setRoute] = useState('ACC – LOS');

  if (!user) return null;
  const tier = TIERS.find((t) => t.name === user.tier) ?? TIERS[0];
  const next = TIERS[TIERS.indexOf(tier) + 1];
  const earned = ACTIVITY.filter((a) => a.pts > 0).reduce((s, a) => s + a.pts, 0);
  const burned = ACTIVITY.filter((a) => a.pts < 0).reduce((s, a) => s + -a.pts, 0);
  const expiry = useMemo(() => '2027-06-30', []);
  const certValue = useMemo(() => Math.round(spend * (tier.earnBonus / 100 + 1)), [spend, tier]);

  return (
    <div>
      <AccountHeader
        title="AeroNova Rewards"
        lead="Balance, activity, upgrade certificates and the pool you share with your household."
        badge={<Badge tone="gold">{tier.name}</Badge>}
        action={
          <>
            <Button size="sm" variant="secondary" icon={<Download size={14} />} onClick={() => toast({ tone: 'success', title: 'Statement downloaded', body: 'Last 12 months of activity, as a PDF.' })}>
              Statement
            </Button>
            <Button size="sm" onClick={() => setUsePts(true)}>
              Use points
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* balance */}
        <AccountCard tone="navy">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-[.625rem] uppercase tracking-[0.16em] text-teal-300">Available points</p>
              <p className="num mt-1.5 font-display text-[clamp(2.25rem,6vw,3.25rem)] font-semibold leading-none">{user.points.toLocaleString()}</p>
              <p className="mt-2 text-[.8125rem] text-white/55">
                Worth about {money(Math.round(user.points / 45), prefs.currency, { decimals: true })} · expire {fmtDate(expiry, 'long')} · one earning flight resets it
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-right">
              {[
                ['Earned 30d', `+${earned.toLocaleString()}`],
                ['Redeemed', `−${burned.toLocaleString()}`],
                ['Tier pts', user.yqp.toLocaleString()],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[.625rem] uppercase tracking-[0.12em] text-white/45">{k}</p>
                  <p className="num mt-1 font-display text-[1.0625rem] font-semibold">{v}</p>
                </div>
              ))}
            </div>
          </div>
          <Divider className="my-5 !bg-white/10" />
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-[220px] flex-1">
              <p className="flex items-baseline justify-between text-[.8125rem]">
                <span className="text-white/60">{next ? `${(next.qualifyPoints - user.points).toLocaleString()} points to ${next.name}` : 'Top tier — Elite Plus'}</span>
                <span className="num font-semibold text-teal-300">{next ? Math.round((user.points / next.qualifyPoints) * 100) : 100}%</span>
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-gold-400" style={{ width: `${next ? Math.min(100, (user.points / next.qualifyPoints) * 100) : 100}%` }} />
              </div>
              <p className="mt-2 text-[.75rem] text-white/45">{user.segments} sectors this year · 45 needed for Elite, 80 for Elite Plus</p>
            </div>
            <div className="flex gap-2">
              {[
                ['Upgrade certs', '4'],
                ['Guest passes', '2'],
                ['Vouchers', '1'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-[12px] border border-white/12 bg-white/[0.05] px-3 py-2 text-center">
                  <p className="num font-display text-[1.125rem] font-semibold">{v}</p>
                  <p className="text-[.625rem] uppercase tracking-[0.1em] text-white/45">{k}</p>
                </div>
              ))}
            </div>
          </div>
        </AccountCard>

        {/* side cards */}
        <div className="space-y-4">
          <AccountCard title="Travel wallet" lead="Refund credit and delay payouts, spent oldest-first">
            <ul className="space-y-2">
              {wallet.map((w) => (
                <li key={w.id} className="flex items-center gap-3 rounded-[12px] border border-line p-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-teal-50 text-teal-700">
                    <Wallet size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[.875rem] font-medium text-navy-900">{w.label}</span>
                    <span className="block text-[.75rem] text-ink-500">
                      {w.kind} · expires {w.expires}
                    </span>
                  </span>
                  <span className="num text-[.875rem] font-semibold text-navy-900">{money(w.amount, prefs.currency, { decimals: true })}</span>
                </li>
              ))}
            </ul>
            <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => toast({ tone: 'info', title: 'Wallet at checkout', body: 'Credit is applied automatically to the total; leftovers stay for next time.' })}>
              How wallet works
            </Button>
          </AccountCard>

          <AccountCard title="Family Pool" lead="Five people, one balance, one household">
            <ul className="space-y-2">
              {[
                { n: 'Ama Mensah', r: 'You · primary', p: 78420 },
                { n: 'Kwabena Mensah', r: 'Spouse', p: 41180 },
                { n: 'Naa Mensah', r: 'Child · 10', p: 6200 },
              ].map((m) => (
                <li key={m.n} className="flex items-center gap-3 border-b border-line pb-2 last:border-0">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy-50 font-display text-[.6875rem] font-bold text-navy-800">{m.n.slice(0, 1)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[.875rem] font-medium text-navy-900">{m.n}</span>
                    <span className="block text-[.75rem] text-ink-400">{m.r}</span>
                  </span>
                  <span className="num text-[.8125rem] font-semibold text-navy-900">{m.p.toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setShare(true)} icon={<Users size={14} />}>
                Invite
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toast({ tone: 'info', title: 'Pool rules', body: 'New members must be in the pool 30 days before anyone books with the pooled balance.' })}>
                Rules
              </Button>
            </div>
          </AccountCard>
        </div>
      </div>

      {/* activity / earn / redeem */}
      <div className="mt-5">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: 'activity', label: 'Activity', count: ACTIVITY.length },
            { id: 'earn', label: 'Ways to earn' },
            { id: 'rewards', label: 'Redeem & partners' },
          ]}
          className="mb-4"
        />

        {tab === 'activity' && (
          <AccountCard className="p-0 [&>div:last-child]:p-0">
            <ul className="divide-y divide-line">
              {ACTIVITY.map((a, i) => (
                <li key={i} className="flex flex-wrap items-center gap-4 px-4 py-3 sm:px-5">
                  <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-[10px]', a.pts > 0 ? 'bg-teal-50 text-teal-700' : a.pts < 0 ? 'bg-ember-100 text-ember-700' : 'bg-mist-100 text-ink-500')}>
                    {a.kind === 'Fly' ? <Plane size={15} /> : a.kind === 'Card' ? <Wallet size={15} /> : a.kind === 'Redeem' ? <Ticket size={15} /> : <Sparkles size={15} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[.9375rem] font-medium text-navy-900">{a.t}</span>
                    <span className="block text-[.8125rem] text-ink-500">{a.note}</span>
                  </span>
                  <span className="num text-[.75rem] text-ink-400">{fmtDate(a.d, 'short')}</span>
                  <span className={cx('num w-[92px] text-right font-display text-[.9375rem] font-semibold', a.pts > 0 ? 'text-teal-700' : a.pts < 0 ? 'text-ember-600' : 'text-ink-400')}>
                    {a.pts > 0 ? '+' : ''}
                    {a.pts.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-mist-50/60 px-4 py-3 sm:px-5">
              <p className="num text-[.8125rem] text-ink-500">Balance after these transactions: <span className="font-semibold text-navy-900">{user.points.toLocaleString()}</span> points</p>
              <Button size="sm" variant="ghost" icon={<Download size={14} />}>
                Export
              </Button>
            </div>
          </AccountCard>
        )}

        {tab === 'earn' && (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <AccountCard title="Earning rates" lead="Per USD of base fare, before tier bonus">
              <ul className="divide-y divide-line">
                {EARN_TABLE.map((e) => (
                  <li key={e.action} className="flex flex-wrap items-center gap-3 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[.875rem] font-medium text-navy-900">{e.action}</span>
                      <span className="block text-[.75rem] text-ink-500">{e.note}</span>
                    </span>
                    <Badge tone="teal">{e.points}</Badge>
                  </li>
                ))}
              </ul>
            </AccountCard>
            <AccountCard title="Points calculator" lead="What your next year could earn">
              <label className="block">
                <span className="flex items-baseline justify-between text-[.875rem] font-medium text-navy-900">
                  <span>Fare spend</span>
                  <span className="num">{money(spend)}</span>
                </span>
                <RangeSlider min={0} max={20000} step={200} value={[0, spend]} onChange={(v) => setSpend(v[1])} format={(n) => money(n)} />
              </label>
              <div className="mt-4 rounded-[12px] bg-mist-50 p-4">
                <p className="num font-display text-[1.75rem] font-semibold text-navy-900">{certValue.toLocaleString()}</p>
                <p className="text-[.8125rem] text-ink-500">points · {tier.name} bonus of +{tier.earnBonus}% included</p>
                <Meter value={Math.min(100, (certValue / (next?.qualifyPoints ?? certValue)) * 100)} tone="teal" className="mt-3" label={`Toward ${next?.name ?? 'top tier'}`} />
              </div>
              <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => nav('/book')}>
                Book something to earn it
              </Button>
            </AccountCard>
          </div>
        )}

        {tab === 'rewards' && (
          <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
            <AccountCard title="Award chart" lead="Fixed-partner pricing · taxes and fees extra" className="p-0 [&>div:last-child]:p-0">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Route</th>
                    <th className="text-right">Economy</th>
                    <th className="text-right">Business</th>
                    <th className="hide-below-md">Note</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {REDEEM_TABLE.map((r) => (
                    <tr key={r.route}>
                      <td className="font-semibold text-navy-900">{r.route}</td>
                      <td className="num text-right">{r.economy}</td>
                      <td className="num text-right">{r.business}</td>
                      <td className="hidden text-[.8125rem] text-ink-500 md:table-cell">{r.note}</td>
                      <td className="text-right">
                        <button onClick={() => { setRoute(r.route); setUsePts(true); }} className="text-[.8125rem] font-semibold text-sky-700 hover:underline">
                          Check seats
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AccountCard>
            <div className="space-y-4">
              <AccountCard title="Partners">
                <ul className="space-y-3">
                  {PARTNERS.slice(0, 4).map((p) => (
                    <li key={p.name} className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-mist-100 text-navy-700">
                        {p.kind === 'Airline' ? <Plane size={14} /> : <Gift size={14} />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[.875rem] font-semibold text-navy-900">{p.name}</span>
                        <span className="block text-[.8125rem] leading-snug text-ink-500">{p.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </AccountCard>
              <AccountCard title="Tier benefits you are using">
                <ul className="space-y-2.5">
                  {tier.perks.map((p) => (
                    <li key={p.label} className="flex items-start gap-2.5 rounded-[12px] border border-line p-3">
                      <Check size={15} className="mt-0.5 shrink-0 text-teal-600" />
                      <span>
                        <span className="block text-[.875rem] font-medium text-navy-900">{p.label}</span>
                        <span className="block text-[.8125rem] text-ink-500">{p.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </AccountCard>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <SectionHeading eyebrow="Certificates & vouchers" title="Four suite upgrades, two guest passes, one USD 90 voucher." lead="They clear automatically 21 days before departure when a suite is open. You can send any of them to someone else." className="mb-0 [&_h2]:text-[1.375rem]" />
        <div className="space-y-3">
          {[
            { k: 'Upgrade certificate · Business', v: '4 unused', d: 'Expires 31 Dec 2027 · any long-haul, any cash fare', i: <Award size={16} /> },
            { k: 'Galaxy Lounge guest pass', v: '2 unused', d: 'Any station · book in the lounge desk or in-app', i: <Star size={16} /> },
            { k: 'Voucher · goodwill', v: 'USD 90', d: 'Any AeroNova purchase including bags and Wi-Fi · to 12 Mar 2027', i: <Gift size={16} /> },
          ].map((x) => (
            <div key={x.k} className="card flex flex-wrap items-center gap-4 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-gold-100 text-gold-600">{x.i}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[.9375rem] font-semibold text-navy-900">{x.k}</span>
                <span className="block text-[.8125rem] text-ink-500">{x.d}</span>
              </span>
              <Badge tone="teal">{x.v}</Badge>
              <Button size="sm" variant="secondary" iconRight={<ArrowRight size={14} />}>
                Use
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Accordion
          items={[
            { id: '1', q: 'Can I move points to my partner or child?', a: <p>Yes — add them to the Family Pool and the balance is shared for booking, not for cash. They must live at the same address, or be your spouse, parent or child.</p> },
            { id: '2', q: 'Do my points expire while I am on maternity leave?', a: <p>They do not expire while you hold Elite or above. Below that, one earning flight in the 36-month window resets everything — and if you write to us about a medical or bereavement period we extend the balance by 12 months, no certificate needed.</p> },
            { id: '3', q: 'What is a cash + points booking?', a: <p>Any fare from 24,000 points plus the remainder in money, priced live at the payment step. It is almost always better value than a full award on the North Atlantic, and worse intra-Africa.</p> },
          ]}
        />
      </div>

      {/* use points modal */}
      <Modal
        open={usePts}
        onClose={() => setUsePts(false)}
        title="Book with points"
        subtitle={`${user.points.toLocaleString()} available · ${route}`}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setUsePts(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setUsePts(false);
                nav('/search?cabin=ECONOMY');
                toast({ tone: 'info', title: 'Award availability loaded', body: 'Search results now show award seats where they are open.' });
              }}
            >
              Show award seats
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <Field label="Route">
            <Select value={route} onChange={(e) => setRoute(e.target.value)}>
              {REDEEM_TABLE.map((r) => (
                <option key={r.route}>{r.route}</option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Cabin">
              <Select>
                <option>Economy · 12,000</option>
                <option>Business · 26,000</option>
                <option>Cash + points · 24,000 + USD 240</option>
              </Select>
            </Field>
            <Field label="Passengers">
              <Select>
                {[1, 2, 3, 4].map((n) => (
                  <option key={n}>{n} traveller{n > 1 ? 's' : ''}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="rounded-[12px] bg-mist-50 p-3.5 text-[.875rem] text-ink-600">
            <p className="flex items-baseline justify-between">
              <span>Points to use</span>
              <span className="num font-display text-[1.125rem] font-semibold text-navy-900">{Math.min(user.points, 12000).toLocaleString()}</span>
            </p>
            <p className="mt-1.5 flex items-baseline justify-between">
              <span>Taxes & fees</span>
              <span className="num font-medium">{money(68, prefs.currency)}</span>
            </p>
            <Divider className="my-2.5" />
            <Checkbox label="Use upgrade certificates instead where possible" desc="Saves 14,000 points on this itinerary" defaultChecked onChange={() => {}} />
          </div>
          <p className="text-[.8125rem] leading-relaxed text-ink-500">
            Award seats are held on every flight — four economy, two business — and open to you up to four hours before departure. Elite Plus has no blackout dates.
          </p>
        </div>
      </Modal>

      <Modal
        open={share}
        onClose={() => setShare(false)}
        title="Invite to your Family Pool"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShare(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShare(false);
                toast({ tone: 'success', title: 'Invitation sent', body: 'They have 14 days to accept. The pool balance is shared once they do.' });
              }}
            >
              Send invite
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Their email" required>
            <Input type="email" placeholder="someone@example.com" />
          </Field>
          <Field label="Relationship">
            <Select>
              {['Spouse or partner', 'Parent', 'Child', 'Sibling', 'Other household member'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </Select>
          </Field>
          <Checkbox label="Share my booking history with them" desc="Useful for family trips; they will see your seats and routes." />
          <p className="rounded-[10px] bg-mist-50 p-3 text-[.8125rem] leading-relaxed text-ink-500">
            They need to accept, and to be in the pool for 30 days before anyone books with the pooled balance. Nobody can move points out of a pool.
          </p>
        </div>
      </Modal>

      <SectionHeading eyebrow="Heart" title="Give points away" lead="Donate to the conservation levy or the crew hardship fund — 1,000 points is USD 22 of real work on the ground." className="mt-8 [&_h2]:text-[1.125rem]" />
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {[
          { t: 'Conservation levy', d: 'Anti-poaching units at VFA, JRO, ZNZ, KGL and MRU', v: '1,000 pts' },
          { t: 'Crew hardship fund', d: 'For colleagues in acute need — matched 1:1 by the company', v: '500 pts' },
          { t: 'Girls in Aviation, Kumasi', d: 'One term of tuition, tools and travel for one student', v: '4,000 pts' },
        ].map((x) => (
          <button key={x.t} onClick={() => toast({ tone: 'success', title: `Donated · ${x.t}`, body: `${x.v} converted and passed on. A receipt is in your email.` })} className="card group p-4 text-left transition hover:border-sky-300 hover:shadow-card">
            <p className="flex items-center gap-2 font-display text-[.9375rem] font-semibold text-navy-900">
              <Heart size={14} className="text-ember-500" /> {x.t}
            </p>
            <p className="mt-1.5 text-[.8125rem] leading-relaxed text-ink-500">{x.d}</p>
            <p className="num mt-2.5 text-[.8125rem] font-semibold text-teal-700">{x.v}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
