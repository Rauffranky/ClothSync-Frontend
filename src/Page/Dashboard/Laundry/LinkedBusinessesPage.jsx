import { usePageMeta } from "../../../Hooks/usePageMeta";
import LinkedBusinesses from "../../../Section/Laundry/LinkedBusinesses";

const pageMeta = [
  {
    name: "description",
    content:
      "View linked businesses and manage pending connection requests in the ClothSync Laundry portal.",
  },
];

const LinkedBusinessesPage = () => {
  usePageMeta({
    title: "Linked Businesses - ClothSync",
    meta: pageMeta,
  });

  return <LinkedBusinesses />;
};

export default LinkedBusinessesPage;
