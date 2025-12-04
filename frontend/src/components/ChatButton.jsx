import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  initializeSocket,
  joinChat,
  sendMessage,
  getMessageHistory,
  onReceiveMessage,
  onMessageHistory,
  onAdminOnline,
  onUserOffline,
  leaveChat
} from '../api/chat';
import './ChatButton.css';

export default function ChatButton() {
  const { token } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'intro', content: 'Xin chào! 👋 Có gì tôi có thể giúp bạn?', is_user: false, timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const isUserScrollingRef = useRef(false);
  const socketRef = useRef(null);
  const customerIdRef = useRef(null);
  const customerEmailRef = useRef(null);

  const scrollToBottom = () => {
    if (!isUserScrollingRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleChatScroll = () => {
    if (!chatMessagesRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
    isUserScrollingRef.current = scrollHeight - (scrollTop + clientHeight) > 50;
  };

  // Extract user info from token
  const extractUserInfo = () => {
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length >= 2) {
          const payload = JSON.parse(atob(parts[1]));
          customerIdRef.current = payload.id;
          return { user_id: payload.id, sender_name: payload.ten || 'Khách hàng' };
        }
      } catch {
        // Token parsing failed
      }
    }
    customerEmailRef.current = 'guest@example.com';
    return { user_id: null, sender_name: 'Khách hàng', email: 'guest@example.com' };
  };

  // Initialize Socket.IO and setup listeners
  const setupSocketListeners = () => {
    const socket = initializeSocket();
    socketRef.current = socket;

    // Listen for incoming messages
    onReceiveMessage((data) => {
      setMessages(prev => [...prev, {
        id: data.id,
        content: data.content,
        is_user: data.sender_type === 'user',
        timestamp: new Date(data.timestamp)
      }]);
    });

    // Listen for message history
    onMessageHistory((data) => {
      const formattedMessages = data.messages.map(msg => ({
        id: msg.id,
        content: msg.noi_dung,
        is_user: msg.la_nguoi_dung === 1,
        timestamp: new Date(msg.tao_luc)
      }));
      setMessages(formattedMessages);
    });

    // Listen for admin online
    onAdminOnline(() => {
      setAdminOnline(true);
    });

    // Listen for user offline
    onUserOffline(() => {
      setAdminOnline(false);
    });
  };

  // Open chat
  const handleToggleChat = (open) => {
    setIsOpen(open);
    if (open) {
      isUserScrollingRef.current = false;
      
      // Setup Socket.IO if not already done
      if (!socketRef.current) {
        setupSocketListeners();
      }

      // Get user info and join
      const userInfo = extractUserInfo();
      const identifier = userInfo.user_id || userInfo.email;
      
      joinChat(userInfo.user_id, userInfo.email, userInfo.sender_name);
      getMessageHistory(identifier);
    } else {
      leaveChat();
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const content = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      const userInfo = extractUserInfo();
      const conversationId = userInfo.user_id ? `user_${userInfo.user_id}` : userInfo.email;

      // Send via Socket.IO (don't add optimistically - wait for server response)
      sendMessage(content, conversationId);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: 'Lỗi gửi tin nhắn. Vui lòng thử lại.',
        is_user: false,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-button-container">
      <button
        className="chat-button"
        onClick={() => handleToggleChat(!isOpen)}
        title="Chat với nhân viên"
        aria-label="Mở chat"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {adminOnline && <span className="online-indicator" />}
      </button>

      {isOpen && (
        <div className="chat-popup">
          <div className="chat-header">
            <h3>Hỗ trợ khách hàng</h3>
            <div className="header-status">
              {adminOnline && <span className="status-online">● Online</span>}
              <button
                className="chat-close"
                onClick={() => handleToggleChat(false)}
                aria-label="Đóng chat"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="chat-messages" ref={chatMessagesRef} onScroll={handleChatScroll}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.is_user ? 'user-message' : 'bot-message'}`}>
                <p>{msg.content}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              className="chat-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button 
              className="chat-send" 
              title="Gửi"
              type="submit"
              disabled={isLoading}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
