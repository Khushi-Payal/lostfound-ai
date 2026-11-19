'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound, ArrowRight, FlaskConical, KeyRound, Sparkles } from 'lucide-react';
import { useAuth, useToast } from '../../context/AppContext';
import { DEMO_CREDENTIALS } from '../../lib/constants';
import { apiFetch } from '../../utils/api';
import { StateCityFields } from './StateCityFields';
import ThemeToggle from '../ui/ThemeToggle';

function AuthLayout({ eyebrow, title, description, children, asideTitle = 'A little peace of mind goes a long way.', asideCopy = 'Your reports stay yours. Your private contact details are never shown on a public listing.' }) {
  return (
    <div className="page-container grid min-h-[760px] items-center gap-10 py-12 lg:grid-cols-[1fr_.9fr] lg:py-16">
      <section className="mx-auto w-full max-w-[480px]">
        <div className="mb-7 flex items-center justify-between"><Link href="/" className="text-sm font-bold text-royal dark:text-blue-300">← Back to TraceIt</Link><ThemeToggle /></div>
        <div className="surface rounded-[2rem] border border-line p-6 shadow-soft sm:p-9">
          <p className="eyebrow">{eyebrow}</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink dark:text-white">{title}</h1><p className="mt-3 text-sm leading-6 text-muted">{description}</p>
          <div className="mt-7">{children}</div>
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted"><ShieldCheck size={14} className="text-teal" />Secure session · Protected by an HTTP-only cookie</div>
      </section>
      <aside className="relative hidden min-h-[540px] overflow-hidden rounded-[2.4rem] bg-gradient-to-br from-[#142f63] via-[#254f9f] to-[#159386] p-10 text-white shadow-soft lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-16 -top-10 h-80 w-80 rounded-full border border-white/15 bg-white/5" /><div className="absolute -bottom-20 -left-16 h-80 w-80 rounded-full border border-white/10" />
        <div className="relative"><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold"><Sparkles size={14} /> The TraceIt community</span><h2 className="mt-8 max-w-md text-4xl font-extrabold leading-tight">{asideTitle}</h2><p className="mt-4 max-w-sm text-sm leading-7 text-blue-50/80">{asideCopy}</p></div>
        <div className="relative rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15"><LockKeyhole size={20} /></span><div><p className="text-sm font-bold">Your details are protected</p><p className="mt-1 text-xs text-blue-100/75">Only you can manage your reports.</p></div></div><p className="mt-4 border-t border-white/15 pt-4 text-[11px] leading-5 text-blue-100/75">TraceIt uses an explainable similarity engine. Matches are helpful leads—not verified identity or ownership decisions.</p></div>
      </aside>
    </div>
  );
}

