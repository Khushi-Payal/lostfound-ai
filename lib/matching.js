const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'at', 'by', 'for', 'from', 'has', 'have', 'in', 'inside',
  'is', 'it', 'its', 'near', 'of', 'on', 'or', 'the', 'to', 'was', 'with', 'found',
  'item', 'nearby', 'small', 'little', 'there', 'this', 'that', 'please', 'some',
]);

export function normalizeText(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function keywords(value = '') {
  return normalizeText(value)
    .split(' ')
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

function textSimilarity(left, right) {
  const leftText = normalizeText(left);
  const rightText = normalizeText(right);
  if (!leftText || !rightText) return 0;
  if (leftText === rightText) return 1;
  const a = new Set(keywords(left));
  const b = new Set(keywords(right));
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const word of a) if (b.has(word)) overlap += 1;
  // Dice overlap is more forgiving than Jaccard for people who describe the same
  // object using different levels of detail.
  return Math.min(1, (2 * overlap) / (a.size + b.size));
}

function valueSimilarity(left, right) {
  const a = normalizeText(left);
  const b = normalizeText(right);
  if (!a || !b) return 0;
  if (a === b || a.includes(b) || b.includes(a)) return 1;
  return textSimilarity(a, b);
}

function dateFor(item) {
  return item?.date || item?.lostDate || item?.foundDate || item?.createdAt || null;
}

function locationScore(a, b) {
  const stateA = normalizeText(a?.state);
  const stateB = normalizeText(b?.state);
  const cityA = normalizeText(a?.city);
  const cityB = normalizeText(b?.city);
  let score = 0;
  if (stateA && stateB && stateA === stateB) score += 10;
  if (cityA && cityB && cityA === cityB) score += 10;
  else if (cityA && cityB && (cityA.includes(cityB) || cityB.includes(cityA))) score += 7;
  return score;
}

function dateScore(a, b) {
  const dateA = dateFor(a);
  const dateB = dateFor(b);
  if (!dateA || !dateB) return 0;
  const ms = Math.abs(new Date(dateA).getTime() - new Date(dateB).getTime());
  if (!Number.isFinite(ms)) return 0;
  const days = ms / 86_400_000;
  return Math.max(0, 15 * (1 - days / 60));
}

function formatDateDistance(a, b) {
  const one = dateFor(a);
  const two = dateFor(b);
  if (!one || !two) return null;
  const days = Math.round(Math.abs(new Date(one).getTime() - new Date(two).getTime()) / 86_400_000);
  return days === 0 ? 'Reported on the same day' : `Reported within ${days} day${days === 1 ? '' : 's'}`;
}

function descriptionScore(a, b) {
  const textA = `${a?.name || ''} ${a?.description || ''} ${a?.marks || ''}`;
  const textB = `${b?.name || ''} ${b?.description || ''} ${b?.marks || ''}`;
  return textSimilarity(textA, textB) * 30;
}

function attributeScore(a, b) {
  const brand = valueSimilarity(a?.brand, b?.brand);
  const color = valueSimilarity(a?.color, b?.color);
  const present = [
    Boolean(normalizeText(a?.brand) && normalizeText(b?.brand)),
    Boolean(normalizeText(a?.color) && normalizeText(b?.color)),
  ];
  const values = [brand, color].filter((_, index) => present[index]);
  if (!values.length) return 0;
  return (values.reduce((sum, value) => sum + value, 0) / values.length) * 15;
}

export function scorePair(a, b) {
  if (!a || !b || a.type === b.type) return null;
  const description = descriptionScore(a, b);
  const categoryMatch = normalizeText(a.category) && normalizeText(a.category) === normalizeText(b.category);
  const category = categoryMatch ? 20 : 0;
  const attributes = attributeScore(a, b);
  const location = locationScore(a, b);
  const date = dateScore(a, b);
  const score = Math.round(description + category + attributes + location + date);
  const reasons = [];

  if (categoryMatch) reasons.push(`Same category: ${a.category}`);
  if (normalizeText(a.brand) && valueSimilarity(a.brand, b.brand) >= 0.7) reasons.push(`Brand looks similar: ${a.brand}`);
  if (normalizeText(a.color) && valueSimilarity(a.color, b.color) >= 0.55) reasons.push(`Similar colour: ${a.color}`);
  const common = [...new Set(keywords(`${a.name || ''} ${a.description || ''} ${a.marks || ''}`))]
    .filter((word) => keywords(`${b.name || ''} ${b.description || ''} ${b.marks || ''}`).includes(word))
    .slice(0, 4);
  if (common.length) reasons.push(`Shared details: ${common.join(', ')}`);
  if (normalizeText(a.city) && normalizeText(a.city) === normalizeText(b.city)) reasons.push(`Same city: ${a.city}`);
  else if (normalizeText(a.state) && normalizeText(a.state) === normalizeText(b.state)) reasons.push(`Same state: ${a.state}`);
  const dateReason = formatDateDistance(a, b);
  if (dateReason) reasons.push(dateReason);

  let confidence = 'Weak Match';
  if (score >= 85) confidence = 'Strong Match';
  else if (score >= 65) confidence = 'Possible Match';
  return {
    score,
    confidence,
    breakdown: {
      description: Math.round(description),
      category,
      attributes: Math.round(attributes),
      location,
      date: Math.round(date),
    },
    reasons: reasons.slice(0, 5),
  };
}

export function findMatches(item, items = [], options = {}) {
  const { threshold = 40, limit = 10 } = options;
  if (!item || (item.status && item.status !== 'active')) return [];
  return items
    .filter((candidate) => candidate?.id !== item.id && candidate?.type !== item.type && (!candidate?.status || candidate.status === 'active'))
    .map((candidate) => ({ item: candidate, ...scorePair(item, candidate) }))
    .filter((match) => match.score >= threshold)
    .sort((a, b) => b.score - a.score || new Date(b.item.createdAt || 0) - new Date(a.item.createdAt || 0))
    .slice(0, limit);
}

export function confidenceLabel(score) {
  if (score >= 85) return 'Strong Match';
  if (score >= 65) return 'Possible Match';
  if (score >= 40) return 'Weak Match';
  return 'Low similarity';
}
