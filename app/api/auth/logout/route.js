import { NextResponse } from 'next/server';
import { expiredCookieOptions } from '../../../../lib/auth';

export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('traceit_session', '', expiredCookieOptions());
  return response;
}
