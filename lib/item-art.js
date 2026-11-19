import {
  BadgeCheck, BookOpen, BriefcaseBusiness, CreditCard, FileText, KeyRound,
  Laptop, Smartphone, Watch, Gem, Shirt, Package, Wallet,
} from 'lucide-react';

export const ARTWORK = {
  'Mobile Phones': { Icon: Smartphone, tone: 'from-blue-100 via-sky-50 to-cyan-100 dark:from-blue-950 dark:via-slate-900 dark:to-cyan-950', label: 'A device, ready to return home' },
  'Laptops & Electronics': { Icon: Laptop, tone: 'from-indigo-100 via-blue-50 to-slate-100 dark:from-indigo-950 dark:via-slate-900 dark:to-blue-950', label: 'Electronics and accessories' },
  'Wallets & Purses': { Icon: Wallet, tone: 'from-amber-100 via-orange-50 to-yellow-100 dark:from-amber-950 dark:via-slate-900 dark:to-orange-950', label: 'Wallets and personal items' },
  'Identity Cards': { Icon: CreditCard, tone: 'from-teal-100 via-emerald-50 to-cyan-100 dark:from-teal-950 dark:via-slate-900 dark:to-emerald-950', label: 'Personal identification' },
  Documents: { Icon: FileText, tone: 'from-sky-100 via-cyan-50 to-blue-100 dark:from-sky-950 dark:via-slate-900 dark:to-blue-950', label: 'Documents and folders' },
  Jewellery: { Icon: Gem, tone: 'from-rose-100 via-pink-50 to-orange-100 dark:from-rose-950 dark:via-slate-900 dark:to-pink-950', label: 'Jewellery and keepsakes' },
  'Bags & Luggage': { Icon: BriefcaseBusiness, tone: 'from-violet-100 via-indigo-50 to-blue-100 dark:from-violet-950 dark:via-slate-900 dark:to-indigo-950', label: 'Bags and luggage' },
  Clothing: { Icon: Shirt, tone: 'from-fuchsia-100 via-pink-50 to-purple-100 dark:from-fuchsia-950 dark:via-slate-900 dark:to-purple-950', label: 'Clothing and accessories' },
  Keys: { Icon: KeyRound, tone: 'from-lime-100 via-emerald-50 to-teal-100 dark:from-lime-950 dark:via-slate-900 dark:to-teal-950', label: 'Keys and small essentials' },
  Books: { Icon: BookOpen, tone: 'from-orange-100 via-amber-50 to-yellow-100 dark:from-orange-950 dark:via-slate-900 dark:to-amber-950', label: 'Books and notebooks' },
  Other: { Icon: Watch, tone: 'from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950', label: 'Personal belongings' },
};

export function getArtwork(category) {
  return ARTWORK[category] || { Icon: Package, tone: 'from-slate-100 to-blue-100 dark:from-slate-900 dark:to-blue-950', label: 'Personal belonging' };
}
