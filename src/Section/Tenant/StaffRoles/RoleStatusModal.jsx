import { AlertTriangle, CircleCheck, Power } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Modal from "../../../Components/UI/Modal";

const RoleStatusModal = ({ actionData, isSubmitting, onClose, onConfirm }) => {
  const role = actionData?.role;
  const isDeactivate = actionData?.action === "deactivate";

  if (!role) return null;

  const handleClose = () => {
    if (!isSubmitting) onClose?.();
  };

  return (
    <Modal
      closeOnBackdrop={!isSubmitting}
      footer={
        <>
          <Button
            disabled={isSubmitting}
            onClick={handleClose}
            size="sm"
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            leftIcon={
              isDeactivate ? (
                <AlertTriangle size={17} />
              ) : (
                <CircleCheck size={17} />
              )
            }
            loading={isSubmitting}
            onClick={() => onConfirm?.(actionData)}
            size="sm"
            variant={isDeactivate ? "danger" : "success"}
          >
            {isDeactivate ? "Deactivate Role" : "Activate Role"}
          </Button>
        </>
      }
      onClose={handleClose}
      open
      title={isDeactivate ? "Deactivate Role" : "Activate Role"}
      width={560}
    >
      <div className="space-y-4">
        <Alert
          leftIcon={<Power size={18} />}
          variant={isDeactivate ? "danger" : "success"}
        >
          <p className="m-0 font-bold">
            {isDeactivate
              ? "Staff assigned to this role may lose its access permissions."
              : "Staff assigned to this role will regain its access permissions."}
          </p>
          <p className="m-0 mt-1 text-sm">
            Confirm that you want to {isDeactivate ? "deactivate" : "activate"}{" "}
            <span className="font-black">{role.name}</span>.
          </p>
        </Alert>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-(--theme-border) bg-(--theme-surface) p-4">
          <div className="min-w-0">
            <p className="m-0 truncate font-bold text-(--theme-text-primary)">
              {role.name}
            </p>
            <p className="m-0 mt-1 text-sm font-medium text-(--theme-text-muted)">
              {role.staffCount} assigned staff
            </p>
          </div>
          <Badge dot size="sm" variant={role.statusVariant}>
            {role.status}
          </Badge>
        </div>
      </div>
    </Modal>
  );
};

export default RoleStatusModal;
