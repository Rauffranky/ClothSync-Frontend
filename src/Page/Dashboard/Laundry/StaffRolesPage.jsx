import { usePageMeta } from "../../../Hooks/usePageMeta";
import LaundryStaffRoles from "../../../Section/Laundry/StaffRoles";

const StaffRolesPage = () => {
  usePageMeta({
    title: "Laundry Staff Roles - ClothSync",
    meta: [
      {
        name: "description",
        content:
          "Manage Laundry staff roles, access levels, and module permissions.",
      },
    ],
  });

  return <LaundryStaffRoles />;
};

export default StaffRolesPage;
