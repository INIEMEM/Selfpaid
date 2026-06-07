import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, ClipboardList, Clock, CheckCircle2, AlertCircle, Wallet, ChevronRight, Lock } from 'lucide-react';
import CreatorLayout from '../../components/creator/CreatorLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getCreatorTasks, getCreatorWalletBalance } from '../../api/creator.js';

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const CATEGORY_COLORS = {
  social: '#3b82f6', writing: '#8b5cf6', marketing: '#f59e0b',
  tech: '#06b6d4', data: '#10b981', design: '#ec4899',
  research: '#f97316', other: '#6b7280',
};

const statusColors = {
  pending_approval: '#f59e0b',
  open: '#7ed348',
  in_progress: '#3b82f6',
  submitted: '#a78bfa',
  completed: '#10b981',
  cancelled: '#6b7280',
  disputed: '#ef4444',
};

const Skeleton = ({ h = 20, w = '100%', r = 8 }) => (
  <div style={{ height: h, width: w, borderRadius: r, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
);

const StatCard = ({ icon: Icon, label, value, color, sub, onClick }) => (
  <div
    onClick={onClick}
    style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, cursor: onClick ? 'pointer' : 'default', transition: 'border-color 0.2s, transform 0.2s' }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}40`; if (onClick) e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
      <Icon size={20} style={{ color }} />
    </div>
    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 34, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{sub}</div>}
  </div>
);

const CreatorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['creator-tasks-all'],
    queryFn: async () => (await getCreatorTasks({ limit: 100 })).data,
  });

  const { data: balanceData } = useQuery({
    queryKey: ['creator-wallet-balance'],
    queryFn: async () => (await getCreatorWalletBalance()).data,
  });

  const tasks = tasksData?.tasks || [];
  const openTasks = tasks.filter((t) => t.status === 'open').length;
  const activeTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const pendingReview = tasks.filter((t) => t.status === 'submitted').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const recentTasks = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <CreatorLayout pageTitle="Dashboard">
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, letterSpacing: '0.04em', margin: 0 }}>
          Welcome back, {user?.firstName} ✨
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 4 }}>
          Here&apos;s an overview of your task campaigns.
        </p>
      </div>

      {/* Quick Wallet Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.03))', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 16, padding: '18px 24px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={22} style={{ color: '#c9a84c' }} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '0.06em' }}>AVAILABLE BALANCE</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: '#c9a84c', lineHeight: 1.1 }}>
              {fmt(balanceData?.wallet?.available || 0)}
            </div>
          </div>
          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.08)', margin: '0 8px' }} />
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600, letterSpacing: '0.06em' }}>IN ESCROW</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: '#f59e0b', lineHeight: 1.1 }}>
              {fmt(balanceData?.wallet?.inEscrow || 0)}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/creator/wallet')}
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 10, padding: '10px 18px', color: '#c9a84c', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            Deposit Funds
          </button>
          <button
            onClick={() => navigate('/creator/tasks/create')}
            style={{ background: 'linear-gradient(135deg,#c9a84c,#eab308)', border: 'none', borderRadius: 10, padding: '10px 18px', color: '#000', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <PlusCircle size={14} /> Post a Task
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon={ClipboardList} label="Open Tasks" value={tasksLoading ? '—' : openTasks} color="#7ed348" onClick={() => navigate('/creator/tasks')} />
        <StatCard icon={Clock} label="In Progress" value={tasksLoading ? '—' : activeTasks} color="#3b82f6" onClick={() => navigate('/creator/tasks')} />
        <StatCard icon={AlertCircle} label="Awaiting Review" value={tasksLoading ? '—' : pendingReview} color="#f59e0b" sub="Workers submitted work" onClick={() => navigate('/creator/tasks')} />
        <StatCard icon={CheckCircle2} label="Completed" value={tasksLoading ? '—' : completedTasks} color="#10b981" />
        <StatCard icon={Lock} label="Total Spent in Escrow" value={fmt(balanceData?.wallet?.inEscrow || 0)} color="#a78bfa" />
      </div>

      {/* Pending Review Alert */}
      {pendingReview > 0 && (
        <div
          onClick={() => navigate('/creator/tasks')}
          style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 14, padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertCircle size={20} style={{ color: '#fbbf24' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#fbbf24' }}>
              {pendingReview} submission{pendingReview > 1 ? 's' : ''} awaiting your review!
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
              Workers have submitted their work. Review and approve to release payments.
            </div>
          </div>
          <ChevronRight size={18} style={{ color: '#fbbf24', flexShrink: 0 }} />
        </div>
      )}

      {/* Recent Tasks */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, margin: 0 }}>Recent Tasks</h3>
          <button onClick={() => navigate('/creator/tasks')} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#c9a84c', background: 'none', border: 'none', textDecoration: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            View All <ChevronRight size={14} />
          </button>
        </div>
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
          {tasksLoading ? (
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(4)].map((_, i) => <Skeleton key={i} h={52} />)}
            </div>
          ) : recentTasks.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, margin: '0 0 16px' }}>No tasks posted yet.</p>
              <button
                onClick={() => navigate('/creator/tasks/create')}
                style={{ background: 'linear-gradient(135deg,#c9a84c,#eab308)', border: 'none', borderRadius: 10, padding: '12px 24px', color: '#000', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
              >
                Post Your First Task
              </button>
            </div>
          ) : (
            recentTasks.map((task, i) => {
              const catColor = CATEGORY_COLORS[task.category] || '#6b7280';
              const sColor = statusColors[task.status] || '#888';
              return (
                <div
                  key={task._id}
                  onClick={() => navigate('/creator/tasks')}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: i < recentTasks.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ background: `${catColor}20`, color: catColor, border: `1px solid ${catColor}40`, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                    {task.category}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Due {fmtDate(task.deadline)}</div>
                  </div>
                  <span style={{ background: `${sColor}18`, color: sColor, border: `1px solid ${sColor}30`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                    {task.status.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: '#c9a84c', flexShrink: 0 }}>{fmt(task.reward)}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </CreatorLayout>
  );
};

export default CreatorDashboard;
