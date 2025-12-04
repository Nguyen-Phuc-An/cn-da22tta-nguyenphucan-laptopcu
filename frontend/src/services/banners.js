import { listActiveBanners, listBanners, createBanner, updateBanner, deleteBanner } from '../api/banners';

export async function getActiveBanners() {
  try {
    const banners = await listActiveBanners();
    return Array.isArray(banners) ? banners : (banners && banners.data ? banners.data : []);
  } catch (err) {
    console.error('Error fetching active banners:', err);
    return [];
  }
}

export async function getAllBanners() {
  try {
    const banners = await listBanners();
    return Array.isArray(banners) ? banners : (banners && banners.data ? banners.data : []);
  } catch (err) {
    console.error('Error fetching banners:', err);
    return [];
  }
}

export async function addBanner(payload) {
  return createBanner(payload);
}

export async function editBanner(id, payload) {
  return updateBanner(id, payload);
}

export async function removeBanner(id) {
  return deleteBanner(id);
}
