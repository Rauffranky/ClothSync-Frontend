import { useEffect, useRef } from "react";
import { ShieldCheck } from "lucide-react";

const OtpInput = ({
  value = "",
  onChange,
  length = 6,
  label = "OTP",
  error = false,
  helperText = "",
  autoFocus = false,
  size = "md",
  onBlur,
}) => {
  const inputRefs = useRef([]);
  const boxHeight = size === "lg" ? "h-14" : "h-12";
  const textSize = size === "lg" ? "text-xl" : "text-lg";

  useEffect(() => {
    if (!autoFocus) return;
    window.setTimeout(() => inputRefs.current[0]?.focus(), 0);
  }, [autoFocus]);

  const setOtpValue = (nextValue) => {
    onChange?.(nextValue.slice(0, length));
  };

  const handleChange = (index, nextValue) => {
    const digits = nextValue.replace(/\D/g, "");
    const currentOtp = value.padEnd(length, " ").split("");

    if (digits.length > 1) {
      digits
        .slice(0, length - index)
        .split("")
        .forEach((digit, digitIndex) => {
          currentOtp[index + digitIndex] = digit;
        });
      setOtpValue(currentOtp.join("").replace(/\s/g, ""));
      inputRefs.current[Math.min(index + digits.length, length - 1)]?.focus();
      return;
    }

    currentOtp[index] = digits;
    setOtpValue(currentOtp.join("").replace(/\s/g, ""));

    if (digits && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index, event) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length - index);
    if (!pastedDigits) return;

    const currentOtp = value.padEnd(length, " ").split("");
    pastedDigits.split("").forEach((digit, digitIndex) => {
      currentOtp[index + digitIndex] = digit;
    });
    setOtpValue(currentOtp.join("").replace(/\s/g, ""));
    inputRefs.current[Math.min(index + pastedDigits.length, length - 1)]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key !== "Backspace" || value[index]) return;
    inputRefs.current[index - 1]?.focus();
  };

  return (
    <div>
      {label && (
        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-(--theme-text-secondary)">
          <ShieldCheck size={18} />
          {label} <span className="text-(--color-overdue)">*</span>
        </label>
      )}

      <div className="grid grid-cols-6 gap-2 sm:gap-3">
        {Array.from({ length }).map((_, index) => (
          <input
            aria-label={`${label || "OTP"} digit ${index + 1}`}
            className={`${boxHeight} ${textSize} min-w-0 rounded-xl border bg-transparent text-center font-black outline-none transition-all duration-200`}
            inputMode="numeric"
            key={index}
            maxLength={1}
            onBlur={onBlur}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={(event) => handlePaste(index, event)}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            style={{
              color: "var(--theme-text-primary)",
              background:
                "linear-gradient(145deg, var(--theme-surface-strong), var(--theme-surface))",
              borderColor: error
                ? "rgba(239, 68, 68, 0.55)"
                : "var(--theme-border-soft)",
              boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.18)",
            }}
            type="text"
            value={value[index] || ""}
          />
        ))}
      </div>

      {helperText && (
        <p className="mt-1.5 text-xs text-(--color-overdue)">{helperText}</p>
      )}
    </div>
  );
};

export default OtpInput;
