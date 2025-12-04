# WebSocket Real-Time Chat Implementation

## Overview
The Chat module now supports real-time messaging using WebSocket (Socket.IO) with fallback to REST API.

## Features Implemented

### 1. Real-Time Chat with WebSocket
- **Connection**: Established via Socket.IO to `http://localhost:3000`
- **Namespace**: Uses `/chat` namespace for all chat events
- **Auto-Reconnect**: Configured with exponential backoff (1s to 5s max)
- **Transports**: Supports both WebSocket and HTTP polling fallback

### 2. Online Customer Tracking
- **Visual Indicator**: Green dot (●) for online, grey dot (●) for offline
- **Live Updates**: Customers appear online when they connect via WebSocket
- **Auto-Detection**: Backend tracks user connections and broadcasts online status
- **Position**: Status indicator shown on the right of each customer name in conversation list

### 3. Real-Time Message Delivery
- **Send**: Admin types message and clicks "Gửi" (Send)
- **Instant Delivery**: Message sent via WebSocket event `send_message`
- **Broadcast**: Backend saves to database and broadcasts to all participants in conversation room
- **Receive**: Admin receives message via `receive_message` event instantly
- **Fallback**: If WebSocket unavailable, uses REST API `/messages/chat` endpoint

### 4. Chat History
- **Load on Join**: When admin selects a conversation, backend loads full message history via WebSocket event `message_history`
- **Persistent**: All messages saved to `chat_messages` table in database
- **Display**: Shows sender name, message content, timestamp, and sender type (Support/Customer)
- **REST Fallback**: If WebSocket fails, loads via REST API `/messages/chat/{identifier}`

### 5. Message Formatting
- **Customer Messages**: Light grey background (#f3f4f6), aligned left
- **Admin Messages**: Purple background (#667eea), white text, aligned right
- **Metadata**: Shows sender name and timestamp for each message
- **Responsive**: Supports multi-line messages with word wrapping

## Technical Details

### WebSocket Events

**Admin Events:**
- `admin_join` - Admin joins a conversation room and loads history
- `send_message` - Admin sends a message to the conversation
- `get_conversations` - Requests list of all conversations (received as `conversations_list`)
- `disconnect` - Admin leaves the chat (triggered on component unmount)

**Broadcast Events:**
- `user_online` - Customer connected to chat
- `user_offline` - Customer disconnected
- `receive_message` - New message from any participant
- `message_history` - Historical messages for a conversation

### REST API Fallback Endpoints
- `GET /messages/chat/conversations` - List all conversations
- `GET /messages/chat/{identifier}` - Load chat history (identifier format: `user_123` or email)
- `POST /messages/chat` - Send message (fallback when WebSocket unavailable)

### Database Schema
Messages stored in `chat_messages` table:
- `id` - Message ID
- `user_id` - Customer user ID (nullable)
- `email_nguoi_gui` - Customer email (nullable)
- `noi_dung` - Message content
- `ten_nguoi_gui` - Sender name
- `la_nguoi_dung` - 1=customer, 0=staff/admin
- `tao_luc` - Timestamp

## State Management

**React Hooks:**
- `conversations` - List of all conversations with last message time
- `selectedConversation` - Currently active conversation ID
- `messages` - Messages in current conversation
- `replyText` - Text being typed in send box
- `onlineCustomers` - Set of online conversation IDs
- `sending` - Loading state while sending message
- `loading` - Initial load state for conversations

**Socket References:**
- `socketRef` - Maintains persistent WebSocket connection reference

## Browser Console Logging
Debug logs marked with `[WebSocket]` prefix show:
- Connection status
- Received events and data
- Message sends/receives
- Connection errors

## UI/UX Features

1. **Online Status Indicator**: Green dot shows real-time customer online status
2. **Send Button State**: Disabled and shows "Đang gửi..." while sending
3. **Auto-Scroll**: Message view scrolls to latest message automatically
4. **Empty States**: Shows helpful messages when no conversations or messages
5. **Responsive Layout**: 2-column layout (conversations list + message view)

## Error Handling

- **WebSocket Failures**: Automatically falls back to REST API
- **Network Issues**: Auto-reconnect with configurable retry attempts
- **Failed Sends**: Shows alert "Lỗi gửi tin nhắn" and provides error details in console
- **Missing Data**: Gracefully handles null/undefined values with fallbacks

## Future Enhancements

1. Typing indicators ("Admin is typing...")
2. Read receipts (message seen status)
3. File sharing via WebSocket
4. Message search in history
5. Admin call/video call integration
6. Message reactions/emojis
7. Conversation archiving/pinning
8. User presence details (last seen, away status)

## Testing Checklist

- [ ] Admin connects to chat - conversation list loads
- [ ] Customer appears online when they connect
- [ ] Admin can select a conversation and see chat history
- [ ] Admin can send message - appears instantly
- [ ] Message shows in admin view with correct sender info
- [ ] Customer goes offline - status indicator updates
- [ ] Browser disconnect - auto-reconnect works
- [ ] Multiple admins in same conversation - messages sync
- [ ] REST API fallback works if WebSocket unavailable

## Notes

- Backend Socket.IO initialized in `server.js` via `initializeSocketHandlers(io)`
- Socket configuration in backend at `backend/src/socket.js`
- Frontend Socket.IO connection configured in `Chat.jsx` useEffect
- Cross-origin configured in backend socket setup
- Messages persisted to MySQL database before broadcast
