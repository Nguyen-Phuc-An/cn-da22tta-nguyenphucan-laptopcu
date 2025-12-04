import React, { createContext, useState, useMemo } from 'react';

export const AuthModalContext = createContext();

export function AuthModalProvider({ children }) {
  const [modalMode, setModalMode] = useState(null); // 'login' | 'register' | null

  const value = useMemo(() => ({ modalMode, setModalMode }), [modalMode]);

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
}
