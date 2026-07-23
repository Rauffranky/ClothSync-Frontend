import { ArrowRight, ChevronDown } from "lucide-react";
import Card from "../../../Components/UI/Card";
import { SegmentedBarChart } from "../../../Components/UI/Charts";

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

const AssetLifecycleOverview = () => (
  <Card>
    {/* Header */}
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2
          className=" font-bold"
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

    <div className="mt-4">
      <SegmentedBarChart
        ariaLabel="Asset distribution across operational lifecycle stages"
        data={stages}
      />
    </div>
  </Card>
);

export default AssetLifecycleOverview;
