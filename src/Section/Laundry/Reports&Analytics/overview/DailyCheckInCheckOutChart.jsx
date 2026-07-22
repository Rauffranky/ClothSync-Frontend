import { BarChart, ChartCard } from "../../../../Components/UI/Charts";

// Two series – Check-In (sky-blue) + Check-Out (aurora-teal)
const checkInData = [
  { label: "Mon", value: 180, color: "var(--color-sky-blue)" },
  { label: "Tue", value: 210, color: "var(--color-sky-blue)" },
  { label: "Wed", value: 150, color: "var(--color-sky-blue)" },
  { label: "Thu", value: 250, color: "var(--color-sky-blue)" },
  { label: "Fri", value: 195, color: "var(--color-sky-blue)" },
  { label: "Sat", value: 110, color: "var(--color-sky-blue)" },
  { label: "Sun", value: 90, color: "var(--color-sky-blue)" },
];

const checkOutData = [
  { label: "Mon", value: 160, color: "var(--color-aurora-teal)" },
  { label: "Tue", value: 190, color: "var(--color-aurora-teal)" },
  { label: "Wed", value: 255, color: "var(--color-aurora-teal)" },
  { label: "Thu", value: 230, color: "var(--color-aurora-teal)" },
  { label: "Fri", value: 170, color: "var(--color-aurora-teal)" },
  { label: "Sat", value: 80, color: "var(--color-aurora-teal)" },
  { label: "Sun", value: 100, color: "var(--color-aurora-teal)" },
];

const DailyCheckInCheckOutChart = () => {
  return (
    <ChartCard
      title="Daily Check-In vs Check-Out"
      action={<span className="text-xs text-(--theme-text-muted)">Jun 23–29</span>}
    >
      {/* Legend */}
      <div className="mb-3 flex items-center gap-5 text-xs font-semibold text-(--theme-text-muted)">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--color-sky-blue)" }} />
          Check-In
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--color-aurora-teal)" }} />
          Check-Out
        </div>
      </div>

      {/* Grouped bar chart — Check-In bars */}
      <BarChart
        data={checkOutData}
        maxValue={260}
        ticks={[0, 65, 130, 195, 260]}
        height={220}
        defaultColor="var(--color-aurora-teal)"
      />
    </ChartCard>
  );
};

export default DailyCheckInCheckOutChart;
