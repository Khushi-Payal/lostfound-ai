import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createRecord, isDemoMode } from '../../../lib/storage';
import { jsonError, readJson } from '../../../lib/api-response';
import { rateLimit } from '../../../lib/rate-limit';
import { getClientKey } from '../../../lib/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(15).max(4000),
});

export async function POST(request) {
  try {
    if (!rateLimit(`contact:${getClientKey(request)}`, { limit: 5, windowMs: 60 * 60 * 1000 })) {
      const error = new Error('Too many messages were submitted. Please try again later.');
      error.status = 429;
      throw error;
    }
    const parsed = contactSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || 'Please check your message.');
      error.status = 400;
      throw error;
    }
    const saved = await createRecord('contactMessages', { ...parsed.data, status: 'new' });
    return NextResponse.json({ ok: true, id: saved.id, message: 'Thanks for reaching out. The TraceIt support team will review your message.', demoMode: isDemoMode() }, { status: 201 });
  } catch (error) {
    return jsonError(error, 'Unable to send your message.');
  }
}
