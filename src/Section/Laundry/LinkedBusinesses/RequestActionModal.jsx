import { Check, ShieldAlert, X } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Input from "../../../Components/UI/Input";
import Modal from "../../../Components/UI/Modal";

const RequestActionModal = ({
  actionData,
  isSubmitting,
  onClose,
  onConfirm,
  onReasonChange,
  rejectionReason,
}) => {
  const isAccept = actionData?.action === "accept";

  return (
    <Modal
      closeOnBackdrop={!isSubmitting}
      footer={
        <>
          <Button
            disabled={isSubmitting}
            onClick={onClose}
            size="sm"
            variant="secondary"
          >
            Back
          </Button>
          <Button
            leftIcon={isAccept ? <Check size={17} /> : <X size={17} />}
            loading={isSubmitting}
            onClick={onConfirm}
            size="sm"
            variant={isAccept ? "success" : "danger"}
          >
            {isAccept ? "Accept Request" : "Reject Request"}
          </Button>
        </>
      }
      onClose={isSubmitting ? undefined : onClose}
      open={Boolean(actionData)}
      title={isAccept ? "Accept Connection Request" : "Reject Connection Request"}
      width={540}
    >
      {actionData && (
        <div className="space-y-4">
          <Alert
            leftIcon={<ShieldAlert size={18} />}
            variant={isAccept ? "success" : "danger"}
          >
            {isAccept ? (
              <>
                Accept the connection request from{" "}
                <span className="font-black">{actionData.request.name}</span>?
              </>
            ) : (
              <>
                Reject the connection request from{" "}
                <span className="font-black">{actionData.request.name}</span>?
              </>
            )}
          </Alert>

          {!isAccept && (
            <Input
              disabled={isSubmitting}
              label="Rejection Reason"
              multiline
              onChange={onReasonChange}
              placeholder="Optional reason for rejecting this request"
              rows={3}
              value={rejectionReason}
            />
          )}
        </div>
      )}
    </Modal>
  );
};

export default RequestActionModal;
