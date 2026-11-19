'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronDown, LayoutDashboard, UserRound, LogOut, ShieldCheck } from 'lucide-react';
import Logo from './Logo';
import NotificationBell from './ui/NotificationBell';
import ThemeToggle from './ui/ThemeToggle';
import { useAuth, useToast } from '../context/AppContext';

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/browse', label: 'Browse items' },
  { href: '/report/lost', label: 'Report lost' },
  { href: '/report/found', label: 'Report found' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

function NavLink({ item, pathname, onClick }) {
  const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
  return <Link href={item.href} onClick={onClick} className={`whitespace-nowrap text-[13px] font-semibold transition ${active ? 'text-royal dark:text-blue-300' : 'text-slate-600 hover:text-royal dark:text-slate-300 dark:hover:text-blue-300'}`}>{item.label}</Link>;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);
  const doLogout = async () => {
    await logout();
    setProfileOpen(false);
    closeMobile();
    toast('You have been signed out safely.', 'success');
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-panel/95 shadow-[0_2px_16px_rgba(16,35,63,.035)] backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-[1440px] items-center gap-5 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden flex-1 items-center justify-center gap-5 xl:flex" aria-label="Main navigation">
          {publicLinks.map((item) => <NavLink key={item.href} item={item} pathname={pathname} />)}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          {user && <NotificationBell />}
          {user ? <div className="relative hidden sm:block">
            <button type="button" onClick={() => setProfileOpen((open) => !open)} className="ml-1 inline-flex items-center gap-2 rounded-2xl border border-line px-2 py-1.5 text-left transition hover:bg-canvas" aria-expanded={profileOpen}>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-royal to-blue-400 text-xs font-extrabold text-white">{user.name?.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span>
              <span className="hidden max-w-[90px] truncate text-xs font-bold text-copy md:block">{user.name?.split(' ')[0]}</span><ChevronDown size={14} className="text-muted" />
            </button>
            {profileOpen && <>
              <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close profile menu" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 rounded-2xl border border-line bg-panel p-2 shadow-soft animate-fade-up">
                <div className="border-b border-line px-3 py-2"><p className="truncate text-sm font-bold text-copy">{user.name}</p><p className="truncate text-xs text-muted">{user.email}</p></div>
                <Link href="/dashboard" onClick={() => setProfileOpen(false)} className="menu-item"><LayoutDashboard size={16} /> Dashboard</Link>
                <Link href="/dashboard?tab=profile" onClick={() => setProfileOpen(false)} className="menu-item"><UserRound size={16} /> Profile settings</Link>
                {user.role === 'admin' && <Link href="/admin" onClick={() => setProfileOpen(false)} className="menu-item"><ShieldCheck size={16} /> Admin console</Link>}
                <button type="button" onClick={doLogout} className="menu-item w-full text-rose-600 dark:text-rose-300"><LogOut size={16} /> Sign out</button>
              </div>
            </>}
          </div> : <div className="hidden items-center gap-2 sm:flex">
            <Link href="/login" className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:text-royal dark:text-slate-300">Sign in</Link>
            <Link href="/signup" className="btn-primary !rounded-xl !px-4 !py-2.5 !text-xs">Create account</Link>
          </div>}
          <button type="button" className="icon-button xl:hidden" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen}>{mobileOpen ? <X size={19} /> : <Menu size={19} />}</button>
        </div>
      </div>
      {mobileOpen && <div className="border-t border-line bg-panel px-4 pb-5 pt-3 xl:hidden animate-fade-up">
        <nav className="grid gap-1" aria-label="Mobile navigation">
          {publicLinks.map((item) => <div key={item.href} className="rounded-xl px-3 py-2.5"><NavLink item={item} pathname={pathname} onClick={closeMobile} /></div>)}
        </nav>
        {user ? <div className="mt-4 border-t border-line pt-4">
          <div className="mb-3 flex items-center gap-3 px-2"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 font-bold text-royal dark:bg-blue-950 dark:text-blue-200">{user.name?.slice(0, 1).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-bold text-copy">{user.name}</p><p className="truncate text-xs text-muted">{user.email}</p></div></div>
          <Link href="/dashboard" onClick={closeMobile} className="menu-item"><LayoutDashboard size={16} /> Dashboard</Link>
          <Link href="/dashboard?tab=profile" onClick={closeMobile} className="menu-item"><UserRound size={16} /> Profile settings</Link>
          {user.role === 'admin' && <Link href="/admin" onClick={closeMobile} className="menu-item"><ShieldCheck size={16} /> Admin console</Link>}
          <button type="button" onClick={doLogout} className="menu-item w-full text-rose-600 dark:text-rose-300"><LogOut size={16} /> Sign out</button>
        </div> : <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4"><Link href="/login" onClick={closeMobile} className="btn-secondary justify-center">Sign in</Link><Link href="/signup" onClick={closeMobile} className="btn-primary justify-center">Create account</Link></div>}
      </div>}
    </header>
  );
}
