import { ChartCard, DonutChart } from "../../../../Components/UI/Charts";
import GroupedBarChart from "../GroupedBarChart";
import {
  laundryChartSeries,
  laundryMarketShare,
  laundryRows,
} from "./data";

const chartCategories = laundryRows.map((row) => ({
  label: row.chartLabel,
  values: row,
}));

const LaundryCharts = () => (
  <div className="grid gap-5 lg:grid-cols-2">
    <ChartCard
      description="Current distribution of items across laundry partners"
      title="Items by Laundry Partner"
    >
      <GroupedBarChart
        ariaLabel="Items sent, returned, and delayed for PureWash Industrial, CleanFlow Solutions, and Metro Linen Services"
        categories={chartCategories}
        maxValue={320}
        series={laundryChartSeries}
        ticks={[0, 80, 160, 240, 320]}
      />
    </ChartCard>

    <ChartCard
      description="Proportion of total dispatches per laundry"
      title="Market Share by Items Sent"
    >
      <DonutChart
        ariaLabel="Market share by sent items: PureWash 312, CleanFlow 175, Metro 98"
        centerLabel="items sent"
        data={laundryMarketShare}
        size={150}
        strokeWidth={26}
      />
    </ChartCard>
  </div>
);

export default LaundryCharts;
