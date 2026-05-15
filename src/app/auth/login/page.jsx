'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Mail, Lock, Loader2, ChevronRight, User, ShieldCheck, Zap, FileText, X } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const LegalModal = ({ isOpen, onClose, title, content, fileUrl }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">{title}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Official Legal Documentation</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-10 custom-scrollbar">
          <div 
            className="prose prose-slate max-w-none prose-sm sm:prose-base"
            dangerouslySetInnerHTML={{ __html: content || '<p class="italic text-slate-400 text-center py-20">Our Legal Policy is currently being updated. Please check back shortly.</p>' }}
          />
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all">
            Close Viewer
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const LoginPage = () => {
  const [role, setRole] = useState('CLIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [legalData, setLegalData] = useState({ 
    privacy: { value: '', file: null }, 
    terms: { value: '', file: null } 
  });
  const [activeModal, setActiveModal] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLegal = async () => {
      try {
        const [privRes, termsRes] = await Promise.all([
          axios.get('http://127.0.0.1:8080/api/admin/settings/global?key=privacy_policy'),
          axios.get('http://127.0.0.1:8080/api/admin/settings/global?key=terms_of_service')
        ]);
        setLegalData({
          privacy: privRes.data,
          terms: termsRes.data
        });
      } catch (err) {
        console.error("Failed to fetch legal files for modals");
      }
    };
    fetchLegal();
  }, []);

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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-slate-900">
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

        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest">
            &copy; 2026 Aisaconnect Infrastructure
          </p>
          <div className="flex items-center gap-6">
            {(legalData.privacy.value || legalData.privacy.file) && (
              <>
                <button 
                  onClick={() => setActiveModal('privacy')}
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors"
                >
                  Privacy Policy
                </button>
                {(legalData.terms.value || legalData.terms.file) && <div className="w-1 h-1 bg-slate-300 rounded-full" />}
              </>
            )}
            {(legalData.terms.value || legalData.terms.file) && (
              <button 
                onClick={() => setActiveModal('terms')}
                className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-blue-600 transition-colors"
              >
                Terms of Service
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {activeModal === 'privacy' && (
          <LegalModal 
            isOpen={true} onClose={() => setActiveModal(null)} 
            title="Privacy Policy" 
            content={legalData.privacy.value} 
            fileUrl={legalData.privacy.file} 
          />
        )}
        {activeModal === 'terms' && (
          <LegalModal 
            isOpen={true} onClose={() => setActiveModal(null)} 
            title="Terms of Service" 
            content={legalData.terms.value} 
            fileUrl={legalData.terms.file} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;
