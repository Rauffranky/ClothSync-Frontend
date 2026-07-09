const avatarVariants = {
  info: {
    background: "var(--gradient-ocean-breeze)",
  },
  purple: {
    background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
  },
  success: {
    background: "var(--gradient-mint-haze)",
  },
  warning: {
    background: "var(--button-warning-bg)",
  },
  danger: {
    background: "var(--button-danger-bg)",
  },
  neutral: {
    background: "linear-gradient(135deg, #64748b, #94a3b8)",
  },
};

const avatarSizes = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
};

const InitialsAvatar = ({
  initials,
  variant = "info",
  size = "md",
  className = "",
  style,
}) => {
  return (
    <span
      className={[
        "grid shrink-0 place-items-center rounded-full font-black text-white",
        avatarSizes[size] || avatarSizes.md,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...(avatarVariants[variant] || avatarVariants.info),
        ...style,
      }}
    >
      {initials}
    </span>
  );
};

export default InitialsAvatar;
