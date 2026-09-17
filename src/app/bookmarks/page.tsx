'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SchemeCard from '@/components/scheme/SchemeCard';
import { Bookmark } from 'lucide-react';
import Link from 'next/link';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bookmarks').then(r => r.json()).then(d => {
      setBookmarks(d.bookmarks || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleRemove = (schemeId: string) => {
    setBookmarks(prev => prev.filter(b => b.schemeId !== schemeId));
  };

  return (
    <DashboardLayout title="Saved Schemes">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-navy">Saved Schemes</h1>
          <p className="text-gray-500 text-sm mt-1">{bookmarks.length} scheme{bookmarks.length !== 1 ? 's' : ''} saved</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="card text-center py-16">
            <Bookmark size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No saved schemes yet.</p>
            <p className="text-gray-400 text-xs mt-1">Bookmark schemes to find them here quickly.</p>
            <Link href="/schemes" className="btn-primary mt-4 inline-flex text-sm px-6 py-2.5">Explore Schemes</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarks.map((b: any) => (
              <SchemeCard
                key={b.id}
                scheme={b.scheme}
                isBookmarked={true}
                onToggleBookmark={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
