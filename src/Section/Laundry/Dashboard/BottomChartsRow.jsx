import { BarChart, ChartCard, LineChart } from "../../../Components/UI/Charts";

const throughputData = [
  { label: "Grand Plaza", value: 284, color: "var(--color-sky-blue)" },
  { label: "CityCare", value: 176, color: "var(--color-sky-blue)" },
  { label: "Royal Suites", value: 133, color: "var(--color-sky-blue)" },
  { label: "Metro Textile", value: 410, color: "var(--color-sky-blue)" },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const delayedSeries = [
  {
    label: "Delayed Items",
    values: [8, 12, 6, 14, 10, 18, 16],
    color: "var(--color-pending)",
    showPoints: true,
  },
];

const BottomChartsRow = () => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <ChartCard
      title="Business-Wise Throughput"
      description="Items in laundry per business"
    >
      <BarChart
        ariaLabel="Business-wise throughput"
        data={throughputData}
        height={200}
        maxValue={600}
        showValues
        ticks={[0, 150, 300, 450, 600]}
      />
    </ChartCard>

    <ChartCard
      title="Delayed Items Trend"
      description="Last 7 days"
      action={<div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">+6 today</div>}
    >
      <LineChart
        ariaLabel="Daily delayed items trend"
        height={200}
        labels={days}
        maxValue={20}
        series={delayedSeries}
        ticks={[0, 5, 10, 15, 20]}
      />
    </ChartCard>
  </div>
);

export default BottomChartsRow;
