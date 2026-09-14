const avatarVariants = {
  info: {
    background: "#0B9086",
  },
  purple: {
    background: "#7c3aed",
  },
  success: {
    background: "#0B9086",
  },
  warning: {
    background: "var(--button-warning-bg)",
  },
  danger: {
    background: "var(--button-danger-bg)",
  },
  neutral: {
    background: "#64748b",
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
