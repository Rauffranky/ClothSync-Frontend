import { usePageMeta } from "../../../Hooks/usePageMeta";
import LaundryComplaintsSection from "../../../Section/Laundry/Complaints";

const LaundryComplaintsPage = () => {
  usePageMeta({
    title: "Complaints & Inquiries - ClothSync Laundry",
    meta: [
      {
        name: "description",
        content: "Manage operational complaints, batch inquiries, and quality dispute notices from partner businesses.",
      },
    ],
  });

  return <LaundryComplaintsSection />;
};

export default LaundryComplaintsPage;
