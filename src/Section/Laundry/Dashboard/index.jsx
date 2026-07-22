import BottomChartsRow from "./BottomChartsRow";
import ChartsRow from "./ChartsRow";
import DashboardHeader from "./DashboardHeader";
import IncomingBatchesTable from "./IncomingBatchesTable";
import InventoryAndScannerRow from "./InventoryAndScannerRow";
import ProcessingLifecycle from "./ProcessingLifecycle";
import StatsGrid from "./StatsGrid";

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-5">
      <DashboardHeader />
      <StatsGrid />
      <ProcessingLifecycle />
      <ChartsRow />
      <BottomChartsRow />
      <IncomingBatchesTable />
      <InventoryAndScannerRow />
    </div>
  );
};

export default Dashboard;