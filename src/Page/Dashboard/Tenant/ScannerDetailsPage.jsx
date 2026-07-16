import { usePageMeta } from "../../../Hooks/usePageMeta";
import ScannerDetailsIndex from "../../../Section/Tenant/Scanner/ScannerDetails";

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
      <ScannerDetailsIndex />
    </div>
  );
};

export default ScannerDetailsPage;
