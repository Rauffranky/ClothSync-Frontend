import { useState } from "react";
import { AlertTriangle, CircleCheck, CircleX } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Modal from "../../../Components/UI/Modal";
import { getApiErrorMessage } from "../../../axios/api";
import { updateTenantCategoryStatus } from "../../../axios/categories/tenantCategories";
import { toast } from "../../../Utils/toast";

const CategoryStatusModal = ({ actionData, onClose, onSaved }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const category = actionData?.category;
  const isActivate = actionData?.action === "active";

  if (!category) return null;

  const handleClose = () => {
    if (!isSubmitting) onClose?.();
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const response = await updateTenantCategoryStatus(
        category.apiId || category.id,
        isActivate ? "active" : "inactive",
      );
      toast.success(
        response?.message ||
          `Category set to ${isActivate ? "active" : "inactive"}`,
      );
      onSaved?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update category status"));
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
            {isActivate ? "Set Active" : "Set Inactive"}
          </Button>
        </>
      }
      onClose={handleClose}
      open
      title={isActivate ? "Set Category Active" : "Set Category Inactive"}
      width={500}
    >
      <Alert
        leftIcon={<AlertTriangle size={18} />}
        rounded="rounded-xl"
        variant={isActivate ? "info" : "danger"}
      >
        <p className="m-0 font-bold">
          {isActivate ? "Confirm active status" : "Confirm inactive status"}
        </p>
        <p className="m-0 mt-1 text-sm">
          Set <span className="font-black">{category.name}</span> as{" "}
          {isActivate ? "active" : "inactive"}.
        </p>
      </Alert>
    </Modal>
  );
};

export default CategoryStatusModal;
