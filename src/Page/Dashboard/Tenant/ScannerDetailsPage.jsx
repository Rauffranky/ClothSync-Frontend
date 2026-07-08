import { usePageMeta } from "../../../Hooks/usePageMeta";
import ScannerDetailsIndex from "../../../Section/Tenant/Scanner/ScannerDetails";

const ScannerDetailsPage = () => {
  usePageMeta({
    title: "Scanner Detail - ClothSync",
    meta: [
      {
        name: "description",
        content: "View scanner activity, logs, and configuration details.",
      },
    ],
  });

  return (
    <div>
      <ScannerDetailsIndex />
    </div>
  );
};

export default ScannerDetailsPage;