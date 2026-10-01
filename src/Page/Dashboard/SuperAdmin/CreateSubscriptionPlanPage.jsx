import { usePageMeta } from "../../../Hooks/usePageMeta";
import PlanForm from "../../../Section/SuperAdmin/SubscriptionPlans/PlanForm";

const CreateSubscriptionPlanPage = () => {
  usePageMeta({
    title: "Create Subscription Plan - ClothSync",
    meta: [
      {
        name: "description",
        content: "Create a new laundry subscription plan tier with quotas and feature permissions.",
      },
    ],
  });

  return <PlanForm isEditing={false} />;
};

export default CreateSubscriptionPlanPage;
