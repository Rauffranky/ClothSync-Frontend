import { usePageMeta } from "../../../Hooks/usePageMeta";
import SubscriptionPlans from "../../../Section/SuperAdmin/SubscriptionPlans";

const SubscriptionPlansPage = () => {
  usePageMeta({
    title: "Subscription Plans - ClothSync",
    meta: [
      {
        name: "description",
        content: "Manage laundry subscription plans, quotas, and feature tiers on the ClothSync platform.",
      },
    ],
  });

  return (
    <div>
      <SubscriptionPlans />
    </div>
  );
};

export default SubscriptionPlansPage;
