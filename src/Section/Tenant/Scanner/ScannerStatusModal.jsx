import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CircleCheck, Info, Radio } from "lucide-react";
import Modal from "../../../Components/UI/Modal";
import Button from "../../../Components/UI/Button";
import Input from "../../../Components/UI/Input";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";

const ScannerStatusModal = ({ isOpen, onClose, actionData, onConfirm }) => {
  const [reason, setReason] = useState("");
  const wasOpenRef = useRef(false);
  const isDeactivate = actionData?.action === "deactivate";

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setReason("");
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  const handleClose = () => {
    setReason("");
    onClose?.();
  };

  const handleConfirm = () => {
    onConfirm?.({ ...actionData, reason: reason.trim() });
    handleClose();
  };

  if (!actionData) return null;

  return (
    <Modal
      footer={
        <>
          <Button onClick={handleClose} rounded="12px" size="sm" variant="secondary">
            Cancel
          </Button>
          <Button
            leftIcon={isDeactivate ? <AlertTriangle size={16} /> : <CircleCheck size={16} />}
            onClick={handleConfirm}
            rounded="12px"
            size="sm"
            variant={isDeactivate ? "danger" : "success"}
          >
            {isDeactivate ? "Deactivate Scanner" : "Activate Scanner"}
          </Button>
        </>
      }
      onClose={handleClose}
      open={isOpen}
      title={isDeactivate ? "Deactivate Scanner" : "Activate Scanner"}
      width={640}
    >
      <div className="space-y-5">
        <Alert
          leftIcon={<Info size={18} />}
          rounded="rounded-2xl"
          variant={isDeactivate ? "danger" : "success"}
        >
          <p className="m-0 font-bold">
            {isDeactivate
              ? "This scanner will stop reading tags until it is reactivated."
              : "This scanner will become active and resume reading tags."}
          </p>
          <p className="m-0 mt-1 text-sm font-medium">
            {isDeactivate
              ? "Please confirm the scanner status change before continuing."
              : "Please confirm this scanner should be brought back online."}
          </p>
        </Alert>

        <div className="rounded-2xl border border-(--theme-border) bg-(--button-ghost-bg) p-4">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl border border-(--theme-border-soft) bg-(--theme-surface-strong)">
              <Radio size={20} className="text-(--color-aurora-teal)" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="m-0 text-lg font-bold text-(--theme-text-primary)">
                  {actionData.scanner.name}
                </h3>
                <Badge
                  size="sm"
                  variant={
                    actionData.scanner.status === "Inactive"
                      ? "danger"
                      : "success"
                  }
                >
                  {actionData.scanner.status}
                </Badge>
                <Badge size="sm" variant={actionData.scanner.type === "Portable" ? "warning" : "purple"}>
                  {actionData.scanner.type}
                </Badge>
              </div>
              <p className="m-0 mt-1 font-mono text-sm font-semibold text-(--theme-text-muted)">
                {actionData.scanner.id}
              </p>
              <p className="m-0 mt-2 text-sm font-medium text-(--theme-text-secondary)">
                {actionData.scanner.location}
              </p>
            </div>
          </div>
        </div>

        <Input
          label="Reason / Note"
          multiline
          onChange={setReason}
          placeholder={
            isDeactivate
              ? "Optional note for deactivation..."
              : "Optional note for activation..."
          }
          rows={4}
          value={reason}
        />
      </div>
    </Modal>
  );
};

export default ScannerStatusModal;
