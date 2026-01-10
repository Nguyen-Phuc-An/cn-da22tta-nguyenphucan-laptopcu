import { listActiveBanners, listBanners, createBanner, updateBanner, deleteBanner } from '../api/banners';

// Dịch vụ banner: các hàm tiện ích để tương tác với API banner.
export async function getActiveBanners() {
  try {
    const banners = await listActiveBanners();
    return Array.isArray(banners) ? banners : (banners && banners.data ? banners.data : []);
  } catch (err) {
    console.error('Error fetching active banners:', err);
    return [];
  }
}
// Lấy tất cả banner (admin)
export async function getAllBanners() {
  try {
    const banners = await listBanners();
    return Array.isArray(banners) ? banners : (banners && banners.data ? banners.data : []);
  } catch (err) {
    console.error('Error fetching banners:', err);
    return [];
  }
}
// Thêm banner mới
export async function addBanner(payload) {
  return createBanner(payload);
}
// Chỉnh sửa banner
export async function editBanner(id, payload) {
  return updateBanner(id, payload);
}
// Xóa banner
export async function removeBanner(id) {
  return deleteBanner(id);
}
