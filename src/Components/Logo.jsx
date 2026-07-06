const Logo = ({ width = "100%", height = "50px", className = "" }) => {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <svg
        viewBox="0 0 200 60"
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle cx="30" cy="30" r="25" fill="#10B981" opacity="0.2" />

        {/* Main logo icon */}
        <rect x="18" y="18" width="24" height="24" rx="4" fill="#10B981" />
        <rect x="22" y="22" width="16" height="16" rx="2" fill="white" opacity="0.3" />

        {/* Text */}
        <text
          x="65"
          y="38"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="24"
          fontWeight="bold"
          fill="#10B981"
        >
          Platform
        </text>
      </svg>
    </div>
  );
};

export default Logo;
