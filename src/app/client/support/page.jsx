'use client';

import React from 'react';
import { LifeBuoy, Mail, MessageSquare } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const ClientSupportPage = () => {
  return (
    <DashboardLayout role="CLIENT">
      <div className="max-w-4xl mx-auto pb-20">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2 flex items-center gap-3">
            <LifeBuoy className="text-blue-500" size={32} /> Help & Support
          </h1>
          <p className="text-slate-500 font-medium italic">Get help setting up and managing your WhatsApp automation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Email Us</h3>
            <p className="text-slate-400 text-sm mb-4 italic">Our team responds within 24 hours.</p>
            <a href="mailto:support@aisaconnect.com" className="text-blue-600 font-bold text-sm hover:underline">
              support@aisaconnect.com
            </a>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">WhatsApp Us</h3>
            <p className="text-slate-400 text-sm mb-4 italic">Get instant help on WhatsApp.</p>
            <a href="https://wa.me/923001234567" target="_blank" rel="noreferrer" className="text-green-600 font-bold text-sm hover:underline">
              +92 300 1234567
            </a>
          </div>
        </div>

        <div className="bg-blue-50 rounded-[32px] border border-blue-100 p-8">
          <h3 className="font-black text-slate-900 mb-2">Quick Tips</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2"><span className="text-blue-500 font-black">→</span> Go to <strong>Channels</strong> to verify your WhatsApp is connected</li>
            <li className="flex items-start gap-2"><span className="text-blue-500 font-black">→</span> Create <strong>Automations</strong> to set up keyword-based auto-replies</li>
            <li className="flex items-start gap-2"><span className="text-blue-500 font-black">→</span> Check <strong>Inbox</strong> to see all incoming and outgoing messages</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientSupportPage;
