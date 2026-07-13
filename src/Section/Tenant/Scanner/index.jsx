import { useState } from "react";
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

  const handleCreateScanner = async (values) => {
    const payload = {
      scannerId: values.scannerId,
      scannerType: values.scannerType.toLowerCase(),
      scannerMode: values.scannerMode.toLowerCase(),
      ...(values.assignedOperatorId
        ? { assignedOperatorId: values.assignedOperatorId }
        : {}),
      status: values.status.toLowerCase(),
      signalStatus: values.signalStatus,
      firmwareVersion: values.firmwareVersion,
      batteryLevel: values.batteryLevel,
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
      <ScannerStats />

      {/* Main Table */}
      <ScannerTable />

      <AddScannerModal
        isOpen={isAddScannerOpen}
        onClose={() => setIsAddScannerOpen(false)}
        onSubmit={handleCreateScanner}
      />
    </div>
  );
};

export default ScannerManagementIndex;
