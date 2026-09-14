import { usePageMeta } from "../../../Hooks/usePageMeta";
import Dashboard from "../../../Section/Laundry/Dashboard";

const DashboardPage = () => {
  usePageMeta({
    title: "Dashboard - ClothSync",
    meta: [
      {
        name: "description",
        content: "Laundry overview, batches, and operations in ClothSync.",
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
