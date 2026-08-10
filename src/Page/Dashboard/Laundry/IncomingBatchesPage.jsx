import { usePageMeta } from "../../../Hooks/usePageMeta";
import IncomingBatches from "../../../Section/Laundry/IncomingBatches";

const IncomingBatchesPage = () => {
  usePageMeta({
    title: "Batches - ClothSync",
    meta: [{ name: "description", content: "Track incoming Laundry batches and their check-in progress." }],
  });

  return <IncomingBatches />;
};

export default IncomingBatchesPage;
