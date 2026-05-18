import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet, Lock, CheckCircle2, Star, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import WorkerLayout from '../../components/worker/WorkerLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../components/shared/Toast.jsx';
import {
  getWalletBalance, getMyTasks, browseTasks,
  getTransactionHistory, getMyProfile, applyForTask,
} from '../../api/worker.js';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const isNearDeadline = (d) => {
  if (!d) return false;
  return (new Date(d) - Date.now()) < 3 * 24 * 60 * 60 * 1000;
};

const CATEGORY_COLORS = {
  social: '#3b82f6', writing: '#8b5cf6', marketing: '#f59e0b',
  tech: '#06b6d4', data: '#10b981', design: '#ec4899',
  research: '#f97316', other: '#6b7280',
};

const statusColors = {
  in_progress: '#3b82f6', submitted: '#f59e0b',
  completed: '#7ed348', disputed: '#ef4444',
};

const txIcons = { task_payment: '💰', withdrawal: '🏦', deposit: '⬆️', escrow_lock: '🔒', escrow_release: '🔓', escrow_refund: '↩️' };

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ h = 20, w = '100%', r = 8 }) => (
  <div style={{ height: h, width: w, borderRadius: r, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = '#7ed348', action, actionLabel, loading }) => (
  <div
    style={{
      background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
      padding: '24px', transition: 'border-color 0.2s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(126,211,72,0.2)'}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} style={{ color }} />
      </div>
      {action && (
        <button onClick={action} style={{ fontSize: 12, background: 'rgba(126,211,72,0.1)', border: '1px solid rgba(126,211,72,0.25)', borderRadius: 20, padding: '4px 12px', color: '#7ed348', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontWeight: 600 }}>
          {actionLabel}
        </button>
      )}
    </div>
    {loading ? <Skeleton h={32} w="60%" /> : (
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
    )}
    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{sub}</div>}
  </div>
);

