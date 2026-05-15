'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, X, GitBranch, ArrowRight, Play, Pause } from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const ClientWorkflowsPage = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/workflows/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkflows(autoRes.data); // Wait, I should use res.data. Let me double check endpoint.
    } catch (err) {
      console.error('Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetching properly
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8080/api/workflows/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkflows(res.data);
    } catch (err) {
      console.error('Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:8080/api/workflows/', {
        name: newWorkflowName,
        trigger_type: 'KEYWORD',
        steps: { nodes: [], edges: [] },
        enabled: false
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Redirect to builder
      window.location.href = `/client/workflows/builder/${res.data.id}`;
    } catch (err) {
      alert('Failed to create workflow');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8080/api/workflows/${id}/`, {
        enabled: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Toggle failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure? This will delete the entire workflow.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/workflows/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error('Delete failed');
    }
  };

  return (
    <DashboardLayout role="CLIENT">
      <div className="max-w-full mx-auto pb-20 px-8">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Workflows</h1>
            <p className="text-slate-500 font-medium italic">Create complex, multi-step automation sequences.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 flex items-center gap-2"
          >
            <Plus size={16} />
            Create Workflow
          </button>
        </div>

        {/* Workflow Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" /></div>
          ) : workflows.length === 0 ? (
            <div className="col-span-full py-32 bg-white border border-dashed border-slate-200 rounded-[40px] text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <GitBranch size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Workflows Yet</h3>
              <p className="text-sm text-slate-400 italic mb-8">Start by creating your first automated sequence.</p>
              <button onClick={() => setIsModalOpen(true)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest">Build First Flow</button>
            </div>
          ) : (
            workflows.map((flow) => (
              <motion.div 
                key={flow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group relative overflow-hidden"
              >
                {/* Status Indicator */}
                <div className={cn("absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[10px] font-bold uppercase tracking-widest", flow.enabled ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400")}>
                  {flow.enabled ? 'Active' : 'Paused'}
                </div>

                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <GitBranch size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2 group-hover:text-blue-600 transition-colors">{flow.name}</h3>
                    <p className="text-xs text-slate-400 font-medium italic">{flow.steps?.length || 0} Nodes in this flow</p>
                  </div>

                  <div className="mt-auto pt-8 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={() => handleToggle(flow.id, flow.enabled)} className={cn("p-3 rounded-xl transition-all", flow.enabled ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100")}>
                        {flow.enabled ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                      <button onClick={() => handleDelete(flow.id)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <Link 
                      href={`/client/workflows/builder/${flow.id}`}
                      className="flex items-center gap-2 text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors"
                    >
                      Open Builder <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Create Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">New Workflow</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={24} /></button>
                </div>
                <form onSubmit={handleCreate} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Workflow Name</label>
                    <input 
                      required 
                      value={newWorkflowName} 
                      onChange={e => setNewWorkflowName(e.target.value)} 
                      placeholder="e.g. Onboarding Sequence" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition-all font-semibold" 
                    />
                  </div>
                  <button type="submit" disabled={isCreating} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-2">
                    {isCreating ? <Loader2 size={16} className="animate-spin" /> : 'Create & Open Builder'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default ClientWorkflowsPage;
