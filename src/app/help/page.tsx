'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { HelpCircle, ChevronDown, ChevronUp, Phone, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';

const FAQS = [
  { q: 'How does eligibility matching work?', a: 'When you complete your profile, our rule-based engine compares your demographics (age, income, state, occupation, etc.) against each scheme\'s official eligibility criteria and provides a match score with detailed reasons.' },
  { q: 'Is Bharat One an official government site?', a: 'No. Bharat One is an independent informational platform. We are not affiliated with any government body. Always apply through the official government portal linked on each scheme page.' },
  { q: 'How do I apply for a scheme?', a: 'Go to a scheme\'s detail page, click "Apply on Official Portal" and you will be directed to the official government application page.' },
  { q: 'Can I trust the scheme information?', a: 'We source information from official portals and mark schemes as Verified. However, always cross-check with the official government website before applying.' },
  { q: 'How do I delete my account?', a: 'Currently, you can contact us via feedback to request account deletion. We will remove all your data within 7 working days.' },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <DashboardLayout title="Help & Support">
      <div className="max-w-3xl space-y-8 animate-fade-in">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-navy">Help & Support</h1>
          <p className="text-gray-500 text-sm mt-1">Find answers to common questions and get support.</p>
        </div>

        {/* FAQ */}
        <div className="card">
          <h2 className="font-jakarta font-bold text-navy mb-4 flex items-center gap-2">
            <HelpCircle size={18} className="text-saffron" /> Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-navy text-sm">{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={16} className="text-saffron flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="card">
          <h2 className="font-jakarta font-bold text-navy mb-4">Contact & Support</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail size={16} className="text-saffron flex-shrink-0" />
              <span>support@bharatone.in (Demo — not monitored)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <MapPin size={16} className="text-saffron flex-shrink-0" />
              <span>Common Service Centres (CSC) available across India for offline assistance</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
          <p className="font-semibold mb-2">⚠️ Important Disclaimer</p>
          <p className="leading-relaxed">
            Bharat One is an independent informational platform and is NOT an official government website.
            Final eligibility and approval are always determined by the respective government authority.
            Scheme information may change — always verify on official portals before applying.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
