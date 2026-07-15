import { AlertTriangle, Unlink } from "lucide-react";
import Modal from "../../../Components/UI/Modal";
import Button from "../../../Components/UI/Button";
import Alert from "../../../Components/UI/Alert";

const UnlinkLaundryModal = ({
  isOpen,
  onClose,
  laundry,
  onConfirm,
  isSubmitting = false,
}) => {
  return (
    <Modal
      footer={
        <>
          <Button
            disabled={isSubmitting}
            onClick={onClose}
            size="sm"
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            leftIcon={<Unlink size={18} />}
            loading={isSubmitting}
            onClick={onConfirm}
            size="sm"
            variant="danger"
          >
            Unlink Laundry
          </Button>
        </>
      }
      onClose={isSubmitting ? undefined : onClose}
      open={isOpen}
      title="Unlink Laundry"
      width={520}
    >
      {laundry && (
        <div className="space-y-4">
          <Alert
            leftIcon={<AlertTriangle size={18} />}
            rounded="rounded-xl"
            variant="danger"
          >
            <p className="m-0 font-bold">Confirm unlink request</p>
            <p className="m-0 mt-1 text-sm">
              You are about to unlink{" "}
              <span className="font-black">{laundry.name}</span> from this tenant
              account.
            </p>
          </Alert>

          <div className="rounded-xl border border-(--theme-border) bg-(--button-ghost-bg) px-4 py-3 text-sm">
            <div className="flex items-center justify-between gap-4 py-1">
              <span className="font-semibold text-(--theme-text-muted)">
                Contact
              </span>
              <span className="text-right font-bold text-(--theme-text-primary)">
                {laundry.contact}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 py-1">
              <span className="font-semibold text-(--theme-text-muted)">
                Status
              </span>
              <span className="text-right font-bold text-(--theme-text-primary)">
                {laundry.status}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 py-1">
              <span className="font-semibold text-(--theme-text-muted)">
                Default
              </span>
              <span className="text-right font-bold text-(--theme-text-primary)">
                {laundry.isDefault ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default UnlinkLaundryModal;
