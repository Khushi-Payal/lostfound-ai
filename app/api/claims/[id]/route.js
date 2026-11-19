import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '../../../../lib/auth';
import { findRecord, updateRecord } from '../../../../lib/storage';
import { notifyUser } from '../../../../lib/notifications';
import { jsonError, readJson, requireUser } from '../../../../lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const claimUpdateSchema = z.object({
  status: z.enum(['Pending', 'Under Review', 'Approved', 'Rejected']),
  reviewerNote: z.string().trim().max(1000).optional().default(''),
});

export async function PATCH(request, context) {
  try {
    const user = requireUser(await getCurrentUser(request));
    const { id } = await context.params;
    const claim = await findRecord('claims', id);
    if (!claim) {
      const error = new Error('Ownership claim not found.');
      error.status = 404;
      throw error;
    }
    const item = await findRecord('items', claim.itemId);
    if (user.role !== 'admin' && String(item?.userId) !== String(user.id)) {
      const error = new Error('Only the found-item reporter or an administrator can update this claim.');
      error.status = 403;
      throw error;
    }
    const parsed = claimUpdateSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message || 'Please check the claim update.');
      error.status = 400;
      throw error;
    }
    const updated = await updateRecord('claims', id, { ...parsed.data, reviewerId: user.id });
    if (parsed.data.status === 'Approved' && item) {
      await updateRecord('items', item.id, { status: 'recovered' });
    }
    await notifyUser({ userId: claim.claimantId, type: 'claim-update', title: `Claim ${parsed.data.status.toLowerCase()}`, message: `Your ownership claim for ${item?.reportId || 'a found item'} is now ${parsed.data.status.toLowerCase()}.`, itemId: claim.itemId, claimId: claim.id });
    return NextResponse.json({ claim: updated });
  } catch (error) {
    return jsonError(error, 'Unable to update this claim.');
  }
}
