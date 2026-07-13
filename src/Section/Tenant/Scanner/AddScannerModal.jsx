import { useEffect, useRef } from "react";
import {
  CircleCheck,
  CircleX,
  Hash,
  MapPin,
  Radio,
  Smartphone,
  User,
} from "lucide-react";
import { useFormik } from "formik";
import * as yup from "yup";
import Modal from "../../../Components/UI/Modal";
import Button from "../../../Components/UI/Button";
import Input from "../../../Components/UI/Input";
import Dropdown from "../../../Components/UI/Dropdown";

const operatorOptions = [
  { label: "Alex Torres", value: "Alex Torres" },
  { label: "Maria Santos", value: "Maria Santos" },
  { label: "James Dawson", value: "James Dawson" },
  { label: "Sarah Kim", value: "Sarah Kim" },
];

const scannerModeOptions = [
  { label: "Entry", value: "Entry" },
  { label: "Exit", value: "Exit" },
  { label: "Manual", value: "Manual" },
  { label: "Auto", value: "Auto" },
];

const signalStatusOptions = [
  { label: "Online", value: "online" },
  { label: "Offline", value: "offline" },
];

const initialFormState = {
  scannerName: "",
  scannerId: "",
  scannerType: "Fixed",
  scannerMode: "Entry",
  zoneName: "",
  assignedOperator: null,
  assignedOperatorId: "",
  status: "Active",
  signalStatus: "online",
  firmwareVersion: "",
  batteryLevel: 100,
  customNotes: "",
};

