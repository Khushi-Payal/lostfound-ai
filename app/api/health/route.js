import { NextResponse } from 'next/server';
import { storageHealth } from '../../../lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await storageHealth());
  } catch {
    return NextResponse.json({ ready: false, mode: 'mongodb', message: 'Database connection failed.' }, { status: 503 });
  }
}
