'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, CheckCheck, Trash2, X, Sparkles, ShieldAlert, MessageCircle, RefreshCw } from 'lucide-react';
import { useAuth, useToast } from '../../context/AppContext';
import { apiFetch } from '../../utils/api';
import { formatDate } from '../../utils/format';

function noteIcon(type) {
  if (type === 'match' || type === 'similar-item') return Sparkles;
  if (type === 'claim-received' || type === 'claim-update') return ShieldAlert;
  if (type === 'message') return MessageCircle;
  if (type === 'report-update') return RefreshCw;
  return Bell;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  const userId = user?.id;
  const load = useCallback(async () => {
    if (!userId) { setNotifications([]); return; }
    try {
      const data = await apiFetch('/api/notifications');
      setNotifications(data.notifications || []);
    } catch { /* the main dashboard provides the signed-out empty state */ }
  }, [userId]);

  useEffect(() => {
    load();
    const interval = window.setInterval(load, 30_000);
    return () => window.clearInterval(interval);
  }, [load]);
  useEffect(() => {
    const onPointer = (event) => { if (ref.current && !ref.current.contains(event.target)) setOpen(false); };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, []);

  const unread = notifications.filter((note) => !note.readAt).length;
  const markRead = async (note) => {
    try {
      await apiFetch(`/api/notifications/${note.id}`, { method: 'PATCH', body: JSON.stringify({ read: true }) });
      setNotifications((items) => items.map((item) => item.id === note.id ? { ...item, readAt: new Date().toISOString() } : item));
    } catch (error) { toast(error.message, 'error'); }
  };
  const remove = async (note) => {
    try {
      await apiFetch(`/api/notifications/${note.id}`, { method: 'PATCH', body: JSON.stringify({ action: 'delete' }) });
      setNotifications((items) => items.filter((item) => item.id !== note.id));
    } catch (error) { toast(error.message, 'error'); }
  };
  const markAll = async () => {
    if (!unread) return;
    setBusy(true);
    try {
      await apiFetch('/api/notifications/mark-all-read', { method: 'PATCH' });
      setNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
    } catch (error) { toast(error.message, 'error'); } finally { setBusy(false); }
  };

  return (
    <div className="relative" ref={ref}>
      <button type="button" className="icon-button relative" onClick={() => { setOpen((value) => !value); if (!open) load(); }} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
        <Bell size={18} />
        {unread > 0 && <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-panel bg-rose-500 px-1 text-[9px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && <div className="absolute right-0 top-[calc(100%+12px)] z-50 w-[min(92vw,390px)] overflow-hidden rounded-3xl border border-line bg-panel shadow-soft animate-fade-up">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div><h3 className="font-bold text-copy">Notifications</h3><p className="mt-0.5 text-xs text-muted">{unread ? `${unread} unread update${unread === 1 ? '' : 's'}` : 'You are all caught up'}</p></div>
          <div className="flex items-center gap-1">
            {unread > 0 && <button type="button" onClick={markAll} disabled={busy} className="rounded-xl p-2 text-muted hover:bg-canvas hover:text-royal" aria-label="Mark all as read" title="Mark all as read"><CheckCheck size={17} /></button>}
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 text-muted hover:bg-canvas" aria-label="Close notifications"><X size={17} /></button>
          </div>
        </div>
        <div className="max-h-[390px] overflow-y-auto">
          {!notifications.length ? <div className="px-5 py-9 text-center"><div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-royal dark:bg-blue-950 dark:text-blue-300"><Bell size={20} /></div><p className="mt-3 text-sm font-semibold text-copy">No notifications yet</p><p className="mt-1 text-xs text-muted">Potential matches and updates will appear here.</p></div> : notifications.slice(0, 8).map((note) => {
            const Icon = noteIcon(note.type);
            return <div key={note.id} className={`group flex gap-3 border-b border-line px-4 py-4 last:border-0 ${!note.readAt ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}>
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-panel text-royal shadow-sm dark:text-blue-300"><Icon size={16} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-copy">{note.title}</p><p className="mt-1 text-xs leading-5 text-muted">{note.message}</p>
                <div className="mt-2 flex items-center justify-between"><span className="text-[10px] text-muted">{formatDate(note.createdAt, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</span>{note.itemId && <Link href={`/items/${note.itemId}`} onClick={() => setOpen(false)} className="text-[10px] font-bold text-royal hover:underline dark:text-blue-300">View report</Link>}</div>
              </div>
              <div className="flex flex-col gap-1 opacity-70 transition group-hover:opacity-100">
                {!note.readAt && <button type="button" onClick={() => markRead(note)} className="rounded-lg p-1.5 text-muted hover:bg-panel hover:text-teal" aria-label="Mark as read"><Check size={14} /></button>}
                <button type="button" onClick={() => remove(note)} className="rounded-lg p-1.5 text-muted hover:bg-panel hover:text-rose-500" aria-label="Delete notification"><Trash2 size={14} /></button>
              </div>
            </div>;
          })}
        </div>
        <Link href="/dashboard?tab=notifications" onClick={() => setOpen(false)} className="block border-t border-line px-5 py-3 text-center text-xs font-bold text-royal hover:bg-canvas dark:text-blue-300">Open notification centre</Link>
      </div>}
    </div>
  );
}
