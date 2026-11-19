import Link from 'next/link';
import { ArrowUpRight, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import Logo from './Logo';

const quickLinks = [
  ['Browse reports', '/browse'], ['Report something lost', '/report/lost'], ['Report something found', '/report/found'], ['How it works', '/how-it-works'],
];
const supportLinks = [['About TraceIt', '/about'], ['Contact support', '/contact'], ['Privacy & safety', '/about#privacy'], ['Terms of use', '/about#terms']];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-[#0b1830] text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.35fr_.8fr_.8fr_1fr] lg:px-8">
        <div>
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300/80">A safer, smarter way to reunite people across India with the belongings that matter. Lost Somewhere? Found Together.</p>
          <div className="mt-6 flex gap-2">
            {[Facebook, Instagram, Linkedin].map((Icon, index) => <a key={index} href={['https://www.facebook.com/', 'https://www.instagram.com/', 'https://www.linkedin.com/'][index]} aria-label={['Facebook', 'Instagram', 'LinkedIn'][index]} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-300 transition hover:border-blue-300/40 hover:bg-white/10 hover:text-white"><Icon size={16} /></a>)}
          </div>
        </div>
        <div><h3 className="mb-4 text-sm font-bold">Explore</h3><ul className="space-y-3">{quickLinks.map(([label, href]) => <li key={href}><Link className="text-sm text-slate-300/75 transition hover:text-white" href={href}>{label}</Link></li>)}</ul></div>
        <div><h3 className="mb-4 text-sm font-bold">Help & support</h3><ul className="space-y-3">{supportLinks.map(([label, href]) => <li key={href}><Link className="text-sm text-slate-300/75 transition hover:text-white" href={href}>{label}</Link></li>)}</ul></div>
        <div><h3 className="mb-4 text-sm font-bold">Get in touch</h3><div className="space-y-3 text-sm text-slate-300/75"><a className="flex items-center gap-2 hover:text-white" href="mailto:khushipayal2720@gmail.com"><Mail size={15} /> khushipayal2720@gmail.com</a><span className="flex items-center gap-2"><Phone size={15} /> 1800-TRACEIT (demo)</span><span className="flex items-center gap-2"><MapPin size={15} /> Serving communities across India</span></div><Link href="/contact" className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-blue-300 hover:text-white">Contact the team <ArrowUpRight size={13} /></Link></div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} TraceIt. A community-powered public-service demo.</p>
          <p className="inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-teal-300" /> Your private details are never shown on public listings.</p>
        </div>
      </div>
    </footer>
  );
}
