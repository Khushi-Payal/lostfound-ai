import Link from 'next/link';
import { ArrowUpRight, MapPin, CalendarDays, Sparkles } from 'lucide-react';
import ItemArtwork from './ItemArtwork';
import { formatDate, itemLocation } from '../../utils/format';

export default function MatchCard({ match }) {
  const item = match?.item;
  if (!item) return null;
  const score = Math.min(100, Math.max(0, match.score || 0));
  const scoreTone = score >= 85 ? 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60' : score >= 65 ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60' : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60';
  return (
    <div className="surface overflow-hidden rounded-3xl border border-line">
      <div className="flex gap-4 p-4 sm:p-5">
        <ItemArtwork item={item} compact className="h-24 w-24 shrink-0 rounded-2xl sm:h-28 sm:w-32" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${item.type === 'lost' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'}`}>{item.type} report</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${scoreTone}`}><Sparkles size={12} />{score}% match</span>
          </div>
          <Link href={`/items/${item.id}`} className="mt-2 block truncate text-base font-bold text-copy hover:text-royal dark:hover:text-blue-300">{item.name}<ArrowUpRight size={14} className="ml-1 inline" /></Link>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1"><MapPin size={13} />{itemLocation(item)}</span>
            <span className="inline-flex items-center gap-1"><CalendarDays size={13} />{formatDate(item.date)}</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-royal to-teal" style={{ width: `${score}%` }} /></div>
        </div>
      </div>
      <div className="border-t border-line px-4 py-3 sm:px-5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-muted">Why this looks similar</p>
        <div className="flex flex-wrap gap-1.5">{(match.reasons || []).slice(0, 3).map((reason) => <span key={reason} className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] text-slate-600 dark:bg-white/5 dark:text-slate-300">{reason}</span>)}</div>
        <p className="mt-3 text-[10px] leading-4 text-muted">Algorithmic similarity estimate · Not a verified AI prediction</p>
      </div>
    </div>
  );
}
