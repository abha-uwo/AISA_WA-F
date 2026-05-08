'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Loader2, Clock, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://127.0.0.1:8080/api/auth/register', formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4">
        <div className="bg-white p-10 rounded-[32px] shadow-2xl shadow-gray-200/50 border border-gray-100 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-500">
            <Clock size={40} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Waiting for Approval</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Your account has been created successfully. Our team will review your details and approve your account shortly.
          </p>
          <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-left border border-gray-100 italic">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1 text-center">Next Steps</p>
            <div className="flex items-start gap-3 mt-3">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
              <p className="text-sm text-gray-600">Admin reviews your business name</p>
            </div>
            <div className="flex items-start gap-3 mt-3">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
              <p className="text-sm text-gray-600">Access to dashboard is unlocked</p>
            </div>
          </div>
          <Link href="/auth/login" className="block w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-xl shadow-blue-200 mb-6 text-white">
          <Shield size={32} />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
        <p className="mt-2 text-sm text-gray-500 font-medium">Sign up to start sending messages.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-10 shadow-2xl shadow-gray-200/50 sm:rounded-3xl border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <input
                  type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Business Name</label>
                <input
                  type="text" required value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <input
                type="email" required value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <input
                type="password" required value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center">
                <input id="terms" type="checkbox" required className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                <label htmlFor="terms" className="ml-3 block text-xs text-gray-500 leading-tight">
                  I agree to the <Link href="/terms" className="text-blue-600 font-semibold">Terms</Link> and <Link href="/privacy" className="text-blue-600 font-semibold">Privacy Policy</Link>
                </label>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Sign Up'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <footer className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
