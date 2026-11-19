import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { z } from 'zod';
import { getCurrentUser } from '../../../../../lib/auth';
import { createRecord, findRecord } from '../../../../../lib/storage';
import { notifyUser } from '../../../../../lib/notifications';
import { jsonError, readJson, requireUser } from '../../../../../lib/api-response';
import { rateLimit } from '../../../../../lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const messageSchema = z.object({ message: z.string().trim().min(10, 'Write at least 10 characters.').max(1500) });

export async function POST(request, context) {
  try {
    const user = requireUser(await getCurrentUser(request));
    const { id } = await context.params;
    const item = await findRecord('items', id);
    if (!item || item.status !== 'active') {
      const error = new Error('This report is no longer available.');
      error.status = 404;
      throw error;
    }
    if (String(item.userId) === String(user.id)) {
      const error = new Error('This is your own report.');
      error.status = 400;
      throw error;
    }
    if (!rateLimit(`message:${user.id}`, { limit: 8, windowMs: 60 * 60 * 1000 })) {
      const error = new Error('You have sent several enquiries recently. Please try again later.');
      error.status = 429;
      throw error;
    }
    const parsed = messageSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || 'Please check your message.');
      error.status = 400;
      throw error;
    }
    const message = await createRecord('contactMessages', {
      name: user.name, email: user.email, subject: `Secure enquiry for ${item.reportId}`,
      message: parsed.data.message, senderId: user.id, recipientUserId: item.userId, itemId: item.id, threadId: crypto.randomUUID(), status: 'new',
    });
    await notifyUser({ userId: item.userId, type: 'message', title: 'A secure enquiry was sent', message: `A TraceIt member has a question about ${item.reportId}. Open Secure messages in your dashboard to reply.`, itemId: item.id });
    return NextResponse.json({ ok: true, messageId: message.id, threadId: message.threadId, message: 'Your message was sent without sharing your contact details.' }, { status: 201 });
  } catch (error) {
    return jsonError(error, 'Unable to send your message.');
  }
}
