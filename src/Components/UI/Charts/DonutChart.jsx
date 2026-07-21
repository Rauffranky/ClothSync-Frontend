import { useState } from "react";

const DonutChart = ({
  ariaLabel,
  data = [],
  centerLabel = "total items",
  legendValueColor,
  size = 160,
  strokeWidth = 24,
  showLegend = true,
  emptyText = "No chart data available",
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const total = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const center = size / 2;
  const radius = Math.max((size - strokeWidth) / 2 - 6, 1);
  const circumference = 2 * Math.PI * radius;
  const activeItem = hoveredIndex === null ? null : data[hoveredIndex];

  if (!data.length || total <= 0) {
    return (
      <div className="flex min-h-44 items-center justify-center text-sm font-semibold text-(--theme-text-muted)">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
      <svg
        aria-label={ariaLabel}
        className="shrink-0"
        role="img"
        style={{ height: size, width: size }}
        viewBox={`0 0 ${size} ${size}`}
      >
        <title>{ariaLabel}</title>
        <circle
          cx={center}
          cy={center}
          fill="none"
          r={radius}
          stroke="var(--theme-surface-strong)"
          strokeWidth={strokeWidth}
        />
        {data.map((item, index) => {
          const segment = ((Number(item.value) || 0) / total) * circumference;
          const offset = data.slice(0, index).reduce(
            (sum, previous) => sum + ((Number(previous.value) || 0) / total) * circumference,
            0,
          );
          const isHovered = hoveredIndex === index;

          return (
            <circle
              key={item.label}
              cx={center}
              cy={center}
              fill="none"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              r={radius}
              stroke={item.color}
              strokeDasharray={`${Math.max(segment - 3, 0)} ${circumference - segment + 3}`}
              strokeDashoffset={-offset}
              strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
              style={{ transition: "stroke-width 150ms ease" }}
              transform={`rotate(-90 ${center} ${center})`}
            />
          );
        })}
        <text
          fill={activeItem?.color || "var(--theme-text-primary)"}
          fontSize={activeItem ? "18" : "24"}
          fontWeight="900"
          textAnchor="middle"
          x={center}
          y={center - 2}
        >
          {activeItem?.value ?? total}
        </text>
        <text
          fill="var(--theme-text-muted)"
          fontSize="9"
          textAnchor="middle"
          x={center}
          y={center + 15}
        >
          {activeItem?.centerLabel || activeItem?.label?.split(" ")[0] || centerLabel}
        </text>
      </svg>

      {showLegend && (
        <div className="w-full max-w-72 space-y-2">
          {data.map((item, index) => {
            const isHovered = hoveredIndex === index;
            return (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm transition-transform"
                  style={{ background: item.color, transform: isHovered ? "scale(1.2)" : undefined }}
                />
                <span className="flex-1 font-semibold text-(--theme-text-secondary)">{item.label}</span>
                <span
                  className="font-black"
                  style={{ color: legendValueColor || (isHovered ? item.color : "var(--theme-text-primary)") }}
                >
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DonutChart;
