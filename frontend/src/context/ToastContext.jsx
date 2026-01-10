import React, { useState, useCallback } from 'react';
import { ToastContext } from './Toast';
import '../styles/Toast.css';

// Cung cấp ngữ cảnh thông báo
export { ToastContext };
// Nhà cung cấp ngữ cảnh thông báo
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  // Thêm thông báo mới
  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);
  // Xóa thông báo theo ID
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => removeToast(toast.id)}><i className="bi bi-x-lg"></i></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
