import Link from 'next/link';
import { useId } from 'react';

export function LogoMark({ className = 'h-10 w-10' }) {
  const gradientId = `traceit-pin-${useId().replace(/:/g, '')}`;
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="8" y1="5" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4779FF" />
          <stop offset="1" stopColor="#1D3FB8" />
        </linearGradient>
      </defs>
      <path d="M24 43s15-14.38 15-25A15 15 0 1 0 9 18c0 10.62 15 25 15 25Z" fill={`url(#${gradientId})`} />
      <circle cx="22" cy="18" r="7.1" stroke="white" strokeWidth="3.2" />
      <path d="m27.2 23.2 5.3 5.3" stroke="white" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="22" cy="18" r="2.1" fill="#81E3D1" />
    </svg>
  );
}

export default function Logo({ compact = false, light = false }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5" aria-label="TraceIt home">
      <LogoMark className="h-10 w-10 shrink-0" />
      {!compact && <span className={`text-[1.35rem] font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink dark:text-white'}`}>
        Trace<span className="text-royal dark:text-blue-300">It</span>
      </span>}
    </Link>
  );
}
