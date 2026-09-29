import { usePageMeta } from "../../../Hooks/usePageMeta";
import Laundries from "../../../Section/SuperAdmin/Laundries";

const LaundriesPage = () => {
  usePageMeta({
    title: "Laundries - ClothSync",
    meta: [
      {
        name: "description",
        content: "Manage registered laundry facilities and partners across the ClothSync platform.",
      },
    ],
  });

  return (
    <div>
      <Laundries />
    </div>
  );
};

export default LaundriesPage;
