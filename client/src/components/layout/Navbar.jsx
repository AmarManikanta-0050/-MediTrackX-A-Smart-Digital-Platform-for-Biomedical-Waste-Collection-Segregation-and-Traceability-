import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Bell,
  Search,
  LogOut,
  User as UserIcon,
  Shield,
  Activity,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Leaf,
} from 'lucide-react';

const Navbar = ({ toggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/traceability?id=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
            System Admin
          </span>
        );
      case 'hospital_staff':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
            Hospital Staff
          </span>
        );
      case 'collector':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-700 border border-sky-200">
            Bio Collector
          </span>
        );
      default:
        return null;
    }
  };

  const getAvatarBg = (role) => {
    switch (role) {
      case 'admin': return 'from-rose-500 to-rose-600';
      case 'hospital_staff': return 'from-emerald-500 to-teal-600';
      case 'collector': return 'from-sky-500 to-blue-600';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full" style={{
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(16,185,129,0.12)',
      boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
    }}>
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Left: Hamburger + Brand */}
        <div className="flex items-center space-x-3 lg:w-64 lg:pr-4 flex-shrink-0">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden focus:outline-none transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link
            to="/"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-2.5 group cursor-pointer focus:outline-none"
            title="Open Home Page"
          >
            {/* Medical cross brand mark */}
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-btn-emerald" style={{
              background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
              boxShadow: '0 4px 12px rgba(5,150,105,0.30)',
            }}>
              <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
                <rect x="8" y="2" width="4" height="16" rx="2" fill="white" />
                <rect x="2" y="8" width="16" height="4" rx="2" fill="white" />
                <circle cx="10" cy="10" r="2.5" fill="rgba(255,255,255,0.3)" />
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center space-x-0.5">
                <span className="text-lg font-black tracking-tight text-slate-900">MediTrack</span>
                <span className="text-lg font-black tracking-tight text-emerald-600">X</span>
              </div>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.12em] hidden sm:block">
                Biomedical Waste Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Universal Traceability Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Track Waste ID (MW-...) or Request ID (CR-...)"
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input placeholder-slate-400 focus:outline-none"
            />
          </form>
        </div>

        {/* Right: Notification Bell & Profile */}
        <div className="flex items-center space-x-2">

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl overflow-hidden z-50 animate-fade-down" style={{
                background: '#ffffff',
                border: '1px solid rgba(16,185,129,0.12)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(16,185,129,0.06)',
              }}>
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-sm font-bold text-slate-800">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 font-medium">No notifications right now</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => {
                          if (!notif.read) markAsRead(notif._id);
                          if (notif.link) {
                            navigate(notif.link);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-3.5 text-xs transition-colors cursor-pointer hover:bg-slate-50 flex items-start space-x-3 ${
                          !notif.read ? 'bg-emerald-50/60' : ''
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {notif.type === 'urgent' || notif.type === 'warning' ? (
                            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            </div>
                          ) : notif.type === 'success' ? (
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center">
                              <Info className="w-3.5 h-3.5 text-sky-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold truncate ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>
                            {notif.title}
                          </p>
                          <p className="mt-0.5 text-slate-500 line-clamp-2">{notif.message}</p>
                          <span className="mt-1 block text-[10px] text-slate-400">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none border border-transparent hover:border-slate-200"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getAvatarBg(user?.role)} flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm`}>
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                  {user?.name || 'User'}
                </p>
                <div className="mt-0.5">{getRoleBadge(user?.role)}</div>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl overflow-hidden z-50 animate-fade-down" style={{
                background: '#ffffff',
                border: '1px solid rgba(16,185,129,0.12)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
              }}>
                <div className="p-4 border-b border-slate-100" style={{
                  background: 'linear-gradient(135deg, #ecfdf5, #f0f9ff)',
                }}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarBg(user?.role)} flex items-center justify-center text-white font-bold text-sm mb-2 shadow-sm`}>
                    {user?.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  {user?.hospital?.name && (
                    <div className="mt-1.5 flex items-center space-x-1 text-xs text-emerald-700 font-medium">
                      <span>🏥</span>
                      <span className="truncate">{user.hospital.name}</span>
                    </div>
                  )}
                </div>
                <div className="p-2 space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center space-x-2.5 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/traceability"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center space-x-2.5 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors md:hidden"
                  >
                    <Search className="w-4 h-4" />
                    <span>Track ID</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
