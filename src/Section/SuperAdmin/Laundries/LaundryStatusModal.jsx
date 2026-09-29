import { useState } from "react";
import { AlertTriangle, CircleCheck, CircleX, ShieldAlert } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Modal from "../../../Components/UI/Modal";
import { getApiErrorMessage } from "../../../axios/api";
import { updateAdminLaundryStatus } from "../../../axios/laundries/adminLaundries";
import { toast } from "../../../Utils/toast";

const LaundryStatusModal = ({ actionData, onClose, onSaved }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const laundry = actionData?.laundry;
  const targetAction = actionData?.action; // "active" | "inactive" | "suspend"

  if (!laundry) return null;

  const isActivate = targetAction === "active";
  const isSuspend = targetAction === "suspend";

  const handleClose = () => {
    if (!isSubmitting) onClose?.();
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const response = await updateAdminLaundryStatus(
        laundry.apiId || laundry.id,
        { status: targetAction },
      );
      toast.success(
        response?.message ||
          `Laundry marked as ${targetAction}`,
      );
      onSaved?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update laundry status"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = isActivate
    ? "Activate Laundry Facility"
    : isSuspend
    ? "Suspend Laundry Facility"
    : "Deactivate Laundry Facility";

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
              ) : isSuspend ? (
                <ShieldAlert size={15} />
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
            {title}
          </Button>
        </>
      }
      onClose={handleClose}
      open
      title={title}
      width={500}
    >
      <Alert
        leftIcon={<AlertTriangle size={18} />}
        rounded="rounded-xl"
        variant={isActivate ? "info" : "danger"}
      >
        <p className="m-0 font-bold">
          Confirm Action: {title}
        </p>
        <p className="m-0 mt-1 text-sm">
          Are you sure you want to set <span className="font-black">{laundry.companyName}</span> as{" "}
          <span className="font-bold">{targetAction}</span>?
          {isActivate
            ? " The facility will become eligible for operational dispatch batches and business linkings."
            : isSuspend
            ? " The facility will be completely locked from receiving new dispatch batches or scanning items until unsuspended."
            : " The facility will be temporarily marked inactive. Active operations may be paused."}
        </p>
      </Alert>
    </Modal>
  );
};

export default LaundryStatusModal;
