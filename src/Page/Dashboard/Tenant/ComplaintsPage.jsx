import { usePageMeta } from "../../../Hooks/usePageMeta";
import TenantComplaintsSection from "../../../Section/Tenant/Complaints";

const BusinessComplaintsPage = () => {
  usePageMeta({
    title: "Complaints & Inquiries - ClothSync Business",
    meta: [
      {
        name: "description",
        content: "Manage laundry complaints, linen discrepancy notices, and partner inquiries.",
      },
    ],
  });

  return <TenantComplaintsSection />;
};

export default BusinessComplaintsPage;
