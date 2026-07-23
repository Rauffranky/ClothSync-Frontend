import { ChartCard, LineChart } from "../../../../Components/UI/Charts";
import { sentReturnedSeries, weekLabels } from "./data";

const SentReturnedTrend = () => (
  <ChartCard
    title="Sent vs Returned — Weekly"
    description="8-week rolling comparison of dispatched and returned items"
  >
    <LineChart
      ariaLabel="Weekly sent and returned item comparison"
      labels={weekLabels}
      maxValue={320}
      series={sentReturnedSeries}
      ticks={[0, 80, 160, 240, 320]}
    />
  </ChartCard>
);

export default SentReturnedTrend;
