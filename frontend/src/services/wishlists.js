// Wishlists services: data helpers only.

export function normalizeWishlistItem(item = {}) {
  return {
    userId: item.user_id || item.khach_hang_id || null,
    productId: item.product_id || item.san_pham_id || null,
    createdAt: item.created_at || null,
    ...item
  };
}

export function listToProductIds(list = []) {
  return (list || []).map(i => i.product_id || i.san_pham_id || i.productId);
}