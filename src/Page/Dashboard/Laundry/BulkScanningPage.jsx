import { usePageMeta } from "../../../Hooks/usePageMeta";
import LaundryBulkScanningIndex from "../../../Section/Laundry/BulkScanning";

const LaundryBulkScanningPage = () => {
  usePageMeta({
    title: "Bulk Scanning - ClothSync Laundry",
    meta: [
      {
        name: "description",
        content: "Manage RFID bulk scanning operations in the ClothSync Laundry portal.",
      },
    ],
  });

  return (
    <div>
      <LaundryBulkScanningIndex />
    </div>
  );
};

export default LaundryBulkScanningPage;
