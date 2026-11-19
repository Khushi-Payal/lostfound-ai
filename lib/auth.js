import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { findRecord } from './storage';

export const SESSION_COOKIE = 'traceit_session';
const ONE_WEEK = 60 * 60 * 24 * 7;

function jwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set before running TraceIt in production.');
  }
  return 'traceit-local-demo-secret-change-before-production-2026';
}

export function createSessionToken(user) {
  return jwt.sign({ sub: String(user.id), role: user.role }, jwtSecret(), { expiresIn: ONE_WEEK });
}

export function verifySessionToken(token) {
  try {
    const payload = jwt.verify(token, jwtSecret());
    return typeof payload === 'object' ? payload : null;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_WEEK,
  };
}

export function expiredCookieOptions() {
  return { ...sessionCookieOptions(), maxAge: 0 };
}

export function createResetToken() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

export function hashResetToken(token) {
  return crypto.createHash('sha256').update(String(token).trim().toUpperCase()).digest('hex');
}

export async function getCurrentUser(request) {
  const token = request?.cookies?.get?.(SESSION_COOKIE)?.value || readCookieHeader(request?.headers?.get?.('cookie'), SESSION_COOKIE);
  if (!token) return null;
  const payload = verifySessionToken(token);
  if (!payload?.sub) return null;
  const user = await findRecord('users', payload.sub);
  if (!user) return null;
  const { passwordHash, resetTokenHash, resetTokenExpires, ...safe } = user;
  return safe;
}

function readCookieHeader(header, key) {
  if (!header) return null;
  const found = header.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${key}=`));
  if (!found) return null;
  try { return decodeURIComponent(found.slice(key.length + 1)); } catch { return null; }
}

export function unauthorized(message = 'Please sign in to continue.') {
  const error = new Error(message);
  error.status = 401;
  return error;
}

export function forbidden(message = 'You do not have permission to do that.') {
  const error = new Error(message);
  error.status = 403;
  return error;
}
