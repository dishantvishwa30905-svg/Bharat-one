'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, User, CheckCircle, Bookmark, FileText,
  Bell, Settings, HelpCircle, LogOut, ShieldCheck, X
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'My Profile', icon: User },
  { href: '/schemes', label: 'Eligible Schemes', icon: CheckCircle },
  { href: '/bookmarks', label: 'Saved Schemes', icon: Bookmark },
  { href: '/applications', label: 'My Applications', icon: FileText },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help & Support', icon: HelpCircle },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetch('/api/notifications')
        .then(r => r.json())
        .then(d => setUnreadCount(d.notifications?.filter((n: any) => !n.isRead).length || 0))
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const initials = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <>
      {/* Mobile overlay */}
      {open && onClose && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-40 flex flex-col
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <Logo variant="full" />
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600 p-1">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`sidebar-link ${active ? 'active' : ''}`}
              >
                <Icon size={18} className={active ? 'text-saffron' : 'text-gray-400'} />
                <span className="flex-1">{label}</span>
                {href === '/notifications' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Admin link if applicable */}
          {user?.role !== 'USER' && (
            <Link href="/admin" onClick={onClose} className={`sidebar-link ${pathname.startsWith('/admin') ? 'active' : ''}`}>
              <ShieldCheck size={18} className={pathname.startsWith('/admin') ? 'text-saffron' : 'text-gray-400'} />
              <span className="flex-1">Admin Panel</span>
            </Link>
          )}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-navy-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-navy-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
