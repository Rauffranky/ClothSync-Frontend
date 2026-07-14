import { AlertTriangle, Star, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import Modal from "../../../Components/UI/Modal";
import Button from "../../../Components/UI/Button";
import Alert from "../../../Components/UI/Alert";
import { setTenantLaundryAsDefault } from "../../../axios/laundries/tenantLaundries";
import { getApiErrorMessage } from "../../../axios/api";
import { toast } from "../../../Utils/toast";

const DefaultConfirmModal = ({ isOpen, onClose, actionData, onConfirm, currentDefaultLaundry }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClose = () => {
    setIsSubmitting(false);
    setIsSuccess(false);
    onClose?.();
  };

  const handleConfirm = async () => {
    if (!actionData?.laundry?.apiId) {
      toast.error("Invalid laundry data");
      return;
    }

    setIsSubmitting(true);
    try {
      await setTenantLaundryAsDefault(actionData.laundry.apiId);
      toast.success("Default laundry set successfully");
      setIsSuccess(true);
      // Close modal after brief delay to show success state
      setTimeout(() => {
        setIsSuccess(false);
        onConfirm?.();
      }, 600);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to set default laundry"));
      setIsSubmitting(false);
    }
  };

  const isReplacingDefault = 
    actionData?.action === "set" && 
    currentDefaultLaundry && 
    currentDefaultLaundry.id !== actionData?.laundry?.id;

  return (
    <Modal
      footer={
        <>
          <Button
            onClick={handleClose}
            size="sm"
            variant="secondary"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            leftIcon={
              isSuccess ? (
                <CheckCircle2 size={18} />
              ) : isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Star size={18} />
              )
            }
            onClick={handleConfirm}
            size="sm"
            variant={isSuccess ? "success" : isReplacingDefault ? "warning" : "success"}
            disabled={isSubmitting || isSuccess}
          >
            {isSuccess ? "Default Set!" : isSubmitting ? "Setting..." : "Set As Default"}
          </Button>
        </>
      }
      onClose={handleClose}
      open={isOpen}
      title="Set Default Laundry"
      width={520}
    >
      {actionData && (
        <div className="space-y-4">
          {isReplacingDefault && (
            <Alert
              leftIcon={<AlertTriangle size={18} />}
              rounded="rounded-xl"
              variant="danger"
            >
              <p className="m-0 font-bold">Replacing current default laundry</p>
              <p className="m-0 mt-1 text-sm">
                <span className="font-black">{currentDefaultLaundry.name}</span> is currently set as default.
                Setting <span className="font-black">{actionData.laundry.name}</span> as default will replace it.
              </p>
            </Alert>
          )}
          <Alert
            leftIcon={<AlertTriangle size={18} />}
            rounded="rounded-xl"
            variant="info"
          >
            <p className="m-0 font-bold">Confirm default laundry</p>
            <p className="m-0 mt-1 text-sm">
              Set{" "}
              <span className="font-black">
                {actionData.laundry.name}
              </span>{" "}
              as the default laundry for this tenant.
            </p>
          </Alert>
        </div>
      )}
    </Modal>
  );
};

export default DefaultConfirmModal;
