import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import CreatorLayout from '../../components/creator/CreatorLayout.jsx';
import { useToast } from '../../components/shared/Toast.jsx';
import { createTask } from '../../api/creator.js';

const CATEGORIES = ['social', 'writing', 'marketing', 'tech', 'data', 'design', 'research', 'other'];
const CAT_ICONS = { social: '📱', writing: '✍️', marketing: '📣', tech: '💻', data: '📊', design: '🎨', research: '🔬', other: '📦' };

const inputStyle = {
  width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, padding: '12px 14px', color: '#fff', fontFamily: "'Outfit',sans-serif",
  fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
};

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
  letterSpacing: '0.08em', display: 'block', marginBottom: 8,
};

const CreateTaskPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    title: '', description: '', reward: '', category: '', deadline: '',
  });
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (form.title.trim().length < 5) e.title = 'Title must be at least 5 characters';
    if (form.description.trim().length < 20) e.description = 'Description must be at least 20 characters';
    if (!form.reward || Number(form.reward) < 1) e.reward = 'Reward must be at least $1';
    if (!form.category) e.category = 'Please select a category';
    if (!form.deadline || new Date(form.deadline) <= new Date()) e.deadline = 'Deadline must be a future date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const createMut = useMutation({
    mutationFn: () => createTask({
      title: form.title.trim(),
      description: form.description.trim(),
      reward: Number(form.reward),
      category: form.category,
      deadline: form.deadline,
    }),
    onSuccess: () => {
      toast('Task submitted for admin approval!', 'success');
      navigate('/creator/tasks');
    },
    onError: (err) => toast(err?.response?.data?.message || 'Failed to create task', 'error'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) createMut.mutate();
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <CreatorLayout pageTitle="Post a Task">
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, letterSpacing: '0.04em', margin: 0 }}>
            Create a New Task
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 4 }}>
            Your task will go live after admin approval. Funds are held in escrow until the job is done.
          </p>
        </div>

        {/* Info Banner */}
        <div style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 28, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            The task reward is deducted from your wallet and held securely in escrow. It is released to the worker only after you approve their submitted work.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 22 }}>

            {/* Title */}
            <div>
              <label style={labelStyle}>TASK TITLE *</label>
              <input
                type="text" placeholder="e.g. Write a 500-word blog post about crypto"
                value={form.title} onChange={(e) => set('title', e.target.value)}
                style={{ ...inputStyle, borderColor: errors.title ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
                onFocus={(e) => e.target.style.borderColor = errors.title ? '#ef4444' : '#c9a84c'}
                onBlur={(e) => e.target.style.borderColor = errors.title ? '#ef4444' : 'rgba(255,255,255,0.1)'}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {errors.title && <p style={{ color: '#ef4444', fontSize: 12, margin: 0 }}>{errors.title}</p>}
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>{form.title.length}/100</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>TASK DESCRIPTION *</label>
              <textarea
                placeholder="Describe exactly what you need done. Be as specific as possible — the more detail you give, the better the submissions."
                value={form.description} onChange={(e) => set('description', e.target.value.slice(0, 2000))}
                rows={6}
                style={{ ...inputStyle, resize: 'vertical', borderColor: errors.description ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
                onFocus={(e) => e.target.style.borderColor = errors.description ? '#ef4444' : '#c9a84c'}
                onBlur={(e) => e.target.style.borderColor = errors.description ? '#ef4444' : 'rgba(255,255,255,0.1)'}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {errors.description && <p style={{ color: '#ef4444', fontSize: 12, margin: 0 }}>{errors.description}</p>}
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>{form.description.length}/2000</span>
              </div>
            </div>

            {/* Category */}
            <div>
              <label style={labelStyle}>CATEGORY *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: 10 }}>
                {CATEGORIES.map((cat) => {
                  const isActive = form.category === cat;
                  return (
                    <button
                      key={cat} type="button"
                      onClick={() => set('category', cat)}
                      style={{
                        padding: '10px 14px', borderRadius: 10, border: `1px solid ${isActive ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.1)'}`,
                        background: isActive ? 'rgba(201,168,76,0.1)' : '#1a1a1a',
                        color: isActive ? '#c9a84c' : 'rgba(255,255,255,0.55)',
                        fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 13,
                        cursor: 'pointer', transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 8, textTransform: 'capitalize',
                      }}
                    >
                      <span>{CAT_ICONS[cat]}</span> {cat}
                    </button>
                  );
                })}
              </div>
              {errors.category && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>{errors.category}</p>}
            </div>

            {/* Reward and Deadline */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>REWARD (USD) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#c9a84c', fontWeight: 700, fontSize: 16 }}>$</span>
                  <input
                    type="number" min="1" step="0.01" placeholder="0.00"
                    value={form.reward} onChange={(e) => set('reward', e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 30, borderColor: errors.reward ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
                    onFocus={(e) => e.target.style.borderColor = errors.reward ? '#ef4444' : '#c9a84c'}
                    onBlur={(e) => e.target.style.borderColor = errors.reward ? '#ef4444' : 'rgba(255,255,255,0.1)'}
                  />
                </div>
                {errors.reward && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.reward}</p>}
                {form.reward > 0 && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>
                  10% platform fee applies. Worker receives ${(Number(form.reward) * 0.9).toFixed(2)}
                </p>}
              </div>
              <div>
                <label style={labelStyle}>DEADLINE *</label>
                <input
                  type="date" min={todayStr}
                  value={form.deadline} onChange={(e) => set('deadline', e.target.value)}
                  style={{ ...inputStyle, colorScheme: 'dark', borderColor: errors.deadline ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
                  onFocus={(e) => e.target.style.borderColor = errors.deadline ? '#ef4444' : '#c9a84c'}
                  onBlur={(e) => e.target.style.borderColor = errors.deadline ? '#ef4444' : 'rgba(255,255,255,0.1)'}
                />
                {errors.deadline && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.deadline}</p>}
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
              <button
                type="button" onClick={() => navigate('/creator/tasks')}
                style={{ flex: 1, padding: '14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit" disabled={createMut.isPending}
                style={{ flex: 2, padding: '14px', borderRadius: 10, border: 'none', background: createMut.isPending ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg,#c9a84c,#eab308)', color: '#000', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 15, cursor: createMut.isPending ? 'not-allowed' : 'pointer' }}
              >
                {createMut.isPending ? 'Submitting...' : '🚀 Submit Task for Approval'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </CreatorLayout>
  );
};

export default CreateTaskPage;
