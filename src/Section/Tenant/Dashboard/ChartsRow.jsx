import { ChartCard, LineChart } from "../../../Components/UI/Charts";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

const ChartsRow = () => (
  <div className="grid grid-cols-1 gap-4">
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

  </div>
);

export default ChartsRow;
