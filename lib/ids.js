import crypto from 'node:crypto';

export function reportCode(type) {
  const prefix = type === 'found' ? 'TR-F' : 'TR-L';
  const suffix = crypto.randomInt(100000, 999999);
  return `${prefix}-${suffix}`;
}
