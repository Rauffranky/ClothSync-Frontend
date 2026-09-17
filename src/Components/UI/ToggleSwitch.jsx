import { LoaderCircle } from "lucide-react";

const toggleSwitchSizes = {
  sm: {
    trackHeight: 32,
    trackWidth: 124,
    thumbSize: 24,
    thumbOffset: 4,
    thumbTravel: 92,
    fontSize: "0.75rem",
    knobOccupied: 28,
  },
  md: {
    trackHeight: 36,
    trackWidth: 136,
    thumbSize: 28,
    thumbOffset: 4,
    thumbTravel: 100,
    fontSize: "0.8125rem",
    knobOccupied: 32,
  },
  lg: {
    trackHeight: 42,
    trackWidth: 152,
    thumbSize: 34,
    thumbOffset: 4,
    thumbTravel: 110,
    fontSize: "0.875rem",
    knobOccupied: 38,
  },
};

const variantStyles = {
  primary: {
    background: "linear-gradient(90deg, #10B981 0%, #06B6D4 50%, #3B82F6 100%)",
    borderColor: "rgba(16, 185, 129, 0.45)",
    boxShadow: "0 2px 10px rgba(6, 182, 212, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
    textColor: "#FFFFFF",
  },
  danger: {
    background: "linear-gradient(90deg, #EF4444 0%, #DC2626 60%, #B91C1C 100%)",
    borderColor: "rgba(239, 68, 68, 0.45)",
    boxShadow: "0 2px 10px rgba(239, 68, 68, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
    textColor: "#FFFFFF",
  },
  neutral: {
    background: "color-mix(in srgb, var(--theme-text-muted) 38%, var(--theme-surface-strong))",
    borderColor: "color-mix(in srgb, var(--theme-text-muted) 68%, var(--theme-border-soft))",
    boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.14), 0 1px 3px rgba(15, 23, 42, 0.08)",
    textColor: "var(--theme-text-secondary)",
  },
};

const ToggleSwitch = ({
  checked = false,
  onChange,
  checkedLabel = "Stop Scan",
  uncheckedLabel = "Start Scan",
  checkedVariant = "danger",
  uncheckedVariant = "primary",
  loading = false,
  disabled = false,
  size = "md",
  ariaLabel,
  className = "",
  style,
  ...rest
}) => {
  const dimensions = toggleSwitchSizes[size] || toggleSwitchSizes.md;
  const activeVariant = checked
    ? variantStyles[checkedVariant] || variantStyles.danger
    : variantStyles[uncheckedVariant] || variantStyles.primary;
  const activeLabel = checked ? checkedLabel : uncheckedLabel;
  const isDisabled = disabled || loading;

  const handleClick = (event) => {
    if (isDisabled) return;
    onChange?.(!checked, event);
  };

  return (
    <button
      aria-checked={checked}
      aria-label={ariaLabel || activeLabel}
      className={`group relative inline-flex shrink-0 select-none items-center rounded-full border p-0 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-aurora-teal) ${className}`}
      disabled={isDisabled}
      onClick={handleClick}
      role="switch"
      style={{
        width: dimensions.trackWidth,
        height: dimensions.trackHeight,
        background: activeVariant.background,
        borderColor: activeVariant.borderColor,
        boxShadow: activeVariant.boxShadow,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.65 : 1,
        ...style,
      }}
      type="button"
      {...rest}
    >
      {/* Sliding Pure White Thumb Knob */}
      <span
        aria-hidden="true"
        className="absolute z-10 flex items-center justify-center rounded-full bg-white transition-transform duration-300 ease-[cubic-bezier(0.34,1.25,0.64,1)]"
        style={{
          top: dimensions.thumbOffset,
          left: dimensions.thumbOffset,
          width: dimensions.thumbSize,
          height: dimensions.thumbSize,
          boxShadow: "0 3px 8px rgba(0, 0, 0, 0.26), 0 1px 2px rgba(0, 0, 0, 0.14)",
          transform: checked ? `translateX(${dimensions.thumbTravel}px)` : "translateX(0)",
        }}
      >
        {loading && (
          <LoaderCircle
            aria-hidden="true"
            className="animate-spin text-gray-700"
            size={Math.max(dimensions.thumbSize - 12, 14)}
          />
        )}
      </span>

      {/* Label Text - Mathematically centered in the remaining open space */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 flex items-center justify-center whitespace-nowrap font-black tracking-wide drop-shadow-sm transition-all duration-200"
        style={{
          color: activeVariant.textColor,
          fontSize: dimensions.fontSize,
          left: checked ? 0 : dimensions.knobOccupied,
          right: checked ? dimensions.knobOccupied : 0,
        }}
      >
        {activeLabel}
      </span>
    </button>
  );
};

export default ToggleSwitch;
