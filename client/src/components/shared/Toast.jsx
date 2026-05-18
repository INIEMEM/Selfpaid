import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: toast.type === 'success' ? 'rgba(126,211,72,0.12)' : 'rgba(239,68,68,0.12)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(126,211,72,0.4)' : 'rgba(239,68,68,0.4)'}`,
              borderRadius: 12,
              padding: '14px 18px',
              minWidth: 260,
              maxWidth: 380,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              pointerEvents: 'all',
              animation: 'fadeUp 0.3s ease forwards',
            }}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 size={18} style={{ color: '#7ed348', flexShrink: 0 }} />
            ) : (
              <XCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
            )}
            <span style={{ flex: 1, fontSize: 14, fontFamily: "'Outfit',sans-serif", color: '#fff' }}>
              {toast.message}
            </span>
            <button
              onClick={() => remove(toast.id)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0, flexShrink: 0 }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.addToast;
};

export default ToastProvider;
