import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { forgotPassword } from '../../api/auth';
import Logo from '../../components/shared/Logo';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
});

const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await forgotPassword(data);
    } catch {
      // Always show success for security
    } finally {
      setSubmitted(true);
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
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: '0.05em', margin: '20px 0 8px' }}>Forgot Your Password?</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, margin: 0 }}>
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {submitted ? (
          <div style={{ background: 'rgba(126,211,72,0.08)', border: '1px solid rgba(126,211,72,0.3)', borderRadius: 14, padding: '32px 28px', textAlign: 'center' }}>
            <CheckCircle2 size={48} style={{ color: '#7ed348', marginBottom: 16 }} />
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, margin: '0 0 12px', color: '#7ed348' }}>Check Your Email</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
              If that address is registered, you&apos;ll receive a reset link shortly. Check your spam folder too.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>EMAIL ADDRESS</label>
              <input {...register('email')} type="email" placeholder="you@example.com" style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#7ed348'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              {errors.email && <p style={{ color: '#ef4444', fontSize: 13, margin: '6px 0 0' }}>{errors.email.message}</p>}
            </div>

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
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordPage;
