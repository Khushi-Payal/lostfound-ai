import Link from 'next/link';
import { ArrowUpRight, MapPin, CalendarDays } from 'lucide-react';
import ItemArtwork from './ItemArtwork';
import { formatDate, itemLocation } from '../../utils/format';

export default function ItemCard({ item, compact = false }) {
  if (!item) return null;
  return (
    <Link href={`/items/${item.id}`} className="surface group flex h-full flex-col overflow-hidden rounded-3xl border border-line transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-soft dark:hover:border-blue-900">
      <div className="relative h-48 overflow-hidden">
        <ItemArtwork item={item} className="h-full w-full transition duration-500 group-hover:scale-[1.03]" />
        <span className={`absolute left-4 top-4 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${item.type === 'lost' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300' : 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300'}`}>
          {item.type === 'lost' ? 'Lost' : 'Found'}
        </span>
        {item.isDemo && <span className="absolute right-3 top-3 rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-[10px] font-semibold text-slate-600 backdrop-blur dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-300">Sample</span>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.12em] text-royal dark:text-blue-300">
          <span>{item.category}</span>
          {item.status && item.status !== 'active' && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-500 dark:bg-white/10 dark:text-slate-300">{item.status.replace('-', ' ')}</span>}
        </div>
        <h3 className="line-clamp-1 text-lg font-bold text-copy transition group-hover:text-royal dark:group-hover:text-blue-300">{item.name}</h3>
        {!compact && <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-muted">{item.description}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-teal" />{itemLocation(item)}</span>
          <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} />{formatDate(item.date)}</span>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-line pt-4 mt-4">
          <span className="text-xs font-medium text-muted">Report {item.reportId}</span>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-royal dark:text-blue-300">View details <ArrowUpRight size={15} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
        </div>
      </div>
    </Link>
  );
}
