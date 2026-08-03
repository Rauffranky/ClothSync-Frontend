import { usePageMeta } from "../../../Hooks/usePageMeta";
import DispatchDetails from "../../../Section/Tenant/DispatchBadges/DispatchDetails";

const DispatchDetailsPage = () => {
  usePageMeta({
    title: "Dispatch Batch Details - ClothSync",
    meta: [
      {
        name: "description",
        content: "View detailed linen dispatch batch lifecycle, partner information, and items.",
      },
    ],
  });

  return (
    <div>
      <DispatchDetails />
    </div>
  );
};

export default DispatchDetailsPage;
