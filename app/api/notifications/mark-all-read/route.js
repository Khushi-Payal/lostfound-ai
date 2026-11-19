import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';
import { listRecords, updateRecord } from '../../../../lib/storage';
import { jsonError, requireUser } from '../../../../lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(request) {
  try {
    const user = requireUser(await getCurrentUser(request));
    const notifications = await listRecords('notifications');
    const unread = notifications.filter((note) => String(note.userId) === String(user.id) && !note.readAt);
    await Promise.all(unread.map((note) => updateRecord('notifications', note.id, { readAt: new Date().toISOString() })));
    return NextResponse.json({ ok: true, count: unread.length });
  } catch (error) {
    return jsonError(error, 'Unable to update notifications.');
  }
}
