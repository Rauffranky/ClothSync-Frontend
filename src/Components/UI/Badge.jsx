const badgeVariants = {
  ready: {
    color: "var(--badge-ready-text)",
    background: "var(--badge-ready-bg)",
    borderColor: "var(--badge-ready-border)",
  },
  progress: {
    color: "var(--badge-progress-text)",
    background: "var(--badge-progress-bg)",
    borderColor: "var(--badge-progress-border)",
  },
  completed: {
    color: "var(--badge-completed-text)",
    background: "var(--badge-completed-bg)",
    borderColor: "var(--badge-completed-border)",
  },
  pending: {
    color: "var(--badge-pending-text)",
    background: "var(--badge-pending-bg)",
    borderColor: "var(--badge-pending-border)",
  },
  overdue: {
    color: "var(--badge-overdue-text)",
    background: "var(--badge-overdue-bg)",
    borderColor: "var(--badge-overdue-border)",
  },
  cancelled: {
    color: "var(--badge-cancelled-text)",
    background: "var(--badge-cancelled-bg)",
    borderColor: "var(--badge-cancelled-border)",
  },
  success: {
    color: "var(--badge-ready-text)",
    background: "var(--badge-ready-bg)",
    borderColor: "var(--badge-ready-border)",
  },
  danger: {
    color: "var(--badge-overdue-text)",
    background: "var(--badge-overdue-bg)",
    borderColor: "var(--badge-overdue-border)",
  },
  warning: {
    color: "var(--badge-pending-text)",
    background: "var(--badge-pending-bg)",
    borderColor: "var(--badge-pending-border)",
  },
  info: {
    color: "var(--badge-progress-text)",
    background: "var(--badge-progress-bg)",
    borderColor: "var(--badge-progress-border)",
  },
  neutral: {
    color: "var(--badge-cancelled-text)",
    background: "var(--badge-cancelled-bg)",
    borderColor: "var(--badge-cancelled-border)",
  },
  purple: {
    color: "var(--badge-purple-text)",
    background: "var(--badge-purple-bg)",
    borderColor: "var(--badge-purple-border)",
    boxShadow: "var(--badge-purple-shadow)",
    backdropFilter: "var(--badge-purple-backdrop)",
    WebkitBackdropFilter: "var(--badge-purple-backdrop)",
  },
};

const badgeSizes = {
  sm: "min-h-6 px-2 py-1 text-[10px]",
  md: "min-h-7 px-3 py-1.5 text-xs",
  lg: "min-h-8 px-4 py-2 text-[13px]",
};

const Badge = ({
  as: Component = "span",
  children,
  variant = "neutral",
  size = "md",
  rounded = "rounded-full",
  dot = false,
  leftIcon,
  rightIcon,
  className = "",
  style,
  ...rest
}) => {
  const sizeClass = badgeSizes[size] || badgeSizes.md;
  const variantStyle = badgeVariants[variant] || badgeVariants.neutral;
  const classes = [
    "inline-flex items-center justify-center gap-[6px] border border-solid font-bold leading-none whitespace-nowrap shadow-[var(--badge-shadow)]",
    sizeClass,
    rounded,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      className={classes}
      style={{
        ...variantStyle,
        ...style,
      }}
      {...rest}
    >
      {dot && (
        <span
          className="h-1.75 w-1.75 rounded-full bg-current shadow-[0_0_8px_currentColor]"
        />
      )}
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </Component>
  );
};

export default Badge;
