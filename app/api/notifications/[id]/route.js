import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';
import { deleteRecord, findRecord, updateRecord } from '../../../../lib/storage';
import { jsonError, readJson, requireUser } from '../../../../lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(request, context) {
  try {
    const user = requireUser(await getCurrentUser(request));
    const { id } = await context.params;
    const body = await readJson(request);
    const notification = await findRecord('notifications', id);
    if (!notification || String(notification.userId) !== String(user.id)) {
      const error = new Error('Notification not found.');
      error.status = 404;
      throw error;
    }
    if (body.action === 'delete') {
      await deleteRecord('notifications', id);
      return NextResponse.json({ ok: true });
    }
    const updated = await updateRecord('notifications', id, { readAt: body.read === false ? null : new Date().toISOString() });
    return NextResponse.json({ notification: updated });
  } catch (error) {
    return jsonError(error, 'Unable to update this notification.');
  }
}
