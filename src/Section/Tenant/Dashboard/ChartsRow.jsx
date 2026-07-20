import { useState } from "react";
import Card from "../../../Components/UI/Card";

// ─── Sent vs Returned mini sparkline ─────────────────────────────────────────
const sentData = [48, 32, 45, 55, 95, 70, 18];
const returnedData = [52, 30, 42, 60, 90, 65, 15];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const W = 340;
const H = 120;
const PAD = 16;

const normalize = (data, h, pad) => {
  const max = Math.max(...data) + 4;
  return data.map((v) => h - pad - (v / max) * (h - pad * 2));
};

const toPath = (xs, ys) =>
  xs.reduce(
    (path, x, i) => (i === 0 ? `M ${x} ${ys[i]}` : `${path} L ${x} ${ys[i]}`),
    "",
  );

const xStep = (W - PAD * 2) / (sentData.length - 1);
const xs = sentData.map((_, i) => PAD + i * xStep);
const sentY = normalize(sentData, H, PAD);
const retY = normalize(returnedData, H, PAD);

const sentPath = toPath(xs, sentY);
const retPath = toPath(xs, retY);

// Shared tooltip box rendered inside SVG via foreignObject
const SvgTooltip = ({ x, y, items, svgW }) => {
  const tooltipW = 110;
  // Clamp so tooltip doesn't go off right edge
  const clampedX = Math.min(x - tooltipW / 2, svgW - tooltipW - 4);
  const clampedX2 = Math.max(clampedX, 4);
  const tipY = y - 72;

  return (
    <g style={{ pointerEvents: "none" }}>
      {/* Vertical crosshair */}
      <line
        x1={x}
        x2={x}
        y1={PAD}
        y2={H - PAD - 10}
        stroke="var(--theme-border-soft)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <foreignObject x={clampedX2} y={tipY < 4 ? 4 : tipY} width={tooltipW} height="64">
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            background: "var(--theme-bg)",
            border: "1px solid var(--theme-border-soft)",
            borderRadius: "10px",
            padding: "7px 10px",
            boxShadow: "var(--layout-panel-shadow)",
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--theme-text-primary)",
            lineHeight: 1.5,
          }}
        >
          {items.map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: item.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ color: "var(--theme-text-muted)", fontWeight: 600 }}>
                {item.label}:
              </span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </foreignObject>
    </g>
  );
};

