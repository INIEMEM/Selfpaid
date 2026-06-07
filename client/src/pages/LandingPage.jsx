import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPublicStats } from '../api/auth';
import Navbar from '../components/shared/Navbar';
import Logo from '../components/shared/Logo';
import AnimatedCounter from '../components/shared/AnimatedCounter';
import useScrollReveal from '../hooks/useScrollReveal';

// ─── Section Wrapper with scroll reveal ───────────────────────────────────────
const Section = ({ children, id, style }) => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section
      id={id}
      ref={ref}
      className={isVisible ? 'scroll-visible' : 'scroll-hidden'}
      style={style}
    >
      {children}
    </section>
  );
};

// ─── Marquee Items ─────────────────────────────────────────────────────────────
const marqueeItems = [
  'Social Media Tasks', 'Writing & Copywriting', 'Marketing Campaigns',
  'Tech & Development', 'Data Entry & Research', 'Design & Creative',
  'Escrow Protected', 'Instant Wallet Payouts', 'Global Task Workers',
];

// ─── How It Works Steps ───────────────────────────────────────────────────────
const steps = [
  { num: '01', icon: '📝', title: 'Create Your Account', desc: 'Sign up as a worker or creator in under 60 seconds. No credit card required.', bg: 'var(--green-dark)' },
  { num: '02', icon: '📋', title: 'Post or Browse Tasks', desc: 'Creators post tasks with clear requirements. Workers browse and apply to what suits them.', bg: 'rgba(201,168,76,0.15)' },
  { num: '03', icon: '🔒', title: 'Funds Go Into Escrow', desc: 'Creator funds are locked securely in escrow before work begins. No surprises.', bg: 'var(--green-dark)' },
  { num: '04', icon: '✅', title: 'Work Done. Get Paid.', desc: 'Work is reviewed and approved. Payment is instantly released to the worker\'s wallet.', bg: 'rgba(201,168,76,0.15)' },
];

// ─── Features ─────────────────────────────────────────────────────────────────
const features = [
  { icon: '🔐', title: 'Escrow Protection', desc: 'Funds held securely until work is verified and approved.' },
  { icon: '⚡', title: 'Instant Wallet', desc: 'Get paid immediately to your SelfPaid wallet on approval.' },
  { icon: '🏦', title: 'Bank Withdrawals', desc: 'Withdraw your earnings directly to any bank account.' },
  { icon: '⭐', title: 'Ratings & Trust Score', desc: 'Build your reputation with verified task ratings.' },
  { icon: '🛡️', title: 'Dispute Resolution', desc: 'Admin-mediated dispute process that\'s fair to both sides.' },
  { icon: '🔔', title: 'Real-time Alerts', desc: 'Live notifications via Socket.io for every key event.' },
  { icon: '📊', title: 'Earnings Dashboard', desc: 'Track your income, tasks, and wallet balance in real time.' },
  { icon: '🌍', title: 'Global Access', desc: 'Open to workers and creators from around the world.' },
];

// ─── Categories ───────────────────────────────────────────────────────────────
const categories = [
  { icon: '📱', label: 'Social Media' },
  { icon: '✍️', label: 'Writing' },
  { icon: '📣', label: 'Marketing' },
  { icon: '💻', label: 'Tech & Dev' },
  { icon: '📊', label: 'Data Entry' },
  { icon: '🎨', label: 'Design' },
  { icon: '🔍', label: 'Research' },
  { icon: '📦', label: 'Other' },
];

// ─── Worker & Creator benefits ────────────────────────────────────────────────
const workerBenefits = [
  'Browse hundreds of tasks across 8+ categories',
  'Apply and get selected by creators who need your skills',
  'Submit your work directly through the platform',
  'Get paid instantly to your wallet on approval',
  'Withdraw to your bank account anytime',
  'Build your reputation with ratings and reviews',
];
const creatorBenefits = [
  'Post any task — social, writing, tech, data and more',
  'Receive applications from skilled workers worldwide',
  'Review submissions and only pay for approved work',
  'Escrow system protects your funds at every step',
  'Rate workers and build a trusted team over time',
  'Scale from one task to hundreds with ease',
];

