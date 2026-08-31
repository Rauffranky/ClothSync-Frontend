import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, Replace } from "lucide-react";
import Modal from "../../../../Components/UI/Modal";
import Button from "../../../../Components/UI/Button";
import Input from "../../../../Components/UI/Input";
import Alert from "../../../../Components/UI/Alert";
import { getApiErrorMessage } from "../../../../axios/api";

const initialValues = {
  hardwareIdentifier: "",
  deviceModel: "",
  platform: "android",
  appVersion: "",
  reason: "",
};

const ScannerHardwareRecoveryModal = ({
  isOpen,
  mode,
  scanner,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset the form whenever a recovery session opens for a scanner.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValues({ ...initialValues, deviceModel: scanner?.deviceModel || "" });
      setError("");
      setShowConfirmation(false);
    }
  }, [isOpen, scanner]);

  const updateValue = (field) => (value) =>
    setValues((current) => ({ ...current, [field]: value }));

  const submit = async () => {
    if (!values.hardwareIdentifier.trim() || !values.reason.trim()) {
      setError("Hardware identifier and reason are required.");
      return;
    }

    try {
      setError("");
      await onSubmit({
        hardwareIdentifier: values.hardwareIdentifier.trim(),
        hardwareIdentifierType: "android_id",
        deviceModel: values.deviceModel.trim() || null,
        platform: values.platform.trim() || "android",
        appVersion: values.appVersion.trim() || null,
        reason: values.reason.trim(),
      });
    } catch (submitError) {
      setError(
        getApiErrorMessage(
          submitError,
          "Unable to recover scanner hardware. Verify the hardware identifier and permissions.",
        ),
      );
    }
  };

  const handleSubmit = () => {
    if (mode === "replace" && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }
    submit();
  };

  return (
    <Modal
      description={
        mode === "replace"
          ? "Replace the physical device while preserving this logical scanner and its historical records."
          : "Reconnect replacement or reset hardware to this existing logical scanner."
      }
      footer={
        <>
          <Button disabled={isSubmitting} onClick={onClose} size="sm" variant="secondary">
            Cancel
          </Button>
          <Button
            disabled={isSubmitting}
            loading={isSubmitting}
            onClick={handleSubmit}
            size="sm"
            variant={mode === "replace" ? "danger" : "primary"}
          >
            {mode === "replace" && !showConfirmation ? "Continue Replacement" : mode === "replace" ? "Confirm Replace Device" : "Reconnect Device"}
          </Button>
        </>
      }
      onClose={onClose}
      open={isOpen}
      title={showConfirmation ? "Confirm Replace Device" : mode === "replace" ? "Replace Scanner Device" : "Reconnect Scanner Device"}
      width={620}
    >
      {showConfirmation ? (
        <Alert leftIcon={<AlertTriangle size={18} />} variant="warning">
          The current physical hardware will no longer be active. The logical
          Scanner ID <strong>{scanner?.id}</strong> and all historical scan
          records will remain preserved. The scanner will require configuration
          and activation before scanning resumes.
        </Alert>
      ) : (
        <div className="space-y-4">
          <Alert leftIcon={mode === "replace" ? <Replace size={18} /> : <RefreshCw size={18} />} variant="info">
            Logical Scanner ID <strong>{scanner?.id}</strong> cannot be edited.
            Only the physical hardware binding is changing.
          </Alert>
          {error ? <Alert leftIcon={<AlertTriangle size={18} />} variant="danger">{error}</Alert> : null}
          <Input label="Hardware Identifier" onChange={updateValue("hardwareIdentifier")} placeholder="Android device identifier" required value={values.hardwareIdentifier} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Device Model" onChange={updateValue("deviceModel")} placeholder="e.g. BX6100" value={values.deviceModel} />
            <Input label="Platform" onChange={updateValue("platform")} placeholder="android" required value={values.platform} />
          </div>
          <Input label="App Version" onChange={updateValue("appVersion")} placeholder="e.g. 1.0.0" value={values.appVersion} />
          <Input label="Reason" multiline onChange={updateValue("reason")} placeholder="Explain why hardware recovery is required" required rows={3} value={values.reason} />
        </div>
      )}
    </Modal>
  );
};

export default ScannerHardwareRecoveryModal;
