import { Suspense } from 'react';
import { LoginForm } from '../../components/forms/AuthForms';
import { PageLoading } from '../../components/ui/Loading';
export const metadata = { title: 'Sign In' };
export default function LoginPage() { return <Suspense fallback={<PageLoading />}><LoginForm /></Suspense>; }
