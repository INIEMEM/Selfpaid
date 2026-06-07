import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, ClipboardList, Wallet,
  User, Menu, X, Bell, LogOut, CheckCheck, ChevronRight,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import Logo from '../shared/Logo.jsx';
import { logoutUser } from '../../api/auth.js';
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../api/worker.js';

const navLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/creator/dashboard' },
  { icon: PlusCircle, label: 'Post a Task', path: '/creator/tasks/create' },
  { icon: ClipboardList, label: 'My Tasks', path: '/creator/tasks' },
  { icon: Wallet, label: 'Wallet', path: '/creator/wallet' },
  { icon: User, label: 'Profile', path: '/creator/profile' },
];

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const CreatorLayout = ({ children, pageTitle = '' }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: notifData } = useQuery({
    queryKey: ['notifications-bell'],
    queryFn: async () => {
      const res = await getNotifications({ limit: 5, unreadOnly: true });
      return res.data;
    },
    refetchInterval: 30000,
  });

  const unreadCount = notifData?.unreadCount || 0;
  const recentNotifs = notifData?.notifications || [];

  const markAllMut = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications-bell'] }),
  });

  const markReadMut = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications-bell'] }),
  });

  const handleLogout = async () => {
    try { await logoutUser(); } catch (_) {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : '?';

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Logo size="sm" />
        <div style={{ marginTop: 10, background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#c9a84c', letterSpacing: '0.06em' }}>✦ CREATOR</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        {navLinks.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                borderRadius: 10, marginBottom: 2, textDecoration: 'none',
                fontSize: 14, fontWeight: isActive ? 600 : 400, fontFamily: "'Outfit',sans-serif",
                color: isActive ? '#c9a84c' : 'rgba(255,255,255,0.55)',
                background: isActive ? 'rgba(201,168,76,0.08)' : 'transparent',
                borderLeft: isActive ? '3px solid #c9a84c' : '3px solid transparent',
                transition: 'all 0.18s',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#eab308)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#000', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontSize: 11, color: '#c9a84c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Task Creator
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '9px 14px', color: '#ef4444', fontSize: 13, fontWeight: 600, fontFamily: "'Outfit',sans-serif", cursor: 'pointer', transition: 'background 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex' }}>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex"
        style={{ width: 240, flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.06)', flexDirection: 'column', zIndex: 50 }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        style={{ position: 'fixed', top: 0, left: sidebarOpen ? 0 : -260, bottom: 0, width: 240, background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.06)', zIndex: 70, transition: 'left 0.25s ease', display: 'flex', flexDirection: 'column' }}
        className="md:hidden"
      >
        <button onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', zIndex: 1 }}>
          <X size={20} />
        </button>
        <SidebarContent />
      </aside>

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }} className="md:ml-60">
        {/* Header */}
        <header
          style={{ position: 'sticky', top: 0, zIndex: 40, height: 64, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16 }}
        >
          <button className="md:hidden" onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
            <Menu size={22} />
          </button>

          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: '0.06em', color: '#fff', margin: 0, flex: 1 }}>
            {pageTitle}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Post Task CTA */}
            <button
              onClick={() => navigate('/creator/tasks/create')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#c9a84c,#eab308)', border: 'none', borderRadius: 20, padding: '6px 14px', color: '#000', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <PlusCircle size={14} /> Post Task
            </button>

            {/* Notification Bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                style={{ position: 'relative', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 6, borderRadius: 8, transition: 'color 0.2s, background 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, background: '#ef4444', borderRadius: '50%', fontSize: 10, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 340, background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.6)', overflow: 'hidden', zIndex: 100 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>Notifications</span>
                    <button onClick={() => markAllMut.mutate()} style={{ background: 'none', border: 'none', color: '#c9a84c', fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCheck size={13} /> Mark all read
                    </button>
                  </div>
                  {recentNotifs.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>No new notifications</div>
                  ) : (
                    recentNotifs.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => { markReadMut.mutate(n._id); setNotifOpen(false); }}
                        style={{ display: 'flex', gap: 10, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: n.isRead ? 'transparent' : 'rgba(201,168,76,0.04)', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(201,168,76,0.04)'}
                      >
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: n.isRead ? 'transparent' : '#c9a84c', flexShrink: 0, marginTop: 5 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.5 }}>{n.message}</p>
                          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '3px 0 0' }}>{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div style={{ padding: '10px 16px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <Link to="/creator/notifications" onClick={() => setNotifOpen(false)} style={{ fontSize: 13, color: '#c9a84c', textDecoration: 'none', fontWeight: 600 }}>
                      View all notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div
              style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#c9a84c,#eab308)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#000', flexShrink: 0, cursor: 'pointer' }}
              onClick={() => navigate('/creator/profile')}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default CreatorLayout;
