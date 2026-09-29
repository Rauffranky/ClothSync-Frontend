import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  Send,
  TowelRack,
  User,
} from "lucide-react";
import Button from "../../../Components/UI/Button";
import Input from "../../../Components/UI/Input";
import Modal from "../../../Components/UI/Modal";
import { getApiErrorMessage } from "../../../axios/api";
import { createAdminLaundry } from "../../../axios/laundries/adminLaundries";
import { toast } from "../../../Utils/toast";

const initialValues = {
  companyName: "",
  fullName: "",
  email: "",
  phone: "",
  address: "",
  country: "",
  city: "",
  state: "",
  postalCode: "",
};

const validationSchema = Yup.object({
  companyName: Yup.string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .required("Company name is required"),
  fullName: Yup.string()
    .trim()
    .min(2, "Contact person name must be at least 2 characters")
    .required("Contact person full name is required"),
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email address is required"),
  phone: Yup.string()
    .trim()
    .required("Phone number is required"),
  address: Yup.string()
    .trim()
    .required("Address is required"),
  country: Yup.string()
    .trim()
    .required("Country is required"),
  city: Yup.string().trim(),
  state: Yup.string().trim(),
  postalCode: Yup.string().trim(),
});

const AddLaundryModal = ({ open = false, onClose, onSaved }) => {
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload = {
          companyName: values.companyName.trim(),
          fullName: values.fullName.trim(),
          email: values.email.trim().toLowerCase(),
          phone: values.phone.trim(),
          address: values.address.trim(),
          country: values.country.trim(),
          ...(values.city.trim() ? { city: values.city.trim() } : {}),
          ...(values.state.trim() ? { state: values.state.trim() } : {}),
          ...(values.postalCode.trim() ? { postalCode: values.postalCode.trim() } : {}),
        };

        const response = await createAdminLaundry(payload);
        toast.success(
          response?.message || "Laundry partner created successfully",
        );
        resetForm();
        onSaved?.();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Unable to register laundry partner"));
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
            Register Partner
          </Button>
        </>
      }
      onClose={handleClose}
      open={open}
      title="Register Laundry Partner"
      width={600}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-(--theme-border) bg-(--theme-surface-hover) p-3.5 text-xs text-(--theme-text-secondary)">
          <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-(--color-aurora-teal)/12 text-(--color-aurora-teal)">
            <Send size={13} />
          </div>
          <p className="m-0 leading-relaxed">
            Enter the laundry facility details and contact person. The facility will be available for business assignments and automated batch routing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            error={formik.touched.companyName && formik.errors.companyName}
            helperText={formik.touched.companyName && formik.errors.companyName}
            label="Facility / Company Name"
            leftIcon={<TowelRack size={16} />}
            name="companyName"
            onBlur={formik.handleBlur}
            onChange={(value) => formik.setFieldValue("companyName", value)}
            placeholder="e.g. Apex Commercial Laundry"
            required
            value={formik.values.companyName}
          />

          <Input
            error={formik.touched.fullName && formik.errors.fullName}
            helperText={formik.touched.fullName && formik.errors.fullName}
            label="Contact Person Name"
            leftIcon={<User size={16} />}
            name="fullName"
            onBlur={formik.handleBlur}
            onChange={(value) => formik.setFieldValue("fullName", value)}
            placeholder="e.g. Sarah Jenkins"
            required
            value={formik.values.fullName}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            error={formik.touched.email && formik.errors.email}
            helperText={formik.touched.email && formik.errors.email}
            label="Email Address"
            leftIcon={<Mail size={16} />}
            name="email"
            onBlur={formik.handleBlur}
            onChange={(value) => formik.setFieldValue("email", value)}
            placeholder="contact@apexlaundry.com"
            required
            type="email"
            value={formik.values.email}
          />

          <Input
            error={formik.touched.phone && formik.errors.phone}
            helperText={formik.touched.phone && formik.errors.phone}
            label="Phone Number"
            leftIcon={<Phone size={16} />}
            name="phone"
            onBlur={formik.handleBlur}
            onChange={(value) => formik.setFieldValue("phone", value)}
            placeholder="+1 555-0199"
            required
            value={formik.values.phone}
          />
        </div>

        <Input
          error={formik.touched.address && formik.errors.address}
          helperText={formik.touched.address && formik.errors.address}
          label="Street Address"
          leftIcon={<MapPin size={16} />}
          name="address"
          onBlur={formik.handleBlur}
          onChange={(value) => formik.setFieldValue("address", value)}
          placeholder="100 Industrial Parkway, Suite 4"
          required
          value={formik.values.address}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            error={formik.touched.city && formik.errors.city}
            label="City"
            name="city"
            onBlur={formik.handleBlur}
            onChange={(value) => formik.setFieldValue("city", value)}
            placeholder="Dallas"
            value={formik.values.city}
          />

          <Input
            error={formik.touched.state && formik.errors.state}
            label="State / Province"
            name="state"
            onBlur={formik.handleBlur}
            onChange={(value) => formik.setFieldValue("state", value)}
            placeholder="TX"
            value={formik.values.state}
          />

          <Input
            error={formik.touched.postalCode && formik.errors.postalCode}
            label="Postal Code"
            name="postalCode"
            onBlur={formik.handleBlur}
            onChange={(value) => formik.setFieldValue("postalCode", value)}
            placeholder="75001"
            value={formik.values.postalCode}
          />
        </div>

        <Input
          error={formik.touched.country && formik.errors.country}
          helperText={formik.touched.country && formik.errors.country}
          label="Country"
          leftIcon={<Globe size={16} />}
          name="country"
          onBlur={formik.handleBlur}
          onChange={(value) => formik.setFieldValue("country", value)}
          placeholder="United States"
          required
          value={formik.values.country}
        />
      </form>
    </Modal>
  );
};

export default AddLaundryModal;
