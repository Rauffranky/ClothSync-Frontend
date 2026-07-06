import { useCallback, useEffect, useRef, useState } from "react";
import { CircleCheck, CircleX, Info, LoaderCircle, TriangleAlert, X } from "lucide-react";
import { subscribeToast } from "../../Utils/toast";

const toastIcons = {
  success: CircleCheck,
  error: CircleX,
  warning: TriangleAlert,
  info: Info,
  loading: LoaderCircle,
};

const toastIconVariants = {
  success: {
    color: "var(--color-ready)",
    background: "var(--toast-success-icon-bg)",
    borderColor: "var(--toast-success-icon-border)",
    boxShadow: "var(--toast-success-icon-shadow)",
  },
  error: {
    color: "var(--color-overdue)",
    background: "var(--toast-error-icon-bg)",
    borderColor: "var(--toast-error-icon-border)",
    boxShadow: "var(--toast-error-icon-shadow)",
  },
  warning: {
    color: "var(--color-pending)",
    background: "var(--toast-warning-icon-bg)",
    borderColor: "var(--toast-warning-icon-border)",
    boxShadow: "var(--toast-warning-icon-shadow)",
  },
  info: {
    color: "var(--color-sky-blue)",
    background: "var(--toast-info-icon-bg)",
    borderColor: "var(--toast-info-icon-border)",
    boxShadow: "var(--toast-info-icon-shadow)",
  },
  loading: {
    color: "var(--color-aurora-teal)",
    background: "var(--toast-default-icon-bg)",
    borderColor: "var(--toast-default-icon-border)",
    boxShadow: "var(--toast-default-icon-shadow)",
  },
};

function ToastIcon({ type }) {
  const Icon = toastIcons[type] || toastIcons.info;
  const iconStyle = toastIconVariants[type] || toastIconVariants.info;

  return (
    <span
      aria-hidden="true"
      className="grid h-8 w-8 place-items-center rounded-full border"
      style={iconStyle}
    >
      <Icon
        className={type === "loading" ? "animate-spin" : ""}
        size={20}
        strokeWidth={2.2}
      />
    </span>
  );
}

const Toast = ({ item, onClose }) => {
  const timerRef = useRef(null);
  const startedAtRef = useRef(0);
  const remainingRef = useRef(item.duration);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (item.duration <= 0 || item.exiting) return;

    clearTimer();
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onClose(item.id);
    }, remainingRef.current);
  }, [clearTimer, item.duration, item.exiting, item.id, onClose]);

  const handleMouseEnter = () => {
    if (item.duration <= 0 || item.exiting) return;

    clearTimer();
    remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current));
  };

  const handleMouseLeave = () => {
    startTimer();
  };

  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [clearTimer, startTimer]);

  return (
    <div
      className={[
        "pointer-events-auto grid min-h-12 max-h-30 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3.5 overflow-hidden rounded-[18px] border px-4 py-2.5 text-(--theme-text-primary) shadow-(--toast-shadow) backdrop-blur-[18px] backdrop-saturate-150 transition-[max-height,opacity,padding,border-width,transform,box-shadow] duration-200 ease-out will-change-[transform,opacity]",
        "animate-[toast-enter_260ms_cubic-bezier(0.16,1,0.3,1)]",
        item.exiting
          ? "max-h-0 -translate-y-2 scale-[0.98] border-0 py-0 opacity-0"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="status"
      style={{
        background: "var(--toast-bg)",
        borderColor: "var(--toast-border)",
      }}
    >
      <ToastIcon type={item.type} />

      <div>
        <p className="m-0 text--[12px] font-semibold leading-tight text-(--theme-text-primary)">
          {item.message}
        </p>
        {item.description && (
          <p className="mt-1 mb-0 text-[10px] font-semibold leading-tight text-(--theme-text-secondary)">
            {item.description}
          </p>
        )}
      </div>

      <button
        className="grid h-6.5 w-6.5 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-(--theme-text-secondary) hover:bg-slate-400/10 hover:text-(--theme-text-primary)"
        onClick={() => onClose(item.id)}
        type="button"
        aria-label="Close toast"
      >
        <X size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
};

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const handleClose = useCallback((id) => {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, exiting: true } : item)),
    );

    setTimeout(() => {
      setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    }, 240);
  }, []);

  useEffect(() => {
    const listener = (payload) => {
      if (payload.dismiss) {
        handleClose(payload.id);
        return;
      }

      setItems((currentItems) => [...currentItems, payload].slice(-4));
    };

    return subscribeToast(listener);
  }, [handleClose]);

  return (
    <>
      {children}
      <div className="pointer-events-none fixed top-6 left-1/2 z-9999 flex w-[min(460px,calc(100vw-32px))] -translate-x-1/2 flex-col gap-3">
        {items.map((item) => (
          <Toast
            item={item}
            key={item.id}
            onClose={handleClose}
          />
        ))}
      </div>
    </>
  );
}

export default Toast;
