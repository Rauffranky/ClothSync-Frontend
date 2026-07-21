import DelayedTrendChart from "./DelayedTrendChart";
import MissingLostChart from "./MissingLostChart";
import ReportsTable from "./ReportsTable";
import WashCyclesChart from "./WashCyclesChart";
import WeeklyTrendChart from "./WeeklyTrendChart";

const Overview = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <WeeklyTrendChart />
      <DelayedTrendChart />
      <WashCyclesChart />
      <MissingLostChart />
    </div>
    <ReportsTable />
  </div>
);

export default Overview;
