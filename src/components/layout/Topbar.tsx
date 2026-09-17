'use client';
import { Bell, Search, Menu } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TopbarProps {
  onMenuClick: () => void;
  title?: string;
}

export default function Topbar({ onMenuClick, title }: TopbarProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/schemes?search=${encodeURIComponent(search.trim())}`);
  };

  const initials = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 lg:px-6 h-16 flex items-center gap-4">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-500 hover:text-navy p-1.5 rounded-lg hover:bg-gray-100"
      >
        <Menu size={20} />
      </button>

      {/* Page title (mobile) */}
      {title && <h1 className="font-jakarta font-bold text-navy text-base lg:hidden">{title}</h1>}

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:flex">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search schemes, keywords..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-saffron/30 focus:border-saffron transition-all"
          />
        </div>
      </form>

      <div className="ml-auto flex items-center gap-3">
        {/* Notifications */}
        <Link href="/notifications" className="relative p-2 text-gray-500 hover:text-navy hover:bg-gray-100 rounded-xl transition-colors">
          <Bell size={20} />
        </Link>

        {/* Avatar */}
        <Link href="/profile" className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-white font-bold text-sm hover:bg-navy-700 transition-colors">
          {initials}
        </Link>
      </div>
    </header>
  );
}
