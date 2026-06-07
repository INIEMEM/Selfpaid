import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, X, Clock, Users, Star, ChevronDown } from 'lucide-react';
import WorkerLayout from '../../components/worker/WorkerLayout.jsx';
import { useToast } from '../../components/shared/Toast.jsx';
import { browseTasks, getTaskById, applyForTask } from '../../api/worker.js';

const CATEGORY_COLORS = {
  social: '#3b82f6', writing: '#8b5cf6', marketing: '#f59e0b',
  tech: '#06b6d4', data: '#10b981', design: '#ec4899',
  research: '#f97316', other: '#6b7280',
};

const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const isNear = (d) => d && (new Date(d) - Date.now()) < 3 * 24 * 60 * 60 * 1000;

const Skeleton = () => (
  <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20 }}>
    {[100, 60, 80, 40, 120].map((w, i) => (
      <div key={i} style={{ height: i === 0 ? 16 : 12, width: `${w}%`, borderRadius: 6, background: 'rgba(255,255,255,0.06)', marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite' }} />
    ))}
  </div>
);

// ─── Task Detail Modal ─────────────────────────────────────────────────────────
const TaskDetailModal = ({ taskId, onClose }) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [applied, setApplied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['task-detail', taskId],
    queryFn: async () => (await getTaskById(taskId)).data,
    enabled: !!taskId,
  });

  const applyMut = useMutation({
    mutationFn: () => applyForTask(taskId),
    onSuccess: () => {
      setApplied(true);
      toast('Application submitted!', 'success');
      queryClient.invalidateQueries({ queryKey: ['browse-tasks'] });
    },
    onError: (err) => toast(err?.response?.data?.message || 'Could not apply', 'error'),
  });

  // Close on Esc
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const task = data?.task || data;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', zIndex: 1 }}>
          <X size={16} />
        </button>

        {isLoading ? (
          <div style={{ padding: 32 }}>
            {[...Array(5)].map((_, i) => <div key={i} style={{ height: 16, background: 'rgba(255,255,255,0.06)', borderRadius: 6, marginBottom: 12, animation: 'pulse 1.5s ease-in-out infinite', width: `${[100, 60, 80, 40, 90][i]}%` }} />)}
          </div>
        ) : task ? (
          <div style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ background: `${CATEGORY_COLORS[task.category] || '#6b7280'}20`, color: CATEGORY_COLORS[task.category] || '#6b7280', border: `1px solid ${CATEGORY_COLORS[task.category] || '#6b7280'}40`, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                {task.category}
              </span>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#7ed348', marginLeft: 'auto' }}>{fmt(task.reward)}</span>
            </div>

            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 20, margin: '0 0 12px', lineHeight: 1.4 }}>{task.title}</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: '0 0 20px' }}>{task.description}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#1a1a1a', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Deadline</div>
                <div style={{ fontSize: 14, color: isNear(task.deadline) ? '#ef4444' : '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} /> {fmtDate(task.deadline)}
                </div>
              </div>
              <div style={{ background: '#1a1a1a', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Applicants</div>
                <div style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={13} /> {task.applicantCount || 0} / 10
                </div>
              </div>
            </div>

            {/* Creator */}
            <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(126,211,72,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#7ed348', flexShrink: 0 }}>
                {task.creatorDetails?.firstName?.[0] || '?'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{task.creatorDetails?.firstName} {task.creatorDetails?.lastName}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  ★ {(task.creatorDetails?.averageRating || 0).toFixed(1)} · Member since {task.creatorDetails?.createdAt ? new Date(task.creatorDetails.createdAt).getFullYear() : '—'}
                </div>
              </div>
            </div>

            <button
              onClick={() => !applied && applyMut.mutate()}
              disabled={applied || applyMut.isPending}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 10,
                border: 'none',
                background: applied ? 'rgba(126,211,72,0.15)' : 'linear-gradient(135deg,#7ed348,#4caf50)',
                color: applied ? '#7ed348' : '#000',
                fontFamily: "'Outfit',sans-serif",
                fontWeight: 700,
                fontSize: 15,
                cursor: applied || applyMut.isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {applied ? 'Applied ✓' : applyMut.isPending ? 'Applying...' : 'Apply for This Task'}
            </button>
          </div>
        ) : (
          <div style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Task not found</div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const BrowseTasksPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minReward, setMinReward] = useState('');
  const [maxReward, setMaxReward] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);
  const [allTasks, setAllTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const queryClient = useQueryClient();
  const toast = useToast();

  const params = {
    status: 'open',
    limit: 12,
    page,
    ...(category && { category }),
    ...(minReward && { minReward }),
    ...(maxReward && { maxReward }),
    ...(sortBy === 'highest' && { sortBy: 'reward', order: 'desc' }),
    ...(sortBy === 'lowest' && { sortBy: 'reward', order: 'asc' }),
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['browse-tasks', category, minReward, maxReward, sortBy, page],
    queryFn: async () => (await browseTasks(params)).data,
    keepPreviousData: true,
  });

  useEffect(() => {
    if (data?.tasks) {
      if (page === 1) setAllTasks(data.tasks);
      else setAllTasks((prev) => [...prev, ...data.tasks]);
    }
  }, [data, page]);

  const clearFilters = () => {
    setSearch(''); setCategory(''); setMinReward(''); setMaxReward('');
    setSortBy('latest'); setPage(1); setAllTasks([]);
  };

  const filteredTasks = search
    ? allTasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    : allTasks;

  const total = data?.total || 0;
  const hasMore = allTasks.length < total;

  const inputStyle = {
    background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
    padding: '9px 14px', color: '#fff', fontSize: 14, fontFamily: "'Outfit',sans-serif", outline: 'none',
  };

  const selectStyle = { ...inputStyle, cursor: 'pointer', appearance: 'none', paddingRight: 28 };

  return (
    <WorkerLayout pageTitle="Browse Tasks">
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Filter Bar */}
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." style={{ ...inputStyle, width: '100%', paddingLeft: 32, boxSizing: 'border-box' }}
            onFocus={(e) => e.target.style.borderColor = '#7ed348'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>

        {/* Category */}
        <div style={{ position: 'relative' }}>
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); setAllTasks([]); }} style={selectStyle}>
            <option value="">All Categories</option>
            {['social','writing','marketing','tech','data','design','research','other'].map((c) => (
              <option key={c} value={c} style={{ background: '#111', textTransform: 'capitalize' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <ChevronDown size={13} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
        </div>

        {/* Sort */}
        <div style={{ position: 'relative' }}>
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); setAllTasks([]); }} style={selectStyle}>
            <option value="latest">Latest</option>
            <option value="highest">Highest Reward</option>
            <option value="lowest">Lowest Reward</option>
          </select>
          <ChevronDown size={13} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
        </div>

        {/* Elite Tasks Locked Filter */}
        <button
          className="elite-filter-btn"
          onClick={() => {
            toast('Unlocking Elite Tasks requires 1,000 SPX tokens. Get to work!', 'error');
          }}
          style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))', border: '1px solid #c9a84c', borderRadius: 8, padding: '8px 14px', color: '#c9a84c', fontSize: 13, fontFamily: "'Outfit',sans-serif", fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          🔒 Elite Tasks (1k+ SPX)
        </button>

        {/* Min/Max */}
        <input type="number" value={minReward} onChange={(e) => { setMinReward(e.target.value); setPage(1); setAllTasks([]); }} placeholder="Min $" style={{ ...inputStyle, width: 80 }} />
        <input type="number" value={maxReward} onChange={(e) => { setMaxReward(e.target.value); setPage(1); setAllTasks([]); }} placeholder="Max $" style={{ ...inputStyle, width: 80 }} />

        <button onClick={clearFilters} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '9px 14px', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
          Clear
        </button>
      </div>

      {/* Count */}
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 16 }}>
        Showing {filteredTasks.length} of {total} tasks
      </p>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {[...Array(9)].map((_, i) => <Skeleton key={i} />)}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#111', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <Search size={40} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: 16 }} />
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 16 }}>No tasks match your filters.</p>
          <button onClick={clearFilters} style={{ marginTop: 12, background: 'rgba(126,211,72,0.1)', border: '1px solid rgba(126,211,72,0.3)', borderRadius: 8, padding: '8px 20px', color: '#7ed348', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16, marginBottom: 24 }}>
            {filteredTasks.map((task) => {
              const catColor = CATEGORY_COLORS[task.category] || '#6b7280';
              const near = isNear(task.deadline);
              return (
                <div key={task._id}
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 10, transition: 'transform 0.2s, border-color 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(126,211,72,0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: `${catColor}20`, color: catColor, border: `1px solid ${catColor}40`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>{task.category}</span>
                    <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: '#7ed348' }}>{fmt(task.reward)}</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4 }}>{task.title}</h3>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '6px 0 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>{task.description}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: near ? '#ef4444' : 'inherit' }}>
                      <Clock size={12} /> {fmtDate(task.deadline)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={12} /> {task.applicantCount || 0}/10
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button onClick={() => setSelectedTaskId(task._id)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#fff', fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      View Details
                    </button>
                    <button onClick={() => setSelectedTaskId(task._id)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#7ed348,#4caf50)', color: '#000', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                      Apply Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={isFetching}
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 32px', color: '#fff', fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 14, cursor: isFetching ? 'not-allowed' : 'pointer' }}
              >
                {isFetching ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}
    </WorkerLayout>
  );
};

export default BrowseTasksPage;
