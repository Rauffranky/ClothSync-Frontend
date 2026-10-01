import { useState } from "react";
import { CircleCheck, Sparkles } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Modal from "../../../Components/UI/Modal";
import { getApiErrorMessage } from "../../../axios/api";
import { approveAdminSubscription } from "../../../axios/subscriptions/subscriptions";
import { toast } from "../../../Utils/toast";

const ApproveSubscriptionModal = ({ requestItem, onClose, onSaved }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!requestItem) return null;

  const handleClose = () => {
    if (!isSubmitting) onClose?.();
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const response = await approveAdminSubscription(requestItem.id);
      toast.success(
        response?.message ||
          `Subscription for ${requestItem.orgName} approved and activated!`,
      );
      onSaved?.();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to approve subscription request"),
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
            leftIcon={<CircleCheck size={15} />}
            loading={isSubmitting}
            onClick={handleConfirm}
            rounded="10px"
            size="sm"
            variant="success"
          >
            Approve & Unlock Access
          </Button>
        </>
      }
      onClose={handleClose}
      open
      title="Approve Subscription Request"
      width={500}
    >
      <div className="space-y-4">
        <Alert leftIcon={<Sparkles size={18} />} rounded="rounded-xl" variant="success">
          <p className="m-0 font-bold">Confirm Subscription Approval</p>
          <p className="m-0 mt-1 text-sm">
            You are approving the <span className="font-bold">{requestItem.planName}</span> plan (
            {requestItem.formattedPrice} / {requestItem.billingCycle}) for{" "}
            <span className="font-bold">{requestItem.orgName}</span> ({requestItem.targetTypeLabel}).
          </p>
        </Alert>

        <p className="m-0 text-xs text-(--theme-text-muted)">
          Once approved, all portal tools (Dashboard, Batches, Scanners, Assets, Staff)
          and quotas defined in the {requestItem.planName} tier will immediately unlock for this organization.
        </p>
      </div>
    </Modal>
  );
};

export default ApproveSubscriptionModal;
