import { NextResponse } from 'next/server';
import { findRecord, listRecords } from '../../../../lib/storage';
import { findMatches } from '../../../../lib/matching';
import { jsonError } from '../../../../lib/api-response';
import { toPublicItem } from '../../../../lib/safe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request, context) {
  try {
    const { itemId } = await context.params;
    const item = await findRecord('items', itemId);
    if (!item || item.status !== 'active') return NextResponse.json({ error: 'This active report could not be found.' }, { status: 404 });
    const matches = findMatches(item, await listRecords('items')).map((match) => ({ ...match, item: toPublicItem(match.item) }));
    return NextResponse.json({ itemId, matches });
  } catch (error) {
    return jsonError(error, 'Unable to calculate potential matches.');
  }
}
