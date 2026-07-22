import { ChartCard, LineChart } from "../../../../Components/UI/Charts";
import Badge from "../../../../Components/UI/Badge";

const delayedItemsSeries = [
  {
    label: "Delayed",
    values: [8, 12, 6, 14, 10, 18, 16],
    color: "var(--color-sunset-orange)",
    fill: true,
    showPoints: true,
    strokeWidth: 2.5,
  },
];

const xLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// Screenshot shows sparse labels: Tue, Thu, Fri, Sun
const sparseLabels = ["", "Tue", "", "Thu", "Fri", "", "Sun"];

const DelayedItemsTrend = () => {
  return (
    <ChartCard
      title="Delayed Items Trend"
      subtitle="Last 7 days"
      action={
        <Badge variant="warning" rounded="rounded-full" size="sm">
          +6 today
        </Badge>
      }
    >
      <div className="mt-2 h-[160px]">
        <LineChart
          series={delayedItemsSeries}
          labels={sparseLabels}
          maxValue={20}
          ticks={[0, 5, 10, 15, 20]}
          height={160}
          smooth={true}
          showLegend={false}
          padding={{ top: 12, right: 12, bottom: 28, left: 32 }}
        />
      </div>
    </ChartCard>
  );
};

export default DelayedItemsTrend;
