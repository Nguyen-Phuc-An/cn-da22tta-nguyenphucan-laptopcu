// Reviews services: data helpers only.

export function normalizeReview(r = {}) {
  return {
    productId: r.product_id || r.san_pham_id || null,
    userId: r.user_id || r.khach_hang_id || null,
    score: Number(r.score || r.diem || 0),
    title: r.title || r.tieu_de || '',
    content: r.content || r.noi_dung || '',
    ...r
  };
}

export function summarizeReviews(list = []) {
  const arr = list || [];
  const count = arr.length;
  const avg = count ? (arr.reduce((s, r) => s + (Number(r.score || r.diem || 0)), 0) / count) : 0;
  return { count, average: avg };
}