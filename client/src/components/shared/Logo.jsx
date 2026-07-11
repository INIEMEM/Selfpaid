const sizeMap = {
  sm: { height: 120 },
  md: { height: 160 },
  lg: { height: 240 },
};

const Logo = ({ size = 'md', showTagline = false }) => {
  const { height } = sizeMap[size] || sizeMap.md;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <img 
        src="/logo.png" 
        alt="SelfPaid Logo" 
        style={{ 
          height: showTagline ? height * 1.2 : height,
          width: 'auto',
          objectFit: 'contain'
        }} 
      />
    </div>
  );
};

export default Logo;
