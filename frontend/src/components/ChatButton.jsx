import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  initializeSocket,
  joinChat,
  sendMessage,
  onReceiveMessage,
  onSocketConnected,
  onSocketDisconnected
} from '../api/chat';
import './ChatButton.css';

export default function ChatButton() {
  const { token } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'intro', noi_dung: 'Xin chào! 👋 Có gì tôi có thể giúp bạn?', la_nguoi_dung: 0, tao_luc: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const isUserScrollingRef = useRef(false);
  const socketRef = useRef(null);
  const userIdRef = useRef(null);

  // Cuộn xuống dưới cùng
  const scrollToBottom = () => {
    if (!isUserScrollingRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Xử lý cuộn tay của người dùng
  const handleChatScroll = () => {
    if (!chatMessagesRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
    isUserScrollingRef.current = scrollHeight - (scrollTop + clientHeight) > 50;
  };

  // Lấy ID người dùng từ token
  const extractUserId = () => {
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length >= 2) {
          const payload = JSON.parse(atob(parts[1]));
          userIdRef.current = payload.id;
          return payload.id;
        }
      } catch {
        console.error('Failed to parse token');
      }
    }
    return null;
  };

  // Khởi tạo Socket.IO và thiết lập các listener
  const setupSocketListeners = () => {
    const socket = initializeSocket();
    socketRef.current = socket;

    // Khi socket kết nối, tham gia phòng chat người dùng
    onSocketConnected(() => {
      console.log('[ChatButton] Socket connected');
      const userId = extractUserId();
      if (userId) {
        joinChat(userId);
        setAdminOnline(true);
      }
    });

    // Nhận tin nhắn mới
    onReceiveMessage((data) => {
      console.log('[ChatButton] Received message:', data);
      setMessages(prev => [...prev, {
        id: data.id,
        noi_dung: data.noi_dung,
        la_nguoi_dung: data.la_nguoi_dung,
        tao_luc: new Date(data.tao_luc)
      }]);
    });

    onSocketDisconnected(() => {
      console.log('[ChatButton] Socket disconnected');
      setAdminOnline(false);
    });
  };

  // Mở/đóng chat
  const handleToggleChat = (open) => {
    setIsOpen(open);
    if (open) {
      isUserScrollingRef.current = false;
      
      // Thiết lập Socket.IO nếu chưa làm
      if (!socketRef.current) {
        setupSocketListeners();
      }
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const noi_dung = inputValue.trim();
    const userId = extractUserId() || userIdRef.current;

    if (!userId) {
      alert('Vui lòng đăng nhập để gửi tin nhắn');
      return;
    }

    setInputValue('');
    setIsLoading(true);

    try {
      // Thêm tin nhắn vào giao diện ngay lập tức
      setMessages(prev => [...prev, {
        id: Date.now(),
        noi_dung,
        la_nguoi_dung: 1,
        tao_luc: new Date()
      }]);

      // Send via Socket.IO
      sendMessage(userId, noi_dung);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => [...prev, {
        id: Date.now(),
        noi_dung: 'Lỗi gửi tin nhắn. Vui lòng thử lại.',
        la_nguoi_dung: 0,
        tao_luc: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Tự động cuộn khi có tin nhắn mới
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
<i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <div className="chat-messages" ref={chatMessagesRef} onScroll={handleChatScroll}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.la_nguoi_dung === 1 ? 'user-message' : 'bot-message'}`}>
                <p>{msg.noi_dung}</p>
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
