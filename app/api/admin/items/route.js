import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';
import { listRecords } from '../../../../lib/storage';
import { jsonError, requireAdmin } from '../../../../lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    requireAdmin(await getCurrentUser(request));
    const items = await listRecords('items');
    return NextResponse.json({ items: items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)) });
  } catch (error) {
    return jsonError(error, 'Unable to load platform reports.');
  }
}
