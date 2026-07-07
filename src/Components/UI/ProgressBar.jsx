import React from 'react';

const VARIANTS = {
  primary: "var(--color-aurora-teal)",
  info: "var(--color-sky-blue)",
  success: "var(--color-ready)",
  warning: "var(--color-pending)",
  danger: "var(--color-overdue)",
  purple: "var(--color-super-admin-light)",
  neutral: "var(--color-cancelled)",
  teal: "var(--color-aurora-teal)",
};

const ProgressBar = ({
  value = 0,
  max = 100,
  variant = 'primary',
  color, // custom hex or css var to override variant
  heightClass = 'h-1',
  className = '',
  bgColorClass = 'bg-(--theme-border)',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const resolvedColor = color || VARIANTS[variant] || VARIANTS.primary;

  return (
    <div className={`w-full overflow-hidden rounded-full ${bgColorClass} ${heightClass} ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${percentage}%`,
          backgroundColor: resolvedColor,
        }}
      />
    </div>
  );
};

export default ProgressBar;
