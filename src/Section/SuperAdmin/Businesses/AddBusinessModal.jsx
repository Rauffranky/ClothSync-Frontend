import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Building2,
  Mail,
  Plus,
  Send,
  User,
} from "lucide-react";
import Button from "../../../Components/UI/Button";
import Input from "../../../Components/UI/Input";
import Modal from "../../../Components/UI/Modal";
import Dropdown from "../../../Components/UI/Dropdown";
import { getApiErrorMessage } from "../../../axios/api";
import { createAdminTenant } from "../../../axios/adminTenants/adminTenants";
import { getPublicBusinessTypes } from "../../../axios/adminBusinessTypes/adminBusinessTypes";
import { toast } from "../../../Utils/toast";
import { BUSINESS_TYPES } from "./data";

const initialValues = {
  fullName: "",
  email: "",
  businessName: "",
  businessType: "hotel",
};

const validationSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .min(2, "Owner name must be at least 2 characters")
    .required("Owner / Contact name is required"),
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email address is required"),
  businessName: Yup.string().trim(),
  businessType: Yup.string().required("Business type is required"),
});

const AddBusinessModal = ({ open = false, onClose, onSaved }) => {
  const [typeOptions, setTypeOptions] = useState(BUSINESS_TYPES);

  useEffect(() => {
    let isActive = true;
    getPublicBusinessTypes()
      .then((res) => {
        if (!isActive) return;
        const list = res?.data?.data || res?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          const opts = list.map((item) => ({
            label: item.label || item.name,
            value: item.value || item.code,
          }));
          setTypeOptions(opts);
        }
      })
      .catch(() => {});

    return () => {
      isActive = false;
    };
  }, []);
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload = {
          fullName: values.fullName.trim(),
          email: values.email.trim().toLowerCase(),
          businessName: values.businessName.trim() || undefined,
          businessType: values.businessType,
        };

        const response = await createAdminTenant(payload);
        toast.success(
          response?.message || "Business created and verification email sent",
        );
        resetForm();
        onSaved?.();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Unable to register business"));
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
            Create Business
          </Button>
        </>
      }
      onClose={handleClose}
      open={open}
      title="Create New Business"
      width={520}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-(--theme-border) bg-(--theme-surface-hover) p-3.5 text-xs text-(--theme-text-secondary)">
          <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-(--color-aurora-teal)/12 text-(--color-aurora-teal)">
            <Send size={13} />
          </div>
          <p className="m-0 leading-relaxed">
            Enter the owner&apos;s name and email. A verification link will be emailed to them to verify their account, set a password, and complete their organization profile.
          </p>
        </div>

        <Input
          error={formik.touched.fullName && formik.errors.fullName}
          helperText={formik.touched.fullName && formik.errors.fullName}
          label="Owner / Contact Full Name"
          leftIcon={<User size={16} />}
          name="fullName"
          onBlur={formik.handleBlur}
          onChange={(value) => formik.setFieldValue("fullName", value)}
          placeholder="e.g. John Doe"
          required
          value={formik.values.fullName}
        />

        <Input
          error={formik.touched.email && formik.errors.email}
          helperText={formik.touched.email && formik.errors.email}
          label="Email Address"
          leftIcon={<Mail size={16} />}
          name="email"
          onBlur={formik.handleBlur}
          onChange={(value) => formik.setFieldValue("email", value)}
          placeholder="owner@business.com"
          required
          type="email"
          value={formik.values.email}
        />

        <Input
          error={formik.touched.businessName && formik.errors.businessName}
          helperText="Optional. If left blank, the owner's name will be used until profile setup."
          label="Business / Organization Name"
          leftIcon={<Building2 size={16} />}
          name="businessName"
          onBlur={formik.handleBlur}
          onChange={(value) => formik.setFieldValue("businessName", value)}
          placeholder="e.g. Grand Palace Hotel"
          value={formik.values.businessName}
        />

        <Dropdown
          label="Business Type"
          name="businessType"
          onChange={(value) => formik.setFieldValue("businessType", value)}
          options={typeOptions}
          value={formik.values.businessType}
        />
      </form>
    </Modal>
  );
};

export default AddBusinessModal;
