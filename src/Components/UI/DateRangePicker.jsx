import { useEffect, useRef, useState } from "react";
import { CalendarRange, ChevronLeft, ChevronRight, X } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const toDateKey = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const parseKey = (key) => {
  if (!key) return null;
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const isBefore = (a, b) => a && b && parseKey(a) < parseKey(b);
const isAfter = (a, b) => a && b && parseKey(a) > parseKey(b);

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDay = (year, month) => new Date(year, month, 1).getDay();

const getTodayKey = () => {
  const t = new Date();
  return toDateKey(t.getFullYear(), t.getMonth(), t.getDate());
};

const formatDisplay = (key) => {
  if (!key) return "";
  const d = parseKey(key);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// ─── Single Calendar Month ─────────────────────────────────────────────────────
const CalendarMonth = ({ year, month, from, to, hovering, onDayClick, onDayHover, disableFuture, disablePast }) => {
  const todayKey = getTodayKey();
  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const cells = [];

  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const rangeEnd = hovering || to;
  const isDisabled = (key) =>
    (disableFuture && key > todayKey) ||
    (disablePast && key < todayKey);

  return (
    <div style={{ minWidth: "224px" }}>
      {/* Month label */}
      <p
        className="mb-3 text-center text-sm font-black"
        style={{ color: "var(--theme-text-primary)" }}
      >
        {MONTHS[month]} {year}
      </p>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-bold py-1"
            style={{ color: "var(--theme-text-muted)" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;

          const key = toDateKey(year, month, day);
          const disabled = isDisabled(key);
          const isFrom = key === from && !disabled;
          const isTo = key === to;
          const isStart = isFrom;
          const isEnd = isTo;

          // in range highlight
          const inRange =
            from &&
            rangeEnd &&
            !isBefore(rangeEnd, from) &&
            key > from &&
            key < rangeEnd;

          const isToday = !disabled &&
            key ===
            toDateKey(
              new Date().getFullYear(),
              new Date().getMonth(),
              new Date().getDate()
            );

          let bg = "transparent";
          let color = "var(--theme-text-primary)";
          let borderRadius = "10px";

          if (isStart || isEnd) {
            bg = "var(--gradient-aurora-flow)";
            color = "var(--button-primary-text)";
          } else if (inRange) {
            bg = "rgba(20,184,166,0.12)";
            borderRadius = "0px";
          }

          if (isStart && rangeEnd && from !== rangeEnd) borderRadius = "10px 0 0 10px";
          if (isEnd && from && from !== to) borderRadius = "0 10px 10px 0";

          return (
            <div
              key={key}
              onClick={() => !disabled && onDayClick(key)}
              onMouseEnter={() => !disabled && onDayHover(key)}
              className="flex h-8 items-center justify-center text-xs font-semibold select-none transition-all"
              style={{
                background: disabled ? "transparent" : bg,
                color: disabled ? "var(--theme-text-muted)" : color,
                borderRadius,
                opacity: disabled ? 0.35 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
                outline: isToday && !isStart && !isEnd ? "1.5px solid var(--color-aurora-teal)" : "none",
                outlineOffset: "-1px",
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main DateRangePicker ──────────────────────────────────────────────────────
/**
 * DateRangePicker — Global reusable component
 *
 * Props:
 *   from          – "YYYY-MM-DD" | ""
 *   to            – "YYYY-MM-DD" | ""
 *   onChange      – ({ from, to }) => void
 *   placeholder   – string (optional)
 *   disableFuture – boolean — if true, dates after today are unselectable
 *   disablePast   – boolean — if true, dates before today are unselectable
 */
const DateRangePicker = ({
  from = "",
  to = "",
  onChange,
  placeholder = "Select date range",
  disableFuture = false,
  disablePast = false,
  className = "",
}) => {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selecting, setSelecting] = useState("from"); // "from" | "to"
  const [hovering, setHovering] = useState("");
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setHovering("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Second month
  const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;

  const prevMonthView = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonthView = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const handleDayClick = (key) => {
    if (selecting === "from") {
      onChange({ from: key, to: "" });
      setSelecting("to");
    } else {
      if (isBefore(key, from)) {
        // clicked before start → swap
        onChange({ from: key, to: from });
      } else {
        onChange({ from, to: key });
      }
      setSelecting("from");
      setOpen(false);
      setHovering("");
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ from: "", to: "" });
    setSelecting("from");
  };

  const hasRange = from || to;

  const label = from && to
    ? `${formatDisplay(from)} → ${formatDisplay(to)}`
    : from
      ? `${formatDisplay(from)} → pick end`
      : placeholder;

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSelecting("from"); }}
        className={`flex items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-all ${className || "py-2"}`}
        style={{
          background: hasRange ? "rgba(20,184,166,0.08)" : "var(--theme-surface-strong)",
          borderColor: open || hasRange ? "var(--color-aurora-teal)" : "var(--theme-border-soft)",
          color: hasRange ? "var(--theme-text-primary)" : "var(--theme-text-muted)",
          whiteSpace: "nowrap",
          minWidth: "220px",
        }}
      >
        <CalendarRange
          size={15}
          style={{ color: hasRange ? "var(--color-aurora-teal)" : "var(--theme-text-muted)", flexShrink: 0 }}
        />
        <span className="flex-1 text-left text-xs truncate">{label}</span>
        {hasRange && (
          <span
            onClick={handleClear}
            className="ml-1 flex items-center justify-center rounded-md p-0.5 transition-colors hover:bg-[rgba(239,68,68,0.15)]"
            style={{ color: "var(--theme-text-muted)" }}
          >
            <X size={12} />
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute z-50 mt-2"
          style={{
            right: 0,
            background: "var(--theme-bg)",
            border: "1px solid var(--theme-border-soft)",
            borderRadius: "18px",
            boxShadow: "var(--layout-panel-shadow)",
            padding: "20px",
          }}
          onMouseLeave={() => setHovering("")}
        >
          {/* Header nav */}
          <div className="mb-4 flex items-center justify-between gap-6">
            <button
              type="button"
              onClick={prevMonthView}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--button-secondary-bg)]"
              style={{ color: "var(--theme-text-secondary)" }}
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-8">
              <span className="text-xs font-bold" style={{ color: "var(--theme-text-muted)" }}>
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <span className="text-xs font-bold" style={{ color: "var(--theme-text-muted)" }}>
                {MONTHS[nextMonth]} {nextYear}
              </span>
            </div>

            <button
              type="button"
              onClick={nextMonthView}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--button-secondary-bg)]"
              style={{ color: "var(--theme-text-secondary)" }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Two calendars side by side */}
          <div className="flex gap-6">
            <CalendarMonth
              year={viewYear}
              month={viewMonth}
              from={from}
              to={to}
              hovering={hovering}
              onDayClick={handleDayClick}
              onDayHover={setHovering}
              disableFuture={disableFuture}
              disablePast={disablePast}
            />
            <div style={{ width: "1px", background: "var(--theme-border-soft)" }} />
            <CalendarMonth
              year={nextYear}
              month={nextMonth}
              from={from}
              to={to}
              hovering={hovering}
              onDayClick={handleDayClick}
              onDayHover={setHovering}
              disableFuture={disableFuture}
              disablePast={disablePast}
            />
          </div>

          {/* Footer hint */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs" style={{ color: "var(--theme-text-muted)" }}>
              {selecting === "from" ? "Click to select start date" : "Click to select end date"}
            </p>
            {from && to && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-1.5 text-xs font-bold transition-all"
                style={{
                  background: "var(--gradient-aurora-flow)",
                  color: "var(--button-primary-text)",
                }}
              >
                Apply
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
