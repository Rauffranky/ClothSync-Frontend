import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Modal from "../../../Components/UI/Modal";
import { getApiErrorMessage } from "../../../axios/api";
import { deleteAdminSubscriptionPlan } from "../../../axios/adminSubscriptionPlans/adminSubscriptionPlans";
import { toast } from "../../../Utils/toast";

const DeleteSubscriptionPlanModal = ({ planItem, onClose, onSaved }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!planItem) return null;

  const handleClose = () => {
    if (!isSubmitting) onClose?.();
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const response = await deleteAdminSubscriptionPlan(planItem.id);
      toast.success(
        response?.message || "Subscription plan deleted successfully",
      );
      onSaved?.();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to delete subscription plan"),
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
            leftIcon={<Trash2 size={15} />}
            loading={isSubmitting}
            onClick={handleConfirm}
            rounded="10px"
            size="sm"
            variant="danger"
          >
            Delete Plan
          </Button>
        </>
      }
      onClose={handleClose}
      open
      title="Delete Subscription Plan"
      width={500}
    >
      <Alert
        leftIcon={<AlertTriangle size={18} />}
        rounded="rounded-xl"
        variant="danger"
      >
        <p className="m-0 font-bold">Confirm Deletion</p>
        <p className="m-0 mt-1 text-sm">
          Are you sure you want to permanently delete{" "}
          <span className="font-black">{planItem.name}</span>? This action cannot
          be undone.
        </p>
      </Alert>
    </Modal>
  );
};

export default DeleteSubscriptionPlanModal;
