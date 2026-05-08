'use client';

import React, { useState, useEffect } from 'react';
import { GitBranch, Plus, Loader2, Zap, Trash2 } from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const AdminWorkflowsPage = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://127.0.0.1:8080/api/admin/workflows', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWorkflows(res.data);
      } catch (err) {
        console.error('Failed to fetch workflows');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <DashboardLayout role="ADMIN">
      <div className="max-w-7xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <GitBranch className="text-purple-500" size={32} /> All Workflows
            </h1>
            <p className="text-gray-500 mt-1 font-medium italic">Step-by-step automations created by your clients.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : workflows.length === 0 ? (
          <div className="bg-white rounded-[40px] border border-slate-200 p-16 text-center shadow-sm">
            <GitBranch size={48} className="text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-900 mb-2">No workflows found</h3>
            <p className="text-slate-400 font-medium italic">When your clients create workflows, you'll see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((wf, i) => (
              <motion.div
                key={wf._id || wf.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-[28px] border border-slate-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <GitBranch size={20} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900">{wf.name}</h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{wf.trigger_type} Trigger</p>
                  </div>
                </div>
                <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border",
                  wf.enabled ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-400 border-gray-100"
                )}>
                  <div className={cn("w-1.5 h-1.5 rounded-full", wf.enabled ? "bg-green-500" : "bg-gray-300")} />
                  {wf.enabled ? 'Active' : 'Paused'}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminWorkflowsPage;
