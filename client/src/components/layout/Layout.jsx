import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const Layout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: 'linear-gradient(135deg, #f0fdf9 0%, #f8fafc 40%, #f0f9ff 100%)',
    }}>
      {/* Ambient background blobs — decorative, no layout impact */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 -right-32 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.15) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(2,132,199,0.10) 0%, transparent 70%)' }}
        />
        {/* Subtle dot grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dot-grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#059669" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>
      </div>

      {/* App Shell */}
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar toggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
        <div className="flex-1 flex">
          <Sidebar
            isMobileOpen={isMobileSidebarOpen}
            closeMobileSidebar={() => setIsMobileSidebarOpen(false)}
          />
          <main className="flex-1 lg:pl-64 flex flex-col min-w-0 pb-20 lg:pb-8">
            <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-up">
              <Outlet />
            </div>
          </main>
        </div>
        <MobileNav />
      </div>
    </div>
  );
};

export default Layout;
