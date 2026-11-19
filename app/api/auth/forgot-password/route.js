import { NextResponse } from 'next/server';
import { createResetToken, hashResetToken } from '../../../../lib/auth';
import { findUserByEmail, isDemoMode, updateUserByEmail } from '../../../../lib/storage';
import { jsonError, readJson } from '../../../../lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await readJson(request);
    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      const error = new Error('Enter a valid email address.');
      error.status = 400;
      throw error;
    }
    const user = await findUserByEmail(email);
    const result = { ok: true, message: 'If an account exists, password reset instructions are ready.' };
    if (user) {
      const token = createResetToken();
      await updateUserByEmail(email, {
        resetTokenHash: hashResetToken(token),
        resetTokenExpires: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      });
      if (isDemoMode()) {
        result.demoResetToken = token;
        result.message = 'Demo reset code generated. It expires in 15 minutes.';
      } else {
        result.message = 'Email delivery is not configured. Contact your TraceIt administrator to reset this account.';
      }
    }
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error, 'Unable to start password reset.');
  }
}
