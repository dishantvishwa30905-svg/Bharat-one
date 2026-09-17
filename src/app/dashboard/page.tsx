'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SchemeCard from '@/components/scheme/SchemeCard';
import { CheckCircle, Bookmark, FileText, User, ArrowRight, AlertTriangle, Bell } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  color: string;
  href: string;
  progress?: number;
}

function StatCard({ label, value, sub, icon, color, href, progress }: StatCardProps) {
  return (
    <Link href={href} className="card card-hover block group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center`}>{icon}</div>
        <ArrowRight size={16} className="text-gray-300 group-hover:text-saffron transition-colors mt-1" />
      </div>
      {progress !== undefined ? (
        <div className="mb-2">
          <div className="flex items-end justify-between mb-1.5">
            <span className="text-3xl font-jakarta font-bold text-navy">{value}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-saffron h-2 rounded-full transition-all duration-700" style={{ width: `${value}%` }} />
          </div>
        </div>
      ) : (
        <div className="text-3xl font-jakarta font-bold text-navy mb-1">{value}</div>
      )}
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [completionPercent, setCompletionPercent] = useState(0);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch('/api/users/profile').then(r => r.json()),
      fetch('/api/eligibility/recommendations').then(r => r.json()),
      fetch('/api/applications').then(r => r.json()),
      fetch('/api/bookmarks').then(r => r.json()),
      fetch('/api/notifications').then(r => r.json()),
    ]).then(([profile, recs, apps, bmarks, notifs]) => {
      setCompletionPercent(profile.completionPercent || 0);
      setRecommendations(recs.recommendations || []);
      setApplications(apps.applications || []);
      setSavedCount(bmarks.bookmarks?.length || 0);
      setNotifications(notifs.notifications || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const eligibleCount = recommendations.filter(r => r.status === 'Eligible').length;
  const inProgressApps = applications.filter(a => ['Started', 'Submitted', 'Under Review', 'Additional Documents Required'].includes(a.status)).length;
  const unreadNotifs = notifications.filter(n => !n.isRead).length;

  const STATUS_COLORS: Record<string, string> = {
    'Submitted': 'badge-blue',
    'Under Review': 'badge-orange',
    'Approved': 'badge-green',
    'Rejected': 'badge-red',
    'Started': 'badge-gray',
    'Additional Documents Required': 'badge-orange',
    'Completed': 'badge-green',
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8 animate-fade-in">
        {/* Welcome */}
        <div>
          <h1 className="font-jakarta text-2xl lg:text-3xl font-bold text-navy">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Here's what's happening with your profile and schemes.</p>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Profile Completion"
              value={completionPercent}
              sub="Complete your profile for better recommendations"
              icon={<User size={20} className="text-saffron" />}
              color="bg-saffron-50"
              href="/profile"
              progress={completionPercent}
            />
            <StatCard
              label="Eligible Schemes"
              value={eligibleCount}
              sub="Schemes you may be eligible for"
              icon={<CheckCircle size={20} className="text-indiaGreen" />}
              color="bg-indiaGreen-50"
              href="/schemes"
            />
            <StatCard
              label="Applications"
              value={inProgressApps}
              sub="Continue your pending applications"
              icon={<FileText size={20} className="text-blue-600" />}
              color="bg-blue-50"
              href="/applications"
            />
            <StatCard
              label="Saved Schemes"
              value={savedCount}
              sub="Schemes you have bookmarked"
              icon={<Bookmark size={20} className="text-saffron" />}
              color="bg-saffron-50"
              href="/bookmarks"
            />
          </div>
        )}

        {/* Profile incomplete banner */}
        {!loading && completionPercent < 80 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Your profile is {completionPercent}% complete</p>
              <p className="text-xs text-amber-600 mt-0.5">Complete your profile to get more accurate scheme recommendations.</p>
            </div>
            <Link href="/profile" className="ml-auto text-xs font-semibold text-saffron hover:underline whitespace-nowrap">Complete Now →</Link>
          </div>
        )}

        {/* Notifications preview */}
        {!loading && unreadNotifs > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
            <Bell size={18} className="text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800 flex-1">You have <strong>{unreadNotifs}</strong> unread notification{unreadNotifs > 1 ? 's' : ''}.</p>
            <Link href="/notifications" className="text-xs font-semibold text-blue-600 hover:underline">View →</Link>
          </div>
        )}

        {/* Top Matching Schemes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-jakarta font-bold text-navy text-lg">Top Eligible Schemes For You</h2>
            <Link href="/schemes" className="text-saffron text-sm font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-64 rounded-2xl" />)}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="card text-center py-12">
              <CheckCircle size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No recommendations yet.</p>
              <p className="text-gray-400 text-xs mt-1">Complete your profile to see schemes you may qualify for.</p>
              <Link href="/profile" className="btn-primary mt-4 inline-flex text-sm px-6 py-2.5">Complete Profile</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.slice(0, 3).map(({ scheme, matchPercent, status }) => (
                <SchemeCard
                  key={scheme.id}
                  scheme={scheme}
                  matchPercent={matchPercent}
                  status={status}
                />
              ))}
            </div>
          )}
        </div>

        {/* My Applications */}
        {!loading && applications.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-jakarta font-bold text-navy text-lg">My Applications</h2>
              <Link href="/applications" className="text-saffron text-sm font-semibold hover:underline flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="card overflow-hidden p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Scheme</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {applications.slice(0, 3).map((app: any) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-navy truncate max-w-[200px]">{app.scheme?.name}</td>
                      <td className="px-6 py-4">
                        <span className={`badge ${STATUS_COLORS[app.status] || 'badge-gray'}`}>{app.status}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs hidden md:table-cell">{app.referenceNumber || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs text-gray-400 leading-relaxed">
          ℹ️ Match percentages and eligibility status shown are indicative only and not official government determinations.
          Final eligibility is decided by the respective government authority.
        </div>
      </div>
    </DashboardLayout>
  );
}
