import { ChartCard, LineChart } from "../../../../Components/UI/Charts";
import { sentReturnedSeries, weekLabels } from "./data";

const WeeklyTrendChart = () => (
  <ChartCard
    title="Sent vs Returned — Weekly Trend"
    description="Asset dispatches and returns over the last 8 weeks"
  >
    <LineChart
      ariaLabel="Weekly sent and returned assets trend"
      labels={weekLabels}
      maxValue={320}
      ticks={[0, 80, 160, 240, 320]}
      series={[
        {
          label: "Sent",
          values: sentReturnedSeries.sent,
          color: "var(--color-sky-blue)",
          fill: true,
        },
        {
          label: "Returned",
          values: sentReturnedSeries.returned,
          color: "var(--color-seafoam)",
        },
      ]}
    />
  </ChartCard>
);

export default WeeklyTrendChart;
