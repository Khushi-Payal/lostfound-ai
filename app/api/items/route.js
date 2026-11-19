import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/auth';
import { listRecords } from '../../../lib/storage';
import { toPublicItem } from '../../../lib/safe';
import { jsonError, requireUser } from '../../../lib/api-response';
import { isDemoMode } from '../../../lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const params = new URL(request.url).searchParams;
    const user = params.get('mine') === 'true' ? requireUser(await getCurrentUser(request)) : null;
    const query = (params.get('q') || '').trim().toLowerCase();
    const type = params.get('type');
    const category = params.get('category');
    const state = params.get('state');
    const city = params.get('city');
    const brand = (params.get('brand') || '').trim().toLowerCase();
    const from = params.get('from');
    const to = params.get('to');
    const status = params.get('status');
    const records = await listRecords('items');
    const items = records.filter((item) => {
      if (user && String(item.userId) !== String(user.id)) return false;
      if (!user && item.status === 'under-review') return false;
      if (status && status !== 'all' && item.status !== status) return false;
      if (!user && !status && item.status !== 'active') return false;
      if (type && type !== 'all' && item.type !== type) return false;
      if (category && category !== 'all' && item.category !== category) return false;
      if (state && state !== 'all' && item.state !== state) return false;
      if (city && city !== 'all' && item.city.toLowerCase() !== city.toLowerCase()) return false;
      if (brand && !String(item.brand || '').toLowerCase().includes(brand)) return false;
      if (from && item.date < from) return false;
      if (to && item.date > to) return false;
      if (query && !`${item.name} ${item.description} ${item.category} ${item.brand} ${item.city} ${item.state}`.toLowerCase().includes(query)) return false;
      return true;
    }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return NextResponse.json({ items: items.map(toPublicItem), total: items.length, demoMode: isDemoMode() });
  } catch (error) {
    return jsonError(error, 'Unable to load reports.');
  }
}
