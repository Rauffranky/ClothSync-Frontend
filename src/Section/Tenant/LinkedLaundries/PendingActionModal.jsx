import { AlertTriangle, Send, Ban } from "lucide-react";
import Modal from "../../../Components/UI/Modal";
import Button from "../../../Components/UI/Button";
import Alert from "../../../Components/UI/Alert";

const PendingActionModal = ({ isOpen, onClose, actionData, onConfirm, isSubmitting }) => {
  const isResend = actionData?.action === "resend";

  return (
    <Modal
      footer={
        <>
          <Button onClick={onClose} size="sm" variant="secondary" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            leftIcon={isResend ? <Send size={18} /> : <Ban size={18} />}
            onClick={() => onConfirm(actionData)}
            size="sm"
            variant={isResend ? "primary" : "danger"}
            loading={isSubmitting}
          >
            {isResend ? "Resend Invitation" : "Cancel Invitation"}
          </Button>
        </>
      }
      onClose={isSubmitting ? undefined : onClose}
      open={isOpen}
      title={isResend ? "Resend Invitation" : "Cancel Invitation"}
      width={520}
    >
      {actionData && (
        <Alert
          leftIcon={<AlertTriangle size={18} />}
          rounded="rounded-xl"
          variant={isResend ? "info" : "danger"}
        >
          <p className="m-0 font-bold">
            {isResend ? "Confirm Resend" : "Confirm Cancel"}
          </p>
          <p className="m-0 mt-1 text-sm">
            {isResend ? (
              <>
                Are you sure you want to resend the invitation to{" "}
                <span className="font-black">{actionData.request.email}</span>?
              </>
            ) : (
              <>
                Are you sure you want to cancel the invitation sent to{" "}
                <span className="font-black">{actionData.request.email}</span>? This action cannot be undone.
              </>
            )}
          </p>
        </Alert>
      )}
    </Modal>
  );
};

export default PendingActionModal;
