'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, UserX, Loader2, Search, Building2, Mail, Clock } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { cn } from '@/lib/utils';

const AdminApprovalsPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8080/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (userId, status) => {
    setProcessingId(userId);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://127.0.0.1:8080/api/admin/users/${userId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingUsers = filteredUsers.filter(u => u.status === 'PENDING');
  const otherUsers = filteredUsers.filter(u => u.status !== 'PENDING');

  return (
    <DashboardLayout role="ADMIN">
      <div className="max-w-7xl mx-auto pb-20">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-blue-600" size={32} />
            Approve Users
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Approve new users who have signed up.</p>
        </div>

        <div className="relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" placeholder="Search by name, email or business..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[24px] outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-sm shadow-sm"
          />
        </div>

        {/* Pending Approvals Section */}
        <div className="mb-12">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 italic">
            <Clock size={14} className="text-amber-500" /> Waiting for Approval ({pendingUsers.length})
          </h2>
          
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fetching registrations...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[32px] p-12 text-center">
              <p className="text-slate-400 font-medium italic">No pending registrations at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {pendingUsers.map((user, index) => (
                  <motion.div 
                    key={user.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                    className="bg-white p-8 rounded-[32px] border border-amber-100 shadow-xl shadow-amber-50/50 relative group overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4">
                      <span className="bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-amber-100 italic">Pending</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-black text-xl border border-amber-100">
                        {user.name[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 leading-none mb-1">{user.name}</h3>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-tight">
                          <Building2 size={12} /> {user.businessName}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-slate-500 text-xs font-medium italic">
                        <Mail size={14} className="text-slate-300" /> {user.email}
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 text-xs font-medium italic">
                        <Clock size={14} className="text-slate-300" /> Joined {new Date(user.date_joined).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleUpdateStatus(user.id, 'APPROVED')}
                        disabled={processingId === user.id}
                        className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
                      >
                        {processingId === user.id ? <Loader2 className="animate-spin" size={14} /> : <UserCheck size={14} />}
                        Approve
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(user.id, 'REJECTED')}
                        disabled={processingId === user.id}
                        className="px-4 py-3.5 bg-slate-50 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100 disabled:opacity-50"
                      >
                        <UserX size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Existing Users Section */}
        <div>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 italic">All Users ({otherUsers.length})</h2>
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Business</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {otherUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium italic">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-semibold text-slate-600">{user.businessName}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border italic",
                        user.status === 'APPROVED' ? "bg-green-50 text-green-600 border-green-100" : 
                        user.status === 'REJECTED' ? "bg-red-50 text-red-600 border-red-100" : 
                        "bg-slate-50 text-slate-400 border-slate-100"
                      )}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleUpdateStatus(user.id, user.status === 'SUSPENDED' ? 'APPROVED' : 'SUSPENDED')}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors italic"
                      >
                        {user.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminApprovalsPage;
