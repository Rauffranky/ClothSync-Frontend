import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const GlobalTooltip = ({
  text,
  children,
  position = "top",
  disabled = false,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const triggerRef = useRef(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const gap = 10;

    switch (position) {
      case "bottom":
        setTooltipStyle({
          left: rect.left + rect.width / 2,
          top: rect.bottom + gap,
          transform: "translateX(-50%)",
        });
        break;
      case "left":
        setTooltipStyle({
          left: rect.left - gap,
          top: rect.top + rect.height / 2,
          transform: "translate(-100%, -50%)",
        });
        break;
      case "right":
        setTooltipStyle({
          left: rect.right + gap,
          top: rect.top + rect.height / 2,
          transform: "translateY(-50%)",
        });
        break;
      case "top":
      default:
        setTooltipStyle({
          left: rect.left + rect.width / 2,
          top: rect.top - gap,
          transform: "translate(-50%, -100%)",
        });
        break;
    }
  }, [position]);

  useEffect(() => {
    if (!isVisible) return undefined;

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isVisible, updatePosition]);

  const showTooltip = () => {
    if (disabled) return;

    updatePosition();
    setIsVisible(true);
  };

  const getArrowClasses = () => {
    switch (position) {
      case "top":
        return "-bottom-1 left-1/2 -translate-x-1/2 border-r border-b";
      case "bottom":
        return "-top-1 left-1/2 -translate-x-1/2 border-l border-t";
      case "left":
        return "-right-1 top-1/2 -translate-y-1/2 border-t border-r";
      case "right":
        return "-left-1 top-1/2 -translate-y-1/2 border-b border-l";
      default:
        return "-bottom-1 left-1/2 -translate-x-1/2 border-r border-b";
    }
  };

  if (disabled) {
    return children;
  }

  return (
    <div ref={triggerRef} className={`relative inline-block ${className}`}>
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={showTooltip}
        onBlur={() => setIsVisible(false)}
        onTouchStart={showTooltip}
        onTouchEnd={() => setIsVisible(false)}
      >
        {children}
      </div>

      {isVisible && text && createPortal(
        <div
          style={tooltipStyle}
          className={`
            fixed z-[10000] max-w-80 px-3 py-2 rounded-lg whitespace-normal break-words
            bg-(--theme-surface-strong) text-(--theme-text-primary) text-sm font-medium
            shadow-(--layout-panel-shadow) border border-(--theme-border)
            pointer-events-none
            animate-in fade-in duration-200
          `}
        >
          {text}
          <div
            className={`
              absolute w-2 h-2 bg-(--theme-surface-strong) border-(--theme-border) transform
              ${getArrowClasses()}
            `}
          />
        </div>,
        document.body,
      )}
    </div>
  );
};

export default GlobalTooltip;
