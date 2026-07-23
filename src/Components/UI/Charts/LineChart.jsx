import { useId, useState } from "react";

const DEFAULT_PADDING = { top: 20, right: 20, bottom: 36, left: 45 };

const getPoints = (values, maxValue, width, height, padding) => {
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const step = values.length > 1 ? plotWidth / (values.length - 1) : 0;

  return values.map((value, index) => ({
    x: padding.left + index * step,
    y: padding.top + plotHeight - (value / maxValue) * plotHeight,
  }));
};

const getPath = (points, smooth) =>
  points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    if (!smooth) return `${path} L ${point.x} ${point.y}`;

    const previous = points[index - 1];
    const controlX = (previous.x + point.x) / 2;
    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, "");

const getY = (value, maxValue, height, padding) => {
  const plotHeight = height - padding.top - padding.bottom;
  return padding.top + plotHeight - (value / maxValue) * plotHeight;
};

const LineChart = ({
  ariaLabel,
  labels = [],
  series = [],
  maxValue,
  ticks,
  width = 720,
  height = 260,
  minWidth = 500,
  padding = DEFAULT_PADDING,
  smooth = true,
  showLegend = true,
  showTooltip = true,
  emptyText = "No chart data available",
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const rawId = useId();
  const chartId = rawId.replace(/:/g, "");
  const values = series.flatMap((item) => item.values || []);
  const resolvedMax = Math.max(maxValue || 0, ...values, 1);
  const resolvedTicks = ticks || Array.from({ length: 5 }, (_, index) =>
    Math.round((resolvedMax / 4) * index));
  const plottedSeries = series.map((item) => {
    const points = getPoints(item.values || [], resolvedMax, width, height, padding);
    return { ...item, points, path: getPath(points, smooth) };
  });
  const firstPoints = plottedSeries[0]?.points || [];
  const plotWidth = width - padding.left - padding.right;
  const hitWidth = labels.length > 1 ? plotWidth / (labels.length - 1) : plotWidth;
  const baseY = getY(0, resolvedMax, height, padding);
  const hasData = labels.length > 0 && plottedSeries.some((item) => item.points.length > 0);

  if (!hasData) {
    return (
      <div className="flex min-h-48 items-center justify-center text-sm font-semibold text-(--theme-text-muted)">
        {emptyText}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          aria-label={ariaLabel}
          className="w-full"
          role="img"
          style={{ minWidth }}
          viewBox={`0 0 ${width} ${height}`}
        >
          <title>{ariaLabel}</title>
          <defs>
            {plottedSeries.map((item, index) => item.fill && (
              <linearGradient
                id={`${chartId}-area-${index}`}
                key={item.label}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor={item.color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={item.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {resolvedTicks.map((tick) => {
            const y = getY(tick, resolvedMax, height, padding);
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

          {plottedSeries.map((item, seriesIndex) => (
            <g key={item.label}>
              {item.fill && item.points.length > 0 && (
                <path
                  d={`${item.path} L ${item.points.at(-1).x} ${baseY} L ${item.points[0].x} ${baseY} Z`}
                  fill={`url(#${chartId}-area-${seriesIndex})`}
                />
              )}
              <path
                d={item.path}
                fill="none"
                stroke={item.color}
                strokeDasharray={item.dashArray}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={item.strokeWidth || 2}
              />
              {(item.showPoints || hoveredIndex !== null) && item.points.map((point, index) => (
                <circle
                  key={`${item.label}-${labels[index]}`}
                  cx={point.x}
                  cy={point.y}
                  fill={item.color}
                  r={hoveredIndex === index ? 4 : 2}
                  stroke="var(--theme-surface)"
                  strokeWidth="2"
                />
              ))}
            </g>
          ))}

          {firstPoints.map((point, index) => (
            <g key={labels[index]}>
              <rect
                fill="transparent"
                height={height - padding.top - padding.bottom}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                width={hitWidth}
                x={Math.max(padding.left, point.x - hitWidth / 2)}
                y={padding.top}
              />
              <text
                fill="var(--theme-text-muted)"
                fontSize="9"
                textAnchor="middle"
                x={point.x}
                y={height - 10}
              >
                {labels[index]}
              </text>
            </g>
          ))}

          {showTooltip && hoveredIndex !== null && firstPoints[hoveredIndex] && (
            <foreignObject
              height={28 + plottedSeries.length * 18}
              width="132"
              x={Math.min(Math.max(firstPoints[hoveredIndex].x - 66, 4), width - 136)}
              y={Math.max(
                Math.min(...plottedSeries.map((item) => item.points[hoveredIndex]?.y ?? height)) - 74,
                4,
              )}
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                className="rounded-xl border border-(--theme-border-soft) bg-(--theme-bg) px-2.5 py-2 text-xs shadow-(--layout-panel-shadow)"
              >
                <p className="mb-1 font-black text-(--theme-text-primary)">{labels[hoveredIndex]}</p>
                {plottedSeries.map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5 text-(--theme-text-muted)">
                    <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                    <span className="flex-1">{item.label}</span>
                    <strong className="text-(--theme-text-primary)">{item.values[hoveredIndex]}</strong>
                  </div>
                ))}
              </div>
            </foreignObject>
          )}
        </svg>
      </div>

      {showLegend && (
        <div className="mt-2 flex flex-wrap gap-4" aria-hidden="true">
          {series.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs font-semibold text-(--theme-text-muted)">
              <span className="h-0.5 w-5 rounded-full" style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LineChart;
