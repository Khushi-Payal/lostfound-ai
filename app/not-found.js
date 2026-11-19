import Link from 'next/link';
import { Compass, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="page-container flex min-h-[65vh] flex-col items-center justify-center py-20 text-center">
      <div className="relative grid h-28 w-28 place-items-center rounded-[2rem] bg-blue-50 text-royal dark:bg-blue-950/50 dark:text-blue-300"><Compass size={48} strokeWidth={1.3} /><span className="absolute -right-1 -top-1 grid h-9 w-9 place-items-center rounded-full bg-teal text-white shadow-lg"><Search size={16} /></span></div>
      <p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-teal">Lost your way?</p>
      <h1 className="mt-2 text-4xl font-extrabold text-ink dark:text-white">This page is missing.</h1>
      <p className="mt-4 max-w-md text-muted">The link may be out of date, or this page has moved. Let us help you find your way back.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/" className="btn-primary"><Home size={16} /> Back home</Link><Link href="/browse" className="btn-secondary"><Search size={16} /> Browse reports</Link></div>
    </section>
  );
}
