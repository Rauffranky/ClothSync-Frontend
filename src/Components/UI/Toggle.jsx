const toggleSizes = {
  sm: {
    trackHeight: 20,
    trackWidth: 36,
    thumbSize: 14,
    thumbOffset: 2,
    thumbTravel: 16,
  },
  md: {
    trackHeight: 24,
    trackWidth: 44,
    thumbSize: 18,
    thumbOffset: 2,
    thumbTravel: 20,
  },
  lg: {
    trackHeight: 28,
    trackWidth: 52,
    thumbSize: 22,
    thumbOffset: 2,
    thumbTravel: 24,
  },
};

const Toggle = ({
  checked = false,
  onChange,
  label,
  ariaLabel,
  disabled = false,
  size = "md",
  className = "",
  labelClassName = "",
  style,
  ...rest
}) => {
  const dimensions = toggleSizes[size] || toggleSizes.md;

  return (
    <button
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-2 border-0 bg-transparent p-0 text-sm font-semibold text-(--theme-text-secondary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-aurora-teal) ${className}`}
      disabled={disabled}
      onClick={(event) => onChange?.(!checked, event)}
      role="switch"
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.58 : 1,
        ...style,
      }}
      type="button"
      {...rest}
    >
      <span
        aria-hidden="true"
        className="relative shrink-0 rounded-full border transition-[background-color,border-color,box-shadow] duration-200"
        style={{
          width: dimensions.trackWidth,
          height: dimensions.trackHeight,
          background: checked
            ? "var(--color-aurora-teal)"
            : "color-mix(in srgb, var(--theme-text-muted) 38%, var(--theme-surface-strong))",
          borderColor: checked
            ? "color-mix(in srgb, var(--color-aurora-teal) 78%, var(--theme-text-primary))"
            : "color-mix(in srgb, var(--theme-text-muted) 68%, var(--theme-border-soft))",
          boxShadow: checked
            ? "0 4px 12px rgba(20, 184, 166, 0.24)"
            : "inset 0 1px 2px rgba(15, 23, 42, 0.14), 0 1px 3px rgba(15, 23, 42, 0.08)",
        }}
      >
        <span
          className="absolute rounded-full border bg-white transition-transform duration-200"
          style={{
            top: dimensions.thumbOffset,
            left: dimensions.thumbOffset,
            width: dimensions.thumbSize,
            height: dimensions.thumbSize,
            borderColor: checked
              ? "rgba(255, 255, 255, 0.72)"
              : "color-mix(in srgb, var(--theme-text-muted) 45%, white)",
            boxShadow: "0 1px 4px rgba(15, 23, 42, 0.28)",
            transform: checked
              ? `translateX(${dimensions.thumbTravel}px)`
              : "translateX(0)",
          }}
        />
      </span>
      {label && <span className={labelClassName}>{label}</span>}
    </button>
  );
};

export default Toggle;
