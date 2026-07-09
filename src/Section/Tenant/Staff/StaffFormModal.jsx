import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Modal from "../../../Components/UI/Modal";
import { roleOptions } from "./data";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  role: "",
  location: "",
  sendInvite: false,
};

const editableRoleOptions = roleOptions.filter((option) => option.value !== "all");

const StaffFormModal = ({ mode = "add", open, staff, onClose, onSubmit }) => {
  const isEdit = mode === "edit";
  const initialValues =
    isEdit && staff
      ? {
          name: staff.name ?? "",
          email: staff.email ?? "",
          phone: staff.phone ?? "",
          role: staff.role ?? "",
          location: staff.location ?? "",
          sendInvite: false,
        }
      : emptyForm;

  return (
    <StaffFormModalContent
      initialValues={initialValues}
      isEdit={isEdit}
      key={`${open ? "open" : "closed"}-${mode}-${staff?.id ?? "new"}`}
      mode={mode}
      onClose={onClose}
      onSubmit={onSubmit}
      open={open}
      staff={staff}
    />
  );
};

const StaffFormModalContent = ({
  initialValues,
  isEdit,
  open,
  staff,
  onClose,
  onSubmit,
}) => {
  const [formValues, setFormValues] = useState(initialValues);

  const canSubmit = useMemo(
    () =>
      formValues.name.trim() &&
      formValues.email.trim() &&
      formValues.role &&
      formValues.location.trim(),
    [formValues],
  );

  const updateField = (field, value) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    onSubmit?.({
      ...staff,
      ...formValues,
      name: formValues.name.trim(),
      email: formValues.email.trim(),
      phone: formValues.phone.trim(),
      location: formValues.location.trim(),
      role: formValues.role,
    });
    onClose?.();
  };

  const title = isEdit ? "Edit Staff" : "Add Staff";
  const primaryLabel = isEdit
    ? "Save Changes"
    : formValues.sendInvite
      ? "Save & Send Invite"
      : "Save Staff";

  return (
    <Modal
      footer={
        <>
          <Button onClick={onClose} rounded="12px" size="md" variant="secondary">
            Cancel
          </Button>
          <Button
            disabled={!canSubmit}
            
            onClick={handleSubmit}
            rounded="12px"
            size="md"
            type="submit"
          >
            {primaryLabel}
          </Button>
        </>
      }
      onClose={onClose}
      open={open}
      title={title}
      width={430}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Alert leftIcon={<Info size={16} />} rounded="rounded-xl" size="sm" variant="info">
          Staff users can only access modules and locations assigned by the Business
          Admin.
        </Alert>

        <Input
          label="Full Name"
          onChange={(value) => updateField("name", value)}
          placeholder="e.g. Sarah Mitchell"
          required
          value={formValues.name}
        />

        <Input
          label="Email Address"
          onChange={(value) => updateField("email", value)}
          placeholder="e.g. sarah@company.com"
          required
          type="email"
          value={formValues.email}
        />

        <Input
          label="Phone Number"
          onChange={(value) => updateField("phone", value)}
          placeholder="+1 (555) 000-0000"
          value={formValues.phone}
        />

        <Dropdown
          label="Role / Job Title"
          onChange={(value) => updateField("role", value)}
          options={editableRoleOptions}
          placeholder="e.g. Operations Manager"
          value={formValues.role || null}
        />

        <Input
          label="Assigned Location / Site"
          onChange={(value) => updateField("location", value)}
          placeholder="e.g. Downtown Hub"
          required
          value={formValues.location}
        />

        {!isEdit && (
          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-(--theme-text-secondary)">
            <input
              checked={formValues.sendInvite}
              className="h-4 w-4 accent-(--color-aurora-teal)"
              onChange={(event) => updateField("sendInvite", event.target.checked)}
              type="checkbox"
            />
            Send invite email to staff member
          </label>
        )}
      </form>
    </Modal>
  );
};

export default StaffFormModal;
