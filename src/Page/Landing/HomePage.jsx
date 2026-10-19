
import { usePageMeta } from "../../Hooks/usePageMeta";
import HomeSection from "../../Section/landing/Home/Index";

const HomePage = () => {
  usePageMeta({
    title: "Trackly - Connected Laundry Management",
    meta: [
      {
        name: "description",
        content:
          "Trackly connects businesses and laundry partners with asset tracking, dispatch management, and shared operational visibility.",
      },
    ],
  });

  return <HomeSection />;
};

export default HomePage;
