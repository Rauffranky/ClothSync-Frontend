import { usePageMeta } from "../../../Hooks/usePageMeta";
import TenantSettings from "../../../Section/Tenant/Settings";

const SettingsPage = () => {
  usePageMeta({
    title: "Settings - ClothSync",
    meta: [
      {
        name: "description",
        content: "Manage business preferences, notifications, access, and security.",
      },
    ],
  });

  return <TenantSettings />;
};

export default SettingsPage;
