'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, X, Zap, Edit2, Save, MessageSquare, PlusCircle, LayoutGrid, Type } from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ClientAutomationsPage = () => {
  const [automations, setAutomations] = useState([]);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuto, setSelectedAuto] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', trigger_type: 'KEYWORD', keywords: '', response: '', buttons: [] });
  const [editFormData, setEditFormData] = useState({ name: '', trigger_type: 'KEYWORD', keywords: '', response: '', buttons: [] });
  
  // Greeting Message States
  const [isGreetingModalOpen, setIsGreetingModalOpen] = useState(false);
  // AI Assistant States
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiData, setAIData] = useState({ enabled: false, context: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const autoRes = await axios.get('http://127.0.0.1:8080/api/automations/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAutomations(autoRes.data);

      const profileRes = await axios.get('http://127.0.0.1:8080/api/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClient(profileRes.data.client);
      setGreetingData({
        enabled: profileRes.data.client.greeting_enabled,
        message: profileRes.data.client.greeting_message || '',
        buttons: profileRes.data.client.greeting_buttons || []
      });
      setAIData({
        enabled: profileRes.data.client.ai_enabled,
        context: profileRes.data.client.ai_context || ''
      });
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateAI = async (newData = null) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      const dataToSend = newData || aiData;
      
      const res = await axios.patch('http://127.0.0.1:8080/api/profile', {
        ai_enabled: dataToSend.enabled,
        ai_context: dataToSend.context
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setClient(res.data);
      setIsAIModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to update AI settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateGreeting = async (newData = null) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      const dataToSend = newData || greetingData;
      
      const res = await axios.patch('http://127.0.0.1:8080/api/profile', {
        greeting_enabled: dataToSend.enabled,
        greeting_message: dataToSend.message,
        greeting_buttons: dataToSend.buttons
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setClient(res.data);
      setIsGreetingModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to update greeting');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:8080/api/automations/', {
        ...formData,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
        buttons: formData.buttons.filter(b => b.trim()),
        enabled: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      setFormData({ name: '', trigger_type: 'KEYWORD', keywords: '', response: '', buttons: [] });
      fetchData();
    } catch (err) {
      alert('Failed to create automation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      const res = await axios.patch(`http://127.0.0.1:8080/api/automations/${selectedAuto.id}/`, {
        ...editFormData,
        keywords: typeof editFormData.keywords === 'string' ? editFormData.keywords.split(',').map(k => k.trim()).filter(Boolean) : editFormData.keywords,
        buttons: editFormData.buttons.filter(b => b.trim())
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSelectedAuto(res.data);
      setIsEditing(false);
      fetchData();
    } catch (err) {
      alert('Failed to update automation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(`http://127.0.0.1:8080/api/automations/${id}/`, {
        enabled: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      if (selectedAuto && selectedAuto.id === id) {
        setSelectedAuto(res.data);
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
      fetchData();
    } catch (err) {
      console.error('Delete failed');
    }
  };

  const openDetail = (auto) => {
    setSelectedAuto(auto);
    setEditFormData({
      name: auto.name,
      trigger_type: 'KEYWORD',
      keywords: auto.keywords.join(', '),
      response: auto.response,
      buttons: auto.buttons || []
    });
    setIsEditing(false);
    setIsDetailModalOpen(true);
  };

  const addButton = (isNew, isGreeting = false) => {
    if (isGreeting) {
      if (greetingData.buttons.length < 3) {
        setGreetingData({ ...greetingData, buttons: [...greetingData.buttons, ''] });
      }
    } else if (isNew) {
      if (formData.buttons.length < 3) {
        setFormData({ ...formData, buttons: [...formData.buttons, ''] });
      }
    } else {
      if (editFormData.buttons.length < 3) {
        setEditFormData({ ...editFormData, buttons: [...editFormData.buttons, ''] });
      }
    }
  };

  return (
    <DashboardLayout role="CLIENT">
      <div className="max-w-full mx-auto pb-20 px-8">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Auto Replies</h1>
            <p className="text-slate-500 font-medium italic">Manage how your bot responds to customers.</p>
          </div>
          <button
            onClick={() => setIsChoiceModalOpen(true)}
            className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-100 flex items-center gap-2"
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
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Type / Keywords</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Response Message</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {/* Global Greeting Row (Always on top if enabled or configured) */}
              {client && (
                <tr 
                  onClick={() => setIsGreetingModalOpen(true)}
                  className="bg-blue-50/10 hover:bg-blue-50/30 cursor-pointer transition-colors group"
                >
                  <td className="px-8 py-6 text-sm font-bold text-blue-300 italic">★</td>
                  <td className="px-8 py-6">
                    <span className="px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest">Greeting Message</span>
                  </td>
                  <td className="px-8 py-6 text-sm font-semibold text-slate-900 tracking-tight truncate max-w-lg italic">
                    {greetingData.message || 'Click to configure welcome message...'}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest", greetingData.enabled ? "text-emerald-500" : "text-slate-300")}>
                        {greetingData.enabled ? 'Active' : 'Disabled'}
                      </span>
                      <div className={cn("w-2 h-2 rounded-full", greetingData.enabled ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-200")} />
                    </div>
                  </td>
                </tr>
              )}

              {/* AI Assistant Row */}
              {client && (
                <tr 
                  onClick={() => setIsAIModalOpen(true)}
                  className="bg-purple-50/10 hover:bg-purple-50/30 cursor-pointer transition-colors group"
                >
                  <td className="px-8 py-6 text-sm font-bold text-purple-300 italic">✨</td>
                  <td className="px-8 py-6">
                    <span className="px-2.5 py-1 bg-purple-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest">AI Smart Reply</span>
                  </td>
                  <td className="px-8 py-6 text-sm font-semibold text-slate-900 tracking-tight truncate max-w-lg italic">
                    {aiData.enabled ? `Enabled: ${aiData.context.substring(0, 50)}...` : 'Automate replies using OpenAI...'}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest", aiData.enabled ? "text-emerald-500" : "text-slate-300")}>
                        {aiData.enabled ? 'Smart' : 'Off'}
                      </span>
                      <div className={cn("w-2 h-2 rounded-full", aiData.enabled ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-200")} />
                    </div>
                  </td>
                </tr>
              )}

              {loading ? (
                <tr><td colSpan="4" className="py-20 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" /></td></tr>
              ) : (
                automations.map((auto, i) => (
                  <tr 
                    key={auto.id} 
                    onClick={() => openDetail(auto)}
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

        {/* Choice Modal (Selection) */}
        <AnimatePresence>
          {isChoiceModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsChoiceModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl p-10">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Auto Reply</h2>
                  <button onClick={() => setIsChoiceModalOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={24} /></button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Option 1: Greeting */}
                  <button 
                    onClick={() => { setIsChoiceModalOpen(false); setIsGreetingModalOpen(true); }}
                    className="flex flex-col items-center text-center p-8 bg-blue-50/50 border-2 border-transparent hover:border-blue-600 rounded-[32px] transition-all group"
                  >
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
                      <Zap size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Greeting Message</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Send a welcome message automatically when a customer first starts a chat.</p>
                  </button>

                  {/* Option 2: Keyword */}
                  <button 
                    onClick={() => { setIsChoiceModalOpen(false); setIsModalOpen(true); }}
                    className="flex flex-col items-center text-center p-8 bg-slate-50 border-2 border-transparent hover:border-slate-900 rounded-[32px] transition-all group"
                  >
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-slate-100 group-hover:scale-110 transition-transform">
                      <Type size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Keyword Match</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Respond automatically when specific words or phrases are found in a message.</p>
                  </button>

                  {/* Option 3: AI */}
                  <button 
                    onClick={() => { setIsChoiceModalOpen(false); setIsAIModalOpen(true); }}
                    className="flex flex-col items-center text-center p-8 bg-purple-50/50 border-2 border-transparent hover:border-purple-600 rounded-[32px] transition-all group md:col-span-2"
                  >
                    <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-100 group-hover:scale-110 transition-transform">
                      <MessageSquare size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">AI Smart Assistant</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Let OpenAI handle complex customer queries automatically using your business context.</p>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Create Keyword Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">New Keyword Rule</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={24} /></button>
                </div>
                <form onSubmit={handleCreate} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Rule Name</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Price Query" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition-all font-semibold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Keywords (comma separated)</label>
                    <input required value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} placeholder="price, cost, how much" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition-all font-semibold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Bot Reply</label>
                    <textarea required value={formData.response} onChange={e => setFormData({...formData, response: e.target.value})} placeholder="Hi! Our pricing is..." rows={4} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition-all font-semibold resize-none" />
                  </div>
                  <button type="submit" disabled={isSaving} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-2">
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Create Rule'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Greeting Message Modal */}
        <AnimatePresence>
          {isGreetingModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsGreetingModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Greeting Message</h2>
                    <p className="text-xs text-slate-400 font-medium">Automatic welcome response for new chats.</p>
                  </div>
                  <button onClick={() => setIsGreetingModalOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={24} /></button>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enable Greeting Message</span>
                    <button 
                      onClick={() => setGreetingData({...greetingData, enabled: !greetingData.enabled})}
                      className={cn("w-12 h-6 rounded-full p-1 transition-all", greetingData.enabled ? "bg-emerald-500" : "bg-slate-200")}
                    >
                      <div className={cn("w-4 h-4 bg-white rounded-full transition-all transform", greetingData.enabled ? "translate-x-6" : "translate-x-0")} />
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Message Content</label>
                    <textarea 
                      value={greetingData.message} 
                      onChange={e => setGreetingData({...greetingData, message: e.target.value})} 
                      placeholder="Hi! Welcome to AisaConnect..." 
                      rows={4} 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 transition-all font-semibold resize-none" 
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Action Buttons</label>
                      {greetingData.buttons.length < 3 && (
                        <button onClick={() => addButton(false, true)} className="text-blue-600 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 hover:text-blue-700">
                          <PlusCircle size={14} /> Add
                        </button>
                      )}
                    </div>
                    {greetingData.buttons.map((btn, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input value={btn} onChange={(e) => {
                          const nb = [...greetingData.buttons];
                          nb[idx] = e.target.value;
                          setGreetingData({...greetingData, buttons: nb});
                        }} className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold" placeholder="Button text" />
                        <button onClick={() => setGreetingData({...greetingData, buttons: greetingData.buttons.filter((_, i) => i !== idx)})} className="p-3 text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => handleUpdateGreeting()} 
                    disabled={isSaving}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Save Greeting Settings'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* AI Assistant Modal */}
        <AnimatePresence>
          {isAIModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAIModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight text-purple-600">AI Assistant</h2>
                    <p className="text-xs text-slate-400 font-medium">Power your bot with OpenAI Intelligence.</p>
                  </div>
                  <button onClick={() => setIsAIModalOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={24} /></button>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-purple-50/30 rounded-2xl border border-purple-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-600 rounded-lg text-white">
                        <Zap size={14} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enable AI Smart Reply</span>
                    </div>
                    <button 
                      onClick={() => setAIData({...aiData, enabled: !aiData.enabled})}
                      className={cn("w-12 h-6 rounded-full p-1 transition-all", aiData.enabled ? "bg-emerald-500" : "bg-slate-200")}
                    >
                      <div className={cn("w-4 h-4 bg-white rounded-full transition-all transform", aiData.enabled ? "translate-x-6" : "translate-x-0")} />
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Business Context (Bio)</label>
                    <textarea 
                      value={aiData.context} 
                      onChange={e => setAIData({...aiData, context: e.target.value})} 
                      placeholder="e.g. We are a digital agency specializing in WhatsApp marketing. We offer three packages: Basic ($50), Pro ($150), and Enterprise ($500)..." 
                      rows={6} 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-purple-500 transition-all font-semibold resize-none text-sm" 
                    />
                    <p className="mt-2 text-[10px] text-slate-400 italic">This info helps the AI answer questions about your business on your behalf.</p>
                  </div>

                  <button 
                    onClick={() => handleUpdateAI()} 
                    disabled={isSaving}
                    className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Save AI Settings'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Detail Modal (Standard Keyword) */}
        <AnimatePresence>
          {isDetailModalOpen && selectedAuto && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDetailModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{isEditing ? 'Edit Rule' : selectedAuto.name}</h2>
                  <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors"><X size={24} /></button>
                </div>
                
                {isEditing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Keywords</label>
                      <input value={editFormData.keywords} onChange={e => setEditFormData({...editFormData, keywords: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-semibold outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Reply</label>
                      <textarea value={editFormData.response} onChange={e => setEditFormData({...editFormData, response: e.target.value})} rows={4} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-semibold outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex justify-end gap-3">
                      <button onClick={() => setIsEditing(false)} className="px-6 py-3 text-slate-400 font-bold text-xs uppercase tracking-widest">Cancel</button>
                      <button onClick={handleUpdate} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600">Save Changes</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Keywords</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedAuto.keywords.map(kw => (
                          <span key={kw} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-100">{kw}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Reply</label>
                      <p className="text-slate-700 font-medium bg-slate-50 p-6 rounded-3xl italic">"{selectedAuto.response}"</p>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                      <button onClick={() => handleDelete(selectedAuto.id)} className="text-red-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        <Trash2 size={16} /> Delete Rule
                      </button>
                      <button onClick={() => setIsEditing(true)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest">Edit Rule</button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default ClientAutomationsPage;
