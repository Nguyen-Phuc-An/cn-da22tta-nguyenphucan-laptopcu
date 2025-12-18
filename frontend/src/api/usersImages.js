import { apiFetch } from '../services/apiClient';

// Upload avatar
export async function uploadUserImages(userId, files) {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));
  
  const response = await apiFetch(`/users/${userId}/images`, {
    method: 'POST',
    body: formData
  });
  return response;
}

// Get all user images
export async function getUserImages(userId) {
  return apiFetch(`/users/${userId}/images`);
}

// Get main avatar
export async function getMainUserImage(userId) {
  return apiFetch(`/users/${userId}/images/main`);
}

// Set image as main
export async function setMainUserImage(userId, imageId) {
  return apiFetch(`/users/${userId}/images/main`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageId,
      userId
    })
  });
}

// Delete user image
export async function deleteUserImage(userId, imageId) {
  return apiFetch(`/users/${userId}/images`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageId,
      userId
    })
  });
}
