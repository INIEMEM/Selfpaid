import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resendOTP } from '../../api/auth';

const VerifyEmailBanner = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!user || user.isEmailVerified === true || dismissed) {
    return null;
  }

  const handleResend = async () => {
    if (loading || sent) return;
    setLoading(true);
    try {
      await resendOTP({ email: user.email });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100%',
      background: 'rgba(201, 168, 76, 0.1)',
      borderBottom: '1px solid rgba(201, 168, 76, 0.3)',
      padding: '12px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AlertTriangle size={18} color="#c9a84c" />
        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontFamily: "'Outfit', sans-serif" }}>
          Please verify your email address to unlock all features
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={handleResend}
          disabled={loading || sent}
          style={{
            background: 'transparent',
            border: '1px solid #c9a84c',
            borderRadius: '6px',
            color: '#c9a84c',
            fontSize: '12px',
            fontWeight: 600,
            padding: '6px 12px',
            cursor: (loading || sent) ? 'not-allowed' : 'pointer',
            fontFamily: "'Outfit', sans-serif",
            opacity: (loading || sent) ? 0.7 : 1
          }}
        >
          {loading ? 'Sending...' : sent ? 'Sent!' : 'Resend code'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            padding: 0,
            display: 'flex'
          }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailBanner;
