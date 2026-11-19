import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function EmptyState({ title = 'Nothing to see just yet', description = 'When you have reports here, they will show up in this space.', action, href = '/browse', icon: Icon = SearchX }) {
  return (
    <div className="surface flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-14 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-royal dark:bg-blue-950/60 dark:text-blue-300"><Icon size={24} /></div>
      <h3 className="text-lg font-bold text-copy">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {action && <Link href={href} className="btn-primary mt-6">{action}</Link>}
    </div>
  );
}
