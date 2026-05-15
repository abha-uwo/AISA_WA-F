'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Scale, Save, Loader2, CheckCircle2, AlertCircle, FileText, Upload, Trash2, Eye } from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { motion } from 'framer-motion';

const LegalSettings = () => {
  const [privacy, setPrivacy] = useState('');
  const [terms, setTerms] = useState('');
  const [privacyFile, setPrivacyFile] = useState(null);
  const [termsFile, setTermsFile] = useState(null);
  const [currentPrivacyFile, setCurrentPrivacyFile] = useState(null);
  const [currentTermsFile, setCurrentTermsFile] = useState(null);
  const [deletePrivacyFile, setDeletePrivacyFile] = useState(false);
  const [deleteTermsFile, setDeleteTermsFile] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({ key: '', state: false });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const [privacyRes, termsRes] = await Promise.all([
          axios.get('http://127.0.0.1:8080/api/admin/settings/global?key=privacy_policy', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://127.0.0.1:8080/api/admin/settings/global?key=terms_of_service', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setPrivacy(privacyRes.data.value || '');
        setTerms(termsRes.data.value || '');
        setCurrentPrivacyFile(privacyRes.data.file);
        setCurrentTermsFile(termsRes.data.file);
      } catch (err) {
        console.error('Failed to fetch legal settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (key, value, file, shouldDelete) => {
    setSaving({ key, state: true });
    setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('key', key);
      formData.append('value', value);
      
      if (file) {
        formData.append('file', file);
      } else if (shouldDelete) {
        formData.append('delete_file', 'true');
      }

      const res = await axios.post('http://127.0.0.1:8080/api/admin/settings/global', 
        formData,
        { headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      
      if (key === 'privacy_policy') {
        setCurrentPrivacyFile(res.data.file);
        setPrivacy(res.data.value); // Update text with extracted content
        setPrivacyFile(null);
        setDeletePrivacyFile(false);
      } else {
        setCurrentTermsFile(res.data.file);
        setTerms(res.data.value); // Update text with extracted content
        setTermsFile(null);
        setDeleteTermsFile(false);
      }

      setMessage({ type: 'success', text: `${key.replace('_', ' ')} updated successfully!` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setSaving({ key: '', state: false });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const removePrivacyFile = () => {
    setCurrentPrivacyFile(null);
    setPrivacyFile(null);
    setDeletePrivacyFile(true);
  };

  const removeTermsFile = () => {
    setCurrentTermsFile(null);
    setTermsFile(null);
    setDeleteTermsFile(true);
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="max-w-5xl mx-auto pb-20 px-4 font-sans">
        
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Scale className="text-blue-600" size={32} />
              Legal Compliance Settings
            </h1>
            <p className="text-slate-500 mt-2 font-medium italic">Configure the dynamic content and official documents for your platform.</p>
          </div>
          <div className="hidden md:block">
            <div className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-[0.2em] italic">Database Connected</div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading legal data...</p>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Status Message */}
            {message.text && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl flex items-center gap-3 border ${
                  message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
                }`}
              >
                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <p className="text-xs font-bold uppercase tracking-wide">{message.text}</p>
              </motion.div>
            )}

            {/* Privacy Policy Section */}
            <div className="bg-white rounded-[48px] border border-slate-100 p-10 shadow-xl shadow-slate-100/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-[20px] flex items-center justify-center shadow-inner shadow-blue-100/50">
                    <Shield size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Privacy Policy</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">HTML & Document Upload</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleSave('privacy_policy', privacy, privacyFile, deletePrivacyFile)}
                  disabled={saving.state}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                >
                  {saving.state && saving.key === 'privacy_policy' ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Publish Changes
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Policy Content (HTML)</label>
                  <textarea 
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value)}
                    placeholder="Enter Privacy Policy content (HTML allowed)..."
                    className="w-full h-[400px] bg-slate-50 border border-slate-100 rounded-[32px] p-8 outline-none focus:border-blue-500 focus:bg-white transition-all font-mono text-sm leading-relaxed"
                  />
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <Upload size={14} className="text-blue-600" /> Upload PDF/DOC
                    </h3>
                    <input 
                      type="file" 
                      onChange={(e) => {
                        setPrivacyFile(e.target.files[0]);
                        setDeletePrivacyFile(false);
                      }}
                      className="hidden" id="privacy-file"
                    />
                    <label 
                      htmlFor="privacy-file"
                      className="w-full p-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
                    >
                      <FileText className="text-slate-300 group-hover:text-blue-600 transition-colors" size={24} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                        {privacyFile ? privacyFile.name : 'Click to Upload'}
                      </span>
                    </label>
                    {(currentPrivacyFile || privacyFile) && (
                      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                        <div className="flex flex-col">
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">File Attached:</p>
                          <a 
                            href={privacyFile ? URL.createObjectURL(privacyFile) : `http://127.0.0.1:8080${currentPrivacyFile}`} 
                            target="_blank" 
                            className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Eye size={12} /> View
                          </a>
                        </div>
                        <button 
                          onClick={removePrivacyFile}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Terms of Service Section */}
            <div className="bg-white rounded-[48px] border border-slate-100 p-10 shadow-xl shadow-slate-100/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-[20px] flex items-center justify-center shadow-inner shadow-purple-100/50">
                    <Scale size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Terms of Service</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">HTML & Document Upload</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleSave('terms_of_service', terms, termsFile, deleteTermsFile)}
                  disabled={saving.state}
                  className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 disabled:opacity-50"
                >
                  {saving.state && saving.key === 'terms_of_service' ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Publish Changes
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Agreement Content (HTML)</label>
                  <textarea 
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="Enter Terms of Service content (HTML allowed)..."
                    className="w-full h-[400px] bg-slate-50 border border-slate-100 rounded-[32px] p-8 outline-none focus:border-purple-500 focus:bg-white transition-all font-mono text-sm leading-relaxed"
                  />
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <Upload size={14} className="text-purple-600" /> Upload PDF/DOC
                    </h3>
                    <input 
                      type="file" 
                      onChange={(e) => {
                        setTermsFile(e.target.files[0]);
                        setDeleteTermsFile(false);
                      }}
                      className="hidden" id="terms-file"
                    />
                    <label 
                      htmlFor="terms-file"
                      className="w-full p-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all group"
                    >
                      <FileText className="text-slate-300 group-hover:text-purple-600 transition-colors" size={24} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                        {termsFile ? termsFile.name : 'Click to Upload'}
                      </span>
                    </label>
                    {(currentTermsFile || termsFile) && (
                      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                        <div className="flex flex-col">
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">File Attached:</p>
                          <a 
                            href={termsFile ? URL.createObjectURL(termsFile) : `http://127.0.0.1:8080${currentTermsFile}`} 
                            target="_blank" 
                            className="text-[10px] font-bold text-purple-600 hover:underline flex items-center gap-1"
                          >
                            <Eye size={12} /> View
                          </a>
                        </div>
                        <button 
                          onClick={removeTermsFile}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Help Note */}
            <div className="bg-slate-900 rounded-[32px] p-8 text-white flex items-center gap-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                <AlertCircle size={24} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1 opacity-60">Pro Tip</p>
                <p className="text-sm font-medium leading-relaxed opacity-80">
                  Uploading a document will provide a download link on the public page, but you should still fill in the **HTML Content** box so Meta's crawlers can verify your policy automatically.
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LegalSettings;
