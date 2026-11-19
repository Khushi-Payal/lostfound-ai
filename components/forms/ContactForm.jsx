'use client';

import { useState } from 'react';
import { CheckCircle2, Mail, MessageSquareText, Phone, Send } from 'lucide-react';
import { useToast } from '../../context/AppContext';
import { apiFetch } from '../../utils/api';

export default function ContactForm() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try { const data = await apiFetch('/api/contact', { method: 'POST', body: JSON.stringify(form) }); setSuccess(true); setForm({ name: '', email: '', subject: '', message: '' }); toast(data.message, 'success'); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <div className="surface rounded-3xl border border-line p-5 shadow-card sm:p-8">
    {success ? <div className="flex min-h-[420px] flex-col items-center justify-center text-center"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal dark:bg-teal-950 dark:text-teal-300"><CheckCircle2 size={26} /></span><h2 className="mt-4 text-2xl font-extrabold text-ink dark:text-white">Thanks for reaching out.</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted">Your message is safely recorded. Our support team will review it.</p><button type="button" onClick={() => setSuccess(false)} className="btn-secondary mt-6">Send another message</button></div> : <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2"><div><label className="field-label" htmlFor="contact-name">Name<span className="ml-1 text-rose-500">*</span></label><input id="contact-name" autoComplete="name" required minLength={2} maxLength={100} className="input" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Your name" /></div><div><label className="field-label" htmlFor="contact-email">Email address<span className="ml-1 text-rose-500">*</span></label><input id="contact-email" type="email" autoComplete="email" required className="input" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@example.com" /></div></div>
      <div><label className="field-label" htmlFor="contact-subject">Subject<span className="ml-1 text-rose-500">*</span></label><input id="contact-subject" required minLength={3} maxLength={160} className="input" value={form.subject} onChange={(event) => update('subject', event.target.value)} placeholder="How can we help?" /></div>
      <div><label className="field-label" htmlFor="contact-message">Message<span className="ml-1 text-rose-500">*</span></label><textarea id="contact-message" required minLength={15} maxLength={4000} className="textarea min-h-[180px]" value={form.message} onChange={(event) => update('message', event.target.value)} placeholder="Share enough detail for our support team to help…" /><p className="field-hint">{form.message.length}/4000 characters · Please do not include passwords or full ID numbers.</p></div>
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      <button disabled={busy} type="submit" className="btn-primary w-full justify-center sm:w-auto">{busy ? 'Sending securely…' : 'Send message'} <Send size={15} /></button>
    </form>}
  </div>;
}
