'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, X, Zap } from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ClientAutomationsPage = () => {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuto, setSelectedAuto] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', keywords: '', response: '' });

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://127.0.0.1:8080/api/automations/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAutomations(res.data);
    } catch (err) {
      console.error('Failed to fetch automations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:8080/api/automations/', {
        ...formData,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
        enabled: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      setFormData({ name: '', keywords: '', response: '' });
      fetchAutomations();
    } catch (err) {
      alert('Failed to create automation');
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://127.0.0.1:8080/api/automations/${id}/`, {
        enabled: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAutomations();
      // Update selected auto if detail modal is open
      if (selectedAuto && selectedAuto.id === id) {
        setSelectedAuto(prev => ({...prev, enabled: !currentStatus}));
      }
    } catch (err) {
      console.error('Toggle failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8080/api/automations/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsDetailModalOpen(false);
      fetchAutomations();
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
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Auto Replies</h1>
            <p className="text-slate-500 font-medium italic">Manage your keyword-based automated message rules.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-blue-600 transition-all shadow-xl shadow-slate-100 flex items-center gap-2"
          >
            <Plus size={16} />
            New Rule
          </button>
        </div>

        {/* Simplified Table List */}
        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] w-24">S.No</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Keywords</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Response Message</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="4" className="py-20 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" /></td></tr>
              ) : automations.length === 0 ? (
                <tr><td colSpan="4" className="py-20 text-center text-slate-400 italic">No rules found. Click "New Rule" to get started.</td></tr>
              ) : (
                automations.map((auto, i) => (
                  <tr 
                    key={auto.id} 
                    onClick={() => { setSelectedAuto(auto); setIsDetailModalOpen(true); }}
                    className="hover:bg-slate-50/30 cursor-pointer transition-colors group"
                  >
                    <td className="px-8 py-6 text-sm font-bold text-slate-400 italic">{(i + 1).toString().padStart(2, '0')}</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-2">
                        {auto.keywords.map(kw => (
                          <span key={kw} className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[11px] font-bold rounded-lg border border-slate-100 group-hover:bg-white transition-colors">{kw}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-semibold text-slate-900 tracking-tight truncate max-w-lg">
                      {auto.response}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest", auto.enabled ? "text-emerald-500" : "text-slate-300")}>
                          {auto.enabled ? 'Active' : 'Paused'}
                        </span>
                        <div className={cn("w-2 h-2 rounded-full", auto.enabled ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-200")} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Create Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">New Auto Reply</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={24} /></button>
                </div>
                <form onSubmit={handleCreate} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Rule Name</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Sales Query" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition-all font-semibold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Trigger Keywords (comma separated)</label>
                    <input required value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} placeholder="price, cost, how much" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition-all font-semibold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Automatic Reply</label>
                    <textarea required value={formData.response} onChange={e => setFormData({...formData, response: e.target.value})} placeholder="Hi! Our pricing starts from..." rows={4} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition-all font-semibold resize-none" />
                  </div>
                  <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-blue-600 transition-all shadow-xl shadow-slate-100 mt-4">
                    Create Automation
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Detail/Edit Card (Modal) */}
        <AnimatePresence>
          {isDetailModalOpen && selectedAuto && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden">
                <div className="p-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedAuto.name}</h2>
                      <p className="text-xs text-slate-400 font-medium">Auto-Reply Configuration</p>
                    </div>
                    <button 
                      onClick={() => handleToggle(selectedAuto.id, selectedAuto.enabled)}
                      className={cn("px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all", 
                        selectedAuto.enabled ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100")}
                    >
                      {selectedAuto.enabled ? 'Rule is Live' : 'Rule is Paused'}
                    </button>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Trigger Keywords</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedAuto.keywords.map(kw => (
                          <span key={kw} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl border border-slate-100">{kw}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Response Message</label>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic">
                        <p className="text-slate-700 font-medium leading-relaxed">"{selectedAuto.response}"</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                    <button onClick={() => handleDelete(selectedAuto.id)} className="flex items-center gap-2 text-red-500 font-bold text-xs hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                      Delete Rule
                    </button>
                    <button onClick={() => setIsDetailModalOpen(false)} className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-all">
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default ClientAutomationsPage;
