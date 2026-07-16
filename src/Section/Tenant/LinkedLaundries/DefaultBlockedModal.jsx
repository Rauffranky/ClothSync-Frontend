import { AlertTriangle } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Modal from "../../../Components/UI/Modal";

const DefaultBlockedModal = ({ isOpen, onClose, laundry }) => {
  return (
    <Modal
      footer={
        <Button onClick={onClose} size="sm" variant="danger">
          Got It
        </Button>
      }
      onClose={onClose}
      open={isOpen}
      title="Default Laundry Cannot Be Unlinked"
      width={500}
    >
      <Alert
        leftIcon={<AlertTriangle size={18} />}
        rounded="rounded-xl"
        variant="danger"
      >
        <p className="m-0 font-bold">Set another laundry as default first.</p>
        <p className="m-0 mt-1 text-sm">
          <span className="font-black">{laundry?.name || "This laundry"}</span> is
          currently the default laundry. Select another linked laundry as default,
          then try unlinking again.
        </p>
      </Alert>
    </Modal>
  );
};

export default DefaultBlockedModal;
