'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Zap, GitBranch, Loader2 } from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const AdminStatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:8080/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Clients', value: stats?.totalClients, icon: Users, color: 'blue' },
    { label: 'Active Automations', value: stats?.activeAutomations, icon: Zap, color: 'yellow' },
    { label: 'Total Workflows', value: stats?.totalWorkflows, icon: GitBranch, color: 'purple' },
    { label: 'System Status', value: 'Online', icon: TrendingUp, color: 'green' },
  ];

  return (
    <DashboardLayout role="ADMIN">
      <div className="max-w-7xl mx-auto pb-20">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analytics</h1>
          <p className="text-gray-500 mt-1 font-medium italic">View how the platform is performing.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <card.icon size={24} strokeWidth={2.5} />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">{card.value ?? '—'}</h3>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminStatsPage;
