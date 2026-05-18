import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Trash2, CheckCheck } from 'lucide-react';
import WorkerLayout from '../../components/worker/WorkerLayout.jsx';
import { useToast } from '../../components/shared/Toast.jsx';
import {
  getNotifications, markNotificationRead,
  markAllNotificationsRead, deleteNotification,
} from '../../api/worker.js';

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const NotificationsPage = () => {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications-page', unreadOnly],
    queryFn: async () => (await getNotifications({ unreadOnly: unreadOnly ? 'true' : undefined, limit: 50 })).data,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const markReadMut = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-bell'] });
    },
  });

  const markAllMut = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      toast('All notifications marked as read', 'success');
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-bell'] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-page'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-bell'] });
    },
    onError: () => toast('Could not delete notification', 'error'),
  });

  const handleClick = (n) => {
    if (!n.isRead) markReadMut.mutate(n._id);
    if (n.taskRef) navigate('/worker/my-tasks');
  };

  return (
    <WorkerLayout pageTitle="Notifications">
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 4, background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 4 }}>
          {[{ label: 'All', value: false }, { label: 'Unread', value: true }].map(({ label, value }) => (
            <button
              key={label}
              onClick={() => setUnreadOnly(value)}
              style={{
                padding: '7px 18px', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: unreadOnly === value ? 'rgba(126,211,72,0.12)' : 'transparent',
                color: unreadOnly === value ? '#7ed348' : 'rgba(255,255,255,0.45)',
                fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {label}
              {label === 'Unread' && unreadCount > 0 && (
                <span style={{ background: '#3b82f6', color: '#fff', borderRadius: 10, padding: '0 6px', fontSize: 11, fontWeight: 700 }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllMut.mutate()}
            disabled={markAllMut.isPending}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(126,211,72,0.08)', border: '1px solid rgba(126,211,72,0.25)', borderRadius: 8, padding: '8px 16px', color: '#7ed348', fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            <CheckCheck size={15} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: 70, borderRadius: 8, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite', marginBottom: 4 }} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Bell size={48} style={{ color: 'rgba(255,255,255,0.12)', marginBottom: 16 }} />
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 16, margin: 0 }}>
              {unreadOnly ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          notifications.map((n, i) => (
            <div
              key={n._id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '16px 20px',
                borderBottom: i < notifications.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: n.isRead ? 'transparent' : 'rgba(59,130,246,0.04)',
                cursor: 'pointer',
                transition: 'background 0.15s',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.querySelector('.del-btn').style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(59,130,246,0.04)';
                e.currentTarget.querySelector('.del-btn').style.opacity = '0';
              }}
              onClick={() => handleClick(n)}
            >
              {/* Unread Dot */}
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.isRead ? 'rgba(255,255,255,0.1)' : '#3b82f6', flexShrink: 0, marginTop: 6 }} />

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, color: n.isRead ? 'rgba(255,255,255,0.65)' : '#fff', margin: 0, lineHeight: 1.5 }}>{n.message}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '4px 0 0' }}>{timeAgo(n.createdAt)}</p>
              </div>

              {/* Delete button (shown on hover) */}
              <button
                className="del-btn"
                onClick={(e) => { e.stopPropagation(); deleteMut.mutate(n._id); }}
                style={{ opacity: 0, transition: 'opacity 0.15s', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '5px 7px', color: '#ef4444', cursor: 'pointer', flexShrink: 0 }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </WorkerLayout>
  );
};

export default NotificationsPage;
