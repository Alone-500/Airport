import { useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Check, ChevronRight, Coins, Gift, Layers, Percent, Plus, Rocket, Save, Search, Star, Ticket, TrendingUp, Users, X } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from 'recharts';
import { cx, fmtDate, money, toISODate } from '../../lib/utils';
import { ADMIN_CUSTOMERS, ADMIN_FARES, ADMIN_FARES_HISTORY, ADMIN_LOYALTY_ROWS } from '../../data/admin';
import { EARN_TABLE, OFFERS, TIERS } from '../../data/offers';
import { DESTINATIONS } from '../../data/destinations';
import { FARES } from '../../data/fares';
import { AdminPage, BarList, MiniTable, Panel } from './AdminApp';
import { Badge, Button, Divider, EmptyState, Meter } from '../../components/ui/Primitives';
import { DataTable, KpiCard, type Column } from '../../components/ui/Table';
import { Menu, MenuDivider, MenuItem, Modal, Tabs } from '../../components/ui/Overlay';
import { Checkbox, Field, Input, RangeSlider, Select, TextArea } from '../../components/ui/Form';
import { useStore } from '../../store/store';

const AXIS = { fontSize: 11, fill: '#7A8798' } as const;
const tip = { borderRadius: 12, border: '1px solid #E1E8F0', fontSize: 12, fontFamily: 'Inter, sans-serif' };

