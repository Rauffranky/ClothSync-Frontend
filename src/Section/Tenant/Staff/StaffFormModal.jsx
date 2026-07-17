import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { Info, RefreshCw, TriangleAlert } from "lucide-react";
import * as Yup from "yup";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Dropdown from "../../../Components/UI/Dropdown";
import Input from "../../../Components/UI/Input";
import Modal from "../../../Components/UI/Modal";
import { getApiErrorMessage } from "../../../axios/api";
import {
  createTenantStaff,
  getTenantStaffDetails,
  updateTenantStaff,
} from "../../../axios/staff/tenantStaff";
import { toast } from "../../../Utils/toast";
import { normalizeStaffDetails } from "./data";

const editableStatusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspend", value: "suspend" },
];

const validationSchema = Yup.object({
  fullName: Yup.string().trim().required("Full name is required"),
  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
  phone: Yup.string().trim().required("Phone number is required"),
  staffRoleId: Yup.string().required("Staff role is required"),
  locationName: Yup.string().trim(),
  language: Yup.string().oneOf(["en", "ar"]).required(),
  status: Yup.string().oneOf(["active", "inactive", "suspend"]).required(),
  sendInvite: Yup.boolean(),
});

const StaffFormModal = ({
  createStaff = createTenantStaff,
  getStaffDetails = getTenantStaffDetails,
  includeSendInvite = true,
  mode = "add",
  onClose,
  onSaved,
  open,
  roleOptions = [],
  staff = null,
  updateStaff = updateTenantStaff,
}) => {
  const isEdit = mode === "edit";
  const [isLoadingDetails, setIsLoadingDetails] = useState(isEdit);
  const [detailsError, setDetailsError] = useState("");
  const [detailsRefreshKey, setDetailsRefreshKey] = useState(0);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      staffRoleId: "",
      locationName: "",
      language: "en",
      status: "active",
      sendInvite: false,
    },
    validationSchema,
    onSubmit: async (values, helpers) => {
      const payload = {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        staffRoleId: values.staffRoleId,
        ...(values.locationName.trim()
          ? { locationName: values.locationName.trim() }
          : {}),
        language: values.language,
        status: values.status,
        ...(!isEdit && includeSendInvite
          ? { sendInvite: values.sendInvite }
          : {}),
      };

      try {
        const response = isEdit
          ? await updateStaff(staff?.apiId || staff?.id, payload)
          : await createStaff(payload);
        toast.success(
          response?.message ||
            (isEdit
              ? "Staff member updated successfully"
              : "Staff member created successfully"),
        );
        helpers.resetForm();
        onSaved?.();
      } catch (error) {
        toast.error(
          getApiErrorMessage(
            error,
            isEdit
              ? "Unable to update staff member"
              : "Unable to create staff member",
          ),
        );
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });
  const { setValues } = formik;

  useEffect(() => {
    if (!isEdit) return undefined;

    let isActive = true;

    getStaffDetails(staff?.apiId || staff?.id)
      .then((response) => {
        if (!isActive) return;
        const details = normalizeStaffDetails(response);
        setValues(
          {
            fullName: details.name === "Unnamed Staff" ? "" : details.name,
            email: details.email === "-" ? "" : details.email,
            phone: details.phone === "-" ? "" : details.phone,
            staffRoleId: details.staffRoleId || "",
            locationName: details.location === "-" ? "" : details.location,
            language: details.language || "en",
            status: details.status.toLowerCase() || "active",
            sendInvite: false,
          },
          false,
        );
        setDetailsError("");
      })
      .catch((error) => {
        if (!isActive) return;
        setDetailsError(
          getApiErrorMessage(error, "Unable to load staff member details"),
        );
      })
      .finally(() => {
        if (isActive) setIsLoadingDetails(false);
      });

    return () => {
      isActive = false;
    };
  }, [
    detailsRefreshKey,
    getStaffDetails,
    isEdit,
    setValues,
    staff?.apiId,
    staff?.id,
  ]);

  const handleClose = () => {
    if (!formik.isSubmitting) onClose?.();
  };
  const editableRoleOptions = roleOptions.filter(
    (option) => option.value !== "all",
  );
  const title = isEdit ? "Edit Staff" : "Add Staff";
  const primaryLabel = isEdit
    ? "Save Changes"
    : includeSendInvite && formik.values.sendInvite
      ? "Save & Send Invite"
      : "Save Staff";

  return (
    <Modal
      closeOnBackdrop={!formik.isSubmitting}
      footer={
        <>
          <Button
            disabled={formik.isSubmitting}
            onClick={handleClose}
            rounded="12px"
            size="md"
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            disabled={
              isLoadingDetails ||
              Boolean(detailsError) ||
              editableRoleOptions.length === 0
            }
            form="staff-form"
            loading={formik.isSubmitting}
            rounded="12px"
            size="md"
            type="submit"
          >
            {primaryLabel}
          </Button>
        </>
      }
      onClose={handleClose}
      open={open}
      title={title}
      width={520}
    >
      {isLoadingDetails && (
        <div className="space-y-4 animate-pulse" aria-label="Loading staff details">
          {Array.from({ length: 5 }, (_, index) => (
            <div className="h-12 rounded-xl bg-(--theme-surface-hover)" key={index} />
          ))}
        </div>
      )}

      {!isLoadingDetails && detailsError && (
        <Alert leftIcon={<TriangleAlert size={18} />} variant="danger">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{detailsError}</span>
            <Button
              leftIcon={<RefreshCw size={15} />}
              onClick={() => {
                setIsLoadingDetails(true);
                setDetailsError("");
                setDetailsRefreshKey((current) => current + 1);
              }}
              size="sm"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </Alert>
      )}

      {!isLoadingDetails && !detailsError && (
        <form className="space-y-4" id="staff-form" onSubmit={formik.handleSubmit}>
          <Alert
            leftIcon={<Info size={16} />}
            rounded="rounded-xl"
            size="sm"
            variant="info"
          >
            Staff access is controlled by the selected staff role.
          </Alert>

          <Input
            disabled={formik.isSubmitting}
            error={formik.touched.fullName && Boolean(formik.errors.fullName)}
            helperText={formik.touched.fullName ? formik.errors.fullName : ""}
            label="Full Name"
            name="fullName"
            onBlur={formik.handleBlur}
            onChange={(value) => formik.setFieldValue("fullName", value)}
            placeholder="e.g. Sarah Mitchell"
            required
            value={formik.values.fullName}
          />

          <Input
            disabled={isEdit || formik.isSubmitting}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={
              formik.touched.email && formik.errors.email
                ? formik.errors.email
                : isEdit
                  ? "Email address cannot be changed after staff creation."
                  : ""
            }
            label="Email Address"
            name="email"
            onBlur={formik.handleBlur}
            onChange={(value) => formik.setFieldValue("email", value)}
            placeholder="e.g. sarah@company.com"
            required
            type="email"
            value={formik.values.email}
          />

          <Input
            disabled={formik.isSubmitting}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone ? formik.errors.phone : ""}
            label="Phone Number"
            name="phone"
            onBlur={formik.handleBlur}
            onChange={(value) => formik.setFieldValue("phone", value)}
            placeholder="+1 (555) 000-0000"
            required
            value={formik.values.phone}
          />

          <Dropdown
            disabled={formik.isSubmitting}
            label="Staff Role"
            onChange={(value) => formik.setFieldValue("staffRoleId", value)}
            options={editableRoleOptions}
            placeholder="Select a staff role"
            value={formik.values.staffRoleId || null}
          />
          {formik.touched.staffRoleId && formik.errors.staffRoleId && (
            <p className="m-0 -mt-2 text-sm font-semibold text-red-500">
              {formik.errors.staffRoleId}
            </p>
          )}

          {isEdit && (
            <>
              <Dropdown
                disabled={formik.isSubmitting}
                label="Status"
                onChange={(value) => formik.setFieldValue("status", value)}
                options={editableStatusOptions}
                placeholder="Select staff status"
                value={formik.values.status}
              />
              {formik.touched.status && formik.errors.status && (
                <p className="m-0 -mt-2 text-sm font-semibold text-red-500">
                  {formik.errors.status}
                </p>
              )}
            </>
          )}

          <Input
            disabled={formik.isSubmitting}
            label="Assigned Location / Site"
            name="locationName"
            onBlur={formik.handleBlur}
            onChange={(value) => formik.setFieldValue("locationName", value)}
            placeholder="e.g. Downtown Hub"
            value={formik.values.locationName}
          />

          {!isEdit && includeSendInvite && (
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-(--theme-text-secondary)">
              <input
                checked={formik.values.sendInvite}
                className="h-4 w-4 accent-(--color-aurora-teal)"
                disabled={formik.isSubmitting}
                onChange={(event) =>
                  formik.setFieldValue("sendInvite", event.target.checked)
                }
                type="checkbox"
              />
              Send invite email to staff member
            </label>
          )}
        </form>
      )}
    </Modal>
  );
};

export default StaffFormModal;
