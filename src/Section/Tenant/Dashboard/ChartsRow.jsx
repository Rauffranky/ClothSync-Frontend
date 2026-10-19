import { useState, useId, useMemo } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Info,
  RotateCcw,
  Send,
  TrendingUp,
} from "lucide-react";
import Card from "../../../Components/UI/Card";
import { useDashboardData } from "./DashboardContext";

const SVG_WIDTH = 860;
const SVG_HEIGHT = 270;
const PADDING = { top: 28, right: 35, bottom: 48, left: 58 };
const INNER_MARGIN = 36; // Horizontal breathing room so day 0 never collides with Y-axis

const getCubicPath = (points) => {
  if (!points || points.length === 0) return "";
  return points.reduce((path, pt, index) => {
    if (index === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[index - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp2x = cp1x;
    return `${path} C ${cp1x} ${prev.y}, ${cp2x} ${pt.y}, ${pt.x} ${pt.y}`;
  }, "");
};

const ChartsRow = () => {
  const chartId = useId().replace(/:/g, "");
  const [viewMode, setViewMode] = useState("area"); // "area" | "bar"
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const data = useDashboardData();

  // Normalize points with fallback for 7 days
  const points = useMemo(() => {
    const raw = Array.isArray(data?.charts?.sentReturned)
      ? data.charts.sentReturned
      : [];
    if (raw.length > 0) return raw;
    const defaultLabels = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
    return defaultLabels.map((label) => ({ label, sent: 0, returned: 0 }));
  }, [data]);

  // Aggregate stats
  const totals = useMemo(() => {
    const sent = points.reduce((acc, p) => acc + (Number(p.sent) || 0), 0);
    const returned = points.reduce(
      (acc, p) => acc + (Number(p.returned) || 0),
      0,
    );
    const rate = sent > 0 ? Math.round((returned / sent) * 100) : 0;
    const diff = sent - returned;
    return { sent, returned, rate, diff };
  }, [points]);

  // Y-axis scaling
  const { resolvedMax, ticks } = useMemo(() => {
    const allValues = points.flatMap((p) => [
      Number(p.sent) || 0,
      Number(p.returned) || 0,
    ]);
    const maxVal = Math.max(...allValues, 0);

    // If all values are 0, use 80 as a balanced reference max so gridlines are visible and balanced
    let resolved = 80;
    if (maxVal > 0) {
      const step = Math.pow(10, Math.floor(Math.log10(maxVal)));
      resolved = Math.ceil((maxVal * 1.25) / step) * step;
      if (resolved < 10) resolved = 10;
    }

    const calculatedTicks = [0, 1, 2, 3, 4].map((step) =>
      Math.round((resolved / 4) * step),
    );

    return { resolvedMax: resolved, ticks: calculatedTicks };
  }, [points]);

  // Plot dimensions
  const plotWidth = SVG_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = SVG_HEIGHT - PADDING.top - PADDING.bottom;
  const baseY = PADDING.top + plotHeight;

  // Space days cleanly between inner margins
  const effectiveWidth = Math.max(plotWidth - INNER_MARGIN * 2, 100);
  const stepX =
    points.length > 1 ? effectiveWidth / (points.length - 1) : effectiveWidth;

  const sentPoints = useMemo(() => {
    return points.map((p, idx) => ({
      x: PADDING.left + INNER_MARGIN + idx * stepX,
      y:
        PADDING.top +
        plotHeight -
        ((Number(p.sent) || 0) / resolvedMax) * plotHeight,
      value: Number(p.sent) || 0,
      label: p.label,
    }));
  }, [points, stepX, plotHeight, resolvedMax]);

  const returnedPoints = useMemo(() => {
    return points.map((p, idx) => ({
      x: PADDING.left + INNER_MARGIN + idx * stepX,
      y:
        PADDING.top +
        plotHeight -
        ((Number(p.returned) || 0) / resolvedMax) * plotHeight,
      value: Number(p.returned) || 0,
      label: p.label,
    }));
  }, [points, stepX, plotHeight, resolvedMax]);

  const sentPath = useMemo(() => getCubicPath(sentPoints), [sentPoints]);
  const returnedPath = useMemo(
    () => getCubicPath(returnedPoints),
    [returnedPoints],
  );

  const isAllZero = totals.sent === 0 && totals.returned === 0;

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card
        as="section"
        className="overflow-hidden border border-(--theme-border) bg-(--theme-surface) shadow-(--layout-panel-shadow)"
        padding="20px 24px"
      >
        {/* Top Header with KPIs and Controls */}
        <div className="flex flex-col gap-4 border-b border-(--theme-border-soft) pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-(--color-aurora-teal)/10 text-(--color-aurora-teal)">
              <TrendingUp size={22} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="m-0 text-lg font-bold text-(--theme-text-primary)">
                  Sent vs Returned Trends
                </h2>
                <span className="rounded-full bg-(--theme-surface-strong) px-2.5 py-0.5 text-[11px] font-bold text-(--theme-text-muted)">
                  Last 7 Days
                </span>
              </div>
              <p className="m-0 mt-0.5 text-xs text-(--theme-text-muted)">
                Daily volume comparison between outbound dispatches to laundry
                and returned clean batches.
              </p>
            </div>
          </div>

          {/* Quick Metrics & View Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Dispatched Metric */}
            <div className="flex items-center gap-2 rounded-xl border border-(--color-sky-blue)/20 bg-(--color-sky-blue)/5 px-3 py-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-(--color-sky-blue)/15 text-(--color-sky-blue)">
                <Send size={13} />
              </span>
              <div>
                <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-(--theme-text-muted)">
                  Sent
                </p>
                <p className="m-0 text-sm font-extrabold text-(--color-sky-blue)">
                  {totals.sent.toLocaleString()}{" "}
                  <span className="text-[10px] font-normal text-(--theme-text-muted)">
                    items
                  </span>
                </p>
              </div>
            </div>

            {/* Returned Metric */}
            <div className="flex items-center gap-2 rounded-xl border border-(--color-seafoam)/20 bg-(--color-seafoam)/5 px-3 py-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-(--color-seafoam)/15 text-(--color-seafoam)">
                <RotateCcw size={13} />
              </span>
              <div>
                <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-(--theme-text-muted)">
                  Returned
                </p>
                <p className="m-0 text-sm font-extrabold text-(--color-seafoam)">
                  {totals.returned.toLocaleString()}{" "}
                  <span className="text-[10px] font-normal text-(--theme-text-muted)">
                    items
                  </span>
                </p>
              </div>
            </div>

            {/* Efficiency Ratio Pill */}
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-(--theme-border) bg-(--theme-surface-strong) px-3 py-1.5">
              <div>
                <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-(--theme-text-muted)">
                  Return Rate
                </p>
                <p className="m-0 text-sm font-extrabold text-(--theme-text-primary)">
                  {totals.sent > 0 ? `${totals.rate}%` : "—"}
                </p>
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl border border-(--theme-border) bg-(--theme-surface-strong) p-1">
              <button
                type="button"
                onClick={() => setViewMode("area")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  viewMode === "area"
                    ? "bg-(--theme-surface) text-(--color-aurora-teal) shadow-sm"
                    : "text-(--theme-text-muted) hover:text-(--theme-text-primary)"
                }`}
                title="Spline Area Trend"
              >
                <Activity size={13} />
                <span>Area</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("bar")}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  viewMode === "bar"
                    ? "bg-(--theme-surface) text-(--color-aurora-teal) shadow-sm"
                    : "text-(--theme-text-muted) hover:text-(--theme-text-primary)"
                }`}
                title="Bar Comparison"
              >
                <BarChart3 size={13} />
                <span>Bars</span>
              </button>
            </div>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="relative mt-4">
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="h-auto w-full select-none"
              style={{ minWidth: 640 }}
            >
              <defs>
                {/* Sent Gradient Fill */}
                <linearGradient
                  id={`${chartId}-sent-grad`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.32" />
                  <stop offset="85%" stopColor="#38bdf8" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>

                {/* Returned Gradient Fill */}
                <linearGradient
                  id={`${chartId}-returned-grad`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                  <stop offset="85%" stopColor="#10b981" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>

                {/* Glow Filter */}
                <filter
                  id={`${chartId}-glow`}
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feDropShadow
                    dx="0"
                    dy="3"
                    stdDeviation="3"
                    floodOpacity="0.25"
                  />
                </filter>
              </defs>

              {/* Horizontal Gridlines & Y-Axis Ticks */}
              {ticks.map((tick) => {
                const y =
                  PADDING.top +
                  plotHeight -
                  (tick / resolvedMax) * plotHeight;
                return (
                  <g key={tick}>
                    <line
                      x1={PADDING.left}
                      x2={SVG_WIDTH - PADDING.right}
                      y1={y}
                      y2={y}
                      stroke="var(--theme-border-soft)"
                      strokeDasharray="4 6"
                      strokeWidth="1"
                      opacity="0.85"
                    />
                    <text
                      x={PADDING.left - 12}
                      y={y + 3.5}
                      fill="var(--theme-text-muted)"
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="end"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* Vertical Y-Axis Divider Line */}
              <line
                x1={PADDING.left}
                x2={PADDING.left}
                y1={PADDING.top}
                y2={baseY}
                stroke="var(--theme-border-soft)"
                strokeWidth="1.2"
              />

              {/* VIEW MODE 1: AREA / SPLINE CHART */}
              {viewMode === "area" && (
                <>
                  {/* Sent Area Fill */}
                  {sentPoints.length > 0 && (
                    <path
                      d={`${sentPath} L ${sentPoints[sentPoints.length - 1].x} ${baseY} L ${sentPoints[0].x} ${baseY} Z`}
                      fill={`url(#${chartId}-sent-grad)`}
                    />
                  )}

                  {/* Returned Area Fill */}
                  {returnedPoints.length > 0 && (
                    <path
                      d={`${returnedPath} L ${returnedPoints[returnedPoints.length - 1].x} ${baseY} L ${returnedPoints[0].x} ${baseY} Z`}
                      fill={`url(#${chartId}-returned-grad)`}
                    />
                  )}

                  {/* Sent Line */}
                  <path
                    d={sentPath}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={`url(#${chartId}-glow)`}
                  />

                  {/* Returned Line */}
                  <path
                    d={returnedPath}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter={`url(#${chartId}-glow)`}
                  />

                  {/* Point Markers on Curves */}
                  {sentPoints.map((pt, idx) => {
                    const isHovered = hoveredIndex === idx;
                    const hasVal = pt.value > 0;
                    return (
                      <g key={`sent-pt-${idx}`}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 6 : hasVal ? 3.5 : 2.5}
                          fill="#38bdf8"
                          stroke="var(--theme-surface)"
                          strokeWidth={isHovered ? "2.5" : "1.5"}
                          className="transition-all duration-200"
                        />
                      </g>
                    );
                  })}

                  {returnedPoints.map((pt, idx) => {
                    const isHovered = hoveredIndex === idx;
                    const hasVal = pt.value > 0;
                    return (
                      <g key={`ret-pt-${idx}`}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 6 : hasVal ? 3.5 : 2.5}
                          fill="#10b981"
                          stroke="var(--theme-surface)"
                          strokeWidth={isHovered ? "2.5" : "1.5"}
                          className="transition-all duration-200"
                        />
                      </g>
                    );
                  })}
                </>
              )}

              {/* VIEW MODE 2: COLUMN / BAR COMPARISON */}
              {viewMode === "bar" && (
                <>
                  {points.map((p, idx) => {
                    const centerX = sentPoints[idx]?.x ?? PADDING.left + idx * stepX;
                    const barW = Math.min(18, stepX * 0.24);
                    const sentVal = Number(p.sent) || 0;
                    const retVal = Number(p.returned) || 0;

                    const sentH = (sentVal / resolvedMax) * plotHeight;
                    const retH = (retVal / resolvedMax) * plotHeight;

                    const sentY = baseY - sentH;
                    const retY = baseY - retH;

                    const isHovered = hoveredIndex === idx;

                    return (
                      <g key={`bar-group-${idx}`}>
                        {/* Sent Bar */}
                        {sentH > 0 ? (
                          <rect
                            x={centerX - barW - 1.5}
                            y={sentY}
                            width={barW}
                            height={sentH}
                            rx="4"
                            fill="#38bdf8"
                            opacity={isHovered ? 1 : 0.85}
                            className="transition-all duration-150"
                          />
                        ) : (
                          <circle
                            cx={centerX - barW / 2}
                            cy={baseY}
                            r="1.5"
                            fill="#38bdf8"
                            opacity="0.35"
                          />
                        )}

                        {/* Returned Bar */}
                        {retH > 0 ? (
                          <rect
                            x={centerX + 1.5}
                            y={retY}
                            width={barW}
                            height={retH}
                            rx="4"
                            fill="#10b981"
                            opacity={isHovered ? 1 : 0.85}
                            className="transition-all duration-150"
                          />
                        ) : (
                          <circle
                            cx={centerX + barW / 2}
                            cy={baseY}
                            r="1.5"
                            fill="#10b981"
                            opacity="0.35"
                          />
                        )}
                      </g>
                    );
                  })}
                </>
              )}

              {/* Hover Crosshair Guideline */}
              {hoveredIndex !== null && sentPoints[hoveredIndex] && (
                <line
                  x1={sentPoints[hoveredIndex].x}
                  x2={sentPoints[hoveredIndex].x}
                  y1={PADDING.top}
                  y2={baseY}
                  stroke="var(--color-aurora-teal)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.55"
                />
              )}

              {/* X-Axis Day Labels & Interactive Hit Areas */}
              {points.map((p, idx) => {
                const x = sentPoints[idx]?.x ?? PADDING.left + idx * stepX;
                const isHovered = hoveredIndex === idx;
                const slotW =
                  points.length > 1
                    ? effectiveWidth / (points.length - 1)
                    : effectiveWidth;

                return (
                  <g key={`hit-day-${idx}`}>
                    {/* Transparent Hit Area for Hover */}
                    <rect
                      x={x - slotW / 2}
                      y={PADDING.top}
                      width={slotW}
                      height={plotHeight + 35}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />

                    {/* Day Text Label */}
                    <text
                      x={x}
                      y={SVG_HEIGHT - 16}
                      fill={
                        isHovered
                          ? "var(--color-aurora-teal)"
                          : "var(--theme-text-muted)"
                      }
                      fontSize={isHovered ? "11" : "10"}
                      fontWeight={isHovered ? "800" : "600"}
                      textAnchor="middle"
                      className="transition-all duration-150"
                    >
                      {p.label}
                    </text>
                  </g>
                );
              })}

              {/* Interactive Tooltip Card */}
              {hoveredIndex !== null && sentPoints[hoveredIndex] && (
                <foreignObject
                  x={Math.min(
                    Math.max(
                      sentPoints[hoveredIndex].x - 80,
                      PADDING.left + 6,
                    ),
                    SVG_WIDTH - PADDING.right - 166,
                  )}
                  y={Math.max(
                    Math.min(
                      sentPoints[hoveredIndex].y,
                      returnedPoints[hoveredIndex].y,
                    ) - 95,
                    8,
                  )}
                  width="160"
                  height="90"
                  className="pointer-events-none"
                >
                  <div
                    xmlns="http://www.w3.org/1999/xhtml"
                    className="rounded-xl border border-(--theme-border) bg-(--theme-surface-strong)/95 p-2.5 shadow-xl backdrop-blur-md"
                  >
                    <p className="m-0 mb-1.5 text-xs font-black text-(--theme-text-primary)">
                      {points[hoveredIndex].label}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-(--theme-text-secondary)">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#38bdf8]" />
                        <span>Sent:</span>
                      </div>
                      <strong className="text-(--color-sky-blue)">
                        {points[hoveredIndex].sent || 0}
                      </strong>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-(--theme-text-secondary)">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#10b981]" />
                        <span>Returned:</span>
                      </div>
                      <strong className="text-(--color-seafoam)">
                        {points[hoveredIndex].returned || 0}
                      </strong>
                    </div>
                  </div>
                </foreignObject>
              )}
            </svg>
          </div>
        </div>

        {/* Bottom Legend & Status */}
        <div className="mt-4 flex flex-col gap-3 border-t border-(--theme-border-soft) pt-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Legend Indicators */}
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-(--theme-text-secondary)">
                <span className="h-2.5 w-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.4)]" />
                <span>Sent (Outbound Dispatches)</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-(--theme-text-secondary)">
                <span className="h-2.5 w-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span>Returned (Inbound Clean Batches)</span>
              </div>
            </div>

            {/* Net Difference Badge */}
            <div className="flex items-center gap-2 text-xs font-semibold text-(--theme-text-muted)">
              <span>Net In Laundry:</span>
              <span
                className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                  totals.diff > 0
                    ? "bg-(--color-pending)/15 text-(--color-pending)"
                    : totals.diff === 0
                      ? "bg-(--theme-surface-strong) text-(--theme-text-muted)"
                      : "bg-(--color-seafoam)/15 text-(--color-seafoam)"
                }`}
              >
                {totals.diff > 0
                  ? `+${totals.diff} items pending`
                  : totals.diff === 0
                    ? "Balanced"
                    : `${totals.diff} surplus`}
              </span>
            </div>
          </div>

          {/* Zero activity helpful indicator */}
          {isAllZero && (
            <div className="flex items-center gap-2 rounded-xl bg-(--theme-surface-strong)/60 px-3 py-2 text-xs text-(--theme-text-muted)">
              <Info size={14} className="shrink-0 text-(--color-aurora-teal)" />
              <span>
                No dispatches or returns recorded for the current 7-day period.
                Once batches are scanned and dispatched, trends will visualize
                here automatically.
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ChartsRow;
