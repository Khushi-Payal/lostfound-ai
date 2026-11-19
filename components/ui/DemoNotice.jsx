'use client';

import { useEffect, useState } from 'react';
import { FlaskConical, ShieldCheck } from 'lucide-react';

export default function DemoNotice() {
  const [mode, setMode] = useState(null);
  useEffect(() => {
    fetch('/api/health', { cache: 'no-store' }).then((response) => response.json()).then((data) => setMode(data.mode)).catch(() => setMode('demo'));
  }, []);
  if (!mode) return null;
  const demo = mode === 'demo';
  return (
    <div className={`hidden items-center justify-center gap-2 px-3 py-1.5 text-[11px] font-medium sm:flex ${demo ? 'bg-blue-50 text-blue-900 dark:bg-blue-950/70 dark:text-blue-200' : 'bg-teal-50 text-teal-900 dark:bg-teal-950/70 dark:text-teal-200'}`}>
      {demo ? <FlaskConical size={13} /> : <ShieldCheck size={13} />}
      {demo ? 'DEMO MODE · Sample records are labelled; data persists locally on this server.' : 'SECURE DATABASE MODE · Connected to your MongoDB deployment.'}
    </div>
  );
}
