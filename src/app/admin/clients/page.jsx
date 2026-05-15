'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Mail, 
  ShieldCheck, 
  Loader2,
  Target,
  Zap,
  ChevronRight,
  ShieldAlert,
  Activity,
  Power,
  X,
  Globe,
  Key,
  Smartphone,
  Lock,
  MoreVertical,
  MessageSquare
} from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    email: '',
    whatsapp_access_token: '',
    whatsapp_phone_number_id: '',
  });

  const fetchClients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8080/api/clients/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(response.data);
    } catch (err) {
      console.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Terminate partner node access?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:8080/api/clients/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchClients();
    } catch (err) {
      alert('Termination failed.');
    }
    setActiveMenuId(null);
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await axios.patch(`http://127.0.0.1:8080/api/clients/${id}/`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchClients();
    } catch (err) {
      alert('Failed to update status.');
    }
    setActiveMenuId(null);
  };

  const handleMessageClient = (email) => {
    window.location.href = `mailto:${email}?subject=AisaConnect%20Support`;
    setActiveMenuId(null);
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:8080/api/clients/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAddModalOpen(false);
      setFormData({ business_name: '', email: '', whatsapp_access_token: '', whatsapp_phone_number_id: '' });
      fetchClients();
    } catch (err) {
      alert('Failed to provision partner node.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClients = clients.filter(c => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.business_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="ADMIN">
      <div className="max-w-7xl mx-auto pb-20 px-4 font-sans" onClick={() => setActiveMenuId(null)}>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Client List</h1>
            <p className="text-slate-500 font-medium italic">Manage your clients and their message settings here.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
               <input 
                  type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search clients..."
                  className="bg-white border border-slate-200 focus:border-blue-500 px-12 py-3.5 rounded-2xl outline-none w-[280px] font-bold text-xs transition-all shadow-sm italic placeholder:text-slate-300"
               />
            </div>
             <button 
                onClick={() => setIsAddModalOpen(true)}
                className="p-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 group"
             >
                <Plus size={24} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
             </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-24 flex flex-col items-center gap-4">
               <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading clients...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="col-span-full py-24 bg-white rounded-[32px] border border-slate-200 flex flex-col items-center text-center px-10 shadow-sm">
               <div className="w-16 h-16 bg-blue-50 text-blue-200 rounded-2xl flex items-center justify-center mb-6">
                  <Target size={32} />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">No clients found</h3>
               <p className="text-slate-500 max-w-sm font-medium italic">Add your first client to get started.</p>
            </div>
          ) : filteredClients.map((client, index) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              key={client._id || client.id}
              className="bg-white p-8 rounded-[32px] border border-slate-200 hover:border-blue-300 transition-all group relative shadow-sm hover:shadow-xl"
            >
              <div className="flex items-start justify-between mb-8">
                 <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 group-hover:rotate-12 transition-transform border border-blue-500">
                    <span className="text-2xl font-black italic uppercase leading-none">{(client.business_name || client.name || 'P')[0]}</span>
                 </div>
                 <div className="flex items-center gap-2 relative">
                    <div className={cn(
                       "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border italic",
                       client.status === 'ACTIVE' ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                    )}>
                       {client.status || 'ACTIVE'}
                    </div>
                    
                    {/* More Menu Toggle */}
                    <div className="relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === (client._id || client.id) ? null : (client._id || client.id)); }} 
                        className="p-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl text-slate-400 transition-colors border border-slate-100"
                      >
                         <MoreVertical size={20} />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeMenuId === (client._id || client.id) && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button onClick={() => handleMessageClient(client.email)} className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left">
                               <MessageSquare size={16} /> Send Message
                            </button>
                            <button onClick={() => handleStatusToggle(client._id || client.id, client.status || 'ACTIVE')} className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-semibold text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-colors text-left">
                               <Power size={16} /> {client.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </button>
                            <div className="h-[1px] bg-slate-100 my-1 mx-4" />
                            <button onClick={() => handleDelete(client._id || client.id)} className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors text-left">
                               <Trash2 size={16} /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                 </div>
              </div>

              <div className="space-y-2 mb-8">
                 <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase leading-none">{client.business_name || client.name}</h3>
                 <div className="flex items-center gap-2 text-slate-400">
                    <Mail size={16} strokeWidth={2.5} />
                    <span className="text-sm font-medium italic truncate">{client.email || 'No email provided'}</span>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                 <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]",
                      client.status === 'ACTIVE' ? "bg-green-500 animate-pulse" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                    )} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{client.status === 'ACTIVE' ? 'Online' : 'Inactive'}</span>
                 </div>
                 <button className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors italic group/access">
                    View Details <ChevronRight size={18} strokeWidth={4} className="group-hover/access:translate-x-1 transition-transform" />
                 </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Hub */}
        <div className="mt-16 p-10 bg-slate-50 rounded-[40px] border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-8 group">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm group-hover:rotate-12 transition-transform">
                 <ShieldAlert size={32} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
              <div>
                 <h3 className="text-xl font-bold text-slate-900 tracking-tight uppercase mb-1 leading-none">System Status</h3>
                 <p className="text-slate-500 text-sm font-medium italic leading-relaxed">Your system is secure. All messages are encrypted and protected.</p>
              </div>
           </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-black transition-all shadow-xl active:scale-95 italic group"
            >
               Add New Client
            </button>
         </div>

        {/* Add Client Modal */}
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsAddModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden border border-slate-200"
              >
                <div className="p-10">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none mb-2">Add Client</h2>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Set up a new client account</p>
                    </div>
                    <button onClick={() => setIsAddModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors">
                      <X size={24} />
                    </button>
                  </div>

                  {/* Channel Selector (Currently WhatsApp Only) */}
                  <div className="flex gap-4 mb-8">
                    <div className="flex-1 p-4 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center gap-2">
                       <Smartphone className="text-blue-600" size={24} />
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">WhatsApp</span>
                    </div>
                    <div className="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-2 opacity-40 cursor-not-allowed group relative">
                       <Globe className="text-slate-400" size={24} />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Facebook</span>
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-slate-900 text-white text-[8px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter">Locked</div>
                       </div>
                    </div>
                    <div className="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-2 opacity-40 cursor-not-allowed group relative">
                       <Smartphone className="text-slate-400" size={24} />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Instagram</span>
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-slate-900 text-white text-[8px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter">Locked</div>
                       </div>
                    </div>
                  </div>

                  <form onSubmit={handleAddClient} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Business Name</label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input 
                            required type="text" value={formData.business_name}
                            onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 px-12 py-4 rounded-2xl outline-none font-bold text-sm transition-all"
                            placeholder="e.g. AI Mall Global"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input 
                            required type="email" value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 px-12 py-4 rounded-2xl outline-none font-bold text-sm transition-all"
                            placeholder="client@domain.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">WhatsApp Access Token</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <textarea 
                          required value={formData.whatsapp_access_token}
                          onChange={(e) => setFormData({...formData, whatsapp_access_token: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 px-12 py-4 rounded-2xl outline-none font-bold text-sm transition-all h-24 resize-none"
                          placeholder="EAAhZ..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Phone Number ID</label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          required type="text" value={formData.whatsapp_phone_number_id}
                          onChange={(e) => setFormData({...formData, whatsapp_phone_number_id: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-100 focus:border-blue-500 px-12 py-4 rounded-2xl outline-none font-bold text-sm transition-all"
                          placeholder="1029384756..."
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" disabled={isSubmitting}
                      className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                      {isSubmitting ? 'Adding...' : 'Add Client'}
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default AdminClients;
