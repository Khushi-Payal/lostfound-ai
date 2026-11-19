import { createRecord, findRecord, listRecords } from './storage';

export async function notifyUser({ userId, type = 'system', title, message, itemId = '', claimId = '' }) {
  if (!userId || String(userId).startsWith('sample-')) return null;
  const user = await findRecord('users', String(userId));
  const preferences = user?.notificationPreferences || {};
  if (['match', 'similar-item'].includes(type) && preferences.matches === false) return null;
  if (['claim-received', 'claim-update'].includes(type) && preferences.claims === false) return null;
  if (['report-update', 'message', 'system'].includes(type) && preferences.updates === false) return null;
  return createRecord('notifications', {
    userId: String(userId), type, title, message, itemId: String(itemId || ''), claimId: String(claimId || ''),
    readAt: null,
  });
}

export async function notifyItemOwner(item, payload) {
  if (!item?.userId) return null;
  return notifyUser({ ...payload, userId: item.userId, itemId: payload.itemId || item.id });
}

export async function latestNotificationsForUser(userId) {
  const records = await listRecords('notifications');
  return records.filter((record) => String(record.userId) === String(userId))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}
