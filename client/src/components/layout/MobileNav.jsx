import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FileText, Truck, Search, History } from 'lucide-react';

const MobileNav = () => {
  const { user } = useAuth();
  const role = user?.role || 'hospital_staff';

  const getLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Waste', path: '/admin/waste', icon: FileText },
          { name: 'Collections', path: '/admin/collections', icon: Truck },
          { name: 'Track', path: '/traceability', icon: Search },
        ];
      case 'hospital_staff':
        return [
          { name: 'Dashboard', path: '/hospital/dashboard', icon: LayoutDashboard },
          { name: 'Log Waste', path: '/hospital/waste', icon: FileText },
          { name: 'Requests', path: '/hospital/requests', icon: Truck },
          { name: 'Track', path: '/traceability', icon: Search },
        ];
      case 'collector':
        return [
          { name: 'Dashboard', path: '/collector/dashboard', icon: LayoutDashboard },
          { name: 'Assigned', path: '/collector/assigned', icon: Truck },
          { name: 'History', path: '/collector/history', icon: History },
          { name: 'Track', path: '/traceability', icon: Search },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden"
      style={{
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(16,185,129,0.12)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-4 rounded-xl text-[10px] font-semibold transition-all duration-200 min-w-0 flex-1 ${
                  isActive
                    ? 'text-emerald-700'
                    : 'text-slate-500 hover:text-slate-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-0.5 transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-slate-500'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={isActive ? 'font-bold' : ''}>{link.name}</span>
                  {isActive && (
                    <div className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
