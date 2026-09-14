import { usePageMeta } from "../../../Hooks/usePageMeta";
import BusinessTypes from "../../../Section/SuperAdmin/BusinessTypes";

const BusinessTypesPage = () => {
  usePageMeta({
    title: "Business Types - ClothSync",
    meta: [
      {
        name: "description",
        content: "Manage customizable business types on the ClothSync platform.",
      },
    ],
  });

  return (
    <div>
      <BusinessTypes />
    </div>
  );
};

export default BusinessTypesPage;
