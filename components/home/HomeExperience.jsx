'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, BellRing, BookOpenCheck, Check, ChevronDown,
  CircleHelp, ClipboardList, Globe2, HeartHandshake, MapPin, Search, ShieldCheck,
  Sparkles, UsersRound, Zap,
} from 'lucide-react';
import ItemCard from '../ui/ItemCard';
import ItemArtwork from '../ui/ItemArtwork';
import { SAMPLE_ITEMS } from '../../lib/seed';
import { findMatches } from '../../lib/matching';
import { INDIAN_STATES } from '../../lib/constants';

const stats = [
  { value: 2847, label: 'Lost reports', icon: ClipboardList, accent: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300' },
  { value: 1461, label: 'Found items', icon: Search, accent: 'text-teal-700 bg-teal-50 dark:bg-teal-950/60 dark:text-teal-300' },
  { value: 728, label: 'Happy reunions', icon: HeartHandshake, accent: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300' },
  { value: 16932, label: 'Community members', icon: UsersRound, accent: 'text-violet-600 bg-violet-50 dark:bg-violet-950/60 dark:text-violet-300' },
];

const steps = [
  { number: '01', icon: ClipboardList, title: 'Share the details', description: 'Report what you lost or safely found. Add a photo, a few details and a nearby location.' },
  { number: '02', icon: Sparkles, title: 'We look for signals', description: 'Our explainable matching engine compares descriptions, category, place and date.' },
  { number: '03', icon: BellRing, title: 'See a possible match', description: 'Get an in-app notification when a report looks similar. Every match includes its reasons.' },
  { number: '04', icon: ShieldCheck, title: 'Reconnect safely', description: 'Message through TraceIt, verify identifying details privately, and arrange a safe handover.' },
];

const reasons = [
  { icon: Sparkles, title: 'Intelligent matching', text: 'A transparent weighted score gives useful leads—never a black-box promise.' },
  { icon: Globe2, title: 'One pan-India network', text: 'Search community reports from cities and states across the country.' },
  { icon: ShieldCheck, title: 'Privacy comes first', text: 'Phone numbers and sensitive identity details are never shown on public listings.' },
  { icon: BellRing, title: 'Timely notifications', text: 'Know when a relevant report or claim needs your attention.' },
  { icon: Zap, title: 'Simple reporting', text: 'A guided form helps you share the details that make a report identifiable.' },
  { icon: UsersRound, title: 'Built by community', text: 'Every helpful report can turn a stressful search into a shared effort.' },
];

const testimonials = [
  { quote: 'I had almost given up on my backpack. Seeing the matching reasons gave me the confidence to reach out safely.', name: 'Nisha R.', place: 'Mumbai · demo testimonial', initials: 'NR' },
  { quote: 'The report took a couple of minutes, and the found item was with the station desk the next morning.', name: 'Arjun K.', place: 'Bengaluru · demo testimonial', initials: 'AK' },
  { quote: 'I like that the platform explains why two items look similar instead of calling every result an AI match.', name: 'Meera S.', place: 'Jaipur · demo testimonial', initials: 'MS' },
];

function AnimatedStat({ value }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const start = performance.now();
      const duration = 1100;
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(value * ease));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.disconnect();
    }, { threshold: .35 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [value]);
  return <span ref={ref}>{count.toLocaleString('en-IN')}+</span>;
}

function HeroSearch() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
  const [category, setCategory] = useState('');
  const onSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (state) params.set('state', state);
    if (category) params.set('category', category);
    router.push(`/browse${params.size ? `?${params.toString()}` : ''}`);
  };
  return (
    <form onSubmit={onSubmit} className="relative z-10 mt-8 rounded-3xl border border-white/70 bg-white p-2 shadow-[0_16px_45px_rgba(16,42,86,.14)] dark:border-white/10 dark:bg-slate-900 sm:flex sm:items-center">
      <label className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5">
        <Search size={19} className="shrink-0 text-royal" />
        <span className="sr-only">Search item name or description</span>
        <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-sm text-copy outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" placeholder="Search an item or a detail…" />
      </label>
      <div className="flex gap-2 border-t border-line px-2 pt-2 sm:border-l sm:border-t-0 sm:pt-0">
        <label className="relative min-w-0 flex-1 sm:w-36 sm:flex-none"><span className="sr-only">Category</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-full w-full appearance-none rounded-xl bg-transparent px-3 py-2.5 pr-8 text-xs font-semibold text-muted outline-none"><option value="">All categories</option>{['Mobile Phones', 'Laptops & Electronics', 'Wallets & Purses', 'Identity Cards', 'Documents', 'Jewellery', 'Bags & Luggage', 'Clothing', 'Keys', 'Books', 'Other'].map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted" /></label>
        <label className="relative min-w-0 flex-1 sm:w-32 sm:flex-none"><span className="sr-only">State</span><select value={state} onChange={(event) => setState(event.target.value)} className="h-full w-full appearance-none rounded-xl bg-transparent px-3 py-2.5 pr-8 text-xs font-semibold text-muted outline-none"><option value="">All India</option>{INDIAN_STATES.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-muted" /></label>
        <button type="submit" className="grid h-11 w-12 shrink-0 place-items-center rounded-2xl bg-royal text-white transition hover:bg-blue-700 sm:w-12" aria-label="Search reports"><Search size={18} /></button>
      </div>
    </form>
  );
}

