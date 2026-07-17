import { usePageMeta } from "../../../Hooks/usePageMeta";
import LaundryStaff from "../../../Section/Laundry/Staff";

const StaffPage = () => {
  usePageMeta({
    title: "Laundry Staff - ClothSync",
    meta: [
      {
        name: "description",
        content: "Manage Laundry staff members and their assigned roles.",
      },
    ],
  });

  return <LaundryStaff />;
};

export default StaffPage;