const SentReturnedChart = () => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <Card padding="20px 24px">
      <h2 className="text-base font-black" style={{ color: "var(--theme-text-primary)" }}>
        Sent vs Returned
      </h2>
      <p className="mt-0.5 mb-3 text-xs" style={{ color: "var(--theme-text-muted)" }}>
        Daily dispatch and return volumes — last 7 days
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: "120px", overflow: "visible" }}
        aria-label="Sent vs Returned chart"
      >
        <defs>
          <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-sky-blue)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-sky-blue)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-seafoam)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-seafoam)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((v) => {
          const yPos = H - PAD - (v / 100) * (H - PAD * 2);
          return (
            <line
              key={v}
              x1={PAD} x2={W - PAD} y1={yPos} y2={yPos}
              stroke="var(--theme-border-soft)" strokeWidth="0.5"
            />
          );
        })}

        {/* Fill areas */}
        <path
          d={`${sentPath} L ${xs[xs.length - 1]} ${H - PAD} L ${xs[0]} ${H - PAD} Z`}
          fill="url(#sentGrad)"
        />
        <path
          d={`${retPath} L ${xs[xs.length - 1]} ${H - PAD} L ${xs[0]} ${H - PAD} Z`}
          fill="url(#retGrad)"
        />

        {/* Lines */}
        <path d={sentPath} fill="none" stroke="var(--color-sky-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={retPath} fill="none" stroke="var(--color-seafoam)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Hover dots */}
        {xs.map((x, i) => (
          <g key={i}>
            {/* Sent dot */}
            <circle
              cx={x} cy={sentY[i]} r={hoveredIdx === i ? 5 : 3}
              fill="var(--color-sky-blue)"
              stroke="var(--theme-bg)" strokeWidth="2"
              style={{ transition: "r 0.15s" }}
            />
            {/* Returned dot */}
            <circle
              cx={x} cy={retY[i]} r={hoveredIdx === i ? 5 : 3}
              fill="var(--color-seafoam)"
              stroke="var(--theme-bg)" strokeWidth="2"
              style={{ transition: "r 0.15s" }}
            />
            {/* Invisible hit area */}
            <rect
              x={x - xStep / 2} y={PAD} width={xStep} height={H - PAD * 2}
              fill="transparent"
              style={{ cursor: "crosshair" }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          </g>
        ))}

        {/* Tooltip */}
        {hoveredIdx !== null && (
          <SvgTooltip
            x={xs[hoveredIdx]}
            y={Math.min(sentY[hoveredIdx], retY[hoveredIdx])}
            svgW={W}
            items={[
              { label: days[hoveredIdx], value: "" },
              { label: "Sent", value: sentData[hoveredIdx], color: "var(--color-sky-blue)" },
              { label: "Returned", value: returnedData[hoveredIdx], color: "var(--color-seafoam)" },
            ]}
          />
        )}

        {/* X-axis labels */}
        {xs.map((x, i) => (
          <text key={days[i]} x={x} y={H - 1} textAnchor="middle" fontSize="9" fill="var(--theme-text-muted)">
            {days[i]}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex gap-4">
        {[
          { label: "Sent", color: "var(--color-sky-blue)" },
          { label: "Returned", color: "var(--color-seafoam)" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="h-0.5 w-6 rounded-full" style={{ background: item.color }} />
            <span className="text-xs font-semibold" style={{ color: "var(--theme-text-muted)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

// ─── Delayed Item Trend ────────────────────────────────────────────────────────
const delayedData = [18, 22, 25, 22, 28, 30, 33];
const weeks = ["W23", "W24", "W25", "W26"];

const dxStep = (W - PAD * 2) / (delayedData.length - 1);
const dxs = delayedData.map((_, i) => PAD + i * dxStep);
const dY = normalize(delayedData, H, PAD);
const delayedPath = toPath(dxs, dY);

const DelayedTrendChart = () => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <Card padding="20px 24px">
      <h2 className="text-base font-black" style={{ color: "var(--theme-text-primary)" }}>
        Delayed Item Trend
      </h2>
      <p className="mt-0.5 mb-3 text-xs" style={{ color: "var(--theme-text-muted)" }}>
        Weekly count of items past expected return
      </p>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: "120px", overflow: "visible" }}
        aria-label="Delayed item trend chart"
      >
        {/* Grid lines */}
        {[0, 8, 16, 24, 32].map((v) => {
          const yPos = H - PAD - (v / 32) * (H - PAD * 2);
          return (
            <line
              key={v} x1={PAD} x2={W - PAD} y1={yPos} y2={yPos}
              stroke="var(--theme-border-soft)" strokeWidth="0.5"
            />
          );
        })}

        {/* Line */}
        <path
          d={delayedPath} fill="none" stroke="var(--color-pending)"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        />

        {/* Dots + hover areas */}
        {dxs.map((x, i) => (
          <g key={i}>
            <circle
              cx={x} cy={dY[i]}
              r={hoveredIdx === i ? 6 : 4}
              fill="var(--color-pending)"
              stroke="var(--theme-bg)" strokeWidth="2"
              style={{ transition: "r 0.15s" }}
            />
            <rect
              x={x - dxStep / 2} y={PAD} width={dxStep} height={H - PAD * 2}
              fill="transparent"
              style={{ cursor: "crosshair" }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          </g>
        ))}

        {/* Tooltip */}
        {hoveredIdx !== null && (
          <SvgTooltip
            x={dxs[hoveredIdx]}
            y={dY[hoveredIdx]}
            svgW={W}
            items={[
              { label: "Delayed", value: delayedData[hoveredIdx], color: "var(--color-pending)" },
            ]}
          />
        )}

        {/* X-axis labels */}
        {weeks.map((w, i) => {
          const xIdx = Math.round((i / (weeks.length - 1)) * (dxs.length - 1));
          return (
            <text key={w} x={dxs[xIdx]} y={H - 1} textAnchor="middle" fontSize="9" fill="var(--theme-text-muted)">
              {w}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-1.5">
        <div className="h-0.5 w-6 rounded-full" style={{ background: "var(--color-pending)" }} />
        <span className="text-xs font-semibold" style={{ color: "var(--theme-text-muted)" }}>
          Delayed Items
        </span>
      </div>
    </Card>
  );
};

// ─── Exported combined row ─────────────────────────────────────────────────────
const ChartsRow = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <SentReturnedChart />
    <DelayedTrendChart />
  </div>
);

export default ChartsRow;
