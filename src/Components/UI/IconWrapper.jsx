import React from 'react';
import { AlertCircle } from 'lucide-react';

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

const IconWrapper = ({
  icon: Icon,
  className = '',
  sizeClassName = 'h-9 w-9',
  roundedClassName = 'rounded-lg',
  iconSize = 18,
  iconStrokeWidth = 2.2,
  variant, // e.g. "primary", "info", "success", "warning", "danger", "purple", "neutral"
  hasAlert = false, // If true, shows a red dot on the top right
  color, // Hex or CSS variable for automatic background tinting (overrides variant)
  bgColor, // Tailwind class for background
  borderColor, // Tailwind class for border
  iconColor, // Tailwind class for icon color
  style = {},
}) => {
  if (!Icon) return null;

  // Resolve the final color based on variant or custom color prop
  const resolvedColor = color || (variant ? VARIANTS[variant] : null);

  const customStyle = resolvedColor
    ? {
        color: resolvedColor,
        background: `color-mix(in srgb, ${resolvedColor} 14%, transparent)`,
        ...style,
      }
    : style;

  return (
    <span
      className={`relative grid place-items-center shrink-0 ${sizeClassName} ${roundedClassName} ${bgColor || ''} ${borderColor ? `border ${borderColor}` : ''} ${iconColor || ''} ${className}`}
      style={customStyle}
    >
      <Icon size={iconSize} strokeWidth={iconStrokeWidth} />
      
      {hasAlert && (
        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full shadow-sm">
          <AlertCircle size={15} color="var(--theme-surface)" fill="var(--color-overdue)" />
        </span>
      )}
    </span>
  );
};

export default IconWrapper;
