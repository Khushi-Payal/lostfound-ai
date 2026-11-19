'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function ErrorPage({ error, reset }) {
  useEffect(() => { console.error('[TraceIt page error]', error); }, [error]);
  return <div className="page-container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300"><AlertTriangle size={25} /></span><p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-teal">A momentary issue</p><h1 className="mt-2 text-3xl font-extrabold text-ink dark:text-white">This page hit a snag.</h1><p className="mt-3 max-w-md text-sm leading-6 text-muted">Your information is safe. Try the page again or return to TraceIt.</p><div className="mt-6 flex gap-3"><button onClick={() => reset()} className="btn-primary"><RefreshCw size={15} /> Try again</button><Link href="/" className="btn-secondary"><Home size={15} /> Go home</Link></div></div>;
}
