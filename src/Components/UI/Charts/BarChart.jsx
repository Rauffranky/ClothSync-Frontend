import { useState } from "react";

const DEFAULT_PADDING = { top: 20, right: 20, bottom: 44, left: 45 };

const BarChart = ({
  ariaLabel,
  data = [],
  maxValue,
  ticks,
  width = 720,
  height = 260,
  minWidth = 500,
  padding = DEFAULT_PADDING,
  defaultColor = "var(--color-sky-blue)",
  showValues = false,
  emptyText = "No chart data available",
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const values = data.map((item) => Number(item.value) || 0);
  const resolvedMax = Math.max(maxValue || 0, ...values, 1);
  const resolvedTicks = ticks || Array.from({ length: 5 }, (_, index) =>
    Math.round((resolvedMax / 4) * index));
  const plotHeight = height - padding.top - padding.bottom;
  const plotWidth = width - padding.left - padding.right;
  const slotWidth = data.length ? plotWidth / data.length : plotWidth;
  const barWidth = Math.min(44, slotWidth * 0.45);

  if (data.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center text-sm font-semibold text-(--theme-text-muted)">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <svg
        aria-label={ariaLabel}
        className="w-full"
        role="img"
        style={{ minWidth }}
        viewBox={`0 0 ${width} ${height}`}
      >
        <title>{ariaLabel}</title>
        {resolvedTicks.map((tick) => {
          const y = padding.top + plotHeight - (tick / resolvedMax) * plotHeight;
          return (
            <g key={tick}>
              <line
                stroke="var(--theme-border-soft)"
                strokeDasharray="3 5"
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
              />
              <text
                fill="var(--theme-text-muted)"
                fontSize="9"
                textAnchor="end"
                x={padding.left - 9}
                y={y + 4}
              >
                {tick}
              </text>
            </g>
          );
        })}

        {data.map((item, index) => {
          const value = Number(item.value) || 0;
          const barHeight = (value / resolvedMax) * plotHeight;
          const x = padding.left + index * slotWidth + (slotWidth - barWidth) / 2;
          const y = padding.top + plotHeight - barHeight;
          const color = item.color || defaultColor;
          const isHovered = hoveredIndex === index;

          return (
            <g
              key={item.label}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <rect
                fill={color}
                height={barHeight}
                opacity={isHovered ? 1 : 0.82}
                rx="5"
                width={barWidth}
                x={x}
                y={y}
              />
              {showValues && (
                <text
                  fill={isHovered ? color : "var(--theme-text-secondary)"}
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="middle"
                  x={x + barWidth / 2}
                  y={Math.max(y - 7, 10)}
                >
                  {value}
                </text>
              )}
              <text
                fill="var(--theme-text-muted)"
                fontSize="8"
                textAnchor="middle"
                x={x + barWidth / 2}
                y={height - 19}
              >
                {item.label}
              </text>
              <rect
                fill="transparent"
                height={plotHeight}
                width={slotWidth}
                x={padding.left + index * slotWidth}
                y={padding.top}
              />
            </g>
          );
        })}

        {hoveredIndex !== null && data[hoveredIndex] && (() => {
          const item = data[hoveredIndex];
          const x = padding.left + hoveredIndex * slotWidth + slotWidth / 2;
          const value = Number(item.value) || 0;
          const y = padding.top + plotHeight - (value / resolvedMax) * plotHeight;
          return (
            <foreignObject
              height="42"
              width="126"
              x={Math.min(Math.max(x - 63, 4), width - 130)}
              y={Math.max(y - 48, 4)}
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                className="flex items-center gap-2 rounded-xl border border-(--theme-border-soft) bg-(--theme-bg) px-2.5 py-2 text-xs shadow-(--layout-panel-shadow)"
              >
                <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: item.color || defaultColor }} />
                <span className="truncate text-(--theme-text-muted)">{item.label}</span>
                <strong className="ml-auto text-(--theme-text-primary)">{value}</strong>
              </div>
            </foreignObject>
          );
        })()}
      </svg>
    </div>
  );
};

export default BarChart;
