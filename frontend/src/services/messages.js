import { apiClient } from './index';

/**
 * Send a chat message
 */
export const sendMessage = async (messageData) => {
  return apiClient.post('/messages/chat', messageData);
};

/**
 * Get conversation list
 */
export const getConversationsList = async () => {
  return apiClient.get('/messages/chat/conversations');
};

/**
 * Get chat history with a user or email
 */
export const getChatHistory = async (identifier) => {
  return apiClient.get(`/messages/chat/history/${identifier}`);
};

/**
 * Get conversation with a user or email
 */
export const getConversation = async (identifier) => {
  return apiClient.get(`/messages/chat/${identifier}`);
};
