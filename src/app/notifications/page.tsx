'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Bell, Check, CheckCheck } from 'lucide-react';

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  'NEW_SCHEME': { icon: '🎯', color: 'bg-blue-50 border-blue-100' },
  'DEADLINE_REMINDER': { icon: '⏰', color: 'bg-red-50 border-red-100' },
  'RULE_UPDATED': { icon: '📋', color: 'bg-yellow-50 border-yellow-100' },
  'PROFILE_INCOMPLETE': { icon: '👤', color: 'bg-orange-50 border-orange-100' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(d => {
      setNotifications(d.notifications || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notificationId: id }) });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardLayout title="Notifications">
      <div className="space-y-6 animate-fade-in max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-jakarta text-2xl font-bold text-navy">Notifications</h1>
            <p className="text-gray-500 text-sm mt-1">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-saffron font-medium hover:underline">
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
        ) : notifications.length === 0 ? (
          <div className="card text-center py-16">
            <Bell size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n: any) => {
              const { icon, color } = TYPE_ICONS[n.type] || { icon: '📣', color: 'bg-gray-50 border-gray-100' };
              return (
                <div key={n.id} className={`flex items-start gap-3 p-4 rounded-2xl border ${color} ${n.isRead ? 'opacity-60' : ''} transition-all`}>
                  <span className="text-2xl flex-shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${n.isRead ? 'text-gray-500' : 'text-navy'}`}>{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {!n.isRead && (
                    <button onClick={() => markRead(n.id)} className="flex-shrink-0 p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors">
                      <Check size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
