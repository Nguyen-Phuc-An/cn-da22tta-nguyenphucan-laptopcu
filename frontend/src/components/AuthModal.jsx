import React, { useState, useEffect, useRef } from 'react';
import { login, register } from '../api/auth';
import '../styles/AuthModal.css'; 

export default function AuthModal({ mode = 'login', onClose, onAuthSuccess }) {
  const [m, setMode] = useState(mode); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const emailRef = useRef(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef(null);

  // Tắt modal khi click ra ngoài form
  useEffect(() => {
    function onDocMouseDown(e) {
      try {
        if (!formRef.current) return;
        if (!formRef.current.contains(e.target)) {
          onClose && onClose();
        }
      } catch (err) { void err; }
    }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [onClose]);

  // focus vào email khi mode thay đổi
  useEffect(() => {
    try {
      if (emailRef && emailRef.current) {
        emailRef.current.focus();
        // place cursor at end
        const val = emailRef.current.value || '';
        emailRef.current.setSelectionRange && emailRef.current.setSelectionRange(val.length, val.length);
      }
    } catch (err) { void err; }
  }, [m]);

  // Cập nhật mode khi prop thay đổi
  useEffect(() => { setMode(mode); }, [mode]);
  // Xử lý submit form
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (m === 'login') {
        const res = await login({ email, password });
        onAuthSuccess && onAuthSuccess(res);
      } else {
        if (!phone || !address) {
          setError('Phone và Address là bắt buộc khi đăng ký');
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('email', email);
        formData.append('name', name);
        formData.append('password', password);
        formData.append('phone', phone);
        formData.append('address', address);

        const res = await register(formData);
        onAuthSuccess && onAuthSuccess(res);
      }
      onClose && onClose();
    } catch (err) {
      setError(err?.error || err?.message || 'Lỗi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-modal">
      <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data">
        <h3>{m === 'login' ? 'Đăng nhập' : 'Đăng ký'}</h3>

        <label>
          Email
          <input ref={emailRef} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </label>

        {m === 'register' && (
          <label>
            Tên
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </label>
        )}

        <label>
          Mật khẩu
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>

        {m === 'register' && (
          <>
            <label>
              Số điện thoại
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required />
            </label>

            <label>
              Địa chỉ
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} required />
            </label>
          </>
        )}

        {error && <p className="error">{error}</p>}

        <div className="actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Đang xử lý...' : (m === 'login' ? 'Đăng nhập' : 'Đăng ký')}
          </button>

          <button type="button" onClick={() => {
            setMode(m === 'login' ? 'register' : 'login');
          }}>
            {m === 'login' ? 'Đăng ký' : 'Đăng nhập'}
          </button>
        </div>
      </form>
    </div>
  );
}