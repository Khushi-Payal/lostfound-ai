import { getArtwork } from '../../lib/item-art';

export default function ItemArtwork({ item, className = '', compact = false }) {
  const artwork = getArtwork(item?.category);
  const Icon = artwork.Icon;
  return (
    <div className={`relative isolate overflow-hidden bg-gradient-to-br ${artwork.tone} ${className}`}>
      {item?.image ? (
        <img src={item.image} alt={item.name || 'Reported item'} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <div className="absolute -right-5 -top-8 h-36 w-36 rounded-full border border-white/40 bg-white/20 blur-[1px]" />
          <div className="absolute -bottom-12 -left-7 h-40 w-40 rounded-full border border-white/50 bg-white/30" />
          <div className="relative flex h-full w-full flex-col items-center justify-center text-royal/70 dark:text-blue-200/70">
            <div className="rounded-[1.6rem] border border-white/70 bg-white/60 p-4 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
              <Icon size={compact ? 36 : 50} strokeWidth={1.35} />
            </div>
            {!compact && <span className="mt-3 text-[10px] font-semibold uppercase tracking-[.18em] text-ink/45 dark:text-white/40">{artwork.label}</span>}
          </div>
        </>
      )}
      {item?.image && <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />}
    </div>
  );
}
