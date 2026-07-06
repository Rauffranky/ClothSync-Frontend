import { usePageMeta } from "../../../Hooks/usePageMeta";
import Categories from "../../../Section/Tenant/Categories";

const CategoriesPage = () => {
  usePageMeta({
    title: "Categories - ClothSync",
    meta: [
      {
        name: "description",
        content: "View and manage business categories in the ClothSync portal.",
      },
    ],
  });

  return (
    <div>
      <Categories />
    </div>
  );
};

export default CategoriesPage;
