import { useFormik } from "formik";
import * as Yup from "yup";
import { Plus, Tag, FileText, Code2 } from "lucide-react";
import Button from "../../../Components/UI/Button";
import Input from "../../../Components/UI/Input";
import Modal from "../../../Components/UI/Modal";
import Dropdown from "../../../Components/UI/Dropdown";
import { getApiErrorMessage } from "../../../axios/api";
import { createAdminBusinessType } from "../../../axios/adminBusinessTypes/adminBusinessTypes";
import { toast } from "../../../Utils/toast";

const initialValues = {
  name: "",
  code: "",
  description: "",
  status: "active",
};

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Type name must be at least 2 characters")
    .max(100, "Type name cannot exceed 100 characters")
    .required("Type name is required"),
  code: Yup.string()
    .trim()
    .matches(/^[a-z0-9_]*$/, "Code can only contain lowercase letters, numbers, and underscores")
    .max(100, "Code cannot exceed 100 characters"),
  description: Yup.string().trim().max(255, "Description cannot exceed 255 characters"),
  status: Yup.string().oneOf(["active", "inactive"]).required("Status is required"),
});

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const AddBusinessTypeModal = ({ open = false, onClose, onSaved }) => {
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload = {
          name: values.name.trim(),
          code: values.code.trim() || undefined,
          description: values.description.trim() || undefined,
          status: values.status,
        };

        const response = await createAdminBusinessType(payload);
        toast.success(
          response?.message || "Business type created successfully",
        );
        resetForm();
        onSaved?.();
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Unable to create business type"),
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClose = () => {
    if (formik.isSubmitting) return;
    formik.resetForm();
    onClose?.();
  };

  if (!open) return null;

  return (
    <Modal
      closeOnBackdrop={!formik.isSubmitting}
      footer={
        <>
          <Button
            disabled={formik.isSubmitting}
            onClick={handleClose}
            rounded="10px"
            size="sm"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            leftIcon={<Plus size={15} />}
            loading={formik.isSubmitting}
            onClick={formik.handleSubmit}
            rounded="10px"
            size="sm"
            type="submit"
          >
            Create Type
          </Button>
        </>
      }
      onClose={handleClose}
      open={open}
      title="Create New Business Type"
      width={520}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <Input
          error={formik.touched.name && formik.errors.name}
          helperText={formik.touched.name && formik.errors.name}
          label="Type Name"
          leftIcon={<Tag size={16} />}
          name="name"
          onBlur={formik.handleBlur}
          onChange={(value) => {
            formik.setFieldValue("name", value);
            if (!formik.touched.code && !formik.values.code) {
              const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "");
              formik.setFieldValue("code", slug);
            }
          }}
          placeholder="e.g. Medical Clinic, Hotel, Gym"
          required
          value={formik.values.name}
        />

        <Input
          error={formik.touched.code && formik.errors.code}
          helperText={
            (formik.touched.code && formik.errors.code) ||
            "Unique internal identifier (lowercase letters, numbers, and underscores)."
          }
          label="Identifier Code"
          leftIcon={<Code2 size={16} />}
          name="code"
          onBlur={formik.handleBlur}
          onChange={(value) => formik.setFieldValue("code", value.toLowerCase())}
          placeholder="e.g. medical_clinic"
          value={formik.values.code}
        />

        <Input
          error={formik.touched.description && formik.errors.description}
          helperText={formik.touched.description && formik.errors.description}
          label="Description"
          leftIcon={<FileText size={16} />}
          name="description"
          onBlur={formik.handleBlur}
          onChange={(value) => formik.setFieldValue("description", value)}
          placeholder="e.g. Outpatient healthcare and specialty clinics"
          value={formik.values.description}
        />

        <Dropdown
          label="Initial Status"
          name="status"
          onChange={(value) => formik.setFieldValue("status", value)}
          options={statusOptions}
          value={formik.values.status}
        />
      </form>
    </Modal>
  );
};

export default AddBusinessTypeModal;
