import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { resetPassword } from '../../api/auth';
import Logo from '../../components/shared/Logo';

const schema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

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

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const password = watch('password', '');
  const strength = getPasswordStrength(password);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => navigate('/login'), 3000);
      return () => clearTimeout(t);
    }
  }, [success, navigate]);

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await resetPassword(token, { password: data.password });
      setSuccess(true);
    } catch (err) {
      setServerError(err?.response?.data?.message || 'This link is invalid or has expired. Please request a new one.');
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

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 5%' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Logo size="md" />
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: '0.05em', margin: '20px 0 8px' }}>Set a New Password</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, margin: 0 }}>
            Choose a strong password for your account.
          </p>
        </div>

        {success ? (
          <div style={{ background: 'rgba(126,211,72,0.08)', border: '1px solid rgba(126,211,72,0.3)', borderRadius: 14, padding: '32px 28px', textAlign: 'center' }}>
            <CheckCircle2 size={48} style={{ color: '#7ed348', marginBottom: 16 }} />
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, margin: '0 0 12px', color: '#7ed348' }}>Password Updated!</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
              Your password has been changed. Redirecting you to login in 3 seconds...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>NEW PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" style={{ ...inputStyle, paddingRight: 48 }}
                  onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p style={{ color: '#ef4444', fontSize: 13, margin: '6px 0 0' }}>{errors.password.message}</p>}
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: 2, transition: 'width 0.3s, background 0.3s' }} />
                  </div>
                  <p style={{ fontSize: 12, color: strength.color, marginTop: 4 }}>{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm */}
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

            {serverError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', color: '#ef4444', fontSize: 14 }}>
                {serverError}
              </div>
            )}

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
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link to="/login" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, textDecoration: 'none' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#7ed348'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
