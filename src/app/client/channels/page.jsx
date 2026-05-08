'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Lock, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { cn } from '@/lib/utils';

const ClientChannelsPage = () => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const res = await axios.get(`http://127.0.0.1:8080/api/clients/${user.client}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClient(res.data);
      } catch (err) {
        console.error('Failed to fetch client');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const channels = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'green',
      active: true,
      connected: !!client?.whatsapp_phone_number_id,
      detail: client?.whatsapp_phone_number_id || 'Not configured',
      description: 'Send automatic replies on WhatsApp.'
    },
    {
      name: 'Facebook',
      icon: Lock,
      color: 'blue',
      active: false,
      connected: false,
      detail: 'Coming soon',
      description: 'Connect your Facebook Page for auto replies.'
    },
    {
      name: 'Instagram',
      icon: Lock,
      color: 'pink',
      active: false,
      connected: false,
      detail: 'Coming soon',
      description: 'Automate Instagram DMs and replies.'
    },
  ];

  return (
    <DashboardLayout role="CLIENT">
      <div className="max-w-4xl mx-auto pb-20">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">My Channels</h1>
          <p className="text-slate-500 font-medium italic">Connected platforms and their status.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {channels.map((ch) => (
              <div key={ch.name} className={cn(
                "bg-white rounded-[40px] border p-10 flex flex-col items-center text-center transition-all group relative overflow-hidden",
                ch.active 
                  ? "border-slate-100 premium-shadow hover-lift" 
                  : "border-slate-50 opacity-40 grayscale"
              )}>
                {/* Status Indicator */}
                <div className="absolute top-6 right-6">
                  {ch.active && ch.connected ? (
                    <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse shadow-lg", 
                      ch.name === 'WhatsApp' ? "bg-emerald-500 shadow-emerald-200" :
                      ch.name === 'Facebook' ? "bg-blue-500 shadow-blue-200" :
                      "bg-pink-500 shadow-pink-200"
                    )} />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  )}
                </div>

                <div className={cn(
                  "w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 transition-all duration-700 shadow-2xl",
                  !ch.active 
                    ? "bg-slate-100 text-slate-300 shadow-none" 
                    : ch.name === 'WhatsApp' ? "bg-emerald-600 text-white shadow-emerald-100" :
                      ch.name === 'Facebook' ? "bg-blue-600 text-white shadow-blue-100" :
                      "bg-pink-500 text-white shadow-pink-100"
                )}>
                  <ch.icon size={40} strokeWidth={2} />
                </div>

                <div className="mb-8 flex-1">
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <h3 className="font-semibold text-slate-900 text-2xl tracking-tight">{ch.name}</h3>
                    {!ch.active && (
                      <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-medium rounded-full italic">Locked</span>
                    )}
                  </div>

                </div>

                <div className="w-full flex justify-center">
                  {ch.active ? (
                    ch.connected ? (
                      <div className={cn("px-6 py-2.5 rounded-full border flex items-center justify-center gap-2",
                        ch.name === 'WhatsApp' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        ch.name === 'Facebook' ? "bg-blue-50 text-blue-600 border-blue-100" :
                        "bg-pink-50 text-pink-600 border-pink-100"
                      )}>
                        <CheckCircle size={14} strokeWidth={2} />
                        <span className="text-[11px] font-semibold tracking-wide">Connected</span>
                      </div>
                    ) : (
                      <button className={cn("px-8 py-3 text-white rounded-full text-xs font-semibold tracking-wide shadow-lg transition-all active:scale-95",
                        ch.name === 'WhatsApp' ? "bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700" :
                        ch.name === 'Facebook' ? "bg-blue-600 shadow-blue-100 hover:bg-blue-700" :
                        "bg-pink-500 shadow-pink-100 hover:bg-pink-600"
                      )}>
                        Configure Now
                      </button>
                    )
                  ) : (
                    <div className="px-6 py-2.5 bg-slate-50 text-slate-300 rounded-full border border-slate-100 text-[11px] font-semibold tracking-wide italic">
                      Coming Soon
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientChannelsPage;
