'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity, ArrowRight, Bell, Check, CheckCheck, ClipboardList, Clock3, FileText,
  Heart, LayoutDashboard, MapPin, MessageSquareText, MoreHorizontal, Plus, RefreshCw,
  Search, ShieldCheck, Sparkles, Trash2, UserRound, UsersRound, WalletCards,
} from 'lucide-react';
import { useAuth, useToast } from '../../context/AppContext';
import { apiFetch } from '../../utils/api';
import { formatDate, itemLocation } from '../../utils/format';
import { initials } from '../../utils/format';
import { PageLoading } from '../ui/Loading';
import EmptyState from '../ui/EmptyState';
import ItemCard from '../ui/ItemCard';
import MatchCard from '../ui/MatchCard';
import DashboardCharts from './DashboardCharts';
import { StateCityFields } from '../forms/StateCityFields';

const NAVIGATION = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'lost', label: 'My lost reports', icon: Search },
  { id: 'found', label: 'My found reports', icon: ClipboardList },
  { id: 'matches', label: 'Potential matches', icon: Sparkles },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'messages', label: 'Secure messages', icon: MessageSquareText },
  { id: 'claims', label: 'Ownership claims', icon: ShieldCheck },
  { id: 'saved', label: 'Saved items', icon: Heart },
  { id: 'profile', label: 'Profile settings', icon: UserRound },
];

function MetricCard({ label, value, icon: Icon, tone, onClick }) {
  return <button type="button" onClick={onClick} className="surface rounded-2xl border border-line p-4 text-left transition hover:-translate-y-0.5 hover:shadow-card sm:p-5"><div className="flex items-start justify-between gap-2"><span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon size={18} /></span><MoreHorizontal size={16} className="text-slate-300" /></div><p className="mt-4 text-2xl font-extrabold tracking-tight text-ink dark:text-white">{value}</p><p className="mt-0.5 text-xs font-medium text-muted">{label}</p></button>;
}

