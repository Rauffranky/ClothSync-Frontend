const alertVariants = {
  info: {
    color: "var(--color-sky-blue)",
    background:
      "color-mix(in srgb, var(--color-sky-blue) 10%, var(--theme-surface))",
    borderColor:
      "color-mix(in srgb, var(--color-sky-blue) 38%, var(--theme-border))",
  },
  success: {
    color: "var(--color-fresh-mint)",
    background:
      "color-mix(in srgb, var(--color-fresh-mint) 10%, var(--theme-surface))",
    borderColor:
      "color-mix(in srgb, var(--color-fresh-mint) 38%, var(--theme-border))",
  },
  warning: {
    color: "var(--color-sunlit-gold)",
    background:
      "color-mix(in srgb, var(--color-sunlit-gold) 12%, var(--theme-surface))",
    borderColor:
      "color-mix(in srgb, var(--color-sunlit-gold) 42%, var(--theme-border))",
  },
  danger: {
    color: "var(--color-overdue)",
    background:
      "color-mix(in srgb, var(--color-overdue) 10%, var(--theme-surface))",
    borderColor:
      "color-mix(in srgb, var(--color-overdue) 38%, var(--theme-border))",
  },
  neutral: {
    color: "var(--theme-text-secondary)",
    background: "var(--theme-surface-strong)",
    borderColor: "var(--theme-border)",
  },
};

const alertSizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2 text-sm",
  lg: "px-6 py-3 text-md",
};

const Alert = ({
  children,
  variant = "info",
  size = "md",
  rounded = "rounded-2xl",
  leftIcon,
  className = "",
  style,
  ...rest
}) => {
  const variantStyle = alertVariants[variant] || alertVariants.info;
  const sizeClass = alertSizes[size] || alertSizes.md;
  const classes = [
    "flex gap-3 border font-semibold leading-relaxed",
    leftIcon ? "items-start" : "items-center",
    sizeClass,
    rounded,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      role="alert"
      style={{
        ...variantStyle,
        ...style,
      }}
      {...rest}
    >
      {leftIcon && <span className="mt-0.5 shrink-0">{leftIcon}</span>}
      <div className="min-w-0">{children}</div>
    </div>
  );
};

export default Alert;
