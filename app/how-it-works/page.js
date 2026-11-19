import Link from 'next/link';
import { ArrowRight, BadgeCheck, CalendarClock, CheckCircle2, MapPin, SearchCheck, ShieldCheck, Sparkles } from 'lucide-react';
import PageHeading from '../../components/ui/PageHeading';

const steps = [
  { n: '01', icon: SearchCheck, title: 'Report a lost or found item', text: 'Add its name, category, date, approximate location and helpful physical details. A photo is optional. Your phone and email stay private.' },
  { n: '02', icon: Sparkles, title: 'The matching engine compares reports', text: 'TraceIt normalises descriptions and compares shared keywords, categories, colour and brand, city and state, and date proximity.' },
  { n: '03', icon: CalendarClock, title: 'Review possible leads', text: 'When a report scores at least 40%, it can appear as a recommendation. Every result shows an estimate and the reasons behind it.' },
  { n: '04', icon: ShieldCheck, title: 'Connect and verify safely', text: 'Send an in-app message, share a claim, and verify unique details privately. Agree on a public handover point.' },
];
const weights = [
  { label: 'Description & identifying keywords', value: 30, color: 'bg-blue-600' },
  { label: 'Category', value: 20, color: 'bg-indigo-500' },
  { label: 'Brand and colour', value: 15, color: 'bg-violet-500' },
  { label: 'State and city', value: 20, color: 'bg-teal' },
  { label: 'Date proximity', value: 15, color: 'bg-amber-500' },
];

export const metadata = { title: 'How TraceIt Works' };

export default function HowItWorksPage() {
  return <div className="page-container py-12 sm:py-16">
    <PageHeading eyebrow="Simple, transparent, safer" title="How TraceIt works" description="A practical four-step flow—from the first report to a careful handover—with a matching engine you can understand." />
    <div className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-4">{steps.map(({ n, icon: Icon, title, text }) => <article key={n} className="surface relative rounded-3xl border border-line p-6"><div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-royal dark:bg-blue-950 dark:text-blue-300"><Icon size={21} /></span><span className="text-3xl font-black text-slate-100 dark:text-white/10">{n}</span></div><h2 className="mt-5 text-lg font-extrabold text-copy">{title}</h2><p className="mt-2 text-sm leading-6 text-muted">{text}</p></article>)}</div>
    <section className="mt-12 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
      <div className="surface rounded-3xl border border-line p-6 sm:p-8"><p className="eyebrow">Inside the matching engine</p><h2 className="mt-2 text-2xl font-extrabold text-ink dark:text-white">Useful clues, weighted transparently.</h2><p className="mt-3 text-sm leading-6 text-muted">The reusable JavaScript module produces a 0–100 similarity estimate. Reports below 40% are not shown as recommendations.</p><div className="mt-6 space-y-4">{weights.map((row) => <div key={row.label}><div className="mb-1.5 flex justify-between gap-3 text-xs"><span className="font-semibold text-copy">{row.label}</span><span className="font-bold text-muted">{row.value}%</span></div><div className="h-2 rounded-full bg-canvas"><div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.value * 3.1}%` }} /></div></div>)}</div><div className="mt-6 rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/40"><p className="flex items-start gap-2 text-xs leading-5 text-blue-900 dark:text-blue-200"><BadgeCheck size={15} className="mt-0.5 shrink-0" /><span><strong>Not a verified AI prediction.</strong> TraceIt currently uses explainable text, category, location and date similarity. An image upload is stored with a report; visual recognition is an extension point, not an active scoring feature.</span></p></div></div>
      <div className="rounded-3xl bg-gradient-to-br from-[#102a56] via-[#1f4ca0] to-[#127c7d] p-6 text-white sm:p-8"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15"><MapPin size={20} /></span><div><p className="text-xs font-bold uppercase tracking-[.14em] text-teal-200">Safety before speed</p><h2 className="text-xl font-extrabold">Keep the final step human.</h2></div></div><div className="mt-6 space-y-4">{[
        ['Keep one detail private', 'Ask the claimant to describe an identifying mark that is not visible in the public listing.'],
        ['Do not share documents', 'TraceIt never asks you to publish a full ID number, bank details or a password.'],
        ['Meet safely', 'Choose a public, well-lit place or use an official lost-property desk.'],
        ['Trust your instincts', 'Never pay a fee to claim your own belongings. Contact local authorities if you feel unsafe.'],
      ].map(([title, text]) => <div key={title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-teal-200" /><div><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-xs leading-5 text-blue-50/75">{text}</p></div></div>)}</div></div>
    </section>
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line bg-panel p-6 sm:p-8"><div><p className="text-xl font-extrabold text-ink dark:text-white">Ready to start?</p><p className="mt-1 text-sm text-muted">Create a clear report and let the community help.</p></div><div className="flex gap-3"><Link href="/report/lost" className="btn-primary">Report lost <ArrowRight size={15} /></Link><Link href="/report/found" className="btn-secondary">Report found</Link></div></div>
  </div>;
}
