import { usePageMeta } from "../../../Hooks/usePageMeta";
import LinkedLaundryDetail from "../../../Section/Tenant/LinkedLaundries/LinkedLaundryDetail";

const LinkedLaundryDetailsPage = () => {
  usePageMeta({
    title: "Laundry Details - ClothSync",
    meta: [
      {
        name: "description",
        content: "View specific laundry relationship details and activity in the ClothSync business portal.",
      },
    ],
  });

  return (
    <div>
      <LinkedLaundryDetail />
    </div>
  );
};

export default LinkedLaundryDetailsPage;
