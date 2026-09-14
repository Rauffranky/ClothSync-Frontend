import { useState } from "react";
import { AlertTriangle, CircleCheck, CircleX } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Modal from "../../../Components/UI/Modal";
import { getApiErrorMessage } from "../../../axios/api";
import { updateAdminTenantStatus } from "../../../axios/adminTenants/adminTenants";
import { toast } from "../../../Utils/toast";

const BusinessStatusModal = ({ actionData, onClose, onSaved }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const business = actionData?.business;
  const isActivate = actionData?.action === "active";

  if (!business) return null;

  const handleClose = () => {
    if (!isSubmitting) onClose?.();
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const response = await updateAdminTenantStatus(
        business.apiId || business.id,
        isActivate ? "active" : "inactive",
      );
      toast.success(
        response?.message ||
          `Business marked as ${isActivate ? "active" : "inactive"}`,
      );
      onSaved?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update business status"));
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
            {isActivate ? "Activate Business" : "Deactivate Business"}
          </Button>
        </>
      }
      onClose={handleClose}
      open
      title={isActivate ? "Activate Business" : "Deactivate Business"}
      width={500}
    >
      <Alert
        leftIcon={<AlertTriangle size={18} />}
        rounded="rounded-xl"
        variant={isActivate ? "info" : "danger"}
      >
        <p className="m-0 font-bold">
          {isActivate ? "Confirm Business Activation" : "Confirm Business Deactivation"}
        </p>
        <p className="m-0 mt-1 text-sm">
          Are you sure you want to set <span className="font-black">{business.businessName}</span> as{" "}
          <span className="font-bold">{isActivate ? "active" : "inactive"}</span>?
          {!isActivate
            ? " Users associated with this business will not be able to log in until reactivated. An email notification will be sent to the account owner."
            : " An email notification will be sent to the account owner informing them that their access has been restored."}
        </p>
      </Alert>
    </Modal>
  );
};

export default BusinessStatusModal;
