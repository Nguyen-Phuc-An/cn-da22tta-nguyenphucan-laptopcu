import React from 'react';

export const AuthContext = React.createContext({
  token: null,
  setToken: () => {},
  user: null,
  setUser: () => {},
});