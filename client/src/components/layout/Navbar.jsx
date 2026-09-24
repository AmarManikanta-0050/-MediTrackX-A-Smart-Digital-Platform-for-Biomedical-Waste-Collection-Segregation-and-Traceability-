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

  // Close menus on outside click
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
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">System Admin</span>;
      case 'hospital_staff':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">Hospital Staff</span>;
      case 'collector':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">Bio Collector</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center space-x-3 lg:w-64 lg:pr-4 flex-shrink-0">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 lg:hidden focus:outline-none"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-sky-400 flex items-center justify-center shadow-glow-teal flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xl font-black tracking-tight text-white">MediTrack</span>
              <span className="text-xl font-black tracking-tight text-teal-400">X</span>
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
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl glass-input placeholder-slate-500 focus:outline-none"
            />
          </form>
        </div>

        {/* Right: Notification Bell & Profile dropdown */}
        <div className="flex items-center space-x-3">
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-white">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[11px] rounded-full bg-teal-500/20 text-teal-300 font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-teal-400 hover:text-teal-300 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications right now.
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
                        className={`p-3.5 text-xs transition-colors cursor-pointer hover:bg-slate-800/40 flex items-start space-x-3 ${
                          !notif.read ? 'bg-teal-500/5' : ''
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {notif.type === 'urgent' || notif.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                          ) : notif.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Info className="w-4 h-4 text-teal-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${!notif.read ? 'text-white' : 'text-slate-300'}`}>
                            {notif.title}
                          </p>
                          <p className="mt-0.5 text-slate-400 line-clamp-2">{notif.message}</p>
                          <span className="mt-1 block text-[10px] text-slate-500">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-teal-400 mt-1 flex-shrink-0" />
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
              className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 font-bold text-xs uppercase shadow-sm">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                  {user?.name || 'User'}
                </p>
                <div className="mt-0.5">{getRoleBadge(user?.role)}</div>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50">
                <div className="p-4 border-b border-white/10 bg-slate-900/60">
                  <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  {user?.hospital?.name && (
                    <p className="mt-1 text-[11px] text-teal-400 truncate font-medium">
                      🏥 {user.hospital.name}
                    </p>
                  )}
                </div>
                <div className="p-2 space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/traceability"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors md:hidden"
                  >
                    <Search className="w-4 h-4 text-slate-400" />
                    <span>Track ID</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
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
