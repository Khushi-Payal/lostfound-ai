import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';
import { isDemoMode } from '../../../../lib/storage';
import { jsonError } from '../../../../lib/api-response';
import { safeUser } from '../../../../lib/safe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    return NextResponse.json({ user: safeUser(user), demoMode: isDemoMode() });
  } catch (error) {
    return jsonError(error, 'Unable to check your session.');
  }
}
