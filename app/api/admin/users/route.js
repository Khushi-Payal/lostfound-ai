import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';
import { listRecords } from '../../../../lib/storage';
import { jsonError, requireAdmin } from '../../../../lib/api-response';
import { safeUser } from '../../../../lib/safe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    requireAdmin(await getCurrentUser(request));
    const users = (await listRecords('users')).map(safeUser);
    return NextResponse.json({ users });
  } catch (error) {
    return jsonError(error, 'Unable to load registered users.');
  }
}
