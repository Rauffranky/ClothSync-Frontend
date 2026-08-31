import { useCallback, useState } from "react";
import ScannerStats from "./ScannerStats";
import ScannerTable from "./ScannerTable";
import { getTenantScanners, updateTenantScanner, updateTenantScannerStatus } from "../../../axios/scanners/tenantScanners";
import { getTenantStaffOptions } from "../../../axios/staff/tenantStaff";

const ScannerManagementIndex = ({
  getScanners = getTenantScanners,
  updateScanner = updateTenantScanner,
  updateScannerStatus = updateTenantScannerStatus,
  getStaffOptions = getTenantStaffOptions,
  detailRoutePrefix = "/business/scanners",
}) => {
  const [scannerRefreshKey, setScannerRefreshKey] = useState(0);
  const [summaryState, setSummaryState] = useState({
    summary: null,
    isLoading: true,
    loadError: "",
  });

  const handleCollectionStateChange = useCallback((nextState) => {
    setSummaryState((current) => {
      if (nextState.status === "loading") {
        return {
          ...current,
          isLoading: !current.summary,
          loadError: "",
        };
      }

      if (nextState.status === "success") {
        return {
          summary: nextState.summary ?? current.summary,
          isLoading: false,
          loadError: "",
        };
      }

      return {
        summary: current.summary,
        isLoading: false,
        loadError: current.summary ? "" : nextState.error,
      };
    });
  }, []);

  const refreshScanners = () => {
    setScannerRefreshKey((current) => current + 1);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <ScannerStats
        isLoading={summaryState.isLoading}
        loadError={summaryState.loadError}
        onRetry={refreshScanners}
        summary={summaryState.summary}
      />

      {/* Main Table */}
      <ScannerTable
        onCollectionStateChange={handleCollectionStateChange}
        onScannerUpdated={refreshScanners}
        refreshKey={scannerRefreshKey}
        detailRoutePrefix={detailRoutePrefix}
        getScanners={getScanners}
        updateScanner={updateScanner}
        updateScannerStatus={updateScannerStatus}
        getStaffOptions={getStaffOptions}
      />

    </div>
  );
};

export default ScannerManagementIndex;
