import { ChartCard, DonutChart } from "../../../../Components/UI/Charts";
import { missingCategories } from "./data";

const totalMissing = missingCategories.reduce((sum, item) => sum + item.value, 0);

const MissingLostChart = () => (
  <ChartCard
    title="Missing / Lost by Category"
    description="Unresolved missing and lost items per category"
  >
    <DonutChart
      ariaLabel={`${totalMissing} missing or lost items by category`}
      centerLabel="open items"
      data={missingCategories}
      legendValueColor="var(--color-overdue)"
    />
  </ChartCard>
);

export default MissingLostChart;
