import { Plus, AlertTriangle, ChevronRight } from "lucide-react";
import Button from "../../../Components/UI/Button";
import Alert from "../../../Components/UI/Alert";
import ScannerStats from "./ScannerStats";
import ScannerTable from "./ScannerTable";
import ReferenceStates from "./ReferenceStates";

const ScannerManagementIndex = () => {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="m-0 text-2xl font-bold text-(--theme-text-primary)">
                        Scanner Management
                    </h1>
                    <p className="m-0 mt-1 text-sm font-medium text-(--theme-text-muted)">
                        Manage fixed and portable RFID scanners, locations, operators, and scanner activity.
                    </p>
                </div>
                <Button leftIcon={<Plus size={16} />} variant="primary">
                    Add Scanner
                </Button>
            </div>

            {/* Stats Overview */}
            <ScannerStats />

            {/* Global Warning Alert */}
            <Alert
                variant="orange"
                leftIcon={<AlertTriangle size={16} />}
                rounded="rounded-xl"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <span className="font-bold text-orange-800 dark:text-orange-300">
                            1 scanner requires attention —{" "}
                        </span>
                        <span className="font-medium text-orange-700 dark:text-orange-400">
                            Laundry Room Entry (SCN-ENT-004) has outdated firmware and low signal strength.
                        </span>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        rightIcon={<ChevronRight size={14} />}
                        className="border-orange-200 bg-orange-100 text-orange-800 hover:bg-orange-200 dark:border-orange-500/30 dark:bg-orange-500/20 dark:text-orange-300 dark:hover:bg-orange-500/30"
                    >
                        Review
                    </Button>
                </div>
            </Alert>

            {/* Main Table */}
            <ScannerTable />

            {/* Bottom Reference Section */}
            <ReferenceStates />
        </div>
    );
};

export default ScannerManagementIndex;
