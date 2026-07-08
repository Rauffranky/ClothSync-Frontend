import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "../../../Components/UI/Button";
import ScannerStats from "./ScannerStats";
import ScannerTable from "./ScannerTable";
import AddScannerModal from "./AddScannerModal";

const ScannerManagementIndex = () => {
  const [isAddScannerOpen, setIsAddScannerOpen] = useState(false);

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
      />
    </div>
  );
};

export default ScannerManagementIndex;