function PasswordField({ label = 'Password', value, onChange, name = 'password', autoComplete = 'current-password', error, hint }) {
  const [visible, setVisible] = useState(false);
  return <div><label className="field-label" htmlFor={name}>{label}</label><div className="relative"><LockKeyhole size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><input id={name} name={name} type={visible ? 'text' : 'password'} autoComplete={autoComplete} value={value} onChange={onChange} className="input !pl-10 !pr-11" required /><button type="button" onClick={() => setVisible((show) => !show)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted hover:text-copy" aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{hint && !error && <p className="field-hint">{hint}</p>}{error && <p className="field-error">{error}</p>}</div>;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const destination = searchParams.get('next');
  const safeDestination = destination?.startsWith('/') && !destination.startsWith('//') ? destination : '/dashboard';

  const useDemo = () => { setEmail(DEMO_CREDENTIALS.user.email); setPassword(DEMO_CREDENTIALS.user.password); };
  const useAdmin = () => { setEmail(DEMO_CREDENTIALS.admin.email); setPassword(DEMO_CREDENTIALS.admin.password); };
  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const data = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      login(data.user, data.demoMode); toast(`Welcome back, ${data.user.name.split(' ')[0]}.`, 'success'); router.push(safeDestination);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return <AuthLayout eyebrow="Welcome back" title="Sign in to TraceIt" description="Pick up where you left off and keep your search moving.">
    <form onSubmit={submit} className="space-y-5">
      <div><label className="field-label" htmlFor="login-email">Email address</label><div className="relative"><Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><input id="login-email" type="email" autoComplete="email" required className="input !pl-10" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div></div>
      <div><div className="mb-1.5 flex items-center justify-between"><label className="field-label !mb-0" htmlFor="password">Password</label><Link href="/forgot-password" className="text-xs font-bold text-royal hover:underline dark:text-blue-300">Forgot password?</Link></div><div className="relative"><LockKeyhole size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required className="input !pl-10 !pr-11" value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" onClick={() => setShowPassword((show) => !show)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted hover:text-copy" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      <button disabled={busy} type="submit" className="btn-primary w-full justify-center !py-3.5">{busy ? 'Signing you in…' : 'Sign in'} {!busy && <ArrowRight size={16} />}</button>
    </form>
    <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-line" /><span className="text-[10px] font-semibold uppercase tracking-[.16em] text-muted">presentation demo</span><span className="h-px flex-1 bg-line" /></div>
    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/30">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200"><FlaskConical size={14} /> Demo access</div>
      <div className="grid gap-2 sm:grid-cols-2"><button type="button" onClick={useDemo} className="rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:border-blue-300 dark:border-blue-900/70 dark:bg-slate-900 dark:text-slate-200"><span className="block text-[10px] font-bold uppercase tracking-wide text-muted">Community account</span><span className="mt-1 block">demo@traceit.in</span></button><button type="button" onClick={useAdmin} className="rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:border-blue-300 dark:border-blue-900/70 dark:bg-slate-900 dark:text-slate-200"><span className="block text-[10px] font-bold uppercase tracking-wide text-muted">Admin demo</span><span className="mt-1 block">admin@traceit.in</span></button></div>
      <p className="mt-2 text-[10px] text-blue-900/70 dark:text-blue-200/70">Use password <code className="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-900/60">Demo123!</code> for community, <code className="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-900/60">Admin123!</code> for admin.</p>
    </div>
    <p className="mt-6 text-center text-sm text-muted">New to TraceIt? <Link href="/signup" className="font-bold text-royal hover:underline dark:text-blue-300">Create an account</Link></p>
  </AuthLayout>;
}

export function SignupForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '+91 ', password: '', confirmPassword: '', state: '', city: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setBusy(true);
    try {
      const { confirmPassword, ...payload } = form;
      const data = await apiFetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) });
      login(data.user, data.demoMode); toast('Your TraceIt account is ready.', 'success'); router.push('/dashboard');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <AuthLayout eyebrow="Join the community" title="Create your account" description="One secure account for your reports, matches and saved items." asideTitle="Every helping hand makes a difference." asideCopy="Join neighbours across India in making lost-and-found recovery a little easier and more human.">
    <form onSubmit={submit} className="space-y-4">
      <div><label className="field-label" htmlFor="full-name">Full name</label><div className="relative"><UserRound size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><input id="full-name" autoComplete="name" required minLength={2} className="input !pl-10" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Your full name" /></div></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><label className="field-label" htmlFor="signup-email">Email address</label><input id="signup-email" type="email" autoComplete="email" required className="input" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="you@example.com" /></div><div><label className="field-label" htmlFor="signup-phone">Mobile number</label><input id="signup-phone" type="tel" autoComplete="tel" required minLength={7} className="input" value={form.phone} onChange={(event) => update('phone', event.target.value)} /></div></div>
      <StateCityFields state={form.state} city={form.city} onStateChange={(value) => update('state', value)} onCityChange={(value) => update('city', value)} />
      <div className="grid gap-4 sm:grid-cols-2"><div><label className="field-label" htmlFor="signup-password">Password</label><div className="relative"><input id="signup-password" type={show ? 'text' : 'password'} autoComplete="new-password" required minLength={8} className="input !pr-10" value={form.password} onChange={(event) => update('password', event.target.value)} /><button type="button" onClick={() => setShow((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-copy" aria-label="Toggle password visibility">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div><div><label className="field-label" htmlFor="signup-confirm">Confirm password</label><input id="signup-confirm" type={show ? 'text' : 'password'} autoComplete="new-password" required className="input" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} /></div></div>
      <p className="field-hint">At least 8 characters. Your password is hashed before storage.</p>
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      <button disabled={busy} type="submit" className="btn-primary w-full justify-center !py-3.5">{busy ? 'Creating account…' : 'Create account'} <ArrowRight size={16} /></button>
      <p className="text-center text-[10px] leading-5 text-muted">By continuing, you agree to use TraceIt responsibly. Never post sensitive ID numbers or financial details.</p>
    </form>
    <p className="mt-5 text-center text-sm text-muted">Already have an account? <Link href="/login" className="font-bold text-royal hover:underline dark:text-blue-300">Sign in</Link></p>
  </AuthLayout>;
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    try { setResult(await apiFetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <AuthLayout eyebrow="Account recovery" title="Reset your password" description="We'll help you get back into your TraceIt account." asideTitle="A secure reset, without the guesswork." asideCopy="In this local demo, a one-time reset code is shown on screen instead of being emailed. It expires after 15 minutes.">
    {!result ? <form onSubmit={submit} className="space-y-5"><div><label className="field-label" htmlFor="reset-email">Account email</label><input id="reset-email" type="email" required className="input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div>{error && <p className="field-error">{error}</p>}<button disabled={busy} className="btn-primary w-full justify-center">{busy ? 'Preparing reset…' : 'Generate reset code'} <KeyRound size={16} /></button></form> : <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 dark:border-teal-900/60 dark:bg-teal-950/30"><div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-teal dark:bg-slate-900"><ShieldCheck size={19} /></div><h2 className="mt-3 font-bold text-copy">{result.message}</h2>{result.demoResetToken && <><p className="mt-2 text-sm text-muted">Demo reset code</p><code className="mt-2 block select-all rounded-xl bg-white px-4 py-3 text-center text-xl font-extrabold tracking-[.25em] text-ink dark:bg-slate-900 dark:text-white">{result.demoResetToken}</code><Link href={`/reset-password?email=${encodeURIComponent(email)}&token=${result.demoResetToken}`} className="btn-primary mt-4 w-full justify-center">Continue to reset <ArrowRight size={15} /></Link></>}{!result.demoResetToken && <Link href="/login" className="btn-primary mt-4 w-full justify-center">Return to sign in</Link>}</div>}
    <p className="mt-6 text-center text-sm text-muted"><Link href="/login" className="font-bold text-royal hover:underline dark:text-blue-300">Back to sign in</Link></p>
  </AuthLayout>;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [token, setToken] = useState(params.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setError(''); setSuccess('');
    if (password !== confirm) return setError('Passwords do not match.');
    setBusy(true);
    try { const data = await apiFetch('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, token, password }) }); setSuccess(data.message); window.setTimeout(() => router.push('/login'), 1200); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <AuthLayout eyebrow="Choose a new password" title="Finish your reset" description="Use your reset code and choose a password you have not used before." asideTitle="This reset link is short-lived." asideCopy="Reset codes expire after 15 minutes and can be used once. If the code no longer works, request a new one.">
    <form onSubmit={submit} className="space-y-4"><div><label className="field-label" htmlFor="reset-email-value">Email address</label><input id="reset-email-value" type="email" required className="input" value={email} onChange={(event) => setEmail(event.target.value)} /></div><div><label className="field-label" htmlFor="reset-token">Reset code</label><input id="reset-token" required className="input uppercase tracking-[.2em]" value={token} onChange={(event) => setToken(event.target.value.toUpperCase())} /></div><PasswordField label="New password" name="new-password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" /><PasswordField label="Confirm new password" name="confirm-new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" />{error && <p className="field-error">{error}</p>}{success && <p className="rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-800 dark:bg-teal-950/50 dark:text-teal-200">{success}</p>}<button disabled={busy} className="btn-primary w-full justify-center">{busy ? 'Updating…' : 'Update password'} <LockKeyhole size={16} /></button></form>
  </AuthLayout>;
}
