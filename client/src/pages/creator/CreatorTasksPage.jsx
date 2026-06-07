import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import CreatorLayout from '../../components/creator/CreatorLayout.jsx';
import { useToast } from '../../components/shared/Toast.jsx';
import { getCreatorTasks, selectWorker, reviewSubmission, cancelTask } from '../../api/creator.js';

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const CATEGORY_COLORS = {
  social: '#3b82f6', writing: '#8b5cf6', marketing: '#f59e0b',
  tech: '#06b6d4', data: '#10b981', design: '#ec4899',
  research: '#f97316', other: '#6b7280',
};

const statusColors = {
  pending_approval: '#f59e0b', open: '#7ed348', in_progress: '#3b82f6',
  submitted: '#a78bfa', completed: '#10b981', cancelled: '#6b7280', disputed: '#ef4444',
};

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Pending Approval', value: 'pending_approval' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Needs Review', value: 'submitted' },
  { label: 'Completed', value: 'completed' },
];

// ─── Applicant Card ─────────────────────────────────────────────────────────
const ApplicantCard = ({ applicant, taskId, onHire }) => {
  const toast = useToast();
  const [isHiring, setIsHiring] = useState(false);

  return (
    <div style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7ed348,#4caf50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#000', flexShrink: 0 }}>
        {applicant.firstName?.[0] || '?'}{applicant.lastName?.[0] || ''}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{applicant.firstName} {applicant.lastName}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
          ⭐ {(applicant.averageRating || 0).toFixed(1)} · Trust {applicant.trustScore || 0}/100
        </div>
      </div>
      <button
        onClick={() => onHire(applicant._id)}
        style={{ background: 'linear-gradient(135deg,#7ed348,#4caf50)', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#000', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
      >
        Hire Worker
      </button>
    </div>
  );
};

// ─── Task Row ───────────────────────────────────────────────────────────────
const TaskRow = ({ task }) => {
  const [expanded, setExpanded] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  const hireMut = useMutation({
    mutationFn: (workerId) => selectWorker(task._id, workerId),
    onSuccess: () => {
      toast('Worker hired! Task is now in progress.', 'success');
      queryClient.invalidateQueries({ queryKey: ['creator-tasks'] });
    },
    onError: (err) => toast(err?.response?.data?.message || 'Failed to hire worker', 'error'),
  });

  const approveMut = useMutation({
    mutationFn: () => reviewSubmission(task._id, { action: 'approve' }),
    onSuccess: () => {
      toast('Work approved! Payment released to worker.', 'success');
      queryClient.invalidateQueries({ queryKey: ['creator-tasks'] });
    },
    onError: (err) => toast(err?.response?.data?.message || 'Failed to approve', 'error'),
  });

  const rejectMut = useMutation({
    mutationFn: () => reviewSubmission(task._id, { action: 'reject' }),
    onSuccess: () => {
      toast('Submission rejected. Task is back to in-progress.', 'success');
      queryClient.invalidateQueries({ queryKey: ['creator-tasks'] });
    },
    onError: (err) => toast(err?.response?.data?.message || 'Failed to reject', 'error'),
  });

  const cancelMut = useMutation({
    mutationFn: () => cancelTask(task._id),
    onSuccess: () => {
      toast('Task cancelled.', 'success');
      queryClient.invalidateQueries({ queryKey: ['creator-tasks'] });
    },
    onError: (err) => toast(err?.response?.data?.message || 'Failed to cancel', 'error'),
  });

  const applicants = task.applicants || [];
  const catColor = CATEGORY_COLORS[task.category] || '#6b7280';
  const sColor = statusColors[task.status] || '#888';

  return (
    <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
    >
      {/* Main Row */}
      <div
        style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', cursor: 'pointer' }}
        onClick={() => setExpanded((v) => !v)}
      >
        <span style={{ background: `${catColor}20`, color: catColor, border: `1px solid ${catColor}40`, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {task.category}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
            Due {fmtDate(task.deadline)}
            {task.status === 'open' && applicants.length > 0 && <span style={{ color: '#c9a84c', marginLeft: 8 }}>· {applicants.length} applicant{applicants.length > 1 ? 's' : ''}</span>}
            {task.assignedWorker && <span style={{ marginLeft: 8 }}>· Worker: {task.assignedWorker.firstName} {task.assignedWorker.lastName}</span>}
          </div>
        </div>
        <span style={{ background: `${sColor}18`, color: sColor, border: `1px solid ${sColor}30`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {task.status.replace(/_/g, ' ')}
        </span>
        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: '#c9a84c', flexShrink: 0 }}>{fmt(task.reward)}</span>
        {expanded ? <ChevronUp size={16} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />}
      </div>

      {/* Expanded Section */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px' }}>
          {/* Task description */}
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', line: 1.6, margin: '0 0 20px' }}>{task.description}</p>

          {/* Applicants - open status */}
          {task.status === 'open' && (
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', marginBottom: 12 }}>APPLICANTS ({applicants.length})</h4>
              {applicants.length === 0 ? (
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={14} /> No applicants yet. Task is live and visible to workers.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {applicants.map((a) => (
                    <ApplicantCard key={a._id} applicant={a} taskId={task._id} onHire={(workerId) => hireMut.mutate(workerId)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submitted review */}
          {task.status === 'submitted' && (
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.08em', marginBottom: 12 }}>✨ SUBMITTED WORK</h4>
              {task.submission ? (
                <div style={{ background: '#1a1a1a', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: '0 0 12px', lineHeight: 1.6 }}>{task.submission.description}</p>
                  {task.submission.fileUrl && (
                    <a href={task.submission.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#7ed348', fontSize: 13, fontWeight: 600 }}>
                      📎 View Attached File
                    </a>
                  )}
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '10px 0 0' }}>Submitted by: {task.assignedWorker?.firstName} {task.assignedWorker?.lastName}</p>
                </div>
              ) : (
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>Submission details not available.</p>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => approveMut.mutate()}
                  disabled={approveMut.isPending}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', borderRadius: 10, border: 'none', background: approveMut.isPending ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, cursor: approveMut.isPending ? 'not-allowed' : 'pointer' }}
                >
                  <CheckCircle size={16} /> {approveMut.isPending ? 'Approving...' : 'Approve & Release Payment'}
                </button>
                <button
                  onClick={() => rejectMut.mutate()}
                  disabled={rejectMut.isPending}
                  style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 6, padding: '12px 20px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, cursor: rejectMut.isPending ? 'not-allowed' : 'pointer' }}
                >
                  <XCircle size={16} /> {rejectMut.isPending ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          )}

          {/* Completed */}
          {task.status === 'completed' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10 }}>
              <CheckCircle size={18} style={{ color: '#10b981', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: 14, color: '#10b981', fontWeight: 600 }}>
                Task completed! Payment released to {task.assignedWorker?.firstName} {task.assignedWorker?.lastName}.
              </p>
            </div>
          )}

          {/* Cancel option for open/pending tasks */}
          {['pending_approval', 'open'].includes(task.status) && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button
                onClick={() => { if (window.confirm('Are you sure you want to cancel this task? Your escrowed funds will be returned.')) cancelMut.mutate(); }}
                disabled={cancelMut.isPending}
                style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.6)', fontSize: 13, fontFamily: "'Outfit',sans-serif", fontWeight: 600, cursor: 'pointer' }}
              >
                {cancelMut.isPending ? 'Cancelling...' : 'Cancel Task'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const CreatorTasksPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['creator-tasks', activeTab],
    queryFn: async () => (await getCreatorTasks({ status: activeTab || undefined, limit: 50 })).data,
  });

  const tasks = data?.tasks || [];

  return (
    <CreatorLayout pageTitle="My Tasks">
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, letterSpacing: '0.04em', margin: 0 }}>All Your Tasks</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 4 }}>Manage applicants, review submissions, and track progress.</p>
        </div>
        <button
          onClick={() => navigate('/creator/tasks/create')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#c9a84c,#eab308)', border: 'none', borderRadius: 10, padding: '11px 20px', color: '#000', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          <PlusCircle size={16} /> Post New Task
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 4, overflowX: 'auto' }}>
        {STATUS_TABS.map(({ label, value }) => {
          const isActive = activeTab === value;
          return (
            <button
              key={value} onClick={() => setActiveTab(value)}
              style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', background: isActive ? 'rgba(201,168,76,0.12)' : 'transparent', color: isActive ? '#c9a84c' : 'rgba(255,255,255,0.5)', fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 13, transition: 'all 0.18s' }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Task List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ height: 80, borderRadius: 14, background: '#111', border: '1px solid rgba(255,255,255,0.07)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 16, margin: '0 0 20px' }}>
            {activeTab ? `No tasks with status "${activeTab.replace(/_/g, ' ')}".` : 'You haven\'t posted any tasks yet.'}
          </p>
          <button
            onClick={() => navigate('/creator/tasks/create')}
            style={{ background: 'linear-gradient(135deg,#c9a84c,#eab308)', border: 'none', borderRadius: 10, padding: '12px 28px', color: '#000', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Post Your First Task
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.map((task) => <TaskRow key={task._id} task={task} />)}
        </div>
      )}
    </CreatorLayout>
  );
};

export default CreatorTasksPage;
