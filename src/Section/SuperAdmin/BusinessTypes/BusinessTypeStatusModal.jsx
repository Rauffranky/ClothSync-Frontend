import { useState } from "react";
import { AlertTriangle, CircleCheck, CircleX } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Modal from "../../../Components/UI/Modal";
import { getApiErrorMessage } from "../../../axios/api";
import { updateAdminBusinessTypeStatus } from "../../../axios/adminBusinessTypes/adminBusinessTypes";
import { toast } from "../../../Utils/toast";

const BusinessTypeStatusModal = ({ actionData, onClose, onSaved }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const typeItem = actionData?.typeItem;
  const isActivate = actionData?.action === "active";

  if (!typeItem) return null;

  const handleClose = () => {
    if (!isSubmitting) onClose?.();
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const response = await updateAdminBusinessTypeStatus(
        typeItem.id,
        isActivate ? "active" : "inactive",
      );
      toast.success(
        response?.message ||
          `Business type marked as ${isActivate ? "active" : "inactive"}`,
      );
      onSaved?.();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update business type status"),
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
            {isActivate ? "Activate Type" : "Deactivate Type"}
          </Button>
        </>
      }
      onClose={handleClose}
      open
      title={isActivate ? "Activate Business Type" : "Deactivate Business Type"}
      width={500}
    >
      <Alert
        leftIcon={<AlertTriangle size={18} />}
        rounded="rounded-xl"
        variant={isActivate ? "info" : "danger"}
      >
        <p className="m-0 font-bold">
          {isActivate
            ? "Confirm Type Activation"
            : "Confirm Type Deactivation"}
        </p>
        <p className="m-0 mt-1 text-sm">
          Are you sure you want to set{" "}
          <span className="font-black">{typeItem.name}</span> as{" "}
          <span className="font-bold">
            {isActivate ? "active" : "inactive"}
          </span>
          ?
          {!isActivate &&
            " Inactive types will not be available for selection during new business registration or profile completion."}
        </p>
      </Alert>
    </Modal>
  );
};

export default BusinessTypeStatusModal;
