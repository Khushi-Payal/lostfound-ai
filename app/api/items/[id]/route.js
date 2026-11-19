import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '../../../../lib/auth';
import { findRecord, listRecords, updateRecord, deleteRecord } from '../../../../lib/storage';
import { findMatches } from '../../../../lib/matching';
import { notifyUser } from '../../../../lib/notifications';
import { jsonError, readJson } from '../../../../lib/api-response';
import { toPublicItem } from '../../../../lib/safe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  category: z.string().trim().min(1).optional(),
  description: z.string().trim().min(12).max(3000).optional(),
  brand: z.string().trim().max(80).optional(),
  color: z.string().trim().max(80).optional(),
  marks: z.string().trim().max(1000).optional(),
  date: z.string().trim().min(1).optional(),
  time: z.string().trim().max(20).optional(),
  state: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
  location: z.string().trim().min(3).max(250).optional(),
  image: z.string().max(1_500_000).refine((value) => !value || /^data:image\/(?:jpeg|png|webp|gif);base64,/i.test(value), 'Upload a valid image file.').optional(),
  additionalInfo: z.string().trim().max(2000).optional(),
  secured: z.boolean().optional(),
  status: z.enum(['active', 'recovered', 'under-review', 'closed']).optional(),
}).strict();

export async function GET(request, context) {
  try {
    const { id } = await context.params;
    const item = await findRecord('items', id);
    if (!item) return NextResponse.json({ error: 'This report could not be found.' }, { status: 404 });
    const user = await getCurrentUser(request);
    if (item.status === 'under-review' && item.userId !== user?.id && user?.role !== 'admin') {
      return NextResponse.json({ error: 'This report is temporarily unavailable.' }, { status: 404 });
    }
    const matches = item.status === 'active' ? findMatches(item, await listRecords('items')).slice(0, 6) : [];
    return NextResponse.json({ item: { ...toPublicItem(item), isOwner: String(item.userId) === String(user?.id) }, matches: matches.map((match) => ({ ...match, item: toPublicItem(match.item) })) });
  } catch (error) {
    return jsonError(error, 'Unable to load this report.');
  }
}

export async function PUT(request, context) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser(request);
    if (!user) {
      const error = new Error('Please sign in to update a report.');
      error.status = 401;
      throw error;
    }
    const item = await findRecord('items', id);
    if (!item) return NextResponse.json({ error: 'This report could not be found.' }, { status: 404 });
    if (String(item.userId) !== String(user.id) && user.role !== 'admin') {
      const error = new Error('You can only edit your own reports.');
      error.status = 403;
      throw error;
    }
    const parsed = updateSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || 'Please check the updated report.');
      error.status = 400;
      throw error;
    }
    if (parsed.data.status === 'under-review' && user.role !== 'admin') {
      const error = new Error('Only an administrator can flag a report for review.');
      error.status = 403;
      throw error;
    }
    const updated = await updateRecord('items', id, parsed.data);
    await notifyUser({ userId: item.userId, type: 'report-update', title: 'Your report was updated', message: `Report ${item.reportId} has been updated.`, itemId: id });
    const matches = findMatches(updated, await listRecords('items'));
    return NextResponse.json({ item: toPublicItem(updated), matches: matches.map((match) => ({ ...match, item: toPublicItem(match.item) })) });
  } catch (error) {
    return jsonError(error, 'Unable to update this report.');
  }
}

export async function DELETE(request, context) {
  try {
    const { id } = await context.params;
    const user = await getCurrentUser(request);
    if (!user) {
      const error = new Error('Please sign in to delete a report.');
      error.status = 401;
      throw error;
    }
    const item = await findRecord('items', id);
    if (!item) return NextResponse.json({ error: 'This report could not be found.' }, { status: 404 });
    if (String(item.userId) !== String(user.id) && user.role !== 'admin') {
      const error = new Error('You can only delete your own reports.');
      error.status = 403;
      throw error;
    }
    await deleteRecord('items', id);
    const saved = await listRecords('savedItems');
    await Promise.all(saved.filter((entry) => String(entry.itemId) === String(id)).map((entry) => deleteRecord('savedItems', entry.id)));
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    return jsonError(error, 'Unable to delete this report.');
  }
}
