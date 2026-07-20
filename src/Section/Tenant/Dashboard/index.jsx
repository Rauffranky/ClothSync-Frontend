import ActiveDispatchTable from "./ActiveDispatchTable";
import AssetLifecycleOverview from "./AssetLifecycleOverview";
import BottomChartsRow from "./BottomChartsRow";
import ChartsRow from "./ChartsRow";
import InventoryAlerts from "./InventoryAlerts";
import LinkedLaundriesPanel from "./LinkedLaundriesPanel";
import ScannerActivityPanel from "./ScannerActivityPanel";
import StatsGrid from "./StatsGrid";

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6">
      {/* Page heading */}
      <div>
        <h1
          className="text-2xl font-black tracking-tight"
          style={{ color: "var(--theme-text-primary)" }}
        >
          Dashboard
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ color: "var(--theme-text-muted)" }}
        >
          Monitor linen movement, inventory status, scanner activity, and
          laundry operations.
        </p>
      </div>

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
