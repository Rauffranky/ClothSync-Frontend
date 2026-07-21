import { BarChart, ChartCard } from "../../../../Components/UI/Charts";
import { washCycleChartData } from "./data";

const WashCycleChart = () => (
  <ChartCard
    description="Total wash count per category — all time"
    title="Wash Cycles by Category"
  >
    <BarChart
      ariaLabel="Total wash cycles by category: Bed Linen 412, Bath Towels 289, Uniforms 178, Table Linen 203, Pool Towels 95"
      data={washCycleChartData}
      height={250}
      maxValue={600}
      ticks={[0, 150, 300, 450, 600]}
    />
    <div className="mt-2 flex flex-wrap justify-center gap-4" aria-hidden="true">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-(--theme-text-secondary)">
        <span className="h-2.5 w-2.5 rounded-sm bg-(--color-sky-blue)" />
        Total Washes
      </span>
      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-(--theme-text-secondary)">
        <span className="h-2.5 w-2.5 rounded-sm bg-(--theme-text-muted)" />
        Avg / Asset
      </span>
    </div>
  </ChartCard>
);

export default WashCycleChart;
