import { usePageMeta } from "../../../Hooks/usePageMeta";
import ScannerWarnings from "../../../Section/Tenant/Scanner/ScannerWarnings";

const ScannerWarningsPage = () => {
  usePageMeta({
    title: "Scanner Warnings - ClothSync",
    meta: [
      {
        name: "description",
        content: "Review RFID scanners that require operational attention.",
      },
    ],
  });

  return <ScannerWarnings />;
};

export default ScannerWarningsPage;
