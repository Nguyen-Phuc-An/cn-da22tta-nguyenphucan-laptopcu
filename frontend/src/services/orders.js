// Orders services: data helpers only.

export function normalizeOrder(order = {}) {
  return {
    id: order.id || order.ma || null,
    userId: order.user_id || order.khach_hang_id || null,
    total: Number(order.total || order.tong_tien || 0),
    status: order.status || null,
    items: order.items || order.chi_tiet || [],
    ...order
  };
}

export function calculateOrderTotal(items = []) {
  return (items || []).reduce((s, it) => s + (Number(it.price || it.gia || 0) * (it.qty || it.so_luong || 1)), 0);
}