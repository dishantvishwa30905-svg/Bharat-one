'use client';
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SchemeCard from '@/components/scheme/SchemeCard';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const CATEGORIES = ['Education','Scholarships','Agriculture','Healthcare','Housing','Employment','Skill Development','Women & Child','Senior Citizens','Disability','Social Security','Pension','Entrepreneurship','MSME','Financial Assistance'];
const STATES = ['Andhra Pradesh','Bihar','Delhi','Gujarat','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'];

function SchemesContent() {
  const searchParams = useSearchParams();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [state, setState] = useState('');
  const [isCentral, setIsCentral] = useState('');

  const fetchSchemes = useCallback(async (p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), limit: '12' });
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (state) params.set('state', state);
    if (isCentral) params.set('isCentral', isCentral);

    const [schemesRes, bookmarksRes] = await Promise.all([
      fetch(`/api/schemes?${params}`).then(r => r.json()),
      fetch('/api/bookmarks').then(r => r.json()).catch(() => ({ bookmarks: [] })),
    ]);
    setSchemes(schemesRes.schemes || []);
    setTotal(schemesRes.total || 0);
    setPage(schemesRes.page || 1);
    setPages(schemesRes.pages || 1);
    setBookmarkedIds(new Set((bookmarksRes.bookmarks || []).map((b: any) => b.schemeId)));
    setLoading(false);
  }, [search, category, state, isCentral]);

  useEffect(() => { fetchSchemes(1); }, [fetchSchemes]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchSchemes(1); };

  return (
    <DashboardLayout title="Explore Schemes">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-navy">Explore Schemes</h1>
          <p className="text-gray-500 text-sm mt-1">{total > 0 ? `${total} schemes found` : 'Search and filter government schemes'}</p>
        </div>

        {/* Search & Filter bar */}
        <div className="flex gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search schemes by name, ministry, keyword..."
                className="input-field !pl-10 !pr-9 h-11"
              />
              {search && (
                <button type="button" onClick={() => { setSearch(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary px-5 py-2.5 h-11 text-sm">Search</button>
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 h-11 rounded-xl border font-medium text-sm transition-all ${showFilters ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-gray-200 hover:border-navy'}`}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="card grid sm:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Category</label>
              <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">State</label>
              <select className="input-field" value={state} onChange={e => setState(e.target.value)}>
                <option value="">All States</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Scheme Type</label>
              <select className="input-field" value={isCentral} onChange={e => setIsCentral(e.target.value)}>
                <option value="">Central + State</option>
                <option value="true">Central Schemes Only</option>
                <option value="false">State Schemes Only</option>
              </select>
            </div>
            <button
              onClick={() => { setCategory(''); setState(''); setIsCentral(''); setSearch(''); }}
              className="text-sm text-saffron font-medium hover:underline sm:col-span-3"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Active filters */}
        {(category || state || isCentral) && (
          <div className="flex flex-wrap gap-2">
            {category && <span className="badge badge-orange flex items-center gap-1">{category} <button onClick={() => setCategory('')}><X size={10} /></button></span>}
            {state && <span className="badge badge-blue flex items-center gap-1">{state} <button onClick={() => setState('')}><X size={10} /></button></span>}
            {isCentral && <span className="badge badge-gray flex items-center gap-1">{isCentral === 'true' ? 'Central' : 'State'} <button onClick={() => setIsCentral('')}><X size={10} /></button></span>}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
          </div>
        ) : schemes.length === 0 ? (
          <div className="card text-center py-16">
            <Search size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No schemes found matching your criteria.</p>
            <button onClick={() => { setSearch(''); setCategory(''); setState(''); setIsCentral(''); }} className="text-saffron text-sm font-semibold mt-2 hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schemes.map((scheme: any) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                isBookmarked={bookmarkedIds.has(scheme.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => fetchSchemes(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-navy hover:text-navy disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => fetchSchemes(p)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${p === page ? 'bg-navy text-white' : 'border border-gray-200 text-gray-600 hover:border-navy hover:text-navy'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => fetchSchemes(page + 1)}
              disabled={page === pages}
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-navy hover:text-navy disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function SchemesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-saffron border-t-transparent rounded-full animate-spin" /></div>}>
      <SchemesContent />
    </Suspense>
  );
}
