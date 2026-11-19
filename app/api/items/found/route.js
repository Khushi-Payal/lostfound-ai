import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';
import { createRecord, listRecords } from '../../../../lib/storage';
import { findMatches } from '../../../../lib/matching';
import { reportCode } from '../../../../lib/ids';
import { notifyItemOwner, notifyUser } from '../../../../lib/notifications';
import { reportSchema } from '../../../../lib/validators';
import { jsonError, readJson, requireUser } from '../../../../lib/api-response';
import { isDemoMode } from '../../../../lib/storage';
import { toPublicItem } from '../../../../lib/safe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const user = requireUser(await getCurrentUser(request));
    const parsed = reportSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || 'Please check the report.');
      error.status = 400;
      throw error;
    }
    const item = await createRecord('items', {
      ...parsed.data, type: 'found', userId: user.id, reportId: reportCode('found'),
      status: 'active', isDemo: false,
    });
    const all = await listRecords('items');
    const matches = findMatches(item, all);
    if (matches.length) {
      await notifyUser({ userId: user.id, type: 'match', title: 'Potential matches found', message: `${matches.length} similar lost report${matches.length === 1 ? '' : 's'} may be related to “${item.name}”.`, itemId: item.id });
      for (const match of matches.slice(0, 3)) {
        if (String(match.item.userId) !== String(user.id)) {
          await notifyItemOwner(match.item, { type: 'similar-item', title: 'A similar found report was added', message: `A new found report for “${item.name}” may match an item you reported.`, itemId: item.id });
        }
      }
    }
    return NextResponse.json({ item: toPublicItem(item), matches: matches.map((match) => ({ ...match, item: toPublicItem(match.item) })), demoMode: isDemoMode() }, { status: 201 });
  } catch (error) {
    return jsonError(error, 'Unable to submit the found-item report.');
  }
}
