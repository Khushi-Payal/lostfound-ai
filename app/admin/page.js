import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminClient from '../../components/dashboard/AdminClient';
import { SESSION_COOKIE, verifySessionToken } from '../../lib/auth';
import { findRecord } from '../../lib/storage';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin Console' };

export default async function AdminPage() {
  const store = await cookies();
  const session = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  const user = session?.sub ? await findRecord('users', session.sub) : null;
  if (!user) redirect('/login?next=%2Fadmin');
  if (user.role !== 'admin') redirect('/dashboard');
  return <AdminClient />;
}
