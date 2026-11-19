import { NextResponse } from 'next/server';

export function jsonError(error, fallback = 'Something went wrong.') {
  const status = error?.status || (error?.name === 'ValidationError' || error?.name === 'ZodError' ? 400 : 500);
  if (status >= 500) console.error('[TraceIt API]', error);
  const message = status >= 500 && process.env.NODE_ENV === 'production'
    ? fallback
    : (error?.message || fallback);
  return NextResponse.json({ error: message, ...(error?.details ? { details: error.details } : {}) }, { status });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    const error = new Error('Please submit valid form data.');
    error.status = 400;
    throw error;
  }
}

export function requireUser(user) {
  if (!user) {
    const error = new Error('Please sign in to continue.');
    error.status = 401;
    throw error;
  }
  return user;
}

export function requireAdmin(user) {
  requireUser(user);
  if (user.role !== 'admin') {
    const error = new Error('Admin access is required.');
    error.status = 403;
    throw error;
  }
  return user;
}
