import { usePageMeta } from "../../../Hooks/usePageMeta";
import Businesses from "../../../Section/SuperAdmin/Businesses";

const BusinessesPage = () => {
  usePageMeta({
    title: "Businesses - ClothSync",
    meta: [
      {
        name: "description",
        content: "Manage registered tenant businesses on the ClothSync platform.",
      },
    ],
  });

  return (
    <div>
      <Businesses />
    </div>
  );
};

export default BusinessesPage;
