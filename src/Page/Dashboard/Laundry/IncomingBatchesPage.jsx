import { usePageMeta } from "../../../Hooks/usePageMeta";
import IncomingBatches from "../../../Section/Laundry/IncomingBatches";

const IncomingBatchesPage = ({ checkoutMode = false }) => {
  usePageMeta({
    title: checkoutMode ? "Check-Out - ClothSync" : "Batches - ClothSync",
    meta: [{
      name: "description",
      content: checkoutMode
        ? "Track laundry batches checked out to businesses."
        : "Track incoming Laundry batches and their check-in progress.",
    }],
  });

  return <IncomingBatches checkoutMode={checkoutMode} />;
};

export default IncomingBatchesPage;
