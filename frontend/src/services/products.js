// Services for products should only contain data processing helpers.
// HTTP calls belong to `src/api/products.js`.

export function normalizeProduct(p = {}) {
  return {
    id: p.id,
    title: p.title || p.tieu_de || '',
    price: Number(p.price || p.gia || 0),
    description: p.description || p.mo_ta || p.noi_dung || '',
    currency: p.currency || 'VND',
    ...p
  };
}

export function prepareProductPayload(values = {}) {
  // adapt frontend form fields to backend API shape if needed
  return {
    title: values.title || values.tieu_de,
    price: values.price || values.gia,
    description: values.description || values.mo_ta || values.noi_dung,
    category_id: values.category_id || values.danh_muc_id,
    ...values
  };
}