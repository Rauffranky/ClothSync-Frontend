import { DonutChart } from "../../../../Components/UI/Charts";
import Card from "../../../../Components/UI/Card";

const processingStatusData = [
  { label: "Checked In", value: 340, color: "var(--color-sky-blue)", percentage: "35%" },
  { label: "In Laundry", value: 261, color: "var(--color-aurora-purple)", percentage: "27%" },
  { label: "Processed", value: 198, color: "var(--color-aurora-teal)", percentage: "20%" },
  { label: "Ready", value: 143, color: "var(--color-aurora-teal)", percentage: "15%" },
];

// Override ready to distinguish from processed
const chartData = [
  { label: "Checked In", value: 340, color: "var(--color-sky-blue)" },
  { label: "In Laundry", value: 261, color: "var(--color-aurora-purple)" },
  { label: "Processed", value: 198, color: "var(--color-neon-cyan)" },
  { label: "Ready", value: 143, color: "var(--color-aurora-teal)" },
];

const legendColors = {
  "Checked In": "var(--color-sky-blue)",
  "In Laundry": "var(--color-aurora-purple)",
  "Processed": "var(--color-neon-cyan)",
  "Ready": "var(--color-aurora-teal)",
};

const ProcessingStatusDistribution = () => {
  return (
    <Card padding="24px">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-(--theme-text-primary)">Processing Status Distribution</h3>
        <p className="mt-0.5 text-xs text-(--theme-text-muted)">Current snapshot — all businesses</p>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Donut Chart — no built-in legend */}
        <div className="shrink-0">
          <DonutChart
            data={chartData}
            size={160}
            strokeWidth={24}
            showLegend={false}
          />
        </div>

        {/* Custom Legend */}
        <div className="flex w-full flex-1 flex-col gap-2.5">
          {processingStatusData.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: legendColors[stat.label] }}
              />
              <span className="flex-1 font-medium text-(--theme-text-muted)">{stat.label}</span>
              <span className="font-black text-(--theme-text-primary)">{stat.value}</span>
              <span className="w-7 text-right text-[11px] text-(--theme-text-muted)">{stat.percentage}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ProcessingStatusDistribution;
