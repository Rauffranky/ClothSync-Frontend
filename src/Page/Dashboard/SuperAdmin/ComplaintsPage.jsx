import { usePageMeta } from "../../../Hooks/usePageMeta";
import SuperAdminComplaintsSection from "../../../Section/SuperAdmin/Complaints";

const SuperAdminComplaintsPage = () => {
  usePageMeta({
    title: "Complaints Management - ClothSync Admin",
    meta: [
      {
        name: "description",
        content: "Platform-wide complaints, exceptions, and disputes overview.",
      },
    ],
  });

  return <SuperAdminComplaintsSection />;
};

export default SuperAdminComplaintsPage;
