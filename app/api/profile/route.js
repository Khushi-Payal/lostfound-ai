import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '../../../lib/auth';
import { findUserByEmail, updateUserByEmail } from '../../../lib/storage';
import { jsonError, readJson, requireUser } from '../../../lib/api-response';
import { safeUser } from '../../../lib/safe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const profileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().min(7).max(24).optional(),
  state: z.string().trim().min(1).max(80).optional(),
  city: z.string().trim().min(1).max(80).optional(),
  notificationPreferences: z.object({
    matches: z.boolean().optional(), claims: z.boolean().optional(), updates: z.boolean().optional(),
  }).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.').max(100).optional(),
}).strict();

export async function GET(request) {
  try {
    const user = requireUser(await getCurrentUser(request));
    return NextResponse.json({ user: safeUser(user) });
  } catch (error) {
    return jsonError(error, 'Unable to load profile.');
  }
}

export async function PUT(request) {
  try {
    const user = requireUser(await getCurrentUser(request));
    const parsed = profileSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || 'Please check your profile.');
      error.status = 400;
      throw error;
    }
    const { currentPassword, newPassword, ...profileFields } = parsed.data;
    const patch = { ...profileFields };
    if (newPassword) {
      if (!currentPassword) {
        const error = new Error('Enter your current password before choosing a new one.');
        error.status = 400;
        throw error;
      }
      const fullUser = await findUserByEmail(user.email, { includeSecrets: true });
      if (!fullUser?.passwordHash || !(await bcrypt.compare(currentPassword, fullUser.passwordHash))) {
        const error = new Error('Your current password is incorrect.');
        error.status = 400;
        throw error;
      }
      patch.passwordHash = await bcrypt.hash(newPassword, 12);
    }
    const updated = await updateUserByEmail(user.email, patch);
    return NextResponse.json({ user: safeUser(updated), message: 'Your profile was updated.' });
  } catch (error) {
    return jsonError(error, 'Unable to update your profile.');
  }
}
