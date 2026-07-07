import { AlertTriangle, Star, StarOff } from "lucide-react";
import Modal from "../../../Components/UI/Modal";
import Button from "../../../Components/UI/Button";
import Alert from "../../../Components/UI/Alert";

const DefaultConfirmModal = ({ isOpen, onClose, actionData, onConfirm }) => {
  return (
    <Modal
      footer={
        <>
          <Button
            onClick={onClose}
            size="sm"
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            leftIcon={
              actionData?.action === "set" ? (
                <Star size={18} />
              ) : (
                <StarOff size={18} />
              )
            }
            onClick={onConfirm}
            size="sm"
            variant={actionData?.action === "set" ? "success" : "warning"}
          >
            {actionData?.action === "set"
              ? "Set As Default"
              : "Unset Default"}
          </Button>
        </>
      }
      onClose={onClose}
      open={isOpen}
      title={
        actionData?.action === "set"
          ? "Set Default Laundry"
          : "Unset Default Laundry"
      }
      width={520}
    >
      {actionData && (
        <Alert
          leftIcon={<AlertTriangle size={18} />}
          rounded="rounded-xl"
          variant="info"
        >
          <p className="m-0 font-bold">
            {actionData.action === "set"
              ? "Confirm default laundry"
              : "Confirm unset default"}
          </p>
          <p className="m-0 mt-1 text-sm">
            {actionData.action === "set" ? (
              <>
                Set{" "}
                <span className="font-black">
                  {actionData.laundry.name}
                </span>{" "}
                as the default laundry for this tenant.
              </>
            ) : (
              <>
                Unset{" "}
                <span className="font-black">
                  {actionData.laundry.name}
                </span>{" "}
                as the default laundry. No laundry will be default until you
                set another one.
              </>
            )}
          </p>
        </Alert>
      )}
    </Modal>
  );
};

export default DefaultConfirmModal;
