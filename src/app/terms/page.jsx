'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <Link href="/auth/login" className="text-blue-600 font-bold text-sm hover:underline">← Back to Login</Link>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Terms of Service</h1>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-10 italic">Last updated: May 2026</p>

        <div className="bg-white rounded-[32px] border border-slate-200 p-10 shadow-sm space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the AisaConnect platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">2. Use of Service</h2>
            <p>You may use AisaConnect solely for lawful purposes and in accordance with Meta's WhatsApp Business API policies. You are responsible for ensuring all automated messages comply with applicable laws and Meta's messaging guidelines.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">3. Account Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials, including your WhatsApp API tokens. You must immediately notify us of any unauthorized use of your account.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">4. Service Availability</h2>
            <p>We strive to provide continuous service availability but do not guarantee uninterrupted access. We may suspend or terminate service for maintenance, upgrades, or violations of these terms.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">5. Limitation of Liability</h2>
            <p>AisaConnect shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service or any automated messages sent through the platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">6. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:legal@aisaconnect.com" className="text-blue-600 font-semibold hover:underline">legal@aisaconnect.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
