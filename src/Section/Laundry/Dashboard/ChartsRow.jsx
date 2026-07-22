import { ChartCard, DonutChart, LineChart } from "../../../Components/UI/Charts";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const checkInCheckOutSeries = [
  {
    label: "Check-In",
    values: [180, 210, 140, 240, 195, 100, 80],
    color: "var(--color-sky-blue)",
  },
  {
    label: "Check-Out",
    values: [195, 210, 140, 240, 195, 100, 80],
    color: "var(--color-seafoam)",
  },
];

const processingStatus = [
  { label: "Checked In", value: 142, color: "var(--color-sky-blue)" },
  { label: "Sent to Business", value: 1003, color: "var(--color-super-admin-light)" },
  { label: "Returned", value: 388, color: "var(--color-seafoam)" },
];

const ChartsRow = () => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    <ChartCard
      title="Daily Check-In vs Check-Out"
      description="Last 7 days"
    >
      <LineChart
        ariaLabel="Daily check-in and check-out volumes"
        height={220}
        labels={days}
        maxValue={260}
        series={checkInCheckOutSeries}
        ticks={[0, 65, 130, 195, 260]}
      />
    </ChartCard>

    <ChartCard
      title="Processing Status"
      description="Distribution today"
    >
      <DonutChart
        ariaLabel="Processing Status Distribution"
        centerLabel="total items"
        data={processingStatus}
        size={180}
      />
    </ChartCard>
  </div>
);

export default ChartsRow;
