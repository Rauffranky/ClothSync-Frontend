import { useState } from "react";
import { AlertTriangle, CircleCheck, CircleX } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Modal from "../../../Components/UI/Modal";
import { getApiErrorMessage } from "../../../axios/api";
import { updateAdminSubscriptionPlanStatus } from "../../../axios/adminSubscriptionPlans/adminSubscriptionPlans";
import { toast } from "../../../Utils/toast";

const SubscriptionPlanStatusModal = ({ actionData, onClose, onSaved }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const planItem = actionData?.planItem;
  const isActivate = actionData?.action === "active";

  if (!planItem) return null;

  const handleClose = () => {
    if (!isSubmitting) onClose?.();
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const response = await updateAdminSubscriptionPlanStatus(
        planItem.id,
        isActivate ? "active" : "inactive",
      );
      toast.success(
        response?.message ||
          `Subscription plan marked as ${isActivate ? "active" : "inactive"}`,
      );
      onSaved?.();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update subscription plan status"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      closeOnBackdrop={!isSubmitting}
      footer={
        <>
          <Button
            disabled={isSubmitting}
            onClick={handleClose}
            rounded="10px"
            size="sm"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            leftIcon={
              isActivate ? (
                <CircleCheck size={15} />
              ) : (
                <CircleX size={15} />
              )
            }
            loading={isSubmitting}
            onClick={handleConfirm}
            rounded="10px"
            size="sm"
            variant={isActivate ? "success" : "danger"}
          >
            {isActivate ? "Activate Plan" : "Deactivate Plan"}
          </Button>
        </>
      }
      onClose={handleClose}
      open
      title={isActivate ? "Activate Subscription Plan" : "Deactivate Subscription Plan"}
      width={500}
    >
      <Alert
        leftIcon={<AlertTriangle size={18} />}
        rounded="rounded-xl"
        variant={isActivate ? "info" : "danger"}
      >
        <p className="m-0 font-bold">
          {isActivate
            ? "Confirm Plan Activation"
            : "Confirm Plan Deactivation"}
        </p>
        <p className="m-0 mt-1 text-sm">
          Are you sure you want to set{" "}
          <span className="font-black">{planItem.name}</span> as{" "}
          <span className="font-bold">
            {isActivate ? "active" : "inactive"}
          </span>
          ?
          {!isActivate &&
            " Inactive plans cannot be chosen for new laundry subscriptions."}
        </p>
      </Alert>
    </Modal>
  );
};

export default SubscriptionPlanStatusModal;
