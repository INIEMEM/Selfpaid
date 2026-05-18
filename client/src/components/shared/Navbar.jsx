import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';

const getDashboardPath = (role) => {
  if (role === 'creator') return '/creator/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/worker/dashboard';
};

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    height: 70,
    padding: '0 5%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
    background: scrolled
      ? 'rgba(0,0,0,0.97)'
      : 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%)',
    backdropFilter: scrolled ? 'blur(12px)' : 'none',
    borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
  };

  const navLinks = [
    { label: 'How It Works', id: 'how' },
    { label: 'Features', id: 'features' },
    { label: 'Categories', id: 'categories' },
  ];

  return (
    <>
      <nav style={navStyle}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo size="sm" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {!isAuthenticated && navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.75)',
                fontSize: 15,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'color 0.2s',
                padding: 0,
              }}
              onMouseEnter={(e) => e.target.style.color = '#7ed348'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.75)'}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => navigate(getDashboardPath(user?.role))}
              style={{
                background: 'linear-gradient(135deg, #7ed348, #4caf50)',
                color: '#000',
                border: 'none',
                borderRadius: 50,
                padding: '10px 24px',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                letterSpacing: '0.03em',
              }}
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  textDecoration: 'none',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 500,
                  fontSize: 15,
                  padding: '8px 16px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#c9a84c'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{
                  background: 'linear-gradient(135deg, #7ed348, #4caf50)',
                  color: '#000',
                  textDecoration: 'none',
                  borderRadius: 50,
                  padding: '10px 24px',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '0.03em',
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
            background: 'rgba(0,0,0,0.97)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 32,
          }}
        >
          {!isAuthenticated && navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: 28,
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              {link.label}
            </button>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            {isAuthenticated ? (
              <button
                onClick={() => { navigate(getDashboardPath(user?.role)); setMobileOpen(false); }}
                style={{
                  background: 'linear-gradient(135deg, #7ed348, #4caf50)',
                  color: '#000',
                  border: 'none',
                  borderRadius: 50,
                  padding: '14px 40px',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  style={{ color: '#fff', textDecoration: 'none', fontSize: 18, fontWeight: 500 }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    background: 'linear-gradient(135deg, #7ed348, #4caf50)',
                    color: '#000',
                    textDecoration: 'none',
                    borderRadius: 50,
                    padding: '14px 40px',
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  Register Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
