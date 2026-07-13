import { AlertTriangle, Unlink } from "lucide-react";
import Modal from "../../../Components/UI/Modal";
import Button from "../../../Components/UI/Button";
import Alert from "../../../Components/UI/Alert";

const UnlinkLaundryModal = ({ isOpen, onClose, laundry, onConfirm }) => {
  return (
    <Modal
      footer={
        <>
          <Button onClick={onClose} size="sm" variant="secondary">
            Cancel
          </Button>
          <Button
            leftIcon={<Unlink size={18} />}
            onClick={onConfirm}
            size="sm"
            variant={laundry?.status === "Suspend" ? "success" : "danger"}
          >
            {laundry?.status === "Suspend"
              ? "Connect Laundry"
              : "Unlink Laundry"}
          </Button>
        </>
      }
      onClose={onClose}
      open={isOpen}
      title={
        laundry?.status === "Suspend"
          ? "Connect Laundry"
          : "Unlink Laundry"
      }
      width={520}
    >
      {laundry && (
        <div className="space-y-4">
          <Alert
            leftIcon={<AlertTriangle size={18} />}
            rounded="rounded-xl"
            variant={laundry.status === "Suspend" ? "info" : "danger"}
          >
            <p className="m-0 font-bold">
              {laundry.status === "Suspend"
                ? "Confirm connect request"
                : "Confirm unlink request"}
            </p>
            <p className="m-0 mt-1 text-sm">
              {laundry.status === "Suspend" ? (
                <>
                  You are about to connect{" "}
                  <span className="font-black">{laundry.name}</span>{" "}
                  again for this tenant account.
                </>
              ) : (
                <>
                  You are about to unlink{" "}
                  <span className="font-black">{laundry.name}</span>{" "}
                  from this tenant account. This will move the laundry to
                  Suspend status instead of deleting it.
                </>
              )}
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
