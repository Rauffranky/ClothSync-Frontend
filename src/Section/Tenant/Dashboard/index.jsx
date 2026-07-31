import useDashboardPeriod from "../../../Hooks/useDashboardPeriod";
import ActiveDispatchTable from "./ActiveDispatchTable";
import AssetLifecycleOverview from "./AssetLifecycleOverview";
import BottomChartsRow from "./BottomChartsRow";
import ChartsRow from "./ChartsRow";
import DashboardHeader from "./DashboardHeader";
import InventoryAlerts from "./InventoryAlerts";
import LinkedLaundriesPanel from "./LinkedLaundriesPanel";
import ScannerActivityPanel from "./ScannerActivityPanel";
import StatsGrid from "./StatsGrid";
import TestScannerScanButton from "./TestScannerScanButton";

const Dashboard = () => {
  const { period, customRange, selectPeriod, setCustomFrom, setCustomTo } =
    useDashboardPeriod();

  return (
    <div className="flex flex-col gap-5">
      {/* Page heading + period filter + date range */}
      <DashboardHeader
        period={period}
        customRange={customRange}
        onPeriod={selectPeriod}
        onFromChange={setCustomFrom}
        onToChange={setCustomTo}
      />

      <TestScannerScanButton />

      {/* Row 1 — 8 stat cards */}
      <StatsGrid />

      {/* Row 2 — Asset lifecycle flow */}
      <AssetLifecycleOverview />

      {/* Row 3 — Inventory alerts */}
      <InventoryAlerts />

      {/* Row 4 — Active dispatch table */}
      <ActiveDispatchTable />

      {/* Row 5 — Linked laundries + Scanner activity side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LinkedLaundriesPanel />
        <ScannerActivityPanel />
      </div>

      {/* Row 6 — Sent vs Returned + Delayed trend charts */}
      <ChartsRow />

      {/* Row 7 — Wash cycle + Laundry distribution */}
      <BottomChartsRow />
    </div>
  );
};

export default Dashboard;
