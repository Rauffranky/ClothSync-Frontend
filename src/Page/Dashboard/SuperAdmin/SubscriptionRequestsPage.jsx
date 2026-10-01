import { usePageMeta } from "../../../Hooks/usePageMeta";
import SubscriptionRequests from "../../../Section/SuperAdmin/SubscriptionRequests";

const SubscriptionRequestsPage = () => {
  usePageMeta({
    title: "Subscription Requests & Approvals - ClothSync",
    meta: [
      {
        name: "description",
        content: "Review and approve facility subscription requests across the ClothSync platform.",
      },
    ],
  });

  return (
    <div>
      <SubscriptionRequests />
    </div>
  );
};

export default SubscriptionRequestsPage;
