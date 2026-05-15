'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Loader2, FileText, Shield } from 'lucide-react';

export default function PrivacyPage() {
  const [content, setContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8080/api/admin/settings/global?key=privacy_policy');
        setContent(res.data.value || '');
        setFileUrl(res.data.file || '');
      } catch (err) {
        console.error('Failed to fetch privacy policy');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-16 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 flex items-center justify-between">
          <Link href="/auth/login" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-2 italic">
            ← Back to Login
          </Link>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">A</div>
        </div>
        
        <div className="mb-12">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2 uppercase italic leading-none">Privacy Policy</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] ml-1 opacity-60">Legal Documentation & Data Protection</p>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-100" size={64} />
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Syncing legal node...</p>
          </div>
        ) : (
          <div className="bg-white rounded-[48px] border border-slate-100 p-12 md:p-16 shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 blur-[100px] -mr-32 -mt-32 rounded-full" />
            
            <div 
              className="prose prose-slate max-w-none relative z-10"
              dangerouslySetInnerHTML={{ 
                __html: content || `
                  <div class="text-center py-10">
                    <p class="text-slate-400 italic">Our Privacy Policy is currently being updated by the administration. Please check back shortly.</p>
                  </div>
                ` 
              }}
            />
          </div>
        )}

        <footer className="mt-12 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">&copy; 2026 Aisaconnect Infrastructure</p>
        </footer>
      </div>
    </div>
  );
}
