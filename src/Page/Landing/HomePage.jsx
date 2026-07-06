
import { usePageMeta } from "../../Hooks/usePageMeta";
import HomeSection from "../../Section/landing/Home/Index";

const HomePage = () => {
  usePageMeta({
    title: "RFID Laundry Management System",
    meta: [
      {
        name: "description",
        content:
          "A modern RFID-powered laundry management platform for tenants, laundry staff, and super admins.",
      },
    ],
  });

  return <HomeSection />;
};

export default HomePage;
