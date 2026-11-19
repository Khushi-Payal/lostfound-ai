import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from '../../components/dashboard/DashboardClient';
import { SESSION_COOKIE, verifySessionToken } from '../../lib/auth';
import { findRecord } from '../../lib/storage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'My Dashboard' };

export default async function DashboardPage() {
  const store = await cookies();
  const session = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  const user = session?.sub ? await findRecord('users', session.sub) : null;
  if (!user) redirect('/login?next=%2Fdashboard');
  return <DashboardClient />;
}
