import { BarChart, ChartCard } from "../../../Components/UI/Charts";

const throughputData = [
  { label: "Grand Plaza", value: 284, color: "var(--color-sky-blue)" },
  { label: "CityCare", value: 176, color: "var(--color-sky-blue)" },
  { label: "Royal Suites", value: 133, color: "var(--color-sky-blue)" },
  { label: "Metro Textile", value: 410, color: "var(--color-sky-blue)" },
];

const BottomChartsRow = () => (
  <div className="grid grid-cols-1 gap-4">
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

  </div>
);

export default BottomChartsRow;
