import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { findUserByEmail, isDemoMode } from '../../../../lib/storage';
import { createSessionToken, sessionCookieOptions } from '../../../../lib/auth';
import { jsonError, readJson } from '../../../../lib/api-response';
import { safeUser } from '../../../../lib/safe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await readJson(request);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!email || !password) {
      const error = new Error('Enter your email and password.');
      error.status = 400;
      throw error;
    }
    const user = await findUserByEmail(email, { includeSecrets: true });
    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      const error = new Error('The email or password you entered is incorrect.');
      error.status = 401;
      throw error;
    }
    const response = NextResponse.json({ user: safeUser(user), demoMode: isDemoMode() });
    response.cookies.set('traceit_session', createSessionToken(user), sessionCookieOptions());
    return response;
  } catch (error) {
    return jsonError(error, 'Unable to sign in.');
  }
}
