import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';
import { deleteRecord, listRecords } from '../../../../lib/storage';
import { jsonError, requireUser } from '../../../../lib/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(request, context) {
  try {
    const user = requireUser(await getCurrentUser(request));
    const { id } = await context.params;
    const records = await listRecords('savedItems');
    const entry = records.find((saved) => String(saved.id) === String(id) || String(saved.itemId) === String(id));
    if (!entry || String(entry.userId) !== String(user.id)) {
      const error = new Error('Saved item not found.');
      error.status = 404;
      throw error;
    }
    await deleteRecord('savedItems', entry.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error, 'Unable to remove this saved item.');
  }
}
