import TurnaroundChart from "./TurnaroundChart";
import TurnaroundStats from "./TurnaroundStats";
import TurnaroundTable from "./TurnaroundTable";

const TurnaroundTime = () => (
  <div className="space-y-5">
    <TurnaroundStats />
    <TurnaroundChart />
    <TurnaroundTable />
  </div>
);

export default TurnaroundTime;
