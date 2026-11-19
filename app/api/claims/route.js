import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '../../../lib/auth';
import { createRecord, findRecord, listRecords } from '../../../lib/storage';
import { notifyUser } from '../../../lib/notifications';
import { jsonError, readJson, requireUser } from '../../../lib/api-response';
import { toPublicItem } from '../../../lib/safe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const claimSchema = z.object({
  itemId: z.string().min(1),
  itemDescription: z.string().trim().min(10).max(1500),
  uniqueDetails: z.string().trim().min(8).max(1500),
  proofDescription: z.string().trim().min(8).max(2000),
});

export async function POST(request) {
  try {
    const user = requireUser(await getCurrentUser(request));
    const parsed = claimSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || 'Please check your claim.');
      error.status = 400;
      throw error;
    }
    const item = await findRecord('items', parsed.data.itemId);
    if (!item || item.type !== 'found' || item.status !== 'active') {
      const error = new Error('Ownership claims can be submitted for active found reports only.');
      error.status = 404;
      throw error;
    }
    if (String(item.userId) === String(user.id)) {
      const error = new Error('You cannot claim an item you reported as found.');
      error.status = 400;
      throw error;
    }
    const existing = (await listRecords('claims')).find((claim) => claim.itemId === item.id && String(claim.claimantId) === String(user.id));
    if (existing) {
      const error = new Error('You have already submitted a claim for this item.');
      error.status = 409;
      throw error;
    }
    let claim;
    try {
      claim = await createRecord('claims', {
        ...parsed.data, claimantId: user.id, claimantName: user.name, status: 'Pending', reviewerId: null, reviewerNote: '',
      });
    } catch (error) {
      if (error.code === 11000) {
        const duplicate = new Error('You have already submitted a claim for this item.');
        duplicate.status = 409;
        throw duplicate;
      }
      throw error;
    }
    await notifyUser({ userId: item.userId, type: 'claim-received', title: 'Ownership claim received', message: `A member submitted an ownership claim for ${item.reportId}. Review it carefully before arranging a handover.`, itemId: item.id, claimId: claim.id });
    return NextResponse.json({ claim, message: 'Your claim has been submitted securely for review.' }, { status: 201 });
  } catch (error) {
    return jsonError(error, 'Unable to submit your claim.');
  }
}

export async function GET(request) {
  try {
    const user = requireUser(await getCurrentUser(request));
    const [claims, items] = await Promise.all([listRecords('claims'), listRecords('items')]);
    const itemMap = new Map(items.map((item) => [String(item.id), item]));
    if (user.role === 'admin') {
      return NextResponse.json({ claims: claims.map((claim) => ({ ...claim, item: itemMap.get(String(claim.itemId)) || null })) });
    }
    const ownedItemIds = new Set(items.filter((item) => String(item.userId) === String(user.id)).map((item) => String(item.id)));
    const toMemberClaim = (claim) => {
      const { claimantId, reviewerId, ...safeClaim } = claim;
      return { ...safeClaim, item: toPublicItem(itemMap.get(String(claim.itemId)) || null) };
    };
    const submitted = claims.filter((claim) => String(claim.claimantId) === String(user.id)).map(toMemberClaim);
    const received = claims.filter((claim) => ownedItemIds.has(String(claim.itemId))).map(toMemberClaim);
    return NextResponse.json({ claims: submitted, received });
  } catch (error) {
    return jsonError(error, 'Unable to load ownership claims.');
  }
}
