import { useState } from "react";
import { CircleX, AlertTriangle } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Input from "../../../Components/UI/Input";
import Modal from "../../../Components/UI/Modal";
import { getApiErrorMessage } from "../../../axios/api";
import { rejectAdminSubscription } from "../../../axios/subscriptions/subscriptions";
import { toast } from "../../../Utils/toast";

const RejectSubscriptionModal = ({ requestItem, onClose, onSaved }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  if (!requestItem) return null;

  const handleClose = () => {
    if (!isSubmitting) onClose?.();
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const response = await rejectAdminSubscription(requestItem.id, {
        rejectionReason: rejectionReason.trim() || undefined,
      });
      toast.success(
        response?.message ||
          `Subscription request for ${requestItem.orgName} declined.`,
      );
      onSaved?.();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to reject subscription request"),
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
            leftIcon={<CircleX size={15} />}
            loading={isSubmitting}
            onClick={handleConfirm}
            rounded="10px"
            size="sm"
            variant="danger"
          >
            Decline Request
          </Button>
        </>
      }
      onClose={handleClose}
      open
      title="Decline Subscription Request"
      width={500}
    >
      <div className="space-y-4">
        <Alert leftIcon={<AlertTriangle size={18} />} rounded="rounded-xl" variant="danger">
          <p className="m-0 font-bold">Decline Request for {requestItem.orgName}</p>
          <p className="m-0 mt-1 text-sm">
            Declining this request will keep the organization in the restricted state (only Subscription & Billing visible).
          </p>
        </Alert>

        <Input
          label="Reason for Rejection (Optional)"
          name="rejectionReason"
          onChange={(val) => setRejectionReason(val)}
          placeholder="e.g. Payment not verified, invalid business entity, etc."
          value={rejectionReason}
        />
      </div>
    </Modal>
  );
};

export default RejectSubscriptionModal;