// ─── Task Card ────────────────────────────────────────────────────────────────
const TaskCard = ({ task }) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState('');

  const applyMut = useMutation({
    mutationFn: () => applyForTask(task._id),
    onSuccess: () => {
      setApplied(true);
      toast('Application submitted!', 'success');
      queryClient.invalidateQueries({ queryKey: ['available-tasks'] });
    },
    onError: (err) => setApplyError(err?.response?.data?.message || 'Could not apply'),
  });

  const catColor = CATEGORY_COLORS[task.category] || '#6b7280';
  const near = isNearDeadline(task.deadline);

  return (
    <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 10, transition: 'transform 0.2s, border-color 0.2s' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(126,211,72,0.2)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ background: `${catColor}20`, color: catColor, border: `1px solid ${catColor}40`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>
          {task.category}
        </span>
        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: '#7ed348' }}>{fmt(task.reward)}</span>
      </div>

      <div>
        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{task.title}</h3>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '6px 0 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>{task.description}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: near ? '#ef4444' : 'rgba(255,255,255,0.4)' }}>
        <Clock size={12} /> Due: {fmtDate(task.deadline)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
          {task.creatorDetails?.firstName?.[0] || '?'}
        </div>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
          {task.creatorDetails?.firstName} {task.creatorDetails?.lastName}
        </span>
      </div>

      {applyError && <p style={{ fontSize: 12, color: '#ef4444', margin: 0 }}>{applyError}</p>}

      <button
        onClick={() => !applied && applyMut.mutate()}
        disabled={applied || applyMut.isPending}
        style={{
          marginTop: 4,
          width: '100%',
          padding: '10px',
          borderRadius: 8,
          border: 'none',
          background: applied ? 'rgba(126,211,72,0.15)' : 'linear-gradient(135deg,#7ed348,#4caf50)',
          color: applied ? '#7ed348' : '#000',
          fontFamily: "'Outfit',sans-serif",
          fontWeight: 700,
          fontSize: 13,
          cursor: applied || applyMut.isPending ? 'not-allowed' : 'pointer',
        }}
      >
        {applied ? 'Applied ✓' : applyMut.isPending ? 'Applying...' : 'Apply Now'}
      </button>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const WorkerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: async () => (await getWalletBalance()).data,
  });

  const { data: profileData } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => (await getMyProfile()).data,
  });

  const { data: completedData } = useQuery({
    queryKey: ['my-tasks-completed-count'],
    queryFn: async () => (await getMyTasks({ status: 'completed', limit: 1 })).data,
  });

  const { data: activeTasks } = useQuery({
    queryKey: ['my-tasks-active'],
    queryFn: async () => (await getMyTasks({ limit: 4 })).data,
  });

  const { data: availTasks, isLoading: availLoading } = useQuery({
    queryKey: ['available-tasks'],
    queryFn: async () => (await browseTasks({ limit: 6, status: 'open' })).data,
  });

  const { data: txData } = useQuery({
    queryKey: ['transactions-recent'],
    queryFn: async () => (await getTransactionHistory({ limit: 5 })).data,
  });

  const profile = profileData?.user;
  const avgRating = profile?.averageRating || 0;
  const trustScore = profile?.trustScore || 0;
  const completedCount = completedData?.total || 0;
  const transactions = txData?.transactions || [];
  const activeTaskList = activeTasks?.tasks || [];
  const availTaskList = availTasks?.tasks || [];

  return (
    <WorkerLayout pageTitle="Dashboard">
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* ─── Greeting ── */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, letterSpacing: '0.04em', margin: 0 }}>
          Welcome back, {user?.firstName} 👋
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 4 }}>
          Here&apos;s your activity overview.
        </p>
      </div>

      {/* ─── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon={Wallet} label="Available to withdraw" value={fmt(balance?.walletBalance)} color="#7ed348" action={() => navigate('/worker/wallet')} actionLabel="Withdraw" loading={balanceLoading} />
        <StatCard icon={Lock} label="Locked in active tasks" value={fmt(balance?.escrowBalance)} color="#c9a84c" loading={balanceLoading} />
        <StatCard icon={CheckCircle2} label="Tasks finished" value={completedCount} color="#7ed348" />
        <StatCard
          icon={Star}
          label="Average rating"
          value={avgRating.toFixed(1)}
          color="#c9a84c"
          sub={`Trust score: ${trustScore}/100`}
          loading={false}
        />
      </div>

      {/* ─── Available Tasks ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, margin: 0 }}>Available Tasks</h3>
          <Link to="/worker/tasks" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#7ed348', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            View All <ChevronRight size={14} />
          </Link>
        </div>
        {availLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20 }}>
                <Skeleton h={16} w="40%" />
                <div style={{ marginTop: 12 }}><Skeleton h={18} /></div>
                <div style={{ marginTop: 8 }}><Skeleton h={12} /></div>
                <div style={{ marginTop: 8 }}><Skeleton h={12} w="60%" /></div>
                <div style={{ marginTop: 16 }}><Skeleton h={36} r={8} /></div>
              </div>
            ))}
          </div>
        ) : availTaskList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15 }}>No open tasks right now. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
            {availTaskList.map((task) => <TaskCard key={task._id} task={task} />)}
          </div>
        )}
      </div>

      {/* ─── My Active Tasks ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, margin: 0 }}>My Active Tasks</h3>
          <Link to="/worker/my-tasks" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#7ed348', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            View All <ChevronRight size={14} />
          </Link>
        </div>
        {activeTaskList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 20px', background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15 }}>No active tasks yet. Apply for a task to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeTaskList.map((task) => (
              <div key={task._id} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    {task.creatorDetails?.firstName} {task.creatorDetails?.lastName} · Due {fmtDate(task.deadline)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span style={{ background: `${statusColors[task.status] || '#888'}18`, color: statusColors[task.status] || '#888', border: `1px solid ${statusColors[task.status] || '#888'}30`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: '#7ed348' }}>{fmt(task.reward)}</span>
                  {task.status === 'in_progress' ? (
                    <button onClick={() => navigate('/worker/my-tasks')} style={{ background: 'linear-gradient(135deg,#7ed348,#4caf50)', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#000', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Submit Work
                    </button>
                  ) : task.status === 'submitted' ? (
                    <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>Awaiting Review</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Recent Transactions ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, margin: 0 }}>Recent Transactions</h3>
          <Link to="/worker/wallet" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#7ed348', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
          {transactions.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 15 }}>No transactions yet.</div>
          ) : (
            transactions.map((tx, i) => {
              const isCredit = ['task_payment', 'deposit', 'escrow_release', 'escrow_refund'].includes(tx.type);
              return (
                <div key={tx._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < transactions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{txIcons[tx.type] || '💳'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description || tx.type.replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{fmtDate(tx.createdAt)}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: isCredit ? '#7ed348' : '#ef4444' }}>
                      {isCredit ? '+' : '-'}{fmt(tx.amount)}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: tx.status === 'completed' ? '#7ed348' : tx.status === 'pending' ? '#f59e0b' : '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </WorkerLayout>
  );
};

export default WorkerDashboard;
