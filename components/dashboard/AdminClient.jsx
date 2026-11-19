'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BadgeAlert, Check, ClipboardList, FileText, Flag, RefreshCw, Search, ShieldCheck, Trash2, UsersRound } from 'lucide-react';
import { useAuth, useToast } from '../../context/AppContext';
import { apiFetch } from '../../utils/api';
import { formatDate, itemLocation, initials } from '../../utils/format';
import { PageLoading } from '../ui/Loading';
import DashboardCharts from './DashboardCharts';
import ItemArtwork from '../ui/ItemArtwork';
import EmptyState from '../ui/EmptyState';

const tabs = [
  { id: 'overview', label: 'Overview', icon: ShieldCheck },
  { id: 'reports', label: 'All reports', icon: ClipboardList },
  { id: 'moderation', label: 'Needs review', icon: Flag },
  { id: 'claims', label: 'Ownership claims', icon: BadgeAlert },
  { id: 'users', label: 'Registered users', icon: UsersRound },
];

function Stat({ label, value, icon: Icon, tint }) {
  return <div className="surface rounded-2xl border border-line p-4"><span className={`grid h-9 w-9 place-items-center rounded-xl ${tint}`}><Icon size={17} /></span><p className="mt-3 text-2xl font-extrabold text-ink dark:text-white">{value}</p><p className="text-xs text-muted">{label}</p></div>;
}

function AdminClaim({ claim, onUpdate, busy }) {
  return <article className="surface rounded-2xl border border-line p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-200">{claim.status}</span><h3 className="mt-3 font-bold text-copy">{claim.item?.name || claim.itemId}</h3><p className="mt-1 text-xs text-muted">Claim by {claim.claimantName} · {formatDate(claim.createdAt)}</p></div>{claim.item && <Link href={`/items/${claim.itemId}`} className="text-xs font-bold text-royal hover:underline dark:text-blue-300">View item <ArrowRight size={13} className="inline" /></Link>}</div><div className="mt-4 grid gap-3 rounded-2xl bg-canvas p-4 sm:grid-cols-2"><div><p className="text-[10px] font-bold uppercase tracking-wide text-muted">Item description</p><p className="mt-1 text-xs leading-5 text-copy">{claim.itemDescription}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wide text-muted">Unique details</p><p className="mt-1 text-xs leading-5 text-copy">{claim.uniqueDetails}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wide text-muted">Proof description</p><p className="mt-1 text-xs leading-5 text-copy">{claim.proofDescription}</p></div></div>{!['Approved', 'Rejected'].includes(claim.status) && <div className="mt-4 flex flex-wrap justify-end gap-2"><button disabled={busy} onClick={() => onUpdate(claim, 'Under Review')} className="btn-secondary !py-2 !text-xs">Under review</button><button disabled={busy} onClick={() => onUpdate(claim, 'Rejected')} className="btn-danger !py-2 !text-xs">Reject</button><button disabled={busy} onClick={() => onUpdate(claim, 'Approved')} className="btn-primary !py-2 !text-xs">Approve <Check size={14} /></button></div>}</article>;
}

