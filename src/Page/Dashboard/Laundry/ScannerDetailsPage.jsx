import { usePageMeta } from "../../../Hooks/usePageMeta";
import ScannerDetailsIndex from "../../../Section/Tenant/Scanner/ScannerDetails";
import { getLaundryScannerDetails, getLaundryScannerLogs, reconnectLaundryScannerDevice, replaceLaundryScannerDevice, updateLaundryScannerAccess, issueLaundryFixedScannerCommand } from "../../../axios/scanners/laundryScanners";
import { getLaundryStaffOptions } from "../../../axios/laundryStaff/laundryStaff";
import { configureLaundryScanner } from "../../../axios/scanners/laundryScanners";
import { getLaundryStaffRoles as getLaundryRoles } from "../../../axios/laundryStaff/laundryStaff";

const ScannerDetailsPage = () => {
  usePageMeta({
    title: "Scanner Detail - ClothSync",
    meta: [
      {
        name: "description",
        content: "View scanner configuration, activity, audit, and operator details.",
      },
    ],
  });

  return (
    <div>
      <ScannerDetailsIndex
        configureScanner={configureLaundryScanner}
        getScannerDetails={getLaundryScannerDetails}
        issueFixedCommand={issueLaundryFixedScannerCommand}
        getScannerLogs={getLaundryScannerLogs}
        getStaffOptions={getLaundryStaffOptions}
        getRoleOptions={getLaundryRoles}
        reconnectScanner={reconnectLaundryScannerDevice}
        replaceScanner={replaceLaundryScannerDevice}
        updateAccess={updateLaundryScannerAccess}
        policyOwnerType="laundry"
      />
    </div>
  );
};

export default ScannerDetailsPage;
