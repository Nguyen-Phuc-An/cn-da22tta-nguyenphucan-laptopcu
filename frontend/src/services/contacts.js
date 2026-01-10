import { apiFetch } from './apiClient';

/**
 * Send a contact form submission
 */
export const createContact = async (contactData) => {
  return apiFetch('/contacts', { method: 'POST', body: contactData });
};

/**
 * Get all contacts (admin only)
 */
export const getAllContacts = async () => {
  return apiFetch('/contacts');
};

/**
 * Get a single contact by ID (admin only)
 */
export const getContact = async (id) => {
  return apiFetch(`/contacts/${id}`);
};

/**
 * Delete a contact (admin only)
 */
export const deleteContact = async (id) => {
  return apiFetch(`/contacts/${id}`, { method: 'DELETE' });
};
