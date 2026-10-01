import { usePageMeta } from "../../../Hooks/usePageMeta";
import PlanForm from "../../../Section/SuperAdmin/SubscriptionPlans/PlanForm";

const EditSubscriptionPlanPage = () => {
  usePageMeta({
    title: "Edit Subscription Plan - ClothSync",
    meta: [
      {
        name: "description",
        content: "Edit laundry subscription plan tier quotas, pricing, and feature permissions.",
      },
    ],
  });

  return <PlanForm isEditing={true} />;
};

export default EditSubscriptionPlanPage;
