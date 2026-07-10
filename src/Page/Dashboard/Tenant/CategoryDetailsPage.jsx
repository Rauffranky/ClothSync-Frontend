import { usePageMeta } from "../../../Hooks/usePageMeta";
import CategoryDetails from "../../../Section/Tenant/Categories/CategoryDetails";

const CategoryDetailsPage = () => {
  usePageMeta({
    title: "Category Details - ClothSync",
    meta: [
      {
        name: "description",
        content: "View category details for the authenticated business.",
      },
    ],
  });

  return <CategoryDetails />;
};

export default CategoryDetailsPage;
