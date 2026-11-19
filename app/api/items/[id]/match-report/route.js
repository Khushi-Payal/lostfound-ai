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

const schema = z.object({ candidateId: z.string().min(1), note: z.string().trim().max(800).optional().default('') });

export async function POST(request, context) {
  try {
    const user = requireUser(await getCurrentUser(request));
    const { id } = await context.params;
    const parsed = schema.safeParse(await readJson(request));
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || 'Please choose a potential match.');
      error.status = 400;
      throw error;
    }
    const [item, candidate] = await Promise.all([findRecord('items', id), findRecord('items', parsed.data.candidateId)]);
    if (!item || !candidate || item.type === candidate.type || item.status !== 'active' || candidate.status !== 'active') {
      const error = new Error('Choose two active reports of different types.');
      error.status = 400;
      throw error;
    }
    if (String(item.userId) === String(user.id) && String(candidate.userId) === String(user.id)) {
      const error = new Error('You are the owner of both reports.');
      error.status = 400;
      throw error;
    }
    if (!rateLimit(`match-report:${user.id}`, { limit: 10, windowMs: 60 * 60 * 1000 })) {
      const error = new Error('Please wait before sending more match suggestions.');
      error.status = 429;
      throw error;
    }
    const message = `A TraceIt member suggested that ${item.reportId} and ${candidate.reportId} may match.${parsed.data.note ? ` Note: ${parsed.data.note}` : ''}`;
    await Promise.all([item, candidate].map(async (record) => {
      if (String(record.userId) === String(user.id)) return;
      await notifyUser({ userId: record.userId, type: 'similar-item', title: 'A community member suggested a match', message, itemId: record.id });
    }));
    const threadId = crypto.randomUUID();
    await createRecord('contactMessages', {
      name: user.name, email: user.email, subject: `Match suggestion: ${item.reportId} / ${candidate.reportId}`,
      message, senderId: user.id, recipientUserId: item.userId, itemId: item.id, threadId, status: 'new',
    });
    return NextResponse.json({ ok: true, threadId, message: 'Your suggestion was shared privately with the relevant reporters.' }, { status: 201 });
  } catch (error) {
    return jsonError(error, 'Unable to share your match suggestion.');
  }
}
