import React, { createContext, useState, useCallback } from 'react';

export const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Manages global auth state (token, admin info, loading)
 * Provides login() and logout() functions to all child components
 * Persists token in localStorage so user stays logged in on page refresh
 */
export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  // Retrieve token from localStorage on mount to restore session
  const [token, setTokenState] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(false);

  /**
   * Login - Called after successful registration or login API call
   * Stores admin info in state and persists token to localStorage
   */
  const login = useCallback((adminData, token) => {
    setAdmin(adminData);
    setTokenState(token);
    localStorage.setItem('authToken', token);
  }, []);

  /**
   * Logout - Called when user clicks logout button
   * Clears state and removes token from localStorage
   */
  const logout = useCallback(() => {
    setAdmin(null);
    setTokenState(null);
    localStorage.removeItem('authToken');
  }, []);

  const value = {
    admin,
    token,
    loading,
    setLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 * Throws error if used outside AuthProvider
 */
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
