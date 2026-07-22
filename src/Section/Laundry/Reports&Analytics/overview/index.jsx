import DailyCheckInCheckOutChart from "./DailyCheckInCheckOutChart";
import ProcessingStatusDistribution from "./ProcessingStatusDistribution";
import BusinessThroughput from "./BusinessThroughput";
import DelayedItemsTrend from "./DelayedItemsTrend";
import ItemsByCategory from "./ItemsByCategory";
import AverageTurnaroundTime from "./AverageTurnaroundTime";

const OverviewTab = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* Top Row: Check-in vs Check-out & Processing Status */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <DailyCheckInCheckOutChart />
        <ProcessingStatusDistribution />
      </div>

      {/* Middle Row: Throughput, Delayed Items, Items by Category */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BusinessThroughput />
        <DelayedItemsTrend />
        <ItemsByCategory />
      </div>

      {/* Bottom Row: Avg Turnaround Time */}
      <AverageTurnaroundTime />
    </div>
  );
};

export default OverviewTab;

