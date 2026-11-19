export async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body && typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || data.message || 'Something went wrong. Please try again.');
    error.status = response.status;
    error.details = data.details;
    throw error;
  }
  return data;
}

export const jsonBody = (value) => JSON.stringify(value);
