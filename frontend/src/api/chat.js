import io from 'socket.io-client';

let socket = null;

// Initialize Socket.IO connection
export function initializeSocket() {
  if (!socket) {
    socket = io('http://localhost:3000/chat', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });
  }
  return socket;
}

// Get socket instance
export function getSocket() {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
}

// Join chat room
export function joinChat(user_id, email_nguoi_gui, sender_name) {
  const s = getSocket();
  s.emit('join_chat', { user_id, email_nguoi_gui, sender_name });
}

// Join as admin
export function adminJoin(conversationId) {
  const s = getSocket();
  s.emit('admin_join', { conversationId });
}

// Send message
export function sendMessage(content, conversationId) {
  const s = getSocket();
  console.log('[API] Sending message, socket connected:', s.connected);
  if (!s.connected) {
    console.error('[API] Socket not connected! Cannot send message');
    return;
  }
  s.emit('send_message', { content, conversationId });
}

// Get message history
export function getMessageHistory(identifier) {
  const s = getSocket();
  s.emit('get_history', { identifier });
}

// Get all conversations (admin)
export function getConversations() {
  const s = getSocket();
  console.log('[API] Requesting conversations, socket connected:', s.connected);
  s.emit('get_conversations');
}

// Listen for messages
export function onReceiveMessage(callback) {
  const s = getSocket();
  s.on('receive_message', callback);
}

// Listen for message history
export function onMessageHistory(callback) {
  const s = getSocket();
  s.on('message_history', callback);
}

// Listen for conversations list
export function onConversationsList(callback) {
  const s = getSocket();
  s.on('conversations_list', callback);
}

// Listen for user online
export function onUserOnline(callback) {
  const s = getSocket();
  s.on('user_online', callback);
}

// Listen for admin online
export function onAdminOnline(callback) {
  const s = getSocket();
  s.on('admin_online', callback);
}

// Listen for user offline
export function onUserOffline(callback) {
  const s = getSocket();
  s.on('user_offline', callback);
}

// Listen for errors
export function onSocketError(callback) {
  const s = getSocket();
  s.on('error', callback);
}

// Leave chat
export function leaveChat() {
  const s = getSocket();
  s.emit('leave_chat');
}

// Disconnect socket
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