const scannerValidationSchema = yup.object({
  scannerName: yup.string().trim().required("Scanner name is required"),
  scannerId: yup.string().trim().required("Scanner ID is required"),
  scannerType: yup
    .string()
    .oneOf(["Fixed", "Portable"])
    .required("Scanner type is required"),
  scannerMode: yup.string().when("scannerType", {
    is: "Fixed",
    then: (schema) => schema.required("Scanner mode is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  zoneName: yup.string().when("scannerType", {
    is: "Fixed",
    then: (schema) => schema.trim().required("Zone name is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const createScannerValidationSchema = scannerValidationSchema.shape({
  scannerMode: yup.string().required("Scanner mode is required"),
  assignedOperatorId: yup
    .string()
    .trim()
    .uuid("Assigned operator ID must be a valid UUID"),
  signalStatus: yup
    .string()
    .oneOf(["online", "offline"])
    .required("Signal status is required"),
  firmwareVersion: yup.string().trim().required("Firmware version is required"),
  batteryLevel: yup
    .number()
    .typeError("Battery level must be a number")
    .integer("Battery level must be a whole number")
    .min(0, "Battery level cannot be below 0")
    .max(100, "Battery level cannot exceed 100")
    .required("Battery level is required"),
});

const scannerTypeCards = [
  {
    value: "Fixed",
    label: "Fixed",
    icon: Radio,
    activeStyle: {
      color: "var(--color-aurora-teal)",
      background: "rgba(20, 184, 166, 0.12)",
      borderColor: "rgba(20, 184, 166, 0.28)",
      boxShadow: "0 0 0 3px rgba(20, 184, 166, 0.08)",
    },
  },
  {
    value: "Portable",
    label: "Portable",
    icon: Smartphone,
    activeStyle: {
      color: "var(--theme-text-primary)",
      background: "rgba(99, 102, 241, 0.1)",
      borderColor: "rgba(99, 102, 241, 0.26)",
      boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.06)",
    },
  },
];

const AddScannerModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode = "add",
  initialValues = initialFormState,
}) => {
  const resolvedInitialValues = {
    ...initialFormState,
    ...initialValues,
    assignedOperator: initialValues?.assignedOperator ?? null,
    assignedOperatorId: initialValues?.assignedOperatorId ?? "",
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: resolvedInitialValues,
    validationSchema:
      mode === "add" ? createScannerValidationSchema : scannerValidationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      const sharedPayload = {
        scannerName: values.scannerName.trim(),
        scannerId: values.scannerId.trim(),
        scannerType: values.scannerType,
        status: values.status,
        customNotes: values.customNotes.trim(),
      };
      const payload =
        mode === "add"
          ? {
              ...sharedPayload,
              scannerMode: values.scannerMode,
              assignedOperatorId: values.assignedOperatorId.trim(),
              signalStatus: values.signalStatus,
              firmwareVersion: values.firmwareVersion.trim(),
              batteryLevel: Number(values.batteryLevel),
              zoneName: values.zoneName.trim(),
            }
          : {
              ...sharedPayload,
              assignedOperator: values.assignedOperator,
              ...(values.scannerType === "Fixed"
                ? {
                    scannerMode: values.scannerMode,
                    zoneName: values.zoneName.trim(),
                  }
                : {}),
            };

      try {
        await onSubmit?.(payload);
        resetForm();
        onClose?.();
      } catch {
        // The submit owner displays the API error and the modal stays open.
      } finally {
        setSubmitting(false);
      }
    },
  });
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      formik.resetForm();
    }
    wasOpenRef.current = isOpen;
  }, [formik, isOpen]);

  const getFieldError = (field) =>
    formik.errors[field] && (formik.touched[field] || formik.submitCount > 0)
      ? formik.errors[field]
      : "";

  const hasFieldError = (field) => Boolean(getFieldError(field));

  const setField = (field, value) => {
    formik.setFieldValue(field, value);
  };

  const handleScannerTypeChange = (nextType) => {
    formik.setFieldValue("scannerType", nextType);
    if (nextType === "Fixed" || mode === "add") {
      formik.setFieldValue("scannerMode", formik.values.scannerMode || "Entry");
    } else {
      formik.setFieldValue("scannerMode", "", false);
    }
    if (nextType !== "Fixed") formik.setFieldValue("zoneName", "", false);
  };

  const handleClose = () => {
    if (formik.isSubmitting) return;
    formik.resetForm();
    onClose?.();
  };

  return (
    <Modal
      footer={
        <>
          <Button
            disabled={formik.isSubmitting}
            onClick={handleClose}
            rounded="12px"
            size="sm"
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            form="add-scanner-form"
            leftIcon={<CircleCheck size={16} />}
            loading={formik.isSubmitting}
            rounded="12px"
            size="sm"
            type="submit"
            variant="primary"
          >
            {mode === "edit" ? "Save Changes" : "Add Scanner"}
          </Button>
        </>
      }
      onClose={handleClose}
      open={isOpen}
      closeOnBackdrop={!formik.isSubmitting}
      title={mode === "edit" ? "Edit Scanner" : "Add New Scanner"}
      width={720}
    >
      <form className="space-y-5" id="add-scanner-form" noValidate onSubmit={formik.handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            error={hasFieldError("scannerName")}
            helperText={getFieldError("scannerName")}
            label="Scanner Name"
            leftIcon={<Radio size={18} />}
            name="scannerName"
            onBlur={formik.handleBlur}
            onChange={(value) => setField("scannerName", value)}
            placeholder="e.g. Main Entrance"
            required
            value={formik.values.scannerName}
          />

          <Input
            error={hasFieldError("scannerId")}
            helperText={getFieldError("scannerId")}
            label="Scanner ID"
            leftIcon={<Hash size={18} />}
            name="scannerId"
            onBlur={formik.handleBlur}
            onChange={(value) => setField("scannerId", value)}
            placeholder="e.g. SCN-ENT-007"
            required
            value={formik.values.scannerId}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-sm font-semibold text-(--theme-text-secondary)">
                Scanner Type <span className="text-(--color-overdue)">*</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {scannerTypeCards.map((item) => {
                const Icon = item.icon;
                const selected = formik.values.scannerType === item.value;

                return (
                  <Button
                    key={item.value}
                    disableHoverTransform
                    leftIcon={<Icon size={16} />}
                    onClick={() => handleScannerTypeChange(item.value)}
                    rounded="14px"
                    size="sm"
                    type="button"
                    variant="outline"
                    className="justify-start"
                    style={{
                      minHeight: 48,
                      background: selected
                        ? item.activeStyle.background
                        : "linear-gradient(145deg, var(--theme-surface-strong), var(--theme-surface))",
                      borderColor: selected
                        ? item.activeStyle.borderColor
                        : "var(--theme-border-soft)",
                      color: selected
                        ? item.activeStyle.color
                        : "var(--theme-text-secondary)",
                      boxShadow: selected
                        ? item.activeStyle.boxShadow
                        : "inset 0 1px 0 rgba(255, 255, 255, 0.18)",
                      outline: hasFieldError("scannerType")
                        ? "1px solid rgba(239, 68, 68, 0.4)"
                        : "none",
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </div>
            {hasFieldError("scannerType") && (
              <p className="mt-2 text-xs font-semibold text-(--color-overdue)">
                {getFieldError("scannerType")}
              </p>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-sm font-semibold text-(--theme-text-secondary)">
                Status
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                disableHoverTransform
                leftIcon={<CircleCheck size={16} />}
                onClick={() => setField("status", "Active")}
                rounded="14px"
                size="sm"
                type="button"
                variant="outline"
                className="justify-start"
                style={{
                  minHeight: 48,
                  background:
                    formik.values.status === "Active"
                      ? "rgba(34, 197, 94, 0.12)"
                      : "linear-gradient(145deg, var(--theme-surface-strong), var(--theme-surface))",
                  borderColor:
                    formik.values.status === "Active"
                      ? "rgba(34, 197, 94, 0.28)"
                      : "var(--theme-border-soft)",
                  color:
                    formik.values.status === "Active"
                      ? "var(--color-fresh-mint)"
                      : "var(--theme-text-secondary)",
                  boxShadow:
                    formik.values.status === "Active"
                      ? "0 0 0 3px rgba(34, 197, 94, 0.08)"
                      : "inset 0 1px 0 rgba(255, 255, 255, 0.18)",
                }}
              >
                Active
              </Button>

              <Button
                disableHoverTransform
                leftIcon={<CircleX size={16} />}
                onClick={() => setField("status", "Inactive")}
                rounded="14px"
                size="sm"
                type="button"
                variant="outline"
                className="justify-start"
                style={{
                  minHeight: 48,
                  background:
                    formik.values.status === "Inactive"
                      ? "color-mix(in srgb, var(--color-overdue) 12%, var(--theme-surface))"
                      : "linear-gradient(145deg, var(--theme-surface-strong), var(--theme-surface))",
                  borderColor:
                    formik.values.status === "Inactive"
                      ? "color-mix(in srgb, var(--color-overdue) 32%, var(--theme-border-soft))"
                      : "var(--theme-border-soft)",
                  color:
                    formik.values.status === "Inactive"
                      ? "var(--color-overdue)"
                      : "var(--theme-text-secondary)",
                  boxShadow:
                    formik.values.status === "Inactive"
                      ? "0 0 0 3px rgba(239, 68, 68, 0.08)"
                      : "inset 0 1px 0 rgba(255, 255, 255, 0.18)",
                }}
              >
                Inactive
              </Button>
            </div>
          </div>
        </div>

        {(mode === "add" || formik.values.scannerType === "Fixed") && (
          <>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-sm font-semibold text-(--theme-text-secondary)">
                  Scanner Mode <span className="text-(--color-overdue)">*</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {scannerModeOptions.map((item) => {
                  const selected = formik.values.scannerMode === item.value;

                  return (
                    <Button
                      key={item.value}
                      disableHoverTransform
                      onClick={() => setField("scannerMode", item.value)}
                      rounded="14px"
                      size="sm"
                      type="button"
                      variant="outline"
                      style={{
                        // minHeight: 46,
                        background: selected
                          ? "rgba(37, 99, 235, 0.12)"
                          : "linear-gradient(145deg, var(--theme-surface-strong), var(--theme-surface))",
                        borderColor: selected
                          ? "rgba(37, 99, 235, 0.28)"
                          : "var(--theme-border-soft)",
                        color: selected
                          ? "var(--button-info-text)"
                          : "var(--theme-text-secondary)",
                        boxShadow: selected
                          ? "0 0 0 3px rgba(37, 99, 235, 0.08)"
                          : "inset 0 1px 0 rgba(255, 255, 255, 0.18)",
                        outline: hasFieldError("scannerMode")
                          ? "1px solid rgba(239, 68, 68, 0.4)"
                          : "none",
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </div>
              {hasFieldError("scannerMode") && (
                <p className="mt-2 text-xs font-semibold text-(--color-overdue)">
                  {getFieldError("scannerMode")}
                </p>
              )}
            </div>

            {formik.values.scannerType === "Fixed" && (
              <Input
                error={hasFieldError("zoneName")}
                helperText={getFieldError("zoneName")}
                label="Zone Name"
                leftIcon={<MapPin size={18} />}
                name="zoneName"
                onBlur={formik.handleBlur}
                onChange={(value) => setField("zoneName", value)}
                placeholder="e.g gate number, area etc"
                value={formik.values.zoneName}
              />
            )}
          </>
        )}

        {mode === "add" ? (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                error={hasFieldError("assignedOperatorId")}
                helperText={getFieldError("assignedOperatorId")}
                label="Assigned Operator ID"
                leftIcon={<User size={16} />}
                name="assignedOperatorId"
                onBlur={formik.handleBlur}
                onChange={(value) => setField("assignedOperatorId", value)}
                placeholder="Optional operator UUID"
                value={formik.values.assignedOperatorId}
              />

              <Dropdown
                label="Signal Status"
                onChange={(value) => setField("signalStatus", value)}
                options={signalStatusOptions}
                value={formik.values.signalStatus}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Input
                error={hasFieldError("firmwareVersion")}
                helperText={getFieldError("firmwareVersion")}
                label="Firmware Version"
                name="firmwareVersion"
                onBlur={formik.handleBlur}
                onChange={(value) => setField("firmwareVersion", value)}
                placeholder="e.g. 1.0.0"
                required
                value={formik.values.firmwareVersion}
              />

              <Input
                error={hasFieldError("batteryLevel")}
                helperText={getFieldError("batteryLevel")}
                label="Battery Level"
                max={100}
                min={0}
                name="batteryLevel"
                onBlur={formik.handleBlur}
                onChange={(value) => setField("batteryLevel", value)}
                required
                type="number"
                value={formik.values.batteryLevel}
              />
            </div>
          </>
        ) : (
          <Dropdown
            label="Assigned Operator"
            leftIcon={<User size={16} className="text-(--theme-text-muted)" />}
            onChange={(value) => setField("assignedOperator", value)}
            options={operatorOptions}
            placeholder="Search staff member... (optional)"
            search
            value={formik.values.assignedOperator}
          />
        )}

        <Input
          label="Custom Notes"
          multiline
          onChange={(value) => setField("customNotes", value)}
          placeholder="Any additional configuration notes or instructions..."
          rows={4}
          value={formik.values.customNotes}
        />
      </form>
    </Modal>
  );
};

export default AddScannerModal;
