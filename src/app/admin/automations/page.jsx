'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Search, Loader2, ArrowRight, Activity, X } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { cn } from '@/lib/utils';

const AdminAutomationsPage = () => {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selectedClientDetails, setSelectedClientDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8080/api/admin/automations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAutomations(response.data);
    } catch (err) {
      console.error('Failed to fetch global automations');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientDetails = async (id) => {
    try {
      setDetailsLoading(true);
      setIsDetailsModalOpen(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://127.0.0.1:8080/api/clients/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedClientDetails(response.data);
    } catch (err) {
      console.error('Failed to fetch details');
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => { fetchAutomations(); }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://127.0.0.1:8080/api/clients/${id}/`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAutomations();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredAutomations = automations.filter(aut => {
    const matchesSearch = aut.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          aut.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'ALL' || (filter === 'ACTIVE' ? aut.enabled : !aut.enabled);
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout role="ADMIN">
      <div className="max-w-7xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Zap className="text-yellow-500 fill-yellow-500" size={32} />
              All Automations
            </h1>
            <p className="text-gray-500 mt-1 font-medium">See all automatic replies set up by your clients.</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-4 py-2 bg-yellow-50 rounded-xl border border-yellow-100">
              <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest leading-none mb-1">Total Active</p>
              <p className="text-xl font-black text-gray-900 leading-none">{automations.filter(a => a.enabled).length}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text" placeholder="Search by name or client..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-medium"
            />
          </div>
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            {['ALL', 'ACTIVE', 'PAUSED'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn("px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  filter === f ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
                )}
              >{f}</button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Client</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Name</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Trigger</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading data...</p>
                  </div>
                </td></tr>
              ) : filteredAutomations.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium">
                  No automations found matching your query.
                </td></tr>
              ) : filteredAutomations.map((aut) => (
                <tr key={aut._id || aut.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">
                        {aut.clientName?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-900">{aut.clientName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{aut.name}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Trigger: {aut.triggerType || 'KEYWORD'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{aut.triggerType}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest border uppercase",
                      aut.enabled ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-400 border-gray-100"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", aut.enabled ? "bg-green-500" : "bg-gray-300")} />
                      {aut.enabled ? 'Active' : 'Paused'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button onClick={() => fetchClientDetails(aut.clientId || aut._id)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-all">
                      <ArrowRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {isDetailsModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                onClick={() => setIsDetailsModalOpen(false)}
              />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden"
              >
                {detailsLoading ? (
                  <div className="p-20 flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Client Profile...</p>
                  </div>
                ) : selectedClientDetails && (
                  <>
                    <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">{selectedClientDetails.business_name}</h2>
                        <p className="text-sm text-gray-400 mt-1">WhatsApp Phone ID: {selectedClientDetails.whatsapp_phone_number_id || 'Not configured'}</p>
                      </div>
                      <button onClick={() => setIsDetailsModalOpen(false)} className="p-3 hover:bg-white rounded-2xl text-gray-400 transition-colors">
                        <X size={24} />
                      </button>
                    </div>
                    <div className="p-8">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Automation Enabled</p>
                      <p className="font-bold text-gray-900 mt-1">{selectedClientDetails.automation_enabled ? 'Yes' : 'No'}</p>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default AdminAutomationsPage;
