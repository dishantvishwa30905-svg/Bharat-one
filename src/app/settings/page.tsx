'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { Globe } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { lang, setLang } = useI18n();

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-2xl space-y-6 animate-fade-in">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-navy">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your account preferences.</p>
        </div>

        {/* Account info */}
        <div className="card space-y-3">
          <h2 className="font-jakarta font-bold text-navy border-b border-gray-100 pb-3">Account Information</h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-navy flex items-center justify-center text-white font-bold text-xl">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-navy">{user?.name}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className="badge badge-blue mt-1">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="card space-y-3">
          <h2 className="font-jakarta font-bold text-navy border-b border-gray-100 pb-3 flex items-center gap-2">
            <Globe size={18} className="text-saffron" /> Language
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              { code: 'en', label: '🇮🇳 English' },
              { code: 'hi', label: '🇮🇳 हिंदी' },
              { code: 'mr', label: '🇮🇳 मराठी' },
            ].map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code as any)}
                className={`px-5 py-2.5 rounded-xl border font-medium text-sm transition-all ${lang === code ? 'bg-navy text-white border-navy' : 'border-gray-200 text-gray-600 hover:border-navy hover:text-navy'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="card space-y-3">
          <h2 className="font-jakarta font-bold text-navy border-b border-gray-100 pb-3">Privacy & Data</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your profile information is stored securely and used only for scheme matching. We do not share your data with any third party.
          </p>
          <p className="text-xs text-gray-400">To request account deletion, please contact support@bharatone.in</p>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-500">
          Bharat One is an independent informational platform and is not an official government website.
        </div>
      </div>
    </DashboardLayout>
  );
}
