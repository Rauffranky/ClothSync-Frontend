import { ChartCard } from "../../../../Components/UI/Charts";
import GroupedBarChart from "../GroupedBarChart";
import { categoryChartSeries, categoryRows } from "./data";

const chartCategories = categoryRows.map((row) => ({
  label: row.category,
  values: row,
}));

const CategoryChart = () => (
  <ChartCard
    description="Comparison of dispatched and returned items per category"
    title="Sent vs Returned by Category"
  >
    <GroupedBarChart
      ariaLabel="Sent, returned, and delayed item counts for Bed Linen, Bath Towels, Uniforms, Table Linen, and Pool Towels"
      categories={chartCategories}
      maxValue={160}
      series={categoryChartSeries}
      ticks={[0, 40, 80, 120, 160]}
    />
  </ChartCard>
);

export default CategoryChart;
