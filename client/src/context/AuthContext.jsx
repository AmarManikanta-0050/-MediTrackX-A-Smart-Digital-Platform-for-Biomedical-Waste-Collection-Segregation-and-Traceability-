import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('meditrackx_user');
      return savedUser && savedUser !== 'null' && savedUser !== 'undefined'
        ? JSON.parse(savedUser)
        : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem('meditrackx_token');
    return saved && saved !== 'null' && saved !== 'undefined' ? saved : null;
  });

  const [loading, setLoading] = useState(true);

  // Initialize and verify user session with the backend
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('meditrackx_token');

      if (savedToken && savedToken !== 'null' && savedToken !== 'undefined') {
        try {
          const res = await api.get('/auth/me');
          if (res?.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('meditrackx_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification note:', err.message);

          // ONLY clear session if server responded with 401 Unauthorized (token expired/invalid)
          if (
            err.status === 401 ||
            err.response?.status === 401 ||
            err.message?.toLowerCase().includes('expired') ||
            err.message?.toLowerCase().includes('invalid')
          ) {
            localStorage.removeItem('meditrackx_token');
            localStorage.removeItem('meditrackx_user');
            setToken(null);
            setUser(null);
          }
          // Note: If Render backend is waking up (cold start) or experiencing temporary network lag,
          // we retain the cached user session so the user is not abruptly logged out.
        }
      } else {
        localStorage.removeItem('meditrackx_token');
        localStorage.removeItem('meditrackx_user');
        setToken(null);
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const receivedToken = res?.data?.token;
    const receivedUser = res?.data?.user;

    if (!receivedToken || !receivedUser) {
      throw new Error(res?.message || 'Authentication succeeded but token was missing.');
    }

    localStorage.setItem('meditrackx_token', receivedToken);
    localStorage.setItem('meditrackx_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const receivedToken = res?.data?.token;
    const receivedUser = res?.data?.user;

    if (!receivedToken || !receivedUser) {
      throw new Error(res?.message || 'Registration succeeded but session token was missing.');
    }

    localStorage.setItem('meditrackx_token', receivedToken);
    localStorage.setItem('meditrackx_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const logout = () => {
    localStorage.removeItem('meditrackx_token');
    localStorage.removeItem('meditrackx_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res?.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('meditrackx_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
