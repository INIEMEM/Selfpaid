import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X, Star, Clock } from 'lucide-react';
import WorkerLayout from '../../components/worker/WorkerLayout.jsx';
import { useToast } from '../../components/shared/Toast.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getMyTasks, submitTaskWork, submitRating } from '../../api/worker.js';

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Completed', value: 'completed' },
  { label: 'Disputed', value: 'disputed' },
];

const statusColors = {
  in_progress: '#3b82f6', submitted: '#f59e0b',
  completed: '#7ed348', disputed: '#ef4444',
};

// ─── Submit Work Modal ────────────────────────────────────────────────────────
const SubmitWorkModal = ({ task, onClose, onSuccess }) => {
  const toast = useToast();
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [descErr, setDescErr] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const submitMut = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('description', description);
      if (file) fd.append('file', file);
      return submitTaskWork(task._id, fd);
    },
    onSuccess: () => {
      toast('Work submitted successfully!', 'success');
      onSuccess();
      onClose();
    },
    onError: (err) => toast(err?.response?.data?.message || 'Submission failed', 'error'),
  });

  const handleSubmit = () => {
    if (description.trim().length < 20) { setDescErr('Description must be at least 20 characters'); return; }
    setDescErr('');
    submitMut.mutate();
  };

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { toast('File must be under 5MB', 'error'); return; }
    const allowed = ['image/jpeg','image/png','image/gif','application/pdf','image/webp'];
    if (!allowed.includes(f.type)) { toast('Only images and PDFs allowed', 'error'); return; }
    setFile(f);
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 520, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
          <X size={16} />
        </button>
        <div style={{ padding: '28px 28px 24px' }}>
          <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: '0.04em', margin: '0 0 4px' }}>Submit Your Work</h3>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '0 0 22px' }}>{task.title}</p>

          <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>DESCRIBE YOUR WORK *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what you did and any relevant links or notes (min 20 chars)..."
            rows={5}
            style={{ width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#fff', fontFamily: "'Outfit',sans-serif", fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
            onFocus={(e) => e.target.style.borderColor = '#7ed348'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          {descErr && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{descErr}</p>}

          {/* File Upload */}
          <div
            style={{ marginTop: 16, border: `2px dashed ${dragOver ? '#7ed348' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, padding: '24px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', background: dragOver ? 'rgba(126,211,72,0.04)' : 'transparent' }}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          >
            <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={(e) => handleFile(e.target.files[0])} />
            <Upload size={24} style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 8 }} />
            {file ? (
              <div>
                <p style={{ color: '#7ed348', fontSize: 13, fontWeight: 600, margin: 0 }}>{file.name}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '2px 0 0' }}>{(file.size / 1024).toFixed(0)} KB</p>
              </div>
            ) : (
              <>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>Drag & drop or click to upload</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, margin: '4px 0 0' }}>Images and PDFs only · Max 5MB</p>
              </>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitMut.isPending}
            style={{ marginTop: 20, width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: submitMut.isPending ? 'rgba(126,211,72,0.4)' : 'linear-gradient(135deg,#7ed348,#4caf50)', color: '#000', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 15, cursor: submitMut.isPending ? 'not-allowed' : 'pointer' }}
          >
            {submitMut.isPending ? 'Submitting...' : 'Submit Work'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Rate Creator Modal ────────────────────────────────────────────────────────
const RateCreatorModal = ({ task, onClose, onSuccess }) => {
  const toast = useToast();
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const rateMut = useMutation({
    mutationFn: () => submitRating(task._id, { score, review }),
    onSuccess: () => {
      toast('Rating submitted!', 'success');
      onSuccess();
      onClose();
    },
    onError: (err) => toast(err?.response?.data?.message || 'Failed to submit rating', 'error'),
  });

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 440, padding: 28, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
          <X size={16} />
        </button>

        <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: '0.04em', margin: '0 0 4px' }}>Rate Your Experience</h3>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '0 0 24px' }}>
          with {task.creatorDetails?.firstName} {task.creatorDetails?.lastName} on "{task.title}"
        </p>

        {/* Star Selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
          {[1,2,3,4,5].map((s) => (
            <button
              key={s}
              onClick={() => setScore(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <Star size={36} fill={(hover || score) >= s ? '#c9a84c' : 'none'} color={(hover || score) >= s ? '#c9a84c' : 'rgba(255,255,255,0.25)'} style={{ transition: 'all 0.15s' }} />
            </button>
          ))}
        </div>

        <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>LEAVE A REVIEW (Optional)</label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value.slice(0, 500))}
          placeholder="Share your experience working on this task..."
          rows={4}
          style={{ width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', color: '#fff', fontFamily: "'Outfit',sans-serif", fontSize: 14, resize: 'none', outline: 'none', boxSizing: 'border-box' }}
          onFocus={(e) => e.target.style.borderColor = '#7ed348'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4, textAlign: 'right' }}>{review.length}/500</p>

        <button
          onClick={() => score > 0 && rateMut.mutate()}
          disabled={score === 0 || rateMut.isPending}
          style={{ marginTop: 12, width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: score === 0 ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#7ed348,#4caf50)', color: score === 0 ? 'rgba(255,255,255,0.3)' : '#000', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 15, cursor: score === 0 ? 'not-allowed' : 'pointer' }}
        >
          {rateMut.isPending ? 'Submitting...' : 'Submit Rating'}
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const MyTasksPage = () => {
  const [activeTab, setActiveTab] = useState('');
  const [submitTask, setSubmitTask] = useState(null);
  const [rateTask, setRateTask] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-tasks', activeTab],
    queryFn: async () => (await getMyTasks({ status: activeTab || undefined, limit: 50 })).data,
  });

  const tasks = data?.tasks || [];

  // Count for each tab
  const { data: counts } = useQuery({
    queryKey: ['my-tasks-counts'],
    queryFn: async () => {
      const all = ['in_progress', 'submitted', 'completed', 'disputed'];
      const results = await Promise.all(all.map((s) => getMyTasks({ status: s, limit: 1 })));
      return Object.fromEntries(all.map((s, i) => [s, results[i].data?.total || 0]));
    },
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['my-tasks-counts'] });
  };

  return (
    <WorkerLayout pageTitle="My Tasks">
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 4, overflowX: 'auto' }}>
        {STATUS_TABS.map(({ label, value }) => {
          const isActive = activeTab === value;
          const count = value ? (counts?.[value] || 0) : tasks.length;
          return (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                background: isActive ? 'rgba(126,211,72,0.12)' : 'transparent',
                color: isActive ? '#7ed348' : 'rgba(255,255,255,0.5)',
                fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 13,
                transition: 'all 0.18s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {label}
              {value && counts?.[value] > 0 && (
                <span style={{ background: isActive ? '#7ed348' : 'rgba(255,255,255,0.12)', color: isActive ? '#000' : 'rgba(255,255,255,0.6)', borderRadius: 10, padding: '0px 6px', fontSize: 11, fontWeight: 700 }}>
                  {counts[value]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Task List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20, height: 80, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 16 }}>No {activeTab.replace('_', ' ')} tasks yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tasks.map((task) => (
            <div key={task._id}
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', transition: 'border-color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(126,211,72,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            >
              {/* Info */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{task.title}</span>
                  <span style={{ background: `${statusColors[task.status] || '#888'}18`, color: statusColors[task.status] || '#888', border: `1px solid ${statusColors[task.status] || '#888'}30`, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span>{task.creatorDetails?.firstName} {task.creatorDetails?.lastName}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} /> Due {fmtDate(task.deadline)}
                  </span>
                </div>
              </div>

              {/* Amount + Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: '#7ed348' }}>{fmt(task.reward)}</span>
                {task.status === 'in_progress' && (
                  <button onClick={() => setSubmitTask(task)} style={{ background: 'linear-gradient(135deg,#7ed348,#4caf50)', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#000', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Submit Work
                  </button>
                )}
                {task.status === 'submitted' && (
                  <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600, whiteSpace: 'nowrap' }}>Awaiting Review</span>
                )}
                {task.status === 'completed' && (
                  <button onClick={() => setRateTask(task)} style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, padding: '8px 16px', color: '#c9a84c', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                    Rate Creator ★
                  </button>
                )}
                {task.status === 'disputed' && (
                  <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>Under Review</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {submitTask && <SubmitWorkModal task={submitTask} onClose={() => setSubmitTask(null)} onSuccess={refetch} />}
      {rateTask && <RateCreatorModal task={rateTask} onClose={() => setRateTask(null)} onSuccess={refetch} />}
    </WorkerLayout>
  );
};

export default MyTasksPage;
