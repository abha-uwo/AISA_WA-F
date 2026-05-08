'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10">
          <Link href="/auth/login" className="text-blue-600 font-bold text-sm hover:underline">← Back to Login</Link>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-10 italic">Last updated: May 2026</p>

        <div className="bg-white rounded-[32px] border border-slate-200 p-10 shadow-sm space-y-8 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as your name, email address, business name, and WhatsApp API credentials when you register for an account.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, including processing WhatsApp messages on your behalf through the Meta Business API.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">3. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your WhatsApp access tokens are stored securely and never shared with third parties.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">4. Third-Party Services</h2>
            <p>Our platform integrates with Meta's WhatsApp Business API. Message data processed through this integration is subject to Meta's terms of service and privacy policy.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3">5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@aisaconnect.com" className="text-blue-600 font-semibold hover:underline">privacy@aisaconnect.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
