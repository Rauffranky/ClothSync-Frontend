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
        showLegend={false}
        size={180}
        strokeWidth={26}
      />
      <div className="mx-auto mt-3 max-w-sm space-y-2" aria-hidden="true">
        {laundryMarketShare.map((item) => (
          <div
            className="flex items-center gap-2 text-xs font-semibold text-(--theme-text-secondary)"
            key={item.label}
          >
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} />
            <span className="flex-1">{item.label}</span>
            <strong className="text-(--theme-text-primary)">{item.value}</strong>
          </div>
        ))}
      </div>
    </ChartCard>
  </div>
);

export default LaundryCharts;
