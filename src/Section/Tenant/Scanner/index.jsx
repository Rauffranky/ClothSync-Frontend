import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import Button from "../../../Components/UI/Button";
import ScannerStats from "./ScannerStats";
import ScannerTable from "./ScannerTable";
import AddScannerModal from "./AddScannerModal";
import { createTenantScanner, getTenantScanners, updateTenantScanner, updateTenantScannerStatus } from "../../../axios/scanners/tenantScanners";
import { getTenantStaffOptions } from "../../../axios/staff/tenantStaff";
import { getApiErrorMessage } from "../../../axios/api";
import { toast } from "../../../Utils/toast";

const ScannerManagementIndex = ({
  createScanner = createTenantScanner,
  getScanners = getTenantScanners,
  updateScanner = updateTenantScanner,
  updateScannerStatus = updateTenantScannerStatus,
  getStaffOptions = getTenantStaffOptions,
  detailRoutePrefix = "/business/scanners",
}) => {
  const [isAddScannerOpen, setIsAddScannerOpen] = useState(false);
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

  const handleCreateScanner = async (values) => {
    const payload = {
      scannerId: values.scannerId,
      scannerType: values.scannerType.toLowerCase(),
      scannerMode: values.scannerMode.toLowerCase(),
      assignedOperatorId: values.assignedOperatorId || null,
      status: values.status.toLowerCase(),
      translations: {
        en: {
          name: values.scannerName,
          zoneName: values.zoneName,
          notes: values.customNotes,
        },
        ar: {
          name: values.scannerName,
          zoneName: values.zoneName,
          notes: values.customNotes,
        },
      },
    };

    try {
      const response = await createScanner(payload);
      toast.success(response?.message || "Scanner created successfully");
      refreshScanners();
      return response;
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to create scanner"));
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-end">
        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => setIsAddScannerOpen(true)}
          variant="primary"
        >
          Add Scanner
        </Button>
      </div>

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

      <AddScannerModal
        isOpen={isAddScannerOpen}
        onClose={() => setIsAddScannerOpen(false)}
        onSubmit={handleCreateScanner}
        getStaffOptions={getStaffOptions}
      />
    </div>
  );
};

export default ScannerManagementIndex;
