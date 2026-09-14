import { usePageMeta } from "../../../Hooks/usePageMeta";
import Dashboard from "../../../Section/SuperAdmin/Dashboard";

const DashboardPage = () => {
  usePageMeta({
    title: "Super Admin Dashboard - ClothSync",
    meta: [
      {
        name: "description",
        content: "Super admin overview and system operations in ClothSync.",
      },
    ],
  });

  return (
    <div>
      <Dashboard />
    </div>
  );
};

export default DashboardPage;
