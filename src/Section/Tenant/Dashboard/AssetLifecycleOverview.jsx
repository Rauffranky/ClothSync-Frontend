import { ArrowRight, ChevronDown } from "lucide-react";
import Card from "../../../Components/UI/Card";

const stages = [
  { id: "at-facility", label: "In Facility", value: 437, color: "var(--color-seafoam)" },
  { id: "sent-to-laundry", label: "Sent to Laundry", value: 312, color: "var(--color-pending)" },
  { id: "in-laundry", label: "In Laundry", value: 289, color: "var(--color-super-admin-light)" },
  { id: "returning", label: "Returning to Facility", value: 156, color: "var(--color-sky-blue)" },
  { id: "returned", label: "Returned to Facility", value: 42, color: "var(--color-aqua-mist)" },
];

const LifecycleStage = ({ stage, isLast }) => (
  <div className="flex flex-1 items-center gap-2">
    <div
      className="flex flex-1 flex-col items-center gap-2 rounded-xl p-3 text-center"
      style={{
        background: `${stage.color}14`,
        border: `1px solid ${stage.color}30`,
      }}
    >
      <span
        className="text-2xl font-black leading-none"
        style={{ color: stage.color }}
      >
        {stage.value}
      </span>
      <span
        className="text-xs font-semibold leading-tight"
        style={{ color: "var(--theme-text-secondary)" }}
      >
        {stage.label}
      </span>
    </div>
    {!isLast && (
      <ArrowRight
        size={16}
        className="shrink-0"
        style={{ color: "var(--theme-text-muted)" }}
      />
    )}
  </div>
);

const legendItems = [
  { label: "In Facility", color: "var(--color-seafoam)" },
  { label: "Sent to Laundry", color: "var(--color-pending)" },
  { label: "In Laundry", color: "var(--color-super-admin-light)" },
  { label: "Sent to Facility", color: "var(--color-sky-blue)" },
  { label: "Returned to Facility", color: "var(--color-aqua-mist)" },
];

// Progress bar widths proportional to values
const total = stages.reduce((s, st) => s + st.value, 0);

const AssetLifecycleOverview = () => (
  <Card padding="20px 24px">
    {/* Header */}
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2
          className="text-base font-black"
          style={{ color: "var(--theme-text-primary)" }}
        >
          Asset Lifecycle Overview
        </h2>
        <p
          className="mt-0.5 text-xs"
          style={{ color: "var(--theme-text-muted)" }}
        >
          Real-time distribution across all operational stages
        </p>
      </div>
      <button
        type="button"
        className="flex items-center gap-1.5 text-xs font-semibold"
        style={{ color: "var(--theme-text-muted)" }}
      >
        <span>1,236 trackable assets</span>
        <ChevronDown size={15} />
      </button>
    </div>

    {/* Stage flow */}
    <div className="flex items-center gap-1">
      {stages.map((stage, i) => (
        <LifecycleStage key={stage.id} stage={stage} isLast={i === stages.length - 1} />
      ))}
    </div>

    {/* Progress bar */}
    <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full">
      {stages.map((stage) => (
        <div
          key={stage.id}
          style={{
            width: `${(stage.value / total) * 100}%`,
            background: stage.color,
          }}
        />
      ))}
    </div>

    {/* Legend */}
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 rounded-full"
            style={{ background: item.color }}
          />
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--theme-text-muted)" }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  </Card>
);

export default AssetLifecycleOverview;
