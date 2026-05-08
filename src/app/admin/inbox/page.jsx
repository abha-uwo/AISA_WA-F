'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Loader2, Zap, Activity, X, Globe, Smartphone, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { cn } from '@/lib/utils';

const AdminInboxPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selectedClientDetails, setSelectedClientDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:8080/api/admin/messages', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(response.data);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          msg.body?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          msg.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'ALL' || msg.type === filter || msg.channel === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout role="ADMIN">
      <div className="max-w-7xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <MessageSquare className="text-blue-500" size={32} />
              Messages
            </h1>
            <p className="text-gray-500 mt-1 font-medium">View all messages sent and received by your clients.</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Messages</p>
            <p className="text-2xl font-black text-gray-900">{messages.length}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text" placeholder="Search messages..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-medium"
            />
          </div>
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
            {['ALL', 'INCOMING', 'OUTGOING', 'WHATSAPP'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn("px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
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
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">From</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Client</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Message</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Channel</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Type</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center">
                  <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
                </td></tr>
              ) : filteredMessages.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center text-gray-400 font-medium italic">
                  No messages found yet.
                </td></tr>
              ) : filteredMessages.map((msg, i) => (
                <tr key={msg._id || msg.id || i} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-8 py-5 font-bold text-gray-900 text-sm">{msg.from_address || msg.from}</td>
                  <td className="px-8 py-5 text-gray-500 font-medium text-sm">{msg.clientName || '-'}</td>
                  <td className="px-8 py-5 max-w-[250px]">
                    <p className="text-sm text-gray-700 truncate font-medium">{msg.body}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border bg-green-50 text-green-600 border-green-100">
                      {msg.channel || 'WHATSAPP'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border",
                      msg.message_type === 'INCOMING' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"
                    )}>
                      {msg.message_type || msg.type}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-[10px] font-black text-gray-900">{new Date(msg.created_at || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(msg.created_at || msg.createdAt).toLocaleDateString()}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminInboxPage;
