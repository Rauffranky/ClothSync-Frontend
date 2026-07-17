import { usePageMeta } from "../../../Hooks/usePageMeta";
import LinkedBusinessDetail from "../../../Section/Laundry/LinkedBusinesses/LinkedBusinessDetail";

const LinkedBusinessDetailsPage = () => {
  usePageMeta({
    title: "Business Details - ClothSync",
    meta: [
      {
        name: "description",
        content:
          "View connected business profile and current Laundry operations.",
      },
    ],
  });

  return <LinkedBusinessDetail />;
};

export default LinkedBusinessDetailsPage;
