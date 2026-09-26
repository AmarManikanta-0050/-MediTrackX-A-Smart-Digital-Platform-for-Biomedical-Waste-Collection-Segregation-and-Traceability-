import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { CheckCircle2, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res?.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 45000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      addToast('All notifications marked as read.', 'success');
    } catch (err) {
      console.error('Failed to mark all read:', err.message);
    }
  };

  const showSuccess = useCallback((message) => addToast(message, 'success'), [addToast]);
  const showError = useCallback((message) => addToast(message, 'error'), [addToast]);
  const showInfo = useCallback((message) => addToast(message, 'info'), [addToast]);

  /* Toast config for light theme */
  const toastConfig = {
    success: {
      bg: '#ffffff',
      border: '#a7f3d0',
      iconBg: '#ecfdf5',
      iconColor: '#059669',
      titleColor: '#065f46',
      Icon: CheckCircle2,
      barColor: '#059669',
    },
    error: {
      bg: '#ffffff',
      border: '#fecdd3',
      iconBg: '#fff1f2',
      iconColor: '#e11d48',
      titleColor: '#9f1239',
      Icon: AlertCircle,
      barColor: '#e11d48',
    },
    warning: {
      bg: '#ffffff',
      border: '#fde68a',
      iconBg: '#fffbeb',
      iconColor: '#d97706',
      titleColor: '#92400e',
      Icon: AlertTriangle,
      barColor: '#d97706',
    },
    info: {
      bg: '#ffffff',
      border: '#bae6fd',
      iconBg: '#f0f9ff',
      iconColor: '#0284c7',
      titleColor: '#075985',
      Icon: Info,
      barColor: '#0284c7',
    },
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        addToast,
        showSuccess,
        showError,
        showInfo,
        toasts,
        removeToast,
      }}
    >
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col space-y-2.5 pointer-events-none max-w-sm w-full px-4">
        {toasts.map((toast) => {
          const cfg = toastConfig[toast.type] || toastConfig.info;
          const Icon = cfg.Icon;

          return (
            <div
              key={toast.id}
              className="pointer-events-auto relative overflow-hidden rounded-2xl shadow-lg flex items-start space-x-3 p-4 animate-slide-in-right"
              style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {/* Colored accent bar on left */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                style={{ background: cfg.barColor }}
              />

              {/* Icon */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ml-2"
                style={{ background: cfg.iconBg }}
              >
                <Icon className="w-4 h-4" style={{ color: cfg.iconColor }} />
              </div>

              {/* Message */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-snug" style={{ color: cfg.titleColor }}>
                  {toast.message}
                </p>
              </div>

              {/* Dismiss button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const useNotification = useNotifications;
