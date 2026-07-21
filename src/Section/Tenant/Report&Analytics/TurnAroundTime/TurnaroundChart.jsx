import { ChartCard } from "../../../../Components/UI/Charts";
import GroupedBarChart from "../GroupedBarChart";
import { turnaroundChartSeries, turnaroundRows } from "./data";

const chartCategories = turnaroundRows.map((row) => ({
  label: row.laundry,
  values: row,
}));

const TurnaroundChart = () => (
  <ChartCard
    description="Average, P10, and P90 turnaround hours per laundry partner"
    title="Avg. Turnaround Time by Laundry"
  >
    <GroupedBarChart
      ariaLabel="Turnaround hours by laundry: PureWash average 28 hours, CleanFlow average 35 hours, Metro Linen average 22 hours"
      categories={chartCategories}
      maxValue={60}
      series={turnaroundChartSeries}
      ticks={[0, 15, 30, 45, 60]}
      valueSuffix="h"
    />
  </ChartCard>
);

export default TurnaroundChart;
