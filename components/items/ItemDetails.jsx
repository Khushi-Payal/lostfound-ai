'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, ChevronRight, Clock3, FileText,
  Heart, Info, Mail, MapPin, MessageCircle, PhoneOff, ShieldAlert, ShieldCheck,
  Sparkles, Tag, Trash2, UserRoundCheck, X,
} from 'lucide-react';
import { useAuth, useToast } from '../../context/AppContext';
import { apiFetch } from '../../utils/api';
import { formatDate, itemLocation } from '../../utils/format';
import PageHeading from '../ui/PageHeading';
import ItemArtwork from '../ui/ItemArtwork';
import MatchCard from '../ui/MatchCard';
import EmptyState from '../ui/EmptyState';
import { PageLoading } from '../ui/Loading';

function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return <div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-canvas text-muted"><Icon size={16} /></span><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-muted">{label}</p><p className="mt-0.5 break-words text-sm font-semibold text-copy">{value}</p></div></div>;
}

export default function ItemDetails() {
  const params = useParams();
  const itemId = params.id;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(null);
  const [savedBusy, setSavedBusy] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactBusy, setContactBusy] = useState(false);
  const [claimBusy, setClaimBusy] = useState(false);
  const [matchBusy, setMatchBusy] = useState(false);
  const [claim, setClaim] = useState({ itemDescription: '', uniqueDetails: '', proofDescription: '' });
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [candidateId, setCandidateId] = useState('');
  const [matchNote, setMatchNote] = useState('');

  const isOwner = Boolean(item?.isOwner);
  const canMessage = Boolean(!isOwner && item?.status === 'active');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await apiFetch(`/api/items/${itemId}`);
      setItem(data.item); setMatches(data.matches || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [itemId]);
  useEffect(() => { if (itemId) load(); }, [itemId, load]);

  const userId = user?.id;
  useEffect(() => {
    if (!userId || !itemId) { setSaved(null); return; }
    apiFetch('/api/saved').then((data) => setSaved((data.saved || []).find((entry) => entry.itemId === itemId) || null)).catch(() => setSaved(null));
  }, [userId, itemId]);

  const similarAlternatives = useMemo(() => matches.map((match) => match.item).filter(Boolean), [matches]);
  const requireLogin = (nextAction) => {
    if (!user) { toast('Sign in to use this feature. Your personal details remain private.', 'info'); router.push(`/login?next=${encodeURIComponent(`/items/${itemId}`)}`); return false; }
    if (nextAction) nextAction();
    return true;
  };
  const toggleSave = async () => {
    if (!requireLogin()) return;
    setSavedBusy(true);
    try {
      if (saved) { await apiFetch(`/api/saved/${saved.id}`, { method: 'DELETE' }); setSaved(null); toast('Removed from your saved items.', 'success'); }
      else { const data = await apiFetch('/api/saved', { method: 'POST', body: JSON.stringify({ itemId }) }); setSaved(data.saved); toast('Item saved to your dashboard.', 'success'); }
    } catch (err) { toast(err.message, 'error'); } finally { setSavedBusy(false); }
  };
  const sendContact = async (event) => {
    event.preventDefault(); if (!requireLogin()) return;
    setContactBusy(true);
    try { const data = await apiFetch(`/api/items/${itemId}/contact`, { method: 'POST', body: JSON.stringify({ message: contactMessage }) }); toast(data.message, 'success'); setContactMessage(''); setContactOpen(false); }
    catch (err) { toast(err.message, 'error'); } finally { setContactBusy(false); }
  };
  const sendClaim = async (event) => {
    event.preventDefault(); if (!requireLogin()) return;
    setClaimBusy(true);
    try {
      const data = await apiFetch('/api/claims', { method: 'POST', body: JSON.stringify({ ...claim, claimantName: user.name, itemId }) });
      setClaimSubmitted(true); toast(data.message, 'success');
    } catch (err) { toast(err.message, 'error'); } finally { setClaimBusy(false); }
  };
  const sendMatch = async (event) => {
    event.preventDefault(); if (!requireLogin()) return;
    setMatchBusy(true);
    try { const data = await apiFetch(`/api/items/${itemId}/match-report`, { method: 'POST', body: JSON.stringify({ candidateId, note: matchNote }) }); toast(data.message, 'success'); setMatchOpen(false); setMatchNote(''); }
    catch (err) { toast(err.message, 'error'); } finally { setMatchBusy(false); }
  };

  if (loading || authLoading) return <div className="page-container py-12"><PageLoading label="Loading report details…" /></div>;
  if (error || !item) return <div className="page-container py-16"><EmptyState title="We could not find this report" description={error || 'It may have been removed or the address may be incorrect.'} action="Browse reports" href="/browse" /><div className="mt-5 text-center"><Link href="/" className="text-xs font-bold text-royal dark:text-blue-300">Return home</Link></div></div>;

  return <div className="page-container py-10 sm:py-14">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><Link href="/browse" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-royal dark:hover:text-blue-300"><ArrowLeft size={16} /> Back to reports</Link><div className="flex items-center gap-2 text-[11px] text-muted"><span>Browse</span><ChevronRight size={13} /><span className="font-semibold text-copy">Report details</span></div></div>
    <div className="grid items-start gap-7 xl:grid-cols-[1.08fr_.92fr]">
      <div className="surface overflow-hidden rounded-[2rem] border border-line shadow-card">
        <div className="relative"><ItemArtwork item={item} className="h-[300px] sm:h-[430px]" /><span className={`absolute left-5 top-5 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider ${item.type === 'lost' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/90 dark:text-rose-200' : 'bg-teal-100 text-teal-800 dark:bg-teal-950/90 dark:text-teal-200'}`}>{item.type} item</span>{item.isDemo && <span className="absolute right-5 top-5 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-[10px] font-bold text-slate-600 backdrop-blur dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-200">Sample report</span>}</div>
        <div className="p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3"><span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-royal dark:bg-blue-950/60 dark:text-blue-300">{item.category}</span><span className={`rounded-full px-3 py-1.5 text-[10px] font-bold capitalize ${item.status === 'active' ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300' : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300'}`}>{item.status.replace('-', ' ')}</span></div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink dark:text-white sm:text-4xl">{item.name}</h1><p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted">{item.description}</p>
          <div className="mt-7 grid gap-5 border-t border-line pt-6 sm:grid-cols-2">
            <DetailRow icon={Tag} label="Brand" value={item.brand || 'Not specified'} />
            <DetailRow icon={Sparkles} label="Colour" value={item.color || 'Not specified'} />
            {item.marks && <DetailRow icon={Info} label="Identifying marks" value={item.marks} />}
            <DetailRow icon={MapPin} label="Approximate location" value={`${item.location} · ${itemLocation(item)}`} />
            <DetailRow icon={CalendarDays} label={item.type === 'lost' ? 'Lost date' : 'Found date'} value={formatDate(item.date)} />
            {item.time && <DetailRow icon={Clock3} label="Approximate time" value={item.time} />}
            <DetailRow icon={FileText} label="Report ID" value={item.reportId} />
            {item.secured && <DetailRow icon={ShieldCheck} label="Care status" value="Safely secured by the reporter" />}
          </div>
          {item.additionalInfo && <div className="mt-6 rounded-2xl bg-canvas p-4"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-muted">Additional information</p><p className="mt-2 whitespace-pre-line text-sm leading-6 text-copy">{item.additionalInfo}</p></div>}
          <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5"><button type="button" disabled={savedBusy || (!saved && item.status !== 'active')} onClick={toggleSave} className="btn-secondary !px-4 !py-2.5"><Heart size={15} className={saved ? 'fill-rose-500 text-rose-500' : ''} />{saved ? 'Saved' : item.status === 'active' ? 'Save item' : 'Report inactive'}</button>{isOwner ? <Link href="/dashboard" className="btn-secondary !px-4 !py-2.5">Manage your report <ArrowRight size={15} /></Link> : <><button type="button" onClick={() => { if (!requireLogin()) return; setMatchOpen((open) => !open); }} className="btn-secondary !px-4 !py-2.5"><Sparkles size={15} />Report a match</button><button type="button" disabled={!canMessage} onClick={() => { if (!requireLogin()) return; setContactOpen((open) => !open); }} className="btn-primary !px-4 !py-2.5"><MessageCircle size={15} />Contact reporter</button></>}</div>
          {!isOwner && item.type === 'found' && item.status === 'active' && <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50/70 p-4 dark:border-teal-900/50 dark:bg-teal-950/25"><div className="flex items-start justify-between gap-3"><div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-teal dark:bg-slate-900"><UserRoundCheck size={17} /></span><div><p className="text-sm font-bold text-teal-950 dark:text-teal-200">Think this may be yours?</p><p className="mt-1 text-xs leading-5 text-teal-900/75 dark:text-teal-200/70">Submit a private claim with details only the owner would know. Do not upload identity documents.</p></div></div><button type="button" onClick={() => { if (!requireLogin()) return; setClaimOpen((open) => !open); }} className="btn-secondary shrink-0 !border-teal-200 !px-3 !py-2 !text-xs dark:!border-teal-900">{claimOpen ? 'Close' : 'Start claim'}</button></div></div>}
        </div>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-28">
        <div className="surface rounded-3xl border border-line p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-royal dark:bg-blue-950 dark:text-blue-300"><Sparkles size={18} /></span><div><h2 className="text-lg font-bold text-copy">Potential matches</h2><p className="mt-1 text-xs leading-5 text-muted">Records ranked by similarity across item details, location and date.</p></div></div>
          <div className="mt-5 space-y-3">{matches.length ? matches.slice(0, 4).map((match) => <div key={match.item.id} className="space-y-2"><MatchCard match={match} /><button type="button" onClick={() => { if (!requireLogin()) return; setCandidateId(match.item.id); setMatchOpen(true); }} className="btn-ghost w-full justify-center !py-2 text-xs"><Sparkles size={13} /> Suggest this as a match</button></div>) : <div className="rounded-2xl border border-dashed border-line px-4 py-8 text-center"><p className="text-sm font-bold text-copy">No recommended matches yet</p><p className="mt-1 text-xs leading-5 text-muted">New community reports may surface a lead later.</p></div>}</div>
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-canvas p-3 text-[10px] leading-5 text-muted"><Info size={14} className="mt-0.5 shrink-0 text-teal" />Similarity scores are estimates, not verified AI predictions or proof of ownership.</p>
        </div>
        <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5 dark:border-amber-900/50 dark:bg-amber-950/20"><div className="flex gap-3"><ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-300" /><div><h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">Safe handover checklist</h3><ul className="mt-2 space-y-1.5 text-xs leading-5 text-amber-900/75 dark:text-amber-200/70"><li>• Verify unique details privately.</li><li>• Meet in a public, well-lit place.</li><li>• Never share passwords or pay a release fee.</li><li>• For IDs, contact the issuing authority.</li></ul></div></div></div>
      </aside>
    </div>

    {matchOpen && <div className="mt-7 scroll-mt-24"><div className="surface rounded-3xl border border-blue-200 p-5 shadow-card dark:border-blue-900 sm:p-7"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow">Help the right people connect</p><h2 className="mt-1 text-xl font-extrabold text-ink dark:text-white">Report a potential match</h2><p className="mt-2 text-xs leading-5 text-muted">Your suggestion is sent privately to the reporters. It does not change report status or verify ownership.</p></div><button type="button" onClick={() => setMatchOpen(false)} className="icon-button" aria-label="Close match suggestion"><X size={17} /></button></div>
      <form onSubmit={sendMatch} className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><div><label className="field-label" htmlFor="candidate-report">Possible matching report</label><select id="candidate-report" className="select" value={candidateId} onChange={(event) => setCandidateId(event.target.value)} required><option value="">Choose a report</option>{similarAlternatives.map((alternative) => <option key={alternative.id} value={alternative.id}>{alternative.reportId} · {alternative.name}</option>)}</select></div><div><label className="field-label" htmlFor="match-note">Helpful note (optional)</label><input id="match-note" className="input" value={matchNote} onChange={(event) => setMatchNote(event.target.value)} placeholder="A detail the owner can verify…" /></div><button disabled={matchBusy || !candidateId} className="btn-primary justify-center">{matchBusy ? 'Sending…' : 'Send suggestion'} <ArrowRight size={15} /></button></form>
    </div></div>}

    {contactOpen && <div className="mt-7"><div className="surface rounded-3xl border border-line p-5 shadow-card sm:p-7"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow">Private in-app message</p><h2 className="mt-1 text-xl font-extrabold text-ink dark:text-white">Contact the reporter safely</h2><p className="mt-2 text-xs leading-5 text-muted">Your email and phone number are not added to this message. The recipient is notified inside TraceIt.</p></div><button type="button" onClick={() => setContactOpen(false)} className="icon-button" aria-label="Close message form"><X size={17} /></button></div><form onSubmit={sendContact} className="mt-5"><label className="field-label" htmlFor="reporter-message">Your message</label><textarea id="reporter-message" required minLength={10} maxLength={1500} className="textarea" value={contactMessage} onChange={(event) => setContactMessage(event.target.value)} placeholder="Share why you are reaching out, without including passwords or sensitive personal information…" /><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p className="text-[10px] text-muted">{contactMessage.length}/1500 characters</p><button disabled={contactBusy} className="btn-primary">{contactBusy ? 'Sending securely…' : 'Send secure message'} <Mail size={15} /></button></div></form></div></div>}

    {claimOpen && <div className="mt-7"><div className="surface rounded-3xl border border-teal-200 p-5 shadow-card dark:border-teal-900/60 sm:p-7"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow">Private ownership claim</p><h2 className="mt-1 text-xl font-extrabold text-ink dark:text-white">Tell us why this is yours</h2><p className="mt-2 text-xs leading-5 text-muted">The found-item reporter reviews these details. TraceIt never asks you to attach an ID or disclose a full identity number.</p></div><button type="button" onClick={() => setClaimOpen(false)} className="icon-button" aria-label="Close ownership claim"><X size={17} /></button></div>
      {claimSubmitted ? <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 p-5 dark:border-teal-900/50 dark:bg-teal-950/30"><div className="flex gap-3"><CheckCircle2 size={20} className="text-teal" /><div><p className="font-bold text-teal-950 dark:text-teal-200">Your claim is now pending review.</p><p className="mt-1 text-xs leading-5 text-teal-900/75 dark:text-teal-200/70">You can follow its status in your dashboard. The found-item reporter may contact you through TraceIt.</p></div></div><Link href="/dashboard" className="btn-secondary mt-4 !border-teal-200 !py-2 !text-xs dark:!border-teal-900">View my claims <ArrowRight size={14} /></Link></div> : <form onSubmit={sendClaim} className="mt-5 grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><label className="field-label" htmlFor="claim-description">Describe your item<span className="ml-1 text-rose-500">*</span></label><textarea id="claim-description" minLength={10} required className="textarea !min-h-[90px]" value={claim.itemDescription} onChange={(event) => setClaim((value) => ({ ...value, itemDescription: event.target.value }))} placeholder="Tell us what the item looks like and what it means to you…" /></div><div><label className="field-label" htmlFor="claim-unique">Unique identifying details<span className="ml-1 text-rose-500">*</span></label><textarea id="claim-unique" minLength={8} required className="textarea !min-h-[100px]" value={claim.uniqueDetails} onChange={(event) => setClaim((value) => ({ ...value, uniqueDetails: event.target.value }))} placeholder="Include something not visible in the public listing." /></div><div><label className="field-label" htmlFor="claim-proof">Additional proof description<span className="ml-1 text-rose-500">*</span></label><textarea id="claim-proof" minLength={8} required className="textarea !min-h-[100px]" value={claim.proofDescription} onChange={(event) => setClaim((value) => ({ ...value, proofDescription: event.target.value }))} placeholder="Describe a receipt, serial number, or other proof. Do not upload or post sensitive numbers here." /></div><div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-canvas p-4"><p className="max-w-xl text-[10px] leading-5 text-muted"><strong className="text-copy">Safety:</strong> Never submit passwords, bank information or complete identity numbers. Meet in a public place to verify ownership.</p><button disabled={claimBusy} className="btn-primary">{claimBusy ? 'Submitting…' : 'Submit private claim'} <ArrowRight size={15} /></button></div></form>}
    </div></div>}

    <div className="mt-6 flex items-center gap-2 rounded-2xl border border-line bg-panel px-4 py-3 text-[10px] text-muted"><PhoneOff size={14} className="shrink-0 text-teal" />TraceIt does not publish reporter phone numbers. Use the secure in-app contact and claim features.</div>
  </div>;
}
