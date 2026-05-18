import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { registerUser } from '../../api/auth';
import Logo from '../../components/shared/Logo';

const schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['worker', 'creator']),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const getDashboardPath = (role) => {
  if (role === 'creator') return '/creator/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/worker/dashboard';
};

const getPasswordStrength = (pw) => {
  if (!pw) return { label: '', color: 'transparent', width: '0%' };
  const hasLen = pw.length >= 8;
  const hasNum = /\d/.test(pw);
  const hasUp = /[A-Z]/.test(pw);
  const score = [hasLen, hasNum, hasUp].filter(Boolean).length;
  if (score === 3) return { label: 'Strong', color: '#7ed348', width: '100%' };
  if (score === 2) return { label: 'Medium', color: '#f59e0b', width: '66%' };
  return { label: 'Weak', color: '#ef4444', width: '33%' };
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [selectedRole, setSelectedRole] = useState('worker');

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'worker' },
  });

  const password = watch('password', '');
  const strength = getPasswordStrength(password);

  useEffect(() => {
    if (auth.isAuthenticated && !auth.loading) {
      navigate(getDashboardPath(auth.user?.role), { replace: true });
    }
  }, [auth.isAuthenticated, auth.loading, auth.user, navigate]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setValue('role', role, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const res = await registerUser(data);
      const { user, accessToken } = res.data;
      auth.login(user, accessToken);
      navigate(getDashboardPath(user.role), { replace: true });
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const inputStyle = {
    width: '100%',
    background: '#111',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10,
    padding: '14px 16px',
    color: '#fff',
    fontSize: 15,
    fontFamily: "'Outfit',sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };

  const roleCards = [
    { role: 'worker', icon: '💪', title: 'I want to earn', sub: 'Complete tasks and get paid' },
    { role: 'creator', icon: '🚀', title: 'I want to post tasks', sub: 'Hire workers for tasks' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex' }}>
      {/* Decorative Left Panel */}
      <div className="hidden md:flex" style={{ flex: '1 1 0', background: 'rgba(45,122,45,0.06)', borderRight: '1px solid rgba(126,211,72,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(126,211,72,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 380 }}>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(30px,4vw,52px)', lineHeight: 1.1, margin: '0 0 28px', color: '#fff' }}>
            JOIN THOUSANDS OF<br />
            <span style={{ background: 'linear-gradient(135deg,#7ed348,#4caf50)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>WORKERS</span>
            {' '}& <span style={{ color: '#c9a84c' }}>CREATORS</span><br />WORLDWIDE
          </h2>
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '24px', textAlign: 'left', marginTop: 24 }}>
            {[
              { icon: '🔐', text: 'Funds held securely in escrow' },
              { icon: '⚡', text: 'Instant wallet payouts' },
              { icon: '🌍', text: 'Work from anywhere in the world' },
              { icon: '⭐', text: 'Build your reputation with ratings' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div style={{ flex: '1 1 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 5%', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <Logo size="md" />
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: '0.05em', margin: '20px 0 8px' }}>Create Your Account</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, margin: 0 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#7ed348', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Name Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>FIRST NAME</label>
                <input {...register('firstName')} type="text" placeholder="John" style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                {errors.firstName && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0' }}>{errors.firstName.message}</p>}
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>LAST NAME</label>
                <input {...register('lastName')} type="text" placeholder="Doe" style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                {errors.lastName && <p style={{ color: '#ef4444', fontSize: 12, margin: '4px 0 0' }}>{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>EMAIL</label>
              <input {...register('email')} type="email" placeholder="you@example.com" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              {errors.email && <p style={{ color: '#ef4444', fontSize: 13, margin: '6px 0 0' }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#ef4444', fontSize: 13, margin: '6px 0 0' }}>{errors.password.message}</p>}
              {/* Strength Indicator */}
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: 2, transition: 'width 0.3s, background 0.3s' }} />
                  </div>
                  <p style={{ fontSize: 12, color: strength.color, marginTop: 4 }}>{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>CONFIRM PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input {...register('confirmPassword')} type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password" style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: 13, margin: '6px 0 0' }}>{errors.confirmPassword.message}</p>}
            </div>

            {/* Role Selector */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', display: 'block', marginBottom: 12 }}>I AM A...</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {roleCards.map(({ role, icon, title, sub }) => {
                  const isSelected = selectedRole === role;
                  const isWorker = role === 'worker';
                  const borderColor = isSelected ? (isWorker ? '#7ed348' : '#c9a84c') : 'rgba(255,255,255,0.1)';
                  const bg = isSelected ? (isWorker ? 'rgba(126,211,72,0.08)' : 'rgba(201,168,76,0.08)') : '#111';
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleSelect(role)}
                      style={{ background: bg, border: `1.5px solid ${borderColor}`, borderRadius: 12, padding: '18px 14px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                      <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 4 }}>{title}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{sub}</div>
                    </button>
                  );
                })}
              </div>
              <input type="hidden" {...register('role')} />
              {errors.role && <p style={{ color: '#ef4444', fontSize: 13, margin: '6px 0 0' }}>{errors.role.message}</p>}
            </div>

            {/* Server Error */}
            {serverError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', color: '#ef4444', fontSize: 14 }}>
                {serverError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                background: isSubmitting ? 'rgba(126,211,72,0.4)' : 'linear-gradient(135deg, #7ed348, #4caf50)',
                color: '#000',
                border: 'none',
                borderRadius: 10,
                padding: '16px',
                fontSize: 16,
                fontFamily: "'Outfit',sans-serif",
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {isSubmitting && <Loader2 size={18} className="animate-spin-slow" />}
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
