import { ChartCard, LineChart } from "../../../../Components/UI/Charts";
import { delayedTrend, delayedWeekLabels } from "./data";

const DelayedTrendChart = () => (
  <ChartCard
    description="Weekly count of items past expected return window"
    title="Delayed Items Trend"
  >
    <LineChart
      ariaLabel="Weekly delayed item trend"
      labels={delayedWeekLabels}
      maxValue={32}
      series={[
        {
          color: "var(--color-overdue)",
          label: "Delayed Items",
          showPoints: true,
          values: delayedTrend,
        },
      ]}
      showLegend={false}
      ticks={[0, 8, 16, 24, 32]}
    />
  </ChartCard>
);

export default DelayedTrendChart;
