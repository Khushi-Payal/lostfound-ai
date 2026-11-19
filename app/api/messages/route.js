import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/auth';
import { findRecord, listRecords, updateRecord } from '../../../lib/storage';
import { jsonError, requireUser } from '../../../lib/api-response';
import { toPublicItem } from '../../../lib/safe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const user = requireUser(await getCurrentUser(request));
    const all = await listRecords('contactMessages');
    const relevant = all.filter((entry) => entry.senderId && entry.recipientUserId &&
      (String(entry.senderId) === String(user.id) || String(entry.recipientUserId) === String(user.id)));
    const groups = new Map();
    for (const message of relevant) {
      const threadId = message.threadId || message.id;
      if (!groups.has(threadId)) groups.set(threadId, []);
      groups.get(threadId).push(message);
    }
    const threads = await Promise.all([...groups.entries()].map(async ([threadId, messages]) => {
      messages.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      const first = messages[0];
      const otherUserId = String(first.senderId) === String(user.id) ? first.recipientUserId : first.senderId;
      const [item, otherUser] = await Promise.all([
        first.itemId ? findRecord('items', first.itemId) : null,
        findRecord('users', String(otherUserId)),
      ]);
      const incoming = messages.filter((message) => String(message.recipientUserId) === String(user.id) && message.status === 'new');
      await Promise.all(incoming.map((message) => updateRecord('contactMessages', message.id, { status: 'read' })));
      return {
        threadId,
        subject: first.subject,
        item: toPublicItem(item),
        otherParty: otherUser?.name || 'TraceIt member',
        updatedAt: messages[messages.length - 1].createdAt,
        messages: messages.map((message) => ({
          id: message.id,
          name: message.name,
          message: message.message,
          createdAt: message.createdAt,
          isMine: String(message.senderId) === String(user.id),
        })),
      };
    }));
    threads.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    return NextResponse.json({ threads });
  } catch (error) {
    return jsonError(error, 'Unable to load secure messages.');
  }
}
