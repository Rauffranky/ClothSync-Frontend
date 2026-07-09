import Staff from "../../../Section/Tenant/Staff";
import { usePageMeta } from "../../../Hooks/usePageMeta";

const StaffPage = () => {
  usePageMeta({
    title: "Staff Management - ClothSync",
    meta: [
      {
        name: "description",
        content: "Manage business staff, permissions, and access status.",
      },
    ],
  });

  return <Staff />;
};

export default StaffPage;
