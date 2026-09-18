import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Clock, Globe, Mail, MapPin, MessageSquare, Phone, Send, ShieldCheck } from 'lucide-react';
import { cx } from '../../lib/utils';
import { Badge, Button, Divider, SectionHeading } from '../../components/ui/Primitives';
import { Modal } from '../../components/ui/Overlay';
import { Checkbox, Field, Input, Select, TextArea } from '../../components/ui/Form';
import { Photo } from '../../components/brand/Brand';
import { PageHero } from '../../components/layout/PublicLayout';
import { useStore } from '../../store/store';

const OFFICES = [
  { city: 'Accra', role: 'Group head office', addr: 'AeroNova House, 12 Airport City, Accra', tel: '+233 302 200 100', hours: 'Reservations 24/7 · Corporate 07:00–19:00', img: '/img/city-accra.jpg' },
  { city: 'Nairobi', role: 'East Africa hub', addr: 'Galaxy Concourse C, JKIA, Nairobi', tel: '+254 20 765 4100', hours: '04:00–01:00 EAT, every day', img: '/img/city-nairobi.jpg' },
  { city: 'Johannesburg', role: 'Southern Africa', addr: '104 Rivonia Boulevard, Sandton', tel: '+27 11 204 7700', hours: '06:00–22:00 SAST', img: '/img/city-capetown.jpg' },
  { city: 'London', role: 'Europe & North America sales', addr: '2nd Floor, 12 Savoy Street, EC2R', tel: '+44 20 3995 2200', hours: 'Mon–Fri 07:00–20:00 GMT', img: '/img/city-london.jpg' },
  { city: 'Dubai', role: 'Middle East & Asia', addr: 'Airport Tower 1, next to Terminal 3', tel: '+971 4 881 2200', hours: 'Sun–Thu 08:00–19:00 · Sat on call', img: '/img/city-dubai.jpg' },
];

