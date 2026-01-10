import React, { useState, useCallback } from 'react';
import { SearchContext } from './SearchContextValue';

// Cung cấp ngữ cảnh tìm kiếm
export function SearchProvider({ children }) {
  const [searchQuery, setSearchQueryState] = useState(() => {
    try {
      return sessionStorage.getItem('currentSearchQuery') || '';
    } catch {
      return '';
    }
  });
  // Cập nhật truy vấn tìm kiếm và lưu vào sessionStorage
  const setSearchQuery = useCallback((query) => {
    setSearchQueryState(query);
    if (query.trim()) {
      try {
        sessionStorage.setItem('currentSearchQuery', query.trim());
      } catch (e) {
        console.warn('sessionStorage.setItem error', e);
      }
    } else {
      try {
        sessionStorage.removeItem('currentSearchQuery');
      } catch (e) {
        console.warn('sessionStorage.removeItem error', e);
      }
    }
  }, []);

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
}
