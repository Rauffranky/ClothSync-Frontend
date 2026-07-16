import { Info, KeyRound, LogOut, MapPin, Monitor } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Alert from "../../../Components/UI/Alert";
import Button from "../../../Components/UI/Button";
import Input from "../../../Components/UI/Input";
import { getApiErrorMessage } from "../../../axios/api";
import { changeTenantPassword } from "../../../axios/auth/tenantAuth";
import { toast } from "../../../Utils/toast";
import { getCurrentDeviceName } from "./data";
import { SettingsPanel } from "./SettingsComponents";

const passwordValidationSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(8, "New password must be at least 8 characters")
    .required("New password is required"),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your new password"),
});

const SecurityTab = () => {
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await changeTenantPassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmNewPassword: values.confirmNewPassword,
        });

        resetForm();
        toast.success(response?.message || "Password changed successfully");
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Unable to change password"));
      }
    },
  });

  const getPasswordError = (field) =>
    passwordFormik.touched[field] ? passwordFormik.errors[field] : "";

  return (
    <>
      <SettingsPanel
        description="Update your Business Admin account password"
        title="Change Password"
      >
        <form
          className="space-y-5 p-5 sm:p-7"
          noValidate
          onSubmit={passwordFormik.handleSubmit}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              error={Boolean(getPasswordError("currentPassword"))}
              helperText={getPasswordError("currentPassword")}
              autoComplete="current-password"
              disabled={passwordFormik.isSubmitting}
              label="Current Password"
              name="currentPassword"
              onBlur={passwordFormik.handleBlur}
              onChange={(nextValue) =>
                passwordFormik.setFieldValue("currentPassword", nextValue)
              }
              placeholder="Enter current password"
              required
              type="password"
              value={passwordFormik.values.currentPassword}
            />
            <Input
              error={Boolean(getPasswordError("newPassword"))}
              helperText={getPasswordError("newPassword")}
              autoComplete="new-password"
              disabled={passwordFormik.isSubmitting}
              label="New Password"
              name="newPassword"
              onBlur={passwordFormik.handleBlur}
              onChange={(nextValue) =>
                passwordFormik.setFieldValue("newPassword", nextValue)
              }
              placeholder="At least 8 characters"
              required
              type="password"
              value={passwordFormik.values.newPassword}
            />
          </div>
          <div className="md:max-w-[calc(50%-0.625rem)]">
            <Input
              error={Boolean(getPasswordError("confirmNewPassword"))}
              helperText={getPasswordError("confirmNewPassword")}
              autoComplete="new-password"
              disabled={passwordFormik.isSubmitting}
              label="Confirm New Password"
              name="confirmNewPassword"
              onBlur={passwordFormik.handleBlur}
              onChange={(nextValue) =>
                passwordFormik.setFieldValue("confirmNewPassword", nextValue)
              }
              placeholder="Repeat new password"
              required
              type="password"
              value={passwordFormik.values.confirmNewPassword}
            />
          </div>
          <Button
            leftIcon={<KeyRound size={17} />}
            loading={passwordFormik.isSubmitting}
            type="submit"
          >
            Update Password
          </Button>
        </form>
      </SettingsPanel>

      <SettingsPanel
        action={
          <Button
            leftIcon={<LogOut size={16} />}
            onClick={() =>
              toast.info("Session management will be enabled when its API is connected")
            }
            size="sm"
            variant="danger"
          >
            Log out all devices
          </Button>
        }
        description="Manage devices currently logged into your account"
        title="Active Sessions"
      >
        <div className="p-5 sm:p-7">
          <div className="flex items-center gap-4 rounded-2xl border border-(--theme-border-soft) bg-(--theme-surface-strong) p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-(--button-ghost-bg-hover) text-(--theme-text-secondary)">
              <Monitor size={20} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="m-0 truncate text-sm font-bold text-(--theme-text-primary)">
                  {getCurrentDeviceName()}
                </h3>
                <span className="rounded-md bg-[rgba(34,197,94,0.14)] px-2 py-1 text-xs font-black text-(--color-fresh-mint)">
                  Current
                </span>
              </div>
              <p className="mb-0 mt-1 flex items-center gap-1.5 text-sm text-(--theme-text-muted)">
                <MapPin size={14} /> Current browser · Active now
              </p>
            </div>
          </div>
          <Alert className="mt-4" leftIcon={<Info size={17} />} variant="neutral">
            Other device sessions will appear here when the session-management API is connected.
          </Alert>
        </div>
      </SettingsPanel>
    </>
  );
};

export default SecurityTab;
