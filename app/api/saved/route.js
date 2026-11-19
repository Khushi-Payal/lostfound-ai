import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/auth';
import { createRecord, findRecord, listRecords } from '../../../lib/storage';
import { jsonError, readJson, requireUser } from '../../../lib/api-response';
import { toPublicItem } from '../../../lib/safe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = requireUser(await getCurrentUser(request));
    const [savedItems, items] = await Promise.all([listRecords('savedItems'), listRecords('items')]);
    const itemMap = new Map(items.map((item) => [String(item.id), item]));
    const saved = savedItems.filter((entry) => String(entry.userId) === String(user.id))
      .map((entry) => {
        const { userId, ...safeEntry } = entry;
        return { ...safeEntry, item: toPublicItem(itemMap.get(String(entry.itemId)) || null) };
      })
      .filter((entry) => entry.item);
    return NextResponse.json({ saved });
  } catch (error) {
    return jsonError(error, 'Unable to load saved items.');
  }
}

export async function POST(request) {
  try {
    const user = requireUser(await getCurrentUser(request));
    const body = await readJson(request);
    const itemId = String(body.itemId || '');
    const item = await findRecord('items', itemId);
    if (!item || item.status !== 'active') {
      const error = new Error('This item cannot be saved.');
      error.status = 404;
      throw error;
    }
    const records = await listRecords('savedItems');
    const existing = records.find((entry) => String(entry.userId) === String(user.id) && String(entry.itemId) === itemId);
    if (existing) return NextResponse.json({ saved: { id: existing.id, itemId: existing.itemId }, alreadySaved: true });
    let saved;
    try { saved = await createRecord('savedItems', { userId: user.id, itemId }); }
    catch (error) {
      if (error.code === 11000) return NextResponse.json({ error: 'This item is already saved.' }, { status: 409 });
      throw error;
    }
    return NextResponse.json({ saved: { id: saved.id, itemId: saved.itemId } }, { status: 201 });
  } catch (error) {
    return jsonError(error, 'Unable to save this item.');
  }
}
