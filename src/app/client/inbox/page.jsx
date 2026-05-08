'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Search, Loader2, User, Phone, Mail, 
  MapPin, Send, Plus, MoreHorizontal, Filter, 
  Smile, Paperclip, Zap, ArrowLeft, Check, CheckCheck 
} from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ClientInboxPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConvoId, setSelectedConvoId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://127.0.0.1:8080/api/messages/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
        if (res.data.length > 0 && !selectedConvoId) {
          // Auto-select first unique sender
          const firstSender = [...new Set(res.data.map(m => m.from_address))][0];
          setSelectedConvoId(firstSender);
        }
      } catch (err) {
        console.error('Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedConvoId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedConvoId, messages]);

  // Group messages by from_address to create "Conversations"
  const conversations = messages.reduce((acc, msg) => {
    const contact = msg.from_address;
    if (!acc[contact]) {
      acc[contact] = {
        id: contact,
        name: contact,
        lastMessage: msg.body,
        time: msg.created_at,
        unread: msg.message_type === 'INCOMING' ? 1 : 0,
        messages: []
      };
    }
    acc[contact].messages.push(msg);
    // Sort messages within convo
    acc[contact].messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    // Update last message
    if (new Date(msg.created_at) > new Date(acc[contact].time)) {
      acc[contact].lastMessage = msg.body;
      acc[contact].time = msg.created_at;
    }
    return acc;
  }, {});

  const convoList = Object.values(conversations)
    .filter(c => c.id.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.time) - new Date(a.time));

  const activeConvo = conversations[selectedConvoId];

  return (
    <DashboardLayout role="CLIENT">
      <div className="h-[calc(100vh-180px)] flex flex-col">
        {/* Page Header (Optional, simplified) */}
        <div className="mb-6 flex items-center justify-between px-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inbox</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Customer Support</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                  <User size={14} className="text-slate-400" />
                </div>
              ))}
            </div>
            <span className="text-xs font-bold text-slate-400">+12 agents online</span>
          </div>
        </div>

        {/* Intercom Style Main Container */}
        <div className="flex-1 flex bg-white rounded-[40px] border border-slate-100 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.05)] overflow-hidden">
          
          {/* Column 1: Conversation List */}
          <aside className="w-96 border-r border-slate-50 flex flex-col bg-white shrink-0">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  type="text" placeholder="Search conversations..." 
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">All</button>
                <button className="px-4 py-1.5 text-slate-400 hover:bg-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-widest">Unassigned</button>
                <button className="ml-auto w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900"><Filter size={14} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-200" /></div>
              ) : convoList.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">No conversations</p>
                </div>
              ) : convoList.map((convo) => (
                <button 
                  key={convo.id} 
                  onClick={() => setSelectedConvoId(convo.id)}
                  className={cn(
                    "w-full p-6 text-left border-b border-slate-50 transition-all flex gap-4 hover:bg-slate-50/50",
                    selectedConvoId === convo.id ? "bg-blue-50/50 border-r-4 border-r-blue-500" : ""
                  )}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-lg">
                      {convo.name[0].toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white bg-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{convo.name}</p>
                      <p className="text-[10px] font-bold text-slate-300">
                        {new Date(convo.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 truncate leading-relaxed">
                      {convo.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Column 2: Active Chat Area */}
          <main className="flex-1 flex flex-col bg-white">
            {activeConvo ? (
              <>
                {/* Chat Header */}
                <header className="h-20 border-b border-slate-50 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                      {activeConvo.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">{activeConvo.name}</h2>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400">
                    <button className="hover:text-slate-900 transition-colors"><Zap size={18} /></button>
                    <button className="hover:text-slate-900 transition-colors"><MoreHorizontal size={18} /></button>
                  </div>
                </header>

                {/* Messages Feed */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/20 custom-scrollbar"
                >
                  <div className="flex flex-col items-center mb-10">
                    <span className="px-4 py-1.5 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] shadow-sm">
                      Today
                    </span>
                  </div>

                  {activeConvo.messages.map((msg, i) => {
                    const isIncoming = msg.message_type === 'INCOMING';
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        key={msg.id || i} 
                        className={cn("flex flex-col", isIncoming ? "items-start" : "items-end")}
                      >
                        <div className={cn(
                          "max-w-[70%] p-4 rounded-[24px] text-sm leading-relaxed shadow-sm transition-all hover:shadow-md",
                          isIncoming 
                            ? "bg-white text-slate-700 rounded-bl-none border border-slate-100" 
                            : "bg-blue-600 text-white rounded-br-none shadow-blue-100"
                        )}>
                          {msg.body}
                        </div>
                        <div className="mt-2 flex items-center gap-2 px-1">
                          <p className="text-[9px] font-bold text-slate-300 uppercase">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {!isIncoming && <CheckCheck size={12} className="text-blue-500" />}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Reply Box */}
                <div className="p-8 border-t border-slate-50 bg-white">
                  <div className="bg-slate-50 rounded-[32px] p-2 focus-within:ring-2 focus-within:ring-blue-100 transition-all border border-slate-100 shadow-inner">
                    <textarea 
                      rows={1}
                      placeholder="Type a message..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      className="w-full bg-transparent p-4 text-sm font-medium outline-none resize-none max-h-32"
                    />
                    <div className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-2 px-2">
                        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-white rounded-full hover:shadow-sm transition-all"><Plus size={18} /></button>
                        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-white rounded-full hover:shadow-sm transition-all"><Smile size={18} /></button>
                        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-white rounded-full hover:shadow-sm transition-all"><Paperclip size={18} /></button>
                      </div>
                      <button className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-blue-100">
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-20">
                <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
                  <MessageSquare size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Thread</h3>
                <p className="text-sm text-slate-400 italic max-w-xs">Select a conversation from the sidebar to start replying.</p>
              </div>
            )}
          </main>

          {/* Column 3: Customer Details (Intercom Sidebar) */}
          <aside className="w-80 border-l border-slate-50 bg-white p-8 overflow-y-auto shrink-0 hidden lg:block">
            {activeConvo ? (
              <div className="space-y-10">
                {/* Profile Card */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-slate-900 text-white rounded-[28px] flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-2xl shadow-slate-200">
                    {activeConvo.name[0].toUpperCase()}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{activeConvo.name}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active via WhatsApp</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Contact Detail</p>
                  <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm"><Phone size={14} /></div>
                    <span className="text-xs font-bold text-slate-600">{activeConvo.id}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 shadow-sm"><MapPin size={14} /></div>
                    <span className="text-xs font-bold text-slate-600">Mumbai, India</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Actions</p>
                  <button className="w-full py-3 px-4 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-3 hover:bg-slate-50 transition-all">
                    <User size={14} className="text-slate-400" /> View Profile
                  </button>
                  <button className="w-full py-3 px-4 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-3 hover:bg-slate-50 transition-all text-rose-600">
                    <Zap size={14} /> Close Conversation
                  </button>
                </div>

                {/* Tags */}
                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {['Priority', 'WhatsApp', 'Support'].map(tag => (
                      <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center opacity-20 grayscale">
                <User size={48} />
              </div>
            )}
          </aside>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default ClientInboxPage;
