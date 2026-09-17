import { useCallback, useEffect, useRef, useState } from "react";
import {
  CircleCheck,
  CircleStop,
  CircleX,
  Info,
  LoaderCircle,
  RadioTower,
  TriangleAlert,
  X,
} from "lucide-react";
import { subscribeToast } from "../../Utils/toast";

const toastIcons = {
  success: CircleCheck,
  error: CircleX,
  warning: TriangleAlert,
  info: Info,
  loading: LoaderCircle,
  "scanner-start": RadioTower,
  "scanner-stop": CircleStop,
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
  "scanner-start": {
    color: "#14B8A6",
    background: "rgba(20, 184, 166, 0.15)",
    borderColor: "rgba(20, 184, 166, 0.45)",
    boxShadow: "0 0 16px -2px rgba(20, 184, 166, 0.45)",
  },
  "scanner-stop": {
    color: "#EF4444",
    background: "rgba(239, 68, 68, 0.15)",
    borderColor: "rgba(239, 68, 68, 0.45)",
    boxShadow: "0 0 16px -2px rgba(239, 68, 68, 0.45)",
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
        className={
          type === "loading"
            ? "animate-spin"
            : type === "scanner-start"
            ? "animate-pulse"
            : ""
        }
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

  const [now, setNow] = useState(() => Date.now());

  const isScannerStart = item.type === "scanner-start";
  const isScannerStop = item.type === "scanner-stop";

  useEffect(() => {
    if (
      (!isScannerStart && !isScannerStop) ||
      !item.startTime ||
      item.isFinal
    ) {
      return undefined;
    }
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [item.type, item.startTime, item.isFinal, isScannerStart, isScannerStop]);

  const elapsedSec = item.startTime
    ? Math.max(0, Math.floor((now - new Date(item.startTime).getTime()) / 1000))
    : 0;

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

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
    }, remainingRef.current || item.duration);
  }, [clearTimer, item.duration, item.exiting, item.id, onClose]);

  const handleMouseEnter = () => {
    if (item.duration <= 0 || item.exiting) return;

    clearTimer();
    remainingRef.current = Math.max(
      0,
      (remainingRef.current || item.duration) - (Date.now() - startedAtRef.current),
    );
  };

  const handleMouseLeave = () => {
    startTimer();
  };

  useEffect(() => {
    remainingRef.current = item.duration;
    startTimer();
    return clearTimer;
  }, [clearTimer, startTimer, item.duration]);

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
        borderColor: isScannerStart
          ? "rgba(20, 184, 166, 0.45)"
          : isScannerStop
          ? "rgba(239, 68, 68, 0.45)"
          : "var(--toast-border)",
        boxShadow: isScannerStart
          ? "0 10px 30px -8px rgba(20, 184, 166, 0.4), 0 0 1px 1px rgba(14, 165, 233, 0.2)"
          : isScannerStop
          ? "0 10px 30px -8px rgba(239, 68, 68, 0.4), 0 0 1px 1px rgba(220, 38, 38, 0.2)"
          : undefined,
      }}
    >
      <ToastIcon type={item.type} />

      <div>
        <div className="flex items-center gap-2">
          <p className="m-0 text-[12px] font-bold leading-tight text-(--theme-text-primary)">
            {item.message}
          </p>
          {isScannerStart && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#14B8A6]/20 px-2 py-0.5 text-[10px] font-mono font-black text-[#14B8A6] border border-[#14B8A6]/40 shadow-[0_0_10px_rgba(20,184,166,0.3)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#14B8A6] animate-pulse" />
              {formatDuration(elapsedSec)}
            </span>
          )}
          {isScannerStop && (
            item.isFinal ? (
              item.totalDuration && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#EF4444]/20 px-2 py-0.5 text-[10px] font-mono font-black text-[#EF4444] border border-[#EF4444]/40 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                  {item.totalDuration}
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EF4444]/20 px-2 py-0.5 text-[10px] font-mono font-black text-[#EF4444] border border-[#EF4444]/40 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444] animate-pulse" />
                {formatDuration(elapsedSec)}
              </span>
            )
          )}
        </div>
        {item.description && (
          <p className="mt-1 mb-0 text-[10px] font-medium leading-tight text-(--theme-text-secondary)">
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

      setItems((currentItems) => {
        const existingIndex = currentItems.findIndex((item) => item.id === payload.id);
        if (existingIndex >= 0) {
          const next = [...currentItems];
          next[existingIndex] = { ...next[existingIndex], ...payload, exiting: false };
          return next;
        }
        return [...currentItems, payload].slice(-4);
      });
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
