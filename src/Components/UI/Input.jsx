import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = forwardRef(
  (
    {
      type = "text",
      name,
      label,
      placeholder = "Enter text...",
      value,
      onChange,
      onBlur,
      onFocus,
      leftIcon,
      onLeftIconClick,
      rightIcon,
      onRightIconClick,
      helperText = "",
      error = false,
      disabled = false,
      required = false,
      multiline = false,
      rows = 4,
      resize = false,
      height = "48px",
      rounded = "12px",
      fullWidth = true,
      className = "",
      inputClassName = "",
      style,
      inputStyle,
      ...rest
    },
    ref,
  ) => {
    const inputRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === "password";
    const isPickerType = type === "date" || type === "time";

    useImperativeHandle(ref, () => inputRef.current);

    const actualType = isPassword
      ? showPassword
        ? "text"
        : "password"
      : isPickerType && !value && !isFocused
        ? "text"
        : type;

    const handleChange = (event) => {
      let nextValue = event.target.value;

      if (type === "number" && nextValue !== "") {
        const numericValue = Number(nextValue);
        const minValue = rest.min !== undefined ? Number(rest.min) : undefined;
        const maxValue = rest.max !== undefined ? Number(rest.max) : undefined;

        if (minValue !== undefined && numericValue < minValue) {
          nextValue = String(minValue);
        }

        if (maxValue !== undefined && numericValue > maxValue) {
          nextValue = String(maxValue);
        }
      }

      onChange?.(nextValue, event);
    };

    const openNativePicker = () => {
      if (!isPickerType) return;

      setIsFocused(true);
      window.setTimeout(() => {
        try {
          inputRef.current?.showPicker?.();
        } catch {
          inputRef.current?.focus();
        }
      }, 0);
    };

    const handleRightIconClick = () => {
      if (disabled) return;

      if (isPassword) {
        setShowPassword((current) => !current);
      }

      openNativePicker();
      onRightIconClick?.();
    };

    const handleFocus = (event) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur = (event) => {
      setIsFocused(false);
      onBlur?.(event);
    };

    const fieldStyle = {
      width: fullWidth ? "100%" : undefined,
      minHeight: multiline ? undefined : height,
      height: multiline ? undefined : height,
      borderRadius: rounded,
      color: "var(--theme-text-primary)",
      background:
        "linear-gradient(145deg, var(--theme-surface-strong), var(--theme-surface))",
      border: `1px solid ${
        error ? "rgba(239, 68, 68, 0.55)" : "var(--theme-border-soft)"
      }`,
      boxShadow: isFocused
        ? error
          ? "0 0 0 4px rgba(239, 68, 68, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.18)"
          : "0 0 0 4px rgba(20, 184, 166, 0.14), 0 10px 22px rgba(20, 184, 166, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.18)"
        : "inset 0 1px 0 rgba(255, 255, 255, 0.18)",
      ...style,
    };

    const commonControlProps = {
      ref: inputRef,
      name,
      placeholder,
      value,
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      disabled,
      required,
      className: `global-input-control min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[var(--theme-text-muted)] disabled:cursor-not-allowed ${inputClassName}`,
      style: {
        color: "var(--theme-text-primary)",
        ...inputStyle,
      },
      ...rest,
    };

    return (
      <div className={fullWidth ? "w-full" : ""}>
        {label && (
          <label
            className="mb-2 block text-sm font-semibold"
            style={{ color: "var(--theme-text-secondary)" }}
          >
            {label}
            {required && (
              <span className="ml-1" style={{ color: "var(--color-overdue)" }}>
                *
              </span>
            )}
          </label>
        )}

        <div
          className={`flex gap-3 overflow-hidden px-4 transition-all duration-200 ${
            multiline ? "items-start" : "items-center"
          } ${
            multiline ? "py-3" : ""
          } ${disabled ? "cursor-not-allowed opacity-60" : ""} ${className}`}
          style={fieldStyle}
        >
          {leftIcon && (
            <button
              type="button"
              onClick={onLeftIconClick}
              disabled={disabled || !onLeftIconClick}
              className={`flex shrink-0 items-center justify-center border-0 bg-transparent p-0 ${
                multiline ? "mt-0.5" : ""
              }`}
              style={{
                color: "var(--theme-text-muted)",
                cursor: onLeftIconClick && !disabled ? "pointer" : "default",
              }}
            >
              {leftIcon}
            </button>
          )}

          {multiline ? (
            <textarea
              {...commonControlProps}
              rows={rows}
              className={`${commonControlProps.className} hide-scrollbar ${
                resize ? "resize-y" : "resize-none"
              }`}
              style={{
                minHeight: `${rows * 24}px`,
                ...commonControlProps.style,
              }}
            />
          ) : (
            <input
              {...commonControlProps}
              type={actualType}
              onWheel={(event) => {
                if (type === "number") event.currentTarget.blur();
                rest.onWheel?.(event);
              }}
            />
          )}

          {(isPassword || rightIcon) && (
            <button
              type="button"
              onClick={handleRightIconClick}
              disabled={disabled}
              className={`flex shrink-0 items-center justify-center border-0 bg-transparent p-0 transition-colors ${
                multiline ? "mt-0.5" : ""
              }`}
              style={{
                color: "var(--theme-text-muted)",
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              {isPassword ? (
                showPassword ? (
                  <EyeOff size={18} strokeWidth={1.8} />
                ) : (
                  <Eye size={18} strokeWidth={1.8} />
                )
              ) : (
                rightIcon
              )}
            </button>
          )}
        </div>

        {helperText && (
          <p
            className="mt-1.5 text-xs"
            style={{
              color: error ? "var(--color-overdue)" : "var(--theme-text-muted)",
            }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
