import { usePageMeta } from "../../../Hooks/usePageMeta";
import LaundrySettings from "../../../Section/Laundry/Settings";

const LaundrySettingsPage = () => {
  usePageMeta({
    title: "Laundry Settings - ClothSync",
    meta: [
      {
        name: "description",
        content:
          "Manage laundry profile, notification preferences, and security.",
      },
    ],
  });

  return <LaundrySettings />;
};

export default LaundrySettingsPage;
