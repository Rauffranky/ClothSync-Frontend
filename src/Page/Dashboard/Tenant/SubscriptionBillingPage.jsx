import { usePageMeta } from "../../../Hooks/usePageMeta";
import SubscriptionBilling from "../../../Section/Common/SubscriptionBilling";

const BusinessSubscriptionBillingPage = () => {
  usePageMeta({
    title: "Subscription & Billing - Business Portal - ClothSync",
    meta: [
      {
        name: "description",
        content: "Manage business organization subscription plans and billing status on ClothSync.",
      },
    ],
  });

  return <SubscriptionBilling portal="business" />;
};

export default BusinessSubscriptionBillingPage;
