export function getClientKey(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
}
