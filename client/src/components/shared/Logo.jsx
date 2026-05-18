const sizeMap = {
  sm: { icon: 28, text: 20 },
  md: { icon: 36, text: 26 },
  lg: { icon: 60, text: 44 },
};

const Logo = ({ size = 'md', showTagline = false }) => {
  const { icon, text } = sizeMap[size] || sizeMap.md;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* SVG Dollar Icon */}
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7ed348" />
              <stop offset="100%" stopColor="#4caf50" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="20" fill="url(#logoGrad)" opacity="0.15" />
          <circle cx="20" cy="20" r="19" stroke="url(#logoGrad)" strokeWidth="1.5" fill="none" />
          <text
            x="20"
            y="27"
            textAnchor="middle"
            fill="url(#logoGrad)"
            fontSize="22"
            fontFamily="Bebas Neue, sans-serif"
            fontWeight="bold"
          >
            $
          </text>
        </svg>

        {/* Brand Name */}
        <span
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: text,
            letterSpacing: '0.08em',
            background: 'linear-gradient(135deg, #7ed348, #4caf50)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1,
          }}
        >
          SELFPAID
        </span>
      </div>

      {showTagline && (
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: Math.max(10, text * 0.42),
            color: '#c9a84c',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          Get Paid for What You Do
        </span>
      )}
    </div>
  );
};

export default Logo;