// ─── Payment Steps ────────────────────────────────────────────────────────────
const paymentSteps = [
  { icon: '💳', label: 'Creator Deposits' },
  { icon: '🔒', label: 'Escrow Lock' },
  { icon: '⚒️', label: 'Worker Completes' },
  { icon: '✅', label: 'Creator Approves' },
  { icon: '💸', label: 'Worker Gets Paid' },
];

// ─── Main Component ────────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();

  const { data: statsData } = useQuery({
    queryKey: ['publicStats'],
    queryFn: async () => {
      const res = await getPublicStats();
      return res.data.stats;
    },
    staleTime: 1000 * 60 * 5,
  });

  const stats = statsData || { totalUsers: 0, completedTasks: 0, openTasks: 0 };

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Navbar />

      {/* ════ HERO ════════════════════════════════════════════════════════════ */}
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '100px 5% 60px',
        }}
      >
        {/* Glow effects */}
        <div
          className="animate-glow"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(126,211,72,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        {/* SVG noise */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.03, pointerEvents: 'none' }}>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>

        {/* Content */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 860 }}>
          {/* Badge */}
          <div
            className="animate-fade-up"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid rgba(126,211,72,0.4)',
              background: 'rgba(126,211,72,0.08)',
              borderRadius: 50,
              padding: '6px 16px',
              marginBottom: 28,
              animationDelay: '0s',
            }}
          >
            <span className="animate-pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#7ed348', display: 'inline-block' }} />
            <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '0.1em', color: '#7ed348', textTransform: 'uppercase' }}>
              Now Live
            </span>
          </div>

          {/* Logo Icon */}
          <div className="animate-fade-up animate-float" style={{ marginBottom: 24, animationDelay: '0.1s', filter: 'drop-shadow(0 0 30px rgba(126,211,72,0.5))' }}>
            <Logo size="lg" />
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(64px, 10vw, 130px)',
              lineHeight: 0.95,
              margin: '0 0 16px',
              animationDelay: '0.2s',
            }}
          >
            <span style={{ display: 'block', color: '#fff' }}>GET PAID</span>
            <span style={{ display: 'block', color: '#fff' }}>FOR WHAT</span>
            <span
              style={{
                display: 'block',
                background: 'linear-gradient(135deg, #7ed348, #c9a84c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              YOU DO
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="animate-fade-up"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: 'clamp(13px, 2vw, 17px)',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#c9a84c',
              margin: '0 0 20px',
              animationDelay: '0.3s',
            }}
          >
            The Global Task Platform
          </p>

          {/* Description */}
          <p
            className="animate-fade-up"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(15px, 1.6vw, 18px)',
              color: 'rgba(255,255,255,0.6)',
              maxWidth: 560,
              margin: '0 auto 36px',
              lineHeight: 1.7,
              animationDelay: '0.4s',
            }}
          >
            SelfPaid connects skilled workers with businesses and individuals who need tasks done — fast, fair, and fully secure. Post a task, earn money, and get paid doing what you're already good at.
          </p>

          {/* CTA Buttons */}
          <div
            className="animate-fade-up"
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48, animationDelay: '0.5s' }}
          >
            <button
              onClick={() => navigate('/register')}
              style={{
                background: 'linear-gradient(135deg, #7ed348, #4caf50)',
                color: '#000',
                border: 'none',
                borderRadius: 50,
                padding: '16px 40px',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
                letterSpacing: '0.03em',
                boxShadow: '0 0 30px rgba(126,211,72,0.3)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(126,211,72,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(126,211,72,0.3)'; }}
            >
              Start Earning
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 50,
                padding: '16px 40px',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7ed348'; e.currentTarget.style.color = '#7ed348'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff'; }}
            >
              Post a Task
            </button>
          </div>

          {/* Divider */}
          <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 0 36px' }} />

          {/* Stats Row */}
          <div
            className="animate-fade-up"
            style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(24px,5vw,64px)', flexWrap: 'wrap', animationDelay: '0.6s' }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: '#7ed348', lineHeight: 1 }}>
                <AnimatedCounter target={stats.totalUsers || 0} suffix="+" />
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Total Users</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: '#7ed348', lineHeight: 1 }}>
                <AnimatedCounter target={stats.completedTasks || 0} suffix="+" />
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Tasks Completed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: '#7ed348', lineHeight: 1 }}>
                <AnimatedCounter target={stats.openTasks || 0} />
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Tasks Available</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, color: '#c9a84c', lineHeight: 1 }}>10%</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Platform Fee</div>
            </div>
          </div>
        </div>
      </div>

      {/* ════ MARQUEE ════════════════════════════════════════════════════════════ */}
      <div
        style={{
          borderTop: '1px solid rgba(126,211,72,0.3)',
          borderBottom: '1px solid rgba(126,211,72,0.3)',
          background: 'rgba(126,211,72,0.04)',
          padding: '14px 0',
          overflow: 'hidden',
        }}
      >
        <div className="animate-marquee">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              style={{
                whiteSpace: 'nowrap',
                padding: '0 32px',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'Outfit', sans-serif",
                color: i % 2 === 0 ? '#7ed348' : 'rgba(255,255,255,0.6)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {item} {i < marqueeItems.length * 2 - 1 && <span style={{ color: 'rgba(126,211,72,0.4)', marginLeft: 16 }}>•</span>}
            </span>
          ))}
        </div>
      </div>

      {/* ════ HOW IT WORKS ════════════════════════════════════════════════════ */}
      <Section id="how" style={{ padding: 'clamp(60px,8vw,100px) 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ color: '#7ed348', fontSize: 13, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>How It Works</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 72px)', margin: 0 }}>Simple. Powerful. Fair.</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', marginTop: 16, maxWidth: 480, margin: '16px auto 0', fontSize: 16, lineHeight: 1.6 }}>
            Four steps to go from zero to earning — or from idea to completed task.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24, maxWidth: 960, margin: '0 auto' }}>
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                background: '#111',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16,
                padding: '36px 28px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.25s, border-color 0.25s, box-shadow 0.25s',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'rgba(126,211,72,0.35)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Faded step number */}
              <div style={{ position: 'absolute', top: -10, right: 20, fontFamily: "'Bebas Neue',sans-serif", fontSize: 100, color: 'rgba(255,255,255,0.04)', lineHeight: 1, userSelect: 'none' }}>
                {step.num}
              </div>
              <div style={{ fontSize: 32, marginBottom: 16, background: i % 2 === 0 ? 'rgba(126,211,72,0.1)' : 'rgba(201,168,76,0.1)', width: 56, height: 56, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {step.icon}
              </div>
              <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, margin: '0 0 10px' }}>{step.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ════ WHO IT'S FOR ════════════════════════════════════════════════════ */}
      <Section style={{ padding: 'clamp(60px,8vw,100px) 5%', background: '#0a0a0a' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ color: '#7ed348', fontSize: 13, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>Who It&apos;s For</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 72px)', margin: 0 }}>Built for Both Sides.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 28, maxWidth: 900, margin: '0 auto' }}>
          {/* Worker Card */}
          <div
            style={{
              background: 'rgba(45,122,45,0.08)',
              border: '1px solid rgba(126,211,72,0.25)',
              borderRadius: 20,
              padding: '40px 32px',
              position: 'relative',
              transition: 'transform 0.25s, box-shadow 0.25s',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(126,211,72,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ position: 'absolute', bottom: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(126,211,72,0.12) 0%, transparent 70%)' }} />
            <div style={{ fontSize: 40, marginBottom: 16 }}>💪</div>
            <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: '0.05em', color: '#7ed348', margin: '0 0 6px' }}>Task Workers</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 24px' }}>Earners & Freelancers</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {workerBenefits.map((b, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 15, color: 'rgba(255,255,255,0.75)', alignItems: 'flex-start' }}>
                  <span style={{ color: '#7ed348', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✦</span> {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Creator Card */}
          <div
            style={{
              background: 'rgba(201,168,76,0.06)',
              border: '1px solid rgba(201,168,76,0.25)',
              borderRadius: 20,
              padding: '40px 32px',
              position: 'relative',
              transition: 'transform 0.25s, box-shadow 0.25s',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(201,168,76,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)' }} />
            <div style={{ fontSize: 40, marginBottom: 16 }}>🚀</div>
            <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: '0.05em', color: '#c9a84c', margin: '0 0 6px' }}>Task Creators</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: '0 0 24px' }}>Businesses & Individuals</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {creatorBenefits.map((b, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 15, color: 'rgba(255,255,255,0.75)', alignItems: 'flex-start' }}>
                  <span style={{ color: '#c9a84c', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✦</span> {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ════ FEATURES ════════════════════════════════════════════════════════ */}
      <Section id="features" style={{ padding: 'clamp(60px,8vw,100px) 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ color: '#7ed348', fontSize: 13, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>Platform Features</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 72px)', margin: 0 }}>Built to be trusted.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                background: '#111',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14,
                padding: '28px 24px',
                transition: 'transform 0.25s, border-color 0.25s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(126,211,72,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
            >
              <div style={{ fontSize: 30, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16, margin: '0 0 8px' }}>{f.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ════ CATEGORIES ══════════════════════════════════════════════════════ */}
      <Section id="categories" style={{ padding: 'clamp(60px,8vw,100px) 5%', background: '#0a0a0a' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ color: '#7ed348', fontSize: 13, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>Task Categories</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 72px)', margin: 0 }}>Whatever you need. We&rsquo;ve got it.</h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', maxWidth: 700, margin: '0 auto' }}>
          {categories.map((cat, i) => (
            <div
              key={i}
              style={{
                background: '#111',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 50,
                padding: '12px 24px',
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(126,211,72,0.08)'; e.currentTarget.style.borderColor = '#7ed348'; e.currentTarget.style.color = '#7ed348'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#111'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            >
              <span>{cat.icon}</span> {cat.label}
            </div>
          ))}
        </div>
      </Section>

      {/* ════ LIVE STATS ══════════════════════════════════════════════════════ */}
      <Section style={{ padding: 'clamp(60px,8vw,100px) 5%', background: '#111' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ color: '#7ed348', fontSize: 13, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>Live Platform Stats</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 72px)', margin: 0 }}>Real numbers. Real people.</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 12, fontSize: 16 }}>Updated in real time from our platform.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 24, maxWidth: 860, margin: '0 auto' }}>
          {[
            { icon: '👥', label: 'Total Users', value: stats.totalUsers || 0, color: '#7ed348', suffix: '+' },
            { icon: '✅', label: 'Tasks Completed', value: stats.completedTasks || 0, color: '#c9a84c', suffix: '+' },
            { icon: '📋', label: 'Tasks Available', value: stats.openTasks || 0, color: '#fff', suffix: '' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: '#0a0a0a',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 20,
                padding: '40px 28px',
                textAlign: 'center',
                transition: 'border-color 0.25s, box-shadow 0.25s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(126,211,72,0.3)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(126,211,72,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: 32, marginBottom: 16 }}>{stat.icon}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 80, lineHeight: 1, color: stat.color }}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', marginTop: 8, fontWeight: 500 }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ════ HOW PAYMENT WORKS ═══════════════════════════════════════════════ */}
      <Section style={{ padding: 'clamp(60px,8vw,100px) 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ color: '#7ed348', fontSize: 13, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>Payments & Security</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 72px)', margin: 0 }}>Your money. Your terms.</h2>
        </div>

        {/* Payment Flow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 0, maxWidth: 900, margin: '0 auto 60px' }}>
          {paymentSteps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', padding: '0 8px' }}>
                <div style={{ background: '#111', border: '1px solid rgba(126,211,72,0.25)', borderRadius: 14, padding: '20px 16px', minWidth: 110 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{step.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)', fontFamily: "'Outfit',sans-serif" }}>{step.label}</div>
                </div>
              </div>
              {i < paymentSteps.length - 1 && (
                <div style={{ color: '#7ed348', fontSize: 24, margin: '0 4px', flexShrink: 0 }}>→</div>
              )}
            </div>
          ))}
        </div>

        {/* Trust Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20, maxWidth: 720, margin: '0 auto' }}>
          {[
            { icon: '🔒', title: 'Funds always protected', desc: 'Money never moves until both parties agree.' },
            { icon: '⚖️', title: 'Fair for both sides', desc: 'Our dispute system listens to everyone.' },
            { icon: '👁️', title: 'Full transparency', desc: 'Every transaction is tracked and visible to you.' },
          ].map((t, i) => (
            <div key={i} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '28px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{t.icon}</div>
              <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16, margin: '0 0 8px' }}>{t.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ════ SPX TOKEN ═══════════════════════════════════════════════════════ */}
      <Section id="spx" style={{ padding: 'clamp(60px,8vw,100px) 5%', background: '#0a0a0a', position: 'relative', overflow: 'hidden' }}>
        {/* Gold glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 50, padding: '7px 20px', marginBottom: 20 }}>
              <span style={{ fontSize: 18 }}>🪙</span>
              <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.15em', color: '#c9a84c', textTransform: 'uppercase' }}>Introducing $SPX Token</span>
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 72px)', margin: '0 0 16px', lineHeight: 1 }}>
              Earn While You{' '}
              <span style={{ background: 'linear-gradient(135deg, #c9a84c, #eab308)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Work.</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(15px, 1.5vw, 17px)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              Every completed task earns you <strong style={{ color: '#c9a84c' }}>+50 SPX tokens</strong> — SelfPaid&apos;s native reward currency. Use them for exclusive perks, raffles, and future platform privileges. It&apos;s completely free and automatic.
            </p>
          </div>

          {/* Main two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 28, maxWidth: 1000, margin: '0 auto 48px' }}>
            {/* Left: Token Card */}
            <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.03))', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 24, padding: '40px 32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)' }} />
              <div style={{ fontSize: 64, marginBottom: 20, filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.5))' }}>🪙</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 52, color: '#c9a84c', lineHeight: 1, marginBottom: 4 }}>$SPX</div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>SelfPaid Token</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Earn Rate', value: '+50 SPX per task' },
                  { label: 'Withdrawal', value: 'Not yet (coming soon)' },
                  { label: 'Type', value: 'Platform Reward Token' },
                  { label: 'Cost to earn', value: 'Absolutely free' },
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>{row.label}</span>
                    <span style={{ fontSize: 14, color: '#c9a84c', fontWeight: 700 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Perks Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: '🎟️', title: 'Weekly Cash Raffle', desc: 'Spend 50 SPX for a ticket in the weekly $50 cash draw. Winners paid directly to their SelfPaid wallet every Friday.' },
                { icon: '🏆', title: 'Gold Tier Status', desc: 'Hold 1,000+ SPX to unlock your Gold Tier badge — visible on your profile to attract better-paying task creators.' },
                { icon: '🔓', title: 'Elite Tasks Access', desc: 'Accumulate 1,000 SPX to unlock a hidden tier of premium, high-paying tasks not visible to standard workers.' },
                { icon: '🚀', title: 'Future Utility', desc: 'As SelfPaid grows, $SPX will gain real-world value through exchange listings, creator boosts, and more.' },
              ].map((perk) => (
                <div
                  key={perk.title}
                  style={{ background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 22px', display: 'flex', gap: 16, alignItems: 'flex-start', transition: 'border-color 0.2s, transform 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <div style={{ fontSize: 28, flexShrink: 0, width: 50, height: 50, background: 'rgba(201,168,76,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{perk.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 5 }}>{perk.title}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{perk.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How you earn banner */}
          <div style={{ maxWidth: 1000, margin: '0 auto', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 20, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              {[
                { icon: '📝', label: 'Apply for a Task' },
                { icon: '⚒️', label: 'Complete the Work' },
                { icon: '✅', label: 'Creator Approves' },
                { icon: '🪙', label: '+50 SPX Earned!' },
              ].map((step, i, arr) => (
                <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{step.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: i === arr.length - 1 ? '#c9a84c' : 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>{step.label}</div>
                  </div>
                  {i < arr.length - 1 && <span style={{ color: 'rgba(201,168,76,0.4)', fontSize: 20, flexShrink: 0 }}>→</span>}
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/register')}
              style={{ background: 'linear-gradient(135deg,#c9a84c,#eab308)', border: 'none', borderRadius: 50, padding: '13px 30px', color: '#000', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 0 24px rgba(201,168,76,0.3)', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 36px rgba(201,168,76,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(201,168,76,0.3)'; }}
            >
              Start Earning SPX Free →
            </button>
          </div>
        </div>
      </Section>

      {/* ════ CTA BANNER ══════════════════════════════════════════════════════ */}
      <Section style={{ padding: 'clamp(80px,10vw,120px) 5%', background: '#0a0a0a', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(126,211,72,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} className="animate-glow" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(56px, 9vw, 110px)', lineHeight: 0.95, margin: '0 0 32px' }}>
            <span style={{ display: 'block', color: '#fff' }}>READY TO GET</span>
            <span style={{ display: 'block', background: 'linear-gradient(135deg, #7ed348, #c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>SELF PAID?</span>
          </h2>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <button
              onClick={() => navigate('/register')}
              style={{ background: 'linear-gradient(135deg, #7ed348, #4caf50)', color: '#000', border: 'none', borderRadius: 50, padding: '16px 40px', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 0 30px rgba(126,211,72,0.3)' }}
            >
              Start Earning Free
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{ background: 'transparent', color: '#c9a84c', border: '1px solid #c9a84c', borderRadius: 50, padding: '16px 40px', fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
            >
              Post Your First Task
            </button>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Free to join. No credit card required.</p>
        </div>
      </Section>

      {/* ════ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#000', padding: 'clamp(40px,6vw,80px) 5% 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 48, maxWidth: 1100, margin: '0 auto 48px' }}>
          {/* Left */}
          <div>
            <Logo size="sm" showTagline />
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7, marginTop: 16, maxWidth: 280 }}>
              The global platform where skills meet opportunity. Earn money doing what you do best.
            </p>
          </div>
          {/* Middle */}
          <div>
            <h4 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'How It Works', id: 'how' },
                { label: 'Features', id: 'features' },
                { label: 'Categories', id: 'categories' },
              ].map((l) => (
                <button key={l.id} onClick={() => document.getElementById(l.id)?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: 15, cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: "'Outfit',sans-serif", transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#7ed348'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                >
                  {l.label}
                </button>
              ))}
              <Link to="/register" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 15 }}>Register</Link>
              <Link to="/login" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 15 }}>Login</Link>
            </div>
          </div>
          {/* Right */}
          <div>
            <h4 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Contact</h4>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              support@selfpaid.io<br />
              Available 24/7 for platform support.
            </p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: 0 }}>© 2025 SelfPaid. All rights reserved.</p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, margin: 0 }}>Built with ❤️ for workers worldwide</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
