import { AlertTriangle, CircleCheck, Info, UserRound } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";
import Button from "../../../Components/UI/Button";
import Modal from "../../../Components/UI/Modal";

const StaffStatusModal = ({
  actionData,
  isSubmitting = false,
  onClose,
  onConfirm,
}) => {
  const staff = actionData?.staff;
  const isDeactivate = actionData?.action === "deactivate";

  if (!staff) return null;

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
            rounded="12px"
            size="sm"
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            leftIcon={
              isDeactivate ? (
                <AlertTriangle size={16} />
              ) : (
                <CircleCheck size={16} />
              )
            }
            loading={isSubmitting}
            onClick={() => onConfirm?.(actionData)}
            rounded="12px"
            size="sm"
            variant={isDeactivate ? "danger" : "success"}
          >
            {isDeactivate ? "Deactivate Staff" : "Activate Staff"}
          </Button>
        </>
      }
      onClose={handleClose}
      open
      title={isDeactivate ? "Deactivate Staff" : "Activate Staff"}
      width={620}
    >
      <div className="space-y-5">
        <Alert
          leftIcon={<Info size={18} />}
          rounded="rounded-2xl"
          variant={isDeactivate ? "danger" : "success"}
        >
          <p className="m-0 font-bold">
            {isDeactivate
              ? "This staff member will lose access to assigned modules and locations."
              : "This staff member will regain access based on their assigned role."}
          </p>
          <p className="m-0 mt-1 text-sm font-medium">
            Confirm that you want to {isDeactivate ? "deactivate" : "activate"}{" "}
            <span className="font-black">{staff.name}</span>.
          </p>
        </Alert>

        <div className="rounded-2xl border border-(--theme-border) bg-(--button-ghost-bg) p-4">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl border border-(--theme-border-soft) bg-(--theme-surface-strong)">
              <UserRound size={20} className="text-(--color-aurora-teal)" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="m-0 text-lg font-bold text-(--theme-text-primary)">
                  {staff.name}
                </h3>
                <Badge size="sm" variant={staff.statusVariant}>
                  {staff.status}
                </Badge>
                <Badge size="sm" variant={staff.permissionVariant}>
                  {staff.permission}
                </Badge>
              </div>
              <p className="m-0 mt-1 font-mono text-sm font-semibold text-(--theme-text-muted)">
                {staff.email}
              </p>
              <p className="m-0 mt-2 text-sm font-medium text-(--theme-text-secondary)">
                {staff.role} - {staff.location}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default StaffStatusModal;
