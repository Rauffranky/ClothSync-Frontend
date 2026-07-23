import { ChartCard, LineChart } from "../../../Components/UI/Charts";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weeks = ["W20", "W21", "W22", "W23", "W24", "W25", "W26"];

const sentReturnedSeries = [
  {
    label: "Sent",
    values: [48, 32, 45, 55, 95, 70, 18],
    color: "var(--color-sky-blue)",
    fill: true,
  },
  {
    label: "Returned",
    values: [52, 30, 42, 60, 90, 65, 15],
    color: "var(--color-seafoam)",
    fill: true,
  },
];

const delayedSeries = [
  {
    label: "Delayed Items",
    values: [18, 22, 25, 22, 28, 30, 33],
    color: "var(--color-pending)",
    showPoints: true,
  },
];

const ChartsRow = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <ChartCard
      title="Sent vs Returned"
      description="Daily dispatch and return volumes — last 7 days"
    >
      <LineChart
        ariaLabel="Daily sent and returned asset volumes"
        height={160}
        labels={days}
        maxValue={100}
        series={sentReturnedSeries}
        ticks={[0, 25, 50, 75, 100]}
      />
    </ChartCard>

    <ChartCard
      title="Delayed Item Trend"
      description="Weekly count of items past the expected return"
    >
      <LineChart
        ariaLabel="Weekly delayed item count"
        height={160}
        labels={weeks}
        maxValue={40}
        series={delayedSeries}
        ticks={[0, 10, 20, 30, 40]}
      />
    </ChartCard>
  </div>
);

export default ChartsRow;
