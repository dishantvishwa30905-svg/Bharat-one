'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { LayoutDashboard, CheckCircle, Bookmark, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const bottomNav = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/schemes', label: 'Schemes', icon: CheckCircle },
  { href: '/bookmarks', label: 'Saved', icon: Bookmark },
  { href: '/applications', label: 'Apply', icon: FileText },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6F8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-saffron border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading Bharat One...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F6F8]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 flex">
        {bottomNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${active ? 'text-saffron' : 'text-gray-400'}`}>
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
