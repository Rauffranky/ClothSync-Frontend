import { usePageMeta } from "../../../Hooks/usePageMeta";
import StaffRoles from "../../../Section/Tenant/StaffRoles";

const StaffRolesPage = () => {
  usePageMeta({
    title: "Staff Roles - ClothSync",
    meta: [
      {
        name: "description",
        content: "View staff roles, access levels, assignments, and status.",
      },
    ],
  });

  return <StaffRoles />;
};

export default StaffRolesPage;
