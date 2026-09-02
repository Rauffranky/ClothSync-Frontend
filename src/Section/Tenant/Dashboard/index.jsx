import { useEffect, useMemo, useState } from "react";
import { DashboardContext } from "./DashboardContext";
import useDashboardPeriod from "../../../Hooks/useDashboardPeriod";
import DashboardSkeleton from "./DashboardSkeleton";
import { getTenantDashboardOverview } from "../../../axios/dashboard/tenantDashboard";
import ActiveDispatchTable from "./ActiveDispatchTable";
import AssetLifecycleOverview from "./AssetLifecycleOverview";
import BottomChartsRow from "./BottomChartsRow";
import ChartsRow from "./ChartsRow";
import DashboardHeader from "./DashboardHeader";
// import InventoryAlerts from "./InventoryAlerts";
import LinkedLaundriesPanel from "./LinkedLaundriesPanel";
import ScannerActivityPanel from "./ScannerActivityPanel";
import StatsGrid from "./StatsGrid";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const { period, customRange, selectPeriod, setCustomFrom, setCustomTo } =
    useDashboardPeriod();
  const dashboardFilters = useMemo(() => ({
    period,
    ...(customRange.from ? { dateFrom: customRange.from } : {}),
    ...(customRange.to ? { dateTo: customRange.to } : {}),
  }), [customRange.from, customRange.to, period]);

  useEffect(() => {
    let active = true;
    const loadingTimer = window.setTimeout(() => {
      if (active) setIsLoading(true);
    }, 0);
    if (period === "custom" && (!customRange.from || !customRange.to)) {
      window.clearTimeout(loadingTimer);
      const emptyRangeTimer = window.setTimeout(() => {
        if (active) setIsLoading(false);
      }, 0);
      return () => {
        active = false;
        window.clearTimeout(emptyRangeTimer);
      };
    }
    getTenantDashboardOverview(dashboardFilters).then((response) => {
      if (active) setDashboardData(response?.data?.data ?? response?.data ?? null);
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => {
      active = false;
      window.clearTimeout(loadingTimer);
    };
  }, [dashboardFilters, period, customRange.from, customRange.to]);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <DashboardContext.Provider value={{ ...dashboardData, filters: dashboardFilters }}>
    <div className="flex flex-col gap-5">
      {/* Page heading + period filter + date range */}
      <DashboardHeader
        period={period}
        customRange={customRange}
        onPeriod={selectPeriod}
        onFromChange={setCustomFrom}
        onToChange={setCustomTo}
      />

      {/* Hardcoded test-scanner controls are disabled; real APK scans open Bulk Scanning. */}

      {/* Row 1 — 8 stat cards */}
      <StatsGrid />

      {/* Row 2 — Asset lifecycle flow */}
      <AssetLifecycleOverview />

      {/* Row 3 — Inventory alerts */}
      {/* <InventoryAlerts /> */}

      {/* Row 4 — Active dispatch table */}
      <ActiveDispatchTable />

      {/* Row 5 — Linked laundries + Scanner activity side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LinkedLaundriesPanel />
        <ScannerActivityPanel />
      </div>

      {/* Row 6 — Sent vs Returned chart */}
      <ChartsRow />

      {/* Row 7 — Wash cycle + Laundry distribution */}
      <BottomChartsRow />
    </div>
    </DashboardContext.Provider>
  );
};

export default Dashboard;
