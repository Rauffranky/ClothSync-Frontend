import { usePageMeta } from "../../../Hooks/usePageMeta";
import LaundryBatchDetails from "../../../Section/Laundry/BatchDetails";

const LaundryBatchDetailsPage = ({ checkoutMode = false }) => {
  usePageMeta({
    title: checkoutMode
      ? "Check-Out Batch Details - ClothSync"
      : "Batch Details & User Acceptance - ClothSync",
    meta: [
      {
        name: "description",
        content: checkoutMode
          ? "Inspect and check out outgoing laundry batch assets."
          : "Inspect incoming batch items, scan RFID tags, and confirm receipt.",
      },
    ],
  });

  return <LaundryBatchDetails checkoutMode={checkoutMode} />;
};

export default LaundryBatchDetailsPage;
