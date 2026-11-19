import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';
import { listRecords, isDemoMode } from '../../../../lib/storage';
import { jsonError, requireAdmin } from '../../../../lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    requireAdmin(await getCurrentUser(request));
    const [items, users, claims, messages] = await Promise.all([
      listRecords('items'), listRecords('users'), listRecords('claims'), listRecords('contactMessages'),
    ]);
    return NextResponse.json({
      stats: {
        lost: items.filter((item) => item.type === 'lost').length,
        found: items.filter((item) => item.type === 'found').length,
        recovered: items.filter((item) => item.status === 'recovered').length,
        users: users.length,
        pendingClaims: claims.filter((claim) => ['Pending', 'Under Review'].includes(claim.status)).length,
        newMessages: messages.filter((message) => message.status === 'new').length,
        flagged: items.filter((item) => item.status === 'under-review').length,
      },
      demoMode: isDemoMode(),
    });
  } catch (error) {
    return jsonError(error, 'Unable to load admin overview.');
  }
}
