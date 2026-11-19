import { NextResponse } from 'next/server';
import { findRecord, listRecords } from '../../../lib/storage';
import { getCurrentUser } from '../../../lib/auth';
import { findMatches } from '../../../lib/matching';
import { jsonError, readJson, requireUser } from '../../../lib/api-response';
import { toPublicItem } from '../../../lib/safe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = requireUser(await getCurrentUser(request));
    const [items, records] = await Promise.all([listRecords('items'), listRecords('items')]);
    const owned = items.filter((item) => String(item.userId) === String(user.id) && item.status === 'active');
    const reports = owned.map((item) => ({
      item: toPublicItem(item),
      matches: findMatches(item, records, { limit: 5 }).map((match) => ({ ...match, item: toPublicItem(match.item) })),
    }));
    return NextResponse.json({ reports, algorithm: 'TraceIt weighted similarity v1' });
  } catch (error) {
    return jsonError(error, 'Unable to calculate potential matches.');
  }
}

export async function POST(request) {
  try {
    const body = await readJson(request);
    const itemId = String(body.itemId || '');
    if (!itemId) {
      const error = new Error('Choose a report to find similar items.');
      error.status = 400;
      throw error;
    }
    const item = await findRecord('items', itemId);
    if (!item || item.status !== 'active') {
      const error = new Error('This active report could not be found.');
      error.status = 404;
      throw error;
    }
    const matches = findMatches(item, await listRecords('items')).map((match) => ({ ...match, item: toPublicItem(match.item) }));
    return NextResponse.json({ itemId, matches, algorithm: 'TraceIt weighted similarity v1' });
  } catch (error) {
    return jsonError(error, 'Unable to calculate potential matches.');
  }
}
