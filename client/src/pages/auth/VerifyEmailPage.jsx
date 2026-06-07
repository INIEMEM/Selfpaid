import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { verifyOTP, resendOTP } from '../../api/auth';
import Logo from '../../components/shared/Logo';

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  
  const inputRefs = useRef([]);

  const email = location.state?.email;
  const role = location.state?.role;

  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (otpCode) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await verifyOTP({ email, otp: otpCode });
      setSuccess(true);
      setTimeout(() => {
        const dashboard = role === 'creator' ? '/creator/dashboard' 
                        : role === 'admin' ? '/admin/dashboard' 
                        : '/worker/dashboard';
        navigate(dashboard, { replace: true });
      }, 1500);
    } catch (err) {
      setErrorMsg('Invalid code. Please try again.');
      setIsShaking(true);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResendLoading(true);
    setResendMsg('');
    try {
      await resendOTP({ email });
      setResendMsg('Code sent!');
      setCanResend(false);
      setCountdown(60);
      setTimeout(() => setResendMsg(''), 2000);
    } catch (err) {
      setResendMsg('Failed to send code.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    if (newDigits.every(d => d !== '') && value !== '') {
      handleVerify(newDigits.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9]/g, '');
    if (!pasted) return;
    
    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    
    if (pasted.length < 6) {
        inputRefs.current[pasted.length]?.focus();
    } else {
        inputRefs.current[5]?.focus();
        if (newDigits.every(d => d !== '')) {
            handleVerify(newDigits.join(''));
        }
    }
  };

  if (!email) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <style>
        {`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            12.5% { transform: translateX(-8px); }
            37.5% { transform: translateX(8px); }
            62.5% { transform: translateX(-6px); }
            87.5% { transform: translateX(6px); }
          }
          @keyframes scaleIn {
            from { transform: scale(0); }
            to { transform: scale(1); }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @media (max-width: 480px) {
            .otp-input {
              width: 44px !important;
              height: 54px !important;
              font-size: 24px !important;
            }
            .otp-container {
              gap: 8px !important;
            }
          }
        `}
      </style>

      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeUp 0.5s ease' }}>
        <div style={{ marginBottom: '32px' }}>
          <Logo size="md" />
        </div>

        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(126,211,72,0.1)', border: '1px solid rgba(126,211,72,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#7ed348' }}>
          <Mail size={28} />
        </div>

        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '26px', color: '#fff', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '0.05em' }}>
          Check your email
        </h2>
        
        <p style={{ margin: 0, textAlign: 'center', fontSize: '15px', color: 'rgba(255,255,255,0.8)' }}>
          We sent a 6-digit verification code to<br />
          <span style={{ color: '#7ed348', fontWeight: 600 }}>{email}</span>
        </p>

        <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
          Enter the code below to verify your account
        </p>

        <div 
          className="otp-container"
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '12px', 
            margin: '36px 0 24px',
            animation: isShaking ? 'shake 0.5s' : 'none'
          }}
          onPaste={handlePaste}
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="otp-input"
              style={{
                width: '52px',
                height: '60px',
                background: '#1a1a1a',
                border: digit ? '1px solid rgba(126,211,72,0.5)' : '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                fontSize: '28px',
                fontWeight: 700,
                textAlign: 'center',
                color: '#fff',
                fontFamily: "'Bebas Neue', sans-serif",
                outline: 'none',
                transition: 'all 0.2s ease',
                boxShadow: digit ? 'none' : 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7ed348';
                e.target.style.boxShadow = '0 0 0 3px rgba(126,211,72,0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = digit ? 'rgba(126,211,72,0.5)' : 'rgba(255,255,255,0.12)';
                e.target.style.boxShadow = 'none';
              }}
            />
          ))}
        </div>

        {errorMsg && (
          <p style={{ color: '#ef4444', fontSize: '14px', margin: '0 0 20px', fontWeight: 500 }}>
            {errorMsg}
          </p>
        )}

        <button
          onClick={() => handleVerify(digits.join(''))}
          disabled={!digits.every(d => d !== '') || loading || success}
          style={{
            width: '100%',
            height: '52px',
            background: digits.every(d => d !== '') 
              ? 'linear-gradient(135deg, #7ed348, #4caf50)' 
              : '#333',
            color: digits.every(d => d !== '') ? '#000' : 'rgba(255,255,255,0.4)',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            cursor: (!digits.every(d => d !== '') || loading || success) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background 0.3s ease',
            marginBottom: '24px'
          }}
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : success ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', animation: 'scaleIn 0.3s ease' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', color: '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 'bold' }}>✓</div>
              <span>Email verified!</span>
            </div>
          ) : (
            'Verify Email'
          )}
        </button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: '0 0 8px' }}>
            Didn't receive the code?
          </p>
          
          {resendLoading ? (
            <span style={{ color: '#7ed348', fontSize: '14px', fontWeight: 600 }}>Sending...</span>
          ) : resendMsg ? (
            <span style={{ color: '#7ed348', fontSize: '14px', fontWeight: 600 }}>{resendMsg}</span>
          ) : !canResend ? (
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
              Resend code in 0:{countdown.toString().padStart(2, '0')}
            </span>
          ) : (
            <button
              onClick={handleResend}
              style={{
                background: 'none',
                border: 'none',
                color: '#7ed348',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                fontFamily: "'Outfit', sans-serif"
              }}
            >
              Resend code
            </button>
          )}
        </div>

        <Link 
          to="/register" 
          style={{ 
            color: 'rgba(255,255,255,0.4)', 
            fontSize: '14px', 
            textDecoration: 'none',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.color = '#fff'}
          onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.4)'}
        >
          Wrong email address?
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
