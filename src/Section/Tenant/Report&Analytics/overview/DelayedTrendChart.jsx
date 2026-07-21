import { ChartCard, LineChart } from "../../../../Components/UI/Charts";
import { delayedSeries, weekLabels } from "./data";

const DelayedTrendChart = () => (
  <ChartCard
    title="Delayed Item Trend"
    description="Weekly count of items past the expected return SLA"
  >
    <LineChart
      ariaLabel="Weekly delayed item trend"
      labels={weekLabels}
      maxValue={32}
      ticks={[0, 8, 16, 24, 32]}
      series={[
        {
          label: "Delayed Items",
          values: delayedSeries,
          color: "var(--color-pending)",
          showPoints: true,
        },
      ]}
    />
  </ChartCard>
);

export default DelayedTrendChart;