function HeroMatch() {
  const lost = SAMPLE_ITEMS.find((item) => item.id === 'sample-lost-iphone-delhi');
  const match = findMatches(lost, SAMPLE_ITEMS)[0];
  return (
    <div className="relative mx-auto w-full max-w-[520px] animate-float">
      <div className="absolute -left-4 top-6 z-10 hidden w-52 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-soft backdrop-blur-md sm:block dark:border-white/10 dark:bg-slate-900/90">
        <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300"><MapPin size={15} /></span><div><p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-300">Lost report</p><p className="text-xs font-bold text-copy">Black iPhone · Delhi</p></div></div>
      </div>
      <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/70 p-3 shadow-[0_35px_80px_rgba(28,64,132,.18)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/70 sm:p-5">
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-br from-blue-200/70 via-white/10 to-teal-100/40 dark:from-blue-900/30 dark:via-transparent dark:to-teal-900/20" />
        <div className="relative overflow-hidden rounded-[1.8rem] border border-white/80 bg-canvas p-4 dark:border-white/10 sm:p-5">
          <div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-muted">TraceIt match preview</p><p className="mt-1 text-sm font-extrabold text-copy">A lead worth checking</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal dark:bg-teal-950 dark:text-teal-300"><Sparkles size={17} /></span></div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
            <div className="overflow-hidden rounded-2xl border border-line bg-panel"><ItemArtwork item={lost} compact className="h-28 sm:h-36" /><div className="p-2.5"><p className="truncate text-[11px] font-bold text-copy">Lost · iPhone 13</p><p className="mt-1 text-[10px] text-muted">New Delhi</p></div></div>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-white text-teal shadow-md dark:bg-slate-800"><ArrowRight size={15} /></div>
            <div className="overflow-hidden rounded-2xl border border-line bg-panel"><ItemArtwork item={match?.item} compact className="h-28 sm:h-36" /><div className="p-2.5"><p className="truncate text-[11px] font-bold text-copy">Found · Apple phone</p><p className="mt-1 text-[10px] text-muted">New Delhi</p></div></div>
          </div>
          <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50/80 p-3 dark:border-teal-900/40 dark:bg-teal-950/30">
            <div className="flex items-center justify-between"><span className="text-xs font-bold text-teal-900 dark:text-teal-200">Strong match</span><span className="text-sm font-extrabold text-teal-700 dark:text-teal-300">{match?.score || 93}%</span></div>
            <div className="mt-2 h-1.5 rounded-full bg-teal-100 dark:bg-teal-900/50"><div className="h-full rounded-full bg-teal" style={{ width: `${match?.score || 93}%` }} /></div>
            <p className="mt-2 text-[10px] leading-4 text-teal-900/75 dark:text-teal-200/70">Shared city, category, brand and identifying details</p>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 -right-3 z-10 flex items-center gap-2 rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-soft dark:border-white/10 dark:bg-slate-900"><span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-royal dark:bg-blue-950 dark:text-blue-300"><ShieldCheck size={16} /></span><div><p className="text-[10px] font-bold text-copy">Private by design</p><p className="text-[9px] text-muted">No phone numbers exposed</p></div></div>
    </div>
  );
}

export default function HomeExperience() {
  const recent = [
    'sample-lost-iphone-delhi', 'sample-found-wallet-mumbai', 'sample-lost-laptop-bengaluru', 'sample-found-backpack-mumbai',
  ].map((id) => SAMPLE_ITEMS.find((item) => item.id === id));
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#f0f5ff] dark:bg-[#101d35]">
        <div className="absolute inset-0 -z-10 overflow-hidden"><div className="absolute -right-40 -top-52 h-[560px] w-[560px] rounded-full bg-blue-200/40 blur-[100px] dark:bg-blue-700/10" /><div className="absolute -bottom-64 left-1/4 h-[500px] w-[500px] rounded-full bg-teal-100/70 blur-[100px] dark:bg-teal-600/10" /><div className="hero-grid absolute inset-0 opacity-40 dark:opacity-10" /></div>
        <div className="page-container grid min-h-[690px] items-center gap-14 py-16 lg:grid-cols-[1.08fr_.92fr] lg:py-20">
          <div className="relative z-10 max-w-2xl animate-fade-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/75 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[.13em] text-navy shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:text-blue-200"><span className="relative grid h-2 w-2 place-items-center"><span className="absolute h-2 w-2 animate-ping rounded-full bg-teal opacity-60" /><span className="relative h-1.5 w-1.5 rounded-full bg-teal" /></span>India’s community-powered recovery network</div>
            <h1 className="text-[2.7rem] font-extrabold leading-[1.06] tracking-[-.045em] text-ink dark:text-white sm:text-6xl lg:text-[4.25rem]">Every lost item deserves a <span className="relative whitespace-nowrap text-royal dark:text-blue-300">way back home.<span className="absolute -bottom-1 left-0 -z-10 h-3 w-full rounded-full bg-teal/20" /></span></h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">India’s intelligent lost and found network. Report missing belongings, discover found items and reconnect people with what matters.</p>
            <div className="mt-7 flex flex-wrap gap-3"><Link href="/report/lost" className="btn-primary !px-5 !py-3.5">Report lost item <ArrowRight size={16} /></Link><Link href="/report/found" className="btn-secondary !border-white !bg-white/70 !px-5 !py-3.5 dark:!border-white/10 dark:!bg-slate-900/70">I found something <ArrowUpRight size={16} /></Link></div>
            <HeroSearch />
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium text-slate-500 dark:text-slate-400"><span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-teal" />Private by design</span><span className="inline-flex items-center gap-1.5"><Globe2 size={14} className="text-royal" />Across India</span><span className="inline-flex items-center gap-1.5"><Sparkles size={14} className="text-amber-500" />Explainable matches</span></div>
          </div>
          <div className="relative z-0 hidden lg:block"><HeroMatch /></div>
          <div className="relative z-0 mx-auto mt-4 block w-full max-w-lg lg:hidden"><HeroMatch /></div>
        </div>
      </section>

      <section className="page-container -mt-4 relative z-10">
        <div className="surface rounded-3xl border border-line px-5 py-5 shadow-card sm:px-8 sm:py-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">Community impact</p><h2 className="mt-1 text-lg font-extrabold text-copy">Small details. Big reunions.</h2></div><span className="rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">SAMPLE PLATFORM STATISTICS</span></div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{stats.map(({ value, label, icon: Icon, accent }) => <div key={label} className="flex items-center gap-3 rounded-2xl bg-canvas p-4 sm:p-5"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${accent}`}><Icon size={18} /></span><div><p className="text-xl font-extrabold tracking-tight text-ink dark:text-white sm:text-2xl"><AnimatedStat value={value} /></p><p className="mt-0.5 text-[11px] font-medium text-muted sm:text-xs">{label}</p></div></div>)}</div>
        </div>
      </section>

      <section className="page-container section-space">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Fresh from the community</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink dark:text-white">Recently reported</h2><p className="mt-2 text-sm text-muted">A few sample reports that show how TraceIt brings details together.</p></div><Link href="/browse" className="inline-flex items-center gap-2 text-sm font-bold text-royal hover:gap-3 dark:text-blue-300">Browse all reports <ArrowRight size={16} /></Link></div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{recent.map((item) => <ItemCard key={item.id} item={item} />)}</div>
      </section>

      <section className="bg-white/75 py-16 dark:bg-slate-900/40 sm:py-20">
        <div className="page-container"><div className="mx-auto mb-11 max-w-2xl text-center"><p className="eyebrow">How TraceIt works</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink dark:text-white sm:text-4xl">From missing to found, <span className="text-royal dark:text-blue-300">one clear step at a time.</span></h2><p className="mt-4 text-sm leading-7 text-muted sm:text-base">We make the search easier to start and safer to finish.</p></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{steps.map(({ number, icon: Icon, title, description }) => <article key={number} className="surface group relative rounded-3xl border border-line p-6 transition hover:-translate-y-1 hover:shadow-card"><div className="mb-6 flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-royal transition group-hover:bg-royal group-hover:text-white dark:bg-blue-950/60 dark:text-blue-300"><Icon size={21} /></span><span className="text-3xl font-black tracking-tighter text-slate-100 dark:text-white/10">{number}</span></div><h3 className="text-lg font-bold text-copy">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{description}</p></article>)}</div>
        </div>
      </section>

      <section className="page-container section-space">
        <div className="grid items-center gap-12 lg:grid-cols-[.85fr_1.15fr]">
          <div><p className="eyebrow">Why choose TraceIt?</p><h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-ink dark:text-white sm:text-4xl">A thoughtful service for things that <span className="text-royal dark:text-blue-300">matter to you.</span></h2><p className="mt-5 max-w-lg text-sm leading-7 text-muted">A lost item can mean more than its price. TraceIt brings useful technology and careful community practices together to help it find its way home.</p><Link href="/about" className="btn-secondary mt-6">More about our mission <ArrowRight size={16} /></Link></div>
          <div className="grid gap-3 sm:grid-cols-2">{reasons.map(({ icon: Icon, title, text }) => <article key={title} className="surface rounded-2xl border border-line p-5 transition hover:border-blue-200 hover:shadow-card dark:hover:border-blue-900"><span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal dark:bg-teal-950/50 dark:text-teal-300"><Icon size={18} /></span><h3 className="mt-4 font-bold text-copy">{title}</h3><p className="mt-1.5 text-xs leading-5 text-muted">{text}</p></article>)}</div>
        </div>
      </section>

      <section className="bg-[#eef4ff] py-16 dark:bg-[#101b30] sm:py-20">
        <div className="page-container"><div className="mb-9 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Community voices</p><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink dark:text-white">A little help goes a long way.</h2></div><span className="rounded-full border border-blue-100 bg-white/70 px-3 py-1.5 text-[10px] font-bold text-slate-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">DEMO TESTIMONIALS</span></div>
          <div className="grid gap-4 md:grid-cols-3">{testimonials.map((entry) => <article key={entry.name} className="surface flex min-h-56 flex-col rounded-3xl border border-line p-6"><div className="flex gap-1 text-amber-400" aria-label="Five star sample testimonial">{Array.from({ length: 5 }, (_, index) => <span key={index}>★</span>)}</div><blockquote className="mt-4 flex-1 text-sm leading-7 text-copy">“{entry.quote}”</blockquote><div className="mt-5 flex items-center gap-3 border-t border-line pt-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-teal-100 text-xs font-extrabold text-navy dark:from-blue-900 dark:to-teal-900 dark:text-white">{entry.initials}</span><div><p className="text-sm font-bold text-copy">{entry.name}</p><p className="text-[10px] text-muted">{entry.place}</p></div><BadgeCheck size={16} className="ml-auto text-teal" /></div></article>)}</div>
        </div>
      </section>

      <section className="page-container py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#17376c] via-[#2452b5] to-[#167f88] px-6 py-12 text-white shadow-soft sm:px-12 sm:py-14">
          <div className="absolute -right-14 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/5" /><div className="absolute -bottom-28 right-1/3 h-56 w-56 rounded-full border border-white/10" />
          <div className="relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-center"><div className="max-w-2xl"><span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-50"><CircleHelp size={13} /> Every report makes a difference</span><h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to help something find its way home?</h2><p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/90">Start a report, browse what the community has found, or sign up to get notified about possible matches.</p></div><div className="flex shrink-0 flex-wrap gap-3"><Link href="/report/lost" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-navy transition hover:bg-blue-50">Report an item <ArrowRight size={15} /></Link><Link href="/browse" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10">Explore reports</Link></div></div>
        </div>
        <div className="mx-auto mt-8 flex max-w-2xl items-start gap-3 rounded-2xl border border-line bg-panel px-4 py-3"><BookOpenCheck size={17} className="mt-0.5 shrink-0 text-teal" /><p className="text-[11px] leading-5 text-muted"><strong className="text-copy">A note about matching:</strong> TraceIt’s matching scores are algorithmic similarity estimates based on report details, location and dates. They are not verified AI predictions; always confirm ownership safely.</p></div>
      </section>
    </>
  );
}
