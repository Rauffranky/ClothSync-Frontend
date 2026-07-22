import { BarChart } from "../../../../Components/UI/Charts";
import Card from "../../../../Components/UI/Card";

const turnaroundData = [
  { label: "Grand Plaza", value: 25, color: "var(--color-sky-blue)" },
  { label: "CityCare", value: 33, color: "var(--color-aurora-purple)" },
  { label: "Royal Suites", value: 20, color: "var(--color-aurora-teal)" },
  { label: "Metro Textile", value: 41, color: "var(--color-sunset-orange)" },
];

// Custom ticks with "hrs" suffix label
const hrsTicks = [0, 15, 30, 45, 60];

const AverageTurnaroundTime = () => {
  return (
    <Card padding="24px">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-(--theme-text-primary)">
          Average Turnaround Time by Business
        </h3>
        <span className="text-xs text-(--theme-text-muted)">Jun 23–29, 2026</span>
      </div>
      <div className=" w-full">
        <BarChart
          data={turnaroundData}
          maxValue={60}
          ticks={hrsTicks}
          // height={220}
          showValues={true}
          padding={{ top: 40, right: 16, bottom: 40, left: 52 }}
        />
      </div>
    </Card>
  );
};

export default AverageTurnaroundTime;
