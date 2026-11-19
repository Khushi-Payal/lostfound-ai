import { Suspense } from 'react';
import { ResetPasswordForm } from '../../components/forms/AuthForms';
import { PageLoading } from '../../components/ui/Loading';
export const metadata = { title: 'Choose a New Password' };
export default function ResetPasswordPage() { return <Suspense fallback={<PageLoading />}><ResetPasswordForm /></Suspense>; }
