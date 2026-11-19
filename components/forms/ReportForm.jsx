'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight, CalendarDays, CheckCircle2, Clock3, FileText, MapPin, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../../lib/constants';
import { useAuth, useToast } from '../../context/AppContext';
import { apiFetch } from '../../utils/api';
import PageHeading from '../ui/PageHeading';
import { PageLoading } from '../ui/Loading';
import { StateCityFields } from './StateCityFields';
import ImageUpload from './ImageUpload';
import MatchCard from '../ui/MatchCard';
import ItemArtwork from '../ui/ItemArtwork';

function InputField({ label, name, value, onChange, placeholder, type = 'text', required = false, hint, ...props }) {
  return <div><label className="field-label" htmlFor={name}>{label}{required && <span className="ml-1 text-rose-500">*</span>}</label><input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} className="input" {...props} />{hint && <p className="field-hint">{hint}</p>}</div>;
}

export default function ReportForm({ type = 'lost' }) {
  const isFound = type === 'found';
  const title = isFound ? 'Report a found item' : 'Report a lost item';
  const { user, loading, demoMode } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [form, setForm] = useState({ name: '', category: '', description: '', brand: '', color: '', marks: '', date: today, time: '', state: '', city: '', location: '', image: '', additionalInfo: '', secured: false });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  if (loading) return <PageLoading label="Checking your secure session…" />;
  if (!user) return <section className="page-container py-14 sm:py-20"><div className="mx-auto max-w-2xl surface rounded-[2rem] border border-line p-7 text-center shadow-card sm:p-12"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-royal dark:bg-blue-950 dark:text-blue-300"><ShieldAlert size={25} /></span><h1 className="mt-5 text-3xl font-extrabold text-ink dark:text-white">Sign in to {isFound ? 'share what you found' : 'report what you lost'}</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">A TraceIt account lets you manage your report, get matching notifications and message safely without exposing personal details.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href={`/login?next=${encodeURIComponent(isFound ? '/report/found' : '/report/lost')}`} className="btn-primary">Sign in to continue <ArrowRight size={16} /></Link><Link href="/signup" className="btn-secondary">Create account</Link></div><p className="mt-5 text-xs text-muted">Demo account: demo@traceit.in · password Demo123!</p></div></section>;

  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const payload = { ...form, secured: isFound ? form.secured : false };
      const data = await apiFetch(`/api/items/${isFound ? 'found' : 'lost'}`, { method: 'POST', body: JSON.stringify(payload) });
      setSubmitted(data);
      toast(data.matches?.length ? `${data.matches.length} potential match${data.matches.length === 1 ? '' : 'es'} found.` : 'Your report is live and being matched.', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  if (submitted) return <section className="page-container py-12 sm:py-16">
    <div className="mx-auto max-w-4xl">
      <div className="surface overflow-hidden rounded-[2rem] border border-teal-200 shadow-soft dark:border-teal-900/60">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-500 px-6 py-8 text-white sm:px-10"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><CheckCircle2 size={26} /></span><h1 className="mt-4 text-3xl font-extrabold">{isFound ? 'Thank you for helping.' : 'Your report is live.'}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-white/85">{submitted.matches?.length ? `We found ${submitted.matches.length} possible report${submitted.matches.length === 1 ? '' : 's'} to compare. Review the details and confirm ownership safely.` : 'TraceIt will keep looking for relevant reports and notify you when a possible match appears.'}</p></div>
        <div className="grid gap-7 p-6 sm:p-9 lg:grid-cols-[.8fr_1.2fr]">
          <div><p className="eyebrow">Your report ID</p><p className="mt-1 font-mono text-2xl font-extrabold text-ink dark:text-white">{submitted.item.reportId}</p><div className="mt-5 overflow-hidden rounded-2xl border border-line"><ItemArtwork item={submitted.item} className="h-48" /><div className="p-4"><p className="text-xs font-semibold uppercase tracking-wide text-royal dark:text-blue-300">{submitted.item.category}</p><h2 className="mt-1 font-bold text-copy">{submitted.item.name}</h2><p className="mt-2 text-xs text-muted">{submitted.item.city}, {submitted.item.state}</p></div></div><div className="mt-4 flex flex-col gap-2"><Link href="/dashboard" className="btn-primary justify-center">Open my dashboard <ArrowRight size={15} /></Link><Link href="/browse" className="btn-secondary justify-center">Browse all reports</Link></div></div>
          <div><div className="mb-4 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-950/30"><Sparkles size={18} className="mt-0.5 shrink-0 text-royal dark:text-blue-300" /><p className="text-xs leading-5 text-blue-900 dark:text-blue-200"><strong>Algorithmic similarity estimates.</strong> Scores compare details, category, colour/brand, location and date. They are not verified AI predictions; use them as leads and confirm privately.</p></div>
            {submitted.matches?.length ? <div className="space-y-3">{submitted.matches.slice(0, 4).map((match) => <MatchCard key={match.item.id} match={match} />)}</div> : <div className="surface rounded-2xl border border-dashed border-line p-7 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal dark:bg-teal-950 dark:text-teal-300"><ShieldCheck size={20} /></span><h3 className="mt-3 font-bold text-copy">No likely matches yet</h3><p className="mt-1 text-xs leading-5 text-muted">Your report stays active. We will notify you if a related report is added.</p></div>}
          </div>
        </div>
      </div>
    </div>
  </section>;

  return <div className="page-container py-12 sm:py-16">
    <PageHeading eyebrow={isFound ? 'Give it a way home' : 'Start the search'} title={title} description={isFound ? 'Share enough detail to help the owner recognise their belonging—without publishing private identifiers.' : 'A few helpful details can make all the difference. Your contact information stays private.'} />
    <form onSubmit={submit} className="grid items-start gap-7 lg:grid-cols-[1fr_320px]">
      <div className="surface rounded-[2rem] border border-line p-5 shadow-card sm:p-8">
        <div className="mb-7 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-950/30"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-royal dark:bg-slate-900 dark:text-blue-300"><FileText size={17} /></span><div><p className="text-sm font-bold text-blue-950 dark:text-blue-100">The more specific, the better</p><p className="mt-1 text-xs leading-5 text-blue-900/75 dark:text-blue-200/70">Mention distinctive details, not sensitive document numbers, passwords or financial information.</p></div></div>
        <section><h2 className="form-section-title">Item details</h2><div className="grid gap-4 sm:grid-cols-2">
          <InputField label="Item name" name="item-name" required placeholder="e.g. Black smartphone" value={form.name} onChange={(event) => update('name', event.target.value)} />
          <div><label className="field-label" htmlFor="item-category">Category<span className="ml-1 text-rose-500">*</span></label><select id="item-category" required value={form.category} onChange={(event) => update('category', event.target.value)} className="select"><option value="">Choose a category</option>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></div>
          <div className="sm:col-span-2"><label className="field-label" htmlFor="item-description">Detailed description<span className="ml-1 text-rose-500">*</span></label><textarea id="item-description" required minLength={12} maxLength={3000} value={form.description} onChange={(event) => update('description', event.target.value)} className="textarea" placeholder="Describe the item, its condition and any details that someone who owns it would know…" /><p className="field-hint">{form.description.length}/3000 characters</p></div>
          <InputField label="Brand" name="item-brand" value={form.brand} onChange={(event) => update('brand', event.target.value)} placeholder="e.g. Apple, Wildcraft" />
          <InputField label="Colour" name="item-colour" value={form.color} onChange={(event) => update('color', event.target.value)} placeholder="e.g. navy blue" />
          <div className="sm:col-span-2"><label className="field-label" htmlFor="item-marks">Distinctive identification marks</label><textarea id="item-marks" value={form.marks} onChange={(event) => update('marks', event.target.value)} className="textarea !min-h-[90px]" placeholder="Stickers, scratches, initials or other details an owner can verify privately…" /></div>
        </div></section>
        <section className="mt-9 border-t border-line pt-7"><h2 className="form-section-title">When and where</h2><div className="grid gap-4 sm:grid-cols-2">
          <InputField label={isFound ? 'Found date' : 'Lost date'} name="item-date" type="date" required value={form.date} onChange={(event) => update('date', event.target.value)} />
          <InputField label={isFound ? 'Approximate found time' : 'Approximate lost time'} name="item-time" type="time" value={form.time} onChange={(event) => update('time', event.target.value)} hint="An estimate is completely fine." />
          <div className="sm:col-span-2"><StateCityFields state={form.state} city={form.city} onStateChange={(value) => update('state', value)} onCityChange={(value) => update('city', value)} idPrefix="report" /></div>
          <div className="sm:col-span-2"><label className="field-label" htmlFor="item-location">{isFound ? 'Found location' : 'Exact or approximate location'}<span className="ml-1 text-rose-500">*</span></label><div className="relative"><MapPin size={16} className="pointer-events-none absolute left-3.5 top-3.5 text-muted" /><input id="item-location" required minLength={3} maxLength={250} value={form.location} onChange={(event) => update('location', event.target.value)} className="input !pl-10" placeholder="Nearby landmark, station, market, or area" /></div><p className="field-hint">Share a nearby landmark rather than a private home address.</p></div>
        </div></section>
        <section className="mt-9 border-t border-line pt-7"><h2 className="form-section-title">Photo and extra information</h2><div className="grid gap-5 sm:grid-cols-2 sm:items-start"><ImageUpload value={form.image} onChange={(value) => update('image', value)} /><div><label className="field-label" htmlFor="additional-info">Additional information</label><textarea id="additional-info" value={form.additionalInfo} onChange={(event) => update('additionalInfo', event.target.value)} maxLength={2000} className="textarea !min-h-[154px]" placeholder="Where should a helpful person leave the item? Any safe next step?" /><p className="field-hint">Do not include your phone number or sensitive ID details.</p></div></div>
          {isFound && <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-teal-200 bg-teal-50/70 p-4 dark:border-teal-900/50 dark:bg-teal-950/30"><input type="checkbox" checked={form.secured} onChange={(event) => update('secured', event.target.checked)} className="mt-0.5 h-4 w-4 accent-teal" /><span><span className="block text-sm font-bold text-teal-950 dark:text-teal-200">I have safely secured this item.</span><span className="mt-1 block text-xs leading-5 text-teal-900/75 dark:text-teal-200/70">Please only tick this if the item is currently with you or a trusted lost-property desk.</span></span></label>}
        </section>
        {error && <p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
        <div className="mt-7 flex flex-col-reverse justify-between gap-3 border-t border-line pt-6 sm:flex-row sm:items-center"><Link href="/browse" className="btn-ghost justify-center">Cancel</Link><button disabled={busy} type="submit" className="btn-primary justify-center !px-6">{busy ? 'Submitting your report…' : `Submit ${isFound ? 'found' : 'lost'} report`} {busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <ArrowRight size={16} />}</button></div>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-28"><div className="surface rounded-3xl border border-line p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal dark:bg-teal-950 dark:text-teal-300"><ShieldCheck size={18} /></span><h3 className="mt-3 font-bold text-copy">You stay in control</h3><p className="mt-1 text-xs leading-5 text-muted">Your report is public, but your phone and email stay private. Messages are delivered through the platform.</p><ul className="mt-4 space-y-2 text-xs text-muted"><li className="flex gap-2"><CheckCircle2 size={14} className="shrink-0 text-teal" /> You can edit or remove your report</li><li className="flex gap-2"><CheckCircle2 size={14} className="shrink-0 text-teal" /> Possible matches include reasons</li><li className="flex gap-2"><CheckCircle2 size={14} className="shrink-0 text-teal" /> Ownership details remain private</li></ul></div>
        <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5 dark:border-amber-900/40 dark:bg-amber-950/20"><div className="flex gap-2"><AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-300" /><div><h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">Safety first</h3><p className="mt-1 text-xs leading-5 text-amber-900/75 dark:text-amber-200/70">Meet in a public place, verify private identifying details, and never send money or share passwords to claim an item.</p></div></div></div>
        <p className="flex items-center gap-2 px-1 text-[10px] text-muted"><Clock3 size={13} /> {demoMode ? 'Demo mode: reports persist locally on this server.' : 'Connected to the configured TraceIt database.'}</p>
      </aside>
    </form>
  </div>;
}
