import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Trash2,
  Tags,
  Users,
  BarChart3,
  Truck,
  FileText,
  Search,
  CheckSquare,
  History,
  ShieldAlert,
  Scan,
  Radio,
  Navigation,
  Bot,
  Sparkles,
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, closeMobileSidebar }) => {
  const { user } = useAuth();
  const role = user?.role || 'hospital_staff';

  const getNavLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Hospitals', path: '/admin/hospitals', icon: Building2 },
          { name: 'Smart Bins', path: '/admin/bins', icon: Trash2 },
          { name: 'Waste Categories', path: '/admin/categories', icon: Tags },
          { name: 'Waste Records', path: '/admin/waste', icon: FileText },
          { name: 'Collection Requests', path: '/admin/collections', icon: Truck },
          { name: 'User Management', path: '/admin/users', icon: Users },
          { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
          { name: 'Digital Traceability', path: '/traceability', icon: Search },
        ];
      case 'hospital_staff':
        return [
          { name: 'Dashboard', path: '/hospital/dashboard', icon: LayoutDashboard },
          { name: 'Waste Logging', path: '/hospital/waste', icon: FileText },
          { name: 'Facility Bins', path: '/hospital/bins', icon: Trash2 },
          { name: 'Collection Requests', path: '/hospital/requests', icon: Truck },
          { name: 'Digital Traceability', path: '/traceability', icon: Search },
        ];
      case 'collector':
        return [
          { name: 'Dashboard', path: '/collector/dashboard', icon: LayoutDashboard },
          { name: 'Active Assignments', path: '/collector/assigned', icon: Truck },
          { name: 'Collection History', path: '/collector/history', icon: History },
          { name: 'Digital Traceability', path: '/traceability', icon: Search },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  const integrationLinks = [
    { name: 'AI Waste Vision', path: '/integrations/ai-classifier', icon: Scan, tag: 'CNN' },
    { name: 'IoT Bins Stream', path: '/integrations/iot-telemetry', icon: Radio, tag: 'LoRaWAN' },
    { name: 'GPS Fleet Tracking', path: '/integrations/gps-fleet', icon: Navigation, tag: 'GNSS' },
    { name: 'AMR Hospital Robots', path: '/integrations/robot-dispatch', icon: Bot, tag: 'SLAM' },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 top-16 z-30 bg-navy-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 glass-panel border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 custom-scrollbar">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {role.replace('_', ' ')} Portal
          </p>

          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileSidebar}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-glow-teal'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          {/* Advanced Integrations Section */}
          <div className="pt-4 mt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between px-3 pb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-teal-400" />
                <span>Next-Gen Modules</span>
              </p>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                LIVE
              </span>
            </div>

            {integrationLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileSidebar}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-glow-teal'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 flex-shrink-0 text-teal-400" />
                    <span>{item.name}</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-400">
                    {item.tag}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
