import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import Button from "../../../Components/UI/Button";
import ScannerStats from "./ScannerStats";
import ScannerTable from "./ScannerTable";
import AddScannerModal from "./AddScannerModal";
import { createTenantScanner } from "../../../axios/scanners/tenantScanners";
import { getApiErrorMessage } from "../../../axios/api";
import { toast } from "../../../Utils/toast";

const ScannerManagementIndex = () => {
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
      ...(values.assignedOperatorId
        ? { assignedOperatorId: values.assignedOperatorId }
        : {}),
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
      const response = await createTenantScanner(payload);
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
      />

      <AddScannerModal
        isOpen={isAddScannerOpen}
        onClose={() => setIsAddScannerOpen(false)}
        onSubmit={handleCreateScanner}
      />
    </div>
  );
};

export default ScannerManagementIndex;
