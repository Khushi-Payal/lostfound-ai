export function CardSkeleton() {
  return <div className="surface overflow-hidden rounded-3xl border border-line"><div className="skeleton h-48 w-full" /><div className="space-y-3 p-5"><div className="skeleton h-3 w-28" /><div className="skeleton h-5 w-2/3" /><div className="skeleton h-4 w-full" /><div className="skeleton h-4 w-3/4" /></div></div>;
}

export function PageLoading({ label = 'Loading your TraceIt workspace…' }) {
  return <div className="flex min-h-[45vh] flex-col items-center justify-center text-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-royal dark:border-slate-700 dark:border-t-blue-300" /><p className="mt-4 text-sm font-medium text-muted">{label}</p></div>;
}
