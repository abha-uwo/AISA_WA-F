'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Link2, 
  Zap, 
  GitBranch, 
  MessageSquare, 
  Settings, 
  LogOut,
  ChevronRight,
  Zap as ZapIcon,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const Sidebar = ({ role }) => {
  const pathname = usePathname();

  const adminLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Client List', href: '/admin/clients', icon: Link2 },
    { name: 'Approvals', href: '/admin/approvals', icon: ShieldCheck },
    { name: 'Automations', href: '/admin/automations', icon: Zap },
    { name: 'Messages', href: '/admin/inbox', icon: MessageSquare },
    { name: 'Analytics', href: '/admin/stats', icon: GitBranch },
  ];

  const clientLinks = [
    { name: 'Dashboard', href: '/client', icon: LayoutDashboard },
    { name: 'Channels', href: '/client/channels', icon: Link2 },
    { name: 'Auto Replies', href: '/client/automations', icon: Zap },
    { name: 'Workflows', href: '/client/workflows', icon: GitBranch },
    { name: 'Messages', href: '/client/inbox', icon: MessageSquare },
    { name: 'Settings', href: '/client/settings', icon: Settings },
  ];

  const links = role === 'ADMIN' ? adminLinks : clientLinks;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/auth/login';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 flex flex-col z-40 font-sans">
      {/* Brand Header */}
      <div className="p-8 pb-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200/50">
          <ZapIcon className="text-white" size={18} strokeWidth={3} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">AisaConnect</h1>
          <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1 block">V1.0 {role}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-8 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 italic opacity-70">Menu</p>
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative",
                isActive 
                  ? "bg-blue-50 text-blue-600 shadow-[0_4px_12px_rgba(37,99,235,0.08)]" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn("transition-all", isActive ? "text-blue-600 scale-110" : "text-slate-400 group-hover:text-slate-600")} />
              <span className={cn("text-[13px] tracking-tight font-bold", isActive ? "text-blue-600" : "text-slate-500")}>{link.name}</span>
              {isActive && (
                <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-5 bg-blue-600 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-6">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all group font-bold"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs uppercase tracking-widest">Logout</span>
        </button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
      `}</style>
    </aside>
  );
};

export default Sidebar;
