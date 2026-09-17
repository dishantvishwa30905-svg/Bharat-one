'use client';
import Link from 'next/link';
import { Bookmark, BookmarkCheck, ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const CATEGORY_COLORS: Record<string, string> = {
  'Agriculture': 'bg-green-100 text-green-700',
  'Healthcare': 'bg-blue-100 text-blue-700',
  'Education': 'bg-purple-100 text-purple-700',
  'Scholarships': 'bg-indigo-100 text-indigo-700',
  'Housing': 'bg-orange-100 text-orange-700',
  'Employment': 'bg-yellow-100 text-yellow-700',
  'Skill Development': 'bg-teal-100 text-teal-700',
  'Women & Child': 'bg-pink-100 text-pink-700',
  'Senior Citizens': 'bg-gray-100 text-gray-700',
  'Disability': 'bg-violet-100 text-violet-700',
  'Social Security': 'bg-slate-100 text-slate-700',
  'Pension': 'bg-amber-100 text-amber-700',
  'Entrepreneurship': 'bg-red-100 text-red-700',
  'MSME': 'bg-cyan-100 text-cyan-700',
  'Financial Assistance': 'bg-lime-100 text-lime-700',
};

interface SchemeCardProps {
  scheme: {
    id: string;
    name: string;
    nameHi?: string;
    category: string;
    benefits: string;
    ministry: string;
    isCentral: boolean;
    state?: string | null;
    verificationStatus: string;
    officialUrl: string;
    deadline?: string | null;
  };
  matchPercent?: number;
  status?: 'Eligible' | 'Not Eligible' | 'Needs Verification' | null;
  isBookmarked?: boolean;
  onToggleBookmark?: (schemeId: string) => void;
  lang?: 'en' | 'hi' | 'mr';
}

export default function SchemeCard({ scheme, matchPercent, status, isBookmarked, onToggleBookmark, lang = 'en' }: SchemeCardProps) {
  const [bookmarked, setBookmarked] = useState(isBookmarked || false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const displayName = lang === 'hi' && scheme.nameHi ? scheme.nameHi : scheme.name;

  const benefitPreview = scheme.benefits.length > 80
    ? scheme.benefits.substring(0, 80) + '...'
    : scheme.benefits;

  const catColor = CATEGORY_COLORS[scheme.category] || 'bg-gray-100 text-gray-700';

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      const method = bookmarked ? 'DELETE' : 'POST';
      const r = await fetch('/api/bookmarks', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schemeId: scheme.id }),
      });
      if (r.ok) {
        setBookmarked(!bookmarked);
        onToggleBookmark?.(scheme.id);
      }
    } finally {
      setBookmarkLoading(false);
    }
  };

  const matchColor = matchPercent !== undefined
    ? matchPercent >= 75 ? 'match-high' : matchPercent >= 50 ? 'match-mid' : 'match-low'
    : '';

  const StatusIcon = status === 'Eligible' ? CheckCircle : status === 'Not Eligible' ? XCircle : AlertCircle;
  const statusClass = status === 'Eligible' ? 'status-eligible' : status === 'Not Eligible' ? 'status-not-eligible' : 'status-needs-verification';

  return (
    <div className="card card-hover flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <span className={`badge ${catColor}`}>{scheme.category}</span>
          {!scheme.isCentral && scheme.state && (
            <span className="badge bg-navy-50 text-navy-700">{scheme.state}</span>
          )}
          {scheme.verificationStatus === 'Verified' && (
            <span className="badge bg-green-50 text-green-600">✓ Verified</span>
          )}
        </div>
        <button
          onClick={handleBookmark}
          disabled={bookmarkLoading}
          className="text-gray-400 hover:text-saffron transition-colors flex-shrink-0 p-0.5"
        >
          {bookmarked ? <BookmarkCheck size={18} className="text-saffron" /> : <Bookmark size={18} />}
        </button>
      </div>

      {/* Name */}
      <h3 className="font-jakarta font-700 text-navy text-sm leading-snug line-clamp-2" style={{ fontWeight: 700 }}>
        {displayName}
      </h3>

      {/* Benefits */}
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{benefitPreview}</p>

      {/* Ministry */}
      <p className="text-xs text-gray-400 truncate">{scheme.ministry}</p>

      {/* Deadline if exists */}
      {scheme.deadline && (
        <p className="text-xs text-red-500 font-medium">⏰ Deadline: {new Date(scheme.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      )}

      {/* Match / Status */}
      <div className="flex items-center gap-2 flex-wrap">
        {matchPercent !== undefined && (
          <span className={`badge ${matchColor} font-semibold`}>{matchPercent}% Match</span>
        )}
        {status && (
          <span className={`badge ${statusClass} flex items-center gap-1`}>
            <StatusIcon size={11} />
            {status}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
        <Link
          href={`/schemes/${scheme.id}`}
          className="flex-1 text-center text-sm font-medium text-navy border border-navy/20 rounded-xl py-2 hover:bg-navy hover:text-white transition-all duration-200"
        >
          View Details
        </Link>
        <a
          href={scheme.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-sm font-semibold bg-saffron text-white rounded-xl py-2 hover:bg-saffron-600 transition-all duration-200 flex items-center justify-center gap-1"
        >
          Apply Now <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
