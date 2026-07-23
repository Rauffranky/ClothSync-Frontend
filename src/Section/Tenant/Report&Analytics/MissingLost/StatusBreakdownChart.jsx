import { ChartCard, DonutChart } from "../../../../Components/UI/Charts";
import { missingStatusBreakdown } from "./data";

const StatusBreakdownChart = () => (
  <ChartCard
    description="Classification of current missing/lost items"
    title="Status Breakdown"
  >
    <DonutChart
      ariaLabel="Missing and lost status breakdown: 7 missing, 3 suspected lost, 1 lost"
      data={missingStatusBreakdown}
      showLegend={false}
      size={140}
      strokeWidth={25}
    />
    <div className="mt-3 flex flex-wrap justify-center gap-4" aria-hidden="true">
      {missingStatusBreakdown.map((item) => (
        <div
          className="flex items-center gap-1.5 text-[11px] font-semibold text-(--theme-text-secondary)"
          key={item.label}
        >
          <span className="h-2 w-2 rounded-sm" style={{ background: item.color }} />
          {item.label} ({item.value})
        </div>
      ))}
    </div>
  </ChartCard>
);

export default StatusBreakdownChart;