/* ============================= FARES ============================= */
function Fares() {
  const { toast } = useStore();
  const [tab, setTab] = useState<'matrix' | 'editor' | 'comp'>('matrix');
  const [route, setRoute] = useState('ACC–LOS');
  const [cabin, setCabin] = useState('Economy');
  const [adjust, setAdjust] = useState(0);
  const [weeks, setWeeks] = useState<[number, number]>([1, 12]);
  const [applied, setApplied] = useState(false);
  const rows = ADMIN_FARES.filter((f) => f.route === route || tab === 'matrix');

  return (
    <AdminPage
      title="Fare management"
      lead="The fare families, buckets and rules the booking engine sells. Every change here is what a passenger sees as a price — including the ones we regret."
      actions={
        <>
          <Select value={route} onChange={(e) => setRoute(e.target.value)} className="h-9 w-[150px] text-[.8125rem]" aria-label="Route">
            {[...new Set(ADMIN_FARES.map((f) => f.route))].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
          <Button size="sm" variant="secondary" icon={<BarChart3 size={14} />}>
            Elasticity model
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Live fare buckets" value="216" note="4 cabins × 54 routes" />
        <KpiCard label="Yield, network" value="$0.141" delta={2.4} tone="teal" note="cents per seat-km" />
        <KpiCard label="Cheapest-in-market routes" value="11" tone="gold" note="we are the low fare on 11 lanes" />
        <KpiCard label="More expensive than rival" value="9" tone="ember" note="mostly against Sahel on LOS–JNB" />
        <KpiCard label="Changes today" value="14" tone="sky" note="all need Commercial sign-off above ±8%" />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'matrix', label: 'Fare matrix', count: ADMIN_FARES.length },
          { id: 'editor', label: 'Price adjuster' },
          { id: 'comp', label: 'Competitive position' },
        ]}
      />

      {tab === 'matrix' && (
        <Panel pad={false} title={`Fare buckets · ${route}`} lead="Sell-by dates are relative to today. Buckets close automatically when the seats run out.">
          <table className="w-full min-w-[900px] text-left text-[.8125rem]">
            <thead>
              <tr className="border-b border-[#E1E8F0] bg-[#F7FAFC] text-2xs uppercase tracking-wider text-ink-400">
                {['Cabin', 'Fare', 'Price', 'Mult.', 'Bags', 'Refund', 'Changes', 'Load', 'Seats left', 'Rival', ''].map((h, i) => (
                  <th key={h} className={cx('px-3 py-2 font-semibold', i >= 2 && i <= 9 && 'text-right')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1F6]">
              {rows.map((f) => (
                <tr key={f.route + f.fare} className="group transition hover:bg-[#F2F7FB]">
                  <td className="px-3 py-2 font-medium">{f.cabin}</td>
                  <td className="px-3 py-2">
                    <span className="font-semibold text-[#0B2340]">{f.fare}</span>
                    <span className="num block text-[.6875rem] text-ink-400">{f.route}</span>
                  </td>
                  <td className="num px-3 py-2 text-right font-semibold text-[#0B2340]">{money(f.price)}</td>
                  <td className="num px-3 py-2 text-right text-ink-500">×{f.mult.toFixed(2)}</td>
                  <td className="num px-3 py-2 text-right">{f.bags || '—'}</td>
                  <td className="px-3 py-2 text-right text-[.75rem] text-ink-500">{f.refund}</td>
                  <td className="px-3 py-2 text-right text-[.75rem] text-ink-500">{f.changes}</td>
                  <td className="px-3 py-2 text-right">
                    <Meter value={f.load} tone={f.load > 86 ? 'ember' : f.load > 70 ? 'teal' : 'navy'} className="ml-auto w-20" />
                  </td>
                  <td className={cx('num px-3 py-2 text-right font-semibold', f.seats <= 9 ? 'text-ember-600' : 'text-ink-600')}>{f.seats}</td>
                  <td className="num px-3 py-2 text-right">
                    {f.competitor ? (
                      <span className={cx('font-semibold', f.price < f.competitor ? 'text-teal-700' : 'text-red-600')}>{money(f.competitor)}</span>
                    ) : (
                      <span className="text-ink-300">no rival</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => { setTab('editor'); setCabin(f.cabin); }} className="rounded-[7px] border border-[#E1E8F0] px-2 py-1 text-[.6875rem] font-semibold text-ink-600 opacity-0 transition group-hover:opacity-100 hover:border-navy-400 hover:text-navy-900">
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      {tab === 'editor' && (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <Panel title="Price adjuster" lead={`${route} · ${cabin}`}>
            <div className="space-y-4">
              <div>
                <p className="flex items-baseline justify-between text-[.875rem] font-medium text-[#0B2340]">
                  <span>Adjustment</span>
                  <span className={cx('num font-display text-[1.125rem]', adjust === 0 ? 'text-ink-400' : adjust > 0 ? 'text-ember-600' : 'text-teal-700')}>
                    {adjust > 0 ? '+' : ''}
                    {adjust}%
                  </span>
                </p>
                <RangeSlider min={-25} max={40} step={1} value={[adjust, adjust]} onChange={(v) => { setAdjust(v[0]); setApplied(false); }} format={(n) => `${n > 0 ? '+' : ''}${n}%`} />
              </div>
              <div>
                <p className="flex items-baseline justify-between text-[.875rem] font-medium text-[#0B2340]">
                  <span>Apply to travel weeks</span>
                  <span className="num text-[.75rem] text-ink-400">
                    week {weeks[0]} → {weeks[1]} of 12
                  </span>
                </p>
                <RangeSlider min={1} max={12} value={weeks} onChange={setWeeks} format={(n) => `w${n}`} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Fare family">
                  <Select value={cabin} onChange={(e) => setCabin(e.target.value)}>
                    {FARES.map((f) => (
                      <option key={f.id} value={f.cabin}>
                        {f.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Reason code">
                  <Select defaultValue="demand">
                    {[['demand', 'Demand shift'], ['comp', 'Competitive response'], ['cost', 'Fuel / currency'], ['load', 'Load factor management'], ['event', 'Event or holiday']].map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="space-y-2">
                <Checkbox label="Open a new cheap bucket rather than reprice" desc="Adds 9 seats at the lower price; keeps the higher ones selling." />
                <Checkbox label="Notify the 214 people tracking this route" desc="Only for decreases. We do not message people when prices rise." defaultChecked />
                <Checkbox label="Requires Commercial sign-off" desc="Automatic above ±8% or on any long-haul lane." checked={Math.abs(adjust) > 8} disabled />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={!adjust || !applied === false} onClick={() => toast({ tone: 'success', title: `${route} ${cabin} ${adjust > 0 ? '+' : ''}${adjust}% published`, body: Math.abs(adjust) > 8 ? 'Sent to Commercial for sign-off; held until approved.' : 'Live in the engine within 40 seconds.' })} icon={<Save size={14} />}>
                  Submit change
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setApplied(true)}>
                  Dry-run impact
                </Button>
                {adjust !== 0 && (
                  <Button size="sm" variant="ghost" icon={<X size={14} />} onClick={() => { setAdjust(0); setApplied(false); }}>
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </Panel>
          <div className="space-y-4">
            <Panel title="Projected impact" lead="Model output, 12 weeks">
              {applied ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ['Revenue', (adjust >= 0 ? '+' : '') + Math.round(adjust * 0.72) + '%', 'teal'],
                      ['Load factor', (adjust >= 0 ? '' : '+') + Math.round(Math.abs(adjust) * 0.34) + ' pts', 'gold'],
                      ['Bookings', (adjust >= 0 ? '−' : '+') + Math.round(Math.abs(adjust) * 0.41) + '%', 'sky'],
                      ['Yield', (adjust >= 0 ? '+' : '−') + Math.round(Math.abs(adjust) * 0.55) + '%', 'navy'],
                    ].map(([k, v, tone]) => (
                      <div key={k as string} className="rounded-[10px] border border-[#E1E8F0] p-3">
                        <p className="text-[.625rem] uppercase tracking-wide text-ink-400">{k}</p>
                        <p className={cx('num mt-0.5 font-display text-[1.125rem] font-semibold', tone === 'teal' ? 'text-teal-700' : tone === 'gold' ? 'text-gold-600' : tone === 'sky' ? 'text-sky-700' : 'text-[#0B2340]')}>{v}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[.75rem] leading-relaxed text-ink-400">
                    Assumes elasticity of −1.6 for this lane, estimated from 26 months of our own data and 4 competitor reprices. The model is right about direction 71% of the time — which is why a human still presses the button.
                  </p>
                </>
              ) : (
                <EmptyState title="No dry run yet" body="Set an adjustment and run the impact model before publishing." icon={<TrendingUp size={20} />} />
              )}
            </Panel>
            <Panel title="Price history" lead={`${route} lowest fare, last 24 days`}>
              <div className="h-[150px]">
                <ResponsiveContainer>
                  <LineChart data={ADMIN_FARES_HISTORY} margin={{ top: 6, right: 6, bottom: 0, left: -22 }}>
                    <CartesianGrid stroke="#EDF1F6" vertical={false} />
                    <XAxis dataKey="day" tick={{ ...AXIS, fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
                    <YAxis tick={AXIS} axisLine={false} tickLine={false} width={42} />
                    <RTooltip contentStyle={tip} formatter={(v: number) => money(v)} />
                    <Line type="monotone" dataKey="acclos" stroke="#0B2340" strokeWidth={2} dot={false} name="ACC–LOS" />
                    <Line type="monotone" dataKey="nbojnb" stroke="#0FA79A" strokeWidth={1.6} dot={false} name="NBO–JNB" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {tab === 'comp' && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Panel pad={false} title="Where we are not the cheapest" lead="Ranked by revenue at risk">
            <table className="w-full text-left text-[.8125rem]">
              <thead>
                <tr className="border-b border-[#E1E8F0] bg-[#F7FAFC] text-2xs uppercase tracking-wider text-ink-400">
                  {['Route', 'Us', 'Rival', 'Δ', 'Their airline', 'Action'].map((h, i) => (
                    <th key={h} className={cx('px-3 py-2 font-semibold', i >= 1 && i <= 3 && 'text-right')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF1F6]">
                {ADMIN_FARES.filter((f) => f.competitor && f.price > f.competitor).map((f) => (
                  <tr key={f.route + f.fare} className="transition hover:bg-[#F2F7FB]">
                    <td className="px-3 py-2 font-semibold text-[#0B2340]">
                      {f.route}
                      <span className="block text-[.6875rem] font-normal text-ink-400">{f.fare}</span>
                    </td>
                    <td className="num px-3 py-2 text-right">{money(f.price)}</td>
                    <td className="num px-3 py-2 text-right">{money(f.competitor)}</td>
                    <td className="num px-3 py-2 text-right font-semibold text-red-600">+{Math.round(((f.price - f.competitor) / f.competitor) * 100)}%</td>
                    <td className="px-3 py-2 text-ink-500">{f.route.includes('LOS') ? 'Sahel Airways' : 'Blue Ibis'}</td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant="ghost" onClick={() => toast({ tone: 'info', title: 'Match proposed', body: 'Undercut by 2% for one week; requires sign-off because it is above 8%.' })}>
                        Match −2%
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          <Panel title="Fare rules inventory" lead="What each family currently promises">
            <ul className="space-y-2.5">
              {FARES.map((f) => (
                <li key={f.id} className="rounded-[10px] border border-[#E1E8F0] p-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[.875rem] font-semibold text-[#0B2340]">{f.name}</p>
                    <Badge tone={f.refundable ? 'teal' : 'neutral'}>{f.refundable ? 'refundable' : 'no refund'}</Badge>
                  </div>
                  <p className="mt-1 text-[.75rem] leading-snug text-ink-500">{f.summary}</p>
                  <p className="num mt-1.5 flex flex-wrap gap-x-4 text-[.6875rem] text-ink-400">
                    <span>bags {f.checkedBags}</span>
                    <span>change {f.changeable ? `$${f.changeFee}` : 'no'}</span>
                    <span>lounge {f.lounge ? 'yes' : 'no'}</span>
                    <span>×{f.priceIndex.toFixed(2)}</span>
                  </p>
                </li>
              ))}
            </ul>
            <Button size="sm" variant="secondary" className="mt-3 w-full" icon={<Layers size={14} />}>
              Edit rules for all routes
            </Button>
          </Panel>
        </div>
      )}
    </AdminPage>
  );
}

/* ============================= OFFERS ============================= */
function OffersAdmin() {
  const { toast } = useStore();
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [live, setLive] = useState<string[]>(['ov-lag', 'ov-lhr', 'ov-wknd']);
  const [draft, setDraft] = useState({ title: '', kicker: '', from: 'ACC', to: 'LOS', price: 189, was: 246, start: toISODate(new Date()), end: toISODate(new Date(Date.now() + 60 * 86400000)), deadline: toISODate(new Date(Date.now() + 20 * 86400000)), buckets: 9, exclusions: '18 Dec – 6 Jan', code: '', tone: 'navy' });
  const offerRows = OFFERS.map((o) => ({ ...o, state: live.includes(o.id) ? 'Live' : 'Scheduled', claimed: Math.abs(o.id.length * 137) % 900, redemption: 4 + (o.id.length % 9), budget: 250000 - (o.id.length % 6) * 20000 }));

  return (
    <AdminPage
      title="Offers & promotions"
      lead="Sales, promo codes and fare campaigns. Each offer is an inventory bucket with a budget, not a banner — when the seats run out, the card comes down."
      actions={
        <>
          <Button size="sm" variant="secondary" icon={<Search size={14} />}>
            Promotion analytics
          </Button>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => { setCreating(true); setStep(1); }}>
            New offer
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Live offers" value={String(live.length)} tone="teal" note={`${OFFERS.length} in the catalogue`} icon={<Gift size={15} />} />
        <KpiCard label="Booked via promo" value="4,182" delta={9.4} note="last 30 days" />
        <KpiCard label="Incremental revenue" value={money(1.84e6)} tone="gold" note="against a holdout group" />
        <KpiCard label="Budget remaining" value={money(1.12e6)} tone="sky" note="of 2.4M for the quarter" />
        <KpiCard label="Codes rejected" value="6.1%" tone="ember" note="expired or ineligible — we say why" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel pad={false} title="Campaigns" lead="Toggle to publish; the site updates within a minute">
          <div className="divide-y divide-[#EDF1F6]">
            {offerRows.map((o) => {
              const on = live.includes(o.id);
              const pct = Math.min(100, Math.round((o.claimed / (12 * 9)) * 100));
              return (
                <div key={o.id} className="flex flex-wrap items-center gap-4 px-4 py-3 transition hover:bg-[#F2F7FB]">
                  <button
                    onClick={() => {
                      setLive((v) => (on ? v.filter((x) => x !== o.id) : [...v, o.id]));
                      toast({ tone: on ? 'warn' : 'success', title: `${o.title} ${on ? 'withdrawn' : 'published'}`, body: on ? 'Removed from the site and the search rail.' : 'Live on offers, the homepage rail and the app.' });
                    }}
                    className={cx('relative h-6 w-11 shrink-0 rounded-full border transition', on ? 'border-teal-600 bg-teal-500' : 'border-[#E1E8F0] bg-mist-200')}
                    aria-pressed={on}
                    aria-label={`${on ? 'Unpublish' : 'Publish'} ${o.title}`}
                  >
                    <span className={cx('absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all', on ? 'left-[22px]' : 'left-[2px]')} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="text-[.875rem] font-semibold text-[#0B2340]">{o.title}</span>
                      <Badge tone={on ? 'teal' : 'neutral'}>{on ? 'Live' : 'Off'}</Badge>
                      {o.badge && <Badge tone="gold">{o.badge}</Badge>}
                    </p>
                    <p className="mt-0.5 text-[.75rem] text-ink-400">
                      {o.from} → {o.code} · {o.cabin} · book by {o.bookBy}
                    </p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <Meter value={pct} tone={pct > 80 ? 'ember' : 'teal'} className="w-32" />
                      <span className="num text-[.6875rem] text-ink-400">
                        {o.claimed} of {12 * 9} bucket seats · redemption {o.redemption}%
                      </span>
                    </div>
                  </div>
                  <div className="num shrink-0 text-right">
                    <p className="font-display text-[1rem] font-semibold text-[#0B2340]">{money(o.priceUSD)}</p>
                    <p className="text-[.6875rem] text-ink-400">{o.wasUSD ? `was ${money(o.wasUSD)}` : 'no strike-through'}</p>
                  </div>
                  <Menu label={() => <span className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-mist-100">⋯</span>} widthClass="w-56">
                    {(close) => (
                      <>
                        <MenuItem onClick={() => { close(); setCreating(true); setStep(2); }}>Duplicate</MenuItem>
                        <MenuItem onClick={() => { close(); toast({ tone: 'info', title: 'Preview', body: 'Renders the card against today’s engine prices.' }); }}>Preview</MenuItem>
                        <MenuItem onClick={() => { close(); toast({ tone: 'success', title: 'Budget raised', body: 'USD 50k moved from the seasonal pool; Finance notified.' }); }}>Increase budget</MenuItem>
                        <MenuDivider />
                        <MenuItem desc="Keeps the URL alive with a redirect" onClick={() => { close(); setLive((v) => v.filter((x) => x !== o.id)); }}>
                          End campaign
                        </MenuItem>
                      </>
                    )}
                  </Menu>
                </div>
              );
            })}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Promo codes" lead="Live in the booking flow, one per ticket">
            <MiniTable head={['Code', 'Discount', 'Used', 'Status']} rows={[['NOVADAY', '10% base', '3,182', 'live'], ['STUDENT', '12% + bag', '1,104', 'live'], ['AERONOVA5', '$5', '812', 'live'], ['BAGFREE', '1 bag', '244', 'capped'], ['EID26', '15%', '—', 'scheduled']].map((r) => r.map((c, i) => (i === 3 ? <Badge key={i} tone={c === 'live' ? 'teal' : c === 'capped' ? 'gold' : 'neutral'}>{c}</Badge> : <span key={i} className={i === 0 ? 'num font-semibold' : ''}>{c}</span>)))} />
            <Button size="sm" variant="secondary" className="mt-3 w-full" icon={<Percent size={14} />}>
              New code
            </Button>
          </Panel>
          <Panel title="Holdout test" lead="Is this sale actually working?">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Exposed', '+9.4% bookings', 'teal'],
                ['Holdout', 'baseline', 'neutral'],
                ['Elasticity', '−1.9 this lane', 'sky'],
                ['Cost per extra sale', money(41), 'gold'],
              ].map(([k, v, tone]) => (
                <div key={k as string} className="rounded-[10px] border border-[#E1E8F0] p-3">
                  <p className="text-[.625rem] uppercase tracking-wide text-ink-400">{k}</p>
                  <p className={cx('num mt-0.5 text-[.9375rem] font-semibold', tone === 'teal' ? 'text-teal-700' : tone === 'gold' ? 'text-gold-600' : tone === 'sky' ? 'text-sky-700' : 'text-ink-500')}>{v}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[.75rem] leading-relaxed text-ink-400">
              We keep 5% of eligible searchers out of every campaign permanently. Without it, an airline can convince itself a discount worked. This one did — barely.
            </p>
          </Panel>
          <Panel title="Distribution" lead="Where the offers are being seen">
            <BarList tone="navy" rows={[{ label: 'Homepage rail', value: 41200 }, { label: 'Offers page', value: 28400 }, { label: 'App push', value: 19800 }, { label: 'Email (NOVADAY)', value: 12600 }, { label: 'Search results banner', value: 9200 }].map((r) => ({ ...r, note: `${r.value.toLocaleString()} impressions` }))} />
          </Panel>
        </div>
      </div>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New offer"
        subtitle={`Step ${step} of 4 · ${draft.from} → ${draft.to}`}
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => (step === 1 ? setCreating(false) : setStep(step - 1))}>
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            <Button
              onClick={() => {
                if (step < 4) {
                  setStep(step + 1);
                  return;
                }
                setCreating(false);
                setLive((v) => [...v, 'new-' + Date.now()]);
                toast({ tone: 'success', title: 'Offer scheduled', body: 'Publishes at 06:00 GMT with 9 seats per flight in a new bucket.' });
              }}
              icon={step === 4 ? <Rocket size={15} /> : <ChevronRight size={15} />}
            >
              {step === 4 ? 'Schedule offer' : 'Next'}
            </Button>
          </div>
        }
      >
        {step === 1 && (
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Headline" className="sm:col-span-2" required>
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Accra ⇄ Lagos from $189" />
            </Field>
            <Field label="Supporting line" className="sm:col-span-2">
              <Input value={draft.kicker} onChange={(e) => setDraft({ ...draft, kicker: e.target.value })} placeholder="Why this exists, in one sentence" />
            </Field>
            <Field label="From">
              <Select value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })}>
                {['ACC', 'NBO', 'JNB', 'LOS'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="To">
              <Select value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })}>
                {DESTINATIONS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.city} ({d.code})
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Offer price (USD)">
              <Input type="number" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} className="num" />
            </Field>
            <Field label="Previous price (optional)">
              <Input type="number" value={draft.was} onChange={(e) => setDraft({ ...draft, was: Number(e.target.value) })} className="num" />
            </Field>
            <Field label="Seats in the bucket, per flight">
              <Input type="number" value={draft.buckets} onChange={(e) => setDraft({ ...draft, buckets: Number(e.target.value) })} className="num" />
            </Field>
            <Field label="Tone">
              <Select value={draft.tone} onChange={(e) => setDraft({ ...draft, tone: e.target.value })}>
                {['navy', 'teal', 'sky', 'gold', 'ember'].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <p className="sm:col-span-2 rounded-[10px] bg-mist-50 p-3 text-[.8125rem] leading-relaxed text-ink-500">
              Price floor: this lane’s cost per ASK is $0.091. At {money(draft.price)} on a {durationOr(draft.to)} sector you are above cash cost but below full-cost recovery — fine for a demand-stimulating sale, and we say so in the internal note.
            </p>
          </div>
        )}
        {step === 3 && (
          <div className="grid gap-3.5 sm:grid-cols-3">
            <Field label="Travel starts">
              <Input type="date" value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} className="num" />
            </Field>
            <Field label="Travel ends">
              <Input type="date" value={draft.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })} className="num" />
            </Field>
            <Field label="Book by">
              <Input type="date" value={draft.deadline} onChange={(e) => setDraft({ ...draft, deadline: e.target.value })} className="num" />
            </Field>
            <Field label="Excluded dates" className="sm:col-span-3">
              <Input value={draft.exclusions} onChange={(e) => setDraft({ ...draft, exclusions: e.target.value })} />
            </Field>
            <Field label="Promo code (optional)" className="sm:col-span-2">
              <Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} placeholder="NOVADAY" className="num uppercase tracking-[0.1em]" />
            </Field>
            <div className="sm:col-span-1 pt-1">
              <Checkbox label="Stack with tier bonus" defaultChecked />
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-[12px] border border-[#E1E8F0] p-4">
              <p className="text-2xs font-semibold uppercase tracking-wider text-ink-400">Preview as the passenger sees it</p>
              <div className="mt-3 flex items-end justify-between gap-4 rounded-[12px] bg-[#0B2340] p-4 text-white">
                <div>
                  <p className="font-display text-[1.125rem] font-semibold">{draft.title || 'Untitled offer'}</p>
                  <p className="mt-1 text-[.8125rem] text-white/65">{draft.kicker || '—'}</p>
                  <p className="num mt-2 text-[.75rem] text-white/50">
                    {draft.from} → {draft.to} · travel {fmtDate(draft.start, 'short')}–{fmtDate(draft.end, 'short')} · book by {fmtDate(draft.deadline, 'short')}
                  </p>
                </div>
                <p className="num shrink-0 text-right">
                  <span className="block text-[.625rem] uppercase tracking-[0.14em] text-white/45">from</span>
                  <span className="font-display text-[1.75rem] font-semibold leading-none">{money(draft.price)}</span>
                  {draft.was > 0 && <span className="block text-[.6875rem] text-white/45 line-through">{money(draft.was)}</span>}
                </p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ['Conditions auto-written', `Excludes ${draft.exclusions || 'none'}; ${draft.buckets} seats per flight; non-refundable`],
                ['Budget', `${money(180000)} cap at ${draft.buckets * 9 * 40} seats`],
                ['Legal', 'Auto-flagged for review — price is below the 90-day median'],
                ['Publishes', '06:00 GMT, with the app push 10 minutes later'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-[10px] bg-[#F7FAFC] p-3">
                  <p className="text-[.6875rem] font-semibold uppercase tracking-wide text-ink-400">{k}</p>
                  <p className="mt-0.5 text-[.8125rem] text-ink-600">{v}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Checkbox label="Auto-generate the conditions block from these fields" desc="Passengers see exclusions and seat limits before they pay, not after." defaultChecked />
              <Checkbox label="Flag for legal review before publishing" defaultChecked />
            </div>
          </div>
        )}
        {step > 1 && (
          <div className="mt-5 flex items-center gap-2 border-t border-[#E1E8F0] pt-4">
            {[1, 2, 3, 4].map((n) => (
              <button key={n} onClick={() => setStep(n)} className={cx('num flex h-7 w-7 items-center justify-center rounded-full text-[.75rem] font-bold transition', n === step ? 'bg-[#0B2340] text-white' : n < step ? 'bg-teal-500 text-white' : 'bg-mist-200 text-ink-500')}>
                {n < step ? <Check size={12} /> : n}
              </button>
            ))}
            <p className="ml-2 text-[.75rem] text-ink-400">Steps 1–3 are editable; step 4 locks the price for 20 minutes after publishing.</p>
          </div>
        )}
      </Modal>
    </AdminPage>
  );
}

const durationOr = (code: string) => {
  const d = DESTINATIONS.find((x) => x.code === code);
  return d?.durationMin ? `${Math.round(d.durationMin / 60)} h` : 'short-haul';
};

/* ============================= LOYALTY ============================= */
function LoyaltyAdmin() {
  const { toast } = useStore();
  const [tab, setTab] = useState<'members' | 'tiers' | 'adjust'>('members');
  const [adj, setAdj] = useState({ member: 'Ama Mensah', amount: 5000, reason: 'goodwill', note: '', notify: true });
  const [adjOpen, setAdjOpen] = useState(false);
  const totals = ADMIN_LOYALTY_ROWS.reduce((s, r) => ({ earned: s.earned + r.earned30, burned: s.burned + r.burned }), { earned: 0, burned: 0 });

  return (
    <AdminPage
      title="Loyalty management"
      lead="Memberships, tiers, point adjustments and the award-inventory policy. Adjustments are visible to the member with your note."
      actions={
        <>
          <Button size="sm" variant="secondary" icon={<Coins size={14} />}>
            Liability report
          </Button>
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setAdjOpen(true)}>
            Point adjustment
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Members" value="1.42M" delta={6.2} tone="navy" note="+78,400 this quarter" icon={<Users size={15} />} />
        <KpiCard label="Points liability" value={money(412e6)} tone="gold" note="at the USD 45 per 1k valuation" />
        <KpiCard label="Burn ratio" value="38.4%" delta={2.1} tone="teal" note="points redeemed vs earned, 12 mo" />
        <KpiCard label="Elite population" value="41,208" tone="sky" note="2.9% of members · 21% of revenue" />
        <KpiCard label="Expiring in 90 days" value="18.4M" tone="ember" note="reminders sent · 12% extended by a flight" />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'members', label: 'Members', count: ADMIN_LOYALTY_ROWS.length },
          { id: 'tiers', label: 'Tier rules' },
          { id: 'adjust', label: 'Adjustments & audit' },
        ]}
      />

      {tab === 'members' && (
        <Panel pad={false}>
          <DataTable
            searchable
            rows={ADMIN_LOYALTY_ROWS.map((r, i) => ({ ...r, key: r.id, i }))}
            pageSize={10}
            initialSort={{ key: 'points', dir: 'desc' }}
            columns={[
              { key: 'member', header: 'Member', primary: true, render: (r: { member: string; number: string }) => <span>{r.member}<span className="num block text-[.6875rem] font-normal text-ink-400">{r.number}</span></span> },
              { key: 'tier', header: 'Tier', render: (r: { tier: string }) => <Badge tone={r.tier === 'Elite Plus' ? 'ember' : r.tier === 'Elite' ? 'gold' : r.tier === 'Voyager' ? 'teal' : 'neutral'}>{r.tier}</Badge> },
              { key: 'points', header: 'Balance', align: 'right', render: (r: { points: number }) => <span className="num font-semibold">{r.points.toLocaleString()}</span> },
              { key: 'earned30', header: 'Earned 30d', align: 'right', hideBelow: 'md' },
              { key: 'burned', header: 'Burned', align: 'right', hideBelow: 'md' },
              { key: 'expiry', header: 'Expires', hideBelow: 'sm', render: (r: { expiry: string }) => <span className="num">{r.expiry}</span> },
              { key: 'nextTierIn', header: 'To next tier', align: 'right', hideBelow: 'lg', render: (r: { nextTierIn: number }) => (r.nextTierIn ? <span className="num">{r.nextTierIn.toLocaleString()}</span> : <span className="text-ink-300">top</span>) },
              { key: 'status', header: 'Status', align: 'right', render: (r: { status: string }) => <Badge tone={r.status === 'Good standing' ? 'teal' : 'gold'}>{r.status}</Badge> },
              {
                key: 'a',
                header: '',
                sort: false,
                align: 'right',
                render: (r: { member: string; points: number }) => (
                  <div className="flex justify-end gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setAdj({ ...adj, member: r.member }); setAdjOpen(true); }} className="rounded-[7px] border border-[#E1E8F0] px-2 py-1 text-[.6875rem] font-semibold text-ink-600 hover:border-navy-400 hover:text-navy-900">
                      Adjust
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toast({ tone: 'info', title: 'Statement', body: `${r.member}: ${r.points.toLocaleString()} pts, 6 entries, no pending expiry.` }); }} className="rounded-[7px] border border-[#E1E8F0] px-2 py-1 text-[.6875rem] font-semibold text-ink-600 hover:border-navy-400">
                      Ledger
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </Panel>
      )}

      {tab === 'tiers' && (
        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <Panel pad={false} title="Tier thresholds" lead="Rules in force · 2027 programme year">
            <table className="w-full text-left text-[.8125rem]">
              <thead>
                <tr className="border-b border-[#E1E8F0] bg-[#F7FAFC] text-2xs uppercase tracking-wider text-ink-400">
                  {['Tier', 'Qualify', 'Bonus', 'Bag', 'Seat', 'Lounge', 'Members'].map((h, i) => (
                    <th key={h} className={cx('px-3 py-2 font-semibold', i >= 2 && i <= 5 && 'text-center')}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDF1F6]">
                {TIERS.map((t, i) => (
                  <tr key={t.id} className="transition hover:bg-[#F2F7FB]">
                    <td className="px-3 py-2 font-semibold text-[#0B2340]">
                      <span className="flex items-center gap-2">
                        <Star size={13} className={t.colour === 'gold' ? 'text-gold-500' : t.colour === 'ember' ? 'text-ember-500' : t.colour === 'teal' ? 'text-teal-500' : 'text-sky-500'} /> {t.name}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-ink-500">{t.qualify}</td>
                    <td className="num px-3 py-2 text-center font-semibold text-teal-700">+{t.earnBonus}%</td>
                    <td className="px-3 py-2 text-center text-[.75rem]">{['+1 long-haul', '+1 all', '+2 · 32 kg', '3 · 32 kg'][i]}</td>
                    <td className="px-3 py-2 text-center text-[.75rem]">{['24 h', 'Booking', 'All rows', 'Any suite'][i]}</td>
                    <td className="px-3 py-2 text-center text-[.75rem]">{['$', '×2', '✓ +1', '✓ +2'][i]}</td>
                    <td className="num px-3 py-2 text-right">{[1284000, 96200, 38400, 2810][i].toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex flex-wrap items-center gap-2 border-t border-[#E1E8F0] px-4 py-3">
              <Button size="sm" onClick={() => toast({ tone: 'warn', title: 'Change drafted', body: 'Any threshold increase needs board sign-off and 12 months’ notice. Draft filed for review.' })} icon={<Save size={14} />}>
                Save threshold change
              </Button>
              <span className="text-[.75rem] text-ink-400">We have changed the qualifying rules twice in seven years, both times making them easier. Deliberate.</span>
            </div>
          </Panel>
          <div className="space-y-4">
            <Panel title="Earning rates" lead="Multipliers applied at the ledger, not the fare">
              <MiniTable head={['Action', 'Rate', 'Cap']} rows={EARN_TABLE.slice(0, 5).map((e) => [e.action, e.points, 'none'])} />
            </Panel>
            <Panel title="Award inventory policy" lead="How many seats we hold back per flight">
              <div className="space-y-3">
                {[
                  ['Economy award seats', 4, 4],
                  ['Business award seats', 2, 2],
                  ['Upgrade clearing window (days)', 21, 30],
                  ['Blackout days (Elite Plus)', 0, 0],
                ].map(([l, v, max]) => (
                  <div key={l as string}>
                    <p className="flex items-baseline justify-between text-[.8125rem]">
                      <span className="text-ink-600">{l}</span>
                      <span className="num font-semibold text-[#0B2340]">{v}</span>
                    </p>
                    <input type="range" min={0} max={max as number} defaultValue={v as number} className="mt-1.5 h-1.5 w-full appearance-none rounded-full bg-mist-200 accent-[#0B2340]" aria-label={l as string} />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[.75rem] leading-relaxed text-ink-400">Holding more award seats makes members happier and the premium cabin emptier. The current policy is the compromise our own data settled on: 4 and 2, always, no blackout for the top two tiers.</p>
            </Panel>
          </div>
        </div>
      )}

      {tab === 'adjust' && (
        <Panel pad={false} title="Recent adjustments" lead="Every manual point movement, with who did it and why">
          <table className="w-full min-w-[720px] text-left text-[.8125rem]">
            <thead>
              <tr className="border-b border-[#E1E8F0] bg-[#F7FAFC] text-2xs uppercase tracking-wider text-ink-400">
                {['Member', 'Points', 'Reason', 'Filed by', 'When', 'Note'].map((h, i) => (
                  <th key={h} className={cx('px-3 py-2 font-semibold', i === 1 && 'text-right')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1F6]">
              {[
                ['Ama Mensah', 4500, 'goodwill', 'E. Tetteh', '12 min ago', 'Six-hour delay in Lagos; hotel refused. Points plus the hotel we paid for directly.'],
                ['Ngozi Okafor', 1200, 'lost value', 'System', '1 h ago', 'Bag contents claim accepted, automatic credit.'],
                ['Baraka Kimani', -3400, 'reversal', 'J. Mwangi', '3 h ago', 'Fare was never paid; the credit was issued in error by a kiosk.'],
                ['Lerato Botha', 7800, 'medical downgrade', 'P. Dlamini', 'yesterday', 'Business seat unusable after surgery; refunded the difference and re-credited the tier points.'],
                ['Yara Haddad', 10000, 'operational', 'System', 'yesterday', 'Elite Plus status protection triggered by a medical leave notice.'],
                ['Omar Farouk', 500, 'bad service', 'A. Tetteh', '2 days ago', 'Crew argument in row 21; investigated and upheld against us.'],
              ].map((r) => (
                <tr key={String(r[0]) + String(r[4])} className="transition hover:bg-[#F2F7FB]">
                  <td className="px-3 py-2 font-semibold text-[#0B2340]">{r[0]}</td>
                  <td className={cx('num px-3 py-2 text-right font-semibold', String(r[1]).startsWith('-') ? 'text-red-600' : 'text-teal-700')}>{Number(r[1]) > 0 ? '+' : ''}{Number(r[1]).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <Badge tone={r[2] === 'reversal' ? 'red' : r[2] === 'goodwill' ? 'teal' : 'neutral'}>{r[2]}</Badge>
                  </td>
                  <td className="px-3 py-2 text-ink-500">{r[3]}</td>
                  <td className="px-3 py-2 text-ink-400">{r[4]}</td>
                  <td className="max-w-[280px] px-3 py-2 text-[.75rem] leading-snug text-ink-500">{r[5]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-wrap items-center gap-3 border-t border-[#E1E8F0] px-4 py-3 text-[.75rem] text-ink-500">
            <AlertTriangle size={14} className="text-gold-600" /> Adjustments above 10,000 points need a supervisor. The system blocks anyone from crediting their own member record.
            <span className="num ml-auto">
              Today: +{totals.earned.toLocaleString()} / −{totals.burned.toLocaleString()}
            </span>
          </div>
        </Panel>
      )}

      <Modal
        open={adjOpen}
        onClose={() => setAdjOpen(false)}
        title="Point adjustment"
        subtitle={`For ${adj.member} · a supervisor approves above 10,000`}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAdjOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAdjOpen(false);
                toast({ tone: 'success', title: `${adj.amount.toLocaleString()} points ${adj.amount > 0 ? 'credited' : 'debited'}`, body: adj.notify ? 'Member notified with your note attached.' : 'Applied silently; it still appears in their ledger.' });
              }}
            >
              Apply adjustment
            </Button>
          </>
        }
      >
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Member">
            <Select value={adj.member} onChange={(e) => setAdj({ ...adj, member: e.target.value })}>
              {ADMIN_CUSTOMERS.slice(0, 8).map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Points (negative to remove)">
            <Input type="number" value={adj.amount} onChange={(e) => setAdj({ ...adj, amount: Number(e.target.value) })} className="num" />
          </Field>
          <Field label="Reason">
            <Select value={adj.reason} onChange={(e) => setAdj({ ...adj, reason: e.target.value })}>
              {['goodwill', 'service failure', 'medical downgrade', 'operational', 'lost value', 'reversal', 'partner dispute'].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
          </Field>
          <Field label="Effective">
            <Select defaultValue="now">
              {['now', 'end of quarter', 'on next flight'].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
          </Field>
          <Field label="Note the member will see" className="sm:col-span-2" hint="Written in plain language, no case codes">
            <TextArea rows={3} value={adj.note} onChange={(e) => setAdj({ ...adj, note: e.target.value })} placeholder="Your flight was delayed six hours and the hotel did not cover it. We have paid for it and added these points." />
          </Field>
          <div className="sm:col-span-2">
            <Checkbox label="Notify the member by email" checked={adj.notify} onChange={(v) => setAdj({ ...adj, notify: v })} />
          </div>
        </div>
      </Modal>
    </AdminPage>
  );
}

/* ============================= CUSTOMERS ============================= */
function Customers() {
  const { toast } = useStore();
  const [profile, setProfile] = useState<(typeof ADMIN_CUSTOMERS)[number] | null>(null);
  const [segment, setSegment] = useState('all');
  const rows = useMemo(() => ADMIN_CUSTOMERS.filter((c) => segment === 'all' || (segment === 'elite' ? c.tier.includes('Elite') : segment === 'risk' ? c.status === 'Churn risk' : c.tier === segment)), [segment]);

  const cols: Column<(typeof ADMIN_CUSTOMERS)[number]>[] = [
    { key: 'name', header: 'Customer', primary: true, render: (c) => <span>{c.name}<span className="block text-[.6875rem] font-normal text-ink-400">{c.email}</span></span> },
    { key: 'tier', header: 'Tier', render: (c) => <Badge tone={c.tier === 'Elite Plus' ? 'ember' : c.tier === 'Elite' ? 'gold' : 'neutral'}>{c.tier}</Badge> },
    { key: 'market', header: 'Market', hideBelow: 'md' },
    { key: 'points', header: 'Points', align: 'right', render: (c) => <span className="num">{c.points.toLocaleString()}</span> },
    { key: 'spend', header: 'Spend 12m', align: 'right', render: (c) => <span className="num">{money(c.spend)}</span> },
    { key: 'bookings', header: 'Trips', align: 'right', hideBelow: 'sm' },
    { key: 'nps', header: 'NPS', align: 'right', hideBelow: 'lg', render: (c) => <span className={cx('num font-semibold', c.nps >= 9 ? 'text-teal-700' : c.nps <= 6 ? 'text-red-600' : 'text-ink-500')}>{c.nps}</span> },
    { key: 'lastActive', header: 'Last seen', hideBelow: 'md', render: (c) => <span className="num text-ink-500">{fmtDate(c.lastActive, 'short')}</span> },
    { key: 'status', header: 'Status', align: 'right', render: (c) => <Badge tone={c.status === 'Active' ? 'teal' : c.status === 'Churn risk' ? 'ember' : c.status === 'Frozen' ? 'red' : 'neutral'}>{c.status}</Badge> },
  ];

  return (
    <AdminPage
      title="Customer management"
      lead="One record per person: trips, points, documents, payment methods, cases and the marketing choices they made."
      actions={
        <>
          <Button size="sm" variant="secondary" icon={<BarChart3 size={14} />}>
            Cohort builder
          </Button>
          <Button size="sm" icon={<Plus size={14} />}>
            Create record
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Recognised customers" value="1.42M" delta={4.8} tone="navy" note="of 3.1M bookings a year" icon={<Users size={15} />} />
        <KpiCard label="Elite & above" value="41.2k" delta={9.1} tone="gold" note="21% of revenue" />
        <KpiCard label="Churn risk" value="12,884" tone="ember" note="no flight 9–15 months" />
        <KpiCard label="Average NPS" value="46" delta={3} tone="teal" note="rolling 12 months" />
        <KpiCard label="Consent for email" value="62%" tone="sky" note="we ask again every 24 months" />
      </div>

      <Panel pad={false} title="Customer records" lead="Read access is logged. Searching by an email address counts as a lookup.">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E1E8F0] px-4 py-2.5">
          {['all', 'Elite', 'Voyager', 'Explorer', 'elite', 'risk'].map((s) => (
            <button key={s} onClick={() => setSegment(s)} className={cx('rounded-pill border px-2.5 py-1 text-[.75rem] font-semibold capitalize transition', segment === s ? 'border-[#0B2340] bg-[#0B2340] text-white' : 'border-[#E1E8F0] text-ink-500 hover:border-navy-300')}>
              {s === 'all' ? 'Everyone' : s === 'elite' ? 'Elite+ only' : s === 'risk' ? 'Churn risk' : s}
            </button>
          ))}
          <span className="num ml-auto text-[.75rem] text-ink-400">{rows.length} records</span>
        </div>
        <DataTable rows={rows} columns={cols} pageSize={10} onRowClick={(c) => setProfile(c)} searchKeys={['name', 'email', 'tier', 'market', 'status']} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Value segments" lead="Revenue share by tier">
          <BarList
            tone="gold"
            rows={[
              { label: 'Elite Plus', value: 41200, note: `${money(184e6)} · avg ${money(4460)} per member` },
              { label: 'Elite', value: 38400, note: `${money(141e6)} · avg ${money(3670)}` },
              { label: 'Voyager', value: 96200, note: `${money(118e6)} · avg ${money(1226)}` },
              { label: 'Explorer', value: 1284000, note: `${money(204e6)} · avg ${money(159)}` },
            ]}
          />
        </Panel>
        <Panel title="What drives churn" lead="Modelled from the last three years of departures">
          <ul className="space-y-2.5">
            {[
              ['Missed connection we caused', 82],
              ['Bag that arrived late', 74],
              ['Fare change fee applied', 61],
              ['Seat changed without asking', 48],
              ['Long hold time on the phone', 31],
            ].map(([l, v]) => (
              <li key={l as string}>
                <div className="flex items-baseline justify-between text-[.8125rem]">
                  <span className="text-ink-600">{l}</span>
                  <span className="num font-semibold text-ember-600">{v}%</span>
                </div>
                <Meter value={v as number} tone="ember" className="mt-1" />
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[.75rem] leading-relaxed text-ink-400">Percentage of that group who did not fly us again within 12 months. Two of the five are fixable by policy, not money — and we changed both.</p>
        </Panel>
        <Panel title="Marketing consent" lead="Where we may write to them">
          <MiniTable head={['Channel', 'Opted in', 'Trend']} rows={[['Email', '62%', '+3 pts'], ['SMS', '41%', '+6 pts'], ['Push (app)', '78%', '+9 pts'], ['Post', '12%', '−1 pt'], ['Partner sharing', '34%', '−2 pts']].map((r) => r.map((c, i) => (i === 2 ? <Badge key={i} tone={c.startsWith('+') ? 'teal' : c.startsWith('−') ? 'gold' : 'neutral'}>{c}</Badge> : <span key={i}>{c}</span>)))} />
          <p className="mt-3 text-[.75rem] leading-relaxed text-ink-400">We re-ask everyone every 24 months rather than rely on a decade-old tick. Consent counts drop, trust goes up, and the emails work better.</p>
        </Panel>
      </div>

      <Modal
        open={!!profile}
        onClose={() => setProfile(null)}
        title={profile?.name ?? ''}
        subtitle={profile ? `${profile.email} · ${profile.tier} · member since ${fmtDate(profile.since, 'long')} · ${profile.market}` : ''}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setProfile(null)}>
              Close
            </Button>
            <Button onClick={() => { toast({ tone: 'success', title: 'Note added to the record', body: 'Visible to any agent who opens this customer, with your name and the timestamp.' }); setProfile(null); }} icon={<Ticket size={14} />}>
              Add service note
            </Button>
          </>
        }
      >
        {profile && (
          <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
            <div className="space-y-3">
              <div className="grid h-20 w-20 place-items-center rounded-[16px] bg-[#0B2340] font-display text-[1.5rem] font-bold text-gold-400">
                {profile.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <dl className="space-y-1.5 text-[.8125rem]">
                {[
                  ['Points', profile.points.toLocaleString()],
                  ['Qualifying', profile.yqp.toLocaleString()],
                  ['Sectors', String(profile.segments)],
                  ['Spend 12m', money(profile.spend)],
                  ['Status', profile.status],
                  ['NPS given', String(profile.nps)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2 border-b border-[#EDF1F6] pb-1">
                    <dt className="text-ink-400">{k}</dt>
                    <dd className="num font-medium text-[#0B2340]">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-wrap gap-1.5">
                <Badge tone="teal">Elite desk: 90 s</Badge>
                <Badge tone="gold">2 lounge guests</Badge>
                <Badge tone="sky">4 upgrade certs</Badge>
              </div>
            </div>
            <div>
              <p className="text-2xs font-semibold uppercase tracking-wider text-ink-400">Last 8 months</p>
              <ul className="mt-2 space-y-2">
                {[
                  ['12 Sep', 'Flew AN 204 Business · 5,400 pts credited', 'teal'],
                  ['3 Sep', 'Checked in via app · seat 2A chosen', 'neutral'],
                  ['28 Aug', 'Case SUP-4417 resolved · bag delivered', 'gold'],
                  ['14 Aug', 'Opened a refund on AN 771 (cancelled)', 'ember'],
                  ['30 Jul', 'Opted in to double-points email', 'sky'],
                  ['2 Jul', 'Flew NBO–JNB · 2,180 pts', 'teal'],
                ].map(([w, t, tone]) => (
                  <li key={w as string} className="flex items-start gap-3 rounded-[10px] border border-[#E1E8F0] p-2.5">
                    <span className={cx('mt-0.5 h-2 w-2 shrink-0 rounded-full', tone === 'teal' ? 'bg-teal-500' : tone === 'gold' ? 'bg-gold-500' : tone === 'ember' ? 'bg-ember-500' : tone === 'sky' ? 'bg-sky-500' : 'bg-ink-300')} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[.8125rem] text-[#0B2340]">{t}</span>
                      <span className="num block text-[.6875rem] text-ink-400">{w}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <Divider className="my-4" label="Preferences on file" />
              <div className="grid grid-cols-2 gap-2 text-[.8125rem]">
                {[
                  ['Seat', 'window'],
                  ['Meal', 'VGML'],
                  ['Language', 'English'],
                  ['Currency', 'USD'],
                  ['Assistance', 'none'],
                  ['Marketing', 'email only'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between rounded-[8px] bg-[#F7FAFC] px-2.5 py-1.5">
                    <span className="text-ink-400">{k}</span>
                    <span className="font-medium text-[#0B2340]">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminPage>
  );
}

export const CommercialPages = [
  { path: 'fares', el: <Fares /> },
  { path: 'offers', el: <OffersAdmin /> },
  { path: 'loyalty', el: <LoyaltyAdmin /> },
  { path: 'customers', el: <Customers /> },
];

export { Fares, OffersAdmin, LoyaltyAdmin, Customers };
