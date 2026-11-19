export function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return 'Date not provided';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date not provided';
  return new Intl.DateTimeFormat('en-IN', options).format(date);
}

export function titleCase(value = '') {
  return String(value).replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function initials(name = 'TraceIt Member') {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('');
}

export function itemLocation(item = {}) {
  return [item.city, item.state].filter(Boolean).join(', ') || 'Location not shared';
}
