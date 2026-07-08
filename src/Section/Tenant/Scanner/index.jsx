import { Plus } from "lucide-react";
import Button from "../../../Components/UI/Button";
import ScannerStats from "./ScannerStats";
import ScannerTable from "./ScannerTable";

const ScannerManagementIndex = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-end">
        <Button leftIcon={<Plus size={16} />} variant="primary">
          Add Scanner
        </Button>
      </div>

      {/* Stats Overview */}
      <ScannerStats />

      {/* Main Table */}
      <ScannerTable />
    </div>
  );
};

export default ScannerManagementIndex;