export default function AdminClient() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [busyId, setBusyId] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [overview, itemData, userData, claimData] = await Promise.all([
        apiFetch('/api/admin/overview'), apiFetch('/api/admin/items'), apiFetch('/api/admin/users'), apiFetch('/api/claims'),
      ]);
      setStats(overview.stats); setItems(itemData.items || []); setUsers(userData.users || []); setClaims(claimData.claims || []);
    } catch (err) { setError(err.message || 'Unable to load the admin console.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (user?.role !== 'admin') { router.replace('/dashboard'); return; }
    refresh();
  }, [user?.role, authLoading, refresh, router]);

  const filteredItems = useMemo(() => items.filter((item) => `${item.name} ${item.reportId} ${item.city} ${item.state} ${item.category}`.toLowerCase().includes(filter.toLowerCase())), [items, filter]);
  const flagged = items.filter((item) => item.status === 'under-review');

  const updateReport = async (item, status) => {
    const action = status === 'under-review' ? 'flag this report for review' : status === 'closed' ? 'close this report' : 'restore this report';
    if (!window.confirm(`Are you sure you want to ${action}?`)) return;
    setBusyId(item.id);
    try { const data = await apiFetch(`/api/items/${item.id}`, { method: 'PUT', body: JSON.stringify({ status }) }); setItems((current) => current.map((entry) => entry.id === item.id ? data.item : entry)); toast(`Report ${status === 'under-review' ? 'flagged for review' : status}.`, 'success'); }
    catch (err) { toast(err.message, 'error'); } finally { setBusyId(''); }
  };
  const deleteReport = async (item) => {
    if (!window.confirm(`Permanently remove report ${item.reportId}?`)) return;
    setBusyId(item.id);
    try { await apiFetch(`/api/items/${item.id}`, { method: 'DELETE' }); await refresh(); toast('Report removed.', 'success'); }
    catch (err) { toast(err.message, 'error'); } finally { setBusyId(''); }
  };
  const updateClaim = async (claim, status) => {
    setBusyId(claim.id);
    try { await apiFetch(`/api/claims/${claim.id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); await refresh(); toast(`Claim marked ${status.toLowerCase()}.`, 'success'); }
    catch (err) { toast(err.message, 'error'); } finally { setBusyId(''); }
  };

  if (authLoading || loading) return <div className="page-container py-12"><PageLoading label="Checking admin permissions…" /></div>;
  if (user?.role !== 'admin') return <div className="page-container py-12"><PageLoading label="Redirecting to your dashboard…" /></div>;

  const Overview = <div className="space-y-6"><div className="rounded-3xl bg-gradient-to-r from-[#132c57] via-[#204b9b] to-[#137e78] p-6 text-white sm:p-8"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-teal-200">TraceIt operations</p><h1 className="mt-2 text-3xl font-extrabold">Admin console</h1><p className="mt-2 max-w-xl text-sm leading-6 text-blue-50/80">Review reports, claims and platform activity. Admin actions are protected by server-side role checks.</p></div><div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><Stat label="Lost reports" value={stats?.lost || 0} icon={Search} tint="bg-blue-50 text-royal dark:bg-blue-950 dark:text-blue-300" /><Stat label="Found reports" value={stats?.found || 0} icon={ClipboardList} tint="bg-teal-50 text-teal dark:bg-teal-950 dark:text-teal-300" /><Stat label="Successful reunions" value={stats?.recovered || 0} icon={ShieldCheck} tint="bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300" /><Stat label="Registered users" value={stats?.users || 0} icon={UsersRound} tint="bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300" /></div><div className="grid grid-cols-2 gap-3 xl:grid-cols-3"><Stat label="Claims to review" value={stats?.pendingClaims || 0} icon={BadgeAlert} tint="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300" /><Stat label="Suspicious reports" value={stats?.flagged || 0} icon={Flag} tint="bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300" /><Stat label="New support messages" value={stats?.newMessages || 0} icon={MessageSquareText} tint="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300" /></div><DashboardCharts items={items} /><div className="grid gap-5 md:grid-cols-2"><button onClick={() => setTab('moderation')} className="surface flex items-center justify-between rounded-3xl border border-line p-5 text-left transition hover:shadow-card"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300"><Flag size={18} /></span><div><p className="font-bold text-copy">Review flagged content</p><p className="mt-1 text-xs text-muted">{flagged.length} reports need attention</p></div></div><ArrowRight size={17} className="text-muted" /></button><button onClick={() => setTab('claims')} className="surface flex items-center justify-between rounded-3xl border border-line p-5 text-left transition hover:shadow-card"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300"><BadgeAlert size={18} /></span><div><p className="font-bold text-copy">Ownership claims</p><p className="mt-1 text-xs text-muted">{stats?.pendingClaims || 0} awaiting a decision</p></div></div><ArrowRight size={17} className="text-muted" /></button></div></div>;

  const reportContent = (list, moderation = false) => list.length ? <div className="space-y-3">{list.map((item) => <article key={item.id} className="surface flex flex-col gap-4 rounded-2xl border border-line p-4 sm:flex-row sm:items-center"><ItemArtwork item={item} compact className="h-16 w-16 shrink-0 rounded-xl" /><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2"><span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase ${item.type === 'lost' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'}`}>{item.type}</span><span className="rounded-full bg-canvas px-2 py-1 text-[9px] font-bold capitalize text-muted">{item.status.replace('-', ' ')}</span>{item.isDemo && <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-200">Sample</span>}</div><Link href={`/items/${item.id}`} className="mt-1 block truncate font-bold text-copy hover:text-royal">{item.name}</Link><p className="mt-1 text-[10px] text-muted">{item.reportId} · {item.category} · {itemLocation(item)} · {formatDate(item.date)}</p><p className="mt-1 truncate text-[10px] text-muted">Reporter account ID: {item.userId}</p></div><div className="flex flex-wrap gap-2 sm:justify-end">{item.status === 'under-review' ? <button disabled={busyId === item.id} onClick={() => updateReport(item, 'active')} className="btn-secondary !px-3 !py-2 !text-xs"><Check size={13} /> Restore</button> : <button disabled={busyId === item.id} onClick={() => updateReport(item, 'under-review')} className="btn-secondary !px-3 !py-2 !text-xs"><Flag size={13} /> Flag</button>}<button disabled={busyId === item.id} onClick={() => updateReport(item, 'closed')} className="btn-secondary !px-3 !py-2 !text-xs">Close</button><button disabled={busyId === item.id} onClick={() => deleteReport(item)} className="btn-danger !px-3 !py-2 !text-xs" aria-label="Delete report"><Trash2 size={13} /></button></div></article>)}</div> : <EmptyState title={moderation ? 'Nothing is flagged for review' : 'No reports found'} description={moderation ? 'Reports flagged by administrators will appear here.' : 'Try another search or check back later.'} />;

  const section = () => {
    if (tab === 'overview') return Overview;
    if (tab === 'reports' || tab === 'moderation') {
      const list = tab === 'moderation' ? flagged : filteredItems;
      return <div><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-extrabold text-ink dark:text-white">{tab === 'moderation' ? 'Reports needing review' : 'All platform reports'}</h1><p className="mt-1 text-sm text-muted">Review sample and community-submitted reports, then flag, close or remove as needed.</p></div>{tab === 'reports' && <div className="relative w-full sm:w-64"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input className="input !pl-9" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Search report or location" /></div>}</div>{reportContent(list, tab === 'moderation')}</div>;
    }
    if (tab === 'claims') return <div><div className="mb-5"><h1 className="text-2xl font-extrabold text-ink dark:text-white">Ownership claims</h1><p className="mt-1 text-sm text-muted">Claims are private. Review the claimant’s details carefully and use a safe verification process.</p></div>{claims.length ? <div className="space-y-3">{claims.map((claim) => <AdminClaim key={claim.id} claim={claim} onUpdate={updateClaim} busy={busyId === claim.id} />)}</div> : <EmptyState title="No ownership claims yet" description="New claims submitted for found reports will be listed here." />}</div>;
    return <div><div className="mb-5"><h1 className="text-2xl font-extrabold text-ink dark:text-white">Registered users</h1><p className="mt-1 text-sm text-muted">Account directory · personal contact details stay hidden from public item pages.</p></div>{users.length ? <div className="surface overflow-hidden rounded-3xl border border-line"><div className="hidden grid-cols-[1.2fr_1.4fr_1fr_.7fr] gap-3 border-b border-line bg-canvas px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted sm:grid"><span>Member</span><span>Email</span><span>Location</span><span>Role</span></div><div className="divide-y divide-line">{users.map((entry) => <div key={entry.id} className="grid gap-2 px-4 py-4 sm:grid-cols-[1.2fr_1.4fr_1fr_.7fr] sm:items-center sm:gap-3 sm:px-5"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-xs font-extrabold text-royal dark:bg-blue-950 dark:text-blue-300">{initials(entry.name)}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-copy">{entry.name}</p><p className="text-[10px] text-muted">Joined {formatDate(entry.createdAt)}</p></div></div><p className="truncate text-xs text-muted">{entry.email}</p><p className="text-xs text-muted">{[entry.city, entry.state].filter(Boolean).join(', ') || '—'}</p><span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold ${entry.role === 'admin' ? 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300' : 'bg-canvas text-muted'}`}>{entry.role}</span></div>)}</div></div> : <EmptyState title="No accounts found" description="Registered TraceIt members will appear here." />}</div>;
  };

  if (error) return <div className="page-container py-12"><div className="surface mx-auto max-w-xl rounded-3xl border border-rose-200 p-7 text-center"><ShieldCheck size={26} className="mx-auto text-rose-500" /><h1 className="mt-3 text-xl font-extrabold text-copy">Admin data could not be loaded</h1><p className="mt-2 text-sm text-muted">{error}</p><button onClick={refresh} className="btn-primary mt-5"><RefreshCw size={15} /> Try again</button></div></div>;

  return <div className="page-container py-8 sm:py-10"><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Restricted access</p><h1 className="mt-1 text-2xl font-extrabold text-ink dark:text-white sm:text-3xl">TraceIt administration</h1></div><div className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3 py-2 text-xs font-semibold text-muted"><span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><ShieldCheck size={14} /></span>{user.name}</div></div><div className="grid items-start gap-6 lg:grid-cols-[220px_1fr]"><aside className="surface overflow-hidden rounded-3xl border border-line"><div className="border-b border-line p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Admin tools</p></div><nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col" aria-label="Admin sections">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition lg:w-full ${tab === id ? 'bg-blue-50 text-royal dark:bg-blue-950/70 dark:text-blue-300' : 'text-muted hover:bg-canvas hover:text-copy'}`}><Icon size={15} />{label}{id === 'moderation' && flagged.length > 0 && <span className="ml-auto rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white">{flagged.length}</span>}</button>)}</nav><div className="hidden border-t border-line p-3 lg:block"><Link href="/dashboard" className="menu-item"><ArrowRight size={14} className="rotate-180" /> Member dashboard</Link></div></aside><section className="min-w-0">{section()}</section></div><p className="mt-6 text-[10px] leading-5 text-muted">Role checks are enforced by the server for every admin endpoint. A client-side URL change does not grant access.</p></div>;
}
