import { useState } from "react";
import Card from "../../../Components/UI/Card";

// ─── Wash Cycle Bar Chart ──────────────────────────────────────────────────────
const barData = [
  { label: "< 24h", value: 95, color: "var(--color-sky-blue)" },
  { label: "24–48h", value: 195, color: "var(--color-sky-blue)" },
  { label: "48–72h", value: 60, color: "var(--color-pending)" },
  { label: "> 72h", value: 30, color: "var(--color-overdue)" },
];

const maxBar = Math.max(...barData.map((d) => d.value));

const WashCycleSummary = () => {
  const [hoveredBar, setHoveredBar] = useState(null);

  return (
    <Card padding="20px 24px">
      <h2 className="text-base font-black" style={{ color: "var(--theme-text-primary)" }}>
        Wash Cycle Summary
      </h2>
      <p className="mt-0.5 mb-4 text-xs" style={{ color: "var(--theme-text-muted)" }}>
        Distribution by turnaround time — last 30 days
      </p>

      <div className="flex items-end gap-4" style={{ height: "140px" }}>
        {barData.map((bar, i) => {
          const heightPct = (bar.value / maxBar) * 100;
          const isHovered = hoveredBar === i;

          return (
            <div
              key={bar.label}
              className="relative flex flex-1 flex-col items-center gap-2"
              onMouseEnter={() => setHoveredBar(i)}
              onMouseLeave={() => setHoveredBar(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Tooltip */}
              {isHovered && (
                <div
                  style={{
                    position: "absolute",
                    top: "-44px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "var(--theme-bg)",
                    border: "1px solid var(--theme-border-soft)",
                    borderRadius: "8px",
                    padding: "5px 10px",
                    whiteSpace: "nowrap",
                    zIndex: 10,
                    boxShadow: "var(--layout-panel-shadow)",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--theme-text-primary)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "2px",
                        background: bar.color,
                        flexShrink: 0,
                      }}
                    />
                    {bar.label}: <strong>{bar.value}</strong>
                  </div>
                </div>
              )}

              <span
                className="text-xs font-bold"
                style={{
                  color: isHovered ? bar.color : "var(--theme-text-secondary)",
                  transition: "color 0.15s",
                }}
              >
                {bar.value}
              </span>

              <div className="flex w-full flex-col-reverse" style={{ height: "100px" }}>
                <div
                  className="w-full rounded-t-lg"
                  style={{
                    height: `${heightPct}%`,
                    background: bar.color,
                    opacity: isHovered ? 1 : 0.75,
                    transform: isHovered ? "scaleY(1.04)" : "scaleY(1)",
                    transformOrigin: "bottom",
                    transition: "opacity 0.15s, transform 0.15s",
                    boxShadow: isHovered ? `0 0 16px ${bar.color}60` : "none",
                  }}
                />
              </div>

              <span
                className="text-center text-xs font-semibold"
                style={{
                  color: isHovered ? "var(--theme-text-primary)" : "var(--theme-text-muted)",
                  transition: "color 0.15s",
                }}
              >
                {bar.label}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ─── Laundry-wise Donut Chart ──────────────────────────────────────────────────
const donutData = [
  { label: "PureWash Industrial", value: 312, color: "var(--color-sky-blue)" },
  { label: "CleanFlow Solutions", value: 175, color: "var(--color-aqua-mist)" },
  { label: "Metro Linen Services", value: 98, color: "var(--color-seafoam)" },
  { label: "Others", value: 34, color: "var(--color-blue-gray)" },
];

const totalDonut = donutData.reduce((s, d) => s + d.value, 0);

const DonutChart = ({ hoveredSlice, onHover }) => {
  const R = 52;
  const CX = 70;
  const CY = 70;
  const circumference = 2 * Math.PI * R;
  let offset = 0;

  const slices = donutData.map((slice, i) => {
    const dash = (slice.value / totalDonut) * circumference;
    const gap = circumference - dash;
    const el = (
      <circle
        key={slice.label}
        cx={CX}
        cy={CY}
        r={hoveredSlice === i ? R + 3 : R}
        fill="none"
        stroke={slice.color}
        strokeWidth={hoveredSlice === i ? 26 : 22}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        transform="rotate(-90)"
        style={{
          transformOrigin: `${CX}px ${CY}px`,
          transition: "r 0.15s, stroke-width 0.15s",
          cursor: "pointer",
          filter: hoveredSlice === i ? `drop-shadow(0 0 6px ${slice.color}90)` : "none",
        }}
        onMouseEnter={() => onHover(i)}
        onMouseLeave={() => onHover(null)}
      />
    );
    offset += dash;
    return el;
  });

  const active = hoveredSlice !== null ? donutData[hoveredSlice] : null;

  return (
    <svg viewBox="0 0 140 140" style={{ width: "140px", height: "140px" }}>
      {slices}
      {/* Center label — changes on hover */}
      <text
        x={CX} y={CY - 8}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={active ? "12" : "16"}
        fontWeight="900"
        fill={active ? active.color : "var(--theme-text-primary)"}
        style={{ transition: "font-size 0.15s" }}
      >
        {active ? active.value : totalDonut}
      </text>
      <text
        x={CX} y={CY + 10}
        textAnchor="middle"
        fontSize="7.5"
        fill="var(--theme-text-muted)"
      >
        {active ? active.label.split(" ")[0] : "total items"}
      </text>
    </svg>
  );
};

const LaundryDistributionChart = () => {
  const [hoveredSlice, setHoveredSlice] = useState(null);

  return (
    <Card padding="20px 24px">
      <h2 className="text-base font-black" style={{ color: "var(--theme-text-primary)" }}>
        Laundry-wise Distribution
      </h2>
      <p className="mt-0.5 mb-4 text-xs" style={{ color: "var(--theme-text-muted)" }}>
        Items currently sent per laundry partner
      </p>

      <div className="flex flex-wrap items-center gap-6">
        <DonutChart hoveredSlice={hoveredSlice} onHover={setHoveredSlice} />
        <div className="flex flex-col gap-2">
          {donutData.map((item, i) => {
            const isHovered = hoveredSlice === i;
            return (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors"
                style={{
                  background: isHovered ? `${item.color}14` : "transparent",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHoveredSlice(i)}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{
                    background: item.color,
                    transform: isHovered ? "scale(1.3)" : "scale(1)",
                    transition: "transform 0.15s",
                  }}
                />
                <span
                  className="text-xs font-semibold"
                  style={{
                    color: isHovered ? "var(--theme-text-primary)" : "var(--theme-text-secondary)",
                    transition: "color 0.15s",
                  }}
                >
                  {item.label}
                </span>
                <span
                  className="ml-auto text-xs font-black"
                  style={{
                    color: isHovered ? item.color : "var(--theme-text-primary)",
                    transition: "color 0.15s",
                  }}
                >
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

// ─── Combined row export ───────────────────────────────────────────────────────
const BottomChartsRow = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <WashCycleSummary />
    <LaundryDistributionChart />
  </div>
);

export default BottomChartsRow;
