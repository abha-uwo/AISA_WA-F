'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, Mail, Lock, Loader2, ChevronRight, User, ShieldCheck, Zap } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [role, setRole] = useState('CLIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8080/api/auth/login', { email, password, role });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/client');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 blur-[120px] -mr-32 -mt-32 rounded-full" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/30 blur-[100px] -ml-24 -mb-24 rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-6">
            <Zap className="text-white" size={32} strokeWidth={2.5} fill="currentColor" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">AisaConnect<span className="text-blue-600">.</span></h1>
          <p className="text-slate-500 font-semibold uppercase tracking-widest text-[10px]">Cloud Messaging Infrastructure</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[32px] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          <div className="flex p-1.5 gap-1.5 bg-slate-50 rounded-[24px] mb-8">
            <button
              onClick={() => setRole('CLIENT')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] transition-all font-bold text-[11px] uppercase tracking-wider",
                role === 'CLIENT' ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <User size={16} strokeWidth={2.5} />
              Partner
            </button>
            <button
              onClick={() => setRole('ADMIN')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] transition-all font-bold text-[11px] uppercase tracking-wider",
                role === 'ADMIN' ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Shield size={16} strokeWidth={2.5} />
              Admin
            </button>
          </div>

          <form onSubmit={handleLogin} className="px-8 pb-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-4 pl-12 pr-6 text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide ml-1">Access Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-[18px] py-4 pl-12 pr-6 text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600">
                <ShieldCheck size={18} className="shrink-0" />
                <p className="text-xs font-semibold">{error}</p>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-[18px] font-bold uppercase tracking-widest text-[12px] transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-100 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>Launch Session<ChevronRight size={18} strokeWidth={3} /></>
              )}
            </button>

            {role === 'CLIENT' && (
              <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Don't have an account? <Link href="/auth/register" className="text-blue-600 hover:underline">Create Account</Link>
              </p>
            )}
          </form>

          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Status: Online</p>
          </div>
        </div>

        <p className="text-center mt-10 text-slate-400 text-[11px] font-semibold uppercase tracking-widest">
          &copy; 2026 Aisaconnect Infrastructure
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
