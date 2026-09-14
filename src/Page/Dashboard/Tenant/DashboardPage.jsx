import { usePageMeta } from "../../../Hooks/usePageMeta";
import Dashboard from "../../../Section/Tenant/Dashboard";

const DashboardPage = () => {
  usePageMeta({
    title: "Dashboard - ClothSync",
    meta: [
      {
        name: "description",
        content: "Overview of assets, laundry operations, and metrics in ClothSync.",
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
