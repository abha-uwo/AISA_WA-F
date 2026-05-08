'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, role: initialRole }) => {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user data');
      }
    }
  }, []);

  // Avoid hydration mismatch by not rendering user-specific parts until mounted
  const displayName = user?.name || 'User';
  const displayRole = user?.role || initialRole || '';

  return (
    <div className="flex bg-[#fcfdfe] min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900">
      <Sidebar role={displayRole} />

      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            <h1 className="text-base font-black text-slate-900 tracking-tight uppercase">
              {displayRole === 'ADMIN' ? 'Control Center' : 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {mounted && (
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900 leading-none mb-1 group-hover:text-blue-600 transition-colors">{displayName}</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">{displayRole}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center font-black text-sm border border-slate-100 shadow-sm group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                  {displayName[0].toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="p-10 flex-1 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.15] pointer-events-none" />
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
