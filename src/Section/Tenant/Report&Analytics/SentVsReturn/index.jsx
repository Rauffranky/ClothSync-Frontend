import SentReturnedStats from "./SentReturnedStats";
import SentReturnedTable from "./SentReturnedTable";
import SentReturnedTrend from "./SentReturnedTrend";

const SentVsReturn = () => (
  <div className="space-y-5">
    <SentReturnedStats />
    <SentReturnedTrend />
    <SentReturnedTable />
  </div>
);

export default SentVsReturn;
