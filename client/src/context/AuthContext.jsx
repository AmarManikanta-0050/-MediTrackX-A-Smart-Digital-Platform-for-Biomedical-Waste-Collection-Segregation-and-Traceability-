import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('meditrackx_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and check current user session
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('meditrackx_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res?.data?.user) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          localStorage.removeItem('meditrackx_token');
          localStorage.removeItem('meditrackx_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;

    localStorage.setItem('meditrackx_token', receivedToken);
    localStorage.setItem('meditrackx_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    const { token: receivedToken, user: receivedUser } = res.data;

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
