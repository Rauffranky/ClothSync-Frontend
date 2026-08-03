import { usePageMeta } from "../../../Hooks/usePageMeta";
import DispatchBadges from "../../../Section/Tenant/DispatchBadges";

const DispatchBadgesPage = () => {
  usePageMeta({
    title: "Dispatch Batches - ClothSync",
    meta: [
      {
        name: "description",
        content: "Track and manage linen dispatch batches sent to linked laundry partners in ClothSync.",
      },
    ],
  });

  return (
    <div>
      <DispatchBadges />
    </div>
  );
};

export default DispatchBadgesPage;
