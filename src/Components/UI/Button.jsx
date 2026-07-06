import { useState } from "react";
import { LoaderCircle } from "lucide-react";

const buttonVariants = {
  primary: {
    color: "var(--button-primary-text)",
    background: "var(--gradient-aurora-flow)",
    borderColor: "transparent",
    boxShadow: "var(--button-primary-shadow)",
    hover: {
      boxShadow: "var(--button-primary-shadow-hover)",
    },
  },
  secondary: {
    color: "var(--color-aurora-teal)",
    background: "var(--button-secondary-bg)",
    borderColor: "var(--button-secondary-border)",
    boxShadow: "var(--button-secondary-shadow)",
    hover: {
      background: "var(--button-secondary-bg-hover)",
      borderColor: "var(--button-secondary-border-hover)",
      boxShadow: "var(--button-secondary-shadow-hover)",
    },
  },
  ghost: {
    color: "var(--theme-text-secondary)",
    background: "var(--button-ghost-bg)",
    borderColor: "var(--theme-border-soft)",
    boxShadow: "var(--button-ghost-shadow)",
    hover: {
      color: "var(--theme-text-primary)",
      background: "var(--button-ghost-bg-hover)",
      borderColor: "var(--theme-border)",
    },
  },
  danger: {
    color: "var(--button-danger-text)",
    background: "var(--button-danger-bg)",
    borderColor: "transparent",
    boxShadow: "var(--button-danger-shadow)",
    hover: {
      boxShadow: "var(--button-danger-shadow-hover)",
    },
  },
  success: {
    color: "var(--button-success-text)",
    background: "var(--gradient-mint-haze)",
    borderColor: "transparent",
    boxShadow: "var(--button-success-shadow)",
    hover: {
      boxShadow: "var(--button-success-shadow-hover)",
    },
  },
  warning: {
    color: "var(--button-warning-text)",
    background: "var(--button-warning-bg)",
    borderColor: "transparent",
    boxShadow: "var(--button-warning-shadow)",
    hover: {
      boxShadow: "var(--button-warning-shadow-hover)",
    },
  },
  info: {
    color: "var(--button-info-text)",
    background: "var(--gradient-ocean-breeze)",
    borderColor: "transparent",
    boxShadow: "var(--button-info-shadow)",
    hover: {
      boxShadow: "var(--button-info-shadow-hover)",
    },
  },
  outline: {
    color: "var(--theme-text-primary)",
    background: "transparent",
    borderColor: "var(--theme-border-soft)",
    boxShadow: "none",
    hover: {
      color: "var(--color-aurora-teal)",
      borderColor: "var(--color-aurora-teal)",
      boxShadow: "var(--button-outline-shadow-hover)",
    },
  },
  link: {
    color: "var(--color-aurora-teal)",
    background: "transparent",
    borderColor: "transparent",
    boxShadow: "none",
    hover: {
      color: "var(--color-aqua-mist)",
      textDecoration: "underline",
    },
  },
};

const buttonSizes = {
  sm: {
    minHeight: 36,
    padding: "0 16px",
    fontSize: "0.875rem",
  },
  md: {
    minHeight: 44,
    padding: "0 24px",
    fontSize: "0.875rem",
  },
  lg: {
    minHeight: 48,
    padding: "0 32px",
    fontSize: "1rem",
  },
};

const baseButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  borderWidth: 1,
  borderStyle: "solid",
  fontWeight: 700,
  lineHeight: 1,
  whiteSpace: "nowrap",
  transition:
    "background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease, color 180ms ease, transform 180ms ease",
};

const disabledStyle = {
  cursor: "not-allowed",
  opacity: 0.58,
  transform: "none",
};

const Button = ({
  as: Component = "button",
  children,
  variant = "primary",
  size = "md",
  rounded = "12px",
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  disableHoverTransform = false,
  className = "",
  style,
  type = "button",
  onMouseEnter,
  onMouseLeave,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isButton = Component === "button";
  const isDisabled = disabled || loading;
  const hasChildren = children !== undefined && children !== null && children !== "";
  const isIconOnly = !hasChildren && (leftIcon || rightIcon || loading);
  const variantStyle = buttonVariants[variant] || buttonVariants.primary;
  const { hover, ...baseVariantStyle } = variantStyle;
  const sizeStyle = typeof size === "string" ? buttonSizes[size] || buttonSizes.md : size;
  const iconOnlySizeStyle =
    typeof size === "string"
      ? {
          ...sizeStyle,
          aspectRatio: "1 / 1",
          padding: 0,
        }
      : sizeStyle;
  const hoverStyle = isHovered && !isDisabled ? hover : null;

  const handleMouseEnter = (event) => {
    setIsHovered(true);
    onMouseEnter?.(event);
  };

  const handleMouseLeave = (event) => {
    setIsHovered(false);
    onMouseLeave?.(event);
  };

  return (
    <Component
      className={className}
      disabled={isButton ? isDisabled : undefined}
      type={isButton ? type : undefined}
      aria-disabled={!isButton && isDisabled ? true : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        ...baseButtonStyle,
        ...(isIconOnly ? iconOnlySizeStyle : sizeStyle),
        ...baseVariantStyle,
        ...hoverStyle,
        gap: isIconOnly ? 0 : baseButtonStyle.gap,
        borderRadius: rounded,
        width: fullWidth ? "100%" : undefined,
        cursor: isDisabled ? "not-allowed" : "pointer",
        transform:
          isHovered && !isDisabled && variant !== "link" && !disableHoverTransform
            ? "translateY(-1px)"
            : undefined,
        ...(isDisabled ? disabledStyle : null),
        ...style,
      }}
      {...rest}
    >
      {loading && <LoaderCircle size={16} />}
      {!loading && leftIcon}
      {hasChildren && <span>{children}</span>}
      {!loading && rightIcon}
    </Component>
  );
};

export default Button;
