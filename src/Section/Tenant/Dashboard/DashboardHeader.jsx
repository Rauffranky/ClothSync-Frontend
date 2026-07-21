import DateRangePicker from "../../../Components/UI/DateRangePicker";

const PERIOD_TABS = [
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
];

const DashboardHeader = ({
  period,
  customRange,
  onPeriod,
  onFromChange,
  onToChange,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* Title */}
      <div>
        <h1
          className="text-2xl font-black tracking-tight"
          style={{ color: "var(--theme-text-primary)" }}
        >
          Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--theme-text-muted)" }}>
          Monitor linen movement, inventory status, scanner activity, and laundry operations.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Period tabs */}
        {PERIOD_TABS.map((tab) => {
          const isActive = period === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onPeriod(tab.value)}
              className="rounded-xl border px-4 py-2 text-sm font-semibold transition-all"
              style={{
                background: isActive ? "var(--gradient-aurora-flow)" : "var(--theme-surface-strong)",
                borderColor: isActive ? "transparent" : "var(--theme-border-soft)",
                color: isActive ? "var(--button-primary-text)" : "var(--theme-text-secondary)",
                boxShadow: isActive ? "0 4px 14px rgba(20,184,166,0.25)" : "none",
              }}
            >
              {tab.label}
            </button>
          );
        })}

        {/* Date range picker */}
        <DateRangePicker
          from={customRange.from}
          to={customRange.to}
          onChange={({ from, to }) => {
            onFromChange(from);
            onToChange(to);
          }}
          placeholder="Date Range"
          disableFuture
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
