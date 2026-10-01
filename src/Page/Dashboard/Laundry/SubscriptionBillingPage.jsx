import { usePageMeta } from "../../../Hooks/usePageMeta";
import SubscriptionBilling from "../../../Section/Common/SubscriptionBilling";

const LaundrySubscriptionBillingPage = () => {
  usePageMeta({
    title: "Subscription & Billing - Laundry Portal - ClothSync",
    meta: [
      {
        name: "description",
        content: "Manage laundry subscription plans, quotas, and billing status on ClothSync.",
      },
    ],
  });

  return <SubscriptionBilling portal="laundry" />;
};

export default LaundrySubscriptionBillingPage;
