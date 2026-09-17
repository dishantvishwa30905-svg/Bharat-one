'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { FileText, Trash2, Edit3, ExternalLink } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  'Not Applied': 'badge-gray',
  'Started': 'badge-blue',
  'Submitted': 'badge-blue',
  'Under Review': 'badge-orange',
  'Additional Documents Required': 'badge-orange',
  'Approved': 'badge-green',
  'Rejected': 'badge-red',
  'Completed': 'badge-green',
};

const STATUSES = ['Not Applied', 'Started', 'Submitted', 'Under Review', 'Additional Documents Required', 'Approved', 'Rejected', 'Completed'];

export default function ApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ status: '', referenceNumber: '', notes: '' });

  useEffect(() => {
    fetch('/api/applications').then(r => r.json()).then(d => {
      setApps(d.applications || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleDelete = async (schemeId: string) => {
    if (!confirm('Remove this application tracker?')) return;
    await fetch(`/api/applications?schemeId=${schemeId}`, { method: 'DELETE' });
    setApps(prev => prev.filter(a => a.schemeId !== schemeId));
  };

  const handleEdit = (app: any) => {
    setEditing(app.schemeId);
    setEditForm({ status: app.status, referenceNumber: app.referenceNumber || '', notes: app.notes || '' });
  };

  const handleSaveEdit = async (schemeId: string) => {
    await fetch('/api/applications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ schemeId, ...editForm }) });
    setApps(prev => prev.map(a => a.schemeId === schemeId ? { ...a, ...editForm } : a));
    setEditing(null);
  };

  return (
    <DashboardLayout title="My Applications">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-jakarta text-2xl font-bold text-navy">My Applications</h1>
          <p className="text-gray-500 text-sm mt-1">Track your self-reported government scheme applications.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-700">
          ⚠️ Application status is self-reported by you unless connected to an official government API. This tracker is for your personal reference only.
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
          </div>
        ) : apps.length === 0 ? (
          <div className="card text-center py-16">
            <FileText size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No applications tracked yet.</p>
            <p className="text-gray-400 text-xs mt-1">Go to a scheme's detail page to start tracking your application.</p>
            <Link href="/schemes" className="btn-primary mt-4 inline-flex text-sm px-6 py-2.5">Browse Schemes</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map((app: any) => (
              <div key={app.id} className="card">
                {editing === app.schemeId ? (
                  <div className="space-y-3">
                    <p className="font-semibold text-navy text-sm">{app.scheme?.name}</p>
                    <select className="input-field" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input type="text" className="input-field" placeholder="Reference number" value={editForm.referenceNumber} onChange={e => setEditForm(f => ({ ...f, referenceNumber: e.target.value }))} />
                    <textarea className="input-field" rows={2} placeholder="Notes" value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} />
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(null)} className="flex-1 btn-ghost border border-gray-200 justify-center py-2 text-sm">Cancel</button>
                      <button onClick={() => handleSaveEdit(app.schemeId)} className="flex-1 btn-primary justify-center py-2 text-sm">Save</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`badge ${STATUS_COLORS[app.status] || 'badge-gray'}`}>{app.status}</span>
                        {app.scheme?.category && <span className="badge badge-gray">{app.scheme.category}</span>}
                      </div>
                      <h3 className="font-semibold text-navy text-sm truncate">{app.scheme?.name}</h3>
                      {app.referenceNumber && <p className="text-xs text-gray-400 mt-1">Ref: {app.referenceNumber}</p>}
                      {app.notes && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{app.notes}</p>}
                      {app.appliedDate && <p className="text-xs text-gray-400 mt-1">Applied: {app.appliedDate}</p>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Link href={`/schemes/${app.schemeId}`} className="p-2 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors">
                        <ExternalLink size={15} />
                      </Link>
                      <button onClick={() => handleEdit(app)} className="p-2 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => handleDelete(app.schemeId)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
