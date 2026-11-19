import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { hashResetToken } from '../../../../lib/auth';
import { findUserByEmail, updateUserByEmail } from '../../../../lib/storage';
import { jsonError, readJson } from '../../../../lib/api-response';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const resetSchema = z.object({
  email: z.string().trim().email(),
  token: z.string().trim().min(4),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(100),
});

export async function POST(request) {
  try {
    const parsed = resetSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || 'Please check the form.');
      error.status = 400;
      throw error;
    }
    const { email, token, password } = parsed.data;
    const user = await findUserByEmail(email, { includeSecrets: true });
    const expires = user?.resetTokenExpires ? new Date(user.resetTokenExpires).getTime() : 0;
    if (!user?.resetTokenHash || user.resetTokenHash !== hashResetToken(token) || expires < Date.now()) {
      const error = new Error('That reset code is invalid or has expired. Request a new code and try again.');
      error.status = 400;
      throw error;
    }
    await updateUserByEmail(email, {
      passwordHash: await bcrypt.hash(password, 12), resetTokenHash: '', resetTokenExpires: null,
    });
    return NextResponse.json({ ok: true, message: 'Your password has been updated. You can sign in now.' });
  } catch (error) {
    return jsonError(error, 'Unable to reset your password.');
  }
}
