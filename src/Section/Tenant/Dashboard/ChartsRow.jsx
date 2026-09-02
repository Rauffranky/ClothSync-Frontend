import { ChartCard, LineChart } from "../../../Components/UI/Charts";
import { useDashboardData } from "./DashboardContext";

const ChartsRow = () => {
  const data = useDashboardData();
  const points = Array.isArray(data?.charts?.sentReturned) ? data.charts.sentReturned : [];
  const labels = points.map((point) => point.label);
  const values = points.flatMap((point) => [point.sent || 0, point.returned || 0]);
  const maxValue = Math.max(...values, 1);
  const series = [{ label: "Sent", values: points.map((point) => point.sent || 0), color: "var(--color-sky-blue)", fill: true }, { label: "Returned", values: points.map((point) => point.returned || 0), color: "var(--color-seafoam)", fill: true }];
  return (
  <div className="grid grid-cols-1 gap-4">
    <ChartCard
      title="Sent vs Returned"
      description="Daily dispatch and return volumes — last 7 days"
    >
      <LineChart
        ariaLabel="Daily sent and returned asset volumes"
        height={160}
        labels={labels}
        maxValue={maxValue}
        series={series}
        ticks={[0, 25, 50, 75, 100]}
      />
    </ChartCard>

  </div>
  );
};

export default ChartsRow;
