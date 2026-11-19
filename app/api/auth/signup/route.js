import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { signupSchema } from '../../../../lib/validators';
import { createRecord, findUserByEmail, isDemoMode } from '../../../../lib/storage';
import { createSessionToken, sessionCookieOptions } from '../../../../lib/auth';
import { jsonError, readJson } from '../../../../lib/api-response';
import { safeUser } from '../../../../lib/safe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await readJson(request);
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || 'Please check the form.');
      error.status = 400;
      throw error;
    }
    const data = parsed.data;
    const email = data.email.toLowerCase();
    if (await findUserByEmail(email)) {
      const error = new Error('An account with this email already exists. Sign in instead.');
      error.status = 409;
      throw error;
    }
    const passwordHash = await bcrypt.hash(data.password, 12);
    let user;
    try {
      user = await createRecord('users', {
        name: data.name, email, phone: data.phone, passwordHash,
        state: data.state, city: data.city, role: 'user',
        notificationPreferences: { matches: true, claims: true, updates: true },
      });
    } catch (error) {
      if (error.code === 11000) {
        const duplicate = new Error('An account with this email already exists. Sign in instead.');
        duplicate.status = 409;
        throw duplicate;
      }
      throw error;
    }
    const response = NextResponse.json({ user: safeUser(user), demoMode: isDemoMode() }, { status: 201 });
    response.cookies.set('traceit_session', createSessionToken(user), sessionCookieOptions());
    return response;
  } catch (error) {
    return jsonError(error, 'Unable to create your account.');
  }
}
