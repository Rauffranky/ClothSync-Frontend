import { usePageMeta } from "../../../Hooks/usePageMeta";
import ScannerManagementIndex from "../../../Section/Tenant/Scanner";
import { 
  createLaundryScanner, 
  getLaundryScanners, 
  updateLaundryScanner, 
  updateLaundryScannerStatus 
} from "../../../axios/scanners/laundryScanners";
import { getLaundryStaff } from "../../../axios/laundryStaff/laundryStaff";

const ScannersPage = () => {
    usePageMeta({
        title: "Scanner Management - ClothSync",
        meta: [
            {
                name: "description",
                content: "Manage fixed and portable RFID scanners in the ClothSync laundry portal.",
            },
        ],
    });

    return (
        <div>
            <ScannerManagementIndex 
                createScanner={createLaundryScanner}
                getScanners={getLaundryScanners}
                updateScanner={updateLaundryScanner}
                updateScannerStatus={updateLaundryScannerStatus}
                getStaffMembers={getLaundryStaff}
                detailRoutePrefix="/laundry/scanners"
            />
        </div>
    );
};

export default ScannersPage;
