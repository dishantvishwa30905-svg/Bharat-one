'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Logo from '@/components/ui/Logo';
import { Users, LayoutDashboard, CheckCircle, FileText, MessageSquare, ShieldCheck, LogOut, RefreshCw, Edit, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (!['SUPER_ADMIN', 'SCHEME_MANAGER', 'VERIFIER', 'SUPPORT_ADMIN'].includes(user.role)) {
      router.replace('/dashboard');
      return;
    }
    Promise.all([
      fetch('/api/admin/analytics').then(r => r.json()),
      fetch('/api/admin/schemes').then(r => r.json()),
    ]).then(([a, s]) => {
      setAnalytics(a);
      setSchemes(s.schemes || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, router]);

  const handleLogout = async () => { await logout(); router.push('/'); };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this scheme permanently?')) return;
    await fetch(`/api/admin/schemes?id=${id}`, { method: 'DELETE' });
    setSchemes(prev => prev.filter(s => s.id !== id));
  };
  const handleVerify = async (scheme: any) => {
    await fetch('/api/admin/schemes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: scheme.id, verificationStatus: 'Verified' }) });
    setSchemes(prev => prev.map(s => s.id === scheme.id ? { ...s, verificationStatus: 'Verified' } : s));
  };

  if (!user || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8]">
      <div className="w-10 h-10 border-4 border-saffron border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Total Users', value: analytics?.totalUsers ?? '—', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Schemes', value: analytics?.totalSchemes ?? '—', icon: LayoutDashboard, color: 'bg-purple-50 text-purple-600' },
    { label: 'Verified Schemes', value: analytics?.verifiedSchemes ?? '—', icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { label: 'Applications', value: analytics?.totalApplications ?? '—', icon: FileText, color: 'bg-orange-50 text-orange-600' },
    { label: 'Feedback Reports', value: analytics?.totalFeedback ?? '—', icon: MessageSquare, color: 'bg-red-50 text-red-600' },
    { label: 'New Users (30d)', value: analytics?.recentUsers ?? '—', icon: Users, color: 'bg-teal-50 text-teal-600' },
  ];

  return (
    <div className="min-h-screen flex bg-[#F4F6F8]">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-navy flex flex-col">
        <div className="p-5 border-b border-white/10">
          <Logo variant="white" />
          <div className="mt-3 px-1">
            <span className="text-xs bg-saffron text-white font-semibold px-2 py-0.5 rounded-full">
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'schemes', label: 'Scheme Management', icon: CheckCircle },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === id ? 'bg-saffron text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white">
            <ShieldCheck size={18} /> User Dashboard
          </Link>
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-saffron flex items-center justify-center text-white font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{user.name}</p>
              <p className="text-gray-400 text-xs">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-sm text-gray-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/10">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-8 h-16 flex items-center justify-between">
          <h1 className="font-jakarta font-bold text-navy text-xl">
            {activeTab === 'dashboard' ? 'Admin Dashboard' : 'Scheme Management'}
          </h1>
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy px-3 py-1.5 rounded-lg hover:bg-gray-100">
            <RefreshCw size={15} /> Refresh
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                      <Icon size={20} />
                    </div>
                    <div className="text-3xl font-jakarta font-bold text-navy">{value}</div>
                    <p className="text-sm text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
                <p className="font-semibold mb-1">⚠️ Admin Disclaimer</p>
                <p>All scheme information must be sourced from official government portals. Ensure verification status is only set to "Verified" for schemes with confirmed official source URLs.</p>
              </div>
            </div>
          )}

          {activeTab === 'schemes' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-gray-500 text-sm">{schemes.length} schemes in database</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Scheme</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Category</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Verification</th>
                      <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {schemes.map((s: any) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-medium text-navy truncate max-w-[200px]">{s.name}</p>
                          <p className="text-xs text-gray-400 truncate">{s.ministry}</p>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="badge badge-gray">{s.category}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`badge ${s.status === 'Active' ? 'badge-green' : 'badge-gray'}`}>{s.status}</span>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span className={`badge ${s.verificationStatus === 'Verified' ? 'badge-green' : 'badge-orange'}`}>{s.verificationStatus}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {s.verificationStatus !== 'Verified' && (
                              <button onClick={() => handleVerify(s)} className="text-xs font-medium text-green-600 hover:text-green-700 px-2 py-1 rounded-lg hover:bg-green-50">Verify</button>
                            )}
                            <Link href={`/schemes/${s.id}`} className="p-1.5 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors">
                              <Edit size={14} />
                            </Link>
                            {user.role === 'SUPER_ADMIN' && (
                              <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
