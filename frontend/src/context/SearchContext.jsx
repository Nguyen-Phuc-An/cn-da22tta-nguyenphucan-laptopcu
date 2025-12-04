import React, { useState, useCallback } from 'react';
import { SearchContext } from './SearchContextValue';

export function SearchProvider({ children }) {
  const [searchQuery, setSearchQueryState] = useState(() => {
    try {
      return sessionStorage.getItem('currentSearchQuery') || '';
    } catch {
      return '';
    }
  });

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