function ReportRow({ item, onEdit, onDelete, busy }) {
  return <article className="surface flex flex-col gap-4 rounded-2xl border border-line p-4 sm:flex-row sm:items-center sm:p-5">
    <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-canvas"><span className="text-lg">{item.type === 'lost' ? '⌕' : '✳'}</span></div>
    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase ${item.type === 'lost' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'}`}>{item.type}</span><span className="rounded-full bg-canvas px-2 py-1 text-[9px] font-semibold capitalize text-muted">{item.status.replace('-', ' ')}</span>{item.isDemo && <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">Sample</span>}</div><Link href={`/items/${item.id}`} className="mt-1 block truncate font-bold text-copy hover:text-royal dark:hover:text-blue-300">{item.name}</Link><div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted"><span>{item.reportId}</span><span className="inline-flex items-center gap-1"><MapPin size={11} />{itemLocation(item)}</span><span>{formatDate(item.date)}</span></div></div>
    <div className="flex shrink-0 gap-2"><Link href={`/items/${item.id}`} className="btn-secondary !px-3 !py-2 !text-xs">Details</Link><button type="button" disabled={busy} onClick={() => onEdit(item)} className="btn-secondary !px-3 !py-2 !text-xs">Edit</button><button type="button" disabled={busy} onClick={() => onDelete(item)} className="btn-danger !px-3 !py-2 !text-xs" aria-label={`Delete ${item.name}`}><Trash2 size={14} /></button></div>
  </article>;
}

function EditReportDialog({ item, onClose, onSave }) {
  const [form, setForm] = useState({ name: item.name || '', description: item.description || '', brand: item.brand || '', color: item.color || '', marks: item.marks || '', date: item.date || '', city: item.city || '', state: item.state || '', location: item.location || '', status: item.status || 'active' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { await onSave(item.id, form); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="edit-report-title"><div className="surface my-auto w-full max-w-2xl rounded-3xl border border-line p-5 shadow-soft sm:p-7"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow">Edit report · {item.reportId}</p><h2 id="edit-report-title" className="mt-1 text-2xl font-extrabold text-ink dark:text-white">Update report details</h2></div><button onClick={onClose} className="icon-button" aria-label="Close edit report"><span aria-hidden="true">×</span></button></div><form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2"><div><label className="field-label" htmlFor="edit-name">Item name</label><input required className="input" id="edit-name" value={form.name} onChange={(event) => update('name', event.target.value)} /></div><div><label className="field-label" htmlFor="edit-status">Report status</label><select className="select" id="edit-status" value={form.status} onChange={(event) => update('status', event.target.value)}><option value="active">Active</option><option value="recovered">Recovered</option><option value="closed">Closed</option></select></div><div className="sm:col-span-2"><label className="field-label" htmlFor="edit-description">Description</label><textarea required minLength={12} className="textarea !min-h-[95px]" id="edit-description" value={form.description} onChange={(event) => update('description', event.target.value)} /></div><div><label className="field-label" htmlFor="edit-brand">Brand</label><input className="input" id="edit-brand" value={form.brand} onChange={(event) => update('brand', event.target.value)} /></div><div><label className="field-label" htmlFor="edit-colour">Colour</label><input className="input" id="edit-colour" value={form.color} onChange={(event) => update('color', event.target.value)} /></div><div><label className="field-label" htmlFor="edit-marks">Distinctive marks</label><input className="input" id="edit-marks" value={form.marks} onChange={(event) => update('marks', event.target.value)} /></div><div><label className="field-label" htmlFor="edit-date">Date</label><input type="date" className="input" id="edit-date" value={form.date} onChange={(event) => update('date', event.target.value)} /></div><div className="sm:col-span-2"><StateCityFields state={form.state} city={form.city} onStateChange={(value) => update('state', value)} onCityChange={(value) => update('city', value)} required /></div><div className="sm:col-span-2"><label className="field-label" htmlFor="edit-location">Nearby location</label><input required minLength={3} className="input" id="edit-location" value={form.location} onChange={(event) => update('location', event.target.value)} /></div>{error && <p className="field-error sm:col-span-2">{error}</p>}<div className="mt-1 flex justify-end gap-2 border-t border-line pt-4 sm:col-span-2"><button type="button" onClick={onClose} className="btn-secondary">Cancel</button><button disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save changes'} <Check size={15} /></button></div></form></div></div>;
}

function NotificationsPanel({ notifications, refresh }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const unread = notifications.filter((note) => !note.readAt).length;
  const markAll = async () => { setBusy(true); try { await apiFetch('/api/notifications/mark-all-read', { method: 'PATCH' }); await refresh(); toast('All notifications marked as read.', 'success'); } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); } };
  const updateNote = async (note, action) => { try { await apiFetch(`/api/notifications/${note.id}`, { method: 'PATCH', body: JSON.stringify(action === 'delete' ? { action } : { read: true }) }); await refresh(); } catch (err) { toast(err.message, 'error'); } };
  return <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold text-ink dark:text-white">Notifications</h2><p className="mt-1 text-sm text-muted">Match leads, ownership claims and updates about your reports.</p></div>{unread > 0 && <button type="button" disabled={busy} onClick={markAll} className="btn-secondary !py-2"><CheckCheck size={15} /> Mark all read</button>}</div>{notifications.length ? <div className="surface divide-y divide-line overflow-hidden rounded-3xl border border-line">{notifications.map((note) => <div key={note.id} className={`flex gap-3 p-4 sm:p-5 ${!note.readAt ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-canvas text-royal dark:text-blue-300">{note.type === 'match' || note.type === 'similar-item' ? <Sparkles size={17} /> : note.type.includes('claim') ? <ShieldCheck size={17} /> : <Bell size={17} />}</span><div className="min-w-0 flex-1"><p className="text-sm font-bold text-copy">{note.title}</p><p className="mt-1 text-xs leading-5 text-muted">{note.message}</p><div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-muted"><span>{formatDate(note.createdAt, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>{note.itemId && <Link href={`/items/${note.itemId}`} className="font-bold text-royal hover:underline dark:text-blue-300">View related report</Link>}</div></div><div className="flex gap-1">{!note.readAt && <button type="button" onClick={() => updateNote(note, 'read')} className="icon-button !h-8 !w-8" aria-label="Mark notification read"><Check size={15} /></button>}<button type="button" onClick={() => updateNote(note, 'delete')} className="icon-button !h-8 !w-8 hover:!text-rose-500" aria-label="Delete notification"><Trash2 size={14} /></button></div></div>)}</div> : <EmptyState title="You are all caught up" description="We'll show potential matches, claims and report updates here." action="Browse items" href="/browse" />}</div>;
}

function MessagesPanel({ threads, onRefresh }) {
  const { toast } = useToast();
  const [drafts, setDrafts] = useState({});
  const [busyId, setBusyId] = useState('');
  const submit = async (event, thread) => {
    event.preventDefault();
    const message = String(drafts[thread.threadId] || '').trim();
    if (message.length < 10) return toast('Write at least 10 characters before sending.', 'error');
    setBusyId(thread.threadId);
    try {
      await apiFetch(`/api/messages/${thread.threadId}/reply`, { method: 'POST', body: JSON.stringify({ message }) });
      setDrafts((current) => ({ ...current, [thread.threadId]: '' }));
      await onRefresh();
      toast('Your reply was sent privately.', 'success');
    } catch (error) { toast(error.message, 'error'); }
    finally { setBusyId(''); }
  };
  return <div><div className="mb-6"><h2 className="text-xl font-extrabold text-ink dark:text-white">Secure messages</h2><p className="mt-1 text-sm leading-6 text-muted">Talk about a report without exposing phone numbers or email addresses. Never send passwords, payment details or full identity numbers.</p></div>{threads.length ? <div className="space-y-4">{threads.map((thread) => <section key={thread.threadId} className="surface overflow-hidden rounded-3xl border border-line"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-canvas/70 px-4 py-4 sm:px-5"><div><p className="text-sm font-bold text-copy">{thread.otherParty}</p><p className="mt-1 text-[10px] text-muted">{thread.subject}</p></div>{thread.item && <Link href={`/items/${thread.item.id}`} className="text-xs font-bold text-royal hover:underline dark:text-blue-300">{thread.item.reportId} · {thread.item.name}</Link>}</div><div className="max-h-80 space-y-3 overflow-y-auto p-4 sm:p-5">{thread.messages.map((message) => <div key={message.id} className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${message.isMine ? 'rounded-br-md bg-royal text-white' : 'rounded-bl-md bg-canvas text-copy'}`}><p className="mb-1 text-[9px] font-bold uppercase tracking-wide opacity-70">{message.isMine ? 'You' : message.name}</p><p className="whitespace-pre-line text-xs leading-5">{message.message}</p><p className="mt-2 text-right text-[9px] opacity-65">{formatDate(message.createdAt, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</p></div></div>)}</div><form onSubmit={(event) => submit(event, thread)} className="border-t border-line p-4 sm:p-5"><label className="field-label" htmlFor={`reply-${thread.threadId}`}>Reply privately</label><div className="flex flex-col gap-2 sm:flex-row sm:items-end"><textarea id={`reply-${thread.threadId}`} required minLength={10} maxLength={1500} value={drafts[thread.threadId] || ''} onChange={(event) => setDrafts((current) => ({ ...current, [thread.threadId]: event.target.value }))} className="textarea !min-h-[74px] flex-1" placeholder="Write a safe, helpful reply…" /><button disabled={busyId === thread.threadId} className="btn-primary shrink-0 justify-center">{busyId === thread.threadId ? 'Sending…' : 'Send reply'} <ArrowRight size={14} /></button></div></form></section>)}</div> : <EmptyState title="No secure messages yet" description="Enquiries and match suggestions from other members will appear here. Your email and mobile number are not shared." action="Browse reports" href="/browse" />}</div>;
}

function ClaimsPanel({ claims, received, onRefresh }) {
  const { toast } = useToast();
  const [busyId, setBusyId] = useState('');
  const updateClaim = async (claim, status) => { setBusyId(claim.id); try { await apiFetch(`/api/claims/${claim.id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); await onRefresh(); toast(`Claim marked ${status.toLowerCase()}.`, 'success'); } catch (err) { toast(err.message, 'error'); } finally { setBusyId(''); } };
  const card = (claim, isReceived) => <article key={claim.id} className="surface rounded-2xl border border-line p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${claim.status === 'Approved' ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300' : claim.status === 'Rejected' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200'}`}>{claim.status}</span><h3 className="mt-3 font-bold text-copy">{claim.item?.name || 'Found item claim'}</h3><p className="mt-1 text-xs text-muted">Report {claim.item?.reportId || claim.itemId} · Submitted {formatDate(claim.createdAt)}</p></div>{claim.itemId && <Link href={`/items/${claim.itemId}`} className="text-xs font-bold text-royal hover:underline dark:text-blue-300">View report <ArrowRight size={13} className="inline" /></Link>}</div><div className="mt-4 grid gap-3 rounded-2xl bg-canvas p-4 sm:grid-cols-2"><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Claimant</p><p className="mt-1 text-xs font-semibold text-copy">{claim.claimantName}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Item description</p><p className="mt-1 text-xs leading-5 text-copy">{claim.itemDescription}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Private identifying details</p><p className="mt-1 text-xs leading-5 text-copy">{claim.uniqueDetails}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted">Proof description</p><p className="mt-1 text-xs leading-5 text-copy">{claim.proofDescription}</p></div></div>{isReceived && !['Approved', 'Rejected'].includes(claim.status) && <div className="mt-4 flex flex-wrap justify-end gap-2"><button disabled={busyId === claim.id} onClick={() => updateClaim(claim, 'Under Review')} className="btn-secondary !py-2 !text-xs">Under review</button><button disabled={busyId === claim.id} onClick={() => updateClaim(claim, 'Rejected')} className="btn-danger !py-2 !text-xs">Reject</button><button disabled={busyId === claim.id} onClick={() => updateClaim(claim, 'Approved')} className="btn-primary !py-2 !text-xs">Approve & mark recovered <Check size={14} /></button></div>}</article>;
  return <div><div className="mb-6"><h2 className="text-xl font-extrabold text-ink dark:text-white">Ownership claims</h2><p className="mt-1 text-sm text-muted">Submitted claims are private. Report owners can review claims on their found items.</p></div><div className="space-y-8"><section><h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-copy"><ShieldCheck size={16} className="text-teal" />Claims on your found reports <span className="rounded-full bg-canvas px-2 py-0.5 text-[10px] text-muted">{received.length}</span></h3>{received.length ? <div className="space-y-3">{received.map((claim) => card(claim, true))}</div> : <div className="rounded-2xl border border-dashed border-line p-5 text-xs text-muted">No ownership claims have been received.</div>}</section><section><h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-copy"><FileText size={16} className="text-royal" />Claims you submitted <span className="rounded-full bg-canvas px-2 py-0.5 text-[10px] text-muted">{claims.length}</span></h3>{claims.length ? <div className="space-y-3">{claims.map((claim) => card(claim, false))}</div> : <div className="rounded-2xl border border-dashed border-line p-5 text-xs text-muted">You have not submitted any ownership claims yet.</div>}</section></div></div>;
}

function ProfilePanel({ user }) {
  const { login } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '', state: user.state || '', city: user.city || '', notificationPreferences: { matches: true, claims: true, updates: true } });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setForm((current) => ({ ...current, name: user.name || '', phone: user.phone || '', state: user.state || '', city: user.city || '', notificationPreferences: user.notificationPreferences || current.notificationPreferences })); }, [user]);
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const setPreference = (key, value) => setForm((current) => ({ ...current, notificationPreferences: { ...current.notificationPreferences, [key]: value } }));
  const submit = async (event) => { event.preventDefault(); setError(''); if (newPassword && newPassword !== confirmPassword) return setError('New passwords do not match.'); setBusy(true); try { const data = await apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify({ ...form, ...(newPassword ? { currentPassword, newPassword } : {}) }) }); login(data.user); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); toast(data.message || 'Profile updated.', 'success'); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <div><div className="mb-6"><h2 className="text-xl font-extrabold text-ink dark:text-white">Profile settings</h2><p className="mt-1 text-sm text-muted">Update your account and notification preferences. Email cannot be changed here.</p></div><form onSubmit={submit} className="surface rounded-3xl border border-line p-5 sm:p-7"><div className="flex items-center gap-3 border-b border-line pb-5"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-royal to-teal text-sm font-extrabold text-white">{initials(user.name)}</span><div><p className="font-bold text-copy">{user.name}</p><p className="text-xs text-muted">{user.email}</p></div></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><div><label className="field-label" htmlFor="profile-name">Full name</label><input id="profile-name" required className="input" value={form.name} onChange={(event) => setField('name', event.target.value)} /></div><div><label className="field-label" htmlFor="profile-phone">Mobile number</label><input id="profile-phone" type="tel" required className="input" value={form.phone} onChange={(event) => setField('phone', event.target.value)} /></div><div className="sm:col-span-2"><StateCityFields state={form.state} city={form.city} onStateChange={(value) => setField('state', value)} onCityChange={(value) => setField('city', value)} idPrefix="profile" /></div></div><div className="mt-7 border-t border-line pt-6"><h3 className="font-bold text-copy">Notification preferences</h3><p className="mt-1 text-xs text-muted">Choose the in-app updates you would like to receive.</p><div className="mt-3 grid gap-2 sm:grid-cols-3">{[['matches', 'Potential matches'], ['claims', 'Ownership claims'], ['updates', 'Report updates']].map(([key, label]) => <label key={key} className="flex items-center gap-2 rounded-xl bg-canvas p-3 text-xs font-semibold text-copy"><input type="checkbox" checked={Boolean(form.notificationPreferences?.[key])} onChange={(event) => setPreference(key, event.target.checked)} className="h-4 w-4 accent-royal" />{label}</label>)}</div></div><div className="mt-7 border-t border-line pt-6"><h3 className="font-bold text-copy">Change password</h3><p className="mt-1 text-xs text-muted">Leave these fields blank to keep your current password.</p><div className="mt-4 grid gap-4 sm:grid-cols-3"><div><label className="field-label" htmlFor="profile-current-password">Current password</label><input id="profile-current-password" type="password" autoComplete="current-password" className="input" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></div><div><label className="field-label" htmlFor="profile-new-password">New password</label><input id="profile-new-password" type="password" autoComplete="new-password" minLength={8} className="input" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></div><div><label className="field-label" htmlFor="profile-confirm-password">Confirm new password</label><input id="profile-confirm-password" type="password" autoComplete="new-password" className="input" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></div></div></div>{error && <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}<div className="mt-6 flex justify-end border-t border-line pt-5"><button disabled={busy} className="btn-primary">{busy ? 'Saving changes…' : 'Save profile changes'} <Check size={15} /></button></div></form></div>;
}

export default function DashboardClient() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState('overview');
  const [items, setItems] = useState([]);
  const [matchReports, setMatchReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [threads, setThreads] = useState([]);
  const [saved, setSaved] = useState([]);
  const [claims, setClaims] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [busyItem, setBusyItem] = useState('');
  const userId = user?.id;

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true); setError('');
    try {
      const [itemsData, matchesData, notificationsData, messagesData, savedData, claimsData] = await Promise.all([
        apiFetch('/api/items?mine=true'), apiFetch('/api/matches'), apiFetch('/api/notifications'), apiFetch('/api/messages'), apiFetch('/api/saved'), apiFetch('/api/claims'),
      ]);
      setItems(itemsData.items || []);
      setMatchReports(matchesData.reports || []);
      setNotifications(notificationsData.notifications || []);
      setThreads(messagesData.threads || []);
      setSaved(savedData.saved || []);
      setClaims(claimsData.claims || []);
      setReceivedClaims(claimsData.received || []);
    } catch (err) { setError(err.message || 'Unable to load dashboard data.'); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;
    if (!userId) { router.replace('/login?next=%2Fdashboard'); return; }
    refresh();
  }, [userId, authLoading, refresh, router]);

  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    if (NAVIGATION.some((entry) => entry.id === requestedTab)) setTab(requestedTab);
  }, []);

  const matches = useMemo(() => {
    const unique = new Map();
    for (const report of matchReports) {
      for (const match of report.matches || []) {
        const ids = [String(report.item.id), String(match.item.id)].sort();
        const key = ids.join(':');
        if (!unique.has(key)) unique.set(key, { ...match, source: report.item });
      }
    }
    return [...unique.values()].sort((a, b) => b.score - a.score);
  }, [matchReports]);

  const deleteItem = async (item) => {
    if (!window.confirm(`Delete “${item.name}” (${item.reportId})? This cannot be undone.`)) return;
    setBusyItem(item.id);
    try { await apiFetch(`/api/items/${item.id}`, { method: 'DELETE' }); await refresh(); toast('Report deleted.', 'success'); }
    catch (err) { toast(err.message, 'error'); } finally { setBusyItem(''); }
  };
  const saveEdit = async (id, body) => {
    const data = await apiFetch(`/api/items/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    setEditItem(null); setItems((current) => current.map((item) => item.id === id ? data.item : item)); toast('Report updated.', 'success');
  };
  const removeSaved = async (entry) => {
    try { await apiFetch(`/api/saved/${entry.id}`, { method: 'DELETE' }); setSaved((current) => current.filter((item) => item.id !== entry.id)); toast('Removed from saved items.', 'success'); }
    catch (err) { toast(err.message, 'error'); }
  };

  if (authLoading || loading) return <div className="page-container py-10"><PageLoading label="Loading your dashboard…" /></div>;
  if (!user) return <div className="page-container py-12"><PageLoading label="Taking you to sign in…" /></div>;

  const lost = items.filter((item) => item.type === 'lost');
  const found = items.filter((item) => item.type === 'found');
  const recovered = items.filter((item) => item.status === 'recovered').length;
  const unread = notifications.filter((note) => !note.readAt).length;
  const handleNav = (id) => { setTab(id); if (window.matchMedia('(max-width: 1023px)').matches) window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const overview = <div className="space-y-6">
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#143263] via-[#2451aa] to-[#148c86] p-6 text-white sm:p-8"><div className="absolute -right-8 -top-20 h-64 w-64 rounded-full border border-white/15 bg-white/5" /><div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-teal-200">Your TraceIt space</p><h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Good to see you, {user.name?.split(' ')[0]}.</h1><p className="mt-2 max-w-lg text-sm leading-6 text-blue-50/80">Here is what is happening with your reports and potential matches.</p></div><div className="flex flex-wrap gap-2"><Link href="/report/lost" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold text-navy transition hover:bg-blue-50"><Plus size={15} /> Report lost</Link><Link href="/report/found" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/10"><Plus size={15} /> Report found</Link></div></div></div>
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><MetricCard label="Lost reports" value={lost.length} icon={Search} tone="bg-blue-50 text-royal dark:bg-blue-950 dark:text-blue-300" onClick={() => handleNav('lost')} /><MetricCard label="Found reports" value={found.length} icon={ClipboardList} tone="bg-teal-50 text-teal dark:bg-teal-950 dark:text-teal-300" onClick={() => handleNav('found')} /><MetricCard label="Potential matches" value={matches.length} icon={Sparkles} tone="bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300" onClick={() => handleNav('matches')} /><MetricCard label="Successfully recovered" value={recovered} icon={Heart} tone="bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300" onClick={() => handleNav('lost')} /></div>
    <DashboardCharts items={items} />
    <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
      <section className="surface rounded-3xl border border-line p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-extrabold text-copy">Strongest potential matches</h2><p className="mt-1 text-xs text-muted">Ranked from your active reports</p></div><button type="button" onClick={() => handleNav('matches')} className="text-xs font-bold text-royal hover:underline dark:text-blue-300">See all</button></div>{matches.length ? <div className="space-y-3">{matches.slice(0, 2).map((match, index) => <MatchCard key={`${match.item.id}-${index}`} match={match} />)}</div> : <div className="rounded-2xl border border-dashed border-line px-4 py-7 text-center"><Sparkles size={20} className="mx-auto text-muted" /><p className="mt-2 text-sm font-bold text-copy">No potential matches yet</p><p className="mt-1 text-xs text-muted">New reports are compared automatically.</p></div>}</section>
      <section className="surface rounded-3xl border border-line p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-extrabold text-copy">Recent activity</h2><p className="mt-1 text-xs text-muted">Your latest reports</p></div><Activity size={17} className="text-teal" /></div>{items.length ? <div className="space-y-0">{[...items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5).map((item, index) => <div key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0"><span className={`relative mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl ${item.type === 'lost' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300' : 'bg-teal-50 text-teal dark:bg-teal-950 dark:text-teal-300'}`}>{item.type === 'lost' ? <Search size={14} /> : <ClipboardList size={14} />}{index < 4 && <span className="absolute -bottom-4 left-1/2 h-3 w-px bg-line" />}</span><div className="min-w-0 flex-1"><Link href={`/items/${item.id}`} className="block truncate text-xs font-bold text-copy hover:text-royal">{item.name}</Link><p className="mt-1 text-[10px] text-muted">{item.type === 'lost' ? 'Lost report' : 'Found report'} · {item.reportId} · {formatDate(item.createdAt)}</p></div><span className="mt-0.5 h-2 w-2 rounded-full bg-teal" /></div>)}</div> : <p className="py-8 text-center text-xs text-muted">Your report activity will appear here.</p>}</section>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line bg-panel p-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300"><ShieldCheck size={18} /></span><div><p className="text-sm font-bold text-copy">A safe recovery starts with privacy.</p><p className="mt-1 text-xs text-muted">Verify private details and arrange handovers in public places.</p></div></div><Link href="/how-it-works" className="text-xs font-bold text-royal hover:underline dark:text-blue-300">Read the safety guide <ArrowRight size={13} className="inline" /></Link></div>
  </div>;

  const tabContent = () => {
    if (tab === 'overview') return overview;
    if (tab === 'lost' || tab === 'found') {
      const reports = tab === 'lost' ? lost : found;
      return <div><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-extrabold text-ink dark:text-white">My {tab} reports</h1><p className="mt-1 text-sm text-muted">Edit, update status or remove your own reports.</p></div><Link href={`/report/${tab}`} className="btn-primary !py-2.5"><Plus size={15} /> New report</Link></div>{reports.length ? <div className="space-y-3">{[...reports].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map((item) => <ReportRow key={item.id} item={item} busy={busyItem === item.id} onEdit={setEditItem} onDelete={deleteItem} />)}</div> : <EmptyState title={`No ${tab} reports yet`} description="Start a report to get a unique ID, see relevant matches and receive updates." action={`Report ${tab} item`} href={`/report/${tab}`} />}</div>;
    }
    if (tab === 'matches') return <div><div className="mb-6"><h1 className="text-2xl font-extrabold text-ink dark:text-white">Potential matches</h1><p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Recommendations are computed from descriptions, categories, brand/colour, state/city and date proximity. These are similarity estimates—not verified AI predictions.</p></div>{matches.length ? <div className="grid gap-4 xl:grid-cols-2">{matches.map((match, index) => <div key={`${match.source?.id}-${match.item.id}-${index}`}><div className="mb-2 flex items-center gap-2 px-1 text-[10px] font-semibold text-muted"><span className="rounded-full bg-canvas px-2 py-1">Your report: {match.source?.reportId}</span><ArrowRight size={12} /></div><MatchCard match={match} /></div>)}</div> : <EmptyState title="No recommendations yet" description="Your active reports are compared with opposite-type reports. Add more identifying details or check back when the community adds new items." action="Browse reports" href="/browse" />}</div>;
    if (tab === 'notifications') return <NotificationsPanel notifications={notifications} refresh={refresh} />;
    if (tab === 'messages') return <MessagesPanel threads={threads} onRefresh={refresh} />;
    if (tab === 'claims') return <ClaimsPanel claims={claims} received={receivedClaims} onRefresh={refresh} />;
    if (tab === 'saved') return <div><div className="mb-6"><h1 className="text-2xl font-extrabold text-ink dark:text-white">Saved items</h1><p className="mt-1 text-sm text-muted">Reports you want to come back to.</p></div>{saved.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{saved.map((entry) => <div key={entry.id} className="space-y-2"><ItemCard item={entry.item} /><button type="button" onClick={() => removeSaved(entry)} className="btn-ghost w-full justify-center text-xs hover:!text-rose-600"><Trash2 size={13} /> Remove from saved</button></div>)}</div> : <EmptyState title="Your saved items are waiting" description="Save public reports to keep interesting leads close at hand." action="Browse items" href="/browse" />}</div>;
    if (tab === 'profile') return <ProfilePanel user={user} />;
    return overview;
  };

  const titles = { overview: 'Dashboard overview', lost: 'My lost reports', found: 'My found reports', matches: 'Potential matches', notifications: 'Notifications', messages: 'Secure messages', claims: 'Ownership claims', saved: 'Saved items', profile: 'Profile settings' };
  return <div className="page-container py-8 sm:py-10">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">Member workspace</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink dark:text-white sm:text-3xl">My dashboard</h1></div><div className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3 py-2 text-xs font-semibold text-muted"><span className="h-2 w-2 rounded-full bg-teal" />{user.city ? `${user.city}, ${user.state}` : 'Community member'}</div></div>
    {error && <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"><span>{error}</span><button type="button" onClick={refresh} className="btn-ghost !text-rose-700 dark:!text-rose-300"><RefreshCw size={14} /> Retry</button></div>}
    <div className="grid items-start gap-6 lg:grid-cols-[235px_1fr]">
      <aside className="surface overflow-hidden rounded-3xl border border-line lg:sticky lg:top-28"><div className="hidden border-b border-line p-5 lg:block"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-royal to-teal text-sm font-extrabold text-white">{initials(user.name)}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-copy">{user.name}</p><p className="truncate text-[10px] text-muted">{user.email}</p></div></div></div><nav className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible" aria-label="Dashboard sections">{NAVIGATION.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => handleNav(id)} className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition lg:w-full ${tab === id ? 'bg-blue-50 text-royal dark:bg-blue-950/70 dark:text-blue-300' : 'text-muted hover:bg-canvas hover:text-copy'}`}><Icon size={16} />{label}{id === 'notifications' && unread > 0 && <span className="ml-auto rounded-full bg-rose-500 px-1.5 py-0.5 text-[9px] font-bold text-white">{unread}</span>}{id === 'messages' && threads.length > 0 && <span className="ml-auto rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-royal dark:bg-blue-950 dark:text-blue-300">{threads.length}</span>}{id === 'matches' && matches.length > 0 && <span className="ml-auto rounded-full bg-teal/10 px-1.5 py-0.5 text-[9px] font-bold text-teal">{matches.length}</span>}</button>)}</nav><div className="hidden border-t border-line p-4 lg:block"><Link href="/browse" className="flex items-center justify-between rounded-xl bg-canvas px-3 py-2.5 text-xs font-bold text-copy transition hover:bg-blue-50 dark:hover:bg-blue-950/50">Browse community <ArrowRight size={14} className="text-royal" /></Link></div></aside>
      <section className="min-w-0" aria-label={titles[tab]}>{tabContent()}</section>
    </div>
    {editItem && <EditReportDialog item={editItem} onClose={() => setEditItem(null)} onSave={saveEdit} />}
  </div>;
}
