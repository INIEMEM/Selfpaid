import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../api/auth';
import Logo from '../../components/shared/Logo';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const getDashboardPath = (role) => {
  if (role === 'creator') return '/creator/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/worker/dashboard';
};

const LoginPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (auth.isAuthenticated && !auth.loading) {
      navigate(getDashboardPath(auth.user?.role), { replace: true });
    }
  }, [auth.isAuthenticated, auth.loading, auth.user, navigate]);

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const res = await loginUser(data);
      const { user, accessToken } = res.data;
      auth.login(user, accessToken);
      navigate(getDashboardPath(user.role), { replace: true });
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const panelStyle = {
    flex: '1 1 0',
    background: 'rgba(45,122,45,0.08)',
    borderRight: '1px solid rgba(126,211,72,0.12)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 40px',
    position: 'relative',
    overflow: 'hidden',
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

  const pills = ['Escrow Protected', 'Instant Payouts', 'Global Workers', 'Dispute Resolution', 'Real-time Alerts'];

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex' }}>
      {/* Left Decorative Panel */}
      <div className="hidden md:flex" style={panelStyle}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(126,211,72,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(36px,5vw,60px)', lineHeight: 1.05, margin: '0 0 32px', color: '#fff' }}>
            YOUR SKILLS.<br />YOUR TIME.<br />
            <span style={{ background: 'linear-gradient(135deg,#7ed348,#c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>YOUR MONEY.</span>
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {pills.map((pill, i) => (
              <span key={i} style={{ background: 'rgba(126,211,72,0.08)', border: '1px solid rgba(126,211,72,0.25)', borderRadius: 50, padding: '6px 14px', fontSize: 13, color: '#7ed348', fontWeight: 500 }}>
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div style={{ flex: '1 1 0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 5%' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <Logo size="md" />
            <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: '0.05em', margin: '20px 0 8px' }}>Welcome Back</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, margin: 0 }}>
              Don&apos;t have an account?{' '}
              <Link to="/register" style={{ color: '#7ed348', textDecoration: 'none', fontWeight: 600 }}>Register free</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>EMAIL</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
              {errors.email && <p style={{ color: '#ef4444', fontSize: 13, margin: '6px 0 0' }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em' }}>PASSWORD</label>
                <Link to="/forgot-password" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#7ed348'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#ef4444', fontSize: 13, margin: '6px 0 0' }}>{errors.password.message}</p>}
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
                transition: 'opacity 0.2s',
              }}
            >
              {isSubmitting && <Loader2 size={18} className="animate-spin-slow" />}
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
