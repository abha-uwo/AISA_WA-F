'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Zap, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Star,
  Activity,
  ShieldAlert,
  Target,
  Zap as ZapIcon,
  ChevronRight,
  Loader2,
  GitBranch
} from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [statsRes, autoRes] = await Promise.all([
          axios.get('http://127.0.0.1:8080/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://127.0.0.1:8080/api/admin/automations', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setStats(statsRes.data);
        setAutomations(autoRes.data.slice(0, 4)); // Show recent 4
      } catch (err) {
        console.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { 
      name: 'Total Clients', 
      value: stats?.totalClients || '0', 
      icon: Users, 
      trend: '+15%', 
      trendUp: true
    },
    { 
      name: 'Automations', 
      value: stats?.activeAutomations || '0', 
      icon: ZapIcon, 
      trend: '+12%', 
      trendUp: true
    },
    { 
      name: 'Workflows', 
      value: stats?.totalWorkflows || '0', 
      icon: TrendingUp, 
      trend: 'Optimal', 
      trendUp: true
    },
    { 
      name: 'System Status', 
      value: 'CORE', 
      icon: ShieldCheck, 
      trend: 'Verified', 
      trendUp: true
    },
  ];

  return (
    <DashboardLayout role="ADMIN">
      <div className="max-w-7xl mx-auto pb-20 px-4 font-sans">
        
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-slate-500 font-medium italic">Monitor your system and manage your clients.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={card.name}
              className="bg-white p-8 rounded-[32px] border border-slate-100 premium-shadow hover-lift group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-blue-50/50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <card.icon size={24} strokeWidth={2.5} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight",
                  card.trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}>
                  {card.trendUp ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
                  {card.trend}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{card.name}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{card.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* System Flux Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 premium-shadow p-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-950 text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
                    <Activity size={20} strokeWidth={3} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Recent Activity</h3>
                </div>
                <button className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">View All &rarr;</button>
              </div>
              
              <div className="space-y-3">
                 {loading ? (
                    <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>
                 ) : automations.length === 0 ? (
                    <div className="py-12 text-center bg-slate-50 rounded-[32px] border border-slate-100 border-dashed">
                      <p className="text-sm font-medium text-slate-400 italic">No activity detected yet.</p>
                    </div>
                 ) : automations.map((auto) => (
                   <div key={auto._id || auto.id} className="p-5 bg-slate-50/50 border border-slate-100 rounded-[24px] flex items-center justify-between group hover:bg-white hover:border-blue-100 hover:premium-shadow transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center border transition-all shadow-sm", auto.enabled ? "bg-white text-blue-600 border-blue-50" : "bg-slate-100 text-slate-300 border-transparent")}>
                            <ZapIcon size={18} strokeWidth={2.5} />
                         </div>
                         <div>
                            <h4 className="text-slate-900 font-bold text-sm mb-0.5 tracking-tight">{auto.name || 'Rule'}</h4>
                            <div className="flex items-center gap-2">
                               <span className={cn("w-1.5 h-1.5 rounded-full", auto.enabled ? "bg-green-500 animate-pulse" : "bg-slate-300")} />
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{auto.clientName}</span>
                            </div>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-slate-900 font-black text-[10px] uppercase tracking-widest">{auto.triggerType}</p>
                         <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Type</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 rounded-[40px] p-10 text-white premium-shadow flex flex-col group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/30 blur-[60px] -mr-24 -mt-24 rounded-full" />
              <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-10 backdrop-blur-md group-hover:bg-blue-600 transition-all duration-500">
                <Target size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black tracking-tight leading-tight mb-4 uppercase">Add <br/>Clients</h3>
              <p className="text-slate-400 font-medium mb-10 leading-relaxed italic">Onboard new business clients and expand your network.</p>
              
              <button 
                onClick={() => window.location.href = '/admin/clients'}
                className="mt-auto w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all hover:bg-blue-600 hover:text-white"
              >
                  Manage Clients
               </button>
            </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminOverview;
