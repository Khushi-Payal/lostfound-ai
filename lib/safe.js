export function safeUser(user) {
  if (!user) return null;
  const { passwordHash, resetTokenHash, resetTokenExpires, __v, ...publicUser } = user;
  return publicUser;
}

export function toPublicItem(item) {
  if (!item) return null;
  const { __v, userId, ...publicItem } = item;
  return publicItem;
}
