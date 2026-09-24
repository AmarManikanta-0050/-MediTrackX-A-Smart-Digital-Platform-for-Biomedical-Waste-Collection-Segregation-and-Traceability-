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
    <nav className="fixed bottom-0 inset-x-0 z-30 glass-panel border-t border-white/10 lg:hidden px-2 py-1.5 flex items-center justify-around">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
                isActive ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{link.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileNav;
