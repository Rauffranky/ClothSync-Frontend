import { usePageMeta } from "../../../Hooks/usePageMeta";
import ScannerDetailsIndex from "../../../Section/Tenant/Scanner/ScannerDetails";
import { getLaundryScannerDetails } from "../../../axios/scanners/laundryScanners";

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
      <ScannerDetailsIndex getScannerDetails={getLaundryScannerDetails} />
    </div>
  );
};

export default ScannerDetailsPage;
