import React from 'react';
// Tao ngữ cảnh xác thực người dùng
export const AuthContext = React.createContext({
  token: null,
  setToken: () => {},
  user: null,
  setUser: () => {},
});