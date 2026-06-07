import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Camera, Star } from 'lucide-react';
import WorkerLayout from '../../components/worker/WorkerLayout.jsx';
import { useToast } from '../../components/shared/Toast.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  getMyProfile, updateProfile, updateProfilePhoto,
  changePassword, getUserRatings,
} from '../../api/worker.js';

const profileSchema = z.object({
  firstName: z.string().min(2, 'Min 2 characters'),
  lastName: z.string().min(2, 'Min 2 characters'),
  bio: z.string().max(300, 'Max 300 characters').optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
});

const pwSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  password: z.string().min(8, 'Min 8 characters').regex(/\d/, 'Must include a number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

const getStrength = (pw) => {
  if (!pw) return null;
  const s = [pw.length >= 8, /\d/.test(pw), /[A-Z]/.test(pw)].filter(Boolean).length;
  if (s === 3) return { label: 'Strong', color: '#7ed348', w: '100%' };
  if (s === 2) return { label: 'Medium', color: '#f59e0b', w: '66%' };
  return { label: 'Weak', color: '#ef4444', w: '33%' };
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—';

const inputStyle = {
  width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, padding: '12px 14px', color: '#fff', fontFamily: "'Outfit',sans-serif",
  fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
};
const labelStyle = { fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', display: 'block', marginBottom: 8 };

const ProfilePage = () => {
  const toast = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => (await getMyProfile()).data,
  });

  const profile = profileData?.user;
  const initials = profile ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() : '??';

  const { data: ratingsData } = useQuery({
    queryKey: ['my-ratings'],
    queryFn: async () => (await getUserRatings(user?._id)).data,
    enabled: !!user?._id,
  });
  const ratings = ratingsData?.ratings || [];

  // Profile Form
  const { register: regProfile, handleSubmit: hsProfile, formState: { errors: profErr, isSubmitting: profSubmitting }, watch: watchProf } = useForm({
    resolver: zodResolver(profileSchema),
    values: profile ? { firstName: profile.firstName || '', lastName: profile.lastName || '', bio: profile.bio || '', location: profile.location || '', phone: profile.phone || '' } : undefined,
  });
  const bioVal = watchProf('bio', '');

  const updateMut = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast('Profile updated!', 'success');
      setProfileSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      setTimeout(() => setProfileSuccess(false), 3000);
    },
    onError: (err) => toast(err?.response?.data?.message || 'Update failed', 'error'),
  });

  // Photo upload
  const photoMut = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append('photo', file);
      return updateProfilePhoto(fd);
    },
    onSuccess: () => {
      toast('Photo updated!', 'success');
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    },
    onError: () => toast('Photo upload failed', 'error'),
  });

  // Password Form
  const { register: regPw, handleSubmit: hsPw, watch: watchPw, reset: resetPw, formState: { errors: pwErr, isSubmitting: pwSubmitting } } = useForm({
    resolver: zodResolver(pwSchema),
  });
  const newPw = watchPw('password', '');
  const strength = getStrength(newPw);

  const pwMut = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast('Password updated!', 'success');
      setPwSuccess(true);
      resetPw();
      setTimeout(() => setPwSuccess(false), 3000);
    },
    onError: (err) => toast(err?.response?.data?.message || 'Password update failed', 'error'),
  });

  return (
    <WorkerLayout pageTitle="My Profile">
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      {/* ─── Profile Header ── */}
      <div style={{ background: 'linear-gradient(135deg, rgba(45,122,45,0.2) 0%, rgba(0,0,0,0) 100%)', border: '1px solid rgba(126,211,72,0.12)', borderRadius: 20, padding: '40px 24px', textAlign: 'center', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(126,211,72,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Avatar */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
          {profile?.profilePhoto ? (
            <img src={profile.profilePhoto} alt="avatar" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(126,211,72,0.4)' }} />
          ) : (
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg,#7ed348,#4caf50)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, color: '#000', border: '3px solid rgba(126,211,72,0.3)' }}>
              {initials}
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            style={{ position: 'absolute', bottom: 0, right: 0, background: '#111', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}
          >
            <Camera size={14} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files[0]) photoMut.mutate(e.target.files[0]); }} />
        </div>

        {profileLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {[180, 100, 120].map((w, i) => <div key={i} style={{ height: 16, width: w, borderRadius: 6, background: 'rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
          </div>
        ) : (
          <>
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, letterSpacing: '0.05em', margin: '0 0 6px' }}>
              {profile?.firstName} {profile?.lastName}
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ background: 'rgba(126,211,72,0.1)', border: '1px solid rgba(126,211,72,0.3)', borderRadius: 20, padding: '3px 14px', fontSize: 12, fontWeight: 600, color: '#7ed348' }}>
                Task Worker
              </div>
              <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))', border: '1px solid rgba(201,168,76,0.5)', borderRadius: 20, padding: '3px 14px', fontSize: 12, fontWeight: 700, color: '#c9a84c', display: 'flex', alignItems: 'center', gap: 4 }} title="Gold Tier unlocked via SPX earned">
                🪙 Gold Tier
              </div>
            </div>

            {/* Trust Score */}
            <div style={{ maxWidth: 280, margin: '0 auto 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                <span>Trust Score</span>
                <span style={{ color: '#7ed348', fontWeight: 700 }}>{profile?.trustScore || 0}/100</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${profile?.trustScore || 0}%`, background: 'linear-gradient(90deg,#7ed348,#4caf50)', borderRadius: 3, transition: 'width 1s ease' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: 8 }}>
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={16} fill={(profile?.averageRating || 0) >= s ? '#c9a84c' : 'none'} color={(profile?.averageRating || 0) >= s ? '#c9a84c' : 'rgba(255,255,255,0.2)'} />
              ))}
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginLeft: 6 }}>({profile?.totalRatings || 0} ratings)</span>
            </div>

            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              Member since {fmtDate(profile?.createdAt)}
              {profile?.location && ` · 📍 ${profile.location}`}
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 20, marginBottom: 20 }}>
        {/* Edit Profile Form */}
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, margin: '0 0 20px' }}>Edit Profile</h3>

          {profileSuccess && (
            <div style={{ background: 'rgba(126,211,72,0.1)', border: '1px solid rgba(126,211,72,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#7ed348' }}>
              ✓ Profile saved successfully!
            </div>
          )}

          <form onSubmit={hsProfile((d) => updateMut.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>FIRST NAME</label>
                <input {...regProfile('firstName')} type="text" style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                {profErr.firstName && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{profErr.firstName.message}</p>}
              </div>
              <div>
                <label style={labelStyle}>LAST NAME</label>
                <input {...regProfile('lastName')} type="text" style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                {profErr.lastName && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{profErr.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label style={labelStyle}>BIO</label>
              <textarea {...regProfile('bio')} rows={3} placeholder="Tell creators about yourself..." style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {profErr.bio && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{profErr.bio.message}</p>}
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4, marginLeft: 'auto' }}>{(bioVal || '').length}/300</p>
              </div>
            </div>

            <div>
              <label style={labelStyle}>LOCATION</label>
              <input {...regProfile('location')} type="text" placeholder="City, Country" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div>
              <label style={labelStyle}>PHONE</label>
              <input {...regProfile('phone')} type="tel" placeholder="+1 234 567 8900" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <button type="submit" disabled={profSubmitting} style={{ padding: '13px', borderRadius: 10, border: 'none', background: profSubmitting ? 'rgba(126,211,72,0.4)' : 'linear-gradient(135deg,#7ed348,#4caf50)', color: '#000', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, cursor: profSubmitting ? 'not-allowed' : 'pointer', marginTop: 4 }}>
              {profSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password Form */}
        <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, margin: '0 0 20px' }}>Change Password</h3>

          {pwSuccess && (
            <div style={{ background: 'rgba(126,211,72,0.1)', border: '1px solid rgba(126,211,72,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 14, color: '#7ed348' }}>
              ✓ Password updated!
            </div>
          )}

          <form onSubmit={hsPw((d) => pwMut.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Current Password */}
            <div>
              <label style={labelStyle}>CURRENT PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input {...regPw('currentPassword')} type={showCurrent ? 'text' : 'password'} placeholder="••••••••" style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 0 }}>
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwErr.currentPassword && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{pwErr.currentPassword.message}</p>}
            </div>

            {/* New Password */}
            <div>
              <label style={labelStyle}>NEW PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input {...regPw('password')} type={showNew ? 'text' : 'password'} placeholder="Min. 8 characters" style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 0 }}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwErr.password && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{pwErr.password.message}</p>}
              {strength && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.w, background: strength.color, borderRadius: 2, transition: 'width 0.3s' }} />
                  </div>
                  <p style={{ fontSize: 11, color: strength.color, marginTop: 3 }}>{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={labelStyle}>CONFIRM PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input {...regPw('confirmPassword')} type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password" style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 0 }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwErr.confirmPassword && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{pwErr.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={pwSubmitting} style={{ padding: '13px', borderRadius: 10, border: 'none', background: pwSubmitting ? 'rgba(126,211,72,0.4)' : 'linear-gradient(135deg,#7ed348,#4caf50)', color: '#000', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, cursor: pwSubmitting ? 'not-allowed' : 'pointer', marginTop: 4 }}>
              {pwSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Ratings Section */}
      <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, margin: '0 0 20px' }}>My Ratings</h3>

        {ratings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 20px' }}>
            <Star size={40} style={{ color: 'rgba(255,255,255,0.12)', marginBottom: 12 }} />
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15, margin: 0 }}>No ratings yet. Complete tasks to receive ratings.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {ratings.map((r) => (
              <div key={r._id} style={{ background: '#1a1a1a', borderRadius: 12, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(126,211,72,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#7ed348', flexShrink: 0 }}>
                    {r.ratedBy?.firstName?.[0] || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.ratedBy?.firstName} {r.ratedBy?.lastName}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{r.task?.title}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={14} fill={r.score >= s ? '#c9a84c' : 'none'} color={r.score >= s ? '#c9a84c' : 'rgba(255,255,255,0.2)'} />
                    ))}
                  </div>
                </div>
                {r.review && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>"{r.review}"</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkerLayout>
  );
};

export default ProfilePage;
