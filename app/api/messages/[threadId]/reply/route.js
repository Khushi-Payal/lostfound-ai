import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '../../../../../lib/auth';
import { createRecord, findRecord, listRecords } from '../../../../../lib/storage';
import { notifyUser } from '../../../../../lib/notifications';
import { jsonError, readJson, requireUser } from '../../../../../lib/api-response';
import { rateLimit } from '../../../../../lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const replySchema = z.object({ message: z.string().trim().min(10, 'Write at least 10 characters.').max(1500) });

export async function POST(request, context) {
  try {
    const user = requireUser(await getCurrentUser(request));
    const { threadId } = await context.params;
    const parsed = replySchema.safeParse(await readJson(request));
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || 'Please check your reply.');
      error.status = 400;
      throw error;
    }
    const all = await listRecords('contactMessages');
    const messages = all.filter((entry) => entry.threadId === threadId || entry.id === threadId)
      .filter((entry) => entry.senderId && entry.recipientUserId)
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    if (!messages.length) {
      const error = new Error('Secure message thread not found.');
      error.status = 404;
      throw error;
    }
    const first = messages[0];
    const participants = [String(first.senderId), String(first.recipientUserId)];
    if (!participants.includes(String(user.id))) {
      const error = new Error('You are not part of this secure message thread.');
      error.status = 403;
      throw error;
    }
    const recipientId = participants.find((participant) => participant !== String(user.id));
    const recipient = await findRecord('users', recipientId);
    if (!recipient) {
      const error = new Error('The other member is no longer available.');
      error.status = 404;
      throw error;
    }
    if (!rateLimit(`reply:${user.id}`, { limit: 20, windowMs: 60 * 60 * 1000 })) {
      const error = new Error('Please wait before sending more replies.');
      error.status = 429;
      throw error;
    }
    const item = first.itemId ? await findRecord('items', first.itemId) : null;
    const reply = await createRecord('contactMessages', {
      name: user.name,
      email: user.email,
      subject: first.subject || 'TraceIt secure message',
      message: parsed.data.message,
      senderId: user.id,
      recipientUserId: recipientId,
      itemId: first.itemId || '',
      threadId,
      status: 'new',
    });
    await notifyUser({ userId: recipientId, type: 'message', title: 'New secure message', message: `${user.name} replied${item?.reportId ? ` about ${item.reportId}` : ''}. Open Secure messages in your dashboard.`, itemId: first.itemId || '' });
    return NextResponse.json({ message: { id: reply.id, name: reply.name, message: reply.message, createdAt: reply.createdAt, isMine: true } }, { status: 201 });
  } catch (error) {
    return jsonError(error, 'Unable to send your reply.');
  }
}
