import { BarChart, ChartCard, DonutChart } from "../../../Components/UI/Charts";
import { useDashboardData } from "./DashboardContext";

const BottomChartsRow = () => {
  const data = useDashboardData();
  const washData = Array.isArray(data?.charts?.washCycle) ? data.charts.washCycle.map((item, index) => ({ ...item, color: index < 2 ? "var(--color-sky-blue)" : index === 2 ? "var(--color-pending)" : "var(--color-overdue)" })) : [];
  const linked = data?.laundries?.items;
  const laundryData = Array.isArray(linked) ? linked.map((item, index) => ({ label: item.laundry?.name || item.laundry?.businessName || item.name || "Laundry", value: Number(item.itemsCurrentlySentCount || 0), color: ["var(--color-sky-blue)", "var(--color-aqua-mist)", "var(--color-seafoam)", "var(--color-blue-gray)"][index % 4] })) : [];
  return (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <ChartCard
      title="Wash Cycle Summary"
      description="Distribution by turnaround time — last 30 days"
    >
      <BarChart
        ariaLabel="Wash cycle distribution by turnaround time"
        data={washData}
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
        data={laundryData}
        size={190}
      />
    </ChartCard>
  </div>
  );
};

export default BottomChartsRow;
