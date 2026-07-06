import { usePageMeta } from "../../../Hooks/usePageMeta";
import Laundries from "../../../Section/Tenant/LinkedLaundries";

const LinkedLaundriesPage = () => {
  usePageMeta({
    title: "Linked Laundries - ClothSync",
    meta: [
      {
        name: "description",
        content: "View and manage linked laundries in the ClothSync business portal.",
      },
    ],
  });

  return (
    <div>
      <Laundries />
    </div>
  );
};

export default LinkedLaundriesPage;