export default function Contact() {
  const { toast } = useStore();
  const [form, setForm] = useState({ topic: 'General enquiry', name: '', email: '', ref: '', message: '', contact: 'email', urgent: false });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<string | null>(null);
  const [callback, setCallback] = useState(false);

  const submit = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'Your name';
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(form.email)) e.email = 'A valid email so we can reply';
    if (form.message.trim().length < 15) e.message = 'A sentence or two about what you need';
    setErrs(e);
    if (Object.keys(e).length) return;
    const id = `CT-${Math.floor(20000 + Math.random() * 79999)}`;
    setSent(id);
    toast({ tone: 'success', title: `Message sent · ${id}`, body: form.urgent ? 'Flagged urgent — a supervisor sees this within 20 minutes.' : 'We reply in 3 hours on average.' });
  };

  return (
    <div>
      <PageHero
        tone="white"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
        eyebrow="Contact"
        title="The fastest way to reach the right person."
        lead="Six numbers, five offices, and a form that routes itself. If your flight is in the next 24 hours, call — do not write."
        height="sm"
      />

      <section className="bg-mist-50/60 py-12">
        <div className="shell grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: <Phone size={16} />, t: 'Reservations & support', v: '+233 302 200 100', n: '24/7 · 90 sec average wait · English, French, Twi', fast: true },
                { icon: <MessageSquare size={16} />, t: 'WhatsApp', v: '+233 302 200 111', n: 'Best for photos: damaged bags, invoices, seat issues', fast: true },
                { icon: <Mail size={16} />, t: 'Written cases', v: 'help@aeronova.aero', n: '3 h 12 min median reply, this week', fast: false },
                { icon: <ShieldCheck size={16} />, t: 'Accessibility desk', v: '+233 302 200 200', n: '24/7 · assistance requests and complaints', fast: true },
                { icon: <Globe size={16} />, t: 'Corporate travel', v: 'business@aeronova.aero', n: 'Nova for Business accounts, invoicing, RFPs', fast: false },
                { icon: <Mail size={16} />, t: 'Press & investigations', v: 'press@aeronova.aero', n: 'Accredited media, 4 h on working days', fast: false },
              ].map((c) => (
                <a key={c.t} href={c.t.includes('Phone') || c.v.startsWith('+') ? `tel:${c.v.replace(/\s/g, '')}` : `mailto:${c.v}`} className="group card flex items-start gap-3 p-4 transition hover:border-sky-300 hover:shadow-card">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-navy-50 text-navy-700">{c.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-display text-[.9375rem] font-semibold text-navy-900">{c.t}</span>
                      {c.fast && <Badge tone="teal">Fastest</Badge>}
                    </span>
                    <span className="num mt-0.5 block text-[.875rem] font-medium text-sky-700">{c.v}</span>
                    <span className="mt-0.5 block text-[.75rem] leading-snug text-ink-500">{c.n}</span>
                  </span>
                </a>
              ))}
            </div>

            <div className="card p-5">
              <SectionHeading eyebrow="Offices" title="Where we are." className="mb-5 [&_h2]:text-[1.375rem]" />
              <ul className="divide-y divide-line">
                {OFFICES.map((o) => (
                  <li key={o.city} className="grid gap-4 py-4 first:pt-0 last:pb-0 sm:grid-cols-[120px_1fr_auto]">
                    <Photo src={o.img} alt={o.city} seed={o.city} className="h-20 rounded-[12px]" />
                    <div className="min-w-0">
                      <p className="font-display text-[1rem] font-semibold text-navy-900">
                        {o.city} <span className="text-[.8125rem] font-medium text-ink-400">· {o.role}</span>
                      </p>
                      <p className="mt-1 flex items-start gap-1.5 text-[.875rem] text-ink-600">
                        <MapPin size={14} className="mt-0.5 shrink-0 text-ink-400" /> {o.addr}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-[.8125rem] text-ink-500">
                        <Clock size={13} className="text-ink-400" /> {o.hours}
                      </p>
                    </div>
                    <p className="num shrink-0 self-center text-[.875rem] font-semibold text-navy-900">{o.tel}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { t: 'Lost property', b: 'Report within 24 h of arrival for the fastest return; 71% come back to the owner.', to: '/travel-information/lost-baggage' },
                { t: 'Feedback & complaints', b: 'We answer every one. If you are unhappy with our answer, the Civil Aviation Authority route is in the reply.', to: '/help' },
                { t: 'Group & sports travel', b: '10 or more travellers: one invoice, blocked seats, and a named coordinator.', to: '/contact' },
              ].map((x) => (
                <Link key={x.t} to={x.to} className="group rounded-card border border-line bg-white p-4 transition hover:border-sky-300">
                  <p className="font-display text-[.9375rem] font-semibold text-navy-900">{x.t}</p>
                  <p className="mt-1.5 text-[.8125rem] leading-relaxed text-ink-500">{x.b}</p>
                  <span className="mt-2.5 inline-block text-[.8125rem] font-semibold text-sky-700 group-hover:underline">Open →</span>
                </Link>
              ))}
            </div>
          </div>

          {/* form */}
          <div className="lg:sticky lg:top-[calc(var(--nav)+16px)] lg:self-start">
            <div className="card overflow-hidden">
              <div className="bg-navy-900 px-5 py-4 text-white">
                <p className="eyebrow text-teal-300">Write to us</p>
                <p className="mt-1.5 font-display text-[1.0625rem] font-semibold">Tell us once, and we route it.</p>
              </div>
              {sent ? (
                <div className="p-5">
                  <p className="flex items-center gap-2 font-display text-[1rem] font-semibold text-teal-700">
                    <Check size={16} /> Received — case {sent}
                  </p>
                  <p className="mt-2 text-[.875rem] leading-relaxed text-ink-600">
                    A reply is on its way to {form.email}. If this involves travel in the next 24 hours, call {form.topic.includes('Bag') ? '+233 302 200 300' : '+233 302 200 100'} rather than wait for us.
                  </p>
                  <Divider className="my-4" />
                  <ul className="space-y-2 text-[.875rem] text-ink-600">
                    {['You will get a case number by email in a few minutes', 'Escalate any time by replying “supervisor”', 'Nothing you wrote goes to sales or marketing'].map((x) => (
                      <li key={x} className="flex gap-2">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-teal-500" /> {x}
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" variant="secondary" className="mt-4 w-full" onClick={() => setSent(null)}>
                    Write another
                  </Button>
                </div>
              ) : (
                <div className="space-y-3.5 p-5">
                  <Field label="What is this about" required>
                    <Select value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })}>
                      {['General enquiry', 'Baggage problem', 'Refund or cancellation', 'Flight disruption', 'Accessibility & assistance', 'Loyalty points', 'Feedback about crew', 'Press enquiry', 'Corporate travel'].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </Select>
                  </Field>
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <Field label="Your name" required error={errs.name}>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} invalid={!!errs.name} />
                    </Field>
                    <Field label="Email" required error={errs.email}>
                      <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} invalid={!!errs.email} />
                    </Field>
                  </div>
                  <Field label="Booking reference" hint="Optional. Six characters, from your confirmation.">
                    <Input value={form.ref} onChange={(e) => setForm({ ...form, ref: e.target.value.toUpperCase() })} placeholder="ANV7X2K" className="num uppercase tracking-[0.14em]" />
                  </Field>
                  <Field label="How can we help?" required error={errs.message}>
                    <TextArea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Dates, flight number and what happened, in your own words." invalid={!!errs.message} />
                  </Field>
                  <Field label="Reply by">
                    <div className="flex gap-2">
                      {['email', 'phone', 'whatsapp'].map((m) => (
                        <button key={m} onClick={() => setForm({ ...form, contact: m })} className={cx('flex-1 rounded-[10px] border px-2 py-2 text-[.8125rem] font-semibold capitalize transition', form.contact === m ? 'border-navy-800 bg-navy-800 text-white' : 'border-line text-ink-600 hover:border-navy-300')}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Checkbox label="This is urgent — I am travelling in the next 24 hours" desc="Goes to a supervisor, answered inside 20 minutes." checked={form.urgent} onChange={(v) => setForm({ ...form, urgent: v })} />
                  <Button full size="lg" onClick={submit} icon={<Send size={16} />}>
                    Send message
                  </Button>
                  <button onClick={() => setCallback(true)} className="w-full text-center text-[.8125rem] font-semibold text-sky-700 underline-offset-4 hover:underline">
                    Or ask us to call you back
                  </button>
                </div>
              )}
            </div>
            <p className="mt-3 text-[.75rem] leading-relaxed text-ink-400">
              For a safety concern, use the confidential reporting line at safety@aeronova.aero — it goes to the Group Safety Officer and bypasses the customer queue entirely.
            </p>
          </div>
        </div>
      </section>

      <Modal
        open={callback}
        onClose={() => setCallback(false)}
        title="Request a call back"
        subtitle="We call from +233 302 200 100. Average wait for the callback: 11 minutes."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCallback(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setCallback(false);
                toast({ tone: 'success', title: 'Call back scheduled', body: 'Between 09:00 and 11:00 GMT tomorrow, unless you told us otherwise.' });
              }}
            >
              Book the call
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Number to call" required>
            <Input placeholder="+233 24 000 0000" className="num" />
          </Field>
          <Field label="Window">
            <Select>
              {['As soon as possible', 'Next 2 hours', 'Tomorrow morning', 'Tomorrow afternoon', 'Saturday morning'].map((w) => (
                <option key={w}>{w}</option>
              ))}
            </Select>
          </Field>
          <Checkbox label="Text me first so I know it is not a spam call" defaultChecked />
        </div>
      </Modal>
    </div>
  );
}
