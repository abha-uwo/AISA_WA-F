'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const AdminSettingsPage = () => {
  return (
    <DashboardLayout role="ADMIN">
      <div className="max-w-7xl mx-auto pb-20">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Settings className="text-slate-500" size={32} /> Platform Settings
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">System configuration and global preferences</p>
        </div>
        <div className="bg-white rounded-[40px] border border-slate-200 p-12 text-center shadow-sm">
          <Settings size={48} className="text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-900 mb-2">Settings Coming Soon</h3>
          <p className="text-slate-400 font-medium italic">Platform-wide configuration options will appear here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettingsPage;
