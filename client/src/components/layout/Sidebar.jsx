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
  Leaf,
  ChevronRight,
  Globe,
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

  const getRoleLabel = () => {
    switch (role) {
      case 'admin': return { label: 'Admin Portal', color: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'hospital_staff': return { label: 'Hospital Portal', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'collector': return { label: 'Collector Portal', color: 'bg-sky-100 text-sky-700 border-sky-200' };
      default: return { label: 'Portal', color: 'bg-slate-100 text-slate-600' };
    }
  };

  const roleConfig = getRoleLabel();

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 top-16 z-30 lg:hidden transition-opacity"
          style={{ background: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(4px)' }}
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: '#ffffff',
          borderRight: '1px solid rgba(16,185,129,0.12)',
          boxShadow: '2px 0 16px rgba(0,0,0,0.04)',
        }}
      >
        {/* Role badge */}
        <div className="px-4 pt-4 pb-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${roleConfig.color}`}>
            {roleConfig.label}
          </span>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">

          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileSidebar}
                className={({ isActive }) =>
                  `relative flex items-center space-x-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'nav-link-active text-emerald-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="flex-1">{item.name}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-500 opacity-70" />}
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Next-Gen Integrations Section */}
          <div className="pt-4 mt-3">
            <div className="mx-3 mb-2 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
                  Next-Gen Modules
                </p>
              </div>
              <span className="live-badge">LIVE</span>
            </div>

            {/* Section divider */}
            <div className="mx-3 h-px bg-gradient-to-r from-emerald-200 via-teal-200 to-transparent mb-2" />

            {integrationLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileSidebar}
                  className={({ isActive }) =>
                    `relative flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 group ${
                      isActive
                        ? 'nav-link-active text-teal-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                          isActive
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'bg-teal-100 text-teal-600 group-hover:bg-teal-100'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{item.name}</span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-500 font-semibold">
                        {item.tag}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom actions & branding */}
        <div className="px-3 py-2 border-t border-emerald-100/80 space-y-1">
          <NavLink
            to="/"
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>Public Portal &bull; Home</span>
          </NavLink>
          <div className="flex items-center space-x-2 px-3 pt-1">
            <Leaf className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] text-slate-400 font-medium">
              Sustainable Waste Management
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
