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

      {/* ════ HUMANIZED HERO ═══════════════════════════════════════════════════ */}
      <div style={{ minHeight: '90vh', padding: '120px 5% 60px', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Glow Effects */}
        <div className="animate-glow" style={{ position: 'absolute', top: '40%', right: '10%', transform: 'translate(50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(126,211,72,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ maxWidth: 1300, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '60px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          
          {/* Left: Punchy Copy */}
          <div className="animate-fade-up">
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(56px, 8vw, 100px)', lineHeight: 0.95, margin: '0 0 24px', color: '#fff' }}>
              How work <br />
              <span style={{ color: '#7ed348' }}>should work.</span>
            </h1>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(255,255,255,0.7)', margin: '0 0 40px', lineHeight: 1.6, maxWidth: 500 }}>
              Forget the endless back-and-forth and high platform fees. SelfPaid connects you with top global talent and secure escrow payouts.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/register')} style={{ background: '#7ed348', color: '#000', border: 'none', borderRadius: 50, padding: '16px 36px', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 8px 24px rgba(126,211,72,0.2)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                Find Talent
              </button>
              <button onClick={() => navigate('/register')} style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 50, padding: '16px 36px', fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 16, cursor: 'pointer', transition: 'border-color 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#7ed348'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'}>
                Earn Money
              </button>
            </div>
            <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex' }}>
                {['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80'].map((src, i) => (
                  <img key={i} src={src} alt="user" style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #000', marginLeft: i > 0 ? -12 : 0, objectFit: 'cover' }} />
                ))}
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: "'Outfit',sans-serif" }}>Trusted by {stats.totalUsers > 0 ? stats.totalUsers : '3,000'}+ global users</span>
            </div>
          </div>

          {/* Right: Human Photo Grid (Upwork style) */}
          <div className="animate-float" style={{ position: 'relative', height: 500, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* Main Center Image */}
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" alt="Team working" style={{ width: '80%', height: '80%', objectFit: 'cover', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
            {/* Floating Top Left */}
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80" alt="Professional Woman" style={{ position: 'absolute', top: 20, left: 0, width: 140, height: 140, objectFit: 'cover', borderRadius: '50%', border: '6px solid #000', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }} />
            {/* Floating Bottom Right */}
            <div style={{ position: 'absolute', bottom: 40, right: -10, background: '#111', border: '1px solid rgba(126,211,72,0.3)', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(126,211,72,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✅</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Approved!</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Payment Released</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ════ TRUSTED BY LOGOS ════════════════════════════════════════════════ */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '40px 5%', background: '#050505', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24, fontWeight: 600 }}>Trusted by modern companies worldwide</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(30px, 8vw, 80px)', flexWrap: 'wrap', opacity: 0.4 }}>
          {/* Using generic SVG shapes for clean, aesthetic generic company logos */}
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, background: '#fff', borderRadius: 4, transform: 'rotate(45deg)' }} /> Acme Corp
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, border: '4px solid #fff', borderRadius: '50%' }} /> Globex
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderBottom: '24px solid #fff' }} /> Vertex
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, background: '#fff', borderRadius: 12, borderTopLeftRadius: 0 }} /> Nova
          </div>
        </div>
      </div>

      {/* ════ SIMPLIFIED CATEGORIES ═══════════════════════════════════════════ */}
      <Section id="categories" style={{ padding: 'clamp(60px,8vw,100px) 5%', background: '#000' }}>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 60px' }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 64px)', margin: '0 0 16px' }}>Browse <span style={{ color: '#7ed348' }}>talent</span> by category</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>From quick data-entry to complex web development, find the exact skill you need.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {[
            { title: 'Development & IT', icon: '💻', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80' },
            { title: 'Design & Creative', icon: '🎨', img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80' },
            { title: 'Digital Marketing', icon: '📈', img: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=500&q=80' },
            { title: 'Writing & Translation', icon: '✍️', img: 'https://images.unsplash.com/photo-1455390582262-044cdead27d8?w=500&q=80' },
          ].map((cat, i) => (
            <div key={i} style={{ position: 'relative', height: 200, borderRadius: 20, overflow: 'hidden', cursor: 'pointer', group: 'true' }}>
              {/* Background Image */}
              <img src={cat.img} alt={cat.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4, transition: 'opacity 0.3s, transform 0.5s' }} onMouseEnter={e => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={e => { e.currentTarget.style.opacity = '0.4'; e.currentTarget.style.transform = 'scale(1)'; }} />
              {/* Overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #000 10%, transparent 80%)', pointerEvents: 'none' }} />
              {/* Content */}
              <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, pointerEvents: 'none' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{cat.icon}</div>
                <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, color: '#fff', margin: 0 }}>{cat.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ════ VALUE PROP (HUMAN + BULLETS) ════════════════════════════════════ */}
      <Section id="how" style={{ padding: 'clamp(60px,8vw,100px) 5%', background: '#0a0a0a' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 60, alignItems: 'center' }}>
          
          {/* Left: Value Image */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -20, background: 'rgba(126,211,72,0.1)', borderRadius: 30, transform: 'rotate(-3deg)' }} />
            <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1000&q=80" alt="Platform Benefits" style={{ width: '100%', borderRadius: 24, position: 'relative', zIndex: 1, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} />
          </div>

          {/* Right: Focused Bullets */}
          <div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 5vw, 64px)', margin: '0 0 32px', lineHeight: 1.1 }}>
              Why choose <span style={{ color: '#c9a84c' }}>SelfPaid</span>?
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {[
                { title: 'Proof-of-Work Required', desc: 'No more paying for uncompleted tasks. Every submission requires verifiable proof before you unfreeze escrow.' },
                { title: 'Global Escrow Protection', desc: 'Money is held securely in the middle. The creator is protected from bad work, and the worker is protected from non-payment.' },
                { title: 'Instant Withdrawals', desc: 'Once a task is approved, funds are immediately credited to the worker\'s digital wallet. No waiting 14 days.' }
              ].map((val, i) => (
                <div key={i}>
                  <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#7ed348' }}>✓</span> {val.title}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6, fontSize: 15 }}>{val.desc}</p>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/register')} style={{ marginTop: 40, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 50, padding: '12px 28px', fontFamily: "'Outfit',sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              Learn How It Works →
            </button>
          </div>

        </div>
      </Section>

      {/* ════ HUMAN TESTIMONIAL ═══════════════════════════════════════════════ */}
      <Section style={{ padding: 'clamp(60px,8vw,100px) 5%', background: '#000' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 32, padding: 'clamp(40px, 6vw, 60px)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 24, fontSize: 18 }}>
            ⭐ ⭐ ⭐ ⭐ ⭐
          </div>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 500, fontSize: 'clamp(20px, 3vw, 28px)', color: '#fff', lineHeight: 1.5, margin: '0 0 32px' }}>
             "As a remote developer, finding trustworthy clients used to be a nightmare. SelfPaid's escrow system guarantees I get paid the second my code is approved. I'll never go back."
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" alt="David M." style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16 }}>Marcus T.</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Senior Web Developer</div>
            </div>
          </div>
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
