import { BarChart, ChartCard, DonutChart } from "../../../Components/UI/Charts";

const washCycleData = [
  { label: "< 24h", value: 95, color: "var(--color-sky-blue)" },
  { label: "24–48h", value: 195, color: "var(--color-sky-blue)" },
  { label: "48–72h", value: 60, color: "var(--color-pending)" },
  { label: "> 72h", value: 30, color: "var(--color-overdue)" },
];

const laundryDistribution = [
  { label: "PureWash Industrial", value: 312, color: "var(--color-sky-blue)" },
  { label: "CleanFlow Solutions", value: 175, color: "var(--color-aqua-mist)" },
  { label: "Metro Linen Services", value: 98, color: "var(--color-seafoam)" },
  { label: "Others", value: 34, color: "var(--color-blue-gray)" },
];

const BottomChartsRow = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <ChartCard
      title="Wash Cycle Summary"
      description="Distribution by turnaround time — last 30 days"
    >
      <BarChart
        ariaLabel="Wash cycle distribution by turnaround time"
        data={washCycleData}
        height={200}
        maxValue={200}
        showValues
        ticks={[0, 50, 100, 150, 200]}
      />
    </ChartCard>

    <ChartCard
      title="Laundry-wise Distribution"
      description="Items currently sent per laundry partner"
    >
      <DonutChart
        ariaLabel="Items currently sent per laundry partner"
        centerLabel="total items"
        data={laundryDistribution}
        size={150}
      />
    </ChartCard>
  </div>
);

export default BottomChartsRow;
