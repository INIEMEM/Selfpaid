import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import WorkerLayout from '../../components/worker/WorkerLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getUserRatings } from '../../api/worker.js';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const RatingsPage = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['ratings', user?._id],
    queryFn: async () => (await getUserRatings(user?._id)).data,
    enabled: !!user?._id,
  });

  const ratings = data?.ratings || [];
  const average = data?.averageRating || 0;
  const total = data?.totalRatings || 0;

  return (
    <WorkerLayout pageTitle="Ratings">
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* Summary */}
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 64, color: '#c9a84c', lineHeight: 1 }}>{average.toFixed(1)}</div>
          <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginTop: 6 }}>
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={20} fill={average >= s ? '#c9a84c' : 'none'} color={average >= s ? '#c9a84c' : 'rgba(255,255,255,0.15)'} />
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>{total} rating{total !== 1 ? 's' : ''}</div>
        </div>

        {/* Star distribution */}
        <div style={{ flex: 1, maxWidth: 320 }}>
          {[5,4,3,2,1].map((s) => {
            const count = ratings.filter((r) => r.score === s).length;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', width: 6, flexShrink: 0 }}>{s}</span>
                <Star size={12} fill="#c9a84c" color="#c9a84c" />
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#c9a84c,#e8c96a)', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', width: 16, textAlign: 'right', flexShrink: 0 }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rating List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: 90, borderRadius: 12, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : ratings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
          <Star size={48} style={{ color: 'rgba(255,255,255,0.12)', marginBottom: 16 }} />
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 16, margin: 0 }}>No ratings yet. Complete tasks to earn your first rating!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ratings.map((r) => (
            <div key={r._id} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px', transition: 'border-color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(126,211,72,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: r.review ? 12 : 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(126,211,72,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#7ed348', flexShrink: 0 }}>
                  {r.ratedBy?.firstName?.[0] || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{r.ratedBy?.firstName} {r.ratedBy?.lastName}</span>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{r.task?.title}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} size={14} fill={r.score >= s ? '#c9a84c' : 'none'} color={r.score >= s ? '#c9a84c' : 'rgba(255,255,255,0.2)'} />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{fmtDate(r.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
              {r.review && (
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, paddingLeft: 52, lineHeight: 1.6 }}>"{r.review}"</p>
              )}
            </div>
          ))}
        </div>
      )}
    </WorkerLayout>
  );
};

export default RatingsPage;
