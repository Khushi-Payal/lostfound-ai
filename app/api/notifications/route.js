import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/auth';
import { latestNotificationsForUser } from '../../../lib/notifications';
import { jsonError, requireUser } from '../../../lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = requireUser(await getCurrentUser(request));
    const notifications = await latestNotificationsForUser(user.id);
    return NextResponse.json({ notifications, unreadCount: notifications.filter((note) => !note.readAt).length });
  } catch (error) {
    return jsonError(error, 'Unable to load notifications.');
  }
}
