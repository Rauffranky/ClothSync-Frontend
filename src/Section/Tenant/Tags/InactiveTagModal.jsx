import { AlertTriangle } from "lucide-react";
import Modal from "../../../Components/UI/Modal";
import Button from "../../../Components/UI/Button";
import Alert from "../../../Components/UI/Alert";

const InactiveTagModal = ({ isOpen, onClose, tag }) => {
  const tagId = tag?.id || "Unknown Tag";
  const assetName = tag?.assignedAsset || "this tag";

  return (
    <Modal
      footer={
        <>
          <Button onClick={onClose} size="sm" variant="secondary">
            Cancel
          </Button>
          <Button onClick={onClose} size="sm" variant="danger">
            Mark Inactive
          </Button>
        </>
      }
      onClose={onClose}
      open={isOpen}
      title="Inactive Tag"
      description="Review the selected tag before marking it inactive."
      width={560}
    >
      <Alert leftIcon={<AlertTriangle size={18} />} rounded="rounded-xl" variant="danger">
        <p className="m-0 font-bold">Are you sure you want to mark this tag inactive?</p>
        <p className="m-0 mt-1 text-sm">
          <span className="font-black">{tagId}</span> assigned to <span className="font-black">{assetName}</span> will be treated as inactive after confirmation.
        </p>
      </Alert>
    </Modal>
  );
};

export default InactiveTagModal;
