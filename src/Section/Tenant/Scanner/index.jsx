import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import ScannerStats from "./ScannerStats";
import ScannerTable from "./ScannerTable";
import { useOrganizationSubscription } from "../../../Hooks/useOrganizationSubscription";
import { getTenantScanners, updateTenantScanner, updateTenantScannerStatus } from "../../../axios/scanners/tenantScanners";
import { getTenantStaffOptions } from "../../../axios/staff/tenantStaff";

const ScannerManagementIndex = ({
  getScanners = getTenantScanners,
  updateScanner = updateTenantScanner,
  updateScannerStatus = updateTenantScannerStatus,
  getStaffOptions = getTenantStaffOptions,
  detailRoutePrefix = "/business/scanners",
}) => {
  const navigate = useNavigate();
  const { isQuotaReached, getQuotaLimit, isSuperAdmin } = useOrganizationSubscription();
  const [scannerRefreshKey, setScannerRefreshKey] = useState(0);
  const [summaryState, setSummaryState] = useState({
    summary: null,
    isLoading: true,
    loadError: "",
  });

  const totalScannersCount = summaryState.summary?.totalScanners ?? 0;
  const scannersQuotaLimit = getQuotaLimit("scanners");
  const isScannerLimitReached = isQuotaReached("scanners", totalScannersCount);

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

      {isScannerLimitReached && !isSuperAdmin && (
        <Alert variant="warning">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="m-0 text-sm font-bold text-(--theme-text-primary)">
                RFID Scanner Quota Reached ({totalScannersCount} / {scannersQuotaLimit ?? "0"})
              </p>
              <p className="m-0 text-xs text-(--theme-text-muted)">
                You have reached your subscription tier limit for RFID scanner hardware. Upgrade your plan to link more scanners.
              </p>
            </div>
            <Button
              leftIcon={<Sparkles size={14} />}
              size="sm"
              variant="primary"
              onClick={() =>
                navigate(
                  detailRoutePrefix.startsWith("/laundry")
                    ? "/laundry/subscription-billing"
                    : "/business/subscription-billing",
                )
              }
            >
              Upgrade Subscription
            </Button>
          </div>
        </Alert>
      )}

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
