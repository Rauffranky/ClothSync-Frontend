import { AlertTriangle } from "lucide-react";
import Modal from "../../../Components/UI/Modal";
import Button from "../../../Components/UI/Button";
import Alert from "../../../Components/UI/Alert";

const DefaultBlockedModal = ({ isOpen, onClose, blockedLaundry, currentDefaultLaundry }) => {
  return (
    <Modal
      footer={
        <Button onClick={onClose} size="sm" variant="danger">
          Got It
        </Button>
      }
      onClose={onClose}
      open={isOpen}
      title="Unset Default Laundry First"
      width={500}
    >
      <Alert
        leftIcon={<AlertTriangle size={18} />}
        rounded="rounded-xl"
        variant="danger"
      >
        <p className="m-0 font-bold">Only one laundry can be default.</p>
        <p className="m-0 mt-1 text-sm">
          {currentDefaultLaundry?.name || "Another laundry"} is already set as
          default. Unset it first, then set{" "}
          {blockedLaundry?.name || "this laundry"} as default.
        </p>
      </Alert>
    </Modal>
  );
};

export default DefaultBlockedModal;
