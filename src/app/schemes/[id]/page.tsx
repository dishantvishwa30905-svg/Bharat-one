'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Bookmark, BookmarkCheck, ChevronLeft, Flag, FileCheck, ClipboardList, Info } from 'lucide-react';

const TABS = ['Overview', 'Eligibility', 'Documents', 'Application', 'Tracker'];

export default function SchemeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [scheme, setScheme] = useState<any>(null);
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [bookmarked, setBookmarked] = useState(false);
  const [checkedDocs, setCheckedDocs] = useState<Set<number>>(new Set());
  const [appStatus, setAppStatus] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [appSaved, setAppSaved] = useState(false);
  const [feedback, setFeedback] = useState({ reason: '', details: '' });
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/schemes/${id}`).then(r => r.json()),
      fetch(`/api/schemes/${id}/eligibility`).then(r => r.json()),
      fetch('/api/bookmarks').then(r => r.json()).catch(() => ({ bookmarks: [] })),
      fetch('/api/applications').then(r => r.json()).catch(() => ({ applications: [] })),
    ]).then(([schemeData, eligData, bmarks, apps]) => {
      setScheme(schemeData.scheme);
      setEligibility(eligData.result);
      setBookmarked((bmarks.bookmarks || []).some((b: any) => b.schemeId === id));
      const myApp = (apps.applications || []).find((a: any) => a.schemeId === id);
      if (myApp) { setAppStatus(myApp.status); setRefNumber(myApp.referenceNumber || ''); setNotes(myApp.notes || ''); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleBookmark = async () => {
    const method = bookmarked ? 'DELETE' : 'POST';
    await fetch('/api/bookmarks', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ schemeId: id }) });
    setBookmarked(!bookmarked);
  };

  const handleSaveApp = async () => {
    await fetch('/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ schemeId: id, status: appStatus || 'Started', referenceNumber: refNumber, notes }) });
    setAppSaved(true);
    setTimeout(() => setAppSaved(false), 3000);
  };

  const handleFeedback = async () => {
    await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ schemeId: id, ...feedback }) });
    setShowFeedback(false);
  };

  if (loading) return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </DashboardLayout>
  );

  if (!scheme) return (
    <DashboardLayout>
      <div className="card text-center py-16">
        <p className="text-gray-500">Scheme not found.</p>
        <button onClick={() => router.push('/schemes')} className="btn-primary mt-4 text-sm px-6 py-2.5">Back to Schemes</button>
      </div>
    </DashboardLayout>
  );

  const docs: string[] = JSON.parse(scheme.documents || '[]');

  const CATEGORY_COLORS: Record<string, string> = {
    'Agriculture': 'bg-green-100 text-green-700',
    'Healthcare': 'bg-blue-100 text-blue-700',
    'Education': 'bg-purple-100 text-purple-700',
  };
  const catColor = CATEGORY_COLORS[scheme.category] || 'bg-gray-100 text-gray-700';

  return (
    <DashboardLayout>
      <div className="max-w-4xl animate-fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/schemes" className="hover:text-navy flex items-center gap-1"><ChevronLeft size={14} /> Schemes</Link>
          <span>/</span>
          <span className="text-navy font-medium truncate">{scheme.name}</span>
        </div>

        {/* Header card */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-start gap-3 mb-4">
            <span className={`badge ${catColor}`}>{scheme.category}</span>
            {!scheme.isCentral && <span className="badge bg-navy-50 text-navy-700">{scheme.state}</span>}
            <span className={`badge ${scheme.verificationStatus === 'Verified' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
              {scheme.verificationStatus === 'Verified' ? '✓ Verified' : '⚠ ' + scheme.verificationStatus}
            </span>
          </div>

          <h1 className="font-jakarta text-2xl font-bold text-navy mb-2">{scheme.name}</h1>
          <p className="text-gray-500 text-sm mb-4">{scheme.ministry}</p>

          {/* Eligibility badge */}
          {eligibility && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold mb-4 ${eligibility.status === 'Eligible' ? 'bg-green-50 text-green-700 border border-green-200' : eligibility.status === 'Not Eligible' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
              {eligibility.status === 'Eligible' ? <CheckCircle size={16} /> : eligibility.status === 'Not Eligible' ? <XCircle size={16} /> : <AlertCircle size={16} />}
              {eligibility.status} — {eligibility.matchPercent}% Match
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm px-5 py-2.5">
              Apply on Official Portal <ExternalLink size={14} />
            </a>
            <button onClick={handleBookmark} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all ${bookmarked ? 'bg-saffron-50 border-saffron text-saffron' : 'border-gray-200 text-gray-600 hover:border-navy hover:text-navy'}`}>
              {bookmarked ? <><BookmarkCheck size={16} /> Saved</> : <><Bookmark size={16} /> Save</>}
            </button>
            <button onClick={() => setShowFeedback(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 font-medium text-sm transition-all">
              <Flag size={16} /> Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab ? 'tab-active' : 'tab-inactive'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'Overview' && (
          <div className="space-y-4">
            <div className="card">
              <h2 className="font-jakarta font-bold text-navy mb-3 flex items-center gap-2"><Info size={18} /> About This Scheme</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{scheme.description}</p>
            </div>
            <div className="card">
              <h2 className="font-jakarta font-bold text-navy mb-3 flex items-center gap-2"><CheckCircle size={18} className="text-indiaGreen" /> Benefits</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{scheme.benefits}</p>
            </div>
            <div className="card">
              <h3 className="font-semibold text-navy mb-3 text-sm">Official Source</h3>
              <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer" className="text-saffron text-sm flex items-center gap-1.5 hover:underline">
                {scheme.officialUrl} <ExternalLink size={12} />
              </a>
              {scheme.deadline && <p className="text-red-500 text-xs mt-2 font-medium">⏰ Application Deadline: {scheme.deadline}</p>}
              {scheme.lastVerified && <p className="text-gray-400 text-xs mt-1">Last Verified: {new Date(scheme.lastVerified).toLocaleDateString('en-IN')}</p>}
            </div>
          </div>
        )}

        {activeTab === 'Eligibility' && (
          <div className="card space-y-4">
            <h2 className="font-jakarta font-bold text-navy flex items-center gap-2"><CheckCircle size={18} /> Your Eligibility Analysis</h2>
            {!eligibility || eligibility.status === undefined ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                Complete your profile to see a detailed eligibility analysis for this scheme.
              </div>
            ) : (
              <>
                <div className={`p-4 rounded-xl border text-sm ${eligibility.status === 'Eligible' ? 'bg-green-50 border-green-200' : eligibility.status === 'Not Eligible' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <p className="font-semibold mb-1">{eligibility.status === 'Eligible' ? '✅ You appear eligible for this scheme' : eligibility.status === 'Not Eligible' ? '❌ You may not be eligible for this scheme' : '⚠️ Eligibility needs verification'}</p>
                  <p className="text-xs opacity-80">Match Score: {eligibility.matchPercent}% — This is an indicative score only, not an official government determination.</p>
                </div>

                {eligibility.details?.satisfied?.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-green-700">✓ Criteria Met</h3>
                    {eligibility.details.satisfied.map((c: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <div><p className="text-gray-700">{c.description}</p><p className="text-xs text-gray-400">Required: {c.required} | Your value: {c.actual}</p></div>
                      </div>
                    ))}
                  </div>
                )}

                {eligibility.details?.failed?.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-red-700">✗ Criteria Not Met</h3>
                    {eligibility.details.failed.map((c: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div><p className="text-gray-700">{c.description}</p><p className="text-xs text-gray-400">Required: {c.required} | Your value: {c.actual}</p></div>
                      </div>
                    ))}
                  </div>
                )}

                {eligibility.details?.missing?.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-yellow-700">? Profile Fields Missing</h3>
                    {eligibility.details.missing.map((c: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <AlertCircle size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">{c.description} — <Link href="/profile" className="text-saffron hover:underline">Update Profile</Link></p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'Documents' && (
          <div className="card">
            <h2 className="font-jakarta font-bold text-navy mb-4 flex items-center gap-2"><FileCheck size={18} /> Required Documents</h2>
            <p className="text-xs text-gray-400 mb-4">Check documents you have ready. This checklist is saved locally on your browser.</p>
            <div className="space-y-3">
              {docs.map((doc, i) => (
                <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checkedDocs.has(i) ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
                  <input type="checkbox" checked={checkedDocs.has(i)} onChange={() => { const n = new Set(checkedDocs); n.has(i) ? n.delete(i) : n.add(i); setCheckedDocs(n); }} className="accent-green-500 w-4 h-4" />
                  <span className={`text-sm ${checkedDocs.has(i) ? 'text-green-700 line-through' : 'text-gray-700'}`}>{doc}</span>
                  {checkedDocs.has(i) && <CheckCircle size={14} className="text-green-500 ml-auto" />}
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 border-t border-gray-100 pt-4">
              {checkedDocs.size}/{docs.length} documents marked as ready.
            </p>
          </div>
        )}

        {activeTab === 'Application' && (
          <div className="card">
            <h2 className="font-jakarta font-bold text-navy mb-4 flex items-center gap-2"><ClipboardList size={18} /> Application Process</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{scheme.applicationProcess}</p>
            <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm px-6 py-3">
              Apply on Official Portal <ExternalLink size={14} />
            </a>
            <p className="text-xs text-gray-400 mt-3">You will be redirected to the official government portal.</p>
          </div>
        )}

        {activeTab === 'Tracker' && (
          <div className="card space-y-4">
            <h2 className="font-jakarta font-bold text-navy flex items-center gap-2"><ClipboardList size={18} /> Application Tracker</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
              ⚠️ Application status is self-reported by you and is not connected to any government system.
            </div>
            <div>
              <label className="input-label">Application Status</label>
              <select className="input-field" value={appStatus} onChange={e => setAppStatus(e.target.value)}>
                <option value="">— Select Status —</option>
                {['Not Applied', 'Started', 'Submitted', 'Under Review', 'Additional Documents Required', 'Approved', 'Rejected', 'Completed'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Reference / Application Number (optional)</label>
              <input type="text" className="input-field" placeholder="e.g. PM-12345-2026" value={refNumber} onChange={e => setRefNumber(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Notes (optional)</label>
              <textarea className="input-field" rows={3} placeholder="Any notes about your application..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <button onClick={handleSaveApp} className="btn-primary text-sm px-6 py-2.5">
              {appSaved ? '✓ Saved!' : 'Save Application Status'}
            </button>
          </div>
        )}

        {/* Feedback modal */}
        {showFeedback && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <h3 className="font-jakarta font-bold text-navy mb-4">Report Incorrect Information</h3>
              <div className="space-y-3">
                <select className="input-field" value={feedback.reason} onChange={e => setFeedback(f => ({ ...f, reason: e.target.value }))}>
                  <option value="">— Select Reason —</option>
                  {['Wrong eligibility', 'Wrong benefit', 'Broken link', 'Outdated information', 'Missing document', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <textarea className="input-field" rows={3} placeholder="Provide details..." value={feedback.details} onChange={e => setFeedback(f => ({ ...f, details: e.target.value }))} />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowFeedback(false)} className="flex-1 btn-ghost border border-gray-200 justify-center py-2.5">Cancel</button>
                <button onClick={handleFeedback} disabled={!feedback.reason || !feedback.details} className="flex-1 btn-primary justify-center py-2.5 text-sm">Submit Report</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
