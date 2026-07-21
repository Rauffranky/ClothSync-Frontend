import { BarChart, ChartCard } from "../../../../Components/UI/Charts";
import { washCycleCategories } from "./data";

const chartData = washCycleCategories.map((item) => ({
  ...item,
  color: "var(--color-sky-blue)",
}));

const WashCyclesChart = () => (
  <ChartCard
    title="Wash Cycles by Category"
    description="Total washes processed per asset category — all time"
  >
    <BarChart
      ariaLabel="Wash cycles processed by category"
      data={chartData}
      maxValue={600}
      ticks={[0, 150, 300, 450, 600]}
    />
  </ChartCard>
);

export default WashCyclesChart;
